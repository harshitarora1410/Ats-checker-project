import { useState, useCallback } from 'react'
import AnalyzingPage from './pages/AnalyzingPage'
import ResultsPage   from './pages/ResultsPage'
import './App.css'

/**
 * App — top-level router
 *
 * State:
 *   page        : 3 (Analyzing) | 4 (Results)
 *   jobId       : string — passed to AnalyzingPage for polling
 *   analysisData: object — full API response, passed to ResultsPage
 *
 * In a real app, jobId would come from react-router params:
 *   const { job_id } = useParams()
 * For now it is controlled via the dev switcher input below.
 */
export default function App() {
  const [page,         setPage]         = useState(3)
  const [jobId,        setJobId]        = useState('')
  const [inputJobId,   setInputJobId]   = useState('')
  const [analysisData, setAnalysisData] = useState(null)

  // Called by AnalyzingPage when polling detects status === 'done' | 'failed'
  const handleAnalysisComplete = useCallback((data) => {
    setAnalysisData(data)
    setPage(4)
  }, [])

  // Called when session expires inside any page
  const handleAuthError = useCallback(() => {
    // In a real app: navigate('/login')
    alert('Session expired. Please log in again.')
  }, [])

  const goToAnalyzing = useCallback((id) => {
    setJobId(id || inputJobId)
    setPage(3)
  }, [inputJobId])

  return (
    <>
      {/* ── Dev page switcher ─────────────────────────── */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        <div className="flex gap-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2">
          <input
            type="text"
            placeholder="job_id (e.g. abc123)"
            value={inputJobId}
            onChange={e => setInputJobId(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={() => goToAnalyzing(inputJobId)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
            Start poll
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPage(3)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-colors
              ${page === 3 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            Page 3 — Analyzing
          </button>
          <button onClick={() => setPage(4)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-colors
              ${page === 4 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            Page 4 — Results
          </button>
        </div>
      </div>

      {/* ── Pages ─────────────────────────────────────── */}
      {page === 3 && (
        <AnalyzingPage
          jobId={jobId}
          onAnalysisComplete={handleAnalysisComplete}
          onNewAnalysis={() => setPage(3)}
          onAuthError={handleAuthError}
        />
      )}
      {page === 4 && (
        <ResultsPage
          analysisData={analysisData}
          onNewAnalysis={() => { setJobId(''); setPage(3) }}
        />
      )}
    </>
  )
}
