import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Briefcase, CircleCheck, Clock, History, TriangleAlert, WandSparkles } from "lucide-react";
import { PageContainer } from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import ProgressBar from "../components/ui/ProgressBar";
import FileIcon from "../components/ui/FileIcon";
import { ButtonLink } from "../components/ui/Button";
import { ModelBadge, StatusBadge } from "../components/ui/Badge";
import { PageSpinner } from "../components/ui/Spinner";
import { ErrorState } from "../components/ui/EmptyState";
import { useJobPolling } from "../hooks/useJobPolling";
import { nameFromFilename } from "../lib/files";
import { pluralize } from "../lib/format";

const STAT_TONES = {
  done: "border-green-200 bg-mint-50 text-strong",
  processing: "border-primary-100 bg-primary-50 text-primary-600",
  waiting: "border-gray-200 bg-gray-50 text-gray-600",
  failed: "border-red-200 bg-red-50 text-weak",
};

function Stat({ tone, label, value }) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${STAT_TONES[tone]}`}>
      <p className="text-xs font-semibold">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

const etaText = (job) => {
  const p = job.progress;
  const finished = p.done_count + p.failed_count;
  const remaining = job.total_resumes - finished;
  if (!remaining) return null;
  if (!finished) return "Estimating time…";
  const elapsed = Math.max(1, (Date.now() - Date.parse(job.created_at)) / 1000);
  const secs = Math.round((elapsed / finished) * remaining);
  return secs < 60 ? `About ${Math.max(5, Math.ceil(secs / 5) * 5)} sec left` : `About ${Math.ceil(secs / 60)} min left`;
};

// P3 — live progress. Polls every 2.5 s, opens the ranking (P4) when done.
export default function AnalyzingPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { job, error, loading } = useJobPolling(jobId);
  const status = job?.status;

  useEffect(() => {
    if (status !== "done") return;
    const t = setTimeout(() => navigate(`/analyze/${jobId}/results`, { replace: true }), 900);
    return () => clearTimeout(t);
  }, [status, jobId, navigate]);

  if (loading) return <PageSpinner label="Loading analysis…" />;

  if (!job) {
    return (
      <PageContainer className="max-w-3xl">
        <Card>
          <ErrorState error={error} notFoundTitle="Analysis not found" action={<ButtonLink to="/">Start new analysis</ButtonLink>} />
        </Card>
      </PageContainer>
    );
  }

  const p = job.progress || {};
  const total = job.total_resumes || job.resumes?.length || 0;
  const finished = (p.done_count || 0) + (p.failed_count || 0);
  const current = Math.min(total, finished + Math.max(1, p.processing_count || 0));
  const waiting = p.pending_count || 0;

  const heading = {
    queued: "Getting ready to analyze…",
    processing: `Analyzing ${current} of ${pluralize(total, "resume")}…`,
    done: "All done — opening results…",
    failed: "We couldn't score these resumes",
  }[status];

  const failedAll = status === "failed";

  return (
    <PageContainer className="max-w-3xl">
      {error && (
        <Alert tone="warning" className="mb-4">
          Connection problem — retrying… ({error.message})
        </Alert>
      )}

      <Card className="px-5 py-8 shadow-sm sm:px-8">
        <div className="flex flex-col items-center text-center">
          <span
            className={`flex h-20 w-20 items-center justify-center rounded-full ring-8 ${
              failedAll ? "bg-red-50 text-weak ring-red-50/60" : "bg-linear-to-br from-mint-500 to-strong text-white ring-mint-100"
            }`}
          >
            {failedAll ? (
              <TriangleAlert className="h-8 w-8" />
            ) : status === "done" ? (
              <CircleCheck className="h-8 w-8" />
            ) : (
              <WandSparkles className="h-8 w-8 animate-pulse" />
            )}
          </span>
          {job.jd_title && (
            <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              <Briefcase className="h-3.5 w-3.5" /> {job.jd_title}
            </span>
          )}
          <h1 className="mt-3 text-2xl font-bold text-gray-900">{heading}</h1>
          <p className="mt-1.5 max-w-md text-sm text-gray-500">
            {failedAll
              ? "None of the files had readable text. Upload text-based PDF or DOCX resumes and try again."
              : "Matching skills, experience, education and certifications against the job description."}
          </p>
        </div>

        {!failedAll && (
          <>
            <div className="mt-7 mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-900">{p.progress_percent ?? 0}% complete</span>
              {status !== "done" && (
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="h-4 w-4" /> {etaText(job) || "Finishing…"}
                </span>
              )}
            </div>
            <ProgressBar value={p.progress_percent} height="h-3" tone={status === "done" ? "strong" : "primary"} label="Overall progress" />

            <div className={`mt-5 grid gap-3 ${p.failed_count ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
              <Stat tone="done" label="Done" value={p.done_count ?? 0} />
              <Stat tone="processing" label="Analyzing" value={p.processing_count ?? 0} />
              <Stat tone="waiting" label="Waiting" value={waiting} />
              {p.failed_count > 0 && <Stat tone="failed" label="Failed" value={p.failed_count} />}
            </div>
          </>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {job.model_used && <ModelBadge model={job.model_used} prefix="AI model: " />}
            {failedAll ? "" : "You can leave this page — the analysis keeps running and stays in History."}
          </div>
          {failedAll ? (
            <ButtonLink to="/" size="sm">
              Start new analysis
            </ButtonLink>
          ) : (
            <ButtonLink to="/history" variant="secondary" size="sm">
              <History className="h-4 w-4" /> Continue in background
            </ButtonLink>
          )}
        </div>
      </Card>

      <Card className="mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <h2 className="text-sm font-bold text-gray-900">Resume queue</h2>
          <span className="text-xs text-gray-500">{pluralize(total, "file")}</span>
        </div>
        <ol className="divide-y divide-gray-100">
          {(job.resumes || []).map((r, i) => (
            <li key={r.resume_id} className={`flex items-center gap-3 px-5 py-3 ${r.status === "processing" ? "bg-primary-50/40" : ""}`}>
              <span className="w-6 text-xs text-gray-400 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <FileIcon name={r.original_filename} className="h-8 w-8" />
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${r.status === "pending" ? "text-gray-500" : "text-gray-900"}`}>
                  {r.candidate_name || nameFromFilename(r.original_filename)}
                </p>
                <p className="truncate text-xs text-gray-500">{r.original_filename}</p>
                {r.status === "failed" && r.error_message && <p className="mt-0.5 text-xs text-weak">{r.error_message}</p>}
              </div>
              {r.status === "processing" && <span className="hidden text-xs font-medium text-primary-600 sm:block">Scoring…</span>}
              {r.status === "done" && r.overall_score != null && (
                <span className="hidden text-xs font-semibold text-gray-600 tabular-nums sm:block">{Math.round(r.overall_score)}/100</span>
              )}
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ol>
      </Card>
    </PageContainer>
  );
}
