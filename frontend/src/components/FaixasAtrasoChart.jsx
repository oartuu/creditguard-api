import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";

const COLORS = ["#22c55e", "#f97316", "#ef4444", "#a855f7", "#dc2626"];

export default function FaixasAtrasoChart({ data }) {
  if (!data) return null;

  const chartData = data.faixas_atraso?.map((f, i) => ({
    faixa: f.faixa,
    quantidade: f.count,
    pct: f.pct_atrasados,
    color: COLORS[i],
  }));

  return (
    <ChartCard title="Faixas de Atraso" subtitle="Distribuição dos pagamentos atrasados por dias">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="faixa" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
            labelStyle={{ color: "#f1f5f9" }}
            formatter={(v, n, p) => [`${v.toLocaleString("pt-BR")} (${p.payload.pct}%)`, "Qtd"]}
          />
          <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
            {chartData?.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
