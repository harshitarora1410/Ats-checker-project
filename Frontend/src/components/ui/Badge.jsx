import { CircleCheck, CircleX, Clock, LoaderCircle, Sparkles, Star } from "lucide-react";
import { VERDICTS } from "../../lib/constants";
import { providerFromModel } from "../../lib/format";

// Pill — 12px semibold, radius full
export function Pill({ className = "", children, title }) {
  return (
    <span title={title} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}

const VERDICT_STYLES = {
  strong: { pill: "bg-mint-50 text-strong", dot: "bg-strong" },
  moderate: { pill: "bg-amber-50 text-moderate", dot: "bg-moderate" },
  weak: { pill: "bg-red-50 text-weak", dot: "bg-weak" },
};

export function VerdictBadge({ verdict, short = false, className = "" }) {
  if (!verdict || !VERDICT_STYLES[verdict]) return null;
  const s = VERDICT_STYLES[verdict];
  return (
    <Pill className={`${s.pill} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {short ? VERDICTS[verdict].short : VERDICTS[verdict].label}
    </Pill>
  );
}

// "Claude" (orange) / "Gemini" (blue) — derived from model_used
export function ModelBadge({ model, prefix = "", className = "" }) {
  const provider = providerFromModel(model);
  if (!provider) return model ? <Pill className={`bg-gray-100 text-gray-700 ${className}`}>{model}</Pill> : null;
  const claude = provider === "claude";
  return (
    <Pill title={model} className={`${claude ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"} ${className}`}>
      {claude ? <Sparkles className="h-3 w-3" /> : <Star className="h-3 w-3" />}
      {prefix}
      {claude ? "Claude" : "Gemini"}
    </Pill>
  );
}

const STATUS = {
  ready: { cls: "bg-mint-50 text-strong", Icon: CircleCheck, label: "Ready" },
  done: { cls: "bg-mint-50 text-strong", Icon: CircleCheck, label: "Done" },
  processing: { cls: "bg-primary-50 text-primary-600", Icon: LoaderCircle, label: "Analyzing", spin: true },
  queued: { cls: "bg-gray-100 text-gray-600", Icon: Clock, label: "Queued" },
  pending: { cls: "bg-gray-100 text-gray-600", Icon: Clock, label: "Waiting" },
  failed: { cls: "bg-red-50 text-weak", Icon: CircleX, label: "Failed" },
};

export function StatusBadge({ status, label }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <Pill className={s.cls}>
      <s.Icon className={`h-3.5 w-3.5 ${s.spin ? "animate-spin" : ""}`} />
      {label || s.label}
    </Pill>
  );
}

// #1 gold, #2 silver, #3 bronze, others grey
const RANK_STYLES = {
  1: "bg-linear-to-br from-amber-300 to-amber-500 text-white",
  2: "bg-linear-to-br from-gray-300 to-gray-400 text-white",
  3: "bg-linear-to-br from-orange-300 to-orange-500 text-white",
};

export function RankBadge({ rank, total, size = "md" }) {
  if (rank == null) return null;
  const dims = size === "sm" ? "h-7 min-w-7 px-1.5 text-xs" : "h-9 min-w-9 px-2 text-sm";
  return (
    <span className={`inline-flex items-center justify-center rounded-lg font-bold ${dims} ${RANK_STYLES[rank] || "bg-gray-100 text-gray-600"}`}>
      #{rank}
      {total ? <span className="ml-1 font-semibold opacity-90">of {total}</span> : null}
    </span>
  );
}
