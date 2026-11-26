import { useState } from "react";

// Change this to your backend URL (or set VITE_API_URL in your .env file)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function Login({ sessionExpired = false, onLoginSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExpired, setShowExpired] = useState(sessionExpired);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowExpired(false);

    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 401 = wrong email or password
        setError(
          res.status === 401
            ? "Invalid email or password"
            : data.message || "Something went wrong",
        );
        return;
      }

      // Save the JWT token.
      // "Keep me signed in" -> localStorage (stays after closing the browser)
      // otherwise           -> sessionStorage (cleared when the tab closes)
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", data.token);

      if (onLoginSuccess) onLoginSuccess(data.user);
    } catch (err) {
      setError("Can't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Red border when there is a login error, normal border otherwise
  const inputBorder = error
    ? "border-red-400 focus:ring-red-100"
    : "border-slate-300 focus:border-blue-500 focus:ring-blue-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Session expired message (yellow) */}
      {showExpired && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Session expired, please login again
        </div>
      )}

      {/* Error message (red) */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="login-email"
          className="mb-1.5 block text-xs font-medium text-slate-700"
        >
          Work email
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          autoComplete="email"
          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:ring-2 ${inputBorder}`}
        />
      </div>

      {/* Password */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="text-xs font-medium text-slate-700"
          >
            Password
          </label>
          <button
            type="button"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-14 text-sm shadow-sm outline-none focus:ring-2 ${inputBorder}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Keep me signed in */}
      <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-blue-600"
        />
        Keep me signed in
      </label>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in →"}
      </button>

      {/* Switch to signup */}
      <p className="pt-1 text-center text-xs text-slate-500">
        New to ATS Resume Scorer?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-semibold text-blue-600 hover:underline"
        >
          Create an account
        </button>
      </p>
    </form>
  );
}

export default Login;
