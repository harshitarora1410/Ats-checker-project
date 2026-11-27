"""Exceptions raised by ats_ai."""
from __future__ import annotations


class AtsAiError(Exception):
    """Base class for all ats_ai errors."""


class RequestError(AtsAiError):
    """The whole request is rejected and nothing is scored (contract section 1)."""

    def __init__(self, problems: list[str]) -> None:
        super().__init__("; ".join(problems))
        self.problems = problems


class ConfigError(AtsAiError):
    """Settings or the API key are missing or invalid."""


class ResumeFailed(AtsAiError):
    """One resume could not be scored. The message is short and safe to show HR."""