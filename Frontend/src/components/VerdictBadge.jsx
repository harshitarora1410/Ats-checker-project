// Verdict badge — Strong fit / Moderate fit / Weak fit
export default function VerdictBadge({ verdict }) {
  const styles = {
    strong:   'bg-green-50 text-green-700 border border-green-200',
    moderate: 'bg-amber-50 text-amber-700 border border-amber-200',
    weak:     'bg-red-50   text-red-700   border border-red-200',
  }

  const labels = {
    strong:   'Strong fit',
    moderate: 'Moderate fit',
    weak:     'Weak fit',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[verdict]}`}>
      {labels[verdict]}
    </span>
  )
}
