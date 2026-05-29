import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { PadroesInsights } from "../types/api";
import { fetchPadroesInsights } from "../services/api";
import PerfisRiscoCard           from "../components/PerfisRiscoCard";
import RegioesProblemaCard       from "../components/RegioesProblemaCard";
import EficienciaRecuperacaoCard from "../components/EficienciaRecuperacaoCard";
import PadroesTemporaisCard      from "../components/PadroesTemporaisCard";
import InsightsConsolidadosCard  from "../components/InsightsConsolidadosCard";
import RecomendacoesCard         from "../components/RecomendacoesCard";

function Spinner() {
  return (
    <div className="flex items-center justify-center h-[200px] text-slate-400 dark:text-slate-500">
      Carregando dados...
    </div>
  );
}

interface SectionProps {
  title: string;
  accent?: "purple" | "teal" | "rose" | "sky";
  children: ReactNode;
}

const ACCENT = {
  purple: { dot: "bg-blue-500",  label: "text-blue-500 bg-blue-500/10" },
  teal:   { dot: "bg-blue-500",  label: "text-blue-500 bg-blue-500/10" },
  rose:   { dot: "bg-red-500",   label: "text-red-500 bg-red-500/10" },
  sky:    { dot: "bg-blue-500",  label: "text-blue-500 bg-blue-500/10" },
};

function Section({ title, accent = "purple", children }: SectionProps) {
  const a = ACCENT[accent];
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-2">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.dot}`} />
        <h3 className="m-0 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-[2px]">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600 flex-shrink-0">
        próxima análise
      </span>
      <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700" />
    </div>
  );
}

function LightbulbIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18"/>
      <line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  );
}

export default function PadroesInsightsPage() {
  const [dados, setDados] = useState<PadroesInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPadroesInsights()
      .then(setDados)
      .catch(() => setError("Não foi possível conectar à API. Verifique se o servidor Flask está rodando na porta 5000."));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 p-8 text-center">
        <div>
          <div className="text-xl font-bold mb-2">Erro de conexão</div>
          <div className="text-slate-500 dark:text-slate-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden transition-colors">

      {/* Module header */}
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-900/40 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
          <LightbulbIcon />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
              Módulo 03
            </span>
          </div>
          <h2 className="m-0 text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">
            Padrões e Insights
          </h2>
          <p className="mt-1 mb-0 text-slate-500 dark:text-slate-400 text-[13px]">
            Perfis de risco, regiões críticas, eficiência de recuperação, padrões temporais e recomendações estratégicas.
          </p>
        </div>
      </div>

      {/* Module content */}
      <div className="px-8 py-8 flex flex-col gap-10">

        {/* ── PERFIS DE ALTO RISCO ── */}
        <Section title="Perfis de Alto Risco — Identificação" accent="rose">
          {dados
            ? <PerfisRiscoCard
                crossContemplado={dados.perfis_alto_risco.cross_score_contemplado}
                topCombinacoes={dados.perfis_alto_risco.top_combinacoes}
              />
            : <Spinner />}
        </Section>

        <Divider />

        {/* ── REGIÕES CRÍTICAS ── */}
        <Section title="Regiões Críticas — Análise de Criticidade" accent="rose">
          {dados ? <RegioesProblemaCard regioes={dados.regioes_criticas} /> : <Spinner />}
        </Section>

        <Divider />

        {/* ── EFICIÊNCIA DE RECUPERAÇÃO ── */}
        <Section title="Eficiência de Recuperação — Avaliação por Assessoria" accent="teal">
          {dados ? <EficienciaRecuperacaoCard assessorias={dados.eficiencia_recuperacao} /> : <Spinner />}
        </Section>

        <Divider />

        {/* ── PADRÕES TEMPORAIS ── */}
        <Section title="Padrões Temporais — Sazonalidade e Variação" accent="sky">
          {dados ? <PadroesTemporaisCard data={dados.padroes_temporais} /> : <Spinner />}
        </Section>

        <Divider />

        {/* ── INSIGHTS CONSOLIDADOS ── */}
        <Section title="Insights Consolidados — Síntese da Carteira" accent="purple">
          {dados ? <InsightsConsolidadosCard insights={dados.insights_consolidados} /> : <Spinner />}
        </Section>

        <Divider />

        {/* ── RECOMENDAÇÕES ── */}
        <Section title="Recomendações — Plano de Ação Prioritário" accent="purple">
          {dados ? <RecomendacoesCard recomendacoes={dados.recomendacoes} /> : <Spinner />}
        </Section>

      </div>
    </div>
  );
}
