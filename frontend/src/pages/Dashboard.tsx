import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Kpis, Tendencia, DistribuicaoAtrasos, ComportamentoPagamentos, DistribuicaoRegional, StatusCobrancas } from "../types/api";
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

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="m-0 text-slate-300 text-[13px] font-semibold uppercase tracking-[1.5px] border-b border-slate-700 pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-[200px] text-slate-500">
      Carregando dados...
    </div>
  );
}

export default function Dashboard() {
  const [kpis, setKpis]               = useState<Kpis | null>(null);
  const [tendencia, setTendencia]     = useState<Tendencia | null>(null);
  const [atrasos, setAtrasos]         = useState<DistribuicaoAtrasos | null>(null);
  const [comportamento, setComportamento] = useState<ComportamentoPagamentos | null>(null);
  const [regional, setRegional]       = useState<DistribuicaoRegional | null>(null);
  const [cobrancas, setCobrancas]     = useState<StatusCobrancas | null>(null);
  const [error, setError]             = useState<string | null>(null);

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
      <div className="flex items-center justify-center h-screen text-red-500 p-8 text-center">
        <div>
          <div className="text-xl font-bold mb-2">Erro de conexão</div>
          <div className="text-slate-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 flex flex-col gap-10">

      <div>
        <h1 className="m-0 text-slate-100 text-[26px] font-bold tracking-tight">
          CreditGuard <span className="text-blue-500">Dashboard</span>
        </h1>
        <p className="mt-1.5 mb-0 text-slate-500 text-[13px]">
          Análise exploratória de inadimplência e recuperação de crédito
        </p>
      </div>

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
  );
}
