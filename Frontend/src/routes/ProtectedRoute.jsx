import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageSpinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { loginUrlForPath } from "../lib/intent";

// Guests are sent to login with the intent of the page they tried to open:
//   /history  -> /login?intent=history
//   /settings -> /login?intent=settings
//   other     -> /login?next=<path>
export default function ProtectedRoute() {
  const { isAuthenticated, loading, sessionExpired } = useAuth();
  const location = useLocation();

  if (loading) return <PageSpinner label="Checking your session…" />;

  if (!isAuthenticated) {
    return <Navigate to={loginUrlForPath(location.pathname, location.search, sessionExpired)} replace />;
  }

  return <Outlet />;
}
