import { TriangleAlert } from "lucide-react";
import FileIcon from "../ui/FileIcon";
import { Pill } from "../ui/Badge";

// A resume the backend could not parse (status "failed")
export default function FailedCard({ resume }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-red-200 bg-white p-5">
      <FileIcon name={resume.original_filename} className="h-10 w-10" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-bold text-gray-900">{resume.original_filename}</p>
          <Pill className="bg-red-50 text-weak">
            <TriangleAlert className="h-3.5 w-3.5" /> Failed to parse
          </Pill>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {resume.error_message || "This file could not be processed. Upload a text-based PDF or DOCX in a new analysis to score this candidate."}
        </p>
      </div>
    </div>
  );
}
