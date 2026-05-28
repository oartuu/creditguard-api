import type { TaxaRecuperacaoGeral, TaxaRecStatus } from "../types/api";

const fmtNum = (v: number) => Number(v).toLocaleString("pt-BR");
const fmtBRL = (v: number) => {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v.toFixed(2)}`;
};

function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
    </svg>
  );
}
function ArrowDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

interface StatProps {
  label: string;
  value: string;
  sub?: string;
  accent: "green" | "blue" | "orange" | "purple";
}

const ACCENT: Record<StatProps["accent"], string> = {
  green:  "border-green-200  dark:border-green-900/40 bg-green-50  dark:bg-green-900/10  text-green-600  dark:text-green-400",
  blue:   "border-blue-200   dark:border-blue-900/40  bg-blue-50   dark:bg-blue-900/10   text-blue-600   dark:text-blue-400",
  orange: "border-orange-200 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400",
  purple: "border-purple-200 dark:border-purple-900/40 bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400",
};

function StatCard({ label, value, sub, accent }: StatProps) {
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 transition-colors ${ACCENT[accent]}`}>
      <span className="text-[11px] font-semibold uppercase tracking-widest opacity-70">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
      {sub && <span className="text-[11px] opacity-60">{sub}</span>}
    </div>
  );
}

function StatusBar({ statuses }: { statuses: TaxaRecStatus[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {statuses.map(s => (
        <div key={s.status} className="flex items-center gap-3">
          <div className="w-28 text-[11px] text-slate-500 dark:text-slate-400 text-right flex-shrink-0">{s.status}</div>
          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${s.pct}%`, backgroundColor: s.cor }}
            />
          </div>
          <div className="w-24 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
            {s.pct}% · {fmtNum(s.total)}
          </div>
        </div>
      ))}
    </div>
  );
}

interface Props {
  data: TaxaRecuperacaoGeral;
  statuses: TaxaRecStatus[];
}

export default function TaxaRecuperacaoHero({ data, statuses }: Props) {
  const variacao = data.variacao_periodo_ppt;
  const melhorou = variacao > 0;
  const variacaoStr = variacao === 0
    ? "estável no período"
    : `${melhorou ? "+" : ""}${variacao} p.p. no período`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">

      {/* Main metric */}
      <div className="px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex-1">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Taxa de Recuperação — Geral
          </p>
          <div className="flex items-end gap-4">
            <span className="text-6xl font-black text-green-500 leading-none tracking-tight">
              {data.taxa_pct}%
            </span>
            <div className={`flex items-center gap-1 mb-1.5 text-sm font-semibold ${melhorou ? "text-green-500" : variacao < 0 ? "text-red-500" : "text-slate-400"}`}>
              {variacao !== 0 && (melhorou ? <ArrowUpIcon /> : <ArrowDownIcon />)}
              <span>{variacaoStr}</span>
            </div>
          </div>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{fmtNum(data.contratos_recuperados)}</span> contratos recuperados de{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{fmtNum(data.total_contratos)}</span> em cobrança
          </p>
        </div>

        {/* Value gauge */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1 bg-green-50 dark:bg-green-900/10 rounded-xl px-6 py-4 border border-green-200 dark:border-green-900/30">
          <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">Valor Recuperado</span>
          <span className="text-3xl font-black text-green-600 dark:text-green-400">{fmtBRL(data.valor_recuperado)}</span>
          <span className="text-xs text-green-600/70 dark:text-green-400/70">{data.taxa_recuperacao_valor_pct}% do valor inadimplente</span>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Total: {fmtBRL(data.valor_total_inadimplente)}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-100 dark:border-slate-700/60">
        <StatCard accent="green"  label="Contratos recuperados" value={fmtNum(data.contratos_recuperados)} sub="Acordo Firmado" />
        <StatCard accent="blue"   label="Total em cobrança"     value={fmtNum(data.total_contratos)}       sub="contratos únicos" />
        <StatCard accent="orange" label="Valor inadimplente"    value={fmtBRL(data.valor_total_inadimplente)} sub="total enviado" />
        <StatCard accent="purple" label="Taxa sobre valor"      value={`${data.taxa_recuperacao_valor_pct}%`}  sub="valor recuperado" />
      </div>

      {/* Status distribution */}
      <div className="px-8 py-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
          Distribuição por Status de Cobrança
        </p>
        <StatusBar statuses={statuses} />
      </div>
    </div>
  );
}
