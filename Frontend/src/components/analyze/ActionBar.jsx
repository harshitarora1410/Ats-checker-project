import { CircleCheck, Lock, WandSparkles } from "lucide-react";
import Button from "../ui/Button";

function Status({ ok, children }) {
  return (
    <span className={`flex items-center gap-1.5 text-sm font-medium ${ok ? "text-gray-800" : "text-gray-400"}`}>
      <CircleCheck className={`h-4 w-4 ${ok ? "text-strong" : "text-gray-300"}`} />
      {children}
    </span>
  );
}

// Sticky bottom bar on P1
export default function ActionBar({ jdReady, resumeCount, onClear, onScore, loading, isGuest }) {
  const canScore = jdReady && resumeCount > 0;
  const hasAnything = jdReady || resumeCount > 0;
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <Status ok={jdReady}>{jdReady ? "Job description added" : "Add a job description"}</Status>
          <Status ok={resumeCount > 0}>
            {resumeCount > 0 ? `${resumeCount} resume${resumeCount > 1 ? "s" : ""} ready` : "Add resumes"}
          </Status>
          {isGuest && canScore && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Lock className="h-3.5 w-3.5" /> You'll sign in first — your files stay here
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClear} disabled={loading || !hasAnything}>
            Clear all
          </Button>
          <Button size="sm" onClick={onScore} disabled={!canScore} loading={loading}>
            {!loading && <WandSparkles className="h-4 w-4" />}
            {loading ? "Starting…" : "Score Resumes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
