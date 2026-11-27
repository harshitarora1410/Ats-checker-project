import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import PasswordInput from "../components/common/PasswordInput";
import { useAuth } from "../hooks/useAuth";
import { useAnalysisDraft } from "../hooks/useAnalysisDraft";
import { getErrorMessage } from "../utils/errors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sessionExpired } = useAuth();
  const { pendingSubmit, submitAnalysis } = useAnalysisDraft();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // where to go after login if the user was sent here by a protected page
  const from = location.state?.from?.pathname || "/";

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

    setLoading(true);
    try {
      await login(email.trim(), password);

      // user pressed "Score Resumes" while logged out -> send the analysis now
      if (pendingSubmit) {
        try {
          const jobId = await submitAnalysis();
          navigate(`/analyze/${jobId}/progress`, { replace: true });
        } catch {
          navigate("/", { replace: true }); // main page shows the error
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setServerError(getErrorMessage(err, "Invalid email or password"));
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to score and rank candidates by fit."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" state={location.state} className="font-semibold text-primary-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {sessionExpired && !serverError && (
          <Alert tone="warning">Session expired, please login again</Alert>
        )}
        {pendingSubmit && (
          <p className="rounded-xl bg-primary-50 px-3.5 py-2.5 text-sm text-primary-600">
            Sign in to score your resumes. Your files are ready and will be sent right after.
          </p>
        )}
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
        />

        <PasswordInput
          id="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          labelRight={
            <button type="button" className="text-sm font-semibold text-primary-600 hover:underline">
              Forgot password?
            </button>
          }
        />

        <Button type="submit" loading={loading} className="w-full">
          Sign in <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthLayout>
  );
}
