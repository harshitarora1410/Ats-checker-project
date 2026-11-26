import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'

// ── Status badge for each queue row ───────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Done:      'bg-green-50 text-green-700 border border-green-200',
    Analyzing: 'bg-blue-50  text-blue-700  border border-blue-200',
    Waiting:   'bg-gray-100 text-gray-500  border border-gray-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status]}`}>
      {status === 'Analyzing' && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
      )}
      {status}
    </span>
  )
}

// ── Initial resume queue data ──────────────────────────────────────────────────
const INITIAL_QUEUE = [
  { id: '01', name: 'Aarav Mehta',    file: 'Aarav_Mehta_Resume.pdf',      time: '3.2s', status: 'Done' },
  { id: '02', name: 'Sofia Martinez', file: 'Sofia_Martinez_CV.docx',       time: '2.8s', status: 'Done' },
  { id: '03', name: 'Daniel Kim',     file: 'Daniel_Kim_Resume.pdf',        time: '4.1s', status: 'Done' },
  { id: '04', name: 'Emily Chen',     file: 'Emily_Chen_2025.doc',          time: '3.6s', status: 'Done' },
  { id: '05', name: 'Marcus Johnson', file: 'Marcus_Johnson.txt',           time: '2.4s', status: 'Done' },
  { id: '06', name: 'Priyanka Rao',   file: 'Priyanka_Rao_CV.pdf',         time: '3.9s', status: 'Done' },
  { id: '07', name: 'Noah Williams',  file: 'Noah_Williams.pdf',            time: '3.1s', status: 'Done' },
  { id: '08', name: 'Olivia Brown',   file: 'Olivia_Brown_Resume.docx',    time: null,   status: 'Analyzing' },
  { id: '09', name: 'Ethan Davis',    file: 'Ethan_Davis_CV.pdf',          time: null,   status: 'Waiting' },
  { id: '10', name: 'Ava Thompson',   file: 'Ava_Thompson.pdf',            time: null,   status: 'Waiting' },
  { id: '11', name: 'Lucas Garcia',   file: 'Lucas_Garcia_Resume.docx',    time: null,   status: 'Waiting' },
  { id: '12', name: 'Mia Robinson',   file: 'Mia_Robinson.pdf',            time: null,   status: 'Waiting' },
]

export default function AnalyzingPage({ onAnalysisComplete }) {
  const [progress, setProgress] = useState(62)
  const [queue, setQueue]       = useState(INITIAL_QUEUE)
  const [done, setDone]         = useState(7)
  const [analyzing, setAnalyzing] = useState(1)
  const waiting = 12 - done - analyzing

  // Simulate progress ticking forward
  useEffect(() => {
    if (progress >= 100) return
    const timer = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + 1, 100)
        // When we cross 75%, advance a resume from Analyzing → Done and next Waiting → Analyzing
        if (next === 75) {
          setQueue(q => {
            const updated = [...q]
            const analyzingIdx = updated.findIndex(r => r.status === 'Analyzing')
            if (analyzingIdx !== -1) {
              updated[analyzingIdx] = { ...updated[analyzingIdx], status: 'Done', time: '3.5s' }
              setDone(d => d + 1)
              setAnalyzing(a => a - 1)
            }
            const waitingIdx = updated.findIndex(r => r.status === 'Waiting')
            if (waitingIdx !== -1) {
              updated[waitingIdx] = { ...updated[waitingIdx], status: 'Analyzing' }
              setAnalyzing(a => a + 1)
            }
            return updated
          })
        }
        if (next === 100 && onAnalysisComplete) {
          setTimeout(onAnalysisComplete, 800)
        }
        return next
      })
    }, 300)
    return () => clearInterval(timer)
  }, [progress, onAnalysisComplete])

  const timeLeft = progress < 100
    ? `About ${Math.round(((100 - progress) / 100) * 65)} sec left`
    : 'Complete!'

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <Sidebar activePage="Analyze" />

      <main className="flex-1 p-8">
        {/* ── Header ── */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Senior Frontend Engineer
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Analyzing resumes…</h1>
          <p className="text-sm text-gray-500 mt-1">
            Matching skills, experience, education and certifications against the job description.
          </p>
        </div>

        <div className="flex gap-6">
          {/* ── Left — Queue ── */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Queue header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Resume queue</h2>
                <p className="text-xs text-gray-400 mt-0.5">12 files</p>
              </div>
              <div className="flex gap-3 text-xs font-semibold">
                <span className="text-green-600">{done} Done</span>
                <span className="text-blue-600">{analyzing} Analyzing</span>
                <span className="text-gray-400">{waiting} Waiting</span>
              </div>
            </div>

            {/* Queue rows */}
            <ul className="divide-y divide-gray-50">
              {queue.map((resume) => (
                <li
                  key={resume.id}
                  className={`flex items-center gap-4 px-6 py-3.5 transition-colors
                    ${resume.status === 'Analyzing' ? 'bg-blue-50/40' : ''}
                    ${resume.status === 'Waiting'   ? 'opacity-50'   : ''}
                  `}
                >
                  {/* Rank */}
                  <span className="w-7 text-xs font-bold text-gray-300 shrink-0">{resume.id}</span>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                    {resume.name.charAt(0)}
                  </div>

                  {/* Name + file */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{resume.name}</p>
                    <p className="text-xs text-gray-400 truncate">{resume.file}</p>
                    {resume.status === 'Analyzing' && (
                      <p className="text-xs text-blue-500 mt-0.5 animate-pulse">Extracting skills…</p>
                    )}
                  </div>

                  {/* Time */}
                  <span className="text-xs text-gray-400 w-10 text-right shrink-0">
                    {resume.time ?? '—'}
                  </span>

                  {/* Status badge */}
                  <div className="shrink-0 w-24 text-right">
                    <StatusBadge status={resume.status} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right — Progress card ── */}
          <div className="w-72 shrink-0 space-y-4">
            {/* Main progress card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              {/* Circle */}
              <div className="flex justify-center mb-5">
                <CircleProgress value={progress} />
              </div>

              <h3 className="text-sm font-bold text-gray-900 text-center mb-1">
                {progress < 100
                  ? `Analyzing ${done + analyzing} of 12 resumes...`
                  : 'Analysis complete!'}
              </h3>
              <p className="text-xs text-gray-400 text-center mb-4">{timeLeft}</p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: 'Done',      count: done,      color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Analyzing', count: analyzing, color: 'text-blue-600',  bg: 'bg-blue-50'  },
                  { label: 'Waiting',   count: waiting,   color: 'text-gray-500',  bg: 'bg-gray-50'  },
                ].map(stat => (
                  <div key={stat.label} className={`${stat.bg} rounded-xl p-2 text-center`}>
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.count}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Model tag */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-5">
                <div className="w-5 h-5 rounded bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">C</div>
                <span className="text-xs text-gray-500">AI model: <span className="font-semibold text-gray-700">Claude</span></span>
              </div>

              {/* Info */}
              <p className="text-xs text-gray-400 text-center mb-4">
                Keep this tab open — results appear when done
              </p>

              {/* Cancel */}
              <button className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                Cancel analysis
              </button>
            </div>

            {/* Tip card */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
              <div className="flex gap-2">
                <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-700">
                  Results are ranked by overall ATS score. You can filter by verdict after the analysis completes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// ── Animated circular overall progress ────────────────────────────────────────
function CircleProgress({ value }) {
  const r = 54
  const circumference = 2 * Math.PI * r
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center w-32 h-32">
      <svg width="128" height="128" className="rotate-[-90deg]">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle
          cx="64" cy="64" r={r} fill="none"
          stroke="#2563EB" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-blue-600">{value}%</p>
        <p className="text-[10px] text-gray-400 font-medium">complete</p>
      </div>
    </div>
  )
}
