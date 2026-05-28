const fmt = (v, prefix = "", suffix = "") =>
  v == null ? "—" : `${prefix}${Number(v).toLocaleString("pt-BR")}${suffix}`;

const fmtBRL = (v) => {
  if (v == null) return "—";
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v.toFixed(2)}`;
};

function Card({ label, value, sub, color }) {
  return (
    <div style={{
      background: "#1e293b", borderRadius: 12, padding: "20px 24px",
      borderLeft: `4px solid ${color}`, display: "flex", flexDirection: "column", gap: 6,
    }}>
      <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </span>
      <span style={{ color: "#f1f5f9", fontSize: 28, fontWeight: 700 }}>{value}</span>
      {sub && <span style={{ color: "#64748b", fontSize: 12 }}>{sub}</span>}
    </div>
  );
}

export default function KpiCards({ data }) {
  if (!data) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
      <Card label="Taxa de Inadimplência"  value={`${data.taxa_inadimplencia_pct}%`}  sub={`${fmt(data.pagamentos_atrasados)} parcelas atrasadas`}  color="#ef4444" />
      <Card label="Atraso Médio"           value={`${data.atraso_medio_dias} dias`}    sub="quando o cliente atrasa"                                  color="#f97316" />
      <Card label="Taxa de Recuperação"    value={`${data.taxa_recuperacao_pct}%`}     sub={`${fmt(data.acordos_firmados)} acordos firmados`}          color="#22c55e" />
      <Card label="Total de Pagamentos"    value={fmt(data.total_pagamentos)}          sub="parcelas no dataset"                                      color="#3b82f6" />
      <Card label="Valor Inadimplente"     value={fmtBRL(data.valor_inadimplente_total)} sub="total enviado à cobrança"                              color="#a855f7" />
      <Card label="Valor Recuperado"       value={fmtBRL(data.valor_recuperado_estimado)} sub="via acordos firmados"                                color="#06b6d4" />
    </div>
  );
}
