import { FileText } from "lucide-react";
import { getExt } from "../../lib/files";

// PDF red, Word blue, everything else grey
export default function FileIcon({ name, className = "h-9 w-9" }) {
  const ext = getExt(name);
  const tone =
    ext === "pdf" ? "bg-red-50 text-red-500" : ext === "doc" || ext === "docx" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-lg ${tone} ${className}`} title={ext.toUpperCase()}>
      <FileText className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}
