import { Check, X } from "lucide-react";

// chip/matched (green ✓) and chip/missing (red ✕) — radius 6, 12px medium
export default function Chip({ tone = "matched", children }) {
  const matched = tone === "matched";
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
        matched ? "bg-mint-50 text-green-700 ring-1 ring-green-200/70" : "bg-red-50 text-red-700 ring-1 ring-red-200/70"
      }`}
    >
      {matched ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
      <span className="truncate">{children}</span>
    </span>
  );
}

export function ChipList({ items = [], tone, max = 6, empty = null }) {
  if (!items.length) return empty;
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((item, i) => (
        <Chip key={`${item}-${i}`} tone={tone}>
          {item}
        </Chip>
      ))}
      {rest > 0 && <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">+{rest} more</span>}
    </div>
  );
}
