import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { TaxaInadimplencia, TaxaRecuperacao, AtrasoMedio, RiscoRegionalEstratégico, TendenciaTemporal } from "../types/api";
import { fetchTaxaInadimplencia, fetchTaxaRecuperacao, fetchAtrasoMedio, fetchRiscoRegional, fetchTendenciaTemporal } from "../services/api";
import TaxaInadimplenciaHero    from "../components/TaxaInadimplenciaHero";
import TaxaRecuperacaoHero      from "../components/TaxaRecuperacaoHero";
import AtrasoMedioHero          from "../components/AtrasoMedioHero";
import TaxaEvolucaoChart        from "../components/TaxaEvolucaoChart";
import TaxaSegmentacaoChart     from "../components/TaxaSegmentacaoChart";
import InsightsPanel            from "../components/InsightsPanel";
import RiscoRegionalCard        from "../components/RiscoRegionalCard";
import TendenciaTemporalCard    from "../components/TendenciaTemporalCard";
import FormulasIndicadores      from "../components/FormulasIndicadores";

function Spinner() {
  return (
    <div className="flex items-center justify-center h-[200px] text-slate-400 dark:text-slate-500">
      Carregando dados...
    </div>
  );
}

interface SectionProps {
  title: string;
  accent?: "red" | "green" | "orange";
  children: ReactNode;
}

function Section({ title, accent = "red", children }: SectionProps) {
  const dotColor = accent === "green" ? "bg-green-500" : accent === "orange" ? "bg-orange-500" : "bg-red-500";
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-2">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
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
        próximo indicador
      </span>
      <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700" />
    </div>
  );
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export default function IndicadoresEstrategicosPage() {
  const [inadimplencia, setInadimplencia] = useState<TaxaInadimplencia | null>(null);
  const [recuperacao, setRecuperacao]     = useState<TaxaRecuperacao | null>(null);
  const [atraso, setAtraso]               = useState<AtrasoMedio | null>(null);
  const [risco, setRisco]                 = useState<RiscoRegionalEstratégico | null>(null);
  const [tendencia, setTendencia]         = useState<TendenciaTemporal | null>(null);
  const [error, setError]                 = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchTaxaInadimplencia(),
      fetchTaxaRecuperacao(),
      fetchAtrasoMedio(),
      fetchRiscoRegional(),
      fetchTendenciaTemporal(),
    ])
      .then(([i, r, a, ri, te]) => {
        setInadimplencia(i); setRecuperacao(r); setAtraso(a); setRisco(ri); setTendencia(te);
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

  // ── inadimplência mappings ──
  const taxaInad = inadimplencia?.indicador_geral.taxa_pct ?? 0;
  const inadRegiaoData  = inadimplencia?.por_regiao.map(r => ({ label: r.regiao, taxa_pct: r.taxa_pct, total: r.total, atrasados: r.atrasados })) ?? [];
  const inadRiscoData   = inadimplencia?.por_faixa_risco.map(r => ({ label: r.faixa, taxa_pct: r.taxa_pct, total: r.total, atrasados: r.atrasados })) ?? [];
  const inadFormaData   = inadimplencia?.por_forma_pagamento.map(r => ({ label: r.forma, taxa_pct: r.taxa_pct, total: r.total, atrasados: r.atrasados })) ?? [];
  const inadContempData = inadimplencia?.por_contemplado.map(r => ({
    label: r.contemplado === "Sim" ? "Contemplado" : "Não contemplado",
    taxa_pct: r.taxa_pct, total: r.total, atrasados: r.atrasados,
  })) ?? [];

  // ── atraso mappings ──
  const mediaGeral = atraso?.indicador_geral.media_dias ?? 0;
  const atrasoRegiaoData = atraso?.por_regiao.map(r => ({ label: r.regiao, taxa_pct: r.media_dias, total: r.total, atrasados: r.total })) ?? [];
  const atrasoRiscoData  = atraso?.por_faixa_risco.map(r => ({ label: r.faixa, taxa_pct: r.media_dias, total: r.total, atrasados: r.total })) ?? [];
  const atrasoFormaData  = atraso?.por_forma_pagamento.map(r => ({ label: r.forma, taxa_pct: r.media_dias, total: r.total, atrasados: r.total })) ?? [];

  // ── recuperação mappings ──
  const taxaRec = recuperacao?.indicador_geral.taxa_pct ?? 0;
  const recRegiaoData = recuperacao?.por_regiao.map(r => ({ label: r.regiao, taxa_pct: r.taxa_pct, total: r.total, atrasados: r.acordos })) ?? [];
  const recRiscoData  = recuperacao?.por_faixa_risco.map(r => ({ label: r.faixa, taxa_pct: r.taxa_pct, total: r.total, atrasados: r.acordos })) ?? [];
  const recAssData    = recuperacao?.por_assessoria.map(r => ({ label: r.assessoria, taxa_pct: r.taxa_pct, total: r.total, atrasados: r.acordos })) ?? [];

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden transition-colors">

      {/* Module header */}
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-900/40 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
          <TargetIcon />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              Módulo 02
            </span>
          </div>
          <h2 className="m-0 text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">
            Indicadores Estratégicos
          </h2>
          <p className="mt-1 mb-0 text-slate-500 dark:text-slate-400 text-[13px]">
            Taxa de inadimplência e taxa de recuperação — evolução temporal, segmentação e análise por dimensão.
          </p>
        </div>
      </div>

      {/* Module content */}
      <div className="px-8 py-8 flex flex-col gap-10">

        {/* ── INADIMPLÊNCIA ── */}
        <Section title="Taxa de Inadimplência — Indicador Principal" accent="red">
          {inadimplencia ? <TaxaInadimplenciaHero data={inadimplencia.indicador_geral} /> : <Spinner />}
        </Section>

        <Section title="Inadimplência — Evolução Temporal" accent="red">
          {inadimplencia
            ? <TaxaEvolucaoChart
                data={inadimplencia.evolucao_mensal}
                color="#e32551"
                title="Evolução Mensal da Taxa de Inadimplência"
                label="Taxa de Inadimplência"
              />
            : <Spinner />}
        </Section>

        <Section title="Inadimplência — Segmentação" accent="red">
          <div className="grid grid-cols-2 gap-4">
            {inadimplencia
              ? <TaxaSegmentacaoChart title="Por Região" subtitle="Taxa de inadimplência por região geográfica" data={inadRegiaoData} referencia={taxaInad} />
              : <Spinner />}
            {inadimplencia
              ? <TaxaSegmentacaoChart title="Por Score de Risco" subtitle="Bandas de risco vs inadimplência real" data={inadRiscoData} referencia={taxaInad} />
              : <Spinner />}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {inadimplencia
              ? <TaxaSegmentacaoChart title="Por Forma de Pagamento" subtitle="Impacto do canal de pagamento" data={inadFormaData} referencia={taxaInad} />
              : <Spinner />}
            {inadimplencia
              ? <TaxaSegmentacaoChart title="Contemplado vs Não Contemplado" subtitle="Efeito da contemplação na inadimplência" data={inadContempData} referencia={taxaInad} />
              : <Spinner />}
          </div>
        </Section>

        <Section title="Inadimplência — Insights" accent="red">
          {inadimplencia
            ? <InsightsPanel title="Insights — Taxa de Inadimplência" insights={inadimplencia.insights} />
            : <Spinner />}
        </Section>

        <Divider />

        {/* ── RECUPERAÇÃO ── */}
        <Section title="Taxa de Recuperação — Indicador Principal" accent="green">
          {recuperacao
            ? <TaxaRecuperacaoHero data={recuperacao.indicador_geral} statuses={recuperacao.por_status} />
            : <Spinner />}
        </Section>

        <Section title="Recuperação — Evolução Temporal" accent="green">
          {recuperacao
            ? <TaxaEvolucaoChart
                data={recuperacao.evolucao_mensal}
                color="#22c55e"
                title="Evolução Mensal da Taxa de Recuperação"
                label="Taxa de Recuperação"
              />
            : <Spinner />}
        </Section>

        <Section title="Recuperação — Segmentação" accent="green">
          <div className="grid grid-cols-2 gap-4">
            {recuperacao
              ? <TaxaSegmentacaoChart title="Por Região" subtitle="Taxa de recuperação por região geográfica" data={recRegiaoData} referencia={taxaRec} higherIsBetter />
              : <Spinner />}
            {recuperacao
              ? <TaxaSegmentacaoChart title="Por Score de Risco" subtitle="Recuperação por banda de risco" data={recRiscoData} referencia={taxaRec} higherIsBetter />
              : <Spinner />}
          </div>
          {recuperacao
            ? <TaxaSegmentacaoChart title="Por Assessoria" subtitle="Performance de recuperação por assessoria de cobrança" data={recAssData} referencia={taxaRec} higherIsBetter />
            : <Spinner />}
        </Section>

        <Section title="Recuperação — Insights" accent="green">
          {recuperacao
            ? <InsightsPanel title="Insights — Taxa de Recuperação" insights={recuperacao.insights} />
            : <Spinner />}
        </Section>

        <Divider />

        {/* ── ATRASO MÉDIO ── */}
        <Section title="Atraso Médio — Indicador Principal" accent="orange">
          {atraso
            ? <AtrasoMedioHero data={atraso.indicador_geral} faixas={atraso.faixas_atraso} />
            : <Spinner />}
        </Section>

        <Section title="Atraso Médio — Evolução Temporal" accent="orange">
          {atraso
            ? <TaxaEvolucaoChart
                data={atraso.evolucao_mensal}
                dataKey="media_dias"
                suffix=" dias"
                color="#f07c19"
                title="Evolução Mensal do Atraso Médio"
                label="Atraso Médio"
              />
            : <Spinner />}
        </Section>

        <Section title="Atraso Médio — Segmentação" accent="orange">
          <div className="grid grid-cols-2 gap-4">
            {atraso
              ? <TaxaSegmentacaoChart title="Por Região" subtitle="Atraso médio em dias por região" data={atrasoRegiaoData} referencia={mediaGeral} suffix=" dias" metricLabel="Atraso médio" />
              : <Spinner />}
            {atraso
              ? <TaxaSegmentacaoChart title="Por Score de Risco" subtitle="Atraso médio por banda de risco" data={atrasoRiscoData} referencia={mediaGeral} suffix=" dias" metricLabel="Atraso médio" />
              : <Spinner />}
          </div>
          {atraso
            ? <TaxaSegmentacaoChart title="Por Forma de Pagamento" subtitle="Atraso médio em dias por canal de pagamento" data={atrasoFormaData} referencia={mediaGeral} suffix=" dias" metricLabel="Atraso médio" />
            : <Spinner />}
        </Section>

        <Section title="Atraso Médio — Insights" accent="orange">
          {atraso
            ? <InsightsPanel title="Insights — Atraso Médio" insights={atraso.insights} />
            : <Spinner />}
        </Section>

        <Divider />

        {/* ── RISCO REGIONAL ── */}
        <Section title="Risco Regional — Score Composto" accent="red">
          {risco
            ? <RiscoRegionalCard data={risco.por_regiao} pesos={risco.pesos} />
            : <Spinner />}
        </Section>

        <Section title="Risco Regional — Insights" accent="red">
          {risco
            ? <InsightsPanel title="Insights — Risco Regional" insights={risco.insights} />
            : <Spinner />}
        </Section>

        <Divider />

        {/* ── TENDÊNCIA TEMPORAL ── */}
        <Section title="Tendência Temporal — Regressão Linear" accent="orange">
          {tendencia
            ? <TendenciaTemporalCard
                inadimplencia={tendencia.inadimplencia.tendencia}
                recuperacao={tendencia.recuperacao.tendencia}
                atraso_medio={tendencia.atraso_medio.tendencia}
              />
            : <Spinner />}
        </Section>

        <Section title="Tendência Temporal — Insights" accent="orange">
          {tendencia
            ? <InsightsPanel title="Insights — Tendência Temporal" insights={tendencia.insights} />
            : <Spinner />}
        </Section>

        <Divider />

        {/* ── DOCUMENTAÇÃO DAS FÓRMULAS ── */}
        <Section title="Documentação das Fórmulas dos Indicadores">
          <FormulasIndicadores />
        </Section>

      </div>
    </div>
  );
}
