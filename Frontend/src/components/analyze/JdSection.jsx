import { useState } from "react";
import { X } from "lucide-react";
import StepCard from "./StepCard";
import Dropzone from "../ui/Dropzone";
import Input, { fieldClasses } from "../ui/Input";
import FileIcon from "../ui/FileIcon";
import { useAnalysisDraft } from "../../hooks/useAnalysisDraft";
import { formatSize, validateFiles } from "../../lib/files";
import { MAX_FILE_MB } from "../../lib/constants";

export default function JdSection() {
  const { jdTitle, setJdTitle, jdText, setJdText, jdFile, setJdFile, jdReady } = useAnalysisDraft();
  const [errors, setErrors] = useState([]);

  const handleFiles = (files) => {
    const { accepted, errors: errs } = validateFiles(files);
    setErrors(errs);
    if (accepted[0]) setJdFile(accepted[0]);
  };

  return (
    <StepCard
      number="1"
      title="Job description"
      description="Paste the JD text or upload a file — either one is enough."
      badge={jdReady ? "JD added" : null}
    >
      <Input
        id="jd-title"
        label="Job title (optional)"
        placeholder="e.g. Senior Frontend Engineer"
        value={jdTitle}
        onChange={(e) => setJdTitle(e.target.value)}
        maxLength={120}
        hint="Shown on the ranking and history pages. If empty, we use the first line of the JD."
        className="mb-5 max-w-xl"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="jd-text" className="text-sm font-medium text-gray-900">
              Paste job description
            </label>
            <span className="text-xs text-gray-400">{jdText.length.toLocaleString()} characters</span>
          </div>
          <textarea
            id="jd-text"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder={"Senior Frontend Engineer — Northwind Labs\n\nRequirements:\n• 5+ years with React and TypeScript\n• …"}
            className={`thin-scroll h-52 resize-y p-3.5 leading-relaxed ${fieldClasses(false)}`}
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-900">Or upload JD file</p>
          <Dropzone
            multiple={false}
            onFiles={handleFiles}
            error={errors.length > 0}
            title="Drag & drop JD file"
            hint={`PDF, DOCX, DOC, TXT, RTF up to ${MAX_FILE_MB} MB`}
            className="border-green-300 bg-mint-50/40 hover:border-strong hover:bg-mint-50"
          />
          {jdFile && (
            <div className="mt-3 inline-flex max-w-full items-center gap-2.5 rounded-lg border border-gray-200 bg-white py-1.5 pr-2 pl-2">
              <FileIcon name={jdFile.name} className="h-7 w-7" />
              <span className="truncate text-sm font-medium text-gray-900">{jdFile.name}</span>
              <span className="shrink-0 text-xs text-gray-400">{formatSize(jdFile.size)}</span>
              <button
                type="button"
                onClick={() => setJdFile(null)}
                aria-label={`Remove ${jdFile.name}`}
                className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {errors.map((m) => (
            <p key={m} className="mt-2 text-xs text-red-600">
              {m}
            </p>
          ))}
        </div>
      </div>
    </StepCard>
  );
}
