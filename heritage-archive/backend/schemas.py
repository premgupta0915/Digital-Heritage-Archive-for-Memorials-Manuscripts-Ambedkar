"""Pydantic schemas shared across API routers."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class CrossModalSearchRequest(BaseModel):
    query_text: str | None = Field(default=None, description="Text query for semantic/text-to-image search")
    query_image_path: str | None = Field(default=None, description="Path to an uploaded image for image-based search")
    modality: Literal["text", "image", "both"] = "text"
    top_k: int = Field(default=10, ge=1, le=50)


class SearchResultItem(BaseModel):
    archive_item_id: str
    score: float
    source_volume: str | None = None
    page_number: int | None = None
    year: int | None = None
    asset_path: str | None = None
    chunk_text: str | None = None
    collection: str


class CrossModalSearchResponse(BaseModel):
    results: list[SearchResultItem]


class RagChatRequest(BaseModel):
    question: str
    language_code: str = Field(default="en", description="BCP-47-ish code, e.g. 'en', 'hi', 'mr'")
    top_k: int = Field(default=6, ge=1, le=20)
    session_id: str | None = None


class Citation(BaseModel):
    source_volume: str | None = None
    page_number: int | None = None
    archive_item_id: str


class RagChatResponse(BaseModel):
    answer: str
    citations: list[Citation]
    session_id: str | None = None


class PrintSouvenirRequest(BaseModel):
    archive_item_id: str
    session_id: str | None = None
    include_qr: bool = True


class PrintSouvenirResponse(BaseModel):
    summary_text: str
    qr_payload: str
    qr_image_base64: str | None = None
