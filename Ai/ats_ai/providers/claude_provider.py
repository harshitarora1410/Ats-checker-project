from __future__ import annotations

import os

from ..config import Settings
from .base import BaseProvider, ProviderError


class ClaudeProvider(BaseProvider):
    name = "claude"

    def __init__(self, settings: Settings, api_key: str | None = None) -> None:
        import anthropic

        key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not key:
            raise ProviderError("ANTHROPIC_API_KEY is not set")

        self._anthropic = anthropic
        self._client = anthropic.Anthropic(
            api_key=key,
            timeout=settings.timeout_seconds,
            max_retries=settings.max_retries,
        )
        self._settings = settings
        self.model = settings.claude_model

    def complete(self, system: str, user: str) -> str:
        try:
            resp = self._client.messages.create(
                model=self.model,
                max_tokens=self._settings.max_output_tokens,
                temperature=self._settings.temperature,
                system=system,
                messages=[{"role": "user", "content": user}],
            )
        except self._anthropic.APIError as e:
            raise ProviderError(f"Claude API error: {e}") from e

        text = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")
        if not text.strip():
            raise ProviderError("Claude returned an empty response")
        return text