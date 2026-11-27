import { CircleAlert, History } from "lucide-react";

const tones = {
  error: { box: "border-red-200 bg-red-50 text-red-700", Icon: CircleAlert },
  warning: { box: "border-amber-200 bg-amber-50 text-amber-800", Icon: History },
};

export default function Alert({ tone = "error", children, className = "" }) {
  const { box, Icon } = tones[tone];
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${box} ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
