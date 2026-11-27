import { useEffect, useState } from "react";
import {
  Briefcase,
  CalendarDays,
  ChartColumn,
  ChevronLeft,
  ChevronRight,
  CodeXml,
  Cpu,
  FileText,
  Headset,
  History as HistoryIcon,
  PenTool,
  Plus,
  Search,
  Users,
} from "lucide-react";
import PageHeader, { PageContainer } from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import { ButtonLink } from "../components/ui/Button";
import { Select } from "../components/ui/Input";
import { ModelBadge, Pill, StatusBadge } from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services";
import { formatDate, formatTime, verdictFromScore } from "../lib/format";
import { getErrorMessage } from "../lib/errors";

const PAGE_SIZE = 8;

const iconForTitle = (title = "") => {
  const t = title?.toLowerCase();
  if (/engineer|developer|devops|qa|tester|programmer|architect/.test(t))
    return CodeXml;
  if (/design/.test(t)) return PenTool;
  if (/analyst|data|finance/.test(t)) return ChartColumn;
  if (/hr|people|recruit|talent/.test(t)) return Users;
  if (/support|success|customer/.test(t)) return Headset;
  return Briefcase;
};

const SCORE_TONE = {
  strong: "bg-mint-50 text-strong",
  moderate: "bg-amber-50 text-moderate",
  weak: "bg-red-50 text-weak",
};

function Stat({ label, value }) {
  return (
    <Card className="px-4 py-3.5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value ?? "—"}</p>
    </Card>
  );
}

function TopScore({ item }) {
  if (item.top_score == null) {
    return item.status === "done" ? (
      <span className="text-sm text-gray-400">—</span>
    ) : (
      <StatusBadge status={item.status} />
    );
  }
  const v = item.top_verdict || verdictFromScore(item.top_score);
  return (
    <Pill className={SCORE_TONE[v]}>
      <span className="font-bold">{Math.round(item.top_score)}</span>
      <span className="font-medium capitalize">{v}</span>
    </Pill>
  );
}

function SkeletonRows() {
  return Array.from({ length: 5 }, (_, i) => (
    <tr key={i} className="border-t border-gray-100">
      <td colSpan={6} className="px-5 py-3.5">
        <div className="h-8 animate-pulse rounded-lg bg-gray-100" />
      </td>
    </tr>
  ));
}

// P8 — past analyses. "Open" goes straight to the ranking (P4), skipping P3.
export default function HistoryPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [days, setDays] = useState("90");
  const [model, setModel] = useState("");
  const [page, setPage] = useState(1);

  // debounce typing
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, error, loading } = useAsync(
    () =>
      api.listAnalyses({
        page,
        pageSize: PAGE_SIZE,
        search,
        days: days || undefined,
        model: model || undefined,
      }),
    [page, search, days, model],
  );

  const stats = data?.stats;
  const items = data?.items || [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 1;
  const from = total ? (data.page - 1) * data.page_size + 1 : 0;
  const to = total ? from + items.length - 1 : 0;
  const filtered = !!(search || model || days !== "");
  const firstLoad = loading && !data;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Past analyses"
        title="History"
        description="Reopen any previous analysis to review rankings and download reports."
        actions={
          <ButtonLink to="/">
            <Plus className="h-4 w-4" /> New analysis
          </ButtonLink>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total analyses" value={stats?.total_analyses} />
        <Stat label="Resumes scored" value={stats?.resumes_scored} />
        <Stat
          label="Avg. top score"
          value={
            stats?.avg_top_score != null
              ? Math.round(stats.avg_top_score)
              : null
          }
        />
        <Stat label="This month" value={stats?.this_month_count} />
      </div>

      {error && (
        <Alert className="mb-4" title="Could not load history">
          {getErrorMessage(error)}
        </Alert>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
          <div className="relative min-w-52 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by job title…"
              aria-label="Search by job title"
              className="h-10 w-full rounded-xl border border-gray-300 pr-3 pl-9 text-sm placeholder:text-gray-400 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 focus:outline-none"
            />
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Select
              id="days"
              icon={CalendarDays}
              value={days}
              onChange={(e) => {
                setDays(e.target.value);
                setPage(1);
              }}
              aria-label="Date range"
              className="w-44"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="">All time</option>
            </Select>
            <Select
              id="model"
              icon={Cpu}
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setPage(1);
              }}
              aria-label="Model"
              className="w-40"
            >
              <option value="">All models</option>
              <option value="claude">Claude</option>
              <option value="gemini">Gemini</option>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3">Job title</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Resumes</th>
                <th className="px-5 py-3">Top score</th>
                <th className="px-5 py-3">Model</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={loading && data ? "opacity-60" : ""}>
              {firstLoad ? (
                <SkeletonRows />
              ) : (
                items.map((item) => {
                  const Icon = iconForTitle(item.jd_title);
                  return (
                    <tr
                      key={item.job_id}
                      className="border-t border-gray-100 hover:bg-gray-50/60"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mint-50 text-strong">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {item.jd_title || "Untitled role"}
                            </p>
                            {item.status !== "done" && (
                              <p className="text-xs text-gray-500 capitalize">
                                {item.status}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">
                          {formatDate(item.created_at)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(item.created_at)}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1.5 font-medium text-gray-800">
                          <FileText className="h-4 w-4 text-gray-400" />{" "}
                          {item.total_resumes}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <TopScore item={item} />
                      </td>
                      <td className="px-5 py-3">
                        {item.model_used ? (
                          <ModelBadge model={item.model_used} />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <ButtonLink
                          to={`/analyze/${item.job_id}/results`}
                          variant="outline"
                          size="xs"
                        >
                          Open
                        </ButtonLink>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!firstLoad && !items.length && !error && (
          <EmptyState
            icon={HistoryIcon}
            title={filtered ? "No analyses match" : "No analyses yet"}
            description={
              filtered
                ? "Try another job title, date range or model."
                : "Score your first batch of resumes and it will show up here."
            }
            action={
              !filtered && (
                <ButtonLink to="/" size="sm">
                  <Plus className="h-4 w-4" /> New analysis
                </ButtonLink>
              )
            }
          />
        )}

        {total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 text-sm text-gray-600">
            <span>
              Showing{" "}
              <strong className="text-gray-900">
                {from}–{to}
              </strong>{" "}
              of {total} analyses
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1,
                )
                .map((n, i, arr) => (
                  <span key={n} className="flex items-center gap-1">
                    {i > 0 && n - arr[i - 1] > 1 && (
                      <span className="px-1 text-gray-400">…</span>
                    )}
                    <button
                      onClick={() => setPage(n)}
                      aria-current={n === page ? "page" : undefined}
                      className={`h-8 min-w-8 rounded-lg px-2 text-sm font-semibold ${n === page ? "bg-primary-600 text-white" : "hover:bg-gray-100"}`}
                    >
                      {n}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
