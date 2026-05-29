import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import type { PadroesInsights } from "../types/api";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

type TemporalData = PadroesInsights["padroes_temporais"];

function barColor(taxa: number, media: number): string {
  if (taxa > media + 0.5) return "#e32551";
  if (taxa < media - 0.5) return "#22c55e";
  return "#94a3b8";
}

interface Props {
  data: TemporalData;
}

export default function PadroesTemporaisCard({ data }: Props) {
  const ct = useChartTheme();

  const mediaMensal = data.sazonalidade_mensal.reduce((s, m) => s + m.taxa_pct, 0) / (data.sazonalidade_mensal.length || 1);
  const mediaDow = data.por_dia_semana.reduce((s, d) => s + d.taxa_pct, 0) / (data.por_dia_semana.length || 1);

  const domMax = Math.ceil(Math.max(...data.sazonalidade_mensal.map(m => m.taxa_pct)) / 2) * 2 + 2;
  const domMaxDow = Math.ceil(Math.max(...data.por_dia_semana.map(d => d.taxa_pct)) / 2) * 2 + 2;

  return (
    <div className="flex flex-col gap-4">
      {/* Amplitude / KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-xl px-4 py-3.5 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Pico de Inadimplência</span>
          <span className="text-lg font-bold font-mono text-red-600 dark:text-red-400">{data.pico.taxa_pct}%</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">{data.pico.mes}</span>
        </div>
        <div className="bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-xl px-4 py-3.5 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Vale de Inadimplência</span>
          <span className="text-lg font-bold font-mono text-green-600 dark:text-green-400">{data.vale.taxa_pct}%</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">{data.vale.mes}</span>
        </div>
        <div className="bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-xl px-4 py-3.5 flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Amplitude (p.p.)</span>
          <span className="text-lg font-bold font-mono text-slate-700 dark:text-slate-200">{data.amplitude_ppt}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">variação máx.-mín.</span>
        </div>
      </div>

      {/* Sazonalidade mensal */}
      <ChartCard
        title="Sazonalidade Mensal"
        subtitle={`Taxa de inadimplência por mês do ano — média ${mediaMensal.toFixed(2)}%. Vermelho acima da média, verde abaixo.`}
      >
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data.sazonalidade_mensal} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
            <XAxis dataKey="mes_nome" tick={{ fill: ct.tick, fontSize: 11 }} />
            <YAxis domain={[0, domMax]} tick={{ fill: ct.tick, fontSize: 10 }}
              tickFormatter={(v: number) => `${v}%`} />
            <ReferenceLine y={mediaMensal} stroke="#94a3b8" strokeDasharray="4 3"
              label={{ value: `μ ${mediaMensal.toFixed(1)}%`, fill: ct.tick, fontSize: 9, position: "right" }} />
            <Tooltip
              contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
              formatter={(v: unknown) => [`${v}%`, "Taxa inadimplência"]}
            />
            <Bar dataKey="taxa_pct" radius={[3, 3, 0, 0]}>
              {data.sazonalidade_mensal.map((m, i) => (
                <Cell key={i} fill={barColor(m.taxa_pct, mediaMensal)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Dia da semana */}
      <ChartCard
        title="Padrão por Dia da Semana (vencimento)"
        subtitle={`Taxa de inadimplência conforme dia da semana do vencimento — média ${mediaDow.toFixed(2)}%`}
      >
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data.por_dia_semana} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
            <XAxis dataKey="dia" tick={{ fill: ct.tick, fontSize: 11 }} />
            <YAxis domain={[0, domMaxDow]} tick={{ fill: ct.tick, fontSize: 10 }}
              tickFormatter={(v: number) => `${v}%`} />
            <ReferenceLine y={mediaDow} stroke="#94a3b8" strokeDasharray="4 3" />
            <Tooltip
              contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
              formatter={(v: unknown) => [`${v}%`, "Taxa inadimplência"]}
            />
            <Bar dataKey="taxa_pct" radius={[3, 3, 0, 0]}>
              {data.por_dia_semana.map((d, i) => (
                <Cell key={i} fill={barColor(d.taxa_pct, mediaDow)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
