"""Gemini provider - planned. Same interface as ClaudeProvider so switching LLM_PROVIDER needs no other change."""

from __future__ import annotations

from ats_ai.config import Settings
from ats_ai.providers.base import LLMProvider


class GeminiProvider(LLMProvider):  # pragma: no cover - not implemented yet
    name = "gemini"

    def __init__(self, settings: Settings) -> None:
        raise NotImplementedError("Gemini provider is not built yet. Set LLM_PROVIDER=claude.")
