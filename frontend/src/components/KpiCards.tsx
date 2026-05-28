import type { Kpis } from "../types/api";

const fmt = (v: number | null) =>
  v == null ? "—" : Number(v).toLocaleString("pt-BR");

const fmtBRL = (v: number | null) => {
  if (v == null) return "—";
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v.toFixed(2)}`;
};

const BORDER_COLORS: Record<string, string> = {
  red: "border-l-red-500",
  orange: "border-l-orange-500",
  green: "border-l-green-500",
  blue: "border-l-blue-500",
  purple: "border-l-purple-500",
  cyan: "border-l-cyan-500",
};

interface CardProps {
  label: string;
  value: string;
  sub?: string;
  accent: keyof typeof BORDER_COLORS;
}

function Card({ label, value, sub, accent }: CardProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 flex flex-col gap-1.5 border-l-4 transition-colors ${BORDER_COLORS[accent]}`}>
      <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-widest">{label}</span>
      <span className="text-slate-900 dark:text-slate-100 text-3xl font-bold">{value}</span>
      {sub && <span className="text-slate-400 dark:text-slate-500 text-xs">{sub}</span>}
    </div>
  );
}

export default function KpiCards({ data }: { data: Kpis }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
      <Card accent="red"    label="Taxa de Inadimplência" value={`${data.taxa_inadimplencia_pct}%`}       sub={`${fmt(data.pagamentos_atrasados)} parcelas atrasadas`} />
      <Card accent="orange" label="Atraso Médio"          value={`${data.atraso_medio_dias} dias`}         sub="quando o cliente atrasa" />
      <Card accent="green"  label="Taxa de Recuperação"   value={`${data.taxa_recuperacao_pct}%`}          sub={`${fmt(data.acordos_firmados)} acordos firmados`} />
      <Card accent="blue"   label="Total de Pagamentos"   value={fmt(data.total_pagamentos)}               sub="parcelas no dataset" />
      <Card accent="purple" label="Valor Inadimplente"    value={fmtBRL(data.valor_inadimplente_total)}    sub="total enviado à cobrança" />
      <Card accent="cyan"   label="Valor Recuperado"      value={fmtBRL(data.valor_recuperado_estimado)}   sub="via acordos firmados" />
    </div>
  );
}
