import { API_ORIGIN } from "../config";
import { ApiError, messageFromDetail } from "../lib/errors";
import { tokenStorage } from "./tokenStorage";

// Fired when the refresh token is also rejected; AuthContext logs the user out
// and ProtectedRoute sends them to /login?expired=1.
export const AUTH_EXPIRED_EVENT = "auth:expired";

const SESSION_EXPIRED = "Session expired, please login again";

const FALLBACK_MESSAGES = {
  400: "The request was not valid",
  401: "Invalid email or password",
  403: "You don't have access to this. A recruiter account is required.",
  404: "Not found",
  413: "File is too large",
  422: "Some fields are missing or invalid",
  500: "The server had a problem. Please try again.",
  502: "The server is starting up. Please try again in a moment.",
  503: "The server is temporarily unavailable. Please retry in a moment.",
};

const parseBody = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

let refreshPromise = null;

async function refreshTokens() {
  const refresh_token = tokenStorage.getRefresh();
  if (!refresh_token) throw new ApiError(SESSION_EXPIRED, 401);
  const res = await fetch(`${API_ORIGIN}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refresh_token }),
  });
  if (!res.ok) throw new ApiError(SESSION_EXPIRED, 401);
  const data = await res.json();
  tokenStorage.set(data);
  return data.access_token;
}

/**
 * Calls `${API_ORIGIN}/api${path}`.
 * - JSON bodies are serialised; FormData is sent as-is so the browser sets
 *   the multipart boundary (setting Content-Type by hand causes a 422).
 * - On 401 for a protected call: refresh once, retry once, else session expired.
 */
export async function request(path, { method = "GET", body, query, auth = true, retried = false } = {}) {
  const url = new URL(`${API_ORIGIN}/api${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }

  const headers = { Accept: "application/json" };
  let payload = body;
  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const token = auth ? tokenStorage.getAccess() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { method, headers, body: payload });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection or try again in a moment.", 0);
  }

  if (res.status === 401 && auth && !retried) {
    try {
      refreshPromise ??= refreshTokens().finally(() => {
        refreshPromise = null;
      });
      await refreshPromise;
    } catch {
      tokenStorage.clear();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      throw new ApiError(SESSION_EXPIRED, 401);
    }
    return request(path, { method, body, query, auth, retried: true });
  }

  const data = await parseBody(res);
  if (!res.ok) {
    const message = messageFromDetail(data?.detail) || FALLBACK_MESSAGES[res.status] || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data?.detail ?? null);
  }
  return data;
}
