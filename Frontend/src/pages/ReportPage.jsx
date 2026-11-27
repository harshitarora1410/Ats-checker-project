import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, FileText, Hourglass, Minus, Plus, Printer } from "lucide-react";
import ReportDocument from "../components/report/ReportDocument";
import { exportElementToPdf } from "../components/report/exportPdf";
import Button, { ButtonLink } from "../components/ui/Button";
import Card from "../components/ui/Card";
import { PageSpinner } from "../components/ui/Spinner";
import EmptyState, { ErrorState } from "../components/ui/EmptyState";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services";
import { nameFromFilename } from "../lib/files";
import { fileSafe } from "../lib/format";
import { getErrorMessage } from "../lib/errors";

const ZOOMS = [0.5, 0.75, 0.9, 1, 1.1, 1.25, 1.5];
const initialZoom = () => {
  const fit = (window.innerWidth - 32) / 794;
  return fit >= 1 ? 1 : ZOOMS.filter((z) => z <= fit).pop() || 0.5;
};

const stamp = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// P6 — PDF report viewer: zoom, Print (browser dialog) and Download (.pdf file)
export default function ReportPage() {
  const { jobId, resumeId } = useParams();
  const sheetRef = useRef(null);
  const [zoom, setZoom] = useState(initialZoom);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [generatedAt] = useState(() => stamp.format(new Date()));

  const { data: detail, error, loading } = useAsync(() => api.getResume(jobId, resumeId), [jobId, resumeId]);
  const backUrl = `/analyze/${jobId}/resumes/${resumeId}`;

  if (loading) return <PageSpinner label="Preparing report…" />;

  if (!detail || detail.status !== "done") {
    return (
      <div className="min-h-screen bg-canvas p-6">
        <Card className="mx-auto max-w-xl">
          {detail ? (
            <EmptyState
              icon={Hourglass}
              title="Report not ready"
              description={detail.error_message || "The report is available once this resume has been scored."}
              action={<ButtonLink to={backUrl}>Back to candidate</ButtonLink>}
            />
          ) : (
            <ErrorState error={error} notFoundTitle="Report not found" action={<ButtonLink to={backUrl}>Back to candidate</ButtonLink>} />
          )}
        </Card>
      </div>
    );
  }

  const name = detail.candidate_name || nameFromFilename(detail.original_filename);
  const filename = `${fileSafe(name)}_ATS_Report.pdf`;

  const download = async () => {
    setDownloading(true);
    setDownloadError("");
    try {
      await exportElementToPdf(sheetRef.current, filename, `${name} — ATS report`);
    } catch (err) {
      setDownloadError(getErrorMessage(err, "Could not create the PDF. Use Print → Save as PDF instead."));
    } finally {
      setDownloading(false);
    }
  };

  const zoomIndex = ZOOMS.indexOf(zoom);

  return (
    <div className="min-h-screen bg-gray-200">
      <header className="no-print sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 bg-gray-900 px-4 py-2.5 text-white sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link to={backUrl} className="rounded-lg p-1.5 hover:bg-white/10" aria-label="Back to candidate">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <FileText className="h-4 w-4 shrink-0 text-red-400" />
          <span className="truncate text-sm font-semibold">{filename}</span>
          <span className="hidden text-xs text-gray-400 sm:inline">· A4</span>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-white/10 px-1 py-0.5">
          <button
            onClick={() => setZoom(ZOOMS[Math.max(0, zoomIndex - 1)])}
            disabled={zoomIndex <= 0}
            className="rounded p-1.5 hover:bg-white/10 disabled:opacity-40"
            aria-label="Zoom out"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-12 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(ZOOMS[Math.min(ZOOMS.length - 1, zoomIndex + 1)])}
            disabled={zoomIndex >= ZOOMS.length - 1}
            className="rounded p-1.5 hover:bg-white/10 disabled:opacity-40"
            aria-label="Zoom in"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="dark" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button size="sm" onClick={download} loading={downloading}>
            {!downloading && <Download className="h-4 w-4" />} Download
          </Button>
        </div>
      </header>

      {downloadError && (
        <p className="no-print bg-red-50 px-6 py-2 text-center text-sm text-red-700" role="alert">
          {downloadError}
        </p>
      )}

      <div className="print-reset overflow-x-auto px-4 py-8">
        <div className="print-reset mx-auto w-fit" style={{ zoom }}>
          <ReportDocument ref={sheetRef} detail={detail} name={name} generatedAt={generatedAt} />
        </div>
      </div>
    </div>
  );
}
