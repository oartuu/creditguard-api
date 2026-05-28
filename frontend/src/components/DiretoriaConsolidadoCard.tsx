import type { VisaoConsolidadaRow, AlertaExecutivo } from "../types/api";
import ChartCard from "./ChartCard";

const AVALIACAO_CONFIG = {
  bom:    { dot: "bg-green-500", badge: "bg-green-500/10 text-green-600 dark:text-green-400" },
  alerta: { dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  critico:{ dot: "bg-red-500",   badge: "bg-red-500/10   text-red-600   dark:text-red-400" },
  neutro: { dot: "bg-slate-400", badge: "bg-slate-100    text-slate-500 dark:bg-slate-700/40 dark:text-slate-400" },
} as const;

const ALERTA_CONFIG = {
  critico:  { border: "border-red-500/40",   bg: "bg-red-500/8   dark:bg-red-500/10",   icon: "●", iconColor: "text-red-500" },
  alerta:   { border: "border-amber-500/40", bg: "bg-amber-500/8 dark:bg-amber-500/10", icon: "▲", iconColor: "text-amber-500" },
  positivo: { border: "border-green-500/40", bg: "bg-green-500/8 dark:bg-green-500/10", icon: "✓", iconColor: "text-green-500" },
  neutro:   { border: "border-slate-200 dark:border-slate-700/60", bg: "bg-slate-50 dark:bg-slate-800/40", icon: "→", iconColor: "text-slate-400" },
  info:     { border: "border-blue-500/40",  bg: "bg-blue-500/8  dark:bg-blue-500/10",  icon: "i", iconColor: "text-blue-500" },
} as const;

interface ConsolidadoProps { rows: VisaoConsolidadaRow[] }
interface AlertasProps     { alertas: AlertaExecutivo[] }

export function DiretoriaConsolidadoTable({ rows }: ConsolidadoProps) {
  return (
    <ChartCard title="Visão Consolidada dos Resultados" subtitle="Principais métricas com avaliação de tendência">
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700/60">
              <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">Métrica</th>
              <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">Valor Atual</th>
              <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">Tendência</th>
              <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">Variação</th>
              <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500 hidden sm:table-cell">Contexto</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const cfg = AVALIACAO_CONFIG[row.avaliacao];
              return (
                <tr
                  key={i}
                  className="border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <span className="text-slate-800 dark:text-slate-100 font-medium text-[13px]">{row.metrica}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-slate-900 dark:text-slate-100 font-bold font-mono text-[13px]">{row.valor}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      {row.tendencia_label}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-slate-600 dark:text-slate-400 font-mono text-[12px]">{row.variacao}</span>
                  </td>
                  <td className="py-3 px-3 hidden sm:table-cell">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">{row.contexto}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

export function DiretoriaAlertasCard({ alertas }: AlertasProps) {
  return (
    <ChartCard title="Alertas Executivos" subtitle="Sinais relevantes para decisão estratégica">
      <div className="flex flex-col gap-3 pt-1">
        {alertas.map((a, i) => {
          const cfg = ALERTA_CONFIG[a.tipo];
          return (
            <div key={i} className={`flex gap-3 p-3 rounded-xl border ${cfg.border} ${cfg.bg}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-white/60 dark:bg-black/20 ${cfg.iconColor}`}>
                {cfg.icon}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className={`text-[12px] font-bold ${cfg.iconColor}`}>{a.titulo}</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">{a.descricao}</span>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
