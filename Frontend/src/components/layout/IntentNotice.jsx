import { History, Settings, WandSparkles } from "lucide-react";
import { useAnalysisDraft } from "../../hooks/useAnalysisDraft";

// Tells the user why they landed on login/signup and where they'll go next
export default function IntentNotice({ intent, verb = "Sign in" }) {
  const { isReady, resumes } = useAnalysisDraft();

  let Icon;
  let text;
  if (intent === "score") {
    Icon = WandSparkles;
    text = isReady
      ? `${verb} to score your resumes. Your ${resumes.length} file${resumes.length > 1 ? "s are" : " is"} ready and will be sent right after.`
      : `${verb} to score resumes. You'll be taken back to add your files.`;
  } else if (intent === "history") {
    Icon = History;
    text = `${verb} to see your past analyses.`;
  } else if (intent === "settings") {
    Icon = Settings;
    text = `${verb} to manage your AI model and scoring weights.`;
  } else {
    return null;
  }

  return (
    <p className="flex items-start gap-2 rounded-xl bg-primary-50 px-3.5 py-2.5 text-sm text-primary-700">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      {text}
    </p>
  );
}
