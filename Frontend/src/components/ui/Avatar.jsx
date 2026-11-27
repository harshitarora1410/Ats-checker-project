import { initials } from "../../lib/format";

const COLORS = ["bg-primary-600", "bg-emerald-600", "bg-amber-500", "bg-violet-600", "bg-rose-500", "bg-cyan-600"];

// initials on a colour picked from the name (no photos from the API)
export default function Avatar({ name = "", size = "h-9 w-9 text-sm" }) {
  const color = COLORS[[...name].reduce((s, ch) => s + ch.charCodeAt(0), 0) % COLORS.length];
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${color} ${size}`}>
      {initials(name)}
    </span>
  );
}
