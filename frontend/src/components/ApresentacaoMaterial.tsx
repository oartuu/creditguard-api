import type { DashboardFinal } from "../types/api";
import ChartCard from "./ChartCard";

const fmtBRL = (v: number) =>
  v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toFixed(2).replace(".", ",")}M`
    : `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

const RISCO_STYLE: Record<string, { badge: string; bar: string }> = {
  Alto:  { badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",     bar: "bg-red-500" },
  Médio: { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", bar: "bg-amber-400" },
  Baixo: { badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400", bar: "bg-green-500" },
};

const PRIO_CFG = {
  Alta:  { badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",     icon: "🔴" },
  Média: { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", icon: "🟡" },
  Baixa: { badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300", icon: "🟢" },
} as const;

interface Props {
  material: DashboardFinal["material_apresentacao"];
}

export default function ApresentacaoMaterial({ material }: Props) {
  const kpis = material.kpis_principais;

  return (
    <div className="flex flex-col gap-6">

      {/* KPIs de destaque */}
      <ChartCard title="KPIs Principais — Resumo para Apresentação" subtitle="Números consolidados da carteira de inadimplência">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {[
            { label: "Taxa de Inadimplência", value: `${kpis.taxa_inadimplencia}%`, color: "border-l-red-500" },
            { label: "Taxa de Recuperação",   value: `${kpis.taxa_recuperacao}%`,   color: "border-l-green-500" },
            { label: "Atraso Médio",          value: `${kpis.atraso_medio_dias} dias`, color: "border-l-amber-500" },
            { label: "Valor Inadimplente",    value: fmtBRL(kpis.valor_inadimplente), color: "border-l-red-400" },
            { label: "Valor Recuperado",      value: fmtBRL(kpis.valor_recuperado),   color: "border-l-green-400" },
            { label: "Taxa Rec. Financeira",  value: `${kpis.pct_recuperacao_valor}%`, color: "border-l-blue-500" },
            { label: "Total de Contratos",    value: kpis.total_contratos.toLocaleString("pt-BR"), color: "border-l-slate-400" },
            { label: "Acordos Firmados",      value: kpis.acordos_firmados.toLocaleString("pt-BR"), color: "border-l-green-600" },
            { label: "Total de Parcelas",     value: kpis.total_parcelas.toLocaleString("pt-BR"),   color: "border-l-slate-400" },
          ].map(k => (
            <div key={k.label} className={`bg-slate-50 dark:bg-slate-700/40 rounded-xl p-4 border-l-4 ${k.color}`}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                {k.label}
              </div>
              <div className="text-xl font-black text-slate-800 dark:text-slate-100">{k.value}</div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Pontos de força e atenção */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Pontos de Força" subtitle="Aspectos positivos da operação">
          <div className="flex flex-col gap-3 pt-1">
            {material.pontos_forca.map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-500/8 dark:bg-green-500/10 border border-green-500/20">
                <span className="text-green-500 text-base flex-shrink-0 mt-0.5">✓</span>
                <span className="text-[12px] text-slate-700 dark:text-slate-200 leading-snug">{p}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Pontos de Atenção" subtitle="Riscos e oportunidades de melhoria">
          <div className="flex flex-col gap-3 pt-1">
            {material.pontos_atencao.map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/8 dark:bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-500 text-base flex-shrink-0 mt-0.5">▲</span>
                <span className="text-[12px] text-slate-700 dark:text-slate-200 leading-snug">{p}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Risco regional resumo */}
      <ChartCard title="Risco Regional — Ranking" subtitle="Score composto por região (inadimplência, recuperação, judicialização, atraso)">
        <div className="flex flex-col gap-2.5 pt-1">
          {material.risco_regional_resumo.map((r, i) => {
            const s = RISCO_STYLE[r.nivel_risco] ?? RISCO_STYLE.Médio;
            return (
              <div key={r.regiao} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/60">
                <span className="text-[13px] font-bold text-slate-400 dark:text-slate-500 w-5 text-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.regiao}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{r.nivel_risco}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${r.score_risco_composto}%` }} />
                  </div>
                  <div className="flex gap-3 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                    <span>Inadimp. {r.taxa_inadimplencia}%</span>
                    <span>·</span>
                    <span>Recup. {r.taxa_recuperacao}%</span>
                    <span>·</span>
                    <span>Atraso {r.atraso_medio} dias</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-700 dark:text-slate-200 flex-shrink-0">
                  {r.score_risco_composto}
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">/100</span>
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>

      {/* Recomendações */}
      <ChartCard title="Recomendações para Apresentação" subtitle="Próximos passos priorizados por impacto e urgência">
        <div className="flex flex-col gap-4 pt-1">
          {material.recomendacoes.map((rec, i) => {
            const cfg = PRIO_CFG[rec.prioridade] ?? PRIO_CFG.Média;
            return (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/60">
                <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
                  <span className="text-xl">{cfg.icon}</span>
                  <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                    {rec.prioridade}
                  </span>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{rec.titulo}</div>
                  <div className="text-[12px] text-slate-500 dark:text-slate-400 leading-snug">{rec.descricao}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">{rec.impacto}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>

    </div>
  );
}
