import { Link } from "react-router-dom";
import { FileCheck } from "lucide-react";

export function LogoMark({ className = "h-9 w-9" }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-linear-to-br from-mint-500 to-strong text-white ${className}`}
    >
      <FileCheck className="h-1/2 w-1/2" />
    </span>
  );
}

export default function Logo({ to = "/" }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[15px] font-bold text-gray-900">ATS Resume Scorer</span>
    </Link>
  );
}
