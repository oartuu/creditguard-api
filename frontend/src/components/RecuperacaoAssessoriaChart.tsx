import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { StatusCobrancas } from "../types/api";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

interface ChartPoint {
  assessoria: string;
  "Acordo Firmado": number;
  "Em Aberto": number;
  "Insucesso": number;
  "Ajuizado": number;
}

export default function RecuperacaoAssessoriaChart({ data }: { data: StatusCobrancas | null }) {
  const ct = useChartTheme();
  if (!data) return null;

  const chartData = data.por_assessoria?.map((d): ChartPoint => ({
    assessoria: d.assessoria.replace("De Crédito", "").replace("Crédito", "Cred.").trim(),
    "Acordo Firmado": d.pct_acordo_firmado,
    "Em Aberto": d.pct_em_aberto,
    "Insucesso": d.pct_insucesso,
    "Ajuizado": d.pct_ajuizado,
  }));

  return (
    <ChartCard title="Desempenho por Assessoria" subtitle="Distribuição percentual de status por assessoria de cobrança">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 90 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
          <XAxis type="number" tickFormatter={(v: number) => `${v}%`} tick={{ fill: ct.tick, fontSize: 11 }} />
          <YAxis type="category" dataKey="assessoria" tick={{ fill: ct.tick, fontSize: 11 }} width={90} />
          <Tooltip
            contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
            formatter={(v) => [`${v}%`]}
          />
          <Legend wrapperStyle={{ color: ct.legend, fontSize: 12 }} />
          <Bar dataKey="Acordo Firmado" stackId="a" fill="#22c55e" />
          <Bar dataKey="Em Aberto"      stackId="a" fill="#f07c19" />
          <Bar dataKey="Insucesso"      stackId="a" fill="#e32551" />
          <Bar dataKey="Ajuizado"       stackId="a" fill="#a855f7" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
