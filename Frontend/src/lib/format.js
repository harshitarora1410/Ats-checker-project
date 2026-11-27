import { VERDICTS } from "./constants";

export const verdictFromScore = (score) => {
  if (score == null) return null;
  if (score >= VERDICTS.strong.min) return "strong";
  if (score >= VERDICTS.moderate.min) return "moderate";
  return "weak";
};

// score shown in big numbers: 89.15 -> 89
export const roundScore = (n) => (n == null ? "—" : Math.round(Number(n)));

export const oneDecimal = (n) => (n == null ? "—" : (Math.round(Number(n) * 10) / 10).toString());

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

export const formatDate = (iso) => (iso ? dateFmt.format(new Date(iso)) : "—");
export const formatTime = (iso) => (iso ? timeFmt.format(new Date(iso)) : "");

export const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return `${sameDay ? "Today" : dateFmt.format(d)}, ${timeFmt.format(d)}`;
};

// "claude-haiku-5-5" -> "Claude", "gemini-3.5-flash-lite" -> "Gemini"
export const providerFromModel = (model = "") => {
  const m = String(model || "").toLowerCase();
  if (m.includes("gemini")) return "gemini";
  if (m.includes("claude") || m.includes("anthropic")) return "claude";
  return null;
};

export const pluralize = (n, word, plural = `${word}s`) => `${n} ${n === 1 ? word : plural}`;

// "Aarav Mehta" -> "Aarav_Mehta"
export const fileSafe = (s = "") => s.trim().replace(/[^\w-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "") || "candidate";

export const shortId = (id = "") => String(id).replace(/-/g, "").slice(0, 8).toUpperCase();
