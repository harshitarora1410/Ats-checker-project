import { useRef, useState } from "react";
import { ArrowDown, CloudUpload, FileWarning } from "lucide-react";
import { ACCEPT_ATTR } from "../../lib/constants";

/**
 * Drag & drop + click-to-browse file picker (no extra library).
 * States from the design: default, drag over, error.
 * onFiles(File[]) receives every picked file; validation happens in the parent.
 */
export default function Dropzone({ onFiles, multiple = true, title, hint, error = false, icon: Icon = CloudUpload, className = "" }) {
  const inputRef = useRef(null);
  const depth = useRef(0);
  const [over, setOver] = useState(false);

  const take = (list) => {
    const files = Array.from(list || []);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

  const open = () => inputRef.current?.click();

  const tone = over
    ? "border-primary-600 bg-primary-50 text-primary-600"
    : error
      ? "border-red-300 bg-red-50/50 text-weak"
      : "border-blue-200 bg-blue-50/30 text-gray-900 hover:border-primary-600 hover:bg-primary-50/60";

  const Glyph = over ? ArrowDown : error ? FileWarning : Icon;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        depth.current += 1;
        setOver(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault();
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        depth.current = 0;
        setOver(false);
        take(e.dataTransfer.files);
      }}
      className={`flex min-h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 ${tone} ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ACCEPT_ATTR}
        multiple={multiple}
        onChange={(e) => {
          take(e.target.files);
          e.target.value = ""; // allow picking the same file again
        }}
      />
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-strong shadow-sm">
        <Glyph className={`h-5 w-5 ${over ? "text-primary-600" : error ? "text-weak" : ""}`} />
      </span>
      <p className="text-sm font-semibold">{over ? "Release to upload" : title}</p>
      <p className="mt-1 text-xs text-gray-500">
        or <span className="font-semibold text-primary-600">browse</span> · {hint}
      </p>
    </div>
  );
}
