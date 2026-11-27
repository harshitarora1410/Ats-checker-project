import { useLocation, useNavigate } from "react-router-dom";
import JdSection from "../components/analyze/JdSection";
import ResumeSection from "../components/analyze/ResumeSection";
import ActionBar from "../components/analyze/ActionBar";
import StepIndicator from "../components/analyze/StepIndicator";
import Alert from "../components/ui/Alert";
import PageHeader, { PageContainer } from "../components/layout/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { useAnalysisDraft } from "../hooks/useAnalysisDraft";
import { authUrl } from "../lib/intent";
import { loadSettings } from "../lib/settingsStore";

// P1 — public main page: JD + resumes -> "Score Resumes"
export default function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { jdReady, isReady, resumes, clearDraft, submit, submitting, submitError, setSubmitError } = useAnalysisDraft();

  const notice = location.state?.notice;

  const handleScore = async () => {
    if (!isReady) return;

    // Guest: login first. The draft stays in memory and is submitted right after login.
    if (!isAuthenticated) {
      navigate(authUrl("login", { intent: "score" }));
      return;
    }

    const { provider, weights } = loadSettings(user.id);
    try {
      const jobId = await submit({ provider, sectionWeights: weights });
      navigate(`/analyze/${jobId}/progress`);
    } catch {
      // submitError is shown above the cards
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <PageContainer className="pb-36">
      <PageHeader
        eyebrow="New analysis"
        title="Score resumes against a job"
        description="Add a job description, upload candidate resumes and we'll rank every applicant by fit."
        actions={
          <StepIndicator
            steps={[
              { label: "Job description", done: jdReady },
              { label: "Resumes", done: resumes.length > 0 },
              { label: "Score", done: false },
            ]}
          />
        }
      />

      {notice && (
        <Alert tone="info" className="mb-5">
          {notice}
        </Alert>
      )}
      {submitError && (
        <Alert
          className="mb-5"
          title="Could not start the analysis"
          action={
            <button className="text-xs font-semibold underline" onClick={() => setSubmitError("")}>
              Dismiss
            </button>
          }
        >
          {submitError}
        </Alert>
      )}

      <div className="space-y-6">
        <JdSection />
        <ResumeSection />
      </div>

      <ActionBar
        jdReady={jdReady}
        resumeCount={resumes.length}
        onClear={clearDraft}
        onScore={handleScore}
        loading={submitting}
        isGuest={!isAuthenticated}
      />
    </PageContainer>
  );
}
