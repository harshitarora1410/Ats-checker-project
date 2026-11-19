"""Claude provider."""

from __future__ import annotations

from ats_ai.config import Settings, get_settings
from ats_ai.providers.base import LLMError, LLMProvider

__all__ = ["LLMError", "LLMProvider", "get_provider"]


def get_provider(settings: Settings | None = None) -> LLMProvider:
    from ats_ai.providers.claude_provider import ClaudeProvider

    return ClaudeProvider(settings or get_settings())