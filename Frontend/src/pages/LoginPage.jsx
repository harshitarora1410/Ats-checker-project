import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import AuthLayout from "../components/layout/AuthLayout";
import IntentNotice from "../components/layout/IntentNotice";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import { useAuth } from "../hooks/useAuth";
import { usePostAuthRedirect } from "../hooks/usePostAuthRedirect";
import { carryParams, pathForParams } from "../lib/intent";
import { getErrorMessage } from "../lib/errors";
import { USE_MOCK } from "../config";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// P2 — login. After success: intent-based redirect (usePostAuthRedirect).
export default function LoginPage() {
  const [params] = useSearchParams();
  const { login, isAuthenticated, loading: checkingSession, sessionExpired } = useAuth();
  const redirectAfterAuth = usePostAuthRedirect();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const intent = params.get("intent");
  const expired = params.get("expired") === "1" || sessionExpired;

  // already signed in (e.g. opened /login by hand) -> straight to the target
  if (!checkingSession && isAuthenticated && !busy) {
    return <Navigate to={pathForParams(params)} replace />;
  }

  const validate = () => {
    const e = {};
    if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email address";
    if (!password) e.password = "Enter your password";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;

    setBusy(true);
    let user;
    try {
      user = await login(email.trim(), password, remember);
    } catch (err) {
      setServerError(getErrorMessage(err, "Invalid email or password"));
      if (err?.status === 401) setErrors({ email: true, password: true });
      setBusy(false);
      return;
    }
    // stays "busy" while an intent=score analysis is being created
    await redirectAfterAuth(user);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to score and rank candidates by fit."
      footer={
        <>
          New here?{" "}
          <Link to={carryParams(params, "signup")} className="font-semibold text-primary-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {expired && !serverError && <Alert tone="warning">Session expired, please login again</Alert>}
        {!expired && <IntentNotice intent={intent} />}
        {serverError && <Alert>{serverError}</Alert>}

        <Input
          id="email"
          label="Work email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoFocus
        />

        <PasswordInput
          id="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          labelRight={
            <button
              type="button"
              onClick={() => setShowReset((s) => !s)}
              className="text-sm font-semibold text-primary-600 hover:underline"
            >
              Forgot password?
            </button>
          }
        />
        {showReset && (
          <p className="-mt-2 text-xs text-gray-500">Password resets are handled by your admin. Ask them to reset it for you.</p>
        )}

        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-primary-600"
          />
          Keep me signed in
        </label>

        <Button type="submit" loading={busy} className="w-full">
          {busy && intent === "score" ? "Starting analysis…" : "Sign in"}
          {!busy && <ArrowRight className="h-4 w-4" />}
        </Button>

        {USE_MOCK && (
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
            Mock mode — try <span className="font-medium text-gray-700">vaibhav.shukla@algoworks.com</span> /{" "}
            <span className="font-medium text-gray-700">Algoworks@123</span>
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
