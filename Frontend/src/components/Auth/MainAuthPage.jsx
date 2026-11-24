import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

function MainAuthPage({ sessionExpired = false, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState("login"); // "login" or "signup"
  const [accountCreated, setAccountCreated] = useState(false); // true after successful signup

  const switchTab = (tab) => {
    setAccountCreated(false);
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 via-white to-sky-100 text-slate-900">
      {/* Top bar with logo */}
      <header className="flex items-center gap-2.5 px-5 py-4 sm:px-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 font-bold text-white">
          A
        </div>
        <span className="text-sm font-semibold">ATS Resume Scorer</span>
      </header>

      {/* Card */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-[400px] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          {/* Heading + tabs (hidden on the "Check your inbox" screen) */}
          {!accountCreated && (
            <>
              <div className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 text-lg font-bold text-white">
                  A
                </div>
                <h1 className="mt-3 text-xl font-bold tracking-tight">
                  {activeTab === "login"
                    ? "Welcome back"
                    : "Create your account"}
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  {activeTab === "login"
                    ? "Sign in to score and rank candidates by fit."
                    : "Start scoring resumes against your job descriptions."}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => switchTab("login")}
                  className={`rounded-md py-1.5 text-sm font-medium ${
                    activeTab === "login"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("signup")}
                  className={`rounded-md py-1.5 text-sm font-medium ${
                    activeTab === "signup"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Sign up
                </button>
              </div>
            </>
          )}

          {/* Form */}
          <div className={accountCreated ? "" : "mt-5"}>
            {activeTab === "login" ? (
              <Login
                sessionExpired={sessionExpired}
                onLoginSuccess={onLoginSuccess}
                onSwitchToSignup={() => switchTab("signup")}
              />
            ) : (
              <Signup
                onAccountCreated={() => setAccountCreated(true)}
                onSwitchToLogin={() => switchTab("login")}
              />
            )}
          </div>

          {/* Security note */}
          {!accountCreated && (
            <p className="mt-5 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-500">
              🛡 SSO &amp; 256-bit encryption for HR data
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center justify-between gap-2 px-5 py-4 text-[11px] text-slate-500 sm:flex-row sm:px-8">
        <span>© {new Date().getFullYear()} ATS Resume Scorer</span>
        <span className="space-x-3">
          <a href="/privacy" className="hover:text-slate-700">
            Privacy
          </a>
          <a href="/terms" className="hover:text-slate-700">
            Terms
          </a>
          <a href="/support" className="hover:text-slate-700">
            Support
          </a>
        </span>
      </footer>
    </div>
  );
}

export default MainAuthPage;
