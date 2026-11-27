import { LoaderCircle } from "lucide-react";

export default function Spinner({ className = "h-5 w-5" }) {
  return <LoaderCircle className={`animate-spin text-primary-600 ${className}`} aria-label="Loading" />;
}

export function PageSpinner({ label = "Loading…" }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-gray-500">
      <Spinner className="h-7 w-7" />
      {label}
    </div>
  );
}
