from __future__ import annotations

from ..config import Settings
from .base import BaseProvider, ProviderError
from .claude_provider import ClaudeProvider


def get_provider(settings: Settings) -> BaseProvider:
    """Claude is the only provider in this project."""
    return ClaudeProvider(settings)


__all__ = ["BaseProvider", "ClaudeProvider", "ProviderError", "get_provider"]