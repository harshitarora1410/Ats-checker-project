import { SearchX, TriangleAlert } from "lucide-react";

export default function EmptyState({ icon: Icon = SearchX, title, description, action, tone = "mint", className = "" }) {
  const iconTone = tone === "error" ? "border-red-100 bg-red-50 text-weak" : "border-green-100 bg-mint-50 text-strong";
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
      <span className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${iconTone}`}>
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

// "Not found" / "could not load" block used by every data page
export function ErrorState({ error, notFoundTitle = "Not found", action }) {
  const notFound = error?.status === 404;
  return (
    <EmptyState
      tone="error"
      icon={TriangleAlert}
      title={notFound ? notFoundTitle : "Could not load this page"}
      description={notFound ? "It may have been removed, or it belongs to another account." : error?.message}
      action={action}
    />
  );
}
