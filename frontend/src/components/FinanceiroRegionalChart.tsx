import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import type { VFRegiao } from "../types/api";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

const fmtBRL = (v: number) => `R$ ${(v / 1_000_000).toFixed(1)}M`;
const COLORS = ["#029daf", "#22c55e", "#f07c19", "#a855f7", "#14afc0"];

interface Props {
  data: VFRegiao[];
}

export default function FinanceiroRegionalChart({ data }: Props) {
  const ct = useChartTheme();

  const valorData = data.map((r, i) => ({
    regiao: r.regiao,
    valor: r.valor_inadimplente,
    pct: r.pct_carteira,
    color: COLORS[i % COLORS.length],
  }));

  const recuperacaoData = data.map((r, i) => ({
    regiao: r.regiao,
    taxa: r.taxa_recuperacao_pct,
    acordos: r.acordos,
    total: r.total_contratos,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="grid grid-cols-2 gap-4">
      <ChartCard title="Valor Inadimplente por Região" subtitle="Total da carteira inadimplente por região">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={valorData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
            <XAxis dataKey="regiao" tick={{ fill: ct.tick, fontSize: 11 }} />
            <YAxis tickFormatter={fmtBRL} tick={{ fill: ct.tick, fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
              formatter={(v, _n, p) => [fmtBRL(v as number), `${p.payload.pct}% da carteira`]}
            />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
              {valorData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Taxa de Recuperação por Região" subtitle="Contratos com acordo firmado">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={recuperacaoData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
            <XAxis dataKey="regiao" tick={{ fill: ct.tick, fontSize: 11 }} />
            <YAxis tickFormatter={(v: number) => `${v}%`} tick={{ fill: ct.tick, fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
              formatter={(v, _n, p) => [`${v}%`, `${p.payload.acordos} / ${p.payload.total} contratos`]}
            />
            <Bar dataKey="taxa" radius={[4, 4, 0, 0]}>
              {recuperacaoData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
