export const getErrorMessage = (err, fallback = "Something went wrong") => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", "); // FastAPI 422
  if (err?.code === "ERR_NETWORK") return "Cannot reach the server. Is the backend running?";
  return fallback;
};
