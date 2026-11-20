# Ai - ATS scoring engine (`ats_ai`)

Solo-owned AI agent for the ATS checker. The backend installs this package (`pip install -e ../Ai`) and calls it.

## Contract with the backend

JSON in, JSON out, one call per analysis job. Examples in `contracts/`.

| Way to call | Input | Output |
| --- | --- | --- |
| Python: `ats_ai.analyze(request)` | dict like `contracts/input.example.json` | dict like `contracts/output.example.json` |
| CLI: `python -m ats_ai input.json -o output.json` | JSON file | JSON file |

The backend does file text extraction, storage, auth, jobs and PDF reports.

## Layout

```
contracts/           input/output JSON examples agreed with the backend
ats_ai/
  __main__.py        CLI (JSON file in, JSON file out)
  scorer.py          analyze(request) -> response
  config.py
  agent/             LangGraph state, workflow, batch_runner, nodes
  providers/         Claude API connection
  prompts/
  schemas/           input, output, llm_output + validators
  models/            5 slots: resume_parser, resume_job_fit, candidate_matching,
                     resume_classification, resume_quality (placeholder -> fine-tuned)
  rag/               Phase C (Qdrant)
  scoring_engine/    section scores, overall, ranking, weights.yaml (35/35/15/15)
  utils/
scripts/             check_setup.py (Phase 1 check)
training/            Phase B training code + Kaggle/Colab notebooks
datasets/            local only, not committed
trained_models/      checkpoints, not committed
tests/               unit, integration, model_evaluation, consistency, fixtures
```

## Setup (Phase 1)

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

Then open `.env`, paste your key into `ANTHROPIC_API_KEY`, and check everything:

```
python scripts/check_setup.py     # Python, packages, settings and one tiny Claude call
pytest                            # unit tests (no API key needed)
```

## Phases

| Phase | Scope |
| --- | --- |
| Release (code freeze 26 Nov 2026) | Providers, prompts, schema + validation, scoring, batch runner, tests |
| B | Fine-tuned models plugged into the 5 slots |
| C | RAG + few-shot with Qdrant |