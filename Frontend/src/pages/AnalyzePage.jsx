import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import JdSection from "../components/analyze/JdSection";
import ResumeSection from "../components/analyze/ResumeSection";
import ActionBar from "../components/analyze/ActionBar";
import Alert from "../components/common/Alert";
import { useAuth } from "../hooks/useAuth";
import { useAnalysisDraft } from "../hooks/useAnalysisDraft";

export default function AnalyzePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    jdText, jdFile, resumes,
    clearDraft, setPendingSubmit,
    submitAnalysis, submitting, submitError,
  } = useAnalysisDraft();

  const jdReady = jdText.trim().length > 0 || !!jdFile;
  const canScore = jdReady && resumes.length > 0;

  // coming back to this page cancels any old "submit after login"
  useEffect(() => {
    setPendingSubmit(false);
  }, [setPendingSubmit]);

  const handleScore = async () => {
    if (!canScore) return;

    // logged out -> go to login; the draft stays in context and is sent after login
    if (!isAuthenticated) {
      setPendingSubmit(true);
      navigate("/login");
      return;
    }

    try {
      const jobId = await submitAnalysis();
      navigate(`/analyze/${jobId}/progress`);
    } catch {
      // submitError is shown below
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-6">
      <p className="text-xs font-semibold tracking-wide text-strong uppercase">New analysis</p>
      <h1 className="mt-1 text-[28px] font-bold text-gray-900">Score resumes against a job</h1>
      <p className="mt-1.5 mb-6 text-sm text-gray-500">
        Add a job description, upload candidate resumes and we&apos;ll rank every applicant by fit.
      </p>

      {submitError && <Alert className="mb-5">{submitError}</Alert>}

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
      />
    </div>
  );
}
