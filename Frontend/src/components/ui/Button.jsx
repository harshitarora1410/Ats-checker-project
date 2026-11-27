import { Link } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

// btn/primary, btn/secondary, btn/outline, btn/ghost, btn/danger — radius 12, 14px semibold
const VARIANTS = {
  primary:
    "bg-primary-600 text-white shadow-sm hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none",
  secondary: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 disabled:text-gray-400",
  outline: "border border-primary-600 bg-white text-primary-600 hover:bg-primary-50 disabled:border-gray-200 disabled:text-gray-400",
  ghost: "text-gray-700 hover:bg-gray-100 disabled:text-gray-400",
  danger: "bg-weak text-white hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400",
  dark: "bg-white/10 text-white hover:bg-white/20",
};

// sm = 40px, md = 44px, lg = 48px
const SIZES = {
  xs: "h-8 px-3 text-xs",
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
  icon: "h-10 w-10 text-sm",
  "icon-sm": "h-8 w-8 text-sm",
};

export const buttonClasses = (variant = "primary", size = "md", className = "") =>
  `inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-600/20 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

export default function Button({ variant, size, loading = false, className = "", type = "button", children, ...rest }) {
  return (
    <button type={type} disabled={loading || rest.disabled} className={buttonClasses(variant, size, className)} {...rest}>
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, className = "", children, ...rest }) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
