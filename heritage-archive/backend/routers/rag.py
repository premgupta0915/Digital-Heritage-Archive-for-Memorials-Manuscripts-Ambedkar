"""RAG chat endpoint — grounded Q&A over the archive with mandatory citations."""

from __future__ import annotations

from fastapi import APIRouter

from schemas import Citation, RagChatRequest, RagChatResponse
from services.rag_engine import RagEngine

router = APIRouter(prefix="/api/v1/rag", tags=["rag"])

# Lazy singleton — RagEngine loads the embedding models on construction,
# which is slow on first run. Load it on first actual chat request, not
# at server startup, so /health and /api/archives aren't blocked by it.
_rag_engine: RagEngine | None = None


def get_rag_engine() -> RagEngine:
    global _rag_engine
    if _rag_engine is None:
        _rag_engine = RagEngine()
    return _rag_engine


@router.post("/chat", response_model=RagChatResponse)
def rag_chat(request: RagChatRequest) -> RagChatResponse:
    result = get_rag_engine().answer(request.question, top_k=request.top_k)
    return RagChatResponse(
        answer=result["answer"],
        citations=[Citation(**c) for c in result["citations"]],
        session_id=request.session_id,
    )
