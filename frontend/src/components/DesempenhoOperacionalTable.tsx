import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";
import type { OCDesempenhoAssessoria } from "../types/api";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

const fmtBRL = (v: number) =>
  v >= 1_000_000 ? `R$ ${(v / 1_000_000).toFixed(1)}M` : `R$ ${(v / 1_000).toFixed(0)}K`;

const MEDAL = ["🥇", "🥈", "🥉"];

function scoreColor(score: number, max: number): string {
  const r = score / max;
  if (r >= 0.85) return "#22c55e";
  if (r >= 0.65) return "#f97316";
  return "#ef4444";
}

function StatusStrip({ d }: { d: OCDesempenhoAssessoria }) {
  const n = d.total_contratos;
  const parts = [
    { pct: (d.acordos    / n) * 100, color: "#22c55e" },
    { pct: (d.em_aberto  / n) * 100, color: "#f97316" },
    { pct: (d.insucesso  / n) * 100, color: "#ef4444" },
    { pct: (d.ajuizado   / n) * 100, color: "#8b5cf6" },
  ];
  return (
    <div className="flex h-2 rounded-full overflow-hidden gap-px">
      {parts.map((p, i) => (
        <div key={i} style={{ width: `${p.pct}%`, background: p.color }} />
      ))}
    </div>
  );
}

interface Props {
  desempenho: OCDesempenhoAssessoria[];
}

export default function DesempenhoOperacionalTable({ desempenho }: Props) {
  const ct = useChartTheme();
  const maxScore = Math.max(...desempenho.map(d => d.score_desempenho));

  const chartData = desempenho.map(d => ({
    name: d.assessoria.split(" ")[0],
    fullName: d.assessoria,
    score: d.score_desempenho,
    taxa: d.taxa_recuperacao_pct,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Score bar chart */}
      <ChartCard
        title="Score de Desempenho por Assessoria"
        subtitle="Score = taxa de recuperação × (1 − taxa de judicialização)"
      >
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: ct.tick, fontSize: 11 }} />
            <YAxis
              domain={[0, Math.ceil(maxScore / 5) * 5 + 5]}
              tick={{ fill: ct.tick, fontSize: 10 }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
              labelFormatter={(_: unknown, payload: readonly { payload?: { fullName?: string } }[]) =>
                payload[0]?.payload?.fullName ?? ""
              }
              formatter={(v: unknown) => [`${v}%`, "Score desempenho"]}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={scoreColor(d.score, maxScore)} />
              ))}
              <LabelList
                dataKey="score" position="top"
                style={{ fill: ct.tick, fontSize: 10, fontWeight: 700 }}
                formatter={(v: unknown) => `${v}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Detailed cards */}
      <ChartCard
        title="Detalhamento por Assessoria"
        subtitle="Verde = acordos · Laranja = em aberto · Vermelho = insucesso · Roxo = ajuizado"
      >
        <div className="flex flex-col gap-3 pt-1">
          {desempenho.map((d, i) => (
            <div key={d.assessoria} className="flex flex-col gap-1.5 px-3 py-3 border border-slate-100 dark:border-slate-700/60 rounded-xl bg-white dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="text-base w-7 flex-shrink-0">{MEDAL[i] ?? `#${d.ranking}`}</span>
                <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {d.assessoria}
                </span>
                <span
                  className="text-xs font-black flex-shrink-0 px-2 py-0.5 rounded-full"
                  style={{ color: scoreColor(d.score_desempenho, maxScore), background: `${scoreColor(d.score_desempenho, maxScore)}18` }}
                >
                  {d.score_desempenho}% score
                </span>
              </div>
              <StatusStrip d={d} />
              <div className="grid grid-cols-4 gap-2 text-[10px]">
                <div>
                  <span className="text-green-600 dark:text-green-400 font-semibold">{d.taxa_recuperacao_pct}%</span>
                  <span className="text-slate-400 dark:text-slate-500 ml-1">acordos</span>
                </div>
                <div>
                  <span className="text-orange-500 font-semibold">{d.taxa_em_aberto_pct}%</span>
                  <span className="text-slate-400 dark:text-slate-500 ml-1">em aberto</span>
                </div>
                <div>
                  <span className="text-red-500 font-semibold">{d.taxa_insucesso_pct}%</span>
                  <span className="text-slate-400 dark:text-slate-500 ml-1">insucesso</span>
                </div>
                <div>
                  <span className="text-purple-500 font-semibold">{d.taxa_ajuizado_pct}%</span>
                  <span className="text-slate-400 dark:text-slate-500 ml-1">ajuizado</span>
                </div>
              </div>
              <div className="flex gap-3 text-[9px] text-slate-400 dark:text-slate-500 border-t border-slate-50 dark:border-slate-700/40 pt-1.5">
                <span>{d.total_contratos.toLocaleString("pt-BR")} contratos</span>
                <span className="text-slate-200 dark:text-slate-700">·</span>
                <span className="text-green-600 dark:text-green-400">{fmtBRL(d.valor_recuperado)} recuperado</span>
                <span className="text-slate-200 dark:text-slate-700">·</span>
                <span className="text-orange-500">{fmtBRL(d.valor_em_aberto)} em aberto</span>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
