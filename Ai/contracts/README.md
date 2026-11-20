# Backend ↔ AI contract (v1.0)

The backend sends **one JSON** with the JD and 1–20 resumes as text.
The AI returns **one JSON** with a ranked result for every resume.

- Input example: [`input.example.json`](input.example.json)
- Output example: [`output.example.json`](output.example.json)

Any change to this contract must be agreed by the backend owner and the AI owner, and `contract_version` must be raised.

---

## 1. Input (backend → AI)

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `contract_version` | string | yes | `"1.0"` |
| `job_id` | string (UUID) | yes | `analysis_jobs.id` |
| `jd_text` | string | yes | Job description as plain text, not empty |
| `section_weights` | object | no | Keys `skills`, `experience`, `education`, `certifications`; whole numbers that add up to 100. Default `35 / 35 / 15 / 15` |
| `resumes` | array | yes | **1 to 20** items |
| `resumes[].resume_id` | string (UUID) | yes | `resumes.id`, unique within the request |
| `resumes[].resume_text` | string | yes | Resume as plain text (extracted by the backend) |

The whole request is **rejected** (nothing is scored) if:
- `jd_text` is empty
- `resumes` has 0 or more than 20 items
- a `resume_id` is repeated
- `section_weights` does not add up to 100

An **empty `resume_text`** does not reject the request. That one resume comes back with `status: "failed"`.

---

## 2. Output (AI → backend)

### Top level

| Field | Type | Meaning |
| --- | --- | --- |
| `contract_version` | string | `"1.0"` |
| `job_id` | string | Same as input |
| `status` | string | `done` = all resumes scored · `partially_failed` = some failed · `failed` = all failed |
| `model_used` | string | Claude model id, e.g. `claude-haiku-5-5` → `resume_scores.model_used` |
| `section_weights` | object | Weights actually used |
| `total_resumes` / `succeeded` / `failed` | integer | Counts |
| `results` | array | One item per input resume, **sorted by rank** (failed ones last) |

### Each result

| Field | Type | Maps to |
| --- | --- | --- |
| `resume_id` | string | `resumes.id` |
| `rank` | integer or null | 1 = best match; `null` if failed |
| `status` | `done` \| `failed` | `resumes.status` |
| `error_message` | string or null | `resumes.error_message` |
| `candidate_name` | string or null | `resume_scores.candidate_name` |
| `overall_score` | number 0–100 (2 decimals) | `resume_scores.overall_score` |
| `verdict` | `strong` \| `moderate` \| `weak` | `resume_scores.verdict` |
| `summary` | string | `resume_scores.summary` |
| `section_scores.skills` | number 0–100 | `resume_scores.skills_score` |
| `section_scores.experience` | number 0–100 | `resume_scores.experience_score` |
| `section_scores.education` | number 0–100 | `resume_scores.education_score` |
| `section_scores.certifications` | number 0–100 | `resume_scores.certifications_score` |
| `details` | object | `resume_scores.details` (JSONB) |
| `report_text` | string | Readable report for the detail view and PDF |

For a failed resume, every score field is `null`.

### `details` shape

```json
{
  "skills":         { "matched": ["..."], "missing": ["..."], "reasoning": "..." },
  "experience":     { "matched": ["..."], "missing": ["..."], "reasoning": "..." },
  "education":      { "matched": ["..."], "missing": ["..."], "reasoning": "..." },
  "certifications": { "matched": ["..."], "missing": ["..."], "reasoning": "..." },
  "recommendations": ["..."]
}
```

---

## 3. Scoring rules

- Claude gives the **4 section scores** (0–100) with evidence from the resume.
- **Python** calculates the overall score. Claude's own total is never used:

  `overall = (skills × w_skills + experience × w_experience + education × w_education + certifications × w_certifications) / 100`

  Example with 35/35/15/15 and scores 88/85/90/20 → **77.05**

- Verdict from the overall score:

| Overall | Verdict |
| --- | --- |
| 75 – 100 | `strong` |
| 50 – 74.99 | `moderate` |
| below 50 | `weak` |

## 4. Ranking rules

1. Higher `overall_score` first.
2. Tie → higher `skills` score first.
3. Still tied → higher `experience` score first.
4. Failed resumes come last with `rank: null`.

## 5. Failure rules

- One resume failing never stops the others.
- Each Claude call is retried up to 2 times before a resume is marked failed.
- `error_message` is short and safe to show HR, for example `Resume text is empty` or `AI response failed validation after retries`. It never contains API keys or stack traces.

## 6. Open item

The DB allows `analysis_jobs.status` = `queued | processing | done | failed` only.
Backend to decide: add `partially_failed` to the DB, or store it as `done` and rely on each resume's own `status`.
