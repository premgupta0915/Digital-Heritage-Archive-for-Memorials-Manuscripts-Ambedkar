"""
rag_engine.py
==============
Retrieval-Augmented Generation for the archive's chat assistant.

Retrieves grounding passages from Qdrant (ambedkar_texts_v1), builds a
strictly-grounded prompt, and calls an LLM to answer — with every
answer required to cite (Volume #, Page #) from the retrieved
passages. If the retrieved context doesn't support an answer, the
model is instructed to say so rather than speculate.

Uses the Anthropic Messages API. Swap `_call_llm` for a different
provider if needed.
"""

from __future__ import annotations

import logging
import os

from anthropic import Anthropic

from services.embedding_service import EmbeddingService
from services.qdrant_service import QdrantService

logger = logging.getLogger("rag_engine")

SYSTEM_PROMPT = """You are the research assistant for the Digital Heritage Archive on Dr. B.R. \
Ambedkar's writings, speeches, and constitutional debates.

Rules:
1. Answer ONLY using the numbered source passages provided below. Do not use outside knowledge.
2. Every factual claim MUST be followed by a citation in the form (Volume: <source_volume>, Page: <page_number>) \
using the exact metadata from the passage it came from.
3. If the provided passages do not contain enough information to answer, say so plainly instead of guessing.
4. Keep answers concise and grounded — no speculation about intent or history beyond what the sources state.
"""


class RagEngine:
    def __init__(self, qdrant_url: str = "http://localhost:6333"):
        self.embedder = EmbeddingService()
        self.qdrant = QdrantService(url=qdrant_url)
        self.llm = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    def _build_context_block(self, passages: list[dict]) -> str:
        lines = []
        for i, p in enumerate(passages, start=1):
            lines.append(
                f"[Source {i}] Volume: {p.get('source_volume') or 'Unknown'}, "
                f"Page: {p.get('page_number') or 'Unknown'}\n{p.get('chunk_text') or ''}"
            )
        return "\n\n".join(lines)

    def answer(self, question: str, top_k: int = 6) -> dict:
        query_vector = self.embedder.embed_query_text(question)
        passages = self.qdrant.search_text(query_vector, top_k=top_k)

        if not passages:
            return {
                "answer": "I couldn't find any relevant material in the archive to answer that question.",
                "citations": [],
            }

        context_block = self._build_context_block(passages)
        user_message = (
            f"Source passages:\n\n{context_block}\n\n"
            f"Question: {question}\n\n"
            "Answer using only the sources above, citing (Volume, Page) for every claim."
        )

        response_text = self._call_llm(user_message)

        citations = [
            {
                "archive_item_id": p["archive_item_id"],
                "source_volume": p.get("source_volume"),
                "page_number": p.get("page_number"),
            }
            for p in passages
        ]

        return {"answer": response_text, "citations": citations}

    def _call_llm(self, user_message: str) -> str:
        response = self.llm.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )
        return "".join(block.text for block in response.content if block.type == "text")
