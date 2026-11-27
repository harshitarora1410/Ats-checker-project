// Error thrown by the service layer. `status` is the HTTP status (0 = network error).
export class ApiError extends Error {
  constructor(message, status = 0, detail = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

// FastAPI returns { detail: "..." } or, for 422, { detail: [{ msg, loc }] }
export const messageFromDetail = (detail) => {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const field = Array.isArray(d?.loc) ? d.loc.filter((p) => p !== "body").join(".") : "";
        return field ? `${field}: ${d.msg}` : d?.msg;
      })
      .filter(Boolean)
      .join(", ");
  }
  return null;
};

export const getErrorMessage = (err, fallback = "Something went wrong") => {
  if (!err) return fallback;
  if (err instanceof ApiError) return err.message || fallback;
  return err.message || fallback;
};

export const isNotFound = (err) => err instanceof ApiError && err.status === 404;
