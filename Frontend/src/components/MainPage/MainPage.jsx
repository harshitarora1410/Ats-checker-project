import { useState } from "react";
import JobDescriptionCard from "./JobDescriptionCard";
import ResumesCard from "./ResumeCard";
import { CheckIcon, WandIcon } from "./icons";
import {
  ALLOWED_JD_TYPES,
  ALLOWED_RESUME_TYPES,
  MAX_JD_SIZE_MB,
  MAX_RESUMES,
  getFileError,
} from "./fileUtils";

// The "Score resumes against a job" page (everything except the navbar).
//
//   MainPage.jsx            <- this file: state, page header, bottom action bar
//   JobDescriptionCard.jsx  <- step 1 card
//   ResumesCard.jsx         <- step 2 card
//
// Usage:  <MainPage onScore={({ jdText, jdFile, resumes }) => { ... }} />

export default function MainPage({ onScore }) {
  /* ------------------------------ State ------------------------------ */
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState(null); // { file, error } or null
  const [resumes, setResumes] = useState([]); // [{ id, file, error }]

  /* ------------------------- Derived values -------------------------- */
  const validResumes = resumes.filter((resume) => !resume.error);
  const jdFileIsValid = jdFile !== null && !jdFile.error;

  const hasJobDescription = jdText.trim() !== "" || jdFileIsValid;
  const hasResumes = validResumes.length > 0;
  const canScore = hasJobDescription && hasResumes;

  // Used by the progress steps at the top
  const steps = [
    { label: "Job description", done: hasJobDescription },
    { label: "Resumes", done: hasResumes },
    { label: "Score", done: false },
  ];

  // Used by the checklist in the bottom bar
  const checklist = [
    {
      done: hasJobDescription,
      text: hasJobDescription
        ? "Job description added"
        : "Job description needed",
    },
    {
      done: hasResumes,
      text: hasResumes
        ? `${validResumes.length} ${validResumes.length === 1 ? "resume" : "resumes"} ready`
        : "Resumes needed",
    },
  ];

  /* ------------------------------ Handlers --------------------------- */
  function handleJdFileSelect(files) {
    const file = files[0];
    if (!file) return;

    const error = getFileError(file, ALLOWED_JD_TYPES, MAX_JD_SIZE_MB);
    setJdFile({ file, error });
  }

  function handleResumeFilesSelect(files) {
    const spaceLeft = MAX_RESUMES - resumes.length;

    const newResumes = files.slice(0, spaceLeft).map((file) => ({
      id: crypto.randomUUID(),
      file,
      error: getFileError(file, ALLOWED_RESUME_TYPES),
    }));

    setResumes([...resumes, ...newResumes]);
  }

  function handleResumeRemove(id) {
    setResumes(resumes.filter((resume) => resume.id !== id));
  }

  function handleClearAll() {
    setJdText("");
    setJdFile(null);
    setResumes([]);
  }

  function handleScore() {
    onScore?.({
      jdText,
      jdFile: jdFileIsValid ? jdFile.file : null,
      resumes: validResumes.map((resume) => resume.file),
    });
  }

  /* ------------------------------- UI -------------------------------- */
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {/* ===================== Page header ===================== */}
      <div className="bg-gradient-to-b from-emerald-50 to-slate-100">
        <div className="mx-auto flex max-w-[1000px] flex-col gap-6 px-6 pb-12 pt-10 lg:flex-row lg:items-start lg:justify-between">
          {/* Title */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
              New analysis
            </p>
            <h1 className="mt-2 text-[26px] font-bold tracking-tight">
              Score resumes against a job
            </h1>
            <p className="mt-2 max-w-md text-[13px] text-slate-500">
              Add a job description, upload candidate resumes and we'll rank
              every applicant by fit.
            </p>
          </div>

          {/* Progress steps */}
          <ol className="flex items-center gap-3 lg:pt-10">
            {steps.map((step, index) => (
              <li key={step.label} className="flex items-center gap-3">
                {step.done ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-400">
                    {index + 1}
                  </span>
                )}

                <span
                  className={`text-[13px] font-medium ${
                    step.done ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>

                {/* Line between steps (not after the last one) */}
                {index < steps.length - 1 && (
                  <span
                    className={`hidden h-px w-14 sm:block ${
                      step.done ? "bg-emerald-400" : "bg-slate-200"
                    }`}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ===================== Cards ===================== */}
      <main className="mx-auto flex max-w-[1000px] flex-col gap-8 px-6 pb-40">
        <JobDescriptionCard
          jdText={jdText}
          jdFile={jdFile}
          hasJobDescription={hasJobDescription}
          onTextChange={setJdText}
          onFileSelect={handleJdFileSelect}
          onFileRemove={() => setJdFile(null)}
        />

        <ResumesCard
          resumes={resumes}
          onFilesSelect={handleResumeFilesSelect}
          onRemove={handleResumeRemove}
        />
      </main>

      {/* ===================== Sticky bottom bar ===================== */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-3 px-6 py-4">
          {/* Checklist */}
          <div className="flex flex-wrap items-center gap-5 text-[13px] font-medium">
            {checklist.map((item) => (
              <span key={item.text} className="inline-flex items-center gap-2">
                <span
                  className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-white ${
                    item.done ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <CheckIcon className="h-3 w-3" />
                </span>
                <span
                  className={item.done ? "text-slate-700" : "text-slate-400"}
                >
                  {item.text}
                </span>
              </span>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear all
            </button>

            <button
              type="button"
              onClick={handleScore}
              disabled={!canScore}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <WandIcon className="h-4 w-4" />
              Score Resumes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
