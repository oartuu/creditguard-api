import type { SaudeCarteira } from "../types/api";
import ChartCard from "./ChartCard";

const NIVEL_CONFIG = {
  Saudável: { bg: "bg-green-500/10 dark:bg-green-500/15", text: "text-green-600 dark:text-green-400", ring: "ring-green-500/30", bar: "bg-green-500" },
  Atenção:  { bg: "bg-amber-500/10 dark:bg-amber-500/15",  text: "text-amber-600 dark:text-amber-400",  ring: "ring-amber-500/30",  bar: "bg-amber-500" },
  Crítico:  { bg: "bg-red-500/10 dark:bg-red-500/15",      text: "text-red-600 dark:text-red-400",      ring: "ring-red-500/30",    bar: "bg-red-500" },
} as const;

interface Props {
  saude: SaudeCarteira;
}

export default function DiretoriaSaudeCard({ saude }: Props) {
  const cfg = NIVEL_CONFIG[saude.nivel];
  const barPct = Math.min(Math.max(saude.score, 0), 100);

  return (
    <ChartCard title="Saúde da Carteira" subtitle="Score composto: inadimplência (50%) + recuperação (50%)">
      <div className="flex flex-col gap-4 pt-1">

        <div className={`flex items-center gap-4 p-4 rounded-xl ring-1 ${cfg.bg} ${cfg.ring}`}>
          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-slate-900 ring-2 ring-current shrink-0">
            <span className={`text-2xl font-bold leading-none ${cfg.text}`}>{saude.score}</span>
            <span className={`text-[9px] font-bold uppercase tracking-wide ${cfg.text}`}>/ 100</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className={`text-lg font-bold ${cfg.text}`}>{saude.nivel}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Score baseado em inadimplência e taxa de recuperação
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span>0 — Crítico</span>
            <span>100 — Saudável</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {(["Crítico", "Atenção", "Saudável"] as const).map(n => (
            <div
              key={n}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-colors
                ${saude.nivel === n
                  ? `${NIVEL_CONFIG[n].bg} ${NIVEL_CONFIG[n].text} ring-1 ${NIVEL_CONFIG[n].ring}`
                  : "bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500"
                }`}
            >
              {n}
              <div className="text-[9px] font-normal opacity-75">
                {n === "Crítico" ? "< 55" : n === "Atenção" ? "55–74" : "≥ 75"}
              </div>
            </div>
          ))}
        </div>

      </div>
    </ChartCard>
  );
}
