import api from "./axios";

// POST /api/analyses  (multipart/form-data) -> { job_id, status, total_resumes }
export const createAnalysisApi = ({ jdTitle, jdText, jdFile, resumes, sectionWeights, provider }) => {
  const formData = new FormData();
  if (jdTitle?.trim()) formData.append("jd_title", jdTitle.trim());
  if (jdText?.trim()) formData.append("jd_text", jdText.trim());
  if (jdFile) formData.append("jd_file", jdFile);
  if (sectionWeights) formData.append("section_weights", JSON.stringify(sectionWeights));
  if (provider) formData.append("provider", provider);
  resumes.forEach((file) => formData.append("resumes", file));
  // don't set Content-Type: the browser adds the multipart boundary itself
  return api.post("/analyses", formData).then((r) => r.data);
};

// for the teammates' pages (progress, results, detail, history)
export const getAnalysisApi = (jobId) => api.get(`/analyses/${jobId}`).then((r) => r.data);

export const getResumeApi = (jobId, resumeId) =>
  api.get(`/analyses/${jobId}/resumes/${resumeId}`).then((r) => r.data);

export const listAnalysesApi = (params) => api.get("/analyses", { params }).then((r) => r.data);
