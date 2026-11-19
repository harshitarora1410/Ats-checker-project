"""Claude provider (Anthropic API).

Structured output uses a forced tool call: Claude must "call" a tool whose input schema is our
JSON schema, so the reply arrives as a dict instead of free text that has to be parsed.
"""

from __future__ import annotations

import logging
from typing import Any

from ats_ai.config import Settings
from ats_ai.providers.base import LLMError, LLMProvider

logger = logging.getLogger(__name__)


class ClaudeProvider(LLMProvider):
    name = "claude"

    def __init__(self, settings: Settings, client: Any | None = None) -> None:
        """`client` can be injected in tests; otherwise a real Anthropic client is created."""
        self._settings = settings
        if client is not None:
            self._client = client
        else:
            settings.require_api_key()
            try:
                import anthropic
            except ImportError as exc:  # pragma: no cover - depends on environment
                raise LLMError("The 'anthropic' package is not installed. Run: pip install -r requirements.txt") from exc
            self._client = anthropic.Anthropic(
                api_key=settings.anthropic_api_key,
                timeout=settings.llm_timeout_seconds,
                max_retries=settings.llm_max_retries,  # SDK retries 429/5xx/connection errors with backoff
            )

    @property
    def model_name(self) -> str:
        return self._settings.claude_model

    # ------------------------------------------------------------------ calls

    def _create(self, **kwargs: Any) -> Any:
        try:
            return self._client.messages.create(
                model=self.model_name,
                temperature=self._settings.llm_temperature,
                **kwargs,
            )
        except Exception as exc:  # map SDK errors to LLMError
            raise self._to_llm_error(exc) from exc

    def generate_text(self, system: str, user: str, *, max_tokens: int | None = None) -> str:
        response = self._create(
            max_tokens=max_tokens or self._settings.llm_max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        self._check_stop_reason(response)
        text = "".join(getattr(b, "text", "") for b in response.content if getattr(b, "type", "") == "text")
        if not text.strip():
            raise LLMError("Claude returned an empty reply.", retryable=True)
        return text

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
        response = self._create(
            max_tokens=max_tokens or self._settings.llm_max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
            tools=[{"name": schema_name, "description": schema_description, "input_schema": schema}],
            tool_choice={"type": "tool", "name": schema_name},
        )
        self._check_stop_reason(response)
        for block in response.content:
            if getattr(block, "type", "") == "tool_use" and getattr(block, "name", "") == schema_name:
                data = block.input
                if not isinstance(data, dict):
                    raise LLMError("Claude returned a non-object tool input.", retryable=True)
                self._log_usage(response)
                return data
        raise LLMError("Claude did not return the structured result.", retryable=True)

    # ---------------------------------------------------------------- helpers

    @staticmethod
    def _check_stop_reason(response: Any) -> None:
        if getattr(response, "stop_reason", None) == "max_tokens":
            raise LLMError("Claude's reply was cut off (max_tokens reached). Increase LLM_MAX_TOKENS.", retryable=False)

    def _log_usage(self, response: Any) -> None:
        usage = getattr(response, "usage", None)
        if usage is not None:
            logger.debug(
                "claude usage model=%s input_tokens=%s output_tokens=%s",
                self.model_name,
                getattr(usage, "input_tokens", "?"),
                getattr(usage, "output_tokens", "?"),
            )

    @staticmethod
    def _to_llm_error(exc: Exception) -> LLMError:
        """Turn Anthropic SDK exceptions into LLMError with a clear message."""
        name = type(exc).__name__
        status = getattr(exc, "status_code", None)
        if name == "AuthenticationError" or status == 401:
            return LLMError("Claude rejected the API key. Check ANTHROPIC_API_KEY.")
        if name == "PermissionDeniedError" or status == 403:
            return LLMError("This API key has no access to the model. Check CLAUDE_MODEL and your plan.")
        if name == "NotFoundError" or status == 404:
            return LLMError("Model not found. Check CLAUDE_MODEL.")
        if name == "BadRequestError" or status == 400:
            return LLMError(f"Claude rejected the request: {exc}")
        if name == "RateLimitError" or status == 429:
            return LLMError("Claude rate limit reached after retries.", retryable=True)
        if name in ("APIConnectionError", "APITimeoutError"):
            return LLMError(f"Could not reach Claude: {exc}", retryable=True)
        if status is not None and status >= 500:
            return LLMError(f"Claude server error ({status}).", retryable=True)
        return LLMError(f"Claude call failed: {name}: {exc}")
