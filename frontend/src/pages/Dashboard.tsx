import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import Sidebar from "../components/Sidebar";
import AnaliseExploratoriaPage         from "./AnaliseExploratoriaPage";
import IndicadoresEstrategicosPage     from "./IndicadoresEstrategicosPage";
import PadroesInsightsPage             from "./PadroesInsightsPage";

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
      title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState("analise-exploratoria");

  return (
    <div className="min-h-screen flex flex-col">

      {/* Top header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 flex-shrink-0 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-slate-900 dark:text-slate-100 font-bold text-[15px] tracking-tight">
            CreditGuard
          </span>
          <span className="hidden sm:block text-slate-300 dark:text-slate-600 text-sm mx-1">/</span>
          <span className="hidden sm:block text-slate-500 dark:text-slate-400 text-sm">
            Análise de Inadimplência
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Body: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />

        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 transition-colors">
          <div className="max-w-[1100px] mx-auto px-6 py-8">
            {activeModule === "analise-exploratoria"       && <AnaliseExploratoriaPage />}
            {activeModule === "indicadores-estrategicos"  && <IndicadoresEstrategicosPage />}
            {activeModule === "padroes-insights"          && <PadroesInsightsPage />}
          </div>
        </main>
      </div>

    </div>
  );
}
