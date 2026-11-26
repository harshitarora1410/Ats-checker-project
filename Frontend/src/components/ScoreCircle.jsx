// Reusable circular score component
// size: 'lg' | 'md' | 'sm'
// verdict: 'strong' | 'moderate' | 'weak'
export default function ScoreCircle({ score, size = 'md', verdict }) {
  const resolvedVerdict = verdict || (score >= 75 ? 'strong' : score >= 50 ? 'moderate' : 'weak')

  const colorMap = {
    strong: { stroke: '#16A34A', text: 'text-green-600' },
    moderate: { stroke: '#D97706', text: 'text-amber-600' },
    weak: { stroke: '#DC2626', text: 'text-red-600' },
  }

  const sizeMap = {
    lg: { dim: 120, r: 50, sw: 10, fontSize: 'text-3xl' },
    md: { dim: 88, r: 36, sw: 8, fontSize: 'text-xl' },
    sm: { dim: 48, r: 18, sw: 5, fontSize: 'text-xs' },
  }

  const { dim, r, sw, fontSize } = sizeMap[size]
  const { stroke, text } = colorMap[resolvedVerdict]
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: dim, height: dim }}>
      <svg width={dim} height={dim} className="rotate-[-90deg]">
        <circle
          cx={dim / 2} cy={dim / 2} r={r}
          fill="none" stroke="#E5E7EB" strokeWidth={sw}
        />
        <circle
          cx={dim / 2} cy={dim / 2} r={r}
          fill="none" stroke={stroke} strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className={`font-bold ${fontSize} ${text}`}>{score}</span>
        {size !== 'sm' && <span className="text-[10px] text-gray-400 font-medium">/100</span>}
      </div>
    </div>
  )
}
