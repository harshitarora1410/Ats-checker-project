import { createContext, useCallback, useMemo, useState } from "react";
import { api } from "../services";
import { getErrorMessage } from "../lib/errors";

// The JD + resumes picked on the main page (P1).
// File objects can't be saved to localStorage, so they live here in memory —
// that is what lets them survive the "Score Resumes -> login -> back" round trip.
// eslint-disable-next-line react-refresh/only-export-components
export const AnalysisDraftContext = createContext(null);

// "Senior Frontend Engineer — Northwind Labs\n..." -> "Senior Frontend Engineer"
const titleFromText = (text = "") => {
  const first = text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s•*#-]+/, "").trim())
    .find(Boolean);
  if (!first) return "";
  const head = first.split(/\s[—–|]\s|\s-\s/)[0].trim();
  return head.length <= 80 ? head : "";
};

const titleFromFile = (file) =>
  file ? file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\b(jd|job description)\b/gi, "").trim() : "";

export function AnalysisDraftProvider({ children }) {
  const [jdTitle, setJdTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const jdReady = jdText.trim().length > 0 || !!jdFile;
  const isReady = jdReady && resumes.length > 0;

  const clearDraft = useCallback(() => {
    setJdTitle("");
    setJdText("");
    setJdFile(null);
    setResumes([]);
    setSubmitError("");
  }, []);

  // Creates the analysis and returns its job_id. Throws on failure (message in submitError).
  const submit = useCallback(
    async ({ provider, sectionWeights } = {}) => {
      setSubmitting(true);
      setSubmitError("");
      try {
        const title = jdTitle.trim() || titleFromText(jdText) || titleFromFile(jdFile);
        // 202 { job_id, status, total_resumes }; status may already be "failed"
        // if every resume failed text extraction — the analyzing page explains that
        const data = await api.createAnalysis({ jdTitle: title, jdText, jdFile, resumes, provider, sectionWeights });
        clearDraft();
        return data.job_id;
      } catch (err) {
        setSubmitError(getErrorMessage(err, "Could not start the analysis"));
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [jdTitle, jdText, jdFile, resumes, clearDraft]
  );

  const value = useMemo(
    () => ({
      jdTitle, setJdTitle,
      jdText, setJdText,
      jdFile, setJdFile,
      resumes, setResumes,
      jdReady, isReady,
      submitting, submitError, setSubmitError,
      clearDraft, submit,
    }),
    [jdTitle, jdText, jdFile, resumes, jdReady, isReady, submitting, submitError, clearDraft, submit]
  );

  return <AnalysisDraftContext.Provider value={value}>{children}</AnalysisDraftContext.Provider>;
}
