"""
Translation endpoint for foreign languages (German, Spanish, French,
etc.) that BHASHINI doesn't cover — BHASHINI's translate/TTS/ASR wrapper
(services/bhashini_client.py) stays the path for Indian languages.
"""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from services.translation_service import TranslationService

router = APIRouter(prefix="/api/v1/translate", tags=["translation"])

# Lazy singleton — avoids constructing the Anthropic client at import time.
_translation_service: TranslationService | None = None


def get_translation_service() -> TranslationService:
    global _translation_service
    if _translation_service is None:
        _translation_service = TranslationService()
    return _translation_service


class TranslateRequest(BaseModel):
    text: str
    target_language: str  # e.g. "German", "Spanish", "French", "Japanese"


class TranslateResponse(BaseModel):
    translated_text: str
    target_language: str


@router.post("", response_model=TranslateResponse)
def translate(request: TranslateRequest) -> TranslateResponse:
    translated = get_translation_service().translate(request.text, request.target_language)
    return TranslateResponse(translated_text=translated, target_language=request.target_language)
