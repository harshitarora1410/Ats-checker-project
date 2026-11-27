
function MatchDetails({ details }) {
  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-800 mb-3">
        Matched & Missing by Section
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {details.map((section) => (
          <div
            key={section.title}
            className="border border-slate-200 rounded-lg p-3"
          >
            <h3 className="text-xs font-bold text-slate-800 mb-2">
              {section.title}
            </h3>

            <p className="text-[11px] text-emerald-700 leading-relaxed">
              <span className="font-bold">✓</span>{" "}
              {section.matched.join(", ")}
            </p>

            <p className="text-[11px] text-red-600 leading-relaxed mt-1">
              <span className="font-bold">✕</span>{" "}
              {section.missing.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MatchDetails;
