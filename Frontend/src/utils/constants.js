// Limits come from the backend (POST /api/analyses)
export const MAX_RESUMES = 20;
export const MAX_FILE_MB = 5;
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

// react-dropzone `accept` format
export const ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/msword": [".doc"],
  "text/plain": [".txt"],
  "application/rtf": [".rtf"],
  "text/rtf": [".rtf"],
};

export const ROLE_LABELS = {
  hr: "HR",
  hr_recruiter: "HR Recruiter",
  admin: "Admin",
};
