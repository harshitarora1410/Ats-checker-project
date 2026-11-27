// Limits from POST /api/analyses (API integration guide)
export const MAX_RESUMES = 20;
export const MAX_FILE_MB = 5;
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
export const ALLOWED_EXTENSIONS = ["pdf", "docx", "doc", "txt", "rtf"];
export const ACCEPT_ATTR = ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",");

export const SECTION_KEYS = ["skills", "experience", "education", "certifications"];

export const SECTION_LABELS = {
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  certifications: "Certifications",
};

export const DEFAULT_WEIGHTS = { skills: 35, experience: 35, education: 15, certifications: 15 };

export const PROVIDERS = {
  claude: {
    label: "Claude",
    description: "Detailed reasoning and nuanced explanations for each section.",
  },
  gemini: {
    label: "Gemini",
    description: "Fast batch processing for large volumes of resumes.",
  },
};

export const DEFAULT_PROVIDER = "claude";

// verdict thresholds (read-only, set by the backend)
export const VERDICTS = {
  strong: { label: "Strong fit", short: "Strong", range: "75 – 100", min: 75 },
  moderate: { label: "Moderate fit", short: "Moderate", range: "50 – 74", min: 50 },
  weak: { label: "Weak fit", short: "Weak", range: "Below 50", min: 0 },
};

export const ROLE_LABELS = {
  hr: "HR",
  HR: "HR",
  hr_recruiter: "HR Recruiter",
  admin: "Admin",
};

export const ACTIVE_JOB_STATUSES = ["queued", "processing"];
