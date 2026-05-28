import type { InsightConsolidado } from "../types/api";

const PRIORIDADE_STYLE: Record<string, { border: string; badge: string }> = {
  alta:  { border: "border-red-400 dark:border-red-500", badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
  media: { border: "border-amber-400 dark:border-amber-500", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  baixa: { border: "border-blue-300 dark:border-blue-600", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
};

const CATEGORIA_ICONS: Record<string, string> = {
  Risco:       "◈",
  Recuperação: "◉",
  Assessoria:  "◎",
  Perfil:      "◆",
  Temporal:    "◐",
  Regional:    "◑",
};

interface Props {
  insights: InsightConsolidado[];
}

export default function InsightsConsolidadosCard({ insights }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 flex flex-col gap-4 transition-colors">
      <div className="flex flex-col gap-0.5">
        <h3 className="m-0 text-slate-900 dark:text-slate-100 text-sm font-semibold">Insights Consolidados</h3>
        <p className="m-0 text-xs text-slate-400 dark:text-slate-500">
          Principais descobertas integradas de todos os indicadores da carteira.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {insights.map((ins, i) => {
          const s = PRIORIDADE_STYLE[ins.prioridade] ?? PRIORIDADE_STYLE.baixa;
          const icon = CATEGORIA_ICONS[ins.categoria] ?? "◇";
          return (
            <div
              key={i}
              className={`bg-slate-50 dark:bg-slate-900/60 rounded-lg px-4 py-3.5 flex flex-col gap-1.5 border-l-[3px] transition-colors ${s.border}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-800 dark:text-slate-100 text-sm font-semibold leading-snug flex-1">
                  <span className="mr-2 opacity-50">{icon}</span>
                  {ins.insight}
                </span>
                <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${s.badge}`}>
                    {ins.prioridade === "alta" ? "Alta" : ins.prioridade === "media" ? "Média" : "Baixa"}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {ins.categoria}
                  </span>
                </div>
              </div>
              <span className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{ins.detalhe}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
