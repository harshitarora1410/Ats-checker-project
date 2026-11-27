/**
 * useAnalysis.js — Custom hook for polling GET /api/analyses/{job_id} via Axios
 *
 * Returns: { data, loading, error, errorType }
 *   errorType: 'not_found' | 'auth' | 'network' | null
 *
 * Polling rules:
 *   - Polls every 2500 ms while status is "queued" or "processing"
 *   - Stops immediately when status becomes "done" or "failed"
 *   - Cleans up interval on unmount
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import api, { RedirectToLoginError } from './api'

const POLL_INTERVAL = 2500
const ACTIVE_STATUSES = new Set(['queued', 'processing'])

export function useAnalysis(jobId, { onComplete, onAuthError } = {}) {
  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [errorType, setErrorType] = useState(null) // 'not_found' | 'auth' | 'network'

  const intervalRef = useRef(null)
  const isMounted   = useRef(true)

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const fetchAnalysis = useCallback(async () => {
    if (!jobId) return

    try {
      const { data: json } = await api.get(`/api/analyses/${jobId}`)
      if (!isMounted.current) return

      setData(json)
      setError(null)
      setErrorType(null)
      setLoading(false)

      // Stop polling and fire callback when terminal status is reached
      if (!ACTIVE_STATUSES.has(json?.status)) {
        stopPolling()
        if (onComplete) onComplete(json)
      }
    } catch (err) {
      if (!isMounted.current) return

      if (err instanceof RedirectToLoginError) {
        stopPolling()
        setError(err.message)
        setErrorType('auth')
        setLoading(false)
        if (onAuthError) onAuthError()
        return
      }

      if (err.response?.status === 404) {
        stopPolling()
        setError('Job not found. It may have been deleted or the ID is invalid.')
        setErrorType('not_found')
        setLoading(false)
        return
      }

      // Network / transient server error — keep polling
      const msg = err.response
        ? `Server error: ${err.response.status}`
        : err.message
      setError(msg)
      setErrorType('network')
      setLoading(false)
    }
  }, [jobId, stopPolling, onComplete, onAuthError])

  useEffect(() => {
    isMounted.current = true
    if (!jobId) { setLoading(false); return }

    // Immediate first fetch
    fetchAnalysis()

    // Start polling
    intervalRef.current = setInterval(fetchAnalysis, POLL_INTERVAL)

    return () => {
      isMounted.current = false
      stopPolling()
    }
  }, [jobId, fetchAnalysis, stopPolling])

  return { data, loading, error, errorType }
}
