"""
Archives router — this exists specifically to match what the frontend
(app/page.tsx) already calls:

    GET  /api/archives?category=all|speeches|manuscripts|memorials
    POST /api/search   { query, category }

Both return items shaped as:
    { id: string, title, category, author, description, date }

Note the frontend's TS interface types `id` as `number` — our
archive_items/historical_places use UUID primary keys (strings), so
that interface needs a one-line fix on the frontend side too
(`id: number` -> `id: string`). See PR notes.

This intentionally does NOT go through the Qdrant/embedding stack —
it's a fast, dependency-light Postgres text search so the main landing
page works even if the vector DB / embedding models aren't running.
The AI-powered semantic search lives at /api/v1/search/cross-modal and
/api/v1/rag/chat for when that richer experience is wired in.
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
