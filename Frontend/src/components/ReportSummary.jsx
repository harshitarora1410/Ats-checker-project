
function ReportSummary({ summary }) {
  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-800 mb-3">
        AI Summary
      </h2>

      <div className="border border-slate-200 rounded-lg p-4">
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {summary.description}
        </p>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <div>
            <h3 className="text-[11px] font-bold text-emerald-700 mb-2">
              Strengths
            </h3>
            <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-1">
              {summary.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-red-600 mb-2">
              Gaps
            </h3>
            <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-1">
              {summary.gaps.map((gap, index) => (
                <li key={index}>{gap}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 mt-4">
          <p className="text-xs font-bold text-emerald-800">
            👍 Recommendation: {summary.recommendation}
          </p>
        </div>
      </div>
    </section>
  );
}

export default ReportSummary;
