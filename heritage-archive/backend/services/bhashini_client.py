"""
bhashini_client.py
====================
Thin async wrapper around the Government of India's BHASHINI API for:
  - Speech-to-text (ASR)
  - Text-to-speech (TTS)
  - Indian language translation (NMT)

BHASHINI's public pipeline works in two steps:
  1. `pipeline/config` — given a task list + source/target languages,
     returns the specific service IDs + a callback URL to actually run
     inference on.
  2. `pipeline/compute` — the actual inference call, sent to the
     callback URL from step 1.

Docs: https://bhashini.gitbook.io/bhashini-apis

Requires environment variables:
  BHASHINI_USER_ID
  BHASHINI_ULCA_API_KEY
  BHASHINI_INFERENCE_API_KEY   (obtained from the pipeline/config response)
"""

from __future__ import annotations

import base64
import logging
import os

import httpx

logger = logging.getLogger("bhashini_client")

CONFIG_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline"
DEFAULT_TIMEOUT = 30.0


class BhashiniClient:
    def __init__(self):
        self.user_id = os.environ.get("BHASHINI_USER_ID")
        self.ulca_api_key = os.environ.get("BHASHINI_ULCA_API_KEY")
        self._headers = {
            "userID": self.user_id or "",
            "ulcaApiKey": self.ulca_api_key or "",
            "Content-Type": "application/json",
        }

    async def _get_pipeline_config(self, task: str, source_lang: str, target_lang: str | None = None) -> dict:
        task_config = {"taskType": task, "config": {"language": {"sourceLanguage": source_lang}}}
        if target_lang:
            task_config["config"]["language"]["targetLanguage"] = target_lang

        payload = {
            "pipelineTasks": [task_config],
            "pipelineRequestConfig": {"pipelineId": "64392f96daac500b55c543cd"},
        }

        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            resp = await client.post(CONFIG_URL, json=payload, headers=self._headers)
            resp.raise_for_status()
            return resp.json()

    async def speech_to_text(self, audio_base64: str, source_lang: str = "hi") -> str:
        """Transcribe base64-encoded audio (WAV) into text."""
        config = await self._get_pipeline_config("asr", source_lang)
        callback_url = config["pipelineInferenceAPIEndPoint"]["callbackUrl"]
        inference_key = config["pipelineInferenceAPIEndPoint"]["inferenceApiKey"]["value"]
        service_id = config["pipelineResponseConfig"][0]["config"][0]["serviceId"]

        payload = {
            "pipelineTasks": [{"taskType": "asr", "config": {"language": {"sourceLanguage": source_lang}, "serviceId": service_id}}],
            "inputData": {"audio": [{"audioContent": audio_base64}]},
        }
        headers = {"Authorization": inference_key, "Content-Type": "application/json"}

        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            resp = await client.post(callback_url, json=payload, headers=headers)
            resp.raise_for_status()
            result = resp.json()
        return result["pipelineResponse"][0]["output"][0]["source"]

    async def text_to_speech(self, text: str, target_lang: str = "hi") -> bytes:
        """Synthesize speech for `text`. Returns raw audio bytes (WAV)."""
        config = await self._get_pipeline_config("tts", target_lang)
        callback_url = config["pipelineInferenceAPIEndPoint"]["callbackUrl"]
        inference_key = config["pipelineInferenceAPIEndPoint"]["inferenceApiKey"]["value"]
        service_id = config["pipelineResponseConfig"][0]["config"][0]["serviceId"]

        payload = {
            "pipelineTasks": [{"taskType": "tts", "config": {"language": {"sourceLanguage": target_lang}, "serviceId": service_id}}],
            "inputData": {"input": [{"source": text}]},
        }
        headers = {"Authorization": inference_key, "Content-Type": "application/json"}

        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            resp = await client.post(callback_url, json=payload, headers=headers)
            resp.raise_for_status()
            result = resp.json()
        audio_b64 = result["pipelineResponse"][0]["audio"][0]["audioContent"]
        return base64.b64decode(audio_b64)

    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate `text` from source_lang to target_lang."""
        config = await self._get_pipeline_config("translation", source_lang, target_lang)
        callback_url = config["pipelineInferenceAPIEndPoint"]["callbackUrl"]
        inference_key = config["pipelineInferenceAPIEndPoint"]["inferenceApiKey"]["value"]
        service_id = config["pipelineResponseConfig"][0]["config"][0]["serviceId"]

        payload = {
            "pipelineTasks": [{
                "taskType": "translation",
                "config": {"language": {"sourceLanguage": source_lang, "targetLanguage": target_lang}, "serviceId": service_id},
            }],
            "inputData": {"input": [{"source": text}]},
        }
        headers = {"Authorization": inference_key, "Content-Type": "application/json"}

        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            resp = await client.post(callback_url, json=payload, headers=headers)
            resp.raise_for_status()
            result = resp.json()
        return result["pipelineResponse"][0]["output"][0]["target"]
