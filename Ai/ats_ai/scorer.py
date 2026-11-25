"""analyze(request) -> response: the one function the backend calls (contracts/README.md)."""
from __future__ import annotations

import logging
from concurrent.futures import ThreadPoolExecutor

from pydantic import ValidationError

from .config import CONTRACT_VERSION, SECTIONS, Settings
from .errors import ConfigError, ResumeFailed
from .prompts import SYSTEM_PROMPT, build_retry_suffix, build_user_prompt
from .providers import BaseProvider, ProviderError, get_provider
from .report import build_report_text
from .schemas import (
    AnalyzeResponse,
    Details,
    LLMResult,
    ResultOut,
    SectionDetail,
    SectionScores,
    validate_request,
)
from .scoring import NOT_REQUIRED_SCORE, overall_score, rank_results, verdict_for
from .utils import extract_json

log = logging.getLogger("ats_ai")  # never log resume text: it contains personal data

MSG_EMPTY = "Resume text is empty"
MSG_VALIDATION = "AI response failed validation after retries"
MSG_PROVIDER = "AI service error, please try again"
MSG_UNEXPECTED = "Unexpected error while scoring this resume"


def _truncate(text: str, limit: int) -> str:
    return text if len(text) <= limit else text[:limit] + "\n[...truncated...]"


def _call_model(provider: BaseProvider, jd: str, resume_text: str, settings: Settings) -> LLMResult:
    """One resume: ask Claude, validate, and re-ask up to max_retries times if the JSON is invalid."""
    base_prompt = build_user_prompt(resume_text, jd)
    last_error: str | None = None
    for attempt in range(1 + settings.max_retries):
        prompt = base_prompt if last_error is None else base_prompt + build_retry_suffix(last_error)
        try:
            raw = provider.complete(SYSTEM_PROMPT, prompt)
        except ProviderError as e:
            log.warning("provider error: %s", e)
            raise ResumeFailed(MSG_PROVIDER) from e
        try:
            return LLMResult.model_validate(extract_json(raw))
        except (ValueError, ValidationError) as e:
            last_error = str(e)
            log.warning("model output invalid (attempt %d of %d)", attempt + 1, 1 + settings.max_retries)
            log.debug("validation detail: %s", last_error[:300])
    raise ResumeFailed(MSG_VALIDATION)


def _failed(resume_id: str, message: str) -> ResultOut:
    return ResultOut(resume_id=resume_id, status="failed", error_message=message)


def _build_done(resume_id: str, llm: LLMResult, weights: dict[str, int], settings: Settings) -> ResultOut:
    scores: dict[str, float] = {}
    details: dict[str, dict] = {}
    for name in SECTIONS:
        sec = getattr(llm, name)
        if sec.applicable:
            scores[name] = round(sec.score, 2)
            reasoning = sec.reasoning
        else:
            scores[name] = NOT_REQUIRED_SCORE
            reasoning = sec.reasoning or "Not required by the job description."
        details[name] = {"matched": sec.matched, "missing": sec.missing, "reasoning": reasoning}

    overall = overall_score(scores, weights)
    verdict = verdict_for(overall, settings)
    return ResultOut(
        resume_id=resume_id,
        status="done",
        candidate_name=llm.candidate_name,
        overall_score=overall,
        verdict=verdict,
        summary=llm.summary,
        section_scores=SectionScores(**scores),
        details=Details(**{n: SectionDetail(**details[n]) for n in SECTIONS}, recommendations=llm.recommendations),
        report_text=build_report_text(llm.candidate_name, overall, verdict, scores, details, llm.recommendations),
    )


def analyze(
    request: dict,
    *,
    provider: BaseProvider | None = None,
    settings: Settings | None = None,
) -> dict:
    """Score 1-20 resumes against one JD.

    Raises RequestError if the whole request is invalid (nothing is scored) and ConfigError if the
    API key is missing. Any problem with a single resume is reported on that resume (status "failed").
    """
    settings = settings or Settings.from_env()
    req = validate_request(request, settings)
    weights = dict(req.section_weights or settings.weights)
    jd = _truncate(req.jd_text.strip(), settings.max_input_chars)

    # 1) empty resumes fail right away, everything else is queued for Claude
    outcomes: list[ResultOut | None] = [None] * len(req.resumes)
    queued: list[tuple[int, str]] = []
    for i, r in enumerate(req.resumes):
        text = r.resume_text.strip()
        if text:
            queued.append((i, _truncate(text, settings.max_input_chars)))
        else:
            outcomes[i] = _failed(r.resume_id, MSG_EMPTY)

    # 2) score the queued resumes in parallel; one failure never stops the others
    if queued:
        if provider is None:
            try:
                provider = get_provider(settings)
            except ProviderError as e:
                raise ConfigError(str(e)) from e

        def work(item: tuple[int, str]) -> tuple[int, ResultOut]:
            i, text = item
            resume_id = req.resumes[i].resume_id
            try:
                return i, _build_done(resume_id, _call_model(provider, jd, text, settings), weights, settings)
            except ResumeFailed as e:
                return i, _failed(resume_id, str(e))
            except Exception:  # noqa: BLE001 - a bug in one resume must not break the batch
                log.exception("unexpected error while scoring resume %s", resume_id)
                return i, _failed(resume_id, MSG_UNEXPECTED)

        with ThreadPoolExecutor(max_workers=min(settings.max_parallel_resumes, len(queued))) as pool:
            for i, result in pool.map(work, queued):
                outcomes[i] = result

    # 3) rank the successful ones, failed ones go last (input order)
    done = rank_results([o for o in outcomes if o is not None and o.status == "done"])
    failed = [o for o in outcomes if o is not None and o.status == "failed"]
    results = done + failed

    if not failed:
        status = "done"
    elif not done:
        status = "failed"
    else:
        status = "partially_failed"

    response = AnalyzeResponse(
        contract_version=CONTRACT_VERSION,
        job_id=req.job_id,
        status=status,
        model_used=provider.model if provider else settings.claude_model,
        section_weights=weights,
        total_resumes=len(results),
        succeeded=len(done),
        failed=len(failed),
        results=results,
    )
    return response.model_dump(mode="json")