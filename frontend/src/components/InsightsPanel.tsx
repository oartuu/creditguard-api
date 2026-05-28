import type { Insight } from "../types/api";

function InsightCard({ insight, detalhe }: Insight) {
  return (
    <div className="bg-slate-900 rounded-lg px-4 py-3.5 flex flex-col gap-1.5 border-l-[3px] border-blue-500">
      <span className="text-slate-100 text-sm font-semibold">{insight}</span>
      <span className="text-slate-400 text-xs leading-relaxed">{detalhe}</span>
    </div>
  );
}

interface Props {
  title?: string;
  insights: Insight[];
}

export default function InsightsPanel({ title, insights }: Props) {
  if (!insights?.length) return null;
  return (
    <div className="bg-slate-800 rounded-xl p-6 flex flex-col gap-3">
      <h3 className="m-0 text-slate-100 text-sm font-semibold">{title ?? "Insights"}</h3>
      <div className="flex flex-col gap-2.5">
        {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
      </div>
    </div>
  );
}
