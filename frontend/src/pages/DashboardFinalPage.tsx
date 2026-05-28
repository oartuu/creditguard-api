import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { DashboardFinal } from "../types/api";
import { fetchDashboardFinal } from "../services/api";
import ValidacaoKpiGrid      from "../components/ValidacaoKpiGrid";
import DashboardFinalResumo  from "../components/DashboardFinalResumo";
import ApresentacaoMaterial  from "../components/ApresentacaoMaterial";

function Spinner() {
  return (
    <div className="flex items-center justify-center h-[200px] text-slate-400 dark:text-slate-500">
      Carregando dados...
    </div>
  );
}

interface SectionProps {
  title: string;
  accent?: "blue" | "red" | "green" | "amber" | "purple" | "indigo";
  children: ReactNode;
}

const ACCENT = {
  blue:   { dot: "bg-blue-500",   label: "text-blue-500 bg-blue-500/10" },
  red:    { dot: "bg-red-500",    label: "text-red-500 bg-red-500/10" },
  green:  { dot: "bg-green-500",  label: "text-green-500 bg-green-500/10" },
  amber:  { dot: "bg-amber-500",  label: "text-amber-500 bg-amber-500/10" },
  purple: { dot: "bg-purple-500", label: "text-purple-500 bg-purple-500/10" },
  indigo: { dot: "bg-indigo-500", label: "text-indigo-500 bg-indigo-500/10" },
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

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export default function DashboardFinalPage() {
  const [dados, setDados] = useState<DashboardFinal | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardFinal()
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
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
          <DashboardIcon />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-indigo-600 bg-indigo-600/10 px-2 py-0.5 rounded-full">
              Módulo 07
            </span>
          </div>
          <h2 className="m-0 text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">
            Dashboard Final
          </h2>
          <p className="mt-1 mb-0 text-slate-500 dark:text-slate-400 text-[13px]">
            Validação integrada de todos os KPIs, revisão de layout consolidado e material preparado para apresentação executiva.
          </p>
        </div>
      </div>

      {/* Module content */}
      <div className="px-8 py-8 flex flex-col gap-10">

        {/* ── VALIDAÇÃO DE KPIs ── */}
        <Section title="Validação de KPIs — Status por Indicador" accent="indigo">
          {dados ? <ValidacaoKpiGrid validacoes={dados.validacoes} /> : <Spinner />}
        </Section>

        <Divider />

        {/* ── REVISÃO DE LAYOUT ── */}
        <Section title="Revisão de Layout — Consolidado Final" accent="blue">
          {dados ? <DashboardFinalResumo dados={dados} /> : <Spinner />}
        </Section>

        <Divider />

        {/* ── MATERIAL PARA APRESENTAÇÃO ── */}
        <Section title="Material para Apresentação — Síntese Executiva" accent="green">
          {dados ? <ApresentacaoMaterial material={dados.material_apresentacao} /> : <Spinner />}
        </Section>

      </div>
    </div>
  );
}
