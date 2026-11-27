// progress/section (6px), progress/overall (12px), progress/upload (4px)
const TONES = {
  strong: "bg-emerald-500",
  moderate: "bg-amber-500",
  weak: "bg-red-500",
  primary: "bg-primary-600",
};

export const toneForScore = (score) => (score >= 75 ? "strong" : score >= 50 ? "moderate" : "weak");

export default function ProgressBar({ value = 0, tone = "primary", height = "h-1.5", className = "", label }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-gray-100 ${height} ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`h-full rounded-full transition-[width] duration-500 ${TONES[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
