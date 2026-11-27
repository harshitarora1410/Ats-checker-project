import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award, Briefcase, CircleCheck, CodeXml, Cpu, GraduationCap, LogOut, Plug, RotateCcw, Save, SlidersHorizontal,
  Sparkles, Star, TriangleAlert, User, Users, Gauge,
} from "lucide-react";
import PageHeader, { PageContainer } from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import Spinner from "../components/ui/Spinner";
import { Pill } from "../components/ui/Badge";
import { useAuth } from "../hooks/useAuth";
import { useAsync } from "../hooks/useAsync";
import { api } from "../services";
import { DEFAULT_WEIGHTS, PROVIDERS, ROLE_LABELS, SECTION_KEYS, SECTION_LABELS, VERDICTS } from "../lib/constants";
import { loadSettings, saveSettings, weightsTotal } from "../lib/settingsStore";
import { formatDate } from "../lib/format";
import { getErrorMessage } from "../lib/errors";
import { API_ORIGIN, USE_MOCK } from "../config";

const NAV = [
  { id: "ai-model", label: "AI model", icon: Cpu },
  { id: "weights", label: "Scoring weights", icon: SlidersHorizontal },
  { id: "thresholds", label: "Verdict thresholds", icon: Gauge },
  { id: "account", label: "Account", icon: User, divider: true },
  { id: "team", label: "Team members", icon: Users },
];

const SECTION_STYLE = {
  skills: { icon: CodeXml, dot: "bg-sec-skills" },
  experience: { icon: Briefcase, dot: "bg-sec-experience" },
  education: { icon: GraduationCap, dot: "bg-sec-education" },
  certifications: { icon: Award, dot: "bg-sec-certifications" },
};

function Panel({ id, title, description, right, children }) {
  return (
    <Card id={id} className="scroll-mt-24 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
        </div>
        {right}
      </div>
      {children}
    </Card>
  );
}

function ProviderCard({ id, selected, onSelect }) {
  const p = PROVIDERS[id];
  const Icon = id === "claude" ? Sparkles : Star;
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
        selected ? "border-primary-600 bg-primary-50/40" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${id === "claude" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-bold text-gray-900">
          {p.label}
          {id === "claude" && <Pill className="bg-mint-50 py-0.5 text-[10px] text-strong">Recommended</Pill>}
        </span>
        <span className="mt-0.5 block text-sm text-gray-500">{p.description}</span>
      </span>
      <input type="radio" name="provider" value={id} checked={selected} onChange={() => onSelect(id)} className="mt-1 h-4 w-4 accent-primary-600" />
    </label>
  );
}

function ConnectionTest() {
  const [state, setState] = useState({ status: "idle", text: "" });
  const test = async () => {
    setState({ status: "loading", text: "" });
    const started = performance.now();
    try {
      const res = await api.warm();
      const ms = res?.latency_ms ?? Math.round(performance.now() - started);
      setState({ status: "ok", text: `Connected · database ${res?.db || "ok"} · ${ms} ms` });
    } catch (err) {
      setState({ status: "error", text: getErrorMessage(err, "Server not reachable") });
    }
  };
  return (
    <div className="mt-5 rounded-xl border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">Backend connection</p>
          <p className="truncate text-xs text-gray-500">{USE_MOCK ? "Mock service (VITE_USE_MOCK=true)" : API_ORIGIN}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={test} loading={state.status === "loading"}>
          {state.status !== "loading" && <Plug className="h-4 w-4" />} Test connection
        </Button>
      </div>
      {state.status === "ok" && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-strong">
          <CircleCheck className="h-3.5 w-3.5" /> {state.text}
        </p>
      )}
      {state.status === "error" && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-weak">
          <TriangleAlert className="h-3.5 w-3.5" /> {state.text}
        </p>
      )}
      <p className="mt-2 text-xs text-gray-400">API keys for Claude and Gemini are kept on the server, never in the browser.</p>
    </div>
  );
}

function TeamMembers() {
  const { data, error, loading } = useAsync(() => api.listUsers(), []);
  if (loading) return <div className="flex justify-center py-6"><Spinner /></div>;
  if (error) return <p className="text-sm text-weak">{getErrorMessage(error, "Could not load team members")}</p>;
  return (
    <ul className="divide-y divide-gray-100">
      {(data || []).map((u) => (
        <li key={u.id} className="flex items-center gap-3 py-3">
          <Avatar name={u.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{u.name}</p>
            <p className="truncate text-xs text-gray-500">{u.email}</p>
          </div>
          <Pill className="bg-gray-100 text-gray-600">{ROLE_LABELS[u.role] || u.role}</Pill>
        </li>
      ))}
    </ul>
  );
}

// P7 — settings. Model + weights are saved per user and sent with every new analysis.
export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() => loadSettings(user.id));
  const [draft, setDraft] = useState(saved);
  const [justSaved, setJustSaved] = useState(false);
  const [active, setActive] = useState(NAV[0].id);

  const total = weightsTotal(draft.weights);
  const balanced = total === 100;
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 2500);
    return () => clearTimeout(t);
  }, [justSaved]);

  const setWeight = (key, value) => {
    const n = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
    setDraft((d) => ({ ...d, weights: { ...d.weights, [key]: n } }));
  };

  const save = () => {
    saveSettings(user.id, draft);
    setSaved(draft);
    setJustSaved(true);
  };

  const jump = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <PageContainer className="pb-32">
      <PageHeader eyebrow="Workspace" title="Settings" description="Configure the AI model and how resumes are scored. Changes apply to new analyses." />

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="lg:sticky lg:top-24 lg:self-start" aria-label="Settings sections">
          <Card className="flex gap-1 overflow-x-auto p-2 lg:flex-col">
            {NAV.map((n) => (
              <div key={n.id} className={n.divider ? "lg:mt-1 lg:border-t lg:border-gray-100 lg:pt-1" : ""}>
                <button
                  onClick={() => jump(n.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    active === n.id ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </button>
              </div>
            ))}
          </Card>
        </nav>

        <div className="min-w-0 space-y-6">
          <Panel id="ai-model" title="AI model" description="Choose the model used to analyze and score resumes.">
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.keys(PROVIDERS).map((id) => (
                <ProviderCard key={id} id={id} selected={draft.provider === id} onSelect={(p) => setDraft((d) => ({ ...d, provider: p }))} />
              ))}
            </div>
            <ConnectionTest />
          </Panel>

          <Panel
            id="weights"
            title="Scoring weights"
            description="How much each section contributes to the overall score. Must total 100%."
            right={
              <Button variant="secondary" size="sm" onClick={() => setDraft((d) => ({ ...d, weights: { ...DEFAULT_WEIGHTS } }))}>
                <RotateCcw className="h-4 w-4" /> Reset to default
              </Button>
            }
          >
            <div className="mb-6 flex h-2.5 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
              {SECTION_KEYS.map((k) => (
                <div key={k} className={`${SECTION_STYLE[k].dot} transition-[width]`} style={{ width: `${(draft.weights[k] / Math.max(total, 100)) * 100}%` }} />
              ))}
            </div>

            <div className="space-y-4">
              {SECTION_KEYS.map((k) => {
                const { icon: Icon, dot } = SECTION_STYLE[k];
                return (
                  <div key={k} className="grid grid-cols-[1fr_96px] items-center gap-4 sm:grid-cols-[180px_1fr_96px]">
                    <label htmlFor={`w-${k}`} className="flex items-center gap-2.5 text-sm font-semibold text-gray-900">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500">
                        <Icon className="h-4 w-4" />
                      </span>
                      {SECTION_LABELS[k]}
                      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={draft.weights[k]}
                      onChange={(e) => setWeight(k, e.target.value)}
                      aria-label={`${SECTION_LABELS[k]} weight`}
                      className="col-span-2 h-2 w-full accent-primary-600 sm:col-span-1"
                    />
                    <div className="relative col-start-2 row-start-1 sm:col-start-3">
                      <input
                        id={`w-${k}`}
                        type="number"
                        min={0}
                        max={100}
                        value={draft.weights[k]}
                        onChange={(e) => setWeight(k, e.target.value)}
                        className="h-10 w-full rounded-xl border border-gray-300 pr-8 pl-3 text-right text-sm font-semibold focus:border-primary-600 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                      />
                      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-400">%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className={`mt-6 flex items-center justify-between rounded-xl border px-4 py-3 ${
                balanced ? "border-green-200 bg-mint-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                {balanced ? <CircleCheck className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
                {balanced ? "Weights are balanced" : `Weights must total 100% (${total > 100 ? "remove" : "add"} ${Math.abs(100 - total)}%)`}
              </span>
              <span className="text-2xl font-bold">{total}%</span>
            </div>
          </Panel>

          <Panel
            id="thresholds"
            title={
              <span className="flex items-center gap-2">
                Verdict thresholds <Pill className="bg-gray-100 py-0.5 text-[10px] text-gray-500">Read-only</Pill>
              </span>
            }
            description="Overall scores map to these verdicts across all analyses."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["strong", "border-green-200 bg-mint-50 text-strong"],
                ["moderate", "border-amber-200 bg-amber-50 text-moderate"],
                ["weak", "border-red-200 bg-red-50 text-weak"],
              ].map(([key, cls]) => (
                <div key={key} className={`rounded-xl border p-4 ${cls}`}>
                  <Pill className="bg-white/70">● {VERDICTS[key].label}</Pill>
                  <p className="mt-3 text-2xl font-bold">{VERDICTS[key].range}</p>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <div className="flex h-2 overflow-hidden rounded-full">
                <div className="bg-red-400" style={{ width: "50%" }} />
                <div className="bg-amber-400" style={{ width: "25%" }} />
                <div className="bg-emerald-500" style={{ width: "25%" }} />
              </div>
              <div className="relative mt-1.5 h-4 text-[10px] text-gray-400">
                <span className="absolute left-0">0</span>
                <span className="absolute left-1/2 -translate-x-1/2">50</span>
                <span className="absolute left-3/4 -translate-x-1/2">75</span>
                <span className="absolute right-0">100</span>
              </div>
            </div>
          </Panel>

          <Panel id="account" title="Account" description="Your profile on this workspace.">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar name={user.name} size="h-14 w-14 text-lg" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {ROLE_LABELS[user.role] || user.role}
                  {user.created_at ? ` · Member since ${formatDate(user.created_at)}` : ""}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  await logout();
                  navigate("/", { replace: true });
                }}
              >
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </div>
          </Panel>

          <Panel id="team" title="Team members" description="Recruiters with access to this workspace.">
            <TeamMembers />
          </Panel>
        </div>
      </div>

      {(dirty || justSaved) && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            {dirty ? (
              <>
                <span className="text-sm text-gray-600">You have unsaved changes{!balanced && " — weights must total 100%"}</span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setDraft(saved)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={save} disabled={!balanced}>
                    <Save className="h-4 w-4" /> Save changes
                  </Button>
                </div>
              </>
            ) : (
              <span className="flex items-center gap-2 text-sm font-medium text-strong" role="status">
                <CircleCheck className="h-4 w-4" /> Settings saved — new analyses will use them
              </span>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
