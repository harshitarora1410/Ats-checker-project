import { Check } from "lucide-react";

// Job description ✓ —— Resumes ✓ —— 3 Score
export default function StepIndicator({ steps }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label="Progress">
      {steps.map((step, i) => (
        <li key={step.label} className="flex items-center gap-2 sm:gap-3">
          {i > 0 && <span className={`h-px w-6 sm:w-10 ${steps[i - 1].done ? "bg-strong" : "bg-gray-300"}`} aria-hidden="true" />}
          <span className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                step.done ? "bg-strong text-white" : "border border-gray-300 bg-white text-gray-500"
              }`}
            >
              {step.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={`text-sm font-medium ${step.done ? "text-gray-900" : "text-gray-500"}`}>{step.label}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
