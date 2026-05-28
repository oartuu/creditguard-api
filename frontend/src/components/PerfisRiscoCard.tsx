import type { CrossScoreContemplado, TopCombinacao } from "../types/api";
import ChartCard from "./ChartCard";

const SCORE_COLORS: Record<string, string> = {
  "Alto (67-100)": "bg-red-500",
  "Médio (34-66)": "bg-amber-400",
  "Baixo (1-33)":  "bg-blue-400",
  "Sem score":     "bg-slate-400",
};

const SCORE_TEXT: Record<string, string> = {
  "Alto (67-100)": "text-red-600 dark:text-red-400",
  "Médio (34-66)": "text-amber-600 dark:text-amber-400",
  "Baixo (1-33)":  "text-blue-600 dark:text-blue-400",
  "Sem score":     "text-slate-500 dark:text-slate-400",
};

function getCellBg(taxa: number, max: number): string {
  const ratio = taxa / max;
  if (ratio >= 0.95) return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-bold";
  if (ratio >= 0.85) return "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300";
  if (ratio >= 0.75) return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300";
  return "bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400";
}

interface CrossTableProps {
  data: CrossScoreContemplado[];
}

function CrossTable({ data }: CrossTableProps) {
  const scores = ["Alto (67-100)", "Médio (34-66)", "Baixo (1-33)"];
  const contemplados = ["Não", "Sim"];
  const maxTaxa = Math.max(...data.map(d => d.taxa_pct));

  return (
    <div className="overflow-auto">
      <table className="w-full text-xs border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="text-left px-3 py-2 text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide text-[10px]">Score</th>
            {contemplados.map(c => (
              <th key={c} className="px-3 py-2 text-slate-500 dark:text-slate-400 font-semibold text-center">
                {c === "Sim" ? "Contemplado" : "Não Contempl."}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scores.map(score => (
            <tr key={score}>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${SCORE_COLORS[score] ?? "bg-slate-400"}`} />
                  <span className={`font-medium ${SCORE_TEXT[score] ?? ""}`}>{score}</span>
                </div>
              </td>
              {contemplados.map(c => {
                const cell = data.find(d => d.score === score && d.contemplado === c);
                if (!cell) return <td key={c} className="px-3 py-2 text-center text-slate-300 dark:text-slate-600">—</td>;
                return (
                  <td key={c} className={`px-3 py-2 text-center rounded ${getCellBg(cell.taxa_pct, maxTaxa)}`}>
                    <div className="font-mono font-semibold">{cell.taxa_pct}%</div>
                    <div className="text-[9px] opacity-60">{cell.total.toLocaleString("pt-BR")} parcelas</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TopListProps {
  combinacoes: TopCombinacao[];
}

function TopList({ combinacoes }: TopListProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {combinacoes.map((c, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/60">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-4 shrink-0">#{i + 1}</span>
          <div className="flex-1 flex flex-wrap gap-1.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-700 ${SCORE_TEXT[c.score] ?? ""}`}>{c.score}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {c.contemplado === "Não" ? "Não contemplado" : "Contemplado"}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{c.forma_pagamento}</span>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-bold text-red-600 dark:text-red-400 font-mono">{c.taxa_pct}%</div>
            <div className="text-[9px] text-slate-400 dark:text-slate-500">{c.total.toLocaleString("pt-BR")} parcelas</div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface Props {
  crossContemplado: CrossScoreContemplado[];
  topCombinacoes: TopCombinacao[];
}

export default function PerfisRiscoCard({ crossContemplado, topCombinacoes }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <ChartCard
        title="Matriz Score × Contemplação"
        subtitle="Taxa de inadimplência por combinação de score de risco e status de contemplação"
      >
        <CrossTable data={crossContemplado} />
      </ChartCard>

      <ChartCard
        title="Top 5 Perfis de Maior Risco"
        subtitle="Combinações (score + contemplação + forma de pagamento) com maior taxa de inadimplência"
      >
        <TopList combinacoes={topCombinacoes} />
      </ChartCard>
    </div>
  );
}
