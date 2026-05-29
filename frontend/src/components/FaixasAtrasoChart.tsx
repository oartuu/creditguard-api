import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
import type { DistribuicaoAtrasos } from "../types/api";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

const COLORS = ["#22c55e", "#f07c19", "#e32551", "#a855f7", "#c11f46"];

interface ChartPoint {
  faixa: string;
  quantidade: number;
  pct: number;
  color: string;
}

export default function FaixasAtrasoChart({ data }: { data: DistribuicaoAtrasos | null }) {
  const ct = useChartTheme();
  if (!data) return null;

  const chartData = data.faixas_atraso?.map((f, i): ChartPoint => ({
    faixa: f.faixa,
    quantidade: f.count,
    pct: f.pct_atrasados,
    color: COLORS[i],
  }));

  return (
    <ChartCard title="Faixas de Atraso" subtitle="Distribuição dos pagamentos atrasados por dias">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
          <XAxis dataKey="faixa" tick={{ fill: ct.tick, fontSize: 11 }} />
          <YAxis tick={{ fill: ct.tick, fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
            labelStyle={{ color: ct.tooltip.label }}
            formatter={(v, _n, p) => [`${(v as number).toLocaleString("pt-BR")} (${p.payload.pct}%)`, "Qtd"]}
          />
          <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
            {chartData?.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
