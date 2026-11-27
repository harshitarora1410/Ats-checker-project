import { createContext, useCallback, useMemo, useState } from "react";
import { createAnalysisApi } from "../api/analysesApi";
import { getErrorMessage } from "../utils/errors";

// Holds the JD + resumes the user picked on the main page.
// File objects can't go in localStorage, so they live here in memory.
// This is what lets the files survive the "go to login, then come back" step.
// eslint-disable-next-line react-refresh/only-export-components
export const AnalysisDraftContext = createContext(null);

export function AnalysisDraftProvider({ children }) {
  const [jdTitle, setJdTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState(null);
  const [resumes, setResumes] = useState([]);

  // true when a logged-out user pressed "Score Resumes" -> submit right after login
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const clearDraft = useCallback(() => {
    setJdTitle("");
    setJdText("");
    setJdFile(null);
    setResumes([]);
    setSubmitError("");
  }, []);

  // returns the job_id, throws on failure
  const submitAnalysis = useCallback(async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const data = await createAnalysisApi({ jdTitle, jdText, jdFile, resumes });
      clearDraft();
      return data.job_id;
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Could not start the analysis"));
      throw err;
    } finally {
      setPendingSubmit(false);
      setSubmitting(false);
    }
  }, [jdTitle, jdText, jdFile, resumes, clearDraft]);

  const value = useMemo(
    () => ({
      jdTitle, setJdTitle,
      jdText, setJdText,
      jdFile, setJdFile,
      resumes, setResumes,
      pendingSubmit, setPendingSubmit,
      submitting, submitError, setSubmitError,
      clearDraft, submitAnalysis,
    }),
    [jdTitle, jdText, jdFile, resumes, pendingSubmit, submitting, submitError, clearDraft, submitAnalysis]
  );

  return <AnalysisDraftContext.Provider value={value}>{children}</AnalysisDraftContext.Provider>;
}
