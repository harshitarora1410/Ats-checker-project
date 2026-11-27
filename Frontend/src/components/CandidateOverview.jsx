
import { CheckCircle2 } from "lucide-react";

function CandidateOverview({ candidate }) {
  return (
    <section className="bg-emerald-50 border border-emerald-100 rounded-xl px-6 py-5 flex items-center justify-between gap-5">
      <div
        className="score-circle shrink-0"
        style={{
          background: `conic-gradient(#16a34a 0% ${candidate.score}%, #d1fae5 ${candidate.score}% 100%)`,
        }}
      >
        <div className="score-inner">
          <span className="text-2xl font-bold text-slate-900">
            {candidate.score}
          </span>
          <span className="text-[10px] text-slate-400">/100</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
          Candidate
        </p>
        <h2 className="text-xl font-bold text-slate-900">
          {candidate.name}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {candidate.resumeName} · {candidate.email}
        </p>
      </div>

      <div className="text-right shrink-0">
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 rounded-full px-3 py-1 text-xs font-semibold">
          <CheckCircle2 size={12} />
          {candidate.fit}
        </span>
        <p className="text-xs text-slate-500 mt-2">
          Rank <strong className="text-slate-700">#{candidate.rank} of {candidate.totalCandidates}</strong>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Model: <strong className="text-slate-700">{candidate.aiModel}</strong>
        </p>
      </div>
    </section>
  );
}

export default CandidateOverview;
