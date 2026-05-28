import type { VisaoFinanceira } from "../types/api";

const fmtBRL = (v: number) =>
  v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toFixed(2).replace(".", ",")}M`
    : `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const STATUS_COLOR: Record<string, string> = {
  "Acordo Firmado": "#22c55e",
  "Em Aberto":      "#f97316",
  "Insucesso":      "#ef4444",
  "Ajuizado":       "#a855f7",
};

interface Props {
  data: VisaoFinanceira["valor_inadimplente"];
}

export default function FinanceiroValorHero({ data }: Props) {
  const totalBar = data.total;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">

      {/* Main metric */}
      <div className="px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex-1">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Valor Total Inadimplente
          </p>
          <div className="flex items-end gap-4">
            <span className="text-5xl font-black text-red-500 leading-none tracking-tight">
              {fmtBRL(data.total)}
            </span>
          </div>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
            <span className="font-semibold text-green-600 dark:text-green-400">{fmtBRL(data.valor_recuperado)}</span> recuperado ·{" "}
            <span className="font-semibold text-orange-500">{fmtBRL(data.valor_em_aberto)}</span> ainda em aberto
          </p>
          <p className="mt-0.5 text-slate-400 dark:text-slate-500 text-sm">
            Taxa de recuperação financeira:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{data.taxa_recuperacao_valor_pct}%</span>
          </p>
        </div>

        {/* Summary chips */}
        <div className="grid grid-cols-2 gap-3 flex-shrink-0">
          {[
            { label: "Total inadimplente", value: fmtBRL(data.total),             color: "text-red-500"    },
            { label: "Recuperado",         value: fmtBRL(data.valor_recuperado),   color: "text-green-500"  },
            { label: "Em aberto",          value: fmtBRL(data.valor_em_aberto),    color: "text-orange-500" },
            { label: "Taxa recuperação",   value: `${data.taxa_recuperacao_valor_pct}%`, color: "text-blue-500" },
          ].map(c => (
            <div key={c.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 text-center border border-slate-100 dark:border-slate-700">
              <div className={`text-base font-black ${c.color}`}>{c.value}</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Por status */}
      <div className="px-8 py-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
          Distribuição por Status de Cobrança
        </p>
        <div className="flex flex-col gap-3">
          {data.por_status.map(s => {
            const color = STATUS_COLOR[s.status] ?? "#94a3b8";
            const pct = (s.valor / totalBar) * 100;
            return (
              <div key={s.status} className="flex items-center gap-3">
                <div className="w-28 text-[12px] text-slate-600 dark:text-slate-300 text-right flex-shrink-0 font-medium">
                  {s.status}
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                <div className="w-40 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                  {fmtBRL(s.valor)} · {s.pct_valor}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
