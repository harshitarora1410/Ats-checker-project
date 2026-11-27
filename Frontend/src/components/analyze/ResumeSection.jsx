import { useState } from "react";
import { Files, X } from "lucide-react";
import StepCard from "./StepCard";
import Dropzone from "../ui/Dropzone";
import FileIcon from "../ui/FileIcon";
import { StatusBadge } from "../ui/Badge";
import { useAnalysisDraft } from "../../hooks/useAnalysisDraft";
import { MAX_FILE_MB, MAX_RESUMES } from "../../lib/constants";
import { fileKey, formatSize, getExt, validateFiles } from "../../lib/files";

export default function ResumeSection() {
  const { resumes, setResumes } = useAnalysisDraft();
  const [messages, setMessages] = useState([]);

  const handleFiles = (files) => {
    const { accepted, errors } = validateFiles(files);
    const msgs = [...errors];

    const existing = new Set(resumes.map(fileKey));
    const fresh = accepted.filter((f) => !existing.has(fileKey(f)));
    const dupes = accepted.length - fresh.length;
    if (dupes) msgs.push(`${dupes} duplicate file${dupes > 1 ? "s" : ""} skipped`);

    const slots = Math.max(MAX_RESUMES - resumes.length, 0);
    if (fresh.length > slots) msgs.push(`Only ${MAX_RESUMES} resumes are allowed per analysis — ${fresh.length - slots} not added`);

    setResumes((prev) => [...prev, ...fresh.slice(0, slots)]);
    setMessages(msgs);
  };

  const remove = (key) => setResumes((prev) => prev.filter((f) => fileKey(f) !== key));

  return (
    <StepCard
      number="2"
      title="Upload resumes"
      description={`Add candidate resumes — up to ${MAX_RESUMES} files per analysis.`}
      badge={resumes.length ? `${resumes.length} uploaded` : null}
    >
      <Dropzone
        onFiles={handleFiles}
        icon={Files}
        error={messages.length > 0 && resumes.length === 0}
        title="Drop multiple resumes here (PDF, DOCX, DOC, TXT, RTF)"
        hint={`up to ${MAX_FILE_MB} MB each`}
      />

      {messages.length > 0 && (
        <ul className="mt-3 space-y-1">
          {messages.map((m) => (
            <li key={m} className="text-xs text-red-600">
              {m}
            </li>
          ))}
        </ul>
      )}

      {resumes.length > 0 && (
        <div className="mt-5">
          <div className="hidden grid-cols-[1fr_100px_120px_60px] px-4 pb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase sm:grid">
            <span>File</span>
            <span>Size</span>
            <span>Status</span>
            <span className="text-right">Remove</span>
          </div>
          <ul className="space-y-2">
            {resumes.map((file) => {
              const key = fileKey(file);
              return (
                <li
                  key={key}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 sm:grid-cols-[1fr_100px_120px_60px]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileIcon name={file.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500 uppercase">
                        {getExt(file.name)}
                        <span className="normal-case sm:hidden"> · {formatSize(file.size)}</span>
                      </p>
                    </div>
                  </div>
                  <span className="hidden text-sm text-gray-600 sm:block">{formatSize(file.size)}</span>
                  <span className="hidden sm:block">
                    <StatusBadge status="ready" />
                  </span>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => remove(key)}
                      aria-label={`Remove ${file.name}`}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </StepCard>
  );
}
