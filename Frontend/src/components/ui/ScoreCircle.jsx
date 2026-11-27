import { verdictFromScore } from "../../lib/format";

// Stroke colour follows the verdict. Sizes 120 / 88 / 48 (design component library).
const SIZES = {
  lg: { px: 120, stroke: 10, text: "text-4xl", sub: "text-xs" },
  md: { px: 88, stroke: 8, text: "text-[26px]", sub: "text-[10px]" },
  sm: { px: 48, stroke: 5, text: "text-sm", sub: "hidden" },
};

const COLORS = { strong: "#16a34a", moderate: "#d97706", weak: "#dc2626" };

export default function ScoreCircle({ score, verdict, size = "md" }) {
  const s = SIZES[size];
  const v = verdict || verdictFromScore(score);
  const r = (s.px - s.stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, Number(score) || 0));
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: s.px, height: s.px }}>
      <svg width={s.px} height={s.px} className="-rotate-90" aria-hidden="true">
        <circle cx={s.px / 2} cy={s.px / 2} r={r} fill="none" stroke="#eef0f3" strokeWidth={s.stroke} />
        <circle
          cx={s.px / 2}
          cy={s.px / 2}
          r={r}
          fill="none"
          stroke={COLORS[v] || "#9ca3af"}
          strokeWidth={s.stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className={`font-bold text-gray-900 ${s.text}`}>{score == null ? "—" : Math.round(score)}</span>
        <span className={`mt-1 text-gray-400 ${s.sub}`}>/100</span>
      </div>
      <span className="sr-only">Score {Math.round(pct)} out of 100</span>
    </div>
  );
}
