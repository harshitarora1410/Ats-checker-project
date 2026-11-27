# ATS Resume Scorer — Frontend

React 19 + Vite + Tailwind CSS v4 frontend for the ATS Score Checker.
Built from the design (UX Pilot PDF) and the *Frontend API Integration Guide*.

## Run it

```bash
cd Frontend
npm install
npm run dev        # http://localhost:5173
```

By default the app talks to the **deployed backend** (`https://ats-backend-algoworks.onrender.com`).
To change that, copy `.env.example` to `.env`:

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_URL` | `https://ats-backend-algoworks.onrender.com` | Backend origin, **without** `/api`. Local backend: `http://localhost:8000` |
| `VITE_USE_MOCK` | `false` | `true` = in-browser mock, no backend needed |

Restart `npm run dev` after editing `.env`.

> The backend must allow your dev origin (`http://localhost:5173`) in CORS.
> The guide lists it for the local backend; check the deployed one too.

**Test login** (seeded accounts from the guide): `vaibhav.shukla@algoworks.com` / `Algoworks@123`

**Mock mode** (`VITE_USE_MOCK=true`): same login; data lives in `localStorage`.
`.txt` resumes are really matched against the JD, and a file whose name contains
`scan` fails like a scanned PDF. A "Mock data" pill shows in the navbar.

Other scripts: `npm run build`, `npm run preview`, `npm run lint` (oxlint).

## User flow → routes

| Page | Route | Login |
|---|---|---|
| P1 Main | `/` | public — guests see Sign in / Sign up instead of a profile |
| P2 Login / Signup | `/login`, `/signup` | — |
| P3 Analyzing | `/analyze/:jobId/progress` | required |
| P4 Ranking | `/analyze/:jobId/results` | required |
| P5 Candidate details | `/analyze/:jobId/resumes/:resumeId` | required |
| P6 PDF report | `/analyze/:jobId/resumes/:resumeId/report` | required |
| P7 Settings | `/settings` | required |
| P8 History | `/history` | required |

**Intent-based redirect** (`src/lib/intent.js`, `src/hooks/usePostAuthRedirect.js`):

- Guest clicks **History** → `/login?intent=history` → after login `/history`
- Guest clicks **Settings** → `/login?intent=settings` → after login `/settings`
- Guest clicks **Score Resumes** → `/login?intent=score` → after login the analysis is
  created from the files still held in memory → `/analyze/:jobId/progress`
- Guest opens any other protected link → `/login?next=<path>` → back to that path
- No intent → `/`
- Switching between login and signup keeps the intent.

P3 polls `GET /api/analyses/{id}` every 2.5 s and opens P4 automatically when the job is `done`.
History **Open** goes straight to P4 (skips P3); if the job is still running, P4 shows
a banner and keeps polling.

## API integration (per the guide)

All calls go through `src/services/` — pages never call `fetch` directly.

- `request.js` — adds `Authorization: Bearer`, parses FastAPI `detail` errors (incl. 422 arrays).
  On **401** it calls `POST /api/auth/refresh` **once** and retries; if refresh fails it clears the
  tokens and the user lands on login with *"Session expired, please login again"*.
- `httpApi.js` — every endpoint in the guide. Uploads use `FormData` **without** setting
  `Content-Type`, so the browser adds the multipart boundary.
- `GET /api/warm` runs on app start to wake Render + Neon.
- "Keep me signed in" → tokens in `localStorage`; unchecked → `sessionStorage`.
- Partial failures: failed resumes are listed under the ranking, and a banner explains them.
- P5/P6 use the fallback rule: when `strengths`/`gaps` are `[]`, they are built from
  `sections[key].matched` / `missing`.
- Settings: the backend has no settings endpoint, so the chosen model and section weights
  are saved per user in `localStorage` and sent as `provider` + `section_weights` with every
  new analysis. Weights must be whole numbers totalling 100.
- P6 **Download** creates a real PDF in the browser (`html-to-image` + `pdf-lib`, loaded only
  on click). `html2canvas` was avoided because it can't read Tailwind v4's `oklch` colours.
  **Print** uses the browser dialog with A4 print styles.

## Folder structure

```
src/
  main.jsx, App.jsx, index.css, config.js
  services/   index.js, httpApi.js, request.js, tokenStorage.js, mockApi.js, mockData.js
  context/    AuthContext.jsx, AnalysisDraftContext.jsx
  hooks/      useAuth, useAnalysisDraft, useAsync, useJobPolling, usePostAuthRedirect
  lib/        constants, format, files, intent, errors, settingsStore, candidate
  routes/     AppRoutes.jsx, ProtectedRoute.jsx
  components/
    ui/        Button, Input, PasswordInput, Alert, Badge, Chip, Card, ScoreCircle,
               ProgressBar, Dropzone, FileIcon, Spinner, EmptyState, Logo, Avatar
    layout/    AppLayout, Navbar, AuthLayout, PageHeader, IntentNotice
    analyze/   JdSection, ResumeSection, ActionBar, StepIndicator, StepCard   (P1)
    results/   StatCards, ResultsToolbar, CandidateCard, FailedCard           (P4)
    candidate/ CandidateHero, SectionCard, AiSummary, ResumePreview          (P5)
    report/    ReportDocument, exportPdf                                     (P6)
  pages/      MainPage, LoginPage, SignupPage, AnalyzingPage, RankingPage,
              CandidatePage, ReportPage, SettingsPage, HistoryPage, NotFoundPage
```

## Differences from the design (no backend support yet)

- "Cancel analysis" → **Continue in background** (no cancel endpoint; the job keeps running server-side).
- Failed resume cards have no Retry / Replace buttons (no endpoint) — the message says to upload a text-based file.
- "Download all reports" → **Export CSV** of the ranking (a combined PDF is on the roadmap).
- Share, Shortlist, the bell icon and the ranking-page model dropdown are left out.
- Settings has no API-key field: keys stay on the server. **Test connection** calls `/api/warm`.
- Limits follow the API guide: 20 resumes, 5 MB each, PDF/DOCX/DOC/TXT/RTF.
- "Forgot password?" explains that resets are done by an admin (no reset endpoint).
