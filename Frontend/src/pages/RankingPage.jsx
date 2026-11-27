import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, ClipboardList, Plus, Users } from "lucide-react";
import { BackLink, PageContainer } from "../components/layout/PageHeader";
import StatCards from "../components/results/StatCards";
import ResultsToolbar from "../components/results/ResultsToolbar";
import CandidateCard from "../components/results/CandidateCard";
import FailedCard from "../components/results/FailedCard";
import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import { ButtonLink } from "../components/ui/Button";
import { ModelBadge } from "../components/ui/Badge";
import { PageSpinner } from "../components/ui/Spinner";
import EmptyState, { ErrorState } from "../components/ui/EmptyState";
import { useJobPolling } from "../hooks/useJobPolling";
import { ACTIVE_JOB_STATUSES, SECTION_KEYS } from "../lib/constants";
import { nameFromFilename } from "../lib/files";
import { fileSafe, formatDateTime, pluralize } from "../lib/format";

const displayName = (r) => r.candidate_name || nameFromFilename(r.original_filename);

const csvCell = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function exportCsv(job) {
  const header = ["Rank", "Candidate", "File", "Overall score", "Verdict", ...SECTION_KEYS.map((k) => `${k} score`), "Status", "Error"];
  const rows = job.resumes.map((r) => [
    r.rank,
    displayName(r),
    r.original_filename,
    r.overall_score,
    r.verdict,
    ...SECTION_KEYS.map((k) => r.sections?.[k]?.score),
    r.status,
    r.error_message,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `${fileSafe(job.jd_title || "analysis")}_ranking.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

// P4 — ranked candidates. History "Open" lands here directly.
export default function RankingPage() {
  const { jobId } = useParams();
  const { job, error, loading } = useJobPolling(jobId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("score");

  const scored = useMemo(() => (job?.resumes || []).filter((r) => r.status === "done"), [job]);
  const failed = useMemo(() => (job?.resumes || []).filter((r) => r.status === "failed"), [job]);

  const counts = useMemo(() => {
    const by = (v) => scored.filter((r) => r.verdict === v).length;
    return { all: scored.length, strong: by("strong"), moderate: by("moderate"), weak: by("weak"), failed: failed.length };
  }, [scored, failed]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = scored.filter(
      (r) =>
        (filter === "all" || r.verdict === filter) &&
        (!q || displayName(r).toLowerCase().includes(q) || r.original_filename.toLowerCase().includes(q))
    );
    return sort === "name"
      ? [...list].sort((a, b) => displayName(a).localeCompare(displayName(b)))
      : [...list].sort((a, b) => (a.rank ?? 1e9) - (b.rank ?? 1e9));
  }, [scored, query, filter, sort]);

  if (loading) return <PageSpinner label="Loading results…" />;

  if (!job) {
    return (
      <PageContainer>
        <Card>
          <ErrorState error={error} notFoundTitle="Analysis not found" action={<ButtonLink to="/history">Back to History</ButtonLink>} />
        </Card>
      </PageContainer>
    );
  }

  const running = ACTIVE_JOB_STATUSES.includes(job.status);
  const p = job.progress || {};
  const showFailed = filter === "all" && !query.trim();

  return (
    <PageContainer>
      <BackLink to="/">New analysis</BackLink>

      <div className="mt-3 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] leading-tight font-bold text-gray-900">{job.jd_title || "Untitled role"}</h1>
            {job.model_used && <ModelBadge model={job.model_used} prefix="Scored with " />}
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <strong className="font-semibold text-gray-800">{pluralize(job.total_resumes, "resume")}</strong> {running ? "uploaded" : "scored"}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> {formatDateTime(job.created_at)}
            </span>
          </p>
        </div>
        <ButtonLink to="/" variant="secondary" size="sm">
          <Plus className="h-4 w-4" /> New analysis
        </ButtonLink>
      </div>

      {running && (
        <Alert tone="info" className="mb-4" title="Still analyzing">
          {p.done_count ?? 0} of {job.total_resumes} done — this page updates automatically.{" "}
          <Link to={`/analyze/${jobId}/progress`} className="font-semibold underline">
            Watch progress
          </Link>
        </Alert>
      )}
      {error && (
        <Alert tone="warning" className="mb-4">
          Connection problem — retrying… ({error.message})
        </Alert>
      )}
      {p.has_partial_failures && !running && (
        <Alert tone="warning" className="mb-4">
          {pluralize(failed.length, "resume")} could not be read and {failed.length > 1 ? "were" : "was"} not scored. The other results are below.
        </Alert>
      )}

      <StatCards progress={p} counts={counts} />

      {scored.length === 0 && !running ? (
        <Card className="mt-6 border-dashed">
          <EmptyState
            icon={ClipboardList}
            title="No results yet"
            description="None of the resumes in this analysis could be scored. Add a job description and upload text-based resumes to see candidates ranked by fit."
            action={
              <ButtonLink to="/" size="sm">
                <Plus className="h-4 w-4" /> Start new analysis
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <>
          <div className="mt-6">
            <ResultsToolbar
              query={query}
              onQuery={setQuery}
              filter={filter}
              onFilter={setFilter}
              sort={sort}
              onSort={setSort}
              counts={counts}
              onExport={() => exportCsv(job)}
              exportDisabled={!scored.length}
            />
          </div>

          <div className="mt-4 space-y-3">
            {visible.map((r) => (
              <CandidateCard key={r.resume_id} jobId={jobId} resume={r} />
            ))}
            {visible.length === 0 && scored.length > 0 && (
              <Card>
                <EmptyState title="No candidates match" description="Try a different name or verdict filter." />
              </Card>
            )}
            {running && scored.length === 0 && (
              <Card>
                <EmptyState icon={ClipboardList} title="Scoring in progress" description="Ranked candidates appear here as soon as they are scored." />
              </Card>
            )}
            {showFailed && failed.map((r) => <FailedCard key={r.resume_id} resume={r} />)}
          </div>
        </>
      )}

      <p className="mt-8 text-xs text-gray-400">Scores are AI-assisted recommendations. Always review candidates before making hiring decisions.</p>
    </PageContainer>
  );
}
