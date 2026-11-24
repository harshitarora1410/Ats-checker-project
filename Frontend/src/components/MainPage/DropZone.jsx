import { useRef, useState } from "react";

// A dashed box where the user can drag & drop files or click to browse.
// Colours and height are passed in through `className` / `iconClassName`,
// so each card decides how its own drop zone looks.

export default function DropZone({
  accept,
  multiple = false,
  onFiles,
  className = "",
  iconClassName = "",
  icon,
  title,
  hint,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function openFilePicker() {
    fileInputRef.current.click();
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    onFiles(Array.from(event.dataTransfer.files));
  }

  function handleBrowse(event) {
    onFiles(Array.from(event.target.files));
    event.target.value = ""; // allows picking the same file again
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openFilePicker}
      onKeyDown={(e) =>
        (e.key === "Enter" || e.key === " ") && openFilePicker()
      }
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        isDragging ? "ring-2 ring-blue-400" : ""
      } ${className}`}
    >
      <span
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border bg-white shadow-sm ${iconClassName}`}
      >
        {icon}
      </span>

      <p className="text-[13px] font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={handleBrowse}
      />
    </div>
  );
}
