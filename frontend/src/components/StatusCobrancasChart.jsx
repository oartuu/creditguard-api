import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";

const COLORS = { "Acordo Firmado": "#22c55e", "Em Aberto": "#f97316", "Insucesso": "#ef4444", "Ajuizado": "#a855f7" };

const fmtBRL = (v) => {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  return `R$ ${(v / 1_000).toFixed(0)}K`;
};

export default function StatusCobrancasChart({ data }) {
  if (!data) return null;

  const chartData = data.visao_geral?.map(d => ({
    name: d.status,
    value: d.total_contratos,
    pct: d.pct_contratos,
    valor: d.valor_total,
    fill: COLORS[d.status] ?? "#64748b",
  }));

  return (
    <ChartCard title="Status das Cobranças" subtitle="Distribuição dos contratos por desfecho">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
            dataKey="value" nameKey="name" paddingAngle={3}>
            {chartData?.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
            formatter={(v, n, p) => [`${v.toLocaleString("pt-BR")} contratos (${p.payload.pct}%) — ${fmtBRL(p.payload.valor)}`, p.payload.name]}
          />
          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
