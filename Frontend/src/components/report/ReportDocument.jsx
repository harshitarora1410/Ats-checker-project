import { forwardRef } from "react";
import { Check, ThumbsUp, X } from "lucide-react";
import { LogoMark } from "../ui/Logo";
import ScoreCircle from "../ui/ScoreCircle";
import { VerdictBadge } from "../ui/Badge";
import { SECTION_KEYS, SECTION_LABELS } from "../../lib/constants";
import { emailFromText, gapsOf, sectionWeight, strengthsOf } from "../../lib/candidate";
import { oneDecimal, providerFromModel, shortId } from "../../lib/format";

const BAR = { strong: "#10b981", moderate: "#f59e0b", weak: "#ef4444" };
const barColor = (s) => (s >= 75 ? BAR.strong : s >= 50 ? BAR.moderate : BAR.weak);

const Overline = ({ children, className = "" }) => (
  <p className={`text-[10px] font-bold tracking-wider text-gray-500 uppercase ${className}`}>{children}</p>
);

/**
 * The A4 sheet for P6 (794 × 1123 px at 96 dpi). Fixed width on purpose:
 * it is what Print and "Download" (html-to-image -> PDF) capture.
 */
const ReportDocument = forwardRef(function ReportDocument({ detail, name, generatedAt }, ref) {
  const email = emailFromText(detail.extracted_text);
  const provider = providerFromModel(detail.model_used);
  const strengths = strengthsOf(detail);
  const gaps = gapsOf(detail);
  const [headline, ...restRecs] = detail.recommendations || [];

  return (
    <div ref={ref} className="print-sheet flex min-h-[1123px] w-[794px] flex-col bg-white text-gray-900 shadow-xl">
      {/* header */}
      <div className="flex items-start justify-between px-12 pt-11 pb-5">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <div>
            <p className="text-[15px] font-bold">ATS Resume Scorer</p>
            <p className="text-xs text-gray-500">Candidate Assessment Report</p>
          </div>
        </div>
        <div className="text-right">
          <Overline>Job title</Overline>
          <p className="text-[15px] font-bold">{detail.jd_title || "Untitled role"}</p>
          <p className="text-xs text-gray-500">Report #ATS-{shortId(detail.resume_id)}</p>
        </div>
      </div>
      <div className="mx-12 h-[3px] rounded-full bg-strong" />

      <div className="flex-1 space-y-6 px-12 py-6">
        {/* candidate */}
        <div className="flex items-center gap-5 rounded-xl border border-green-100 bg-mint-50 p-5">
          <ScoreCircle score={detail.overall_score} verdict={detail.verdict} size="md" />
          <div className="min-w-0 flex-1">
            <Overline>Candidate</Overline>
            <p className="text-2xl font-bold">{name}</p>
            <p className="mt-0.5 text-xs text-gray-500">
              {detail.original_filename}
              {email ? ` · ${email}` : ""}
            </p>
          </div>
          <div className="space-y-1.5 text-right text-xs text-gray-600">
            <VerdictBadge verdict={detail.verdict} />
            {detail.rank != null && (
              <p>
                Rank <strong className="text-gray-900">#{detail.rank}</strong>
                {detail.total_resumes ? ` of ${detail.total_resumes}` : ""}
              </p>
            )}
            {detail.model_used && (
              <p>
                Model: <strong className="text-gray-900">{provider ? provider[0].toUpperCase() + provider.slice(1) : detail.model_used}</strong>
              </p>
            )}
          </div>
        </div>

        {/* section scores */}
        <div>
          <Overline className="mb-2 text-gray-800">Section scores</Overline>
          <table className="w-full overflow-hidden rounded-lg text-xs ring-1 ring-gray-200">
            <thead className="bg-gray-50 text-[10px] tracking-wider text-gray-500 uppercase">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Section</th>
                <th className="px-3 py-2 text-left font-semibold">Weight</th>
                <th className="px-3 py-2 text-left font-semibold">Score</th>
                <th className="px-3 py-2 text-right font-semibold">Weighted</th>
              </tr>
            </thead>
            <tbody>
              {SECTION_KEYS.map((k) => {
                const s = detail.sections?.[k] || {};
                const { weight, points } = sectionWeight(detail, k);
                return (
                  <tr key={k} className="border-t border-gray-100">
                    <td className="px-3 py-2.5 font-semibold">{SECTION_LABELS[k]}</td>
                    <td className="px-3 py-2.5 text-gray-600">{weight != null ? `${oneDecimal(weight)}%` : "—"}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full" style={{ width: `${s.score ?? 0}%`, background: barColor(s.score ?? 0) }} />
                        </div>
                        <span className="font-semibold">{Math.round(s.score ?? 0)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold">{oneDecimal(points)}</td>
                  </tr>
                );
              })}
              <tr className="border-t border-green-100 bg-mint-50 font-bold">
                <td className="px-3 py-2.5" colSpan={3}>
                  Overall score
                </td>
                <td className="px-3 py-2.5 text-right text-strong">{Math.round(detail.overall_score)} / 100</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* matched & missing */}
        <div>
          <Overline className="mb-2 text-gray-800">Matched &amp; missing by section</Overline>
          <div className="grid grid-cols-2 gap-3">
            {SECTION_KEYS.map((k) => {
              const s = detail.sections?.[k] || {};
              return (
                <div key={k} className="rounded-lg border border-gray-200 p-3 text-xs">
                  <p className="mb-1.5 font-bold">{SECTION_LABELS[k]}</p>
                  {s.matched?.length > 0 && (
                    <p className="flex gap-1.5 text-green-700">
                      <Check className="mt-0.5 h-3 w-3 shrink-0" /> {s.matched.join(", ")}
                    </p>
                  )}
                  {s.missing?.length > 0 && (
                    <p className="mt-1 flex gap-1.5 text-red-600">
                      <X className="mt-0.5 h-3 w-3 shrink-0" /> {s.missing.join(", ")}
                    </p>
                  )}
                  {!s.matched?.length && !s.missing?.length && <p className="text-gray-400">{s.reasoning || "No items listed"}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI summary */}
        <div>
          <Overline className="mb-2 text-gray-800">AI summary</Overline>
          <div className="space-y-3 rounded-lg border border-gray-200 p-4 text-xs">
            {detail.summary && <p className="leading-relaxed text-gray-700">{detail.summary}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 font-bold text-strong">Strengths</p>
                <ul className="list-disc space-y-0.5 pl-4 text-gray-700">
                  {(strengths.length ? strengths : ["None listed"]).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 font-bold text-weak">Gaps</p>
                <ul className="list-disc space-y-0.5 pl-4 text-gray-700">
                  {(gaps.length ? gaps : ["None listed"]).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
            {headline && (
              <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-mint-50 px-3 py-2">
                <ThumbsUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-strong" />
                <p>
                  <strong className="text-green-900">Recommendation: {headline}</strong>
                  {restRecs.length > 0 && <span className="text-gray-700"> — {restRecs.join(" ")}</span>}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="mx-12 flex items-center justify-between border-t border-gray-200 py-4 text-[10px] text-gray-500">
        <span>Generated on {generatedAt}</span>
        <span className="flex items-center gap-1.5">
          <LogoMark className="h-4 w-4" iconClass="h-2.5 w-2.5" /> Generated by ATS Resume Scorer
        </span>
        <span>AI-assisted — review before hiring decisions</span>
      </div>
    </div>
  );
});

export default ReportDocument;
