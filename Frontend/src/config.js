// Runtime configuration, read from Vite env vars (see .env.example).
//
// VITE_API_URL   backend origin, without /api. Default: the deployed backend.
//                Local backend: http://localhost:8000
// VITE_USE_MOCK  "false" (default) -> real FastAPI backend at VITE_API_URL
//                "true"            -> in-browser mock service, no backend needed

const env = import.meta.env;

export const DEFAULT_API_URL = "https://ats-backend-algoworks.onrender.com";

const rawUrl = (env.VITE_API_URL || DEFAULT_API_URL).trim();

// accept "http://host", "http://host/" and "http://host/api" alike
export const API_ORIGIN = rawUrl.replace(/\/+$/, "").replace(/\/api$/, "");

export const USE_MOCK = String(env.VITE_USE_MOCK ?? "false").toLowerCase() === "true";

// guide: poll every 2-3 s while queued/processing; the mock finishes faster
export const POLL_INTERVAL_MS = USE_MOCK ? 1000 : 2500;
