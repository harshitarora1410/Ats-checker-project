import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, FlaskConical, LogOut, Menu, Settings, X } from "lucide-react";
import Logo from "../ui/Logo";
import Avatar from "../ui/Avatar";
import { ButtonLink } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../lib/constants";
import { USE_MOCK } from "../../config";

// History and Settings need login: for a guest, ProtectedRoute turns
// /history into /login?intent=history (and the same for settings).
const LINKS = [
  { to: "/", label: "Analyze", match: (p) => p === "/" || p.startsWith("/analyze") },
  { to: "/history", label: "History", match: (p) => p.startsWith("/history") },
  { to: "/settings", label: "Settings", match: (p) => p.startsWith("/settings") },
];

const linkClass = (active) =>
  `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
    active ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const role = ROLE_LABELS[user.role] || user.role;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-gray-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
      >
        <Avatar name={user.name} />
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-semibold text-gray-900">{user.name}</span>
          <span className="block text-xs text-gray-500">{role}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-60 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
          <Link
            role="menuitem"
            to="/settings"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
          <button
            role="menuitem"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={linkClass(l.match(pathname))} aria-current={l.match(pathname) ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {USE_MOCK && (
            <span title="VITE_USE_MOCK=true — data is simulated in the browser" className="hidden items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 lg:inline-flex">
              <FlaskConical className="h-3.5 w-3.5" /> Mock data
            </span>
          )}
          {loading ? (
            <span className="h-9 w-32 animate-pulse rounded-xl bg-gray-100" />
          ) : isAuthenticated ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <>
              <ButtonLink to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign in
              </ButtonLink>
              <ButtonLink to="/signup" size="sm">
                Sign up
              </ButtonLink>
            </>
          )}
          <button
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-gray-100 px-4 py-3 md:hidden" aria-label="Mobile">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass(l.match(pathname))} onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          {!isAuthenticated && !loading && (
            <Link to="/login" className={linkClass(false)} onClick={() => setMobileOpen(false)}>
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
