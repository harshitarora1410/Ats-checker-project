import { MAX_FILE_MB } from "./constants";

export const fileKey = (f) => `${f.name}-${f.size}-${f.lastModified}`;

export const getExt = (name = "") => (name.includes(".") ? name.split(".").pop().toUpperCase() : "FILE");

export const formatSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

// turns react-dropzone rejections into readable messages
export const rejectionMessages = (rejections = []) =>
  rejections.map(({ file, errors }) => {
    const code = errors[0]?.code;
    if (code === "file-too-large") return `${file.name} is larger than ${MAX_FILE_MB} MB`;
    if (code === "file-invalid-type") return `${file.name}: unsupported file type`;
    return `${file.name}: ${errors[0]?.message || "could not be added"}`;
  });
