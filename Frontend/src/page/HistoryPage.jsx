import { useState } from "react";
import Icon from "../components/Icon";

const stats = [
  ["Total analyses", "24"],
  ["Resumes scored", "612"],
  ["Avg. top score", "84"],
];

const analyses = [
  ["Senior Frontend Engineer", "Engineering", "May 14, 2025", "10:42 AM", 12, 92, "code"],
  ["Product Designer", "Design", "May 12, 2025", "3:15 PM", 28, 88, "tools"],
  ["Data Analyst", "Analytics", "May 09, 2025", "11:02 AM", 41, 79, "chart"],
  ["HR Business Partner", "People", "May 06, 2025", "9:30 AM", 17, 71, "people"],
  ["DevOps Engineer", "Engineering", "May 02, 2025", "4:48 PM", 9, 66, "code"],
  ["Customer Success Manager", "Support", "Apr 28, 2025", "2:10 PM", 35, 84, "headset"],
  ["Sales Development Rep", "Sales", "Apr 24, 2025", "10:05 AM", 52, 58, "briefcase"],
  ["Junior QA Tester", "Engineering", "Apr 19, 2025", "1:22 PM", 14, 46, "code"],
  ["Marketing Lead", "Marketing", "Apr 16, 2025", "11:30 AM", 23, 81, "chart"],
  ["Product Manager", "Product", "Apr 12, 2025", "9:12 AM", 31, 87, "briefcase"],
  ["UX Researcher", "Design", "Apr 08, 2025", "2:54 PM", 18, 73, "people"],
  ["Backend Engineer", "Engineering", "Apr 04, 2025", "4:08 PM", 27, 90, "code"],
  ["Account Executive", "Sales", "Mar 30, 2025", "10:22 AM", 38, 62, "briefcase"],
  ["Content Strategist", "Marketing", "Mar 26, 2025", "1:36 PM", 21, 77, "chart"],
  ["People Operations Manager", "People", "Mar 22, 2025", "3:48 PM", 16, 85, "people"],
  ["iOS Developer", "Engineering", "Mar 18, 2025", "11:14 AM", 19, 89, "code"],
  ["Finance Analyst", "Finance", "Mar 14, 2025", "9:06 AM", 24, 75, "chart"],
  ["Recruiting Coordinator", "People", "Mar 10, 2025", "2:42 PM", 33, 68, "people"],
  ["Visual Designer", "Design", "Mar 06, 2025", "12:18 PM", 22, 82, "tools"],
  ["Security Engineer", "Engineering", "Mar 02, 2025", "4:32 PM", 11, 91, "code"],
  ["Operations Associate", "Operations", "Feb 26, 2025", "10:46 AM", 29, 64, "briefcase"],
  ["Growth Marketing Manager", "Marketing", "Feb 22, 2025", "3:20 PM", 36, 86, "chart"],
  ["Technical Writer", "Engineering", "Feb 18, 2025", "1:04 PM", 15, 72, "file"],
  ["Customer Support Specialist", "Support", "Feb 14, 2025", "9:58 AM", 42, 78, "headset"],
].map(([title, category, date, time, resumes, score, icon]) => ({
  title,
  category,
  date,
  time,
  resumes,
  score,
  icon,
}));

function SummaryCards() {
  return (
    <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Analysis overview">
      {stats.map(([label, value]) => (
        <article className="flex min-h-20 flex-col justify-center gap-1 rounded-card border border-border bg-white px-4 py-3" key={label}>
          <span className="text-xs text-gray-500">{label}</span>
          <strong className="text-2xl font-bold tracking-tight text-gray-900">{value}</strong>
        </article>
      ))}
      <article className="flex min-h-20 flex-col justify-center gap-1 rounded-card border border-border bg-white px-4 py-3">
        <span className="text-xs text-gray-500">This month</span>
        <strong className="text-2xl font-bold tracking-tight text-gray-900">
          7 <small className="text-xs font-semibold text-green-600">↑ 40%</small>
        </strong>
      </article>
    </section>
  );
}

function Score({ score }) {
  const tone = score >= 75 ? "strong" : score >= 58 ? "moderate" : "weak";
  const toneClasses = {
    strong: "bg-green-50 text-green-700",
    moderate: "bg-amber-50 text-amber-700",
    weak: "bg-red-50 text-red-600",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs leading-4 ${toneClasses[tone]}`}>
      <i className="size-1.5 rounded-full bg-current" />
      <b>{score}</b>
      {tone[0].toUpperCase() + tone.slice(1)}
    </span>
  );
}

function AnalysisTable({ onNotice }) {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("Last 90 days");
  const [page, setPage] = useState(1);
  const filtered = analyses.filter((row) =>
    row.title.toLowerCase().includes(query.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const shown = filtered.slice((page - 1) * 8, page * 8);
  const pageTo = (number) => setPage(Math.max(1, Math.min(pages, number)));

  return (
    <section className="overflow-hidden rounded-card border border-border bg-white">
      <div className="flex min-h-16 items-center justify-between gap-3 border-b border-gray-100 p-3 max-[540px]:flex-col max-[540px]:items-stretch">
        <label className="flex h-10 w-full max-w-[281px] items-center gap-2.5 rounded-control border border-gray-300 px-3 text-gray-400 shadow-sm max-[540px]:max-w-none">
          <Icon name="search" size={13} />
          <input
            className="w-full min-w-0 border-0 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            aria-label="Search by job title"
            placeholder="Search by job title..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <div className="flex gap-2 max-[540px]:justify-end">
          <label className="inline-flex min-h-10 items-center gap-2 rounded-control border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-600">
            <Icon name="calendar" size={12} />
            <select
              className="max-w-[110px] cursor-pointer appearance-none border-0 bg-transparent text-inherit outline-none"
              aria-label="Filter by date range"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last 180 days</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
            <Icon name="down" size={11} />
          </label>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed border-collapse text-left">
          <thead>
            <tr>
              <th className="h-10 w-[34%] pl-4 text-[10px] font-semibold tracking-wide text-gray-500">JOB TITLE</th>
              <th className="w-[16%] text-[10px] font-semibold tracking-wide text-gray-500">DATE</th>
              <th className="w-[12%] text-[10px] font-semibold tracking-wide text-gray-500">RESUMES</th>
              <th className="w-[18%] text-[10px] font-semibold tracking-wide text-gray-500">TOP SCORE</th>
              <th className="w-[20%] pr-4 text-right text-[10px] font-semibold tracking-wide text-gray-500">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr className="border-t border-gray-100 text-sm text-gray-800 hover:bg-gray-50/70" key={row.title}>
                <td className="h-[60px] pl-4">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-green-100 bg-green-50 text-green-700">
                      <Icon name={row.icon} size={13} />
                    </span>
                    <span className="min-w-0">
                      <b className="block truncate text-xs font-semibold leading-4 text-gray-800">{row.title}</b>
                      <small className="block text-[11px] leading-4 text-gray-400">{row.category}</small>
                    </span>
                  </div>
                </td>
                <td className="h-[60px]">
                  <b className="block text-xs font-medium leading-4">{row.date}</b>
                  <small className="block text-[11px] leading-4 text-gray-400">{row.time}</small>
                </td>
                <td className="h-[60px]">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                    <Icon name="file" size={11} />
                    {row.resumes}
                  </span>
                </td>
                <td className="h-[60px]"><Score score={row.score} /></td>
                <td className="h-[60px] pr-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_22px] items-center gap-2">
                    <button
                      className="justify-self-center rounded-control border border-blue-600 bg-white px-3.5 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                      onClick={() => onNotice(`Opened ${row.title} analysis.`)}
                    >
                      Open
                    </button>
                    <button
                      className="grid size-[22px] place-items-center bg-transparent text-gray-400 hover:text-gray-700"
                      aria-label={`More actions for ${row.title}`}
                      onClick={() => onNotice(`More actions for ${row.title}.`)}
                    >
                      <Icon name="dots" size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!shown.length && (
              <tr>
                <td className="h-24 text-center text-sm text-gray-500" colSpan="5">
                  No analyses match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="flex min-h-[52px] items-center justify-between gap-3 border-t border-gray-100 px-4 py-2 text-xs text-gray-500 max-[540px]:flex-col max-[540px]:items-start">
        <span>
          Showing <b>{filtered.length ? (page - 1) * 8 + 1 : 0}–{Math.min(page * 8, filtered.length)}</b> of {filtered.length} analyses
        </span>
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous page"
            className="grid size-8 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            disabled={page === 1}
            onClick={() => pageTo(page - 1)}
          >
            <Icon name="left" size={14} />
          </button>
          {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
            <button
              key={number}
              aria-current={page === number ? "page" : undefined}
              className={`grid size-8 place-items-center rounded-lg text-xs ${page === number ? "bg-blue-600 font-semibold text-white" : "text-gray-600 hover:bg-gray-100"}`}
              onClick={() => pageTo(number)}
            >
              {number}
            </button>
          ))}
          <button
            aria-label="Next page"
            className="grid size-8 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            disabled={page === pages}
            onClick={() => pageTo(page + 1)}
          >
            <Icon name="right" size={14} />
          </button>
        </div>
      </footer>
    </section>
  );
}

export default function HistoryPage() {
  const [notice, setNotice] = useState("");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex items-end justify-between gap-5 max-[540px]:items-start">
        <div>
          <span className="mb-1.5 block text-[11px] font-bold tracking-[.09em] text-green-700">PAST ANALYSES</span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">History</h1>
          <p className="mt-1.5 text-sm text-gray-500 max-[540px]:max-w-[260px]">
            Reopen any previous analysis to review rankings and download reports.
          </p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 max-[540px]:min-h-10 max-[540px]:px-3"
          onClick={() => setNotice("Your new analysis is ready to set up.")}
        >
          <span aria-hidden="true">＋</span> New analysis
        </button>
      </div>
      {notice && (
        <div className="mb-3 flex items-center justify-between rounded-control border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm text-blue-700" role="status">
          {notice}
          <button className="bg-transparent text-lg" aria-label="Dismiss" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
      <SummaryCards />
      <AnalysisTable onNotice={setNotice} />
    </main>
  );
}
