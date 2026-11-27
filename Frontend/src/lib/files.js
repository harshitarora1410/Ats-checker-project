import { ALLOWED_EXTENSIONS, MAX_FILE_BYTES, MAX_FILE_MB } from "./constants";

export const fileKey = (f) => `${f.name}-${f.size}-${f.lastModified}`;

export const getExt = (name = "") => (name.includes(".") ? name.split(".").pop().toLowerCase() : "");

export const formatSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

// Splits picked files into accepted ones and readable error messages.
export const validateFiles = (files) => {
  const accepted = [];
  const errors = [];
  for (const file of files) {
    const ext = getExt(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      errors.push(`${file.name}: unsupported file type (use PDF, DOCX, DOC, TXT or RTF)`);
    } else if (file.size > MAX_FILE_BYTES) {
      errors.push(`${file.name} is larger than ${MAX_FILE_MB} MB`);
    } else if (file.size === 0) {
      errors.push(`${file.name} is empty`);
    } else {
      accepted.push(file);
    }
  }
  return { accepted, errors };
};

// "Aarav_Mehta_Resume.pdf" -> "Aarav Mehta" (used until the backend returns candidate_name)
export const nameFromFilename = (filename = "") => {
  const base = filename.replace(/\.[^.]+$/, "");
  const noise = /^(resume|cv|final|updated|new|latest|copy|profile|v\d+|\d+|backend|frontend|engineer|developer)$/i;
  const words = base
    .split(/[\s_\-.]+/)
    .filter((w) => w && /^[a-z]+$/i.test(w) && !noise.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
  return words.length ? words.join(" ") : base || "Candidate";
};
