"""
main.py
========
FastAPI backend for the Digital Heritage Archive (SIH26096).

Endpoints:
    POST /api/v1/search/cross-modal   — semantic + text-to-image search
    POST /api/v1/rag/chat             — grounded RAG chat with citations
    POST /api/v1/kiosk/print-souvenir — souvenir summary + QR payload
    GET  /api/media                   — audio/video documentaries, lectures, interviews
    POST /api/media/upload            — upload a new audio/video file
    POST /api/v1/translate            — translate text into any language (foreign-language kiosk support)

Run:
    uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import archives, kiosk, media, rag, search, translate

app = FastAPI(
    title="Digital Heritage Archive API",
    description="AI-powered backend for the Ambedkar Digital Heritage Archive (SIH26096)",
    version="0.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten before production deployment
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(archives.router)
app.include_router(search.router)
app.include_router(rag.router)
app.include_router(kiosk.router)
app.include_router(media.router)
app.include_router(translate.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
