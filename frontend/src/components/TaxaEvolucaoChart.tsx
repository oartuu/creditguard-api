import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

interface DataPoint {
  mes: string;
  [key: string]: string | number;
}

interface Props {
  data: DataPoint[];
  color?: string;
  title?: string;
  label?: string;
  dataKey?: string;
  suffix?: string;
}

export default function TaxaEvolucaoChart({
  data,
  color = "#e32551",
  title = "Evolução Mensal",
  label = "Taxa",
  dataKey = "taxa_pct",
  suffix = "%",
}: Props) {
  const ct = useChartTheme();

  const values = data.map(d => d[dataKey] as number);
  const media = values.length
    ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
    : 0;
  const maxVal = values.length ? Math.max(...values) : 10;
  const yMax = suffix === "%"
    ? Math.ceil(maxVal / 5) * 5 + 5
    : Math.ceil(maxVal / 10) * 10 + 10;

  return (
    <ChartCard title={title} subtitle={`Média do período: ${media}${suffix}`}>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
          <XAxis
            dataKey="mes"
            tick={{ fill: ct.tick, fontSize: 10 }}
            tickFormatter={(v: string) => v.slice(2)}
          />
          <YAxis
            domain={[0, yMax]}
            tickFormatter={(v: number) => `${v}${suffix}`}
            tick={{ fill: ct.tick, fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: ct.tooltip.background,
              border: `1px solid ${ct.tooltip.border}`,
              borderRadius: 8,
            }}
            labelStyle={{ color: ct.tooltip.label, fontSize: 12 }}
            formatter={(v: number) => [`${v}${suffix}`, label]}
          />
          <ReferenceLine
            y={media}
            stroke="#94a3b8"
            strokeDasharray="4 3"
            label={{ value: `Média ${media}${suffix}`, fill: "#94a3b8", fontSize: 10, position: "insideTopRight" }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            name={label}
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
