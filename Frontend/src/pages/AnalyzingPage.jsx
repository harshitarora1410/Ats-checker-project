import { useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import { useAnalysis } from '../api/useAnalysis'

// ── Status badge — maps API status values ──────────────────────────────────────
function StatusBadge({ status }) {
  // API statuses: 'done' | 'processing' | 'queued' | 'failed'
  const map = {
    done:       'bg-green-50 text-green-700 border border-green-200',
    processing: 'bg-blue-50  text-blue-700  border border-blue-200',
    queued:     'bg-gray-100 text-gray-500  border border-gray-200',
    failed:     'bg-red-50   text-red-600   border border-red-200',
  }
  const labels = { done: 'Done', processing: 'Analyzing', queued: 'Waiting', failed: 'Failed' }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? map.queued}`}>
      {status === 'processing' && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
      )}
      {labels[status] ?? status}
    </span>
  )
}

// ── Animated circular overall progress ────────────────────────────────────────
function CircleProgress({ value }) {
  const r = 54
  const circumference = 2 * Math.PI * r
  const pct = Math.min(Math.max(value ?? 0, 0), 100)
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center w-32 h-32">
      <svg width="128" height="128" className="rotate-[-90deg]">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle cx="64" cy="64" r={r} fill="none"
          stroke="#2563EB" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-blue-600">{pct}%</p>
        <p className="text-[10px] text-gray-400 font-medium">complete</p>
      </div>
    </div>
  )
}

// ── Skeleton loader row ────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <li className="flex items-center gap-4 px-6 py-3.5 animate-pulse">
      <span className="w-7 h-3 bg-gray-100 rounded" />
      <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-gray-100 rounded w-32" />
        <div className="h-2 bg-gray-100 rounded w-48" />
      </div>
      <div className="w-16 h-5 bg-gray-100 rounded-full" />
    </li>
  )
}

// ── Error state ────────────────────────────────────────────────────────────────
function ErrorState({ message, type, onNewAnalysis }) {
  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <Sidebar activePage="Analyze" />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md w-full">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4
            ${type === 'not_found' ? 'bg-gray-50' : 'bg-red-50'}`}>
            <svg className={`w-8 h-8 ${type === 'not_found' ? 'text-gray-400' : 'text-red-400'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d={type === 'not_found'
                  ? "M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"} />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">
            {type === 'not_found' ? 'Job not found' : 'Something went wrong'}
          </h3>
          <p className="text-sm text-gray-400 mb-6">{message}</p>
          <button onClick={onNewAnalysis}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            Start new analysis
          </button>
        </div>
      </main>
    </div>
  )
}

// ── Page 3 — Analyzing (live API polling) ─────────────────────────────────────
export default function AnalyzingPage({ jobId, onAnalysisComplete, onNewAnalysis, onAuthError }) {
  const handleComplete = useCallback((result) => {
    if (onAnalysisComplete) onAnalysisComplete(result)
  }, [onAnalysisComplete])

  const { data, loading, error, errorType } = useAnalysis(jobId, {
    onComplete:  handleComplete,
    onAuthError: onAuthError,
  })

  // ── Error states ───────────────────────────────────────────────────────────
  if (error && (errorType === 'not_found' || errorType === 'auth')) {
    return <ErrorState message={error} type={errorType} onNewAnalysis={onNewAnalysis} />
  }

  // ── Derive display values from live API data ───────────────────────────────
  const progress    = data?.progress
  const resumes     = data?.resumes ?? []
  const jdTitle     = data?.jd_title ?? 'Analyzing…'
  const modelUsed   = data?.model_used ?? 'Claude'
  const apiStatus   = data?.status ?? 'queued'

  const progressPct    = progress?.progress_percent   ?? 0
  const doneCount      = progress?.done_count         ?? 0
  const processingCount= progress?.processing_count   ?? 0
  const pendingCount   = progress?.pending_count      ?? 0
  const failedCount    = progress?.failed_count       ?? 0
  const totalCount     = resumes.length || (doneCount + processingCount + pendingCount + failedCount)

  const isComplete = apiStatus === 'done' || apiStatus === 'failed'
  const timeLeft   = isComplete
    ? 'Complete!'
    : `About ${Math.max(Math.round(((100 - progressPct) / 100) * 65), 1)} sec left`

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <Sidebar activePage="Analyze" />

      <main className="flex-1 p-8">
        {/* ── Header ── */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            {jdTitle}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            {isComplete ? 'Analysis complete!' : 'Analyzing resumes…'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Matching skills, experience, education and certifications against the job description.
          </p>
        </div>

        {/* ── Network error (non-fatal, keeps polling) ── */}
        {error && errorType === 'network' && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Network issue — retrying… ({error})
          </div>
        )}

        <div className="flex gap-6">
          {/* ── Queue list ── */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Resume queue</h2>
                <p className="text-xs text-gray-400 mt-0.5">{totalCount} files</p>
              </div>
              <div className="flex gap-3 text-xs font-semibold">
                <span className="text-green-600">{doneCount} Done</span>
                <span className="text-blue-600">{processingCount} Analyzing</span>
                <span className="text-gray-400">{pendingCount} Waiting</span>
                {failedCount > 0 && <span className="text-red-500">{failedCount} Failed</span>}
              </div>
            </div>

            <ul className="divide-y divide-gray-50">
              {/* Loading skeletons on first fetch */}
              {loading && resumes.length === 0 && (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              )}

              {resumes.map((resume, idx) => {
                const name      = resume.candidate_name || resume.original_filename || `Candidate ${idx + 1}`
                const rowStatus = resume.status // 'queued' | 'processing' | 'done' | 'failed'

                return (
                  <li key={resume.resume_id ?? idx}
                    className={`flex items-center gap-4 px-6 py-3.5 transition-colors
                      ${rowStatus === 'processing' ? 'bg-blue-50/40' : ''}
                      ${rowStatus === 'queued'     ? 'opacity-50'    : ''}
                      ${rowStatus === 'failed'     ? 'bg-red-50/30'  : ''}`}
                  >
                    {/* Rank / index */}
                    <span className="w-7 text-xs font-bold text-gray-300 shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0
                      ${rowStatus === 'failed' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name + file */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                      <p className="text-xs text-gray-400 truncate">{resume.original_filename}</p>
                      {rowStatus === 'processing' && (
                        <p className="text-xs text-blue-500 mt-0.5 animate-pulse">Extracting skills…</p>
                      )}
                      {rowStatus === 'failed' && resume.error_message && (
                        <p className="text-xs text-red-500 mt-0.5 truncate">{resume.error_message}</p>
                      )}
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0 w-24 text-right">
                      <StatusBadge status={rowStatus} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* ── Right panel ── */}
          <div className="w-72 shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              {/* Circle */}
              <div className="flex justify-center mb-5">
                <CircleProgress value={progressPct} />
              </div>

              <h3 className="text-sm font-bold text-gray-900 text-center mb-1">
                {isComplete
                  ? 'Analysis complete!'
                  : `Analyzing ${doneCount + processingCount} of ${totalCount} resumes...`}
              </h3>
              <p className="text-xs text-gray-400 text-center mb-4">{timeLeft}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: 'Done',      count: doneCount,       color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Analyzing', count: processingCount, color: 'text-blue-600',  bg: 'bg-blue-50'  },
                  { label: 'Waiting',   count: pendingCount,    color: 'text-gray-500',  bg: 'bg-gray-50'  },
                ].map(stat => (
                  <div key={stat.label} className={`${stat.bg} rounded-xl p-2 text-center`}>
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.count}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Model tag */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-5">
                <div className="w-5 h-5 rounded bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                  {modelUsed?.charAt(0) ?? 'C'}
                </div>
                <span className="text-xs text-gray-500">
                  AI model: <span className="font-semibold text-gray-700">{modelUsed}</span>
                </span>
              </div>

              <p className="text-xs text-gray-400 text-center mb-4">
                Keep this tab open — results appear when done
              </p>

              <button className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                Cancel analysis
              </button>
            </div>

            {/* Tip */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
              <div className="flex gap-2">
                <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
