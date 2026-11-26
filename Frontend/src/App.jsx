import { useState } from 'react'
import AnalyzingPage from './pages/AnalyzingPage'
import ResultsPage   from './pages/ResultsPage'
import './App.css'

/**
 * App — simple page router
 * page 3 → AnalyzingPage   (analysis in-progress)
 * page 4 → ResultsPage     (scored results list)
 *
 * Switch pages via the buttons below (dev only).
 */
export default function App() {
  // Start on page 3 so you can see it immediately
  const [page, setPage] = useState(3)

  return (
    <>
      {/* ── Dev page switcher ─────────────────────────── */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setPage(3)}
          className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-colors
            ${page === 3 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          Page 3 — Analyzing
        </button>
        <button
          onClick={() => setPage(4)}
          className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-colors
            ${page === 4 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          Page 4 — Results
        </button>
      </div>

      {/* ── Pages ─────────────────────────────────────── */}
      {page === 3 && (
        <AnalyzingPage onAnalysisComplete={() => setPage(4)} />
      )}
      {page === 4 && (
        <ResultsPage onNewAnalysis={() => setPage(3)} />
      )}
    </>
  )
}
