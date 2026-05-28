import type { RegiaoCritica } from "../types/api";
import ChartCard from "./ChartCard";

const URGENCIA_STYLE: Record<string, { badge: string; dot: string }> = {
  "Atenção Crítica":    { badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",   dot: "bg-red-500" },
  "Monitoramento Ativo":{ badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", dot: "bg-amber-400" },
  "Referência":         { badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400", dot: "bg-green-500" },
};

function Metric({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</span>
      <span className={`text-xs font-semibold font-mono ${bad ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"}`}>
        {value}
      </span>
    </div>
  );
}

function RegiaoCard({ r }: { r: RegiaoCritica }) {
  const s = URGENCIA_STYLE[r.urgencia] ?? URGENCIA_STYLE["Referência"];
  const maxScore = 60;

  return (
    <div className="flex flex-col gap-2.5 px-4 py-3.5 border border-slate-100 dark:border-slate-700/60 rounded-xl bg-white dark:bg-slate-800/60 transition-colors">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
        <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{r.regiao}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${s.badge}`}>{r.urgencia}</span>
        <span className="text-xs font-bold font-mono text-slate-600 dark:text-slate-300 shrink-0">{r.score_criticidade}</span>
      </div>

      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${s.dot}`}
          style={{ width: `${Math.min((r.score_criticidade / maxScore) * 100, 100)}%` }}
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Metric label="Inadimpl."  value={`${r.taxa_inadimplencia}%`} bad={r.taxa_inadimplencia > 26} />
        <Metric label="Recuperação" value={`${r.taxa_recuperacao}%`} />
        <Metric label="Judicial."  value={`${r.taxa_judicializacao}%`} bad={r.taxa_judicializacao > 10} />
        <Metric label="Em Aberto"  value={`${r.taxa_em_aberto}%`} />
      </div>

      <div className="flex gap-3 text-[9px] text-slate-400 dark:text-slate-500 border-t border-slate-50 dark:border-slate-700/40 pt-2">
        <span>{r.total_contratos.toLocaleString("pt-BR")} contratos</span>
        <span className="text-slate-200 dark:text-slate-700">·</span>
        <span>R$ {(r.valor_inadimplente / 1e6).toFixed(1)}M inadimplente</span>
        <span className="text-slate-200 dark:text-slate-700">·</span>
        <span>Atraso médio {r.atraso_medio_dias} dias</span>
      </div>
    </div>
  );
}

interface Props {
  regioes: RegiaoCritica[];
}

export default function RegioesProblemaCard({ regioes }: Props) {
  return (
    <ChartCard
      title="Criticidade por Região"
      subtitle="Score = inadimplência (30%) + recuperação invertida (40%) + judicialização (30%) — sem normalização"
    >
      <div className="flex flex-col gap-2.5 pt-1">
        {regioes.map(r => <RegiaoCard key={r.regiao} r={r} />)}
      </div>
    </ChartCard>
  );
}
