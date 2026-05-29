import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Tendencia } from "../types/api";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

interface MergedPoint {
  mes: string;
  inadimplencia?: number;
  recuperacao?: number;
}

export default function TendenciaChart({ data }: { data: Tendencia | null }) {
  const ct = useChartTheme();
  if (!data) return null;

  const merged: Record<string, MergedPoint> = {};
  data.inadimplencia_por_mes?.forEach(d => {
    merged[d.mes] = { mes: d.mes, inadimplencia: d.taxa_inadimplencia_pct };
  });
  data.recuperacao_por_mes?.forEach(d => {
    if (merged[d.mes]) merged[d.mes].recuperacao = d.taxa_recuperacao_pct;
    else merged[d.mes] = { mes: d.mes, recuperacao: d.taxa_recuperacao_pct };
  });

  const chartData = Object.values(merged).sort((a, b) => a.mes.localeCompare(b.mes));

  return (
    <ChartCard title="Tendência Temporal" subtitle="Inadimplência e recuperação mês a mês">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
          <XAxis dataKey="mes" tick={{ fill: ct.tick, fontSize: 11 }} />
          <YAxis tickFormatter={(v: number) => `${v}%`} tick={{ fill: ct.tick, fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
            labelStyle={{ color: ct.tooltip.label }}
            formatter={(v) => [`${v}%`]}
          />
          <Legend wrapperStyle={{ color: ct.legend, fontSize: 12 }} />
          <Line type="monotone" dataKey="inadimplencia" name="Inadimplência" stroke="#e32551" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="recuperacao"   name="Recuperação"   stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
