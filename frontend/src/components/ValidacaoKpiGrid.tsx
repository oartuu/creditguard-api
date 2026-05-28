import type { DFValidacaoKpi } from "../types/api";

const STATUS_CFG = {
  ok: {
    bg: "bg-green-500/8 dark:bg-green-500/12",
    border: "border-green-500/30",
    badge: "bg-green-500/15 text-green-600 dark:text-green-400",
    dot: "bg-green-500",
    valor: "text-green-600 dark:text-green-400",
    label: "OK",
  },
  alerta: {
    bg: "bg-amber-500/8 dark:bg-amber-500/12",
    border: "border-amber-500/30",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    valor: "text-amber-600 dark:text-amber-400",
    label: "ALERTA",
  },
  critico: {
    bg: "bg-red-500/8 dark:bg-red-500/12",
    border: "border-red-500/30",
    badge: "bg-red-500/15 text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    valor: "text-red-600 dark:text-red-400",
    label: "CRÍTICO",
  },
} as const;

const TENDENCIA_ICON: Record<string, string> = {
  subindo: "↑",
  caindo: "↓",
  estável: "→",
  insuficiente: "—",
};

interface Props {
  validacoes: DFValidacaoKpi[];
}

function ValidacaoCard({ v }: { v: DFValidacaoKpi }) {
  const cfg = STATUS_CFG[v.status];
  const tIcon = TENDENCIA_ICON[v.tendencia] ?? "—";
  const varStr = v.variacao_tendencia > 0
    ? `+${v.variacao_tendencia.toFixed(2)}`
    : v.variacao_tendencia.toFixed(2);

  const tColor = v.kpi === "Taxa de Inadimplência" || v.kpi === "Atraso Médio" || v.kpi === "Risco Regional"
    ? v.tendencia === "caindo" ? "text-green-500" : v.tendencia === "subindo" ? "text-red-500" : "text-slate-400 dark:text-slate-500"
    : v.tendencia === "subindo" ? "text-green-500" : v.tendencia === "caindo" ? "text-red-500" : "text-slate-400 dark:text-slate-500";

  return (
    <div className={`flex flex-col gap-3 p-5 rounded-2xl border ${cfg.border} ${cfg.bg} transition-colors`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">
            {v.modulo}
          </span>
          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{v.kpi}</span>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      {/* Valor */}
      <div className={`text-3xl font-black leading-none ${cfg.valor}`}>
        {v.valor}
      </div>

      {/* Tendência */}
      <div className="flex items-center gap-2">
        <span className={`text-xl font-bold ${tColor}`}>{tIcon}</span>
        <div className="flex flex-col gap-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{v.tendencia}</span>
          {v.kpi !== "Risco Regional" && v.kpi !== "Tendência Temporal" && (
            <span className={`text-[11px] font-mono font-semibold ${tColor}`}>{varStr} p.p.</span>
          )}
        </div>
      </div>

      {/* Thresholds */}
      <div className="flex flex-col gap-1 border-t border-slate-100 dark:border-slate-700/40 pt-3">
        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
          <span className="text-slate-400 dark:text-slate-500">Alerta: {v.threshold_alerta}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-slate-400 dark:text-slate-500">Crítico: {v.threshold_critico}</span>
        </div>
      </div>

      {/* Insight */}
      <div className="flex items-start gap-2 border-t border-slate-100 dark:border-slate-700/40 pt-2">
        <div className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${cfg.dot}`} />
        <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{v.insight}</span>
      </div>
    </div>
  );
}

export default function ValidacaoKpiGrid({ validacoes }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {validacoes.map(v => <ValidacaoCard key={v.kpi} v={v} />)}
    </div>
  );
}
