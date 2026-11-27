import { CircleAlert, CircleCheck, History, Info } from "lucide-react";

const TONES = {
  error: { box: "border-red-200 bg-red-50 text-red-700", Icon: CircleAlert },
  warning: { box: "border-amber-200 bg-amber-50 text-amber-800", Icon: History },
  info: { box: "border-primary-100 bg-primary-50 text-primary-700", Icon: Info },
  success: { box: "border-green-200 bg-mint-50 text-green-800", Icon: CircleCheck },
};

export default function Alert({ tone = "error", icon, title, children, action, className = "" }) {
  const { box, Icon } = TONES[tone];
  const Glyph = icon || Icon;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm ${box} ${className}`}>
      <Glyph className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5" : ""}>{children}</div>}
      </div>
      {action}
    </div>
  );
}
