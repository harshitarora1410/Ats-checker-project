// Intent-based redirect after login/signup (user flow, step 3).
//
//   /login?intent=history   -> /history
//   /login?intent=settings  -> /settings
//   /login?intent=score     -> create the analysis, then /analyze/:jobId/progress
//   /login?next=/some/path  -> that path (deep links to protected pages)
//   /login                  -> /

export const INTENT_PATHS = {
  history: "/history",
  settings: "/settings",
};

export const INTENTS = ["history", "settings", "score"];

// Protected pages that map to a named intent
const PATH_TO_INTENT = {
  "/history": "history",
  "/settings": "settings",
};

// only allow same-site relative paths (no "//evil.com", no "https://...")
export const safeNext = (next) =>
  typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") && !next.startsWith("/signup")
    ? next
    : null;

export const authUrl = (page, { intent, next, expired } = {}) => {
  const params = new URLSearchParams();
  if (intent && INTENTS.includes(intent)) params.set("intent", intent);
  else if (safeNext(next)) params.set("next", next);
  if (expired) params.set("expired", "1");
  const qs = params.toString();
  return `/${page}${qs ? `?${qs}` : ""}`;
};

// Used by ProtectedRoute: where should a guest who opened `pathname` go?
export const loginUrlForPath = (pathname, search = "", expired = false) => {
  const intent = PATH_TO_INTENT[pathname];
  return intent
    ? authUrl("login", { intent, expired })
    : authUrl("login", { next: `${pathname}${search}`, expired });
};

// Keeps intent/next when switching between /login and /signup
export const carryParams = (searchParams, page) => {
  const params = new URLSearchParams();
  for (const key of ["intent", "next"]) {
    const v = searchParams.get(key);
    if (v) params.set(key, v);
  }
  const qs = params.toString();
  return `/${page}${qs ? `?${qs}` : ""}`;
};

// Destination for every intent except "score" (that one needs an API call first)
export const pathForParams = (searchParams) => {
  const intent = searchParams.get("intent");
  if (intent && INTENT_PATHS[intent]) return INTENT_PATHS[intent];
  return safeNext(searchParams.get("next")) || "/";
};
