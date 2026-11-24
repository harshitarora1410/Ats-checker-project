// Small helpers for validating and displaying files.
// Used by JobDescriptionCard.jsx and ResumesCard.jsx.

export const MAX_RESUMES = 200;
export const MAX_JD_SIZE_MB = 10;

export const ALLOWED_RESUME_TYPES = ["pdf", "docx", "doc", "txt"];
export const ALLOWED_JD_TYPES = ["pdf", "docx", "txt"];

// "Aarav_Mehta_Resume.pdf" -> "pdf"
export function getExtension(fileName) {
  return fileName.split(".").pop().toLowerCase();
}

// 253952 -> "248 KB"
export function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Returns an error message (string) if the file is not valid, otherwise null.
export function getFileError(file, allowedTypes, maxSizeMB) {
  if (!allowedTypes.includes(getExtension(file.name))) {
    return "Unsupported format";
  }
  if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
    return `Over ${maxSizeMB} MB`;
  }
  return null;
}