import type { TaxaInadimplenciaGeral } from "../types/api";

const fmt = (v: number) => Number(v).toLocaleString("pt-BR");

function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

interface StatProps {
  label: string;
  value: string;
  sub?: string;
  accent: "red" | "green" | "blue" | "orange";
}

const ACCENT_CLASSES: Record<StatProps["accent"], string> = {
  red:    "border-red-200    dark:border-red-900/40   bg-red-50    dark:bg-red-900/10   text-red-600    dark:text-red-400",
  green:  "border-green-200  dark:border-green-900/40 bg-green-50  dark:bg-green-900/10 text-green-600  dark:text-green-400",
  blue:   "border-blue-200   dark:border-blue-900/40  bg-blue-50   dark:bg-blue-900/10  text-blue-600   dark:text-blue-400",
  orange: "border-orange-200 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400",
};

function StatCard({ label, value, sub, accent }: StatProps) {
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 transition-colors ${ACCENT_CLASSES[accent]}`}>
      <span className="text-[11px] font-semibold uppercase tracking-widest opacity-70">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
      {sub && <span className="text-[11px] opacity-60">{sub}</span>}
    </div>
  );
}

export default function TaxaInadimplenciaHero({ data }: { data: TaxaInadimplenciaGeral }) {
  const variacao = data.variacao_periodo_ppt;
  const subindo = variacao > 0;
  const variacaoStr = variacao === 0
    ? "estável no período"
    : `${subindo ? "+" : ""}${variacao} p.p. no período`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">

      {/* Main metric */}
      <div className="px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex-1">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Taxa de Inadimplência — Geral
          </p>
          <div className="flex items-end gap-4">
            <span className="text-6xl font-black text-red-500 leading-none tracking-tight">
              {data.taxa_pct}%
            </span>
            <div className={`flex items-center gap-1 mb-1.5 text-sm font-semibold ${subindo ? "text-red-500" : variacao < 0 ? "text-green-500" : "text-slate-400"}`}>
              {variacao !== 0 && (subindo ? <ArrowUpIcon /> : <ArrowDownIcon />)}
              <span>{variacaoStr}</span>
            </div>
          </div>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{fmt(data.parcelas_atrasadas)}</span> parcelas em atraso de um total de{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{fmt(data.total_parcelas)}</span>
          </p>
        </div>

        {/* Gauge visual */}
        <div className="flex-shrink-0">
          <GaugeArc pct={data.taxa_pct} />
        </div>
      </div>

      {/* Stat cards */}
      <div className="px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard accent="red"    label="Parcelas atrasadas" value={fmt(data.parcelas_atrasadas)} sub="em atraso" />
        <StatCard accent="green"  label="Parcelas em dia"    value={fmt(data.parcelas_em_dia)}    sub="adimplentes" />
        <StatCard accent="blue"   label="Total de parcelas"  value={fmt(data.total_parcelas)}     sub="no dataset" />
        <StatCard accent="orange" label="Atraso médio"       value={`${data.atraso_medio_dias} dias`} sub="quando ocorre atraso" />
      </div>
    </div>
  );
}

function GaugeArc({ pct }: { pct: number }) {
  const radius = 52;
  const stroke = 10;
  const cx = 70;
  const cy = 70;
  const circumference = Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const color = pct >= 30 ? "#e32551" : pct >= 20 ? "#f07c19" : "#ffc219";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="140" height="80" viewBox="0 0 140 80">
        {/* Track */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="dark:stroke-slate-700"
        />
        {/* Progress */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        {/* Labels */}
        <text x={cx - radius - 2} y={cy + 16} textAnchor="middle" fontSize="10" fill="#94a3b8">0%</text>
        <text x={cx + radius + 2} y={cy + 16} textAnchor="middle" fontSize="10" fill="#94a3b8">100%</text>
      </svg>
      <span className="text-[11px] text-slate-400 dark:text-slate-500 -mt-3">inadimplência</span>
    </div>
  );
}
