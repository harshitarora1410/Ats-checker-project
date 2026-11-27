
import {
  Code,
  BriefcaseBusiness,
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

function ScoreBreakdown({ sections }) {
  const icons = {
    skills: Code,
    experience: BriefcaseBusiness,
    education: GraduationCap,
    certifications: Award,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {sections.map((section) => {
        const Icon = icons[section.icon];

        return (
          <div
            key={section.title}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <Icon size={20} className="text-blue-600" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    {section.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Weight {section.weight} · contributes {section.weighted} pts
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold text-slate-800">
                  {section.score}
                </span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${section.score}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                  Matched Items
                </h4>

                <ul className="space-y-1.5">
                  {section.matched.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-1.5 text-xs text-slate-700"
                    >
                      <CheckCircle2
                        size={13}
                        className="text-emerald-500 shrink-0 mt-0.5"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                  Missing Items
                </h4>

                <ul className="space-y-1.5">
                  {section.missing.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-1.5 text-xs text-slate-700"
                    >
                      <XCircle
                        size={13}
                        className="text-red-500 shrink-0 mt-0.5"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mt-5">
              <h4 className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 mb-1">
                <Sparkles size={13} />
                Why this score
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                {section.explanation}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ScoreBreakdown;
