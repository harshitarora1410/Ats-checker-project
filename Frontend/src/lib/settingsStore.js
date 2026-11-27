import { DEFAULT_PROVIDER, DEFAULT_WEIGHTS, PROVIDERS, SECTION_KEYS } from "./constants";

// The backend has no settings endpoint: model + weights are sent with every
// POST /api/analyses. We keep the user's choice in localStorage, per user.

const key = (userId) => `ats.settings.${userId || "guest"}`;

export const defaultSettings = () => ({ provider: DEFAULT_PROVIDER, weights: { ...DEFAULT_WEIGHTS } });

export const weightsTotal = (w) => SECTION_KEYS.reduce((sum, k) => sum + (Number(w?.[k]) || 0), 0);

const isValid = (s) =>
  s &&
  PROVIDERS[s.provider] &&
  SECTION_KEYS.every((k) => Number.isInteger(s.weights?.[k]) && s.weights[k] >= 0) &&
  weightsTotal(s.weights) === 100;

export const loadSettings = (userId) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key(userId)) || "null");
    return isValid(parsed) ? parsed : defaultSettings();
  } catch {
    return defaultSettings();
  }
};

export const saveSettings = (userId, settings) => {
  if (!isValid(settings)) throw new Error("Weights must be whole numbers that add up to 100%");
  localStorage.setItem(key(userId), JSON.stringify(settings));
};
