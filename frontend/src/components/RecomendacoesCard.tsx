import type { Recomendacao } from "../types/api";

const PRIORIDADE_STYLE: Record<string, { border: string; badge: string; num: string }> = {
  "Crítica": {
    border: "border-red-200 dark:border-red-800/60",
    badge:  "bg-red-500 text-white",
    num:    "bg-red-500 text-white",
  },
  "Alta": {
    border: "border-orange-200 dark:border-orange-800/60",
    badge:  "bg-orange-500 text-white",
    num:    "bg-orange-500 text-white",
  },
  "Média": {
    border: "border-blue-200 dark:border-blue-800/40",
    badge:  "bg-blue-500 text-white",
    num:    "bg-blue-500 text-white",
  },
};

const AREA_ICON: Record<string, string> = {
  "Cobrança":  "⟳",
  "Operações": "⊞",
  "Crédito":   "◈",
  "Risco":     "◉",
  "Regional":  "◑",
};

function RecomendacaoCard({ rec, idx }: { rec: Recomendacao; idx: number }) {
  const s = PRIORIDADE_STYLE[rec.prioridade] ?? PRIORIDADE_STYLE["Média"];
  const icon = AREA_ICON[rec.area] ?? "◇";

  return (
    <div className={`border rounded-xl bg-white dark:bg-slate-800/60 overflow-hidden transition-colors ${s.border}`}>
      <div className="flex items-stretch">
        <div className={`w-12 shrink-0 flex flex-col items-center justify-center gap-1 ${s.num}`}>
          <span className="text-[9px] font-bold opacity-80">#</span>
          <span className="text-base font-bold leading-none">{idx + 1}</span>
        </div>

        <div className="flex-1 px-4 py-3.5 flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-60 mr-0.5">{icon}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${s.badge}`}>
                  {rec.prioridade}
                </span>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {rec.area}
                </span>
              </div>
              <h4 className="m-0 text-slate-900 dark:text-slate-100 text-sm font-semibold leading-snug">
                {rec.titulo}
              </h4>
            </div>
          </div>

          <p className="m-0 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{rec.descricao}</p>

          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-green-600 dark:text-green-500 font-bold">↑</span>
              <span className="text-slate-500 dark:text-slate-400">{rec.impacto_esperado}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-slate-400 dark:text-slate-500">⏱</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">{rec.prazo}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  recomendacoes: Recomendacao[];
}

export default function RecomendacoesCard({ recomendacoes }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 flex flex-col gap-4 transition-colors">
      <div className="flex flex-col gap-0.5">
        <h3 className="m-0 text-slate-900 dark:text-slate-100 text-sm font-semibold">Recomendações Prioritárias</h3>
        <p className="m-0 text-xs text-slate-400 dark:text-slate-500">
          Ações recomendadas ordenadas por urgência, com impacto esperado e prazo de implementação.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {recomendacoes.map((rec, i) => (
          <RecomendacaoCard key={i} rec={rec} idx={i} />
        ))}
      </div>
    </div>
  );
}
