import { Link } from "react-router-dom";
import { FileCheck2 } from "lucide-react";

export function LogoMark({ className = "h-9 w-9", iconClass = "h-1/2 w-1/2" }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-mint-500 to-strong text-white shadow-sm ${className}`}>
      <FileCheck2 className={iconClass} aria-hidden="true" />
    </span>
  );
}

export default function Logo({ to = "/" }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100">
      <LogoMark />
      <span className="text-[15px] font-bold text-gray-900">ATS Resume Scorer</span>
    </Link>
  );
}
