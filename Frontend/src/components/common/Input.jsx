export default function Input({
  id,
  label,
  error,
  icon: Icon,
  rightSlot,
  labelRight,
  className = "",
  ...rest
}) {
  return (
    <div className={className}>
      {(label || labelRight) && (
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor={id} className="text-sm font-medium text-gray-900">
            {label}
          </label>
          {labelRight}
        </div>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        )}
        <input
          id={id}
          aria-invalid={!!error}
          className={`h-12 w-full rounded-xl border bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 ${
            Icon ? "pl-10" : "pl-3.5"
          } ${rightSlot ? "pr-11" : "pr-3.5"} ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
              : "border-gray-300 focus:border-primary-600 focus:ring-primary-600/15"
          }`}
          {...rest}
        />
        {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
