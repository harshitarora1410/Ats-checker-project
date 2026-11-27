// Optional in-browser mock of the FastAPI backend (VITE_USE_MOCK=true).
// Same function names and response shapes as httpApi.js, data kept in localStorage.
//
// Demo login: any seeded account from the API guide, e.g.
//   vaibhav.shukla@algoworks.com / Algoworks@123
// Tips: .txt resumes are really matched against the JD;
//       a file name containing "scan" fails like a scanned PDF.

import { ApiError } from "../lib/errors";
import { ALLOWED_EXTENSIONS, DEFAULT_WEIGHTS, MAX_FILE_BYTES, MAX_FILE_MB, MAX_RESUMES, SECTION_KEYS } from "../lib/constants";
import { getExt, nameFromFilename } from "../lib/files";
import { verdictFromScore } from "../lib/format";
import { AUTH_EXPIRED_EVENT } from "./request";
import { tokenStorage } from "./tokenStorage";
import { buildJdProfile, buildJdText, hashString, NAMES, ROLE_TEMPLATES, scoreCandidate, seededRandom } from "./mockData";

const DB_KEY = "ats.mock.db.v1";
const DEMO_PASSWORD = "Algoworks@123";
const MODELS = { claude: "claude-haiku-5-5", gemini: "gemini-3.5-flash-lite" };
const FAIL_MESSAGE =
  "The file appears to be a scanned image with no readable text. Upload a text-based PDF or DOCX to score this candidate.";

const SEEDED_USERS = [
  ["Vaibhav Shukla", "vaibhav.shukla@algoworks.com"],
  ["Harshit Arora", "harshit.arora@algoworks.com"],
  ["Vanshika Batra", "vanshika.batra@algoworks.com"],
  ["Ashish Dwivedi", "ashish.dwivedi@algoworks.com"],
  ["Kali Agarwal", "kali.agarwal@algoworks.com"],
  ["Devesh Kumar", "devesh.kumar@algoworks.com"],
].map(([name, email], i) => ({
  id: `seed-user-${i + 1}`,
  name,
  email,
  role: "hr_recruiter",
  created_at: "2026-11-22T14:35:00Z",
  password: DEMO_PASSWORD,
}));

// ── helpers ─────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const latency = () => sleep(250 + Math.random() * 350);

const uuid = () =>
  globalThis.crypto?.randomUUID?.() ??
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

const loadDb = () => {
  try {
    const db = JSON.parse(localStorage.getItem(DB_KEY) || "null");
    if (db?.users && db?.jobs) return { seededFor: {}, ...db };
  } catch {
    /* fall through */
  }
  return { users: [], jobs: [], seededFor: {} };
};

const saveDb = (db) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    throw new ApiError("Mock storage is full. Clear this site's data and try again.", 507);
  }
};

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, created_at: u.created_at });
const allUsers = (db) => [...SEEDED_USERS, ...db.users];

const issueTokens = (user) => ({
  access_token: `mock-access.${user.id}.${Date.now()}`,
  refresh_token: `mock-refresh.${user.id}`,
  token_type: "bearer",
  user: publicUser(user),
});

const requireUser = (db) => {
  const token = tokenStorage.getAccess();
  const id = token?.startsWith("mock-access.") ? token.split(".")[1] : null;
  const user = id && allUsers(db).find((u) => u.id === id);
  if (!user) {
    tokenStorage.clear();
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    throw new ApiError("Session expired, please login again", 401);
  }
  return user;
};

const nameFromText = (text) => {
  const first = text.split(/\r?\n/).map((l) => l.trim()).find(Boolean) || "";
  const clean = first.split(/[|·,]/)[0].trim();
  if (/^[A-Za-z][A-Za-z .'-]{2,40}$/.test(clean) && clean.split(/\s+/).length <= 4) {
    return clean.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return null;
};

const checkFile = (file, label) => {
  if (!ALLOWED_EXTENSIONS.includes(getExt(file.name))) throw new ApiError(`${label} ${file.name}: unsupported file type`, 400);
  if (file.size > MAX_FILE_BYTES) throw new ApiError(`${label} ${file.name} is larger than ${MAX_FILE_MB} MB`, 400);
};

const checkWeights = (w) => {
  const keys = Object.keys(w || {});
  const ok =
    keys.length === SECTION_KEYS.length &&
    SECTION_KEYS.every((k) => typeof w[k] === "number" && w[k] >= 0) &&
    SECTION_KEYS.reduce((s, k) => s + w[k], 0) === 100;
  if (!ok) throw new ApiError("section_weights must contain skills, experience, education, certifications and sum to 100", 400);
};

// ── job → API response shapes ───────────────────────────────
const resumeStatus = (job, item, now) => {
  if (item.failed) return "failed";
  const start = Date.parse(job.created_at) + item.start_ms;
  if (now < start) return "pending";
  if (now < start + item.duration_ms) return "processing";
  return "done";
};

const jobSnapshot = (job, now = Date.now()) => {
  const t0 = Date.parse(job.created_at);
  const rows = job.resumes.map((item) => ({ item, status: resumeStatus(job, item, now) }));
  const done = rows.filter((r) => r.status === "done").sort((a, b) => b.item.result.overall_score - a.item.result.overall_score);
  const rank = new Map(done.map((r, i) => [r.item.resume_id, i + 1]));
  const count = (s) => rows.filter((r) => r.status === s).length;
  const failedCount = count("failed");
  const active = count("pending") + count("processing") > 0;
  const status = failedCount === rows.length ? "failed" : now < t0 + 500 ? "queued" : active ? "processing" : "done";
  const lastEnd = Math.max(t0, ...job.resumes.map((it) => t0 + it.start_ms + it.duration_ms));
  const order = { done: 0, processing: 1, pending: 2, failed: 3 };
  rows.sort((a, b) => order[a.status] - order[b.status] || (rank.get(a.item.resume_id) ?? 0) - (rank.get(b.item.resume_id) ?? 0));
  const verdicts = done.map((r) => r.item.result.verdict);
  return {
    rows,
    rank,
    status,
    completed_at: status === "done" || status === "failed" ? new Date(lastEnd).toISOString() : null,
    progress: {
      done_count: done.length,
      processing_count: count("processing"),
      pending_count: count("pending"),
      failed_count: failedCount,
      has_partial_failures: failedCount > 0 && failedCount < rows.length,
      progress_percent: Math.round(((done.length + failedCount) / rows.length) * 100),
      top_score: done[0]?.item.result.overall_score ?? null,
      strong_count: verdicts.filter((v) => v === "strong").length,
      moderate_count: verdicts.filter((v) => v === "moderate").length,
      weak_count: verdicts.filter((v) => v === "weak").length,
    },
  };
};

const resumeCard = (job, item, status, rank) => {
  const done = status === "done";
  const res = item.result;
  return {
    resume_id: item.resume_id,
    rank: rank ?? null,
    original_filename: item.original_filename,
    candidate_name: done ? item.candidate_name : null,
    status,
    error_message: status === "failed" ? FAIL_MESSAGE : null,
    overall_score: done ? res.overall_score : null,
    verdict: done ? res.verdict : null,
    model_used: job.model_used,
    sections: done
      ? Object.fromEntries(SECTION_KEYS.map((k) => [k, { score: res.sections[k].score, matched: res.sections[k].matched, missing: res.sections[k].missing }]))
      : null,
    created_at: job.created_at,
  };
};

const findJob = (db, user, jobId) => {
  const job = db.jobs.find((j) => j.job_id === jobId && j.owner_id === user.id);
  if (!job) throw new ApiError("Analysis job not found", 404);
  return job;
};

// ── sample history so the History page isn't empty on first login ──
const seedHistory = (db, user) => {
  if (db.seededFor[user.id]) return;
  const r = seededRandom(hashString(user.id));
  const now = Date.now();
  for (let i = 0; i < 9; i++) {
    const tpl = ROLE_TEMPLATES[i % ROLE_TEMPLATES.length];
    const provider = i % 3 === 1 ? "gemini" : "claude";
    const created = now - (i * 6 + 1) * 864e5 - Math.floor(r() * 8) * 36e5;
    const profile = buildJdProfile(buildJdText(tpl), tpl.title);
    const names = [...NAMES].sort(() => r() - 0.5).slice(0, 4 + Math.floor(r() * 9));
    let offset = 700;
    const resumes = names.map((name, n) => {
      const filename = `${name.replace(/\s+/g, "_")}_${n % 3 === 1 ? "CV.docx" : "Resume.pdf"}`;
      const seed = hashString(`${user.id}|${i}|${name}`);
      const duration = 900 + (seed % 1200);
      const failed = i === 2 && n === names.length - 1;
      const item = {
        resume_id: uuid(),
        original_filename: failed ? `${name.replace(/\s+/g, "_")}_Scan.pdf` : filename,
        file_type: getExt(filename),
        candidate_name: name,
        failed,
        start_ms: failed ? 0 : offset,
        duration_ms: failed ? 0 : duration,
      };
      if (!failed) {
        offset += duration;
        item.result = scoreCandidate({ name, seed, text: null, profile, weights: DEFAULT_WEIGHTS });
      }
      return item;
    });
    db.jobs.push({
      job_id: uuid(),
      owner_id: user.id,
      jd_title: tpl.title,
      created_at: new Date(created).toISOString(),
      section_weights: { ...DEFAULT_WEIGHTS },
      model_used: MODELS[provider],
      resumes,
    });
  }
  db.seededFor[user.id] = true;
};

// ── public API (same as httpApi) ────────────────────────────
export const mockApi = {
  async login(email, password) {
    await latency();
    const db = loadDb();
    const user = allUsers(db).find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
    if (!user || user.password !== password) throw new ApiError("Invalid email or password", 401);
    return issueTokens(user);
  },

  async signup({ name, email, password, role }) {
    await latency();
    const db = loadDb();
    const normalized = String(email).trim().toLowerCase();
    if (allUsers(db).some((u) => u.email.toLowerCase() === normalized)) {
      throw new ApiError("User with this email already exists", 400);
    }
    const user = {
      id: uuid(),
      name: String(name).trim(),
      email: normalized,
      role: role || "hr",
      created_at: new Date().toISOString(),
      password, // mock only — never store passwords like this in a real backend
    };
    db.users.push(user);
    saveDb(db);
    return issueTokens(user);
  },

  async logout() {
    return { message: "Logged out successfully" };
  },

  async me() {
    await sleep(120);
    return publicUser(requireUser(loadDb()));
  },

  async listUsers() {
    await latency();
    const db = loadDb();
    requireUser(db);
    return allUsers(db).map(publicUser);
  },

  async createAnalysis({ jdTitle, jdText, jdFile, resumes = [], sectionWeights, provider }) {
    await latency();
    const db = loadDb();
    const user = requireUser(db);

    if (!resumes.length) throw new ApiError("Upload at least one resume", 400);
    if (resumes.length > MAX_RESUMES) throw new ApiError(`You can upload at most ${MAX_RESUMES} resumes per analysis`, 400);
    if (!jdText?.trim() && !jdFile) throw new ApiError("Provide a job description (text or file)", 400);
    resumes.forEach((f) => checkFile(f, "Resume"));
    if (jdFile) checkFile(jdFile, "JD file");
    const weights = sectionWeights || { ...DEFAULT_WEIGHTS };
    checkWeights(weights);

    let jd = jdText || "";
    if (!jd && jdFile && ["txt", "rtf"].includes(getExt(jdFile.name))) jd = await jdFile.text();
    const title = jdTitle?.trim() || "Untitled role";
    const profile = buildJdProfile(jd, title);
    const jobId = uuid();
    const prov = provider === "gemini" ? "gemini" : "claude";

    let offset = 700;
    const items = [];
    for (const file of resumes) {
      const ext = getExt(file.name);
      const failed = /scan|corrupt/i.test(file.name);
      const text = !failed && ext === "txt" ? (await file.text()).slice(0, 20000) : null;
      const seed = hashString(`${file.name}|${file.size}|${jobId}`);
      const duration = 900 + (seed % 1200);
      const candidate_name = (text && nameFromText(text)) || nameFromFilename(file.name);
      const item = {
        resume_id: uuid(),
        original_filename: file.name,
        file_type: ext,
        candidate_name,
        failed,
        start_ms: failed ? 0 : offset,
        duration_ms: failed ? 0 : duration,
      };
      if (!failed) {
        offset += duration;
        item.result = scoreCandidate({ name: candidate_name, seed, text, profile, weights });
      }
      items.push(item);
    }

    const job = {
      job_id: jobId,
      owner_id: user.id,
      jd_title: title,
      created_at: new Date().toISOString(),
      section_weights: weights,
      model_used: MODELS[prov],
      resumes: items,
    };
    db.jobs.push(job);
    saveDb(db);
    return { job_id: jobId, status: items.every((i) => i.failed) ? "failed" : "queued", total_resumes: items.length };
  },

  async getAnalysis(jobId) {
    await sleep(150);
    const db = loadDb();
    const job = findJob(db, requireUser(db), jobId);
    const snap = jobSnapshot(job);
    return {
      job_id: job.job_id,
      jd_title: job.jd_title,
      status: snap.status,
      total_resumes: job.resumes.length,
      section_weights: job.section_weights,
      model_used: job.model_used,
      created_at: job.created_at,
      completed_at: snap.completed_at,
      progress: snap.progress,
      resumes: snap.rows.map(({ item, status }) => resumeCard(job, item, status, snap.rank.get(item.resume_id))),
    };
  },

  async getResume(jobId, resumeId) {
    await latency();
    const db = loadDb();
    const job = findJob(db, requireUser(db), jobId);
    const item = job.resumes.find((r) => r.resume_id === resumeId);
    if (!item) throw new ApiError("Resume not found in this analysis job", 404);
    const snap = jobSnapshot(job);
    const status = resumeStatus(job, item, Date.now());
    const card = resumeCard(job, item, status, snap.rank.get(item.resume_id));
    const res = status === "done" ? item.result : null;
    return {
      ...card,
      job_id: job.job_id,
      jd_title: job.jd_title,
      file_type: item.file_type,
      total_resumes: job.resumes.length,
      summary: res?.summary ?? null,
      report_text: res?.report_text ?? null,
      extracted_text: res?.extracted_text ?? null,
      sections: res ? res.sections : null,
      strengths: res?.strengths ?? [],
      gaps: res?.gaps ?? [],
      recommendations: res?.recommendations ?? [],
    };
  },

  async listAnalyses({ page = 1, pageSize = 8, search, days, model } = {}) {
    await latency();
    const db = loadDb();
    const user = requireUser(db);
    if (!db.seededFor[user.id]) {
      seedHistory(db, user);
      saveDb(db);
    }
    const now = Date.now();
    const mine = db.jobs
      .filter((j) => j.owner_id === user.id)
      .map((j) => ({ job: j, snap: jobSnapshot(j, now) }))
      .sort((a, b) => Date.parse(b.job.created_at) - Date.parse(a.job.created_at));

    const tops = mine.map((m) => m.snap.progress.top_score).filter((s) => s != null);
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    const stats = {
      total_analyses: mine.length,
      resumes_scored: mine.reduce((s, m) => s + m.snap.progress.done_count, 0),
      avg_top_score: tops.length ? Math.round((tops.reduce((a, b) => a + b, 0) / tops.length) * 10) / 10 : null,
      this_month_count: mine.filter((m) => Date.parse(m.job.created_at) >= monthStart).length,
    };

    const q = (search || "").trim().toLowerCase();
    const filtered = mine.filter(
      ({ job }) =>
        (!q || job.jd_title.toLowerCase().includes(q)) &&
        (!days || Date.parse(job.created_at) >= now - Number(days) * 864e5) &&
        (!model || job.model_used.toLowerCase().includes(String(model).toLowerCase()))
    );
    const size = Math.min(50, Math.max(1, Number(pageSize) || 8));
    const totalPages = Math.max(1, Math.ceil(filtered.length / size));
    const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
    const items = filtered.slice((current - 1) * size, current * size).map(({ job, snap }) => ({
      job_id: job.job_id,
      jd_title: job.jd_title,
      status: snap.status,
      total_resumes: job.resumes.length,
      top_score: snap.progress.top_score,
      top_verdict: verdictFromScore(snap.progress.top_score),
      model_used: job.model_used,
      created_at: job.created_at,
      completed_at: snap.completed_at,
    }));
    return { stats, items, total: filtered.length, page: current, page_size: size, total_pages: totalPages };
  },

  async health() {
    return { status: "ok" };
  },

  async warm() {
    await sleep(200);
    return { status: "warm", db: "ok", latency_ms: 2.74 };
  },
};
