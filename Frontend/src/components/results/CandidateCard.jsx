import { FileDown, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Avatar from "../ui/Avatar";
import ScoreCircle from "../ui/ScoreCircle";
import ProgressBar, { toneForScore } from "../ui/ProgressBar";
import { ChipList } from "../ui/Chip";
import { ButtonLink, buttonClasses } from "../ui/Button";
import { RankBadge, VerdictBadge } from "../ui/Badge";
import { SECTION_KEYS, SECTION_LABELS } from "../../lib/constants";
import { nameFromFilename } from "../../lib/files";

const collect = (sections, field) => SECTION_KEYS.flatMap((k) => sections?.[k]?.[field] || []);

// One ranked candidate row on P4
export default function CandidateCard({ jobId, resume }) {
  const name = resume.candidate_name || nameFromFilename(resume.original_filename);
  const detailsUrl = `/analyze/${jobId}/resumes/${resume.resume_id}`;
  const matched = collect(resume.sections, "matched");
  const missing = collect(resume.sections, "missing");

  return (
    <Card className="grid gap-5 p-5 transition-shadow hover:shadow-md lg:grid-cols-[minmax(250px,1.1fr)_minmax(220px,1fr)_minmax(240px,1.3fr)_auto] lg:items-center">
      {/* rank + score + name */}
      <div className="flex items-center gap-4">
        <RankBadge rank={resume.rank} />
        <ScoreCircle score={resume.overall_score} verdict={resume.verdict} size="md" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Avatar name={name} size="h-6 w-6 text-[10px]" />
            <Link to={detailsUrl} className="truncate font-bold text-gray-900 hover:text-primary-600">
              {name}
            </Link>
          </div>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500" title={resume.original_filename}>
            <FileText className="h-3 w-3 shrink-0" />
            <span className="truncate">{resume.original_filename}</span>
          </p>
          <VerdictBadge verdict={resume.verdict} className="mt-2" />
        </div>
      </div>

      {/* section bars */}
      <div className="space-y-2 lg:border-l lg:border-gray-100 lg:pl-5">
        {SECTION_KEYS.map((k) => {
          const score = resume.sections?.[k]?.score ?? 0;
          return (
            <div key={k} className="grid grid-cols-[92px_1fr_52px] items-center gap-2 text-xs">
              <span className="text-gray-600">{SECTION_LABELS[k]}</span>
              <ProgressBar value={score} tone={toneForScore(score)} label={`${SECTION_LABELS[k]} score`} />
              <span className="text-right font-semibold text-gray-900 tabular-nums">
                {Math.round(score)}
                <span className="font-normal text-gray-400">/100</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* matched / missing */}
      <div className="grid grid-cols-2 gap-4 lg:border-l lg:border-gray-100 lg:pl-5">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">Matched</p>
          <ChipList items={matched} tone="matched" max={5} empty={<span className="text-xs text-gray-400">—</span>} />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">Missing</p>
          <ChipList items={missing} tone="missing" max={4} empty={<span className="text-xs text-gray-400">Nothing missing</span>} />
        </div>
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 lg:justify-end">
        <ButtonLink to={detailsUrl} size="sm">
          View details
        </ButtonLink>
        <Link
          to={`${detailsUrl}/report`}
          className={buttonClasses("secondary", "icon")}
          title="Open PDF report"
          aria-label={`Open PDF report for ${name}`}
        >
          <FileDown className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
