
import { FileText } from "lucide-react";

function ResumePreview({ resume }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center gap-2">
        <FileText size={17} className="text-slate-500" />
        <h2 className="text-sm font-bold text-slate-800">
          Resume preview
        </h2>
      </div>

      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
        <span className="text-[11px] text-slate-500">
          <span className="inline-block w-2 h-2 bg-emerald-300 rounded-sm mr-1.5" />
          Matched keyword · 2 pages
        </span>
      </div>

      <div className="p-5 text-slate-700 space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {resume.name}
          </h2>
          <p className="text-[10px] text-slate-500 mt-1">
            {resume.title} · {resume.location} · {resume.email}
          </p>
        </div>

        <section>
          <h3 className="text-[10px] font-bold text-slate-900 uppercase mb-2">
            Summary
          </h3>
          <p className="text-[11px] leading-relaxed">
            {resume.summary}
          </p>
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-slate-900 uppercase mb-3">
            Experience
          </h3>

          <div className="space-y-4">
            {resume.experience.map((job, index) => (
              <div key={index}>
                <h4 className="text-[11px] font-bold text-slate-800">
                  {job.role}{" "}
                  <span className="font-normal text-slate-500">
                    ({job.period})
                  </span>
                </h4>

                <ul className="list-disc pl-4 mt-1 space-y-1">
                  {job.points.map((point, pointIndex) => (
                    <li
                      key={pointIndex}
                      className="text-[11px] leading-relaxed"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-slate-900 uppercase mb-2">
            Education
          </h3>
          <p className="text-[11px] leading-relaxed">
            {resume.education}
          </p>
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-slate-900 uppercase mb-2">
            Certifications
          </h3>
          <ul className="list-disc pl-4 space-y-1">
            {resume.certifications.map((item, index) => (
              <li key={index} className="text-[11px] leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-slate-900 uppercase mb-2">
            Skills
          </h3>
          <p className="text-[11px] leading-relaxed">
            {resume.skills}
          </p>
        </section>
      </div>
    </div>
  );
}

export default ResumePreview;
