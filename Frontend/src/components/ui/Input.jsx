
const fieldBase =
  "w-full rounded-xl border bg-white text-sm text-gray-900 placeholder:text-gray-400 transition-shadow focus:outline-none focus:ring-4 disabled:bg-gray-100 disabled:text-gray-500";

export const fieldClasses = (error) =>
  `${fieldBase} ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
      : "border-gray-300 focus:border-primary-600 focus:ring-primary-100"
  }`;

export function Label({ htmlFor, children, right }) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-900">
        {children}
      </label>
      {right}
    </div>
  );
}

export default function Input({ id, label, labelRight, error, hint, icon: Icon, rightSlot, className = "", ...rest }) {
  return (
    <div className={className}>
      {(label || labelRight) && (
        <Label htmlFor={id} right={labelRight}>
          {label}
        </Label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        )}
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={typeof error === "string" && error ? `${id}-error` : undefined}
          className={`h-12 ${fieldClasses(error)} ${Icon ? "pl-10" : "pl-3.5"} ${rightSlot ? "pr-11" : "pr-3.5"}`}
          {...rest}
        />
        {rightSlot && <div className="absolute top-1/2 right-3 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {typeof error === "string" && error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

export function Select({ id, value, onChange, children, icon: Icon, className = "", ...rest }) {
  return (
    <div className={`relative ${className}`}>
      {Icon && <Icon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />}
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`h-10 w-full appearance-none rounded-xl border border-gray-300 bg-white pr-9 text-sm font-medium text-gray-800 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 focus:outline-none ${Icon ? "pl-9" : "pl-3.5"}`}
        {...rest}
      >
        {children}
      </select>
      <svg className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
