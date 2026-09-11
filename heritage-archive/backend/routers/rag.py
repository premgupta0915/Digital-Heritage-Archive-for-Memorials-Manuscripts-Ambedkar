"""RAG chat endpoint — grounded Q&A over the archive with mandatory citations."""

from __future__ import annotations

from fastapi import APIRouter

from schemas import Citation, RagChatRequest, RagChatResponse
from services.rag_engine import RagEngine

router = APIRouter(prefix="/api/v1/rag", tags=["rag"])

rag_engine = RagEngine()


@router.post("/chat", response_model=RagChatResponse)
def rag_chat(request: RagChatRequest) -> RagChatResponse:
    result = rag_engine.answer(request.question, top_k=request.top_k)
    return RagChatResponse(
        answer=result["answer"],
        citations=[Citation(**c) for c in result["citations"]],
        session_id=request.session_id,
    )
