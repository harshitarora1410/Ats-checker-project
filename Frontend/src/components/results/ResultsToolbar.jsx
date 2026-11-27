import { ArrowUpDown, Download, Search } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { Select } from "../ui/Input";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "strong", label: "Strong", dot: "bg-strong" },
  { key: "moderate", label: "Moderate", dot: "bg-moderate" },
  { key: "weak", label: "Weak", dot: "bg-weak" },
];

export default function ResultsToolbar({ query, onQuery, filter, onFilter, sort, onSort, counts, onExport, exportDisabled }) {
  return (
    <Card className="flex flex-wrap items-center gap-3 p-3">
      <div className="relative min-w-52 flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search candidates by name…"
          aria-label="Search candidates"
          className="h-10 w-full rounded-xl border border-gray-300 bg-white pr-3 pl-9 text-sm placeholder:text-gray-400 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 focus:outline-none"
        />
      </div>

      <div className="flex max-w-full overflow-x-auto rounded-xl bg-gray-100 p-1" role="tablist" aria-label="Filter by verdict">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => onFilter(f.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {f.dot && <span className={`h-1.5 w-1.5 rounded-full ${f.dot}`} />}
            {f.label}
            <span className="text-xs text-gray-400">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Select id="sort" value={sort} onChange={(e) => onSort(e.target.value)} icon={ArrowUpDown} aria-label="Sort candidates" className="w-40">
          <option value="score">Sort: Score</option>
          <option value="name">Sort: Name</option>
        </Select>
        <Button size="sm" onClick={onExport} disabled={exportDisabled}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>
    </Card>
  );
}
