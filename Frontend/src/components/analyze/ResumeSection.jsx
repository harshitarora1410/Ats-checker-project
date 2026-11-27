import { useState } from "react";
import { CircleCheck, FileText, X } from "lucide-react";
import Dropzone from "./Dropzone";
import { useAnalysisDraft } from "../../hooks/useAnalysisDraft";
import { MAX_RESUMES } from "../../utils/constants";
import { fileKey, formatSize, getExt, rejectionMessages } from "../../utils/files";

const iconColor = { PDF: "text-red-500 bg-red-50", DOC: "text-blue-600 bg-blue-50", DOCX: "text-blue-600 bg-blue-50" };

export default function ResumeSection() {
  const { resumes, setResumes } = useAnalysisDraft();
  const [messages, setMessages] = useState([]);

  const handleFiles = (accepted, rejected) => {
    const msgs = rejectionMessages(rejected);

    const existing = new Set(resumes.map(fileKey));
    const fresh = accepted.filter((f) => !existing.has(fileKey(f)));
    const dupes = accepted.length - fresh.length;
    if (dupes) msgs.push(`${dupes} duplicate file${dupes > 1 ? "s" : ""} skipped`);

    const slots = MAX_RESUMES - resumes.length;
    if (fresh.length > slots) msgs.push(`Only ${MAX_RESUMES} resumes are allowed per analysis`);

    setResumes((prev) => [...prev, ...fresh.slice(0, Math.max(slots, 0))]);
    setMessages(msgs);
  };

  const remove = (key) => setResumes((prev) => prev.filter((f) => fileKey(f) !== key));

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-600">
            2
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Upload resumes</h2>
            <p className="text-sm text-gray-500">Add up to {MAX_RESUMES} candidate resumes per analysis.</p>
          </div>
        </div>
        {resumes.length > 0 && (
          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
            {resumes.length} / {MAX_RESUMES} added
          </span>
        )}
      </div>

      <Dropzone
        onFiles={handleFiles}
        title="Drop multiple resumes here"
        hint="PDF, DOCX, DOC, TXT, RTF up to 5 MB each"
      />

      {messages.length > 0 && (
        <ul className="mt-3 space-y-1">
          {messages.map((m) => (
            <li key={m} className="text-xs text-red-600">{m}</li>
          ))}
        </ul>
      )}

      {resumes.length > 0 && (
        <ul className="mt-5 space-y-2.5">
          {resumes.map((file) => {
            const key = fileKey(file);
            const ext = getExt(file.name);
            return (
              <li key={key} className="flex items-center gap-3 rounded-xl border border-gray-200 px-3.5 py-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconColor[ext] || "text-gray-600 bg-gray-100"}`}>
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-400">{ext}</p>
                </div>
                <span className="hidden w-20 text-sm text-gray-600 sm:block">{formatSize(file.size)}</span>
                <span className="hidden items-center gap-1 rounded-full bg-mint-50 px-2.5 py-1 text-xs font-semibold text-strong sm:inline-flex">
                  <CircleCheck className="h-3.5 w-3.5" /> Ready
                </span>
                <button
                  onClick={() => remove(key)}
                  aria-label={`Remove ${file.name}`}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
