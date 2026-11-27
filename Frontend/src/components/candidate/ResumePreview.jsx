import { useMemo } from "react";
import { FileText } from "lucide-react";
import Card from "../ui/Card";
import { SECTION_KEYS } from "../../lib/constants";

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Builds one regex from every matched keyword (longest first), with word
// boundaries where the keyword starts/ends with a letter or digit.
const buildMatcher = (sections) => {
  const words = new Set();
  for (const k of SECTION_KEYS) {
    for (const item of sections?.[k]?.matched || []) {
      for (const part of String(item).split(/\s*[,/]\s*/)) {
        const w = part.trim();
        if (w.length >= 2 && w.length <= 40) words.add(w);
      }
    }
  }
  if (!words.size) return null;
  const pattern = [...words]
    .sort((a, b) => b.length - a.length)
    .map((w) => `${/^\w/.test(w) ? "\\b" : ""}${escapeRe(w)}${/\w$/.test(w) ? "\\b" : ""}`)
    .join("|");
  return new RegExp(`(${pattern})`, "gi");
};

function Highlighted({ text, matcher }) {
  if (!matcher) return text;
  return text.split(matcher).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-mint-100 px-0.5 text-green-900">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const isHeading = (line) => line.length <= 40 && /^[A-Z][A-Z &/]+$/.test(line.trim());

// Right-hand "Resume preview" panel on P5 — extracted_text with matched keywords highlighted
export default function ResumePreview({ text, sections, filename }) {
  const matcher = useMemo(() => buildMatcher(sections), [sections]);
  const lines = (text || "").split(/\r?\n/);

  return (
    <Card className="flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="flex items-center gap-2 font-bold text-gray-900">
          <FileText className="h-4 w-4 text-gray-500" /> Resume preview
        </h2>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-mint-100 ring-1 ring-green-200" /> Matched keyword
          </span>
          {filename && <span className="truncate">· {filename}</span>}
        </p>
      </div>
      <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4">
        {text ? (
          <div className="space-y-0.5 text-[13px] leading-relaxed text-gray-800">
            {lines.map((line, i) =>
              !line.trim() ? (
                <div key={i} className="h-2.5" />
              ) : isHeading(line) ? (
                <p key={i} className={`pt-1 text-xs font-bold tracking-wider text-gray-900 ${i === 0 ? "text-base tracking-normal" : ""}`}>
                  {line.trim()}
                </p>
              ) : (
                <p key={i}>
                  <Highlighted text={line} matcher={matcher} />
                </p>
              )
            )}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-gray-400">No text preview is available for this file.</p>
        )}
      </div>
    </Card>
  );
}
