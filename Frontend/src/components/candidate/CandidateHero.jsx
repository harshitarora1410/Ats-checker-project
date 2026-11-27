import { Briefcase, FileDown, FileText, Mail } from "lucide-react";
import Card from "../ui/Card";
import Avatar from "../ui/Avatar";
import ScoreCircle from "../ui/ScoreCircle";
import { ButtonLink } from "../ui/Button";
import { ModelBadge, RankBadge, VerdictBadge } from "../ui/Badge";
import { emailFromText } from "../../lib/candidate";

export default function CandidateHero({ detail, name, reportUrl }) {
  const email = emailFromText(detail.extracted_text);
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-6 bg-linear-to-r from-white via-white to-mint-50/80 p-6 md:flex-row md:items-center">
        <ScoreCircle score={detail.overall_score} verdict={detail.verdict} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <RankBadge rank={detail.rank} total={detail.total_resumes} size="sm" />
            <VerdictBadge verdict={detail.verdict} />
            {detail.model_used && <ModelBadge model={detail.model_used} />}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Avatar name={name} size="h-11 w-11 text-base" />
            <h1 className="truncate text-2xl font-bold text-gray-900">{name}</h1>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-red-500" /> {detail.original_filename}
            </span>
            {email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {email}
              </span>
            )}
            {detail.jd_title && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" /> Job: {detail.jd_title}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <ButtonLink to={reportUrl}>
            <FileDown className="h-4 w-4" /> Download PDF report
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}
