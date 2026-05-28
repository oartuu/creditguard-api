import type { ReactNode } from "react";

const MODULES = [
  {
    id: "analise-exploratoria",
    num: "01",
    label: "Análise Exploratória",
    sub: "Dados & Estatísticas",
    available: true,
    icon: <ChartBarIcon />,
  },
  {
    id: "indicadores-estrategicos",
    num: "02",
    label: "Indicadores Estratégicos",
    sub: "Taxa de Inadimplência",
    available: true,
    icon: <ShieldIcon />,
  },
  {
    id: "padroes-insights",
    num: "03",
    label: "Padrões e Insights",
    sub: "Perfis & Recomendações",
    available: true,
    icon: <LightbulbIcon />,
  },
];

function ChartBarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18"/>
      <line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

interface SidebarProps {
  activeModule: string;
  onModuleChange: (id: string) => void;
}

interface ModuleItemProps {
  id: string;
  num: string;
  label: string;
  sub: string;
  available: boolean;
  icon: ReactNode;
  isActive: boolean;
  onClick: () => void;
}

function ModuleItem({ num, label, sub, available, icon, isActive, onClick }: ModuleItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={!available}
      className={[
        "w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-all group",
        isActive
          ? "bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400"
          : available
            ? "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
            : "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60",
      ].join(" ")}
    >
      <div className={[
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
        isActive
          ? "bg-blue-500 text-white"
          : available
            ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-600"
            : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600",
      ].join(" ")}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-bold tracking-widest opacity-60">{num}</span>
          {!available && <LockIcon />}
        </div>
        <div className="text-[13px] font-semibold leading-tight truncate">{label}</div>
        <div className="text-[11px] opacity-60 mt-0.5">{sub}</div>
      </div>
    </button>
  );
}

export default function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <aside className="w-[220px] flex-shrink-0 border-r border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 flex flex-col transition-colors">
      <div className="px-3 pt-5 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400 dark:text-slate-500 px-1">
          Módulos
        </span>
      </div>

      <nav className="flex flex-col gap-1 px-3 pb-4">
        {MODULES.map(m => (
          <ModuleItem
            key={m.id}
            {...m}
            isActive={activeModule === m.id}
            onClick={() => m.available && onModuleChange(m.id)}
          />
        ))}
      </nav>
    </aside>
  );
}
