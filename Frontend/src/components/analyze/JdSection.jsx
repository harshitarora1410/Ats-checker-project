import { useState } from "react";
import { FileText, X } from "lucide-react";
import Dropzone from "./Dropzone";
import Input from "../common/Input";
import { useAnalysisDraft } from "../../hooks/useAnalysisDraft";
import { formatSize, rejectionMessages } from "../../utils/files";

export default function JdSection() {
  const { jdTitle, setJdTitle, jdText, setJdText, jdFile, setJdFile } = useAnalysisDraft();
  const [messages, setMessages] = useState([]);

  const handleFile = (accepted, rejected) => {
    setMessages(rejectionMessages(rejected));
    if (accepted[0]) setJdFile(accepted[0]);
  };

  const ready = jdText.trim() || jdFile;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-600">
            1
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Job description</h2>
            <p className="text-sm text-gray-500">Paste the JD text or upload a file. Either one is enough.</p>
          </div>
        </div>
        {ready && (
          <span className="shrink-0 rounded-full bg-mint-50 px-2.5 py-1 text-xs font-semibold text-strong">
            JD added
          </span>
        )}
      </div>

      <Input
        id="jd-title"
        label="Job title (optional)"
        placeholder="Senior Frontend Engineer"
        value={jdTitle}
        onChange={(e) => setJdTitle(e.target.value)}
        className="mb-5"
        maxLength={120}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="jd-text" className="text-sm font-medium text-gray-900">
              Paste job description
            </label>
            <span className="text-xs text-gray-400">{jdText.length} characters</span>
          </div>
          <textarea
            id="jd-text"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste job description…"
            className="h-52 w-full resize-none rounded-xl border border-gray-300 bg-white p-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-600/15"
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-900">Or upload JD file</p>
          <Dropzone
            multiple={false}
            compact
            onFiles={handleFile}
            title="Drag & drop JD file"
            hint="PDF, DOCX, DOC, TXT, RTF up to 5 MB"
          />
          {jdFile && (
            <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
              <FileText className="h-4 w-4 shrink-0 text-red-500" />
              <span className="truncate text-sm font-medium">{jdFile.name}</span>
              <span className="shrink-0 text-xs text-gray-400">{formatSize(jdFile.size)}</span>
              <button onClick={() => setJdFile(null)} aria-label="Remove JD file" className="text-gray-400 hover:text-gray-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {messages.map((m) => (
            <p key={m} className="mt-2 text-xs text-red-600">{m}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
