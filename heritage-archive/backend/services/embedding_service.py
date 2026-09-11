"""
embedding_service.py
=====================
Query-time embedding generation. Mirrors the models used at ingestion
time (ingestion_pipeline.py) so query vectors land in the same space
as the stored vectors.
"""

from __future__ import annotations

import logging
from pathlib import Path

import torch
from PIL import Image
from sentence_transformers import SentenceTransformer
from transformers import CLIPModel, CLIPProcessor

logger = logging.getLogger("embedding_service")

TEXT_EMBED_MODEL = "BAAI/bge-m3"
CLIP_MODEL = "openai/clip-vit-base-patch32"

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


class EmbeddingService:
    """Singleton-style loader — instantiate once at app startup and reuse."""

    def __init__(self):
        logger.info("Loading text embedding model: %s", TEXT_EMBED_MODEL)
        self.text_model = SentenceTransformer(TEXT_EMBED_MODEL, device=DEVICE)

        logger.info("Loading CLIP model: %s", CLIP_MODEL)
        self.clip_model = CLIPModel.from_pretrained(CLIP_MODEL).to(DEVICE)
        self.clip_processor = CLIPProcessor.from_pretrained(CLIP_MODEL)

    def embed_query_text(self, text: str) -> list[float]:
        embedding = self.text_model.encode([text], normalize_embeddings=True, convert_to_numpy=True)
        return embedding[0].tolist()

    def embed_query_image(self, image_path: str | Path) -> list[float]:
        image = Image.open(image_path).convert("RGB")
        inputs = self.clip_processor(images=image, return_tensors="pt").to(DEVICE)
        with torch.no_grad():
            features = self.clip_model.get_image_features(**inputs)
        features = features / features.norm(p=2, dim=-1, keepdim=True)
        return features.squeeze(0).cpu().numpy().tolist()

    def embed_text_to_image_space(self, text: str) -> list[float]:
        """Embed text using CLIP's text tower, for text-to-image search."""
        inputs = self.clip_processor(text=[text], return_tensors="pt", padding=True).to(DEVICE)
        with torch.no_grad():
            features = self.clip_model.get_text_features(**inputs)
        features = features / features.norm(p=2, dim=-1, keepdim=True)
        return features.squeeze(0).cpu().numpy().tolist()
