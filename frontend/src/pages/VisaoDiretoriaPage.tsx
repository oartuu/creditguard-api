import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { VisaoDiretoria } from "../types/api";
import { fetchVisaoDiretoria } from "../services/api";
import TaxaInadimplenciaHero       from "../components/TaxaInadimplenciaHero";
import TaxaRecuperacaoHero         from "../components/TaxaRecuperacaoHero";
import TendenciaTemporalCard       from "../components/TendenciaTemporalCard";
import DiretoriaTendenciaDualChart from "../components/DiretoriaTendenciaDualChart";
import DiretoriaSaudeCard          from "../components/DiretoriaSaudeCard";
import {
  DiretoriaConsolidadoTable,
  DiretoriaAlertasCard,
}                                  from "../components/DiretoriaConsolidadoCard";

function Spinner() {
  return (
    <div className="flex items-center justify-center h-[200px] text-slate-400 dark:text-slate-500">
      Carregando dados...
    </div>
  );
}

interface SectionProps {
  title: string;
  accent?: "blue" | "red" | "green" | "amber";
  children: ReactNode;
}

const ACCENT = {
  blue:  { dot: "bg-blue-500",  label: "text-blue-500 bg-blue-500/10" },
  red:   { dot: "bg-red-500",   label: "text-red-500 bg-red-500/10" },
  green: { dot: "bg-green-500", label: "text-green-500 bg-green-500/10" },
  amber: { dot: "bg-amber-500", label: "text-amber-500 bg-amber-500/10" },
};

function Section({ title, accent = "blue", children }: SectionProps) {
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
        próxima seção
      </span>
      <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700" />
    </div>
  );
}

function BoardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}

export default function VisaoDiretoriaPage() {
  const [dados, setDados] = useState<VisaoDiretoria | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVisaoDiretoria()
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
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
          <BoardIcon />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded-full">
              Módulo 04
            </span>
          </div>
          <h2 className="m-0 text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">
            Visão da Diretoria
          </h2>
          <p className="mt-1 mb-0 text-slate-500 dark:text-slate-400 text-[13px]">
            Visão executiva consolidada — saúde da carteira, indicadores-chave e tendências para tomada de decisão estratégica.
          </p>
        </div>
      </div>

      {/* Module content */}
      <div className="px-8 py-8 flex flex-col gap-10">

        {/* ── SAÚDE + ALERTAS ── */}
        <Section title="Saúde da Carteira — Indicador Executivo" accent="blue">
          <div className="grid grid-cols-2 gap-4">
            {dados ? <DiretoriaSaudeCard saude={dados.saude_carteira} /> : <Spinner />}
            {dados ? <DiretoriaAlertasCard alertas={dados.alertas_executivos} /> : <Spinner />}
          </div>
        </Section>

        <Divider />

        {/* ── VISÃO CONSOLIDADA ── */}
        <Section title="Visão Consolidada dos Resultados" accent="blue">
          {dados ? <DiretoriaConsolidadoTable rows={dados.visao_consolidada} /> : <Spinner />}
        </Section>

        <Divider />

        {/* ── TAXA DE INADIMPLÊNCIA ── */}
        <Section title="Taxa de Inadimplência — Resumo Executivo" accent="red">
          {dados
            ? <TaxaInadimplenciaHero data={dados.inadimplencia.indicador_geral} />
            : <Spinner />}
        </Section>

        <Section title="Inadimplência — Evolução Mensal" accent="red">
          {dados
            ? <DiretoriaTendenciaDualChart
                inadimplencia={dados.inadimplencia.evolucao_mensal}
                recuperacao={dados.recuperacao.evolucao_mensal}
              />
            : <Spinner />}
        </Section>

        <Divider />

        {/* ── TAXA DE RECUPERAÇÃO ── */}
        <Section title="Taxa de Recuperação — Resumo Executivo" accent="green">
          {dados
            ? <TaxaRecuperacaoHero
                data={dados.recuperacao.indicador_geral}
                statuses={[]}
              />
            : <Spinner />}
        </Section>

        <Divider />

        {/* ── TENDÊNCIA TEMPORAL ── */}
        <Section title="Tendência Temporal — Análise de Regressão" accent="amber">
          {dados
            ? <TendenciaTemporalCard
                inadimplencia={dados.tendencia_temporal.inadimplencia.tendencia}
                recuperacao={dados.tendencia_temporal.recuperacao.tendencia}
                atraso_medio={dados.tendencia_temporal.atraso_medio.tendencia}
              />
            : <Spinner />}
        </Section>

      </div>
    </div>
  );
}
