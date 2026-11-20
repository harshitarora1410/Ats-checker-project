# datasets/

Data for training the 5 specialist models (Phase B) and building RAG knowledge (Phase C).

**Only this README and `manifests/*.yaml` are committed.** All data files stay local, on Kaggle or on Google Drive, because they are large and contain personal data.

## Layout

```
datasets/
├── raw/                    1. Original downloads, never edited
│   ├── resume_parser/          14.6K  structured resume data
│   ├── resume_job_fit/         93K    resume + JD + fit label
│   ├── candidate_matching/     10K    resume + JD + relevance
│   ├── resume_classification/  9K     resume + job category
│   ├── resume_quality/         CareerCorpus
│   └── knowledge/
│       ├── skill_taxonomy/     skills, synonyms, technologies
│       └── job_descriptions/   role descriptions and requirements
│
├── interim/                2. Cleaned: duplicates removed, PII redacted, broken rows dropped
│   └── <same 5 folders>
│
├── processed/              3. Ready to train: train.jsonl / val.jsonl / test.jsonl
│   └── <same 5 folders>
│
├── labeled/                Human-made labels
│   ├── resume_quality/         our quality annotations (rubric needed)
│   └── gold_ats_scores/        human-reviewed scores to calibrate the ATS score
│
├── rag/                    Phase C: cleaned knowledge for Qdrant (one folder = one collection)
│   ├── skill_knowledge/
│   ├── job_knowledge/
│   ├── resume_examples/        reviewed, anonymised examples only
│   ├── few_shot_examples/      verified input/output examples
│   └── scoring_guidelines/
│
└── manifests/              One YAML per dataset: source, license, columns, counts, splits (committed)
```

## Flow for each dataset

| Step | From → To | What happens | Update in manifest |
| --- | --- | --- | --- |
| 1. Download | source → `raw/<slot>/` | Save the original files unchanged | `source`, `raw_files`, `sha256`, `status: raw` |
| 2. Inspect | `raw/` | Check columns, labels, class balance, license | `contents`, `license` |
| 3. Clean | `raw/` → `interim/<slot>/` | Remove duplicates, redact emails/phones/addresses, drop empty rows | `cleaning`, `status: cleaned` |
| 4. Split | `interim/` → `processed/<slot>/` | Train/val/test **grouped by resume** so no resume is in two splits | `splits`, `status: split` |
| 5. Train | `processed/` → Kaggle/Colab | Fine-tune; checkpoints go to `trained_models/` | `status: used_for_training` |

## Rules

1. **Never edit `raw/`.** Every change happens in a script that writes to `interim/` or `processed/`.
2. **Check the license** before training. Fill `source.license` in the manifest.
3. **Redact personal data** before anything leaves `interim/`.
4. **Remove duplicates before splitting.** The same resume often appears in several datasets.
5. **Split by resume**, not by row, to prevent data leakage.
6. **Candidate Matching:** first confirm the data has real relevance or ranking labels. Category labels alone cannot train ranking.
7. **Resume Quality:** no labels yet. Agree on an annotation rubric before labelling anything in `labeled/resume_quality/`.
8. **Never commit data files.** `.gitignore` blocks everything here except this README and `manifests/`.

## File format in `processed/`

One JSON object per line (`.jsonl`), UTF-8. Every record has an `id` and a `group_id` (the resume it came from), used for grouped splits.