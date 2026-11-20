"""Provider interface. ClaudeProvider implements it; tests use a fake. Keeps the agent independent
of the SDK details."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class LLMError(RuntimeError):
    """Any failure talking to an LLM provider (network, auth, rate limit, bad response).

    `retryable` tells the caller whether trying again might help.
    """

    def __init__(self, message: str, *, retryable: bool = False) -> None:
        super().__init__(message)
        self.retryable = retryable


class LLMProvider(ABC):
    """Common interface for all LLM providers."""

    name: str = "base"

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Model id used for requests (saved as `model_used` in the output)."""

    @abstractmethod
    def generate_text(self, system: str, user: str, *, max_tokens: int | None = None) -> str:
        """Return a plain-text reply."""

    @abstractmethod
    def generate_json(
        self,
        system: str,
        user: str,
        *,
        schema: dict[str, Any],
        schema_name: str = "submit_result",
        schema_description: str = "Return the result in the required structure.",
        max_tokens: int | None = None,
    ) -> dict[str, Any]:
        """Return a dict that follows the given JSON schema."""

    def health_check(self) -> bool:
        """Cheap call to confirm the key and model work."""
        reply = self.generate_text("Reply with the single word OK.", "Health check.", max_tokens=16)
        return "ok" in reply.lower()