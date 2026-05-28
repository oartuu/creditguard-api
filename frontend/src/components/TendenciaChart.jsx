import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";

const fmt = (v) => `${v}%`;

export default function TendenciaChart({ data }) {
  if (!data) return null;

  const merged = {};
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
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="mes" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tickFormatter={fmt} tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
            labelStyle={{ color: "#f1f5f9" }}
            formatter={(v) => [`${v}%`]}
          />
          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
          <Line type="monotone" dataKey="inadimplencia" name="Inadimplência" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="recuperacao"   name="Recuperação"   stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
