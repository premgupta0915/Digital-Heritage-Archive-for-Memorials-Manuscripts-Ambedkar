"""
Archives router — matches the frontend's contract:

    GET  /api/archives?category=all|speeches|manuscripts|memorials
    POST /api/search   { query, category }

Both return items shaped as:
    { id: string, title, category, author, description, date }

This is a fast, dependency-light Postgres text search — it deliberately
does NOT go through the Qdrant/embedding stack, so the main page works
even if the vector DB / embedding models aren't running. The AI-powered
semantic search lives separately at /api/v1/search/cross-modal and
/api/v1/rag/chat.
"""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from services.db_service import list_archive_items

router = APIRouter(tags=["archives"])


class SimpleSearchRequest(BaseModel):
    query: str
    category: str = "all"


@router.get("/api/archives")
def get_archives(category: str = "all"):
    return list_archive_items(category=category)


@router.post("/api/search")
def search_archives(request: SimpleSearchRequest):
    results = list_archive_items(category=request.category, search=request.query)
    return {"results": results}
