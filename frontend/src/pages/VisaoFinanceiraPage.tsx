import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { VisaoFinanceira } from "../types/api";
import { fetchVisaoFinanceira } from "../services/api";
import FinanceiroValorHero     from "../components/FinanceiroValorHero";
import FinanceiroAtrasoCard    from "../components/FinanceiroAtrasoCard";
import FinanceiroRegionalChart from "../components/FinanceiroRegionalChart";
import FinanceiroEvolucaoChart from "../components/FinanceiroEvolucaoChart";

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

function FinanceiroIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export default function VisaoFinanceiraPage() {
  const [dados, setDados] = useState<VisaoFinanceira | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVisaoFinanceira()
      .then(setDados)
      .catch(() =>
        setError("Não foi possível conectar à API. Verifique se o servidor Flask está rodando na porta 5000.")
      );
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
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
          <FinanceiroIcon />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-emerald-600 bg-emerald-600/10 px-2 py-0.5 rounded-full">
              Módulo 05
            </span>
          </div>
          <h2 className="m-0 text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">
            Visão Financeira
          </h2>
          <p className="mt-1 mb-0 text-slate-500 dark:text-slate-400 text-[13px]">
            Exposição financeira da carteira inadimplente — valor em risco, atraso médio, distribuição regional e evolução temporal dos valores.
          </p>
        </div>
      </div>

      {/* Module content */}
      <div className="px-8 py-8 flex flex-col gap-10">

        {/* ── VALOR INADIMPLENTE ── */}
        <Section title="Valor Inadimplente — Exposição Total" accent="red">
          {dados ? <FinanceiroValorHero data={dados.valor_inadimplente} /> : <Spinner />}
        </Section>

        <Divider />

        {/* ── ATRASO MÉDIO ── */}
        <Section title="Atraso Médio — Dias de Inadimplência" accent="amber">
          {dados ? <FinanceiroAtrasoCard data={dados.atraso_medio} /> : <Spinner />}
        </Section>

        <Divider />

        {/* ── DISTRIBUIÇÃO REGIONAL ── */}
        <Section title="Distribuição Regional — Concentração Financeira" accent="blue">
          {dados ? <FinanceiroRegionalChart data={dados.distribuicao_regional} /> : <Spinner />}
        </Section>

        <Divider />

        {/* ── EVOLUÇÃO FINANCEIRA ── */}
        <Section title="Evolução Financeira — Série Mensal" accent="green">
          {dados ? <FinanceiroEvolucaoChart data={dados.evolucao_financeira} /> : <Spinner />}
        </Section>

      </div>
    </div>
  );
}
