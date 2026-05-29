import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

interface SegmentoItem {
  label: string;
  taxa_pct: number;
  total: number;
  atrasados: number;
}

interface Props {
  title: string;
  subtitle?: string;
  data: SegmentoItem[];
  referencia?: number;
  higherIsBetter?: boolean;
  suffix?: string;
  metricLabel?: string;
}

function getColor(taxa: number, referencia: number, higherIsBetter: boolean): string {
  if (higherIsBetter) {
    if (taxa > referencia + 2) return "#22c55e";
    if (taxa < referencia - 2) return "#e32551";
  } else {
    if (taxa > referencia + 2) return "#e32551";
    if (taxa < referencia - 2) return "#22c55e";
  }
  return "#f07c19";
}

export default function TaxaSegmentacaoChart({
  title,
  subtitle,
  data,
  referencia = 0,
  higherIsBetter = false,
  suffix = "%",
  metricLabel = "Valor",
}: Props) {
  const ct = useChartTheme();
  const ref = referencia || (data.reduce((s, d) => s + d.taxa_pct, 0) / (data.length || 1));

  const maxVal = data.length ? Math.max(...data.map(d => d.taxa_pct)) : 10;
  const domainMax = suffix === "%" ? Math.ceil(maxVal / 5) * 5 + 5 : Math.ceil(maxVal / 10) * 10 + 10;

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={data.length * 44 + 30}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 40, bottom: 0, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, domainMax]}
            tickFormatter={(v: number) => `${v}${suffix}`}
            tick={{ fill: ct.tick, fontSize: 10 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
            tick={{ fill: ct.tick, fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: ct.tooltip.background,
              border: `1px solid ${ct.tooltip.border}`,
              borderRadius: 8,
            }}
            labelStyle={{ color: ct.tooltip.label, fontSize: 12 }}
            formatter={(v: number, _: string, props: { payload?: SegmentoItem }) => {
              const p = props.payload;
              return [
                `${v}${suffix}  (${p?.atrasados?.toLocaleString("pt-BR")} / ${p?.total?.toLocaleString("pt-BR")})`,
                metricLabel,
              ];
            }}
          />
          <Bar dataKey="taxa_pct" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.taxa_pct, ref, higherIsBetter)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
