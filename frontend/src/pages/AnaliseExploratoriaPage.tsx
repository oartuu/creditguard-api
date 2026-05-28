import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type {
  Kpis, Tendencia, DistribuicaoAtrasos,
  ComportamentoPagamentos, DistribuicaoRegional, StatusCobrancas,
} from "../types/api";
import {
  fetchKpis, fetchTendencia, fetchDistribuicaoAtrasos,
  fetchComportamento, fetchRegional, fetchStatusCobrancas,
} from "../services/api";
import KpiCards                     from "../components/KpiCards";
import TendenciaChart               from "../components/TendenciaChart";
import FaixasAtrasoChart            from "../components/FaixasAtrasoChart";
import StatusCobrancasChart         from "../components/StatusCobrancasChart";
import RecuperacaoAssessoriaChart   from "../components/RecuperacaoAssessoriaChart";
import RegionalChart                from "../components/RegionalChart";
import ComportamentoPagamentosChart from "../components/ComportamentoPagamentosChart";
import InsightsPanel                from "../components/InsightsPanel";

function Spinner() {
  return (
    <div className="flex items-center justify-center h-[200px] text-slate-400 dark:text-slate-500">
      Carregando dados...
    </div>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="m-0 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-[2px] border-b border-slate-100 dark:border-slate-700/60 pb-2">
        {title}
      </h3>
      {children}
    </section>
  );
}

function MicroscopeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18h8" />
      <path d="M3 22h18" />
      <path d="M14 22a7 7 0 1 0 0-14h-1" />
      <path d="M9 14h2" />
      <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
      <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
    </svg>
  );
}

export default function AnaliseExploratoriaPage() {
  const [kpis, setKpis]                   = useState<Kpis | null>(null);
  const [tendencia, setTendencia]         = useState<Tendencia | null>(null);
  const [atrasos, setAtrasos]             = useState<DistribuicaoAtrasos | null>(null);
  const [comportamento, setComportamento] = useState<ComportamentoPagamentos | null>(null);
  const [regional, setRegional]           = useState<DistribuicaoRegional | null>(null);
  const [cobrancas, setCobrancas]         = useState<StatusCobrancas | null>(null);
  const [error, setError]                 = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchKpis(),
      fetchTendencia(),
      fetchDistribuicaoAtrasos(),
      fetchComportamento(),
      fetchRegional(),
      fetchStatusCobrancas(),
    ])
      .then(([k, t, a, c, r, s]) => {
        setKpis(k);
        setTendencia(t);
        setAtrasos(a);
        setComportamento(c);
        setRegional(r);
        setCobrancas(s);
      })
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
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-900/40 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
            <MicroscopeIcon />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                Módulo 01
              </span>
            </div>
            <h2 className="m-0 text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">
              Análise Exploratória dos Dados
            </h2>
            <p className="mt-1 mb-0 text-slate-500 dark:text-slate-400 text-[13px]">
              Estatísticas descritivas, distribuições e padrões de inadimplência e recuperação de crédito.
            </p>
          </div>
        </div>
      </div>

      {/* Module content */}
      <div className="px-8 py-8 flex flex-col gap-10">

        <Section title="Indicadores-chave">
          {kpis ? <KpiCards data={kpis} /> : <Spinner />}
        </Section>

        <Section title="Tendência Temporal">
          {tendencia ? <TendenciaChart data={tendencia} /> : <Spinner />}
        </Section>

        <Section title="Distribuição dos Atrasos">
          <div className="grid grid-cols-2 gap-4">
            {atrasos ? <FaixasAtrasoChart data={atrasos} /> : <Spinner />}
            {atrasos ? <InsightsPanel title="Insights — Atrasos" insights={atrasos.insights ?? []} /> : <Spinner />}
          </div>
        </Section>

        <Section title="Status das Cobranças">
          <div className="grid grid-cols-2 gap-4">
            {cobrancas ? <StatusCobrancasChart data={cobrancas} /> : <Spinner />}
            {cobrancas ? <RecuperacaoAssessoriaChart data={cobrancas} /> : <Spinner />}
          </div>
          {cobrancas ? <InsightsPanel title="Insights — Cobranças" insights={cobrancas.insights ?? []} /> : <Spinner />}
        </Section>

        <Section title="Comportamento de Pagamentos">
          {comportamento ? <ComportamentoPagamentosChart data={comportamento} /> : <Spinner />}
          {comportamento ? <InsightsPanel title="Insights — Pagamentos" insights={comportamento.insights ?? []} /> : <Spinner />}
        </Section>

        <Section title="Distribuição Regional">
          {regional ? <RegionalChart data={regional} /> : <Spinner />}
          {regional ? <InsightsPanel title="Insights — Regional" insights={regional.insights ?? []} /> : <Spinner />}
        </Section>

      </div>
    </div>
  );
}
