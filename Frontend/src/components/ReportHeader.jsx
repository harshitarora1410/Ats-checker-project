
import { FileText } from "lucide-react";

function ReportHeader({ header }) {
  return (
    <header className="flex justify-between items-center border-b-[3px] border-emerald-500 pb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
          <FileText size={22} className="text-white" />
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-900">
            ATS Resume Scorer
          </h1>
          <p className="text-xs text-slate-500">
            Candidate Assessment Report
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-[10px] uppercase tracking-wider text-slate-400">
          Job Title
        </p>

        <h2 className="text-sm font-bold text-slate-800">
          {header.jobTitle}
        </h2>

        <p className="text-[10px] text-slate-500">
          {header.company} · Report #{header.reportNumber}
        </p>
      </div>
    </header>
  );
}

export default ReportHeader;
