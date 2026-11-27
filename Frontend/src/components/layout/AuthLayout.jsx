import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import Logo, { LogoMark } from "../ui/Logo";

// Login / signup shell (design page 1): logo top-left, soft gradient, centred card
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-br from-mint-50 via-white to-primary-50">
      <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      <header className="relative px-5 py-4 sm:px-8">
        <Logo />
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-110 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/60 sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <LogoMark className="mb-4 h-12 w-12" />
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>
          </div>

          {children}

          <div className="mt-6 border-t border-gray-100 pt-4 text-center">
            {footer && <p className="text-sm text-gray-600">{footer}</p>}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <ShieldCheck className="h-3.5 w-3.5 text-strong" />
              SSO &amp; 256-bit encryption for HR data
            </p>
          </div>
        </div>
      </main>

      <footer className="relative flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-xs text-gray-400 sm:px-8">
        <span>© {new Date().getFullYear()} ATS Resume Scorer</span>
        <span className="flex gap-2">
          <Link to="/" className="hover:text-gray-600">Home</Link>·
          <a href="mailto:support@algoworks.com" className="hover:text-gray-600">Support</a>
        </span>
      </footer>
    </div>
  );
}
