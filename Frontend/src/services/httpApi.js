import { request } from "./request";

// Real FastAPI backend — endpoints from "Frontend API Integration Guide".
// mockApi.js implements exactly the same functions.

export const httpApi = {
  // ── Auth ────────────────────────────────────────────────
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password }, auth: false }),

  // role is optional; backend defaults to HR
  signup: ({ name, email, password, role }) =>
    request("/auth/signup", {
      method: "POST",
      body: { name, email, password, ...(role ? { role } : {}) },
      auth: false,
    }),

  // stateless on the server; the client deletes its tokens
  logout: () => request("/auth/logout", { method: "POST", auth: false }).catch(() => null),

  me: () => request("/auth/me"),

  listUsers: () => request("/auth/users"),

  // ── Analyses ────────────────────────────────────────────
  // POST /api/analyses (multipart) -> 202 { job_id, status, total_resumes }
  createAnalysis: ({ jdTitle, jdText, jdFile, resumes, sectionWeights, provider, model }) => {
    const form = new FormData();
    if (jdTitle?.trim()) form.append("jd_title", jdTitle.trim());
    if (jdText?.trim()) form.append("jd_text", jdText.trim());
    if (jdFile) form.append("jd_file", jdFile);
    if (sectionWeights) form.append("section_weights", JSON.stringify(sectionWeights));
    if (provider) form.append("provider", provider);
    if (model) form.append("model", model);
    resumes.forEach((file) => form.append("resumes", file));
    return request("/analyses", { method: "POST", body: form });
  },

  // live progress + ranked cards (poll while queued/processing)
  getAnalysis: (jobId) => request(`/analyses/${encodeURIComponent(jobId)}`),

  // full detail for one candidate (P5 + PDF data for P6)
  getResume: (jobId, resumeId) =>
    request(`/analyses/${encodeURIComponent(jobId)}/resumes/${encodeURIComponent(resumeId)}`),

  // history list + KPI stats
  listAnalyses: ({ page = 1, pageSize = 8, search, days, model } = {}) =>
    request("/analyses", { query: { page, page_size: pageSize, search, days, model } }),

  // ── Health ──────────────────────────────────────────────
  health: () => request("/health", { auth: false }),

  // SELECT 1 on Postgres; wakes Render + Neon before a demo
  warm: () => request("/warm", { auth: false }),
};
