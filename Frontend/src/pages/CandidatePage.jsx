import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Hourglass } from "lucide-react";
import { BackLink, PageContainer } from "../components/layout/PageHeader";
import CandidateHero from "../components/candidate/CandidateHero";
import SectionCard from "../components/candidate/SectionCard";
import AiSummary from "../components/candidate/AiSummary";
import ResumePreview from "../components/candidate/ResumePreview";
import FailedCard from "../components/results/FailedCard";
import Card from "../components/ui/Card";
import { buttonClasses, ButtonLink } from "../components/ui/Button";
import { PageSpinner } from "../components/ui/Spinner";
import EmptyState, { ErrorState } from "../components/ui/EmptyState";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services";
import { SECTION_KEYS } from "../lib/constants";
import { sectionWeight } from "../lib/candidate";
import { nameFromFilename } from "../lib/files";

function StepLink({ to, children }) {
  return to ? (
    <Link to={to} className={buttonClasses("secondary", "xs")}>
      {children}
    </Link>
  ) : (
    <span className={`${buttonClasses("secondary", "xs")} opacity-40`} aria-disabled="true">
      {children}
    </span>
  );
}

// P5 — one candidate: section scores, AI summary, resume preview
export default function CandidatePage() {
  const { jobId, resumeId } = useParams();
  const resultsUrl = `/analyze/${jobId}/results`;

  const { data, error, loading } = useAsync(async () => {
    const [detail, job] = await Promise.all([
      api.getResume(jobId, resumeId),
      api.getAnalysis(jobId).catch(() => null), // only needed for Prev / Next
    ]);
    return { detail, job };
  }, [jobId, resumeId]);

  // keep showing the previous candidate while the next one loads
  if (loading && !data) return <PageSpinner label="Loading candidate…" />;

  if (!data || data.detail.resume_id !== resumeId) {
    if (loading) return <PageSpinner label="Loading candidate…" />;
    return (
      <PageContainer>
        <BackLink to={resultsUrl}>Back to results</BackLink>
        <Card className="mt-4">
          <ErrorState error={error} notFoundTitle="Candidate not found" action={<ButtonLink to={resultsUrl}>Back to results</ButtonLink>} />
        </Card>
      </PageContainer>
    );
  }

  const { detail, job } = data;
  const name = detail.candidate_name || nameFromFilename(detail.original_filename);
  const base = `/analyze/${jobId}/resumes`;

  const ranked = (job?.resumes || []).filter((r) => r.status === "done").sort((a, b) => (a.rank ?? 1e9) - (b.rank ?? 1e9));
  const index = ranked.findIndex((r) => r.resume_id === resumeId);
  const prev = index > 0 ? ranked[index - 1] : null;
  const next = index >= 0 && index < ranked.length - 1 ? ranked[index + 1] : null;

  const header = (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <BackLink to={resultsUrl}>Back to results</BackLink>
      {ranked.length > 1 && index >= 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <StepLink to={prev && `${base}/${prev.resume_id}`}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </StepLink>
          <span className="tabular-nums">
            {index + 1} of {ranked.length}
          </span>
          <StepLink to={next && `${base}/${next.resume_id}`}>
            Next <ChevronRight className="h-4 w-4" />
          </StepLink>
        </div>
      )}
    </div>
  );

  if (detail.status !== "done") {
    return (
      <PageContainer>
        {header}
        {detail.status === "failed" ? (
          <FailedCard resume={detail} />
        ) : (
          <Card>
            <EmptyState
              icon={Hourglass}
              title={`${name} is still being scored`}
              description="Results appear here as soon as scoring finishes."
              action={<ButtonLink to={`/analyze/${jobId}/progress`}>Watch progress</ButtonLink>}
            />
          </Card>
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {header}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-5">
          <CandidateHero detail={detail} name={name} reportUrl={`${base}/${resumeId}/report`} />
          <div className="grid gap-5 md:grid-cols-2">
            {SECTION_KEYS.map((k) => {
              const { weight, points } = sectionWeight(detail, k, job?.section_weights);
              return <SectionCard key={k} sectionKey={k} section={detail.sections?.[k]} weight={weight} points={points} />;
            })}
          </div>
          <AiSummary detail={detail} />
        </div>
        <div className="xl:sticky xl:top-24 xl:self-start">
          <ResumePreview text={detail.extracted_text} sections={detail.sections} filename={detail.original_filename} />
        </div>
      </div>
    </PageContainer>
  );
}
