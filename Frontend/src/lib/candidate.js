import { SECTION_KEYS, SECTION_LABELS } from "./constants";

// First e-mail address in the resume text (the API has no email field)
export const emailFromText = (text = "") => text?.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] || null;

// Guide: strengths/gaps may be [] — fall back to sections[key].matched / missing
export const strengthsOf = (detail) => {
  if (detail?.strengths?.length) return detail.strengths;
  return SECTION_KEYS.filter((k) => detail?.sections?.[k]?.matched?.length).map(
    (k) => `${SECTION_LABELS[k]}: ${detail.sections[k].matched.slice(0, 4).join(", ")}`
  );
};

export const gapsOf = (detail) => {
  if (detail?.gaps?.length) return detail.gaps;
  return SECTION_KEYS.filter((k) => detail?.sections?.[k]?.missing?.length).map(
    (k) => `${SECTION_LABELS[k]}: ${detail.sections[k].missing.slice(0, 4).join(", ")}`
  );
};

// weight / contribution, computed from job weights if the detail lacks them
export const sectionWeight = (detail, key, jobWeights) => {
  const s = detail?.sections?.[key] || {};
  const weight = s.weight ?? jobWeights?.[key] ?? null;
  const points = s.weighted_points ?? (weight != null && s.score != null ? Math.round(s.score * weight) / 100 : null);
  return { weight, points };
};
