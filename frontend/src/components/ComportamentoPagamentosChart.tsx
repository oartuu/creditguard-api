import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { ComportamentoPagamentos } from "../types/api";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

const TIPO_CORES: Record<string, string> = {
  pago_integral: "#22c55e",
  pago_com_juros_multa: "#f97316",
  nao_pago: "#ef4444",
  pago_parcial: "#64748b",
};

const TIPO_LABELS: Record<string, string> = {
  pago_integral: "Pago integral",
  pago_com_juros_multa: "Com juros/multa",
  nao_pago: "Não pago",
  pago_parcial: "Parcial",
};

interface PiePoint { name: string; value: number; pct: number; fill: string; }
interface ContempladoPoint { situacao: string; taxa: number; fill: string; }
interface FormaPoint { forma: string; taxa: number; }

export default function ComportamentoPagamentosChart({ data }: { data: ComportamentoPagamentos | null }) {
  const ct = useChartTheme();
  if (!data) return null;

  const pieData: PiePoint[] = Object.entries(data.tipos_pagamento ?? {})
    .filter(([, v]) => v.count > 0)
    .map(([k, v]) => ({
      name: TIPO_LABELS[k] ?? k,
      value: v.count,
      pct: v.pct,
      fill: TIPO_CORES[k] ?? "#64748b",
    }));

  const contempladoData: ContempladoPoint[] = data.por_indicador_contemplado?.map(d => ({
    situacao: d.contemplado === "Sim" ? "Contemplado" : "Não Contemplado",
    taxa: d.taxa_inadimplencia_pct,
    fill: d.contemplado === "Sim" ? "#22c55e" : "#ef4444",
  }));

  const formaData: FormaPoint[] = data.por_forma_pagamento?.map(d => ({
    forma: d.forma_pagamento,
    taxa: d.taxa_inadimplencia_pct,
  }));

  return (
    <div className="grid grid-cols-2 gap-4">
      <ChartCard title="Tipos de Pagamento" subtitle="Como os clientes pagam suas parcelas">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" paddingAngle={2}>
              {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
              formatter={(v, _n, p) => [`${(v as number).toLocaleString("pt-BR")} (${p.payload.pct}%)`, p.payload.name]}
            />
            <Legend wrapperStyle={{ color: ct.legend, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Contemplados vs Não Contemplados" subtitle="Impacto do indicador de contemplação na inadimplência">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={contempladoData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
            <XAxis dataKey="situacao" tick={{ fill: ct.tick, fontSize: 12 }} />
            <YAxis domain={[15, 32]} tickFormatter={(v: number) => `${v}%`} tick={{ fill: ct.tick, fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
              formatter={(v) => [`${v}%`, "Inadimplência"]}
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
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
            <XAxis dataKey="forma" tick={{ fill: ct.tick, fontSize: 11 }} />
            <YAxis domain={[24.5, 26.5]} tickFormatter={(v: number) => `${v}%`} tick={{ fill: ct.tick, fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
              formatter={(v) => [`${v}%`, "Inadimplência"]}
            />
            <Bar dataKey="taxa" name="Inadimplência" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
