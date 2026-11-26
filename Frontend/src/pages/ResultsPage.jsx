import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ScoreCircle from '../components/ScoreCircle'
import VerdictBadge from '../components/VerdictBadge'
import ProgressBar from '../components/ProgressBar'

// ── Mock data ──────────────────────────────────────────────────────────────────
const RESULTS = [
  {
    rank: 1, name: 'Aarav Mehta',    file: 'Aarav_Mehta_Resume.pdf',
    verdict: 'strong',   score: 92,
    sections: { Skills: 96, Experience: 93, Education: 88, Certifications: 86 },
    matched: ['React', 'TypeScript', '6 yrs exp', 'GraphQL', 'AWS Certified'],
    missing: ['Playwright'],
  },
  {
    rank: 2, name: 'Sofia Martinez', file: 'Sofia_Martinez_CV.docx',
    verdict: 'strong',   score: 81,
    sections: { Skills: 86, Experience: 82, Education: 80, Certifications: 60 },
    matched: ['React', 'Redux', '5 yrs exp', 'B.Sc CS'],
    missing: ['AWS Certification', 'GraphQL'],
  },
  {
    rank: 3, name: 'Daniel Kim',     file: 'Daniel_Kim_Resume.pdf',
    verdict: 'moderate', score: 68,
    sections: { Skills: 74, Experience: 62, Education: 80, Certifications: 40 },
    matched: ['React', 'Jest', '4 yrs exp'],
    missing: ['TypeScript', 'AWS Certification'],
  },
  {
    rank: 4, name: 'Emily Chen',     file: 'Emily_Chen_2025.doc',
    verdict: 'moderate', score: 55,
    sections: { Skills: 60, Experience: 48, Education: 75, Certifications: 30 },
    matched: ['JavaScript', 'Vue', 'B.Sc IT'],
    missing: ['React', '5+ yrs exp', 'AWS'],
  },
  {
    rank: 5, name: 'Marcus Johnson', file: 'Marcus_Johnson.txt',
    verdict: 'weak',     score: 38,
    sections: { Skills: 40, Experience: 35, Education: 50, Certifications: 10 },
    matched: ['HTML/CSS', '2 yrs exp'],
    missing: ['React', 'TypeScript', 'Degree in CS', 'AWS Certification'],
  },
]

const FAILED = {
  file: "Liam_Oconnor_Resume.pdf",
  message: "The file appears to be a scanned image with no readable text. Upload a text-based PDF or DOCX to score this candidate.",
}

const STAT_CARDS = [
  { label: 'Top score',    value: '92/100', color: 'text-blue-600'  },
  { label: 'Strong fit',   value: '4',      color: 'text-green-600' },
  { label: 'Moderate fit', value: '4',      color: 'text-amber-600' },
  { label: 'Weak fit',     value: '3',      sub: '+ 1 failed', color: 'text-red-600' },
]

const FILTER_TABS = ['All 12', 'Strong', 'Moderate', 'Weak']

// ── Chip ──────────────────────────────────────────────────────────────────────
function Chip({ label, type }) {
  const styles = {
    matched: 'bg-green-50 text-green-700 border border-green-200',
    missing: 'bg-red-50   text-red-600   border border-red-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-medium ${styles[type]}`}>
      {type === 'missing' && <span className="mr-1 font-bold">–</span>}
      {label}
    </span>
  )
}

// ── Candidate result card ──────────────────────────────────────────────────────
function ResultCard({ candidate }) {
  const borderColor = {
    strong:   'border-l-green-400',
    moderate: 'border-l-amber-400',
    weak:     'border-l-red-400',
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 border-l-4 ${borderColor[candidate.verdict]} p-5 hover:shadow-md transition-shadow`}>
      <div className="flex gap-4">
        <div className="shrink-0">
          <ScoreCircle score={candidate.score} size="md" verdict={candidate.verdict} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-gray-300">#{candidate.rank}</span>
            <h3 className="text-base font-bold text-gray-900 truncate">{candidate.name}</h3>
            <VerdictBadge verdict={candidate.verdict} />
          </div>
          <p className="text-xs text-gray-400 truncate mb-3">{candidate.file}</p>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3">
            {Object.entries(candidate.sections).map(([key, val]) => (
              <ProgressBar key={key} label={key} value={val} variant="section" />
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mr-1">Matched</span>
            {candidate.matched.map(tag => <Chip key={tag} label={tag} type="matched" />)}
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mx-1">Missing</span>
            {candidate.missing.map(tag => <Chip key={tag} label={tag} type="missing" />)}
          </div>
        </div>

        <div className="shrink-0 flex items-start">
          <button className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap">
            View details →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Failed parse card ─────────────────────────────────────────────────────────
function FailedCard() {
  return (
    <div className="bg-white rounded-2xl border border-red-200 border-l-4 border-l-red-400 p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold text-gray-900">{FAILED.file}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
              Failed to parse
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-3">{FAILED.message}</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Retry
            </button>
            <button className="px-3 py-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
              Replace file
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onNewAnalysis }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">No results yet</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
        Add a job description and upload resumes to see candidates ranked by fit here.
      </p>
      <button onClick={onNewAnalysis}
        className="px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
        Start new analysis
      </button>
    </div>
  )
}

// ── Page 4 — Results ──────────────────────────────────────────────────────────
export default function ResultsPage({ onNewAnalysis }) {
  const [search,       setSearch]  = useState('')
  const [activeFilter, setFilter]  = useState('All 12')

  const verdictMap = { Strong: 'strong', Moderate: 'moderate', Weak: 'weak' }

  const filtered = RESULTS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'All 12' || c.verdict === verdictMap[activeFilter]
    return matchSearch && matchFilter
  })

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <Sidebar activePage="Analyze" />

      <main className="flex-1 p-8">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Northwind Labs · Engineering
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Senior Frontend Engineer</h1>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>Scored with</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-semibold">
                <span className="w-3.5 h-3.5 rounded bg-orange-200 inline-flex items-center justify-center text-[9px] font-bold">C</span>
                Claude
              </span>
              <span>·</span>
              <span>12 resumes scored</span>
              <span>·</span>
              <span>Today, 10:42 AM</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            <button onClick={onNewAnalysis}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New analysis
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STAT_CARDS.map(card => (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-200 px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              {card.sub && <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>}
            </div>
          ))}
        </div>

        {/* ── Distribution bar ── */}
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Score distribution</p>
            <div className="flex items-center gap-4 ml-auto text-xs font-medium text-gray-600">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />Strong</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />Moderate</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />Weak</span>
            </div>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            <div className="bg-green-500 rounded-l-full" style={{ width: '33.3%' }} />
            <div className="bg-amber-500"               style={{ width: '33.3%' }} />
            <div className="bg-red-500 rounded-r-full"  style={{ width: '33.4%' }} />
          </div>
        </div>

        {/* ── Search + filter + download ── */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search candidates by name…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {FILTER_TABS.map(tab => (
              <button key={tab} onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                  ${activeFilter === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <select className="text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none">
              <option>Sort: Score</option>
              <option>Sort: Name</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download all reports
            </button>
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="flex items-center gap-2 mb-5 text-xs text-gray-400">
          <svg className="w-4 h-4 shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Scores are AI-assisted recommendations. Always review candidates before making hiring decisions.&nbsp;
          AI model: <span className="font-semibold text-gray-600 ml-1">Claude</span>
        </div>

        {/* ── Results ── */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <EmptyState onNewAnalysis={onNewAnalysis} />
          ) : (
            filtered.map(c => <ResultCard key={c.rank} candidate={c} />)
          )}
          {(activeFilter === 'All 12' || activeFilter === 'Weak') && <FailedCard />}
        </div>
      </main>
    </div>
  )
}
