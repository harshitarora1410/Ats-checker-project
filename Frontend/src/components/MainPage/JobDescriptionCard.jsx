import DropZone from "./DropZone";
import { CheckIcon, CloudUploadIcon, XIcon } from "./icons";
import { MAX_JD_SIZE_MB, formatFileSize, getExtension } from "./fileUtils";

// Step 1 card: paste the job description text OR upload a JD file.
// All state lives in MainPage.jsx — this component only displays it.

export default function JobDescriptionCard({
  jdText,
  jdFile, // { file, error } or null
  hasJobDescription,
  onTextChange,
  onFileSelect,
  onFileRemove,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {/* ---------- Card header ---------- */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-600">
            1
          </span>
          <div>
            <h2 className="text-base font-semibold">Job description</h2>
            <p className="mt-0.5 text-[13px] text-slate-500">
              Paste the JD text or upload a file — either one is enough.
            </p>
          </div>
        </div>

        {hasJobDescription && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            <CheckIcon className="h-3 w-3" />
            JD added
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---------- Left: paste text ---------- */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="jd-text"
              className="text-[13px] font-medium text-slate-700"
            >
              Paste job description
            </label>
            <span className="text-[11px] text-slate-400">
              {jdText.length} characters
            </span>
          </div>

          <textarea
            id="jd-text"
            value={jdText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Paste the full job description here…"
            className="h-[260px] w-full resize-none rounded-xl border border-slate-200 p-4 text-[13px] leading-6 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* ---------- Right: upload file ---------- */}
        <div>
          <p className="mb-2 text-[13px] font-medium text-slate-700">
            Or upload JD file
          </p>

          <DropZone
            accept=".pdf,.docx,.txt"
            onFiles={onFileSelect}
            className="min-h-[260px] border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50"
            iconClassName="border-emerald-100 text-emerald-500"
            icon={<CloudUploadIcon className="h-5 w-5" />}
            title="Drag & drop JD file"
            hint={
              <>
                or <span className="font-semibold text-blue-600">browse</span> ·
                PDF, DOCX, TXT up to {MAX_JD_SIZE_MB} MB
              </>
            }
          />

          {/* Chip showing the uploaded JD file */}
          {jdFile && (
            <div
              className={`mt-3 inline-flex max-w-full items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-[13px] ${
                jdFile.error ? "border-red-200" : "border-slate-200"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-red-50 text-[8px] font-bold text-red-500">
                {getExtension(jdFile.file.name).toUpperCase()}
              </span>

              <span className="truncate font-medium">{jdFile.file.name}</span>

              <span
                className={`text-[11px] ${jdFile.error ? "text-red-500" : "text-slate-400"}`}
              >
                {jdFile.error ?? formatFileSize(jdFile.file.size)}
              </span>

              <button
                type="button"
                onClick={onFileRemove}
                aria-label="Remove JD file"
                className="text-slate-400 hover:text-slate-700"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
