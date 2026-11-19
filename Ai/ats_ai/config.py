"""Settings for the AI engine, loaded from environment variables.

The Claude API key comes ONLY from GitHub secrets (Codespaces secrets, or Actions secrets in CI), which
GitHub injects as environment variables. Non-secret settings may also come from a local .env.

Usage:
    from ats_ai.config import get_settings
    settings = get_settings()
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

# Ai/ folder (one level above the ats_ai package)
PROJECT_ROOT = Path(__file__).resolve().parent.parent


class ConfigError(ValueError):
    """Raised when a setting is missing or invalid."""


def _get_str(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


def _get_int(name: str, default: int, minimum: int | None = None, maximum: int | None = None) -> int:
    raw = _get_str(name)
    if raw == "":
        value = default
    else:
        try:
            value = int(raw)
        except ValueError as exc:
            raise ConfigError(f"{name} must be a whole number, got {raw!r}") from exc
    if minimum is not None and value < minimum:
        raise ConfigError(f"{name} must be >= {minimum}, got {value}")
    if maximum is not None and value > maximum:
        raise ConfigError(f"{name} must be <= {maximum}, got {value}")
    return value


def _get_float(name: str, default: float, minimum: float | None = None, maximum: float | None = None) -> float:
    raw = _get_str(name)
    if raw == "":
        value = default
    else:
        try:
            value = float(raw)
        except ValueError as exc:
            raise ConfigError(f"{name} must be a number, got {raw!r}") from exc
    if minimum is not None and value < minimum:
        raise ConfigError(f"{name} must be >= {minimum}, got {value}")
    if maximum is not None and value > maximum:
        raise ConfigError(f"{name} must be <= {maximum}, got {value}")
    return value


@dataclass(frozen=True)
class Settings:
    # Claude
    anthropic_api_key: str
    claude_model: str
    # Generation
    llm_temperature: float
    llm_max_tokens: int
    llm_timeout_seconds: int
    llm_max_retries: int
    # Batch
    max_resumes_per_batch: int
    max_parallel_resumes: int
    # Logging
    log_level: str

    def require_api_key(self) -> None:
        """Fail early with a clear message if the Claude key is missing."""
        if not self.anthropic_api_key:
            raise ConfigError(
                "ANTHROPIC_API_KEY is not set. Add it as a GitHub Codespaces secret "
                "(Settings > Codespaces > Secrets) and restart the Codespace."
            )

    @property
    def active_model(self) -> str:
        return self.claude_model

    def masked(self) -> dict:
        """Settings safe to print or log (keys hidden)."""

        def mask(key: str) -> str:
            return f"{key[:7]}...{key[-4:]}" if len(key) > 12 else ("set" if key else "NOT SET")

        return {
            "active_model": self.active_model,
            "anthropic_api_key": mask(self.anthropic_api_key),
            "llm_temperature": self.llm_temperature,
            "llm_max_tokens": self.llm_max_tokens,
            "llm_timeout_seconds": self.llm_timeout_seconds,
            "llm_max_retries": self.llm_max_retries,
            "max_resumes_per_batch": self.max_resumes_per_batch,
            "max_parallel_resumes": self.max_parallel_resumes,
            "log_level": self.log_level,
        }


def load_settings(env_file: str | Path | None = None) -> Settings:
    """Read settings from the environment. A .env file fills in anything not already set."""
    load_dotenv(env_file or PROJECT_ROOT / ".env", override=False)

    log_level = _get_str("LOG_LEVEL", "INFO").upper()
    if log_level not in ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"):
        raise ConfigError(f"LOG_LEVEL is invalid: {log_level!r}")

    return Settings(
        anthropic_api_key=_get_str("ANTHROPIC_API_KEY"),
        claude_model=_get_str("CLAUDE_MODEL", "claude-haiku-5-5"),
        llm_temperature=_get_float("LLM_TEMPERATURE", 0.0, minimum=0.0, maximum=1.0),
        llm_max_tokens=_get_int("LLM_MAX_TOKENS", 4096, minimum=256, maximum=64000),
        llm_timeout_seconds=_get_int("LLM_TIMEOUT_SECONDS", 90, minimum=5),
        llm_max_retries=_get_int("LLM_MAX_RETRIES", 2, minimum=0, maximum=10),
        max_resumes_per_batch=_get_int("MAX_RESUMES_PER_BATCH", 20, minimum=1, maximum=20),
        max_parallel_resumes=_get_int("MAX_PARALLEL_RESUMES", 5, minimum=1, maximum=20),
        log_level=log_level,
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached settings for normal use. Tests should call load_settings() directly."""
    return load_settings()