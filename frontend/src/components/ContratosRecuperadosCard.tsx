import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { OperacaoCobranca } from "../types/api";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

const fmtBRL = (v: number) =>
  v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toFixed(2).replace(".", ",")}M`
    : `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

interface Props {
  contratos_recuperados: OperacaoCobranca["contratos_recuperados"];
  evolucao_mensal: OperacaoCobranca["evolucao_mensal"];
}

export default function ContratosRecuperadosCard({ contratos_recuperados: data, evolucao_mensal }: Props) {
  const ct = useChartTheme();
  const chartData = evolucao_mensal.map(m => ({
    mes: m.mes.slice(5),
    taxa: m.taxa_recuperacao_pct,
    acordos: m.acordos,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Hero metrics */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-8 py-7 transition-colors">
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">
          Contratos Recuperados (Acordo Firmado)
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-green-500 leading-none">
                {data.total.toLocaleString("pt-BR")}
              </span>
              <span className="text-lg font-bold text-green-400 mb-1">
                ({data.pct_total}%)
              </span>
            </div>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
              contratos com acordo firmado ·{" "}
              <span className="font-semibold text-green-600 dark:text-green-400">
                {fmtBRL(data.valor_total)}
              </span>{" "}
              recuperados
            </p>
            <p className="mt-0.5 text-slate-400 dark:text-slate-500 text-sm">
              Taxa de recuperação financeira:{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {data.taxa_recuperacao_valor_pct}%
              </span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-shrink-0">
            {[
              { label: "Acordos firmados", value: data.total.toLocaleString("pt-BR"), color: "text-green-500" },
              { label: "Taxa contratos", value: `${data.pct_total}%`, color: "text-green-400" },
              { label: "Valor recuperado", value: fmtBRL(data.valor_total), color: "text-green-600 dark:text-green-400" },
              { label: "Taxa financeira", value: `${data.taxa_recuperacao_valor_pct}%`, color: "text-green-500" },
            ].map(c => (
              <div key={c.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 text-center border border-slate-100 dark:border-slate-700">
                <div className={`text-base font-black ${c.color}`}>{c.value}</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evolução mensal */}
      <ChartCard title="Evolução Mensal — Taxa de Recuperação" subtitle="% de contratos com acordo firmado por mês">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: ct.tick, fontSize: 11 }} />
            <YAxis tickFormatter={(v: number) => `${v}%`} tick={{ fill: ct.tick, fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
              formatter={(v: unknown, name: unknown) => [
                name === "taxa" ? `${v}%` : String(v),
                name === "taxa" ? "Taxa recuperação" : "Acordos",
              ] as [string, string]}
              labelFormatter={(l: unknown) => `Mês ${l}`}
            />
            <Area
              type="monotone" dataKey="taxa" stroke="#22c55e" strokeWidth={2}
              fill="url(#recGrad)" dot={{ fill: "#22c55e", r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Por região */}
      <ChartCard title="Recuperação por Região" subtitle="Taxa de acordo firmado por região geográfica">
        <div className="flex flex-col gap-3 pt-1">
          {data.por_regiao.map(r => (
            <div key={r.regiao} className="flex items-center gap-3">
              <div className="w-24 text-[12px] text-slate-600 dark:text-slate-300 text-right flex-shrink-0 font-medium truncate">
                {r.regiao}
              </div>
              <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${r.taxa_pct}%` }}
                />
              </div>
              <div className="w-36 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                {r.acordos} acordos · {r.taxa_pct}%
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
