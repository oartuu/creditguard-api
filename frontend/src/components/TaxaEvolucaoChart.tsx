import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import type { TaxaMensal } from "../types/api";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

export default function TaxaEvolucaoChart({ data }: { data: TaxaMensal[] }) {
  const ct = useChartTheme();

  const media = data.length
    ? Math.round((data.reduce((s, d) => s + d.taxa_pct, 0) / data.length) * 100) / 100
    : 0;

  const maxTaxa = Math.max(...data.map(d => d.taxa_pct));
  const yMax = Math.ceil(maxTaxa / 5) * 5 + 5;

  return (
    <ChartCard
      title="Evolução Mensal da Taxa de Inadimplência"
      subtitle={`Média do período: ${media}%`}
    >
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
          <XAxis
            dataKey="mes"
            tick={{ fill: ct.tick, fontSize: 10 }}
            tickFormatter={(v: string) => v.slice(2)}
          />
          <YAxis
            domain={[0, yMax]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fill: ct.tick, fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: ct.tooltip.background,
              border: `1px solid ${ct.tooltip.border}`,
              borderRadius: 8,
            }}
            labelStyle={{ color: ct.tooltip.label, fontSize: 12 }}
            formatter={(v: number) => [`${v}%`, "Taxa de Inadimplência"]}
          />
          <ReferenceLine
            y={media}
            stroke="#94a3b8"
            strokeDasharray="4 3"
            label={{ value: `Média ${media}%`, fill: "#94a3b8", fontSize: 10, position: "insideTopRight" }}
          />
          <Line
            type="monotone"
            dataKey="taxa_pct"
            name="Taxa"
            stroke="#ef4444"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#ef4444" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
