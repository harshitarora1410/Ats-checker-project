
function SectionScores({ sections, overallScore }) {
  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-800 mb-3">
        Section Scores
      </h2>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left p-3 font-semibold">Section</th>
              <th className="text-left p-3 font-semibold">Weight</th>
              <th className="text-left p-3 font-semibold w-[36%]">Score</th>
              <th className="text-right p-3 font-semibold">Weighted</th>
            </tr>
          </thead>

          <tbody>
            {sections.map((item) => (
              <tr key={item.title} className="border-t border-slate-100">
                <td className="p-3 font-semibold text-slate-800">
                  {item.title}
                </td>
                <td className="p-3 text-slate-500">{item.weight}</td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className="font-semibold text-slate-700 w-6">
                      {item.score}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-right font-semibold text-slate-700">
                  {item.weighted}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="bg-emerald-50 border-t border-emerald-100">
              <td colSpan="3" className="p-3 font-bold text-slate-800">
                Overall score
              </td>
              <td className="p-3 text-right font-bold text-emerald-700">
                {overallScore} / 100
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export default SectionScores;
