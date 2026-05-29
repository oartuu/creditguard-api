import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import Sidebar from "../components/Sidebar";
import AnaliseExploratoriaPage         from "./AnaliseExploratoriaPage";
import IndicadoresEstrategicosPage     from "./IndicadoresEstrategicosPage";
import PadroesInsightsPage             from "./PadroesInsightsPage";
import VisaoDiretoriaPage              from "./VisaoDiretoriaPage";
import VisaoFinanceiraPage             from "./VisaoFinanceiraPage";
import OperacaoCobrancaPage            from "./OperacaoCobrancaPage";
import DashboardFinalPage              from "./DashboardFinalPage";

/* ── Icons ─────────────────────────────────────────────────────────── */

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

/* ── Card icons ─────────────────────────────────────────────────────── */

function IconBarChart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconLightbulb() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}

function IconTrendingUp() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconActivity() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

/* ── Module config ──────────────────────────────────────────────────── */

interface ModuleConfig {
  id: string;
  label: string;
  sub: string;
  num: string;
  icon: React.ReactNode;
  color: string;   // hex, used in inline styles
}

import type React from "react";

const MODULES: ModuleConfig[] = [
  { id: "analise-exploratoria",     label: "Análise Exploratória",     sub: "Dados & Estatísticas",      num: "01", icon: <IconBarChart />,    color: "#3b82f6" },
  { id: "indicadores-estrategicos", label: "Indicadores Estratégicos", sub: "Taxa de Inadimplência",     num: "02", icon: <IconShield />,      color: "#8b5cf6" },
  { id: "padroes-insights",         label: "Padrões e Insights",       sub: "Perfis & Recomendações",    num: "03", icon: <IconLightbulb />,   color: "#10b981" },
  { id: "visao-diretoria",          label: "Visão da Diretoria",       sub: "Dashboard Executivo",       num: "04", icon: <IconBuilding />,    color: "#f59e0b" },
  { id: "visao-financeira",         label: "Visão Financeira",         sub: "Valores & Exposição",       num: "05", icon: <IconTrendingUp />,  color: "#06b6d4" },
  { id: "operacao-cobranca",        label: "Operação de Cobrança",     sub: "Status & Desempenho",       num: "06", icon: <IconActivity />,    color: "#f43f5e" },
  { id: "dashboard-final",          label: "Dashboard Final",          sub: "Validação & Apresentação",  num: "07", icon: <IconGrid />,        color: "#6366f1" },
];

/* ── ModuleCard ─────────────────────────────────────────────────────── */

function ModuleCard({ label, sub, num, icon, color, onClick }: ModuleConfig & { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 p-6 flex flex-col gap-5 cursor-pointer overflow-hidden text-left"
      style={{ "--card-color": color } as React.CSSProperties}
    >
      {/* Hover glow background */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 25% 35%, ${color}22 0%, transparent 65%)` }}
      />

      {/* Subtle top-left corner decoration */}
      <div
        className="absolute -top-8 -left-8 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
        style={{ background: color }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between relative z-10">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${color}1a`, color }}
        >
          {icon}
        </div>
        <span
          className="text-[11px] font-black tracking-[0.2em] mt-0.5"
          style={{ color: `${color}bb` }}
        >
          {num}
        </span>
      </div>

      {/* Labels */}
      <div className="relative z-10 flex-1">
        <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          {label}
        </p>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
          {sub}
        </p>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)` }}
      />

      {/* Arrow hint */}
      <div className="relative z-10 flex items-center gap-1 text-[11px] font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1"
        style={{ color }}>
        Abrir módulo
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

/* ── ModuleGrid ─────────────────────────────────────────────────────── */

function ModuleGrid({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="max-w-[960px] mx-auto px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center text-blue-500 dark:text-blue-400 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Módulos de Análise</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">Selecione um módulo para explorar os dados</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {MODULES.map(m => (
          <ModuleCard key={m.id} {...m} onClick={() => onSelect(m.id)} />
        ))}
      </div>
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────────────────────────── */

export default function Dashboard() {
  const { isDark, toggle } = useTheme();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-slate-900">

      <header className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 flex-shrink-0 transition-colors relative">
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <HamburgerIcon />
        </button>

        {/* Centered title */}
        <button
          onClick={() => setActiveModule(null)}
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 group cursor-pointer"
        >
          <span className="text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
            <ShieldCheckIcon />
          </span>
          <span className="text-slate-900 dark:text-slate-100 font-black tracking-[0.22em] uppercase text-base group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
            CreditGuard AI
          </span>
        </button>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-2">
          {activeModule && (
            <button
              onClick={() => setActiveModule(null)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <BackIcon />
              Módulos
            </button>
          )}
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title={isDark ? "Tema claro" : "Tema escuro"}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <Sidebar activeModule={activeModule ?? ""} onModuleChange={setActiveModule} />
        )}

        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 transition-colors">
          {activeModule === null && <ModuleGrid onSelect={setActiveModule} />}
          {activeModule === "analise-exploratoria"      && <div className="max-w-[1100px] mx-auto px-6 py-8"><AnaliseExploratoriaPage /></div>}
          {activeModule === "indicadores-estrategicos"  && <div className="max-w-[1100px] mx-auto px-6 py-8"><IndicadoresEstrategicosPage /></div>}
          {activeModule === "padroes-insights"          && <div className="max-w-[1100px] mx-auto px-6 py-8"><PadroesInsightsPage /></div>}
          {activeModule === "visao-diretoria"           && <div className="max-w-[1100px] mx-auto px-6 py-8"><VisaoDiretoriaPage /></div>}
          {activeModule === "visao-financeira"          && <div className="max-w-[1100px] mx-auto px-6 py-8"><VisaoFinanceiraPage /></div>}
          {activeModule === "operacao-cobranca"         && <div className="max-w-[1100px] mx-auto px-6 py-8"><OperacaoCobrancaPage /></div>}
          {activeModule === "dashboard-final"           && <div className="max-w-[1100px] mx-auto px-6 py-8"><DashboardFinalPage /></div>}
        </main>
      </div>

    </div>
  );
}
