import { useEffect, useState } from "react";
import { api } from "../services";
import { POLL_INTERVAL_MS } from "../config";
import { ACTIVE_JOB_STATUSES } from "../lib/constants";

const FATAL = [401, 403, 404];

/**
 * GET /api/analyses/{jobId}, repeated every 2.5 s while the job is
 * "queued" or "processing"; stops at "done" / "failed".
 * Uses setTimeout chaining so slow responses never overlap.
 */
export function useJobPolling(jobId) {
  const [state, setState] = useState({ jobId, job: null, error: null });

  useEffect(() => {
    let active = true;
    let timer;

    const tick = async () => {
      try {
        const job = await api.getAnalysis(jobId);
        if (!active) return;
        setState({ jobId, job, error: null });
        if (ACTIVE_JOB_STATUSES.includes(job.status)) timer = setTimeout(tick, POLL_INTERVAL_MS);
      } catch (error) {
        if (!active) return;
        setState((s) => ({ jobId, job: s.jobId === jobId ? s.job : null, error }));
        // network blips / 5xx: keep trying, a little slower
        if (!FATAL.includes(error?.status)) timer = setTimeout(tick, POLL_INTERVAL_MS * 2);
      }
    };

    tick();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [jobId]);

  // ignore data left over from a previous jobId
  const job = state.jobId === jobId ? state.job : null;
  const error = state.jobId === jobId ? state.error : null;
  return { job, error, loading: !job && !error };
}
