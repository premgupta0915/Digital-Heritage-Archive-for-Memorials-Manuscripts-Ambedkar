"""
qdrant_service.py
===================
Thin wrapper around the Qdrant client for the two collections used by
the archive: ambedkar_texts_v1 (semantic text search) and
ambedkar_visuals_v1 (text-to-image / image-to-image search via CLIP).
"""

from __future__ import annotations

import logging

from qdrant_client import QdrantClient

logger = logging.getLogger("qdrant_service")

TEXT_COLLECTION = "ambedkar_texts_v1"
VISUAL_COLLECTION = "ambedkar_visuals_v1"


class QdrantService:
    def __init__(self, url: str = "http://localhost:6333"):
        self.client = QdrantClient(url=url)

    def search_text(self, vector: list[float], top_k: int = 10) -> list[dict]:
        hits = self.client.search(collection_name=TEXT_COLLECTION, query_vector=vector, limit=top_k)
        return [self._hit_to_dict(h, TEXT_COLLECTION) for h in hits]

    def search_visual(self, vector: list[float], top_k: int = 10) -> list[dict]:
        hits = self.client.search(collection_name=VISUAL_COLLECTION, query_vector=vector, limit=top_k)
        return [self._hit_to_dict(h, VISUAL_COLLECTION) for h in hits]

    @staticmethod
    def _hit_to_dict(hit, collection: str) -> dict:
        payload = hit.payload or {}
        return {
            "archive_item_id": payload.get("archive_item_id"),
            "score": hit.score,
            "source_volume": payload.get("source_volume"),
            "page_number": payload.get("page_number"),
            "year": payload.get("year"),
            "asset_path": payload.get("asset_path"),
            "chunk_text": payload.get("chunk_text"),
            "collection": collection,
        }
