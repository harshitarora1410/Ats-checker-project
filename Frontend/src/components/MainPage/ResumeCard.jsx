import DropZone from "./DropZone";
import { AlertIcon, CheckIcon, CopyIcon, FileTextIcon, XIcon } from "./icons";
import { MAX_RESUMES, formatFileSize, getExtension } from "./fileUtils";

// Step 2 card: upload resumes and see them in a list.
// All state lives in MainPage.jsx — this component only displays it.

export default function ResumesCard({ resumes, onFilesSelect, onRemove }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {/* ---------- Card header ---------- */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-600">
            2
          </span>
          <div>
            <h2 className="text-base font-semibold">Upload resumes</h2>
            <p className="mt-0.5 text-[13px] text-slate-500">
              Add as many candidates as you like — up to {MAX_RESUMES} files per
              analysis.
            </p>
          </div>
        </div>

        {resumes.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
            {resumes.length} uploaded
          </span>
        )}
      </div>

      {/* ---------- Drop zone ---------- */}
      <DropZone
        multiple
        accept=".pdf,.docx,.doc,.txt"
        onFiles={onFilesSelect}
        className="min-h-[148px] border-blue-200 bg-blue-50/40 hover:bg-blue-50/70"
        iconClassName="border-blue-100 text-blue-600"
        icon={<CopyIcon className="h-5 w-5" />}
        title="Drop multiple resumes here (PDF, DOCX, DOC, TXT)"
        hint={
          <>
            or <span className="font-semibold text-blue-600">browse files</span>{" "}
            from your computer
          </>
        }
      />

      {/* ---------- File list ---------- */}
      {resumes.length > 0 && (
        <div className="mt-6">
          {/* Column headings */}
          <div className="grid grid-cols-[1fr_90px_130px_50px] px-4 pb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400 sm:grid-cols-[1fr_120px_160px_60px]">
            <span>File</span>
            <span>Size</span>
            <span>Status</span>
            <span className="text-right">Remove</span>
          </div>

          {/* One row per resume */}
          <ul className="flex flex-col gap-2.5">
            {resumes.map(({ id, file, error }) => {
              const extension = getExtension(file.name);
              const isPdf = extension === "pdf";
              const isWord = extension === "doc" || extension === "docx";

              return (
                <li
                  key={id}
                  className={`grid grid-cols-[1fr_90px_130px_50px] items-center rounded-xl border px-4 py-3 sm:grid-cols-[1fr_120px_160px_60px] ${
                    error
                      ? "border-red-200 bg-red-50/30"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {/* Column 1: file icon + name */}
                  <div className="flex min-w-0 items-center gap-3">
                    {isPdf && (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[10px] font-bold text-red-500">
                        PDF
                      </span>
                    )}
                    {isWord && (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                        W
                      </span>
                    )}
                    {!isPdf && !isWord && (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <FileTextIcon className="h-4 w-4" />
                      </span>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">
                        {file.name}
                      </p>
                      <p className="text-[11px] uppercase text-slate-400">
                        {extension}
                      </p>
                    </div>
                  </div>

                  {/* Column 2: size */}
                  <span className="text-[13px] text-slate-600">
                    {formatFileSize(file.size)}
                  </span>

                  {/* Column 3: status */}
                  <span>
                    {error ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600">
                        <AlertIcon className="h-3 w-3" />
                        {error}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                        <CheckIcon className="h-3 w-3" />
                        Uploaded
                      </span>
                    )}
                  </span>

                  {/* Column 4: remove button */}
                  <button
                    type="button"
                    onClick={() => onRemove(id)}
                    aria-label={`Remove ${file.name}`}
                    className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
