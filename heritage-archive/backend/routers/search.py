"""Cross-modal (text-to-text and text-to-image) search endpoint."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from schemas import CrossModalSearchRequest, CrossModalSearchResponse, SearchResultItem
from services.embedding_service import EmbeddingService
from services.qdrant_service import QdrantService

router = APIRouter(prefix="/api/v1/search", tags=["search"])

# Lazy singletons — the embedding models (bge-m3, CLIP) are large
# downloads (~2GB+) and slow to load. We don't want that happening at
# server startup / import time (which would block ALL endpoints, even
# unrelated ones like /api/archives). They load once, on first actual
# use of this router, and are cached in-process after that.
_embedder: EmbeddingService | None = None
_qdrant: QdrantService | None = None


def get_embedder() -> EmbeddingService:
    global _embedder
    if _embedder is None:
        _embedder = EmbeddingService()
    return _embedder


def get_qdrant() -> QdrantService:
    global _qdrant
    if _qdrant is None:
        _qdrant = QdrantService()
    return _qdrant


@router.post("/cross-modal", response_model=CrossModalSearchResponse)
def cross_modal_search(request: CrossModalSearchRequest) -> CrossModalSearchResponse:
    if not request.query_text and not request.query_image_path:
        raise HTTPException(status_code=400, detail="Provide query_text and/or query_image_path")

    embedder = get_embedder()
    qdrant = get_qdrant()
    results: list[dict] = []

    if request.modality in ("text", "both") and request.query_text:
        text_vector = embedder.embed_query_text(request.query_text)
        results.extend(qdrant.search_text(text_vector, top_k=request.top_k))

    if request.modality in ("image", "both"):
        if request.query_text:
            # text-to-image search: embed the text in CLIP's joint space
            clip_text_vector = embedder.embed_text_to_image_space(request.query_text)
            results.extend(qdrant.search_visual(clip_text_vector, top_k=request.top_k))
        elif request.query_image_path:
            # image-to-image search
            image_vector = embedder.embed_query_image(request.query_image_path)
            results.extend(qdrant.search_visual(image_vector, top_k=request.top_k))

    results.sort(key=lambda r: r["score"], reverse=True)
    return CrossModalSearchResponse(results=[SearchResultItem(**r) for r in results[: request.top_k]])
