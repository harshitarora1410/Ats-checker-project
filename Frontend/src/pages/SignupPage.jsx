import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Mail, User } from "lucide-react";
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// P2 — signup. Same intent-based redirect as login.
export default function SignupPage() {
  const [params] = useSearchParams();
  const { signup, isAuthenticated, loading: checkingSession } = useAuth();
  const redirectAfterAuth = usePostAuthRedirect();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  const intent = params.get("intent");

  if (!checkingSession && isAuthenticated && !busy) {
    return <Navigate to={pathForParams(params)} replace />;
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Enter your full name";
    if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address";
    if (form.password.length < 8) e.password = "Use at least 8 characters";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match";
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
      // role is optional on the backend (defaults to HR), so we don't send it
      user = await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password });
    } catch (err) {
      setServerError(getErrorMessage(err, "Could not create your account"));
      setBusy(false);
      return;
    }
    await redirectAfterAuth(user);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start scoring and ranking candidates by fit."
      footer={
        <>
          Already have an account?{" "}
          <Link to={carryParams(params, "login")} className="font-semibold text-primary-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <IntentNotice intent={intent} verb="Create an account" />
        {serverError && <Alert>{serverError}</Alert>}

        <Input id="name" label="Full name" icon={User} autoComplete="name" placeholder="Priya Sharma" value={form.name} onChange={set("name")} error={errors.name} autoFocus />
        <Input id="email" label="Work email" icon={Mail} type="email" autoComplete="email" placeholder="name@company.com" value={form.email} onChange={set("email")} error={errors.email} />
        <PasswordInput id="password" label="Password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={set("password")} error={errors.password} />
        <PasswordInput id="confirm" label="Confirm password" autoComplete="new-password" placeholder="Re-enter your password" value={form.confirm} onChange={set("confirm")} error={errors.confirm} />

        <Button type="submit" loading={busy} className="w-full">
          {busy && intent === "score" ? "Starting analysis…" : "Create account"}
          {!busy && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>
    </AuthLayout>
  );
}
