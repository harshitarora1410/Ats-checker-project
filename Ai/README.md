# Ai - ATS scoring engine (`ats_ai`)

The backend installs this package (`pip install -e ../Ai`) and calls it. JSON in, JSON out, one call per analysis job.
The exact format is in [`contracts/`](contracts/README.md). Claude is the only LLM provider.

| Way to call | Input | Output |
| --- | --- | --- |
| Python: `ats_ai.analyze(request)` | dict like `contracts/input.example.json` | dict like `contracts/output.example.json` |
| CLI: `python -m ats_ai input.json -o output.json` | JSON file | JSON file |

```python
from ats_ai import analyze, RequestError, ConfigError

try:
    response = analyze(request)          # request: dict, response: dict
except RequestError as e:                # whole request invalid, nothing scored -> e.problems
    ...
except ConfigError as e:                 # e.g. ANTHROPIC_API_KEY missing
    ...
```

The backend does file text extraction, storage, auth, jobs and PDF reports. This package only scores.

## Layout

```
Ai/
├── contracts/                 input/output JSON examples agreed with the backend (v1.0)
├── ats_ai/
│   ├── __init__.py            exports analyze, Settings, RequestError, ConfigError
│   ├── __main__.py            CLI (JSON file in, JSON file out)
│   ├── scorer.py              analyze(request): validate -> score in parallel -> rank -> response
│   ├── scoring.py             overall score, verdict, ranking (pure maths)
│   ├── report.py              report_text for the detail view and PDF
│   ├── config.py              Settings, read from .env
│   ├── errors.py              RequestError, ConfigError, ResumeFailed
│   ├── schemas/
│   │   ├── request.py         input contract + request validation
│   │   ├── response.py        output contract
│   │   └── llm_output.py      strict schema for what Claude must return per resume
│   ├── prompts/scoring.py     system prompt, user prompt, retry prompt
│   ├── providers/             base.py, claude_provider.py (Claude API)
│   └── utils/json_utils.py    pulls the JSON object out of a model reply
├── scripts/
│   ├── check_setup.py         Python, packages, settings and one tiny Claude call
│   └── demo_offline.py        runs the contract example with a stand-in for Claude (no key needed)
├── tests/                     46 tests, all offline (a fake provider replaces Claude)
├── .env.example
├── pyproject.toml
└── requirements.txt
```

## How one request is handled

1. **Validate** the whole request. Rejected (nothing scored) if `jd_text` is empty, there are 0 or more than 20 resumes,
   a `resume_id` repeats, `section_weights` do not add up to 100, or `contract_version` is not `1.0`.
2. **Empty resume text** -> that resume is `failed` with "Resume text is empty". The rest go on.
3. **Score** each remaining resume with one Claude call, up to `MAX_PARALLEL_RESUMES` at a time.
   Invalid JSON from Claude is re-asked up to `LLM_MAX_RETRIES` times (the SDK also retries network errors).
   After that the resume is `failed` with a short, safe message. It never contains keys or stack traces.
4. **Calculate** the overall score in Python: `sum(section score x weight) / 100`, 2 decimals. Claude's own total is never used.
5. **Verdict**: 75 and above `strong`, 50 to 74.99 `moderate`, below 50 `weak`.
6. **Rank**: higher overall, then higher skills, then higher experience, then input order. Failed resumes go last with `rank: null`.
7. **Status**: `done` (all scored), `partially_failed` (some failed), `failed` (all failed).

Rule for a section the JD does not ask for (usually certifications): Claude marks it not applicable and the section
scores **100**, so nobody is penalised and the database `NOT NULL` columns stay filled. Change `NOT_REQUIRED_SCORE`
in `ats_ai/scoring.py` if the team decides otherwise.

## Setup

Needs Python 3.11 or newer. Run everything from the `Ai/` folder.

Windows (PowerShell):
```
cd Ai
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Linux / macOS:
```
cd Ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

`ANTHROPIC_API_KEY` is not in `.env`. It comes from GitHub secrets (Codespaces secret, and repo Actions secret for CI).
All other settings are optional, see `.env.example`.

```
python scripts/check_setup.py        # Python, packages, settings and one tiny Claude call (needs the key)
python scripts/demo_offline.py       # see the whole flow work without a key
pytest                               # 46 unit tests, no key needed
python -m ats_ai contracts/input.example.json -o out.json     # real run (needs the key)
```

CLI exit codes: `0` response written, `2` request rejected or input file unreadable, `3` configuration error (for example no API key).

## Phases

| Phase | Scope |
| --- | --- |
| Release (code freeze 26 Nov 2026) | Claude provider, prompts, schemas + validation, scoring, batch runner, ranking, tests |
| B | Fine-tuned models for resume parsing, matching and quality checks |
| C | RAG + few-shot with Qdrant |