
import { Sparkles, TrendingUp, TrendingDown, ThumbsUp } from "lucide-react";

function AISummary({ summary }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center gap-2">
        <Sparkles size={18} className="text-emerald-600" />
        <h2 className="font-bold text-slate-800">AI Summary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-5 border-b md:border-b-0 md:border-r border-slate-100">
          <h3 className="text-[11px] font-bold text-emerald-700 uppercase mb-3 flex items-center gap-2">
            <TrendingUp size={14} />
            Strengths
          </h3>

          <ul className="space-y-2">
            {summary.strengths.map((item, index) => (
              <li key={index} className="flex gap-2 text-xs text-slate-600">
                <span className="text-emerald-500">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5">
          <h3 className="text-[11px] font-bold text-red-600 uppercase mb-3 flex items-center gap-2">
            <TrendingDown size={14} />
            Gaps
          </h3>

          <ul className="space-y-2">
            {summary.gaps.map((item, index) => (
              <li key={index} className="flex gap-2 text-xs text-slate-600">
                <span className="text-red-500">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-5 mb-5 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
        <div className="bg-emerald-500 text-white p-2.5 rounded-lg shrink-0">
          <ThumbsUp size={19} />
        </div>

        <div>
          <p className="text-xs font-bold text-emerald-800">
            Recommendation: {summary.recommendation}
          </p>
          <p className="text-xs text-emerald-700 mt-1">
            {summary.recommendationNote}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AISummary;
