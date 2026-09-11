"""
ingestion_pipeline.py
======================
Digital Heritage Archive (SIH26096) — Document Ingestion, OCR & Vector
Embedding Pipeline.

Pipeline stages:
    1. Image preprocessing (OpenCV): denoise, deskew, CLAHE contrast.
    2. OCR: Tesseract for standard English/Hindi text, TrOCR for
       historical manuscripts (Modi script, archaic Devanagari).
    3. Text chunking: 512 tokens, 64 token overlap.
    4. Embedding generation: BAAI/bge-m3 (text), CLIP ViT-B/32 (images).
    5. Ingestion runner: upserts vectors + metadata into Qdrant
       collections `ambedkar_texts_v1` and `ambedkar_visuals_v1`.

Run standalone:
    python ingestion_pipeline.py --input /path/to/scans --script modi
"""

from __future__ import annotations

import argparse
import logging
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

import cv2
import numpy as np
import pytesseract
import torch
from PIL import Image
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from transformers import (
    CLIPModel,
    CLIPProcessor,
    TrOCRProcessor,
    VisionEncoderDecoderModel,
)
from sentence_transformers import SentenceTransformer

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ingestion_pipeline")

# ---------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------

TEXT_COLLECTION = "ambedkar_texts_v1"
VISUAL_COLLECTION = "ambedkar_visuals_v1"

TEXT_EMBED_MODEL = "BAAI/bge-m3"          # 1024-dim
CLIP_MODEL = "openai/clip-vit-base-patch32"  # 512-dim
TROCR_MODEL = "microsoft/trocr-base-stage1"  # swap for a fine-tuned checkpoint

CHUNK_SIZE_TOKENS = 512
CHUNK_OVERLAP_TOKENS = 64

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

ScriptType = Literal["modi", "devanagari_archaic", "devanagari_modern", "english", "urdu", "other"]


@dataclass
class ItemMetadata:
    """Metadata attached to every vector upserted into Qdrant."""
    archive_item_id: str
    source_volume: str | None = None
    page_number: int | None = None
    year: int | None = None
    asset_path: str = ""
    script: ScriptType = "other"
    extra: dict = field(default_factory=dict)

    def to_payload(self) -> dict:
        payload = {
            "archive_item_id": self.archive_item_id,
            "source_volume": self.source_volume,
            "page_number": self.page_number,
            "year": self.year,
            "asset_path": self.asset_path,
            "script": self.script,
        }
        payload.update(self.extra)
        return payload


# ---------------------------------------------------------------------
# 1. Image preprocessing (OpenCV)
# ---------------------------------------------------------------------

def preprocess_image(image_path: str | Path) -> np.ndarray:
    """
    Denoise, deskew, and contrast-enhance a scanned document image so OCR
    engines get a cleaner input.

    Returns a single-channel (grayscale) numpy array ready for OCR.
    """
    img = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
    if img is None:
        raise FileNotFoundError(f"Could not read image at {image_path}")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Denoise
    denoised = cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)

    # Deskew: estimate skew angle from the minAreaRect of foreground pixels
    deskewed = _deskew(denoised)

    # CLAHE contrast adjustment (helps faded/uneven ink on old manuscripts)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(deskewed)

    return enhanced


def _deskew(gray_img: np.ndarray) -> np.ndarray:
    """Estimate and correct skew angle using the minimum-area bounding box."""
    thresh = cv2.threshold(gray_img, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
    coords = np.column_stack(np.where(thresh > 0))

    if coords.size == 0:
        return gray_img  # blank page — nothing to deskew

    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    (h, w) = gray_img.shape[:2]
    center = (w // 2, h // 2)
    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(
        gray_img, rotation_matrix, (w, h),
        flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE,
    )
    return rotated


# ---------------------------------------------------------------------
# 2. OCR — Tesseract (standard) + TrOCR (historical scripts)
# ---------------------------------------------------------------------

class OCREngine:
    """Wraps both OCR backends behind one interface, chosen by script type."""

    def __init__(self):
        self._trocr_processor: TrOCRProcessor | None = None
        self._trocr_model: VisionEncoderDecoderModel | None = None

    def _load_trocr(self):
        if self._trocr_model is None:
            logger.info("Loading TrOCR model: %s", TROCR_MODEL)
            self._trocr_processor = TrOCRProcessor.from_pretrained(TROCR_MODEL)
            self._trocr_model = VisionEncoderDecoderModel.from_pretrained(TROCR_MODEL).to(DEVICE)

    def run_tesseract(self, image: np.ndarray, lang: str = "eng+hin") -> tuple[str, float]:
        """OCR for standard printed English/Hindi text. Returns (text, mean_confidence)."""
        data = pytesseract.image_to_data(image, lang=lang, output_type=pytesseract.Output.DICT)
        words, confs = [], []
        for word, conf in zip(data["text"], data["conf"]):
            if word.strip() and int(conf) >= 0:
                words.append(word)
                confs.append(int(conf))
        text = " ".join(words)
        mean_conf = sum(confs) / len(confs) if confs else 0.0
        return text, mean_conf

    def run_trocr(self, image: np.ndarray) -> str:
        """OCR for historical manuscripts (Modi script, archaic Devanagari)
        using a (optionally fine-tuned) TrOCR checkpoint."""
        self._load_trocr()
        pil_image = Image.fromarray(image).convert("RGB")
        pixel_values = self._trocr_processor(images=pil_image, return_tensors="pt").pixel_values.to(DEVICE)
        with torch.no_grad():
            generated_ids = self._trocr_model.generate(pixel_values, max_length=512)
        text = self._trocr_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        return text

    def extract_text(self, image: np.ndarray, script: ScriptType) -> tuple[str, float | None]:
        """Route to the right engine based on script type."""
        if script in ("modi", "devanagari_archaic"):
            text = self.run_trocr(image)
            return text, None  # TrOCR doesn't expose a native confidence score
        lang = "hin" if script == "devanagari_modern" else "eng"
        return self.run_tesseract(image, lang=lang)


# ---------------------------------------------------------------------
# 3. Text chunking (512 tokens, 64 token overlap)
# ---------------------------------------------------------------------

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE_TOKENS, overlap: int = CHUNK_OVERLAP_TOKENS) -> list[str]:
    """
    Naive whitespace-token chunker with overlap. Swap the tokenizer for
    the embedding model's own tokenizer if exact token-length matters.
    """
    tokens = text.split()
    if not tokens:
        return []

    chunks = []
    start = 0
    while start < len(tokens):
        end = min(start + chunk_size, len(tokens))
        chunks.append(" ".join(tokens[start:end]))
        if end == len(tokens):
            break
        start = end - overlap
    return chunks


# ---------------------------------------------------------------------
# 4. Embedding generation
# ---------------------------------------------------------------------

class EmbeddingEngine:
    def __init__(self):
        logger.info("Loading text embedding model: %s", TEXT_EMBED_MODEL)
        self.text_model = SentenceTransformer(TEXT_EMBED_MODEL, device=DEVICE)

        logger.info("Loading CLIP model: %s", CLIP_MODEL)
        self.clip_model = CLIPModel.from_pretrained(CLIP_MODEL).to(DEVICE)
        self.clip_processor = CLIPProcessor.from_pretrained(CLIP_MODEL)

    def embed_text(self, texts: list[str]) -> list[list[float]]:
        embeddings = self.text_model.encode(texts, normalize_embeddings=True, convert_to_numpy=True)
        return embeddings.tolist()

    def embed_image(self, image_path: str | Path) -> list[float]:
        image = Image.open(image_path).convert("RGB")
        inputs = self.clip_processor(images=image, return_tensors="pt").to(DEVICE)
        with torch.no_grad():
            features = self.clip_model.get_image_features(**inputs)
        features = features / features.norm(p=2, dim=-1, keepdim=True)
        return features.squeeze(0).cpu().numpy().tolist()


# ---------------------------------------------------------------------
# 5. Ingestion runner
# ---------------------------------------------------------------------

class IngestionRunner:
    def __init__(self, qdrant_url: str = "http://localhost:6333"):
        self.client = QdrantClient(url=qdrant_url)
        self.ocr = OCREngine()
        self.embedder = EmbeddingEngine()
        self._ensure_collections()

    def _ensure_collections(self):
        existing = {c.name for c in self.client.get_collections().collections}

        if TEXT_COLLECTION not in existing:
            logger.info("Creating Qdrant collection: %s", TEXT_COLLECTION)
            self.client.create_collection(
                collection_name=TEXT_COLLECTION,
                vectors_config=qmodels.VectorParams(size=1024, distance=qmodels.Distance.COSINE),
            )

        if VISUAL_COLLECTION not in existing:
            logger.info("Creating Qdrant collection: %s", VISUAL_COLLECTION)
            self.client.create_collection(
                collection_name=VISUAL_COLLECTION,
                vectors_config=qmodels.VectorParams(size=512, distance=qmodels.Distance.COSINE),
            )

    def ingest_document_image(self, image_path: str | Path, metadata: ItemMetadata) -> dict:
        """
        Full pipeline for one scanned page:
        preprocess -> OCR -> chunk -> embed text -> upsert text vectors
        and also embed + upsert the raw image for visual search.
        """
        image_path = Path(image_path)
        logger.info("Processing %s", image_path.name)

        # Stage 1: preprocess
        preprocessed = preprocess_image(image_path)

        # Stage 2: OCR
        raw_text, confidence = self.ocr.extract_text(preprocessed, metadata.script)
        if not raw_text.strip():
            logger.warning("No text extracted from %s — skipping text upsert", image_path.name)

        # Stage 3: chunk
        chunks = chunk_text(raw_text) if raw_text.strip() else []

        # Stage 4: embed + upsert text chunks
        text_point_ids = []
        if chunks:
            vectors = self.embedder.embed_text(chunks)
            points = []
            for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
                point_id = str(uuid.uuid4())
                text_point_ids.append(point_id)
                payload = metadata.to_payload()
                payload.update({"chunk_index": i, "chunk_text": chunk, "ocr_confidence": confidence})
                points.append(qmodels.PointStruct(id=point_id, vector=vector, payload=payload))
            self.client.upsert(collection_name=TEXT_COLLECTION, points=points)
            logger.info("Upserted %d text chunks for %s", len(points), image_path.name)

        # Stage 4b: embed + upsert the visual (CLIP) representation
        visual_vector = self.embedder.embed_image(image_path)
        visual_point_id = str(uuid.uuid4())
        self.client.upsert(
            collection_name=VISUAL_COLLECTION,
            points=[qmodels.PointStruct(id=visual_point_id, vector=visual_vector, payload=metadata.to_payload())],
        )
        logger.info("Upserted visual vector for %s", image_path.name)

        return {
            "archive_item_id": metadata.archive_item_id,
            "raw_text": raw_text,
            "ocr_confidence": confidence,
            "text_point_ids": text_point_ids,
            "visual_point_id": visual_point_id,
        }

    def ingest_directory(self, directory: str | Path, script: ScriptType, source_volume: str | None = None):
        """Batch-ingest every image in a directory."""
        directory = Path(directory)
        image_paths = sorted(
            p for p in directory.iterdir()
            if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".tif", ".tiff"}
        )
        logger.info("Found %d images in %s", len(image_paths), directory)

        results = []
        for i, path in enumerate(image_paths, start=1):
            metadata = ItemMetadata(
                archive_item_id=str(uuid.uuid4()),
                source_volume=source_volume,
                page_number=i,
                asset_path=str(path),
                script=script,
            )
            try:
                results.append(self.ingest_document_image(path, metadata))
            except Exception:
                logger.exception("Failed to ingest %s", path)
        return results


# ---------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Digital Heritage Archive ingestion pipeline")
    parser.add_argument("--input", required=True, help="Directory of scanned page images")
    parser.add_argument(
        "--script", default="english",
        choices=["modi", "devanagari_archaic", "devanagari_modern", "english", "urdu", "other"],
        help="Script type of the source documents (determines OCR engine)",
    )
    parser.add_argument("--volume", default=None, help="Source volume label, e.g. 'Writings and Speeches Vol. 5'")
    parser.add_argument("--qdrant-url", default="http://localhost:6333")
    args = parser.parse_args()

    runner = IngestionRunner(qdrant_url=args.qdrant_url)
    runner.ingest_directory(args.input, script=args.script, source_volume=args.volume)


if __name__ == "__main__":
    main()
