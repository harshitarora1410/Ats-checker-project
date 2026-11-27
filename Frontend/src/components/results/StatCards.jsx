import { ChartColumn, CircleCheck, Contrast, CircleX } from "lucide-react";
import Card from "../ui/Card";

function StatCard({ icon: Icon, tone, label, children }) {
  return (
    <Card className="flex items-center gap-3.5 px-4 py-3.5">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{children}</p>
      </div>
    </Card>
  );
}

export default function StatCards({ progress = {}, counts }) {
  const top = progress.top_score;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard icon={ChartColumn} tone="bg-primary-50 text-primary-600" label="Top score">
        {top == null ? "—" : Math.round(top)}
        <span className="text-sm font-medium text-gray-400">/100</span>
      </StatCard>
      <StatCard icon={CircleCheck} tone="bg-mint-50 text-strong" label="Strong fit">
        {counts.strong}
      </StatCard>
      <StatCard icon={Contrast} tone="bg-amber-50 text-moderate" label="Moderate fit">
        {counts.moderate}
      </StatCard>
      <StatCard icon={CircleX} tone="bg-red-50 text-weak" label="Weak fit · Failed">
        {counts.weak}
        <span className="text-sm font-medium text-gray-400"> · {counts.failed}</span>
      </StatCard>
    </div>
  );
}
