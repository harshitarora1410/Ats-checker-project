"""Settings. Every value can be changed through environment variables (.env)."""
from __future__ import annotations

import os
from dataclasses import dataclass, field

from .errors import ConfigError

CONTRACT_VERSION = "1.0"
SECTIONS = ("skills", "experience", "education", "certifications")
DEFAULT_WEIGHTS: dict[str, int] = {"skills": 35, "experience": 35, "education": 15, "certifications": 15}


def _load_dotenv() -> None:
    try:
        from dotenv import load_dotenv
    except ImportError:  # python-dotenv is optional
        return
    load_dotenv()


def _env(name: str, default: str) -> str:
    raw = os.environ.get(name)
    return default if raw is None or not raw.strip() else raw.strip()


def _env_number(name: str, default, cast):
    raw = _env(name, "")
    if not raw:
        return default
    try:
        return cast(raw)
    except ValueError:
        raise ConfigError(f"{name} must be a number, got {raw!r}") from None


@dataclass(frozen=True)
class Settings:
    claude_model: str = "claude-haiku-5-5"

    temperature: float = 0.0  # 0 = most consistent scores across repeated runs
    max_output_tokens: int = 4096
    timeout_seconds: float = 90.0
    max_retries: int = 2  # per resume: network retries inside the SDK AND re-asks after invalid JSON

    max_resumes_per_batch: int = 20
    max_parallel_resumes: int = 5
    max_input_chars: int = 30_000  # per document (resume or JD); longer text is cut

    weights: dict[str, int] = field(default_factory=lambda: dict(DEFAULT_WEIGHTS))
    strong_threshold: float = 75.0  # overall >= 75 -> strong
    moderate_threshold: float = 50.0  # overall >= 50 -> moderate, below -> weak
    log_level: str = "INFO"

    def __post_init__(self) -> None:
        if set(self.weights) != set(SECTIONS) or sum(self.weights.values()) != 100:
            raise ConfigError(f"weights need the keys {list(SECTIONS)} and must add up to 100")
        if self.max_parallel_resumes < 1 or self.max_resumes_per_batch < 1 or self.max_retries < 0:
            raise ConfigError("MAX_PARALLEL_RESUMES, MAX_RESUMES_PER_BATCH must be >= 1 and LLM_MAX_RETRIES >= 0")

    @classmethod
    def from_env(cls) -> "Settings":
        _load_dotenv()
        return cls(
            claude_model=_env("CLAUDE_MODEL", cls.claude_model),
            temperature=_env_number("LLM_TEMPERATURE", cls.temperature, float),
            max_output_tokens=_env_number("LLM_MAX_TOKENS", cls.max_output_tokens, int),
            timeout_seconds=_env_number("LLM_TIMEOUT_SECONDS", cls.timeout_seconds, float),
            max_retries=_env_number("LLM_MAX_RETRIES", cls.max_retries, int),
            max_resumes_per_batch=_env_number("MAX_RESUMES_PER_BATCH", cls.max_resumes_per_batch, int),
            max_parallel_resumes=_env_number("MAX_PARALLEL_RESUMES", cls.max_parallel_resumes, int),
            log_level=_env("LOG_LEVEL", cls.log_level).upper(),
        )