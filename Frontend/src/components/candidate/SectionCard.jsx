import { Award, Briefcase, CircleCheck, CircleX, CodeXml, GraduationCap, WandSparkles } from "lucide-react";
import Card from "../ui/Card";
import ProgressBar, { toneForScore } from "../ui/ProgressBar";
import { SECTION_LABELS } from "../../lib/constants";
import { oneDecimal } from "../../lib/format";

export const SECTION_ICONS = { skills: CodeXml, experience: Briefcase, education: GraduationCap, certifications: Award };

function ItemList({ items, tone }) {
  if (!items?.length) return <p className="text-sm text-gray-400">{tone === "matched" ? "None" : "Nothing missing"}</p>;
  const Icon = tone === "matched" ? CircleCheck : CircleX;
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex items-start gap-2 text-sm text-gray-800">
          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone === "matched" ? "text-strong" : "text-weak"}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

// One of the four section cards on P5
export default function SectionCard({ sectionKey, section = {}, weight, points }) {
  const Icon = SECTION_ICONS[sectionKey];
  const score = section.score ?? 0;
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-gray-900">{SECTION_LABELS[sectionKey]}</h3>
            {weight != null && (
              <p className="text-xs text-gray-500">
                Weight {oneDecimal(weight)}% · contributes {oneDecimal(points)} pts
              </p>
            )}
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {Math.round(score)}
          <span className="text-sm font-medium text-gray-400">/100</span>
        </p>
      </div>

      <ProgressBar value={score} tone={toneForScore(score)} height="h-2" className="mt-4" label={`${SECTION_LABELS[sectionKey]} score`} />

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">Matched items</p>
          <ItemList items={section.matched} tone="matched" />
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">Missing items</p>
          <ItemList items={section.missing} tone="missing" />
        </div>
      </div>

      {section.reasoning && (
        <div className="mt-auto pt-4">
          <div className="rounded-xl border border-green-100 bg-mint-50 p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-green-800">
              <WandSparkles className="h-3.5 w-3.5" /> Why this score
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">{section.reasoning}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
