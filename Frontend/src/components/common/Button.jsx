import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-primary-600 text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none",
  secondary:
    "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 disabled:text-gray-400",
  ghost: "text-gray-700 hover:bg-gray-100",
};

const sizes = {
  sm: "h-10 px-4",
  md: "h-11 px-5",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  ...rest
}) {
  return (
    <button
      disabled={loading || rest.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-600/20 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
