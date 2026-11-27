import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { ACCEPT, MAX_FILE_BYTES } from "../../utils/constants";

// onFiles(acceptedFiles, rejections) is called on every drop / browse
export default function Dropzone({ onFiles, multiple = true, title, hint, compact = false }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFiles,
    accept: ACCEPT,
    maxSize: MAX_FILE_BYTES,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-colors ${
        compact ? "min-h-40 p-5" : "min-h-44 p-6"
      } ${
        isDragActive
          ? "border-primary-600 bg-primary-50"
          : "border-blue-200 bg-blue-50/40 hover:border-primary-600 hover:bg-primary-50"
      }`}
    >
      <input {...getInputProps()} />
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-primary-600 shadow-sm">
        <UploadCloud className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-gray-900">
        {isDragActive ? "Release to upload" : title}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        or <span className="font-semibold text-primary-600">browse</span> · {hint}
      </p>
    </div>
  );
}
