from __future__ import annotations

import os

from ..config import Settings
from .base import BaseProvider, ProviderError


class ClaudeProvider(BaseProvider):
    name = "claude"

    def __init__(self, settings: Settings, api_key: str | None = None) -> None:
        try:
            import anthropic
        except ImportError as e:
            raise ProviderError("the 'anthropic' package is not installed") from e

        key = api_key or os.environ.get("ANTHROPIC_API_KEY", "").strip()
        if not key:
            raise ProviderError("ANTHROPIC_API_KEY is not set")

        self._anthropic = anthropic
        self._client = anthropic.Anthropic(
            api_key=key,
            timeout=settings.timeout_seconds,
            max_retries=settings.max_retries,  # network errors, 429 and 5xx are retried by the SDK
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
            # type + status only: never put request details or keys into messages
            raise ProviderError(f"{type(e).__name__} (status {getattr(e, 'status_code', 'n/a')})") from e

        text = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")
        if not text.strip():
            raise ProviderError("empty response from Claude")
        return text