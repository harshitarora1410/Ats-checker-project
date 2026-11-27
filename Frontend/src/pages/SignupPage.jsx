import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, User } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import PasswordInput from "../components/common/PasswordInput";
import { useAuth } from "../hooks/useAuth";
import { useAnalysisDraft } from "../hooks/useAnalysisDraft";
import { getErrorMessage } from "../utils/errors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  const { pendingSubmit, submitAnalysis } = useAnalysisDraft();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";
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

    setLoading(true);
    try {
      // role is optional on the backend (defaults to HR), so we don't send it
      await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password });

      if (pendingSubmit) {
        try {
          const jobId = await submitAnalysis();
          navigate(`/analyze/${jobId}/progress`, { replace: true });
        } catch {
          navigate("/", { replace: true });
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setServerError(getErrorMessage(err, "Could not create your account"));
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start scoring and ranking candidates by fit."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" state={location.state} className="font-semibold text-primary-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {pendingSubmit && (
          <p className="rounded-xl bg-primary-50 px-3.5 py-2.5 text-sm text-primary-600">
            Create an account to score your resumes. Your files are ready and will be sent right after.
          </p>
        )}
        {serverError && <Alert>{serverError}</Alert>}

        <Input
          id="name"
          label="Full name"
          icon={User}
          autoComplete="name"
          placeholder="Priya Sharma"
          value={form.name}
          onChange={set("name")}
          error={errors.name}
        />
        <Input
          id="email"
          label="Work email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
        />
        <PasswordInput
          id="password"
          label="Password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
        />
        <PasswordInput
          id="confirm"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={form.confirm}
          onChange={set("confirm")}
          error={errors.confirm}
        />

        <Button type="submit" loading={loading} className="w-full">
          Create account <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthLayout>
  );
}
