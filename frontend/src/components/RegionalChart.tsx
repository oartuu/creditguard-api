import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { DistribuicaoRegional } from "../types/api";
import ChartCard from "./ChartCard";

const fmtBRL = (v: number) => `R$ ${(v / 1_000_000).toFixed(1)}M`;
const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#06b6d4"];

interface InadimplenciaPoint { regiao: string; taxa: number; color: string; }
interface ValorPoint { regiao: string; valor: number; pct: number; color: string; }
interface RecuperacaoPoint { regiao: string; taxa: number; judicializacao: number; color: string; }

export default function RegionalChart({ data }: { data: DistribuicaoRegional | null }) {
  if (!data) return null;

  const inadimplencia = data.rankings?.inadimplencia?.map((d, i): InadimplenciaPoint => ({
    regiao: d.regiao,
    taxa: d.taxa_inadimplencia_pct ?? 0,
    color: COLORS[i],
  }));

  const valorData = data.rankings?.valor_inadimplente?.map((d, i): ValorPoint => ({
    regiao: d.regiao,
    valor: d.valor_total_inadimplente ?? 0,
    pct: d.pct_valor_carteira ?? 0,
    color: COLORS[i],
  }));

  const recuperacao = data.rankings?.recuperacao?.map((d, i): RecuperacaoPoint => ({
    regiao: d.regiao,
    taxa: d.taxa_recuperacao_pct ?? 0,
    judicializacao: d.taxa_judicializacao_pct ?? 0,
    color: COLORS[i],
  }));

  return (
    <div className="grid grid-cols-2 gap-4">
      <ChartCard title="Inadimplência por Região" subtitle="Taxa percentual de parcelas atrasadas">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={inadimplencia} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="regiao" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis domain={[24.5, 26.5]} tickFormatter={(v: number) => `${v}%`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
              formatter={(v) => [`${v}%`, "Inadimplência"]}
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
              formatter={(v, _n, p) => [fmtBRL(v as number), `${p.payload.pct}% da carteira`]}
            />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
              {valorData?.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Recuperação por Região" subtitle="Taxa de acordos firmados vs judicialização">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={recuperacao} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="regiao" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tickFormatter={(v: number) => `${v}%`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
              formatter={(v) => [`${v}%`]}
            />
            <Bar dataKey="taxa" name="Recuperação" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="judicializacao" name="Ajuizamento" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
