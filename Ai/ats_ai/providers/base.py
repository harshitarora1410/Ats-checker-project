from __future__ import annotations

from abc import ABC, abstractmethod


class ProviderError(Exception):
    """Raised when the LLM call fails (auth, network, empty reply, ...). Never shown to HR."""


class BaseProvider(ABC):
    name: str
    model: str

    @abstractmethod
    def complete(self, system: str, user: str) -> str:
        """Send one system + user prompt, return the raw text reply. Must be thread-safe."""