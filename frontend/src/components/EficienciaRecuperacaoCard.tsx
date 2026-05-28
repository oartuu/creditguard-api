import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";
import type { EficienciaAssessoria } from "../types/api";
import ChartCard from "./ChartCard";
import { useChartTheme } from "../contexts/ThemeContext";

const STATUS_COLORS = {
  acordos:   "#22c55e",
  em_aberto: "#f97316",
  insucesso: "#ef4444",
  ajuizado:  "#8b5cf6",
};

function eficienciaColor(score: number, max: number): string {
  const ratio = score / max;
  if (ratio >= 0.95) return "#22c55e";
  if (ratio >= 0.85) return "#f97316";
  return "#ef4444";
}

function ValorBR(v: number) {
  if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `R$ ${(v / 1e3).toFixed(0)}K`;
  return `R$ ${v.toFixed(0)}`;
}

function StatusBar({ ass }: { ass: EficienciaAssessoria }) {
  const total = ass.total_contratos;
  const parts = [
    { key: "acordos",   pct: (ass.acordos   / total) * 100, color: STATUS_COLORS.acordos   },
    { key: "em_aberto", pct: (ass.em_aberto  / total) * 100, color: STATUS_COLORS.em_aberto  },
    { key: "insucesso", pct: (ass.insucesso  / total) * 100, color: STATUS_COLORS.insucesso  },
    { key: "ajuizado",  pct: (ass.ajuizado   / total) * 100, color: STATUS_COLORS.ajuizado   },
  ];
  return (
    <div className="flex h-2 rounded-full overflow-hidden gap-px">
      {parts.map(p => (
        <div key={p.key} style={{ width: `${p.pct}%`, background: p.color }} title={`${p.key}: ${p.pct.toFixed(1)}%`} />
      ))}
    </div>
  );
}

interface Props {
  assessorias: EficienciaAssessoria[];
}

export default function EficienciaRecuperacaoCard({ assessorias }: Props) {
  const ct = useChartTheme();
  const maxScore = Math.max(...assessorias.map(a => a.score_eficiencia));
  const chartData = assessorias.map(a => ({
    name: a.assessoria.split(" ")[0],
    fullName: a.assessoria,
    score: a.score_eficiencia,
    taxa: a.taxa_recuperacao,
  }));

  return (
    <div className="flex flex-col gap-4">
      <ChartCard
        title="Score de Eficiência por Assessoria"
        subtitle="Eficiência = taxa de recuperação × (1 − taxa de judicialização)"
      >
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: ct.tick, fontSize: 11 }} />
            <YAxis domain={[0, Math.ceil(maxScore / 5) * 5 + 5]} tick={{ fill: ct.tick, fontSize: 10 }}
              tickFormatter={(v: number) => `${v}%`} />
            <Tooltip
              contentStyle={{ background: ct.tooltip.background, border: `1px solid ${ct.tooltip.border}`, borderRadius: 8 }}
              labelFormatter={(_: unknown, payload: readonly {payload?: {fullName?: string}}[]) =>
                payload[0]?.payload?.fullName ?? ""
              }
              formatter={(v: unknown) => [`${v}%`, "Score eficiência"]}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={eficienciaColor(d.score, maxScore)} />
              ))}
              <LabelList dataKey="score" position="top"
                style={{ fill: ct.tick, fontSize: 10, fontWeight: 700 }}
                formatter={(v: unknown) => `${v}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Detalhamento por Assessoria"
        subtitle="Distribuição de status (verde = acordos, laranja = em aberto, vermelho = insucesso, roxo = ajuizado)"
      >
        <div className="flex flex-col gap-3 pt-1">
          {assessorias.map(ass => (
            <div key={ass.assessoria} className="flex flex-col gap-1.5 px-3 py-3 border border-slate-100 dark:border-slate-700/60 rounded-xl bg-white dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{ass.assessoria}</span>
                <span className="text-xs font-bold font-mono text-green-600 dark:text-green-400 shrink-0">
                  {ass.score_eficiencia}% ef.
                </span>
              </div>
              <StatusBar ass={ass} />
              <div className="grid grid-cols-4 gap-2 text-[10px]">
                <div>
                  <span className="text-green-600 dark:text-green-400 font-semibold">{ass.taxa_recuperacao}%</span>
                  <span className="text-slate-400 dark:text-slate-500 ml-1">acordos</span>
                </div>
                <div>
                  <span className="text-orange-500 font-semibold">{ass.taxa_em_aberto}%</span>
                  <span className="text-slate-400 dark:text-slate-500 ml-1">em aberto</span>
                </div>
                <div>
                  <span className="text-red-500 font-semibold">{ass.taxa_insucesso}%</span>
                  <span className="text-slate-400 dark:text-slate-500 ml-1">insucesso</span>
                </div>
                <div>
                  <span className="text-purple-500 font-semibold">{ass.taxa_judicializacao}%</span>
                  <span className="text-slate-400 dark:text-slate-500 ml-1">ajuizado</span>
                </div>
              </div>
              <div className="flex gap-3 text-[9px] text-slate-400 dark:text-slate-500 border-t border-slate-50 dark:border-slate-700/40 pt-1.5">
                <span>{ValorBR(ass.valor_recuperado)} recuperado</span>
                <span className="text-slate-200 dark:text-slate-700">·</span>
                <span>{ValorBR(ass.valor_em_aberto)} em aberto</span>
                <span className="text-slate-200 dark:text-slate-700">·</span>
                <span>{ValorBR(ass.valor_perdido)} perdido</span>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
