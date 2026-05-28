import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import ChartCard from "./ChartCard";

const fmtBRL = (v) => `R$ ${(v / 1_000_000).toFixed(1)}M`;
const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#06b6d4"];

export default function RegionalChart({ data }) {
  if (!data) return null;

  const inadimplencia = data.rankings?.inadimplencia?.map((d, i) => ({
    regiao: d.regiao,
    taxa: d.taxa_inadimplencia_pct,
    color: COLORS[i],
  }));

  const valorData = data.rankings?.valor_inadimplente?.map((d, i) => ({
    regiao: d.regiao,
    valor: d.valor_total_inadimplente,
    pct: d.pct_valor_carteira,
    color: COLORS[i],
  }));

  const recuperacao = data.rankings?.recuperacao?.map((d, i) => ({
    regiao: d.regiao,
    taxa: d.taxa_recuperacao_pct,
    judicializacao: d.taxa_judicializacao_pct,
    color: COLORS[i],
  }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <ChartCard title="Inadimplência por Região" subtitle="Taxa percentual de parcelas atrasadas">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={inadimplencia} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="regiao" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis domain={[24.5, 26.5]} tickFormatter={v => `${v}%`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
              formatter={v => [`${v}%`, "Inadimplência"]}
            />
            <Bar dataKey="taxa" radius={[4, 4, 0, 0]}>
              {inadimplencia?.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Valor Inadimplente por Região" subtitle="Total da dívida enviado à cobrança">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={valorData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="regiao" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tickFormatter={fmtBRL} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
              formatter={(v, n, p) => [fmtBRL(v), `${p.payload.pct}% da carteira`]}
            />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
              {valorData?.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Recuperação por Região" subtitle="Taxa de acordos firmados vs judicialização" >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={recuperacao} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="regiao" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
              formatter={v => [`${v}%`]}
            />
            <Bar dataKey="taxa" name="Recuperação" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="judicializacao" name="Ajuizamento" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
