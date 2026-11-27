import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { api, AUTH_EXPIRED_EVENT, tokenStorage } from "../services";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // only "loading" while we check a saved token with GET /api/auth/me
  const [loading, setLoading] = useState(() => !!tokenStorage.getAccess());
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!tokenStorage.getAccess()) return;
    let active = true;
    api
      .me()
      .then((u) => active && setUser(u))
      .catch((err) => {
        // a dead token is removed; a network hiccup keeps it for the next reload
        if (err?.status === 401) tokenStorage.clear();
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // request.js fires this when the refresh token is rejected too
  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setSessionExpired(true);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const finishAuth = useCallback((data, remember) => {
    tokenStorage.set(data, remember);
    setUser(data.user);
    setSessionExpired(false);
    return data.user;
  }, []);

  const login = useCallback(
    async (email, password, remember = true) => finishAuth(await api.login(email, password), remember),
    [finishAuth]
  );

  const signup = useCallback(async (form) => finishAuth(await api.signup(form), true), [finishAuth]);

  const logout = useCallback(async () => {
    await api.logout();
    tokenStorage.clear();
    setUser(null);
    setSessionExpired(false);
  }, []);

  const value = useMemo(
    () => ({ user, loading, sessionExpired, isAuthenticated: !!user, login, signup, logout }),
    [user, loading, sessionExpired, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
