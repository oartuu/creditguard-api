import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { OperacaoCobranca } from "../types/api";
import { fetchOperacaoCobranca } from "../services/api";
import ContratosAbertosCard       from "../components/ContratosAbertosCard";
import ContratosRecuperadosCard   from "../components/ContratosRecuperadosCard";
import OperacaoStatusChart        from "../components/OperacaoStatusChart";
import DesempenhoOperacionalTable from "../components/DesempenhoOperacionalTable";

function Spinner() {
  return (
    <div className="flex items-center justify-center h-[200px] text-slate-400 dark:text-slate-500">
      Carregando dados...
    </div>
  );
}

interface SectionProps {
  title: string;
  accent?: "blue" | "red" | "green" | "amber" | "orange" | "purple";
  children: ReactNode;
}

const ACCENT = {
  blue:   { dot: "bg-blue-500",   label: "text-blue-500 bg-blue-500/10" },
  red:    { dot: "bg-red-500",    label: "text-red-500 bg-red-500/10" },
  green:  { dot: "bg-green-500",  label: "text-green-500 bg-green-500/10" },
  amber:  { dot: "bg-amber-500",  label: "text-amber-500 bg-amber-500/10" },
  orange: { dot: "bg-orange-500", label: "text-orange-500 bg-orange-500/10" },
  purple: { dot: "bg-blue-500",   label: "text-blue-500 bg-blue-500/10" },
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

function CobrancaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export default function OperacaoCobrancaPage() {
  const [dados, setDados] = useState<OperacaoCobranca | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOperacaoCobranca()
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
        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
          <CobrancaIcon />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
              Módulo 06
            </span>
          </div>
          <h2 className="m-0 text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">
            Operação de Cobrança
          </h2>
          <p className="mt-1 mb-0 text-slate-500 dark:text-slate-400 text-[13px]">
            Visão operacional da carteira de cobrança — contratos em aberto, recuperados, distribuição de status e desempenho das assessorias.
          </p>
        </div>
      </div>

      {/* Module content */}
      <div className="px-8 py-8 flex flex-col gap-10">

        {/* ── CONTRATOS EM ABERTO ── */}
        <Section title="Contratos em Aberto — Oportunidade de Recuperação" accent="orange">
          {dados
            ? <ContratosAbertosCard
                data={dados.contratos_aberto}
                totalContratos={dados.totais.total_contratos}
                valorCarteira={dados.totais.valor_carteira_total}
              />
            : <Spinner />
          }
        </Section>

        <Divider />

        {/* ── CONTRATOS RECUPERADOS ── */}
        <Section title="Contratos Recuperados — Acordos Firmados" accent="green">
          {dados
            ? <ContratosRecuperadosCard
                contratos_recuperados={dados.contratos_recuperados}
                evolucao_mensal={dados.evolucao_mensal}
              />
            : <Spinner />
          }
        </Section>

        <Divider />

        {/* ── STATUS DAS COBRANÇAS ── */}
        <Section title="Status das Cobranças — Distribuição e Evolução" accent="blue">
          {dados
            ? <OperacaoStatusChart
                status_cobrancas={dados.status_cobrancas}
                evolucao_mensal={dados.evolucao_mensal}
              />
            : <Spinner />
          }
        </Section>

        <Divider />

        {/* ── DESEMPENHO OPERACIONAL ── */}
        <Section title="Desempenho Operacional — Ranking de Assessorias" accent="purple">
          {dados
            ? <DesempenhoOperacionalTable desempenho={dados.desempenho_operacional} />
            : <Spinner />
          }
        </Section>

      </div>
    </div>
  );
}
