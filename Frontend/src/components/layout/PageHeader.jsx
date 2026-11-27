import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Page width + padding shared by every page inside AppLayout
export function PageContainer({ className = "", children }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-6 ${className}`}>{children}</div>;
}

export function BackLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
      <ArrowLeft className="h-4 w-4" /> {children}
    </Link>
  );
}

// Eyebrow (green overline) + 28px title + description, actions on the right
export default function PageHeader({ eyebrow, title, description, actions, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-semibold tracking-wider text-strong uppercase">{eyebrow}</p>}
        <h1 className="mt-1 text-[28px] leading-tight font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-gray-500">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
