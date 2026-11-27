import { useCallback, useEffect, useState } from "react";

/**
 * Runs an async loader and tracks { data, error, loading }.
 * Re-runs when `deps` change; keeps the previous data while reloading
 * so tables don't flash empty when a filter changes.
 */
export function useAsync(loader, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    loader().then(
      (data) => active && setState({ data, error: null, loading: false }),
      (error) => active && setState((s) => ({ data: s.data, error, loading: false }))
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload };
}
