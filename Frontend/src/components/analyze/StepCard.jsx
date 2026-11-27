import { CircleCheck } from "lucide-react";
import Card from "../ui/Card";

// Numbered card used for "1 Job description" and "2 Upload resumes"
export default function StepCard({ number, title, description, badge, children }) {
  return (
    <Card className="p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-600">
            {number}
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        {badge && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-mint-50 px-2.5 py-1 text-xs font-semibold text-strong">
            <CircleCheck className="h-3.5 w-3.5" /> {badge}
          </span>
        )}
      </div>
      {children}
    </Card>
  );
}
