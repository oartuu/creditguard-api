import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { TaxaInadimplencia } from "../types/api";
import { fetchTaxaInadimplencia } from "../services/api";
import TaxaInadimplenciaHero    from "../components/TaxaInadimplenciaHero";
import TaxaEvolucaoChart        from "../components/TaxaEvolucaoChart";
import TaxaSegmentacaoChart     from "../components/TaxaSegmentacaoChart";
import InsightsPanel            from "../components/InsightsPanel";

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

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export default function IndicadoresEstrategicosPage() {
  const [data, setData] = useState<TaxaInadimplencia | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaxaInadimplencia()
      .then(setData)
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

  const taxa = data?.indicador_geral.taxa_pct ?? 0;

  const regiaoData = data?.por_regiao.map(r => ({
    label: r.regiao, taxa_pct: r.taxa_pct, total: r.total, atrasados: r.atrasados,
  })) ?? [];

  const riscoData = data?.por_faixa_risco.map(r => ({
    label: r.faixa, taxa_pct: r.taxa_pct, total: r.total, atrasados: r.atrasados,
  })) ?? [];

  const formaData = data?.por_forma_pagamento.map(r => ({
    label: r.forma, taxa_pct: r.taxa_pct, total: r.total, atrasados: r.atrasados,
  })) ?? [];

  const contempladoData = data?.por_contemplado.map(r => ({
    label: r.contemplado === "Sim" ? "Contemplado" : "Não contemplado",
    taxa_pct: r.taxa_pct,
    total: r.total,
    atrasados: r.atrasados,
  })) ?? [];

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden transition-colors">

      {/* Module header */}
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-900/40 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
          <TargetIcon />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
              Módulo 02
            </span>
          </div>
          <h2 className="m-0 text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">
            Indicadores Estratégicos
          </h2>
          <p className="mt-1 mb-0 text-slate-500 dark:text-slate-400 text-[13px]">
            Taxa de inadimplência detalhada: evolução temporal, segmentação por região, risco e forma de pagamento.
          </p>
        </div>
      </div>

      {/* Module content */}
      <div className="px-8 py-8 flex flex-col gap-10">

        <Section title="Taxa de Inadimplência — Indicador Principal">
          {data ? <TaxaInadimplenciaHero data={data.indicador_geral} /> : <Spinner />}
        </Section>

        <Section title="Evolução Temporal">
          {data ? <TaxaEvolucaoChart data={data.evolucao_mensal} /> : <Spinner />}
        </Section>

        <Section title="Segmentação da Taxa">
          <div className="grid grid-cols-2 gap-4">
            {data
              ? <TaxaSegmentacaoChart title="Por Região" subtitle="Taxa de inadimplência por região geográfica" data={regiaoData} referencia={taxa} />
              : <Spinner />}
            {data
              ? <TaxaSegmentacaoChart title="Por Score de Risco" subtitle="Bandas de risco vs inadimplência real" data={riscoData} referencia={taxa} />
              : <Spinner />}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {data
              ? <TaxaSegmentacaoChart title="Por Forma de Pagamento" subtitle="Impacto do canal de pagamento" data={formaData} referencia={taxa} />
              : <Spinner />}
            {data
              ? <TaxaSegmentacaoChart title="Contemplado vs Não Contemplado" subtitle="Efeito da contemplação na inadimplência" data={contempladoData} referencia={taxa} />
              : <Spinner />}
          </div>
        </Section>

        <Section title="Análise e Insights">
          {data
            ? <InsightsPanel title="Insights — Taxa de Inadimplência" insights={data.insights} />
            : <Spinner />}
        </Section>

      </div>
    </div>
  );
}
