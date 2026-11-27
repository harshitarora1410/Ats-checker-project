import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { loginApi, signupApi, meApi, logoutApi } from "../api/authApi";
import { tokenStorage } from "../utils/tokenStorage";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking the saved token
  const [sessionExpired, setSessionExpired] = useState(false);

  // on app start: if a token exists, load the user
  useEffect(() => {
    if (!tokenStorage.getAccess()) {
      setLoading(false);
      return;
    }
    meApi()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  // axios tells us when the refresh failed
  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setSessionExpired(true);
    };
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  const handleAuthSuccess = useCallback((data) => {
    tokenStorage.set(data);
    setUser(data.user);
    setSessionExpired(false);
    return data.user;
  }, []);

  const login = useCallback(
    async (email, password) => handleAuthSuccess(await loginApi(email, password)),
    [handleAuthSuccess]
  );

  const signup = useCallback(
    async (form) => handleAuthSuccess(await signupApi(form)),
    [handleAuthSuccess]
  );

  const logout = useCallback(async () => {
    await logoutApi();
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, sessionExpired, isAuthenticated: !!user, login, signup, logout }),
    [user, loading, sessionExpired, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
