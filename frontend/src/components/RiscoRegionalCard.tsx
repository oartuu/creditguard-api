import type { RiscoRegionalItem } from "../types/api";
import ChartCard from "./ChartCard";

const NIVEL_STYLE: Record<string, { badge: string; bar: string; text: string }> = {
  Alto:  { badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",   bar: "bg-red-500",    text: "text-red-600 dark:text-red-400" },
  Médio: { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", bar: "bg-amber-400", text: "text-amber-600 dark:text-amber-400" },
  Baixo: { badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400", bar: "bg-green-500", text: "text-green-600 dark:text-green-400" },
};

const PESO_LABELS: Record<string, string> = {
  inadimplencia: "Inadimplência",
  recuperacao_inv: "Rec. Invertida",
  judicializacao: "Judicialização",
  atraso: "Atraso",
};

const PESO_COLORS: Record<string, string> = {
  inadimplencia: "bg-red-400",
  recuperacao_inv: "bg-orange-400",
  judicializacao: "bg-purple-400",
  atraso: "bg-slate-400",
};

interface Props {
  data: RiscoRegionalItem[];
  pesos: { inadimplencia: number; recuperacao: number; judicializacao: number; atraso: number };
}

function ComponentBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-400 dark:text-slate-500 w-[88px] shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 w-7 text-right">{value}</span>
    </div>
  );
}

function RegionRow({ item }: { item: RiscoRegionalItem }) {
  const s = NIVEL_STYLE[item.nivel_risco] ?? NIVEL_STYLE.Médio;
  const comps = item.scores_componentes;

  return (
    <div className="flex flex-col gap-2 px-4 py-3.5 border border-slate-100 dark:border-slate-700/60 rounded-xl bg-white dark:bg-slate-800/60 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.regiao}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{item.nivel_risco}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-2xl font-bold tabular-nums leading-none ${s.text}`}>{item.score_risco_composto}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 self-end pb-0.5">/100</span>
        </div>
      </div>

      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${s.bar}`} style={{ width: `${item.score_risco_composto}%` }} />
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-1">
        <ComponentBar label={PESO_LABELS.inadimplencia}   value={comps.inadimplencia}   color={PESO_COLORS.inadimplencia} />
        <ComponentBar label={PESO_LABELS.recuperacao_inv} value={comps.recuperacao_inv} color={PESO_COLORS.recuperacao_inv} />
        <ComponentBar label={PESO_LABELS.judicializacao}  value={comps.judicializacao}  color={PESO_COLORS.judicializacao} />
        <ComponentBar label={PESO_LABELS.atraso}          value={comps.atraso}          color={PESO_COLORS.atraso} />
      </div>

      <div className="flex gap-3 pt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
        <span>Inadimp. {item.taxa_inadimplencia}%</span>
        <span className="text-slate-200 dark:text-slate-700">·</span>
        <span>Recup. {item.taxa_recuperacao}%</span>
        <span className="text-slate-200 dark:text-slate-700">·</span>
        <span>Judic. {item.taxa_judicializacao}%</span>
        <span className="text-slate-200 dark:text-slate-700">·</span>
        <span>Atraso {item.atraso_medio} dias</span>
      </div>
    </div>
  );
}

export default function RiscoRegionalCard({ data, pesos }: Props) {
  return (
    <ChartCard
      title="Score de Risco Composto por Região"
      subtitle={`Pesos: Inadimplência ${pesos.inadimplencia * 100}% · Recuperação ${pesos.recuperacao * 100}% · Judicialização ${pesos.judicializacao * 100}% · Atraso ${pesos.atraso * 100}%`}
    >
      <div className="flex flex-col gap-2.5 pt-1">
        {data.map(item => <RegionRow key={item.regiao} item={item} />)}
      </div>
    </ChartCard>
  );
}
