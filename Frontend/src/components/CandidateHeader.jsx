
import { useState } from "react";
import {
  Download,
  Star,
  FileText,
  Mail,
  BriefcaseBusiness,
  MapPin,
  Trophy,
  Check,
} from "lucide-react";

function CandidateHeader({ candidate, onDownloadReport }) {
  const [shortlisted, setShortlisted] = useState(false);

  return (
    <div className="bg-gradient-to-r from-white to-green-50 border border-green-100 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center gap-6">

        <div className="shrink-0">
          <div className="w-28 h-28 rounded-full border-[7px] border-green-500 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-800">
              {candidate.score}
            </span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
        </div>

        <div className="flex-1 text-center lg:text-left">
          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 mb-3">
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <Trophy size={13} />
              #{candidate.rank} of {candidate.totalCandidates}
            </span>

            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              {candidate.fit}
            </span>

            <span className="bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
              {candidate.aiModel}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            {candidate.name}
          </h1>

          <p className="text-sm text-slate-600 mt-1 flex items-center justify-center lg:justify-start gap-1">
            <BriefcaseBusiness size={14} />
            {candidate.jobTitle}
            <span>·</span>
            <MapPin size={14} />
            {candidate.location}
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <FileText size={14} />
              {candidate.resumeName}
            </span>

            <span className="flex items-center gap-1">
              <Mail size={14} />
              {candidate.email}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Job: {candidate.jobTitle}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full lg:w-44 shrink-0">
          <button
            onClick={onDownloadReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Download PDF report
          </button>

          <button
            onClick={() => setShortlisted(!shortlisted)}
            className={`flex items-center justify-center gap-2 border px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              shortlisted
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {shortlisted ? <Check size={17} /> : <Star size={17} />}
            {shortlisted ? "Shortlisted" : "Shortlist"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default CandidateHeader;
