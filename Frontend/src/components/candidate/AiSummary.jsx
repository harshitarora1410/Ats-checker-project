import { ThumbsUp, TrendingDown, TrendingUp, WandSparkles } from "lucide-react";
import Card from "../ui/Card";
import { gapsOf, strengthsOf } from "../../lib/candidate";

export function Recommendation({ recommendations = [] }) {
  if (!recommendations.length) return null;
  const [headline, ...rest] = recommendations;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-mint-50 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-strong text-white">
        <ThumbsUp className="h-4 w-4" />
      </span>
      <div>
        <p className="font-bold text-green-900">Recommendation: {headline}</p>
        {rest.length > 0 && <p className="mt-0.5 text-sm text-gray-700">{rest.join(" ")}</p>}
      </div>
    </div>
  );
}

function Column({ icon: Icon, title, tone, items }) {
  return (
    <div>
      <p className={`mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase ${tone}`}>
        <Icon className="h-4 w-4" /> {title}
      </p>
      {items.length ? (
        <ul className="space-y-1.5">
          {items.map((s, i) => (
            <li key={`${s}-${i}`} className="flex gap-2 text-sm text-gray-800">
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone === "text-strong" ? "bg-strong" : "bg-weak"}`} />
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">None listed</p>
      )}
    </div>
  );
}

export default function AiSummary({ detail }) {
  const strengths = strengthsOf(detail);
  const gaps = gapsOf(detail);
  return (
    <Card>
      <h2 className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 font-bold text-gray-900">
        <WandSparkles className="h-4 w-4 text-strong" /> AI summary
      </h2>
      <div className="space-y-5 p-5">
        {detail.summary && <p className="text-sm leading-relaxed text-gray-700">{detail.summary}</p>}
        <div className="grid gap-5 md:grid-cols-2 md:divide-x md:divide-gray-100">
          <Column icon={TrendingUp} title="Strengths" tone="text-strong" items={strengths} />
          <div className="md:pl-5">
            <Column icon={TrendingDown} title="Gaps" tone="text-weak" items={gaps} />
          </div>
        </div>
        <Recommendation recommendations={detail.recommendations} />
      </div>
    </Card>
  );
}
