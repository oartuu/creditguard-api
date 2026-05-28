import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import ChartCard from "./ChartCard";

const TIPO_CORES = {
  pago_integral: "#22c55e",
  pago_com_juros_multa: "#f97316",
  nao_pago: "#ef4444",
  pago_parcial: "#64748b",
};

const TIPO_LABELS = {
  pago_integral: "Pago integral",
  pago_com_juros_multa: "Com juros/multa",
  nao_pago: "Não pago",
  pago_parcial: "Parcial",
};

export default function ComportamentoPagamentosChart({ data }) {
  if (!data) return null;

  const pieData = Object.entries(data.tipos_pagamento ?? {})
    .filter(([, v]) => v.count > 0)
    .map(([k, v]) => ({
      name: TIPO_LABELS[k] ?? k,
      value: v.count,
      pct: v.pct,
      fill: TIPO_CORES[k] ?? "#64748b",
    }));

  const contempladoData = data.por_indicador_contemplado?.map(d => ({
    situacao: d.contemplado === "Sim" ? "Contemplado" : "Não Contemplado",
    taxa: d.taxa_inadimplencia_pct,
    fill: d.contemplado === "Sim" ? "#22c55e" : "#ef4444",
  }));

  const formaData = data.por_forma_pagamento?.map(d => ({
    forma: d.forma_pagamento,
    taxa: d.taxa_inadimplencia_pct,
  }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <ChartCard title="Tipos de Pagamento" subtitle="Como os clientes pagam suas parcelas">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" paddingAngle={2}>
              {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
              formatter={(v, n, p) => [`${v.toLocaleString("pt-BR")} (${p.payload.pct}%)`, p.payload.name]}
            />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Contemplados vs Não Contemplados" subtitle="Impacto do indicador de contemplação na inadimplência">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={contempladoData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="situacao" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis domain={[15, 32]} tickFormatter={v => `${v}%`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
              formatter={v => [`${v}%`, "Inadimplência"]}
            />
            <Bar dataKey="taxa" name="Inadimplência" radius={[6, 6, 0, 0]}>
              {contempladoData?.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Inadimplência por Forma de Pagamento" subtitle="Boleto, Pix e Débito Automático">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={formaData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="forma" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis domain={[24.5, 26.5]} tickFormatter={v => `${v}%`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
              formatter={v => [`${v}%`, "Inadimplência"]}
            />
            <Bar dataKey="taxa" name="Inadimplência" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
