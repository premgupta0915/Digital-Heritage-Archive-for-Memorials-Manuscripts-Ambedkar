"""
translation_service.py
========================
General-purpose translation for languages outside BHASHINI's scope
(BHASHINI covers Indian languages; this covers everything else — German,
Spanish, French, Japanese, etc. — using Claude, which handles dozens of
languages well and can be asked for a literal, faithful translation
suited to museum/kiosk display).
"""

from __future__ import annotations

import os

from anthropic import Anthropic

SYSTEM_PROMPT = """You are a precise translator for a museum heritage archive. \
Translate the given text faithfully into the requested target language. \
Preserve tone and historical register. Output ONLY the translated text — \
no notes, no quotation marks, no explanation."""


class TranslationService:
    def __init__(self):
        self.client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    def translate(self, text: str, target_language: str) -> str:
        response = self.client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": f"Translate the following into {target_language}:\n\n{text}",
            }],
        )
        return "".join(block.text for block in response.content if block.type == "text").strip()
