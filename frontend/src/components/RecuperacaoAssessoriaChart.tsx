import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { StatusCobrancas } from "../types/api";
import ChartCard from "./ChartCard";

interface ChartPoint {
  assessoria: string;
  "Acordo Firmado": number;
  "Em Aberto": number;
  "Insucesso": number;
  "Ajuizado": number;
}

export default function RecuperacaoAssessoriaChart({ data }: { data: StatusCobrancas | null }) {
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
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" tickFormatter={(v: number) => `${v}%`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis type="category" dataKey="assessoria" tick={{ fill: "#94a3b8", fontSize: 11 }} width={90} />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
            formatter={(v) => [`${v}%`]}
          />
          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
          <Bar dataKey="Acordo Firmado" stackId="a" fill="#22c55e" />
          <Bar dataKey="Em Aberto"      stackId="a" fill="#f97316" />
          <Bar dataKey="Insucesso"      stackId="a" fill="#ef4444" />
          <Bar dataKey="Ajuizado"       stackId="a" fill="#a855f7" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
