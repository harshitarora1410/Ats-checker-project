"""Central configuration: model, sampling, timeouts, retries, weights, verdict cut-offs."""
from __future__ import annotations

import os
from dataclasses import dataclass, field

DEFAULT_WEIGHTS: dict[str, float] = {
    "skills": 0.35,
    "experience": 0.35,
    "education": 0.15,
    "certifications": 0.15,
}


@dataclass(frozen=True)
class Settings:
    claude_model: str = "claude-sonnet-5-5"

    temperature: float = 0.0  # keep at 0 for consistent scores
    max_output_tokens: int = 2000
    timeout_seconds: float = 60.0
    max_retries: int = 2  # transport-level retries (network / 5xx / rate limit)
    max_validation_retries: int = 1  # re-ask the model if its JSON is invalid

    max_input_chars: int = 30_000  # per document (resume or JD)

    weights: dict[str, float] = field(default_factory=lambda: dict(DEFAULT_WEIGHTS))
    strong_threshold: int = 75  # >= strong fit
    moderate_threshold: int = 50  # >= moderate fit, below is weak fit

    def __post_init__(self) -> None:
        if set(self.weights) != set(DEFAULT_WEIGHTS):
            raise ValueError(f"weights must have exactly these keys: {sorted(DEFAULT_WEIGHTS)}")
        if abs(sum(self.weights.values()) - 1.0) > 1e-6:
            raise ValueError("weights must sum to 1.0")

    @classmethod
    def from_env(cls) -> "Settings":
        """Read the model name from the backend .env (CLAUDE_MODEL), else use the default."""
        return cls(claude_model=os.environ.get("CLAUDE_MODEL", cls.claude_model))