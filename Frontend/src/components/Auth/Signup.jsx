import { useState } from "react";

// Change this to your backend URL (or set VITE_API_URL in your .env file)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

//http://localhost:8000/api/auth/login - for login

// Returns a score from 0 to 4 for the password strength bar
function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabels = [
  "Too weak",
  "Weak",
  "Fair",
  "Good password",
  "Strong password",
];
const strengthColors = [
  "bg-red-500",
  "bg-red-500",
  "bg-amber-400",
  "bg-green-500",
  "bg-green-600",
];

function Signup({ onAccountCreated, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // top red banner
  const [errors, setErrors] = useState({}); // per-field errors
  const [createdEmail, setCreatedEmail] = useState(""); // set after success
  const [resendMessage, setResendMessage] = useState("");

  const strength = getPasswordStrength(formData.password);

  // One handler for every input (uses the input's "name" attribute)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Enter your full name";
    if (!formData.company.trim()) newErrors.company = "Enter your company";
    if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Enter a valid work email";
    if (formData.password.length < 8)
      newErrors.password = "Use at least 8 characters";
    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Passwords don't match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          company: formData.company.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        // 409 = email already registered
        setError("An account with this email already exists");
        setErrors({ email: " " });
        return;
      }

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setCreatedEmail(formData.email.trim());
      if (onAccountCreated) onAccountCreated();
    } catch (err) {
      setError("Can't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMessage("");
    try {
      await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: createdEmail }),
      });
      setResendMessage("Verification email sent again");
    } catch (err) {
      setResendMessage("Couldn't resend the email");
    }
  };

  // Input border: red if that field has an error
  const borderFor = (field) =>
    errors[field]
      ? "border-red-400 focus:ring-red-100"
      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100";

  const inputBase =
    "w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:ring-2";

  /* ---------- SUCCESS SCREEN: "Check your inbox" ---------- */
  if (createdEmail) {
    return (
      <div className="py-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl text-green-600">
          ✉
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Check your inbox
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Verification link sent to{" "}
          <span className="font-medium text-slate-700">{createdEmail}</span>
        </p>

        <a
          href="mailto:"
          className="mt-5 block w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Open email app
        </a>

        <button
          type="button"
          onClick={handleResend}
          className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
        >
          Resend email
        </button>
        {resendMessage && (
          <p className="mt-1 text-xs text-slate-500">{resendMessage}</p>
        )}

        <p className="mt-4 text-xs text-slate-500">
          Already verified?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    );
  }

  /* ---------- SIGNUP FORM ---------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error message (red) */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Full name + Company (side by side) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-xs font-medium text-slate-700"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Priya Sharma"
            autoComplete="name"
            className={`${inputBase} ${borderFor("name")}`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="company"
            className="mb-1.5 block text-xs font-medium text-slate-700"
          >
            Company
          </label>
          <input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Northwind"
            autoComplete="organization"
            className={`${inputBase} ${borderFor("company")}`}
          />
          {errors.company && (
            <p className="mt-1 text-xs text-red-600">{errors.company}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-medium text-slate-700"
        >
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@company.com"
          autoComplete="email"
          className={`${inputBase} ${borderFor("email")}`}
        />
        {errors.email && errors.email.trim() && (
          <p className="mt-1 text-xs text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Password + strength bar */}
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-medium text-slate-700"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className={`${inputBase} pr-14 ${borderFor("password")}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password}</p>
        )}

        {formData.password && (
          <div className="mt-2">
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`h-1 rounded-full ${bar <= strength ? strengthColors[strength] : "bg-slate-200"}`}
                />
              ))}
            </div>
            <p className="mt-1 text-xs font-medium text-slate-600">
              {strengthLabels[strength]}
            </p>
          </div>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-xs font-medium text-slate-700"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter password"
          autoComplete="new-password"
          className={`${inputBase} ${borderFor("confirmPassword")}`}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      {/* Switch to login */}
      <p className="text-center text-xs text-slate-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-blue-600 hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

export default Signup;
