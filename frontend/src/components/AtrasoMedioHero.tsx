import type { AtrasoMedioGeral, AtrasoFaixa } from "../types/api";

const fmtNum = (v: number) => Number(v).toLocaleString("pt-BR");

const FAIXA_COLORS: Record<string, string> = {
  "1-15 dias":    "#22c55e",
  "16-30 dias":   "#84cc16",
  "31-60 dias":   "#f97316",
  "61-90 dias":   "#ef4444",
  "91-120 dias":  "#dc2626",
  "120+ dias":    "#7f1d1d",
};

interface PercentilBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function PercentilBar({ label, value, max, color }: PercentilBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-[10px] font-bold text-slate-400 dark:text-slate-500 text-right flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-16 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">{value} dias</span>
    </div>
  );
}

interface FaixaBarProps {
  faixa: AtrasoFaixa;
}

function FaixaBar({ faixa }: FaixaBarProps) {
  const color = FAIXA_COLORS[faixa.faixa] ?? "#94a3b8";
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-[11px] text-slate-500 dark:text-slate-400 text-right flex-shrink-0">{faixa.faixa}</div>
      <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${faixa.pct}%`, backgroundColor: color }} />
      </div>
      <div className="w-28 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
        {faixa.pct}% · {fmtNum(faixa.count)}
      </div>
    </div>
  );
}

interface Props {
  data: AtrasoMedioGeral;
  faixas: AtrasoFaixa[];
}

export default function AtrasoMedioHero({ data, faixas }: Props) {
  const p = data.percentis;
  const maxPercentil = p.p95 * 1.05;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">

      {/* Main metrics */}
      <div className="px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex-1">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Atraso Médio — Geral
          </p>
          <div className="flex items-end gap-4">
            <span className="text-6xl font-black text-orange-500 leading-none tracking-tight">
              {data.media_dias}
            </span>
            <span className="text-2xl font-bold text-orange-400 mb-2">dias</span>
          </div>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
            Mediana de{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{data.mediana_dias} dias</span>
            {" "}· desvio-padrão de{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{data.desvio_padrao} dias</span>
          </p>
          <p className="mt-0.5 text-slate-400 dark:text-slate-500 text-sm">
            Calculado sobre{" "}
            <span className="font-semibold text-slate-600 dark:text-slate-300">{fmtNum(data.total_atrasados)}</span> parcelas em atraso · máximo: {data.max_dias} dias
          </p>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-2 gap-3 flex-shrink-0">
          {[
            { label: "Média",   value: `${data.media_dias} dias`,   color: "text-orange-500" },
            { label: "Mediana", value: `${data.mediana_dias} dias`,  color: "text-amber-500"  },
            { label: "Desvio", value: `± ${data.desvio_padrao} dias`, color: "text-slate-500" },
            { label: "Máximo",  value: `${data.max_dias} dias`,     color: "text-red-500"    },
          ].map(c => (
            <div key={c.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 text-center border border-slate-100 dark:border-slate-700">
              <div className={`text-xl font-black ${c.color}`}>{c.value}</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Percentiles + Faixas */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-700/60">

        {/* Percentiles */}
        <div className="px-8 py-6 flex flex-col gap-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
            Distribuição por Percentil
          </p>
          <PercentilBar label="p25" value={p.p25} max={maxPercentil} color="#22c55e" />
          <PercentilBar label="p50" value={p.p50} max={maxPercentil} color="#84cc16" />
          <PercentilBar label="p75" value={p.p75} max={maxPercentil} color="#f97316" />
          <PercentilBar label="p90" value={p.p90} max={maxPercentil} color="#ef4444" />
          <PercentilBar label="p95" value={p.p95} max={maxPercentil} color="#dc2626" />
        </div>

        {/* Faixas */}
        <div className="px-8 py-6 flex flex-col gap-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
            Distribuição por Faixa de Atraso
          </p>
          {faixas.map(f => <FaixaBar key={f.faixa} faixa={f} />)}
        </div>

      </div>
    </div>
  );
}
