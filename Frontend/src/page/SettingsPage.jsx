import { useState } from "react";

const defaults = {
  Skills: 35,
  Experience: 35,
  Education: 15,
  Certifications: 15,
};

export default function SettingsPage({ onBack }) {
  const [weights, setWeights] = useState(defaults);
  const [saved, setSaved] = useState(false);
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  const changeWeight = (key, value) => {
    setWeights((current) => ({ ...current, [key]: Number(value) }));
    setSaved(false);
  };
  const jump = (id) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  const nav = [
    ["Scoring weights", "scoring-weights", "☷"],
    ["Verdict thresholds", "verdict-thresholds", "◉"],
    ["Account", "account", "♙"],
    ["Team members", "team-members", "♧"],
  ];
  const weightColors = ["#2864f0", "#20bf62", "#ffb81b", "#8b5cf6"];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6">
      <header className="mb-5 flex items-center justify-between gap-5">
        <div>
          <span className="mb-1.5 block text-[11px] font-bold tracking-[.09em] text-green-700">WORKSPACE</span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="mt-1.5 text-sm text-gray-500">Configure how resumes are scored for your team.</p>
        </div>
        <button className="min-h-9 whitespace-nowrap rounded-control border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50" onClick={onBack}>
          ← Past analyses
        </button>
      </header>
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="sticky top-3 flex flex-col gap-1 rounded-control border border-border bg-white p-2 max-md:static max-md:flex-row max-md:overflow-x-auto" aria-label="Settings sections">
          {nav.map(([label, id, icon], index) => (
            <div className="contents" key={id}>
              {index === 2 && <div aria-hidden="true" className="my-1 border-t border-gray-200 max-md:mx-1 max-md:my-0 max-md:h-8 max-md:w-px max-md:self-center max-md:border-l max-md:border-t-0" />}
              <button
                className={`flex h-10 w-auto shrink-0 items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-medium transition-colors md:w-full ${index === 0 ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
                onClick={() => jump(id)}
              >
                <span>{icon}</span>
                {label}
              </button>
            </div>
          ))}
        </aside>
        <div className="grid gap-4">
          <section className="scroll-mt-4 rounded-control border border-border bg-white p-5 sm:p-6" id="scoring-weights">
            <div className="flex items-center justify-between gap-3 max-[540px]:items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Scoring weights</h2>
                <p className="mt-1 text-sm leading-5 text-gray-500">
                  How much each section contributes to the overall score. Must
                  total 100%.
                </p>
              </div>
              <button
                className="min-h-9 whitespace-nowrap rounded-control border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  setWeights(defaults);
                  setSaved(false);
                }}
              >
                ↶ &nbsp;Reset to default
              </button>
            </div>
            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-gray-100">
              {Object.keys(weights).map((key, index) => (
                <span
                  key={key}
                  style={{
                    width: `${weights[key]}%`,
                    background: weightColors[index],
                  }}
                />
              ))}
            </div>
            <div className="mt-3 grid gap-2">
              {Object.entries(weights).map(([key, value], index) => (
                <label className="grid grid-cols-[32px_120px_minmax(60px,1fr)_76px] items-center gap-2.5 max-[540px]:grid-cols-[28px_86px_minmax(40px,1fr)_56px] max-[540px]:gap-1.5" key={key}>
                  <span className="grid size-8 place-items-center rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-500 max-[540px]:size-7">
                    {["‹/›", "▣", "⚑", "✳"][index]}
                  </span>
                  <b className="text-xs font-semibold text-gray-700">
                    {key}
                    <i className="ml-2 inline-block size-1.5 rounded-full align-middle" style={{ background: weightColors[index] }} />
                  </b>
                  <input
                    className="w-full accent-blue-600"
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(event) => changeWeight(key, event.target.value)}
                    aria-label={`${key} weight`}
                  />
                  <span className="flex h-9 items-center justify-end rounded-lg border border-gray-300 px-2.5 text-xs font-semibold text-gray-700">
                    {value}
                    <small className="ml-1 text-gray-400">%</small>
                  </span>
                </label>
              ))}
            </div>
            <div
              className={`mt-4 flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm ${total === 100 ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}
            >
              <span>
                ● &nbsp;
                {total === 100
                  ? "Weights are balanced"
                  : `Weights total ${total}% · adjust to reach 100%`}
              </span>
              <b className="text-lg">{total}%</b>
            </div>
          </section>

          <section className="scroll-mt-4 rounded-control border border-border bg-white p-5 sm:p-6" id="verdict-thresholds">
            <h2 className="text-lg font-bold text-gray-900">
              Verdict thresholds <span className="ml-1 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500">▣ Read-only</span>
            </h2>
            <p className="mt-1 text-sm leading-5 text-gray-500">
              Overall scores map to these verdicts across all analyses.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <article className="flex min-h-20 flex-col justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
                <span className="w-fit rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold">● &nbsp;Strong fit</span>
                <b className="text-lg">75 – 100</b>
              </article>
              <article className="flex min-h-20 flex-col justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                <span className="w-fit rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold">● &nbsp;Moderate fit</span>
                <b className="text-lg">50 – 74</b>
              </article>
              <article className="flex min-h-20 flex-col justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
                <span className="w-fit rounded-full bg-white/80 px-2 py-1 text-[10px] font-semibold">● &nbsp;Weak fit</span>
                <b className="text-lg">Below 50</b>
              </article>
            </div>
            <div className="mt-3 flex h-1 overflow-hidden rounded-full">
              <i className="w-1/2 bg-red-400" />
              <i className="w-1/4 bg-amber-400" />
              <i className="w-1/4 bg-green-500" />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
              <span>0</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </section>

        </div>
      </div>
      <footer className="fixed inset-x-0 bottom-0 z-10 flex min-h-14 items-center justify-between border-t border-gray-200 bg-white/95 px-4 py-2 text-xs text-gray-500 backdrop-blur sm:px-6">
        <span>{saved ? "All changes saved" : "You have unsaved changes"}</span>
        <div className="flex gap-2">
          <button className="min-h-10 rounded-control border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50" onClick={onBack}>
            Cancel
          </button>
          <button
            className="min-h-10 rounded-control bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={total !== 100}
            onClick={() => setSaved(true)}
          >
            ▣ &nbsp;Save changes
          </button>
        </div>
      </footer>
    </main>
  );
}
