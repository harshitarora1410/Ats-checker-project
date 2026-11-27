// Reusable progress bar
// variant: 'section' (6px) | 'overall' (12px) | 'upload' (4px)
export default function ProgressBar({ value, max = 100, label, variant = 'section', showValue = true }) {
  const pct = Math.min(Math.round((value / max) * 100), 100)

  const heightMap = {
    section: 'h-1.5',
    overall: 'h-3',
    upload:  'h-1',
  }

  const colorMap = {
    section: value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500',
    overall: 'bg-blue-600',
    upload:  'bg-blue-500',
  }

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-600">{label}</span>
          {showValue && (
            <span className="text-xs font-semibold text-gray-700">{value}/{max}</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full ${heightMap[variant]}`}>
        <div
          className={`${heightMap[variant]} rounded-full ${colorMap[variant]} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
