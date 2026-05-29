import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

interface InadMes { mes: string; taxa_pct: number }
interface RecMes  { mes: string; taxa_pct: number }

interface Props {
  inadimplencia: InadMes[];
  recuperacao: RecMes[];
}

export default function DiretoriaTendenciaDualChart({ inadimplencia, recuperacao }: Props) {
  const ct = useChartTheme();

  const recByMes = new Map(recuperacao.map(r => [r.mes, r.taxa_pct]));
  const data = inadimplencia.map(row => ({
    mes: row.mes,
    inadimplencia: row.taxa_pct,
    recuperacao: recByMes.get(row.mes) ?? null,
  }));

  const allVals = [
    ...inadimplencia.map(d => d.taxa_pct),
    ...recuperacao.map(d => d.taxa_pct),
  ];
  const yMax = allVals.length ? Math.ceil(Math.max(...allVals) / 5) * 5 + 5 : 100;

  return (
    <ChartCard
      title="Evolução Temporal Consolidada"
      subtitle="Inadimplência vs Recuperação — série mensal"
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
          <XAxis
            dataKey="mes"
            tick={{ fill: ct.tick, fontSize: 10 }}
            tickFormatter={(v: string) => v.slice(2)}
          />
          <YAxis
            domain={[0, yMax]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fill: ct.tick, fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: ct.tooltip.background,
              border: `1px solid ${ct.tooltip.border}`,
              borderRadius: 8,
            }}
            labelStyle={{ color: ct.tooltip.label, fontSize: 12 }}
            formatter={((v: number, name: string) => [`${v}%`, name === "inadimplencia" ? "Inadimplência" : "Recuperação"]) as never}
          />
          <Legend
            formatter={(v) => v === "inadimplencia" ? "Inadimplência" : "Recuperação"}
            wrapperStyle={{ fontSize: 11, color: ct.legend }}
          />
          <Line
            type="monotone"
            dataKey="inadimplencia"
            name="inadimplencia"
            stroke="#e32551"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#e32551" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="recuperacao"
            name="recuperacao"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#22c55e" }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
