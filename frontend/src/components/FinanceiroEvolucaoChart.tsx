import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { VFEvolucaoMes } from "../types/api";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

const fmtBRL = (v: number) => `R$ ${(v / 1_000_000).toFixed(1)}M`;

interface Props {
  data: VFEvolucaoMes[];
}

export default function FinanceiroEvolucaoChart({ data }: Props) {
  const ct = useChartTheme();

  const totalInad = data.reduce((s, d) => s + d.valor_inadimplente, 0);
  const totalRec  = data.reduce((s, d) => s + d.valor_recuperado, 0);
  const mediaInad = totalInad / (data.length || 1);
  const mediaRec  = totalRec  / (data.length || 1);

  return (
    <ChartCard
      title="Evolução Financeira Mensal"
      subtitle={`Média/mês — Inadimplente: ${fmtBRL(mediaInad)} · Recuperado: ${fmtBRL(mediaRec)}`}
    >
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="gradInad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradRec" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
          <XAxis
            dataKey="mes"
            tick={{ fill: ct.tick, fontSize: 10 }}
            tickFormatter={(v: string) => v.slice(2)}
          />
          <YAxis
            tickFormatter={fmtBRL}
            tick={{ fill: ct.tick, fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
            labelStyle={{ color: ct.tooltip.label, fontSize: 12 }}
            formatter={(v) => [fmtBRL(v as number)]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(val) => val === "valor_inadimplente" ? "Valor Inadimplente" : "Valor Recuperado"}
          />
          <Area
            type="monotone"
            dataKey="valor_inadimplente"
            stroke="#ef4444"
            strokeWidth={2.5}
            fill="url(#gradInad)"
            dot={{ r: 3, fill: "#ef4444" }}
            activeDot={{ r: 5 }}
          />
          <Area
            type="monotone"
            dataKey="valor_recuperado"
            stroke="#22c55e"
            strokeWidth={2.5}
            fill="url(#gradRec)"
            dot={{ r: 3, fill: "#22c55e" }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
