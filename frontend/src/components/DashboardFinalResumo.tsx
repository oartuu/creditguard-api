import type { DashboardFinal } from "../types/api";
import DiretoriaSaudeCard from "./DiretoriaSaudeCard";
import { DiretoriaConsolidadoTable, DiretoriaAlertasCard } from "./DiretoriaConsolidadoCard";

const STATUS_GERAL_CFG = {
  ok: {
    bg: "bg-green-500/10 dark:bg-green-500/15",
    ring: "ring-green-500/30",
    text: "text-green-600 dark:text-green-400",
    label: "Todos os KPIs Validados",
    sub: "Sistema em condição saudável",
  },
  alerta: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    ring: "ring-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    label: "KPIs com Atenção Necessária",
    sub: "Monitoramento ativo recomendado",
  },
  critico: {
    bg: "bg-red-500/10 dark:bg-red-500/15",
    ring: "ring-red-500/30",
    text: "text-red-600 dark:text-red-400",
    label: "KPIs em Estado Crítico",
    sub: "Ação imediata necessária",
  },
} as const;

interface Props {
  dados: DashboardFinal;
}

export default function DashboardFinalResumo({ dados }: Props) {
  const cfg = STATUS_GERAL_CFG[dados.status_geral];
  const { ok, alerta, critico, total } = dados.resumo_validacao;

  return (
    <div className="flex flex-col gap-4">
      {/* Overall status hero */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl ring-1 ${cfg.bg} ${cfg.ring}`}>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-1">
            Status de Validação Geral
          </div>
          <div className={`text-2xl font-black ${cfg.text}`}>{cfg.label}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{cfg.sub}</div>
        </div>
        <div className="grid grid-cols-3 gap-3 flex-shrink-0">
          {[
            { label: "OK", count: ok, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
            { label: "Alerta", count: alerta, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
            { label: "Crítico", count: critico, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 text-center`}>
              <div className={`text-3xl font-black leading-none ${s.color}`}>{s.count}</div>
              <div className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${s.color}`}>{s.label}</div>
              <div className="text-[9px] text-slate-400 dark:text-slate-500">de {total}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Saúde + Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DiretoriaSaudeCard saude={dados.saude_carteira} />
        <DiretoriaAlertasCard alertas={dados.alertas_executivos} />
      </div>

      {/* Visão consolidada */}
      <DiretoriaConsolidadoTable rows={dados.visao_consolidada} />
    </div>
  );
}
