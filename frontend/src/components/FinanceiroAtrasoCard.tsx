import type { VisaoFinanceira } from "../types/api";

const fmtNum = (v: number) => Number(v).toLocaleString("pt-BR");

interface Props {
  data: VisaoFinanceira["atraso_medio"];
}

export default function FinanceiroAtrasoCard({ data }: Props) {
  const maxMedia = Math.max(...data.por_regiao.map(r => r.media_dias), 1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">

      {/* Main metric */}
      <div className="px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex-1">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Atraso Médio — Geral
          </p>
          <div className="flex items-end gap-4">
            <span className="text-6xl font-black text-orange-500 leading-none tracking-tight">
              {data.media_dias}
            </span>
            <span className="text-2xl font-bold text-orange-400 mb-2">dias</span>
          </div>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
            Mediana de{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{data.mediana_dias} dias</span>
            {" "}· máximo de{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{data.max_dias} dias</span>
          </p>
          <p className="mt-0.5 text-slate-400 dark:text-slate-500 text-sm">
            Calculado sobre{" "}
            <span className="font-semibold text-slate-600 dark:text-slate-300">{fmtNum(data.total_atrasados)}</span>{" "}
            parcelas em atraso
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 flex-shrink-0">
          {[
            { label: "Média",   value: `${data.media_dias}d`,   color: "text-orange-500" },
            { label: "Mediana", value: `${data.mediana_dias}d`, color: "text-amber-500"  },
            { label: "Máximo",  value: `${data.max_dias}d`,     color: "text-red-500"    },
          ].map(c => (
            <div key={c.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 text-center border border-slate-100 dark:border-slate-700">
              <div className={`text-xl font-black ${c.color}`}>{c.value}</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Por região */}
      <div className="px-8 py-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
          Atraso Médio por Região
        </p>
        <div className="flex flex-col gap-3">
          {data.por_regiao.map(r => {
            const pct = (r.media_dias / maxMedia) * 100;
            const color = pct > 80 ? "#e32551" : pct > 60 ? "#f07c19" : "#ffc219";
            return (
              <div key={r.regiao} className="flex items-center gap-3">
                <div className="w-20 text-[12px] text-slate-600 dark:text-slate-300 text-right flex-shrink-0 font-medium">
                  {r.regiao}
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                <div className="w-48 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                  {r.media_dias}d média · {r.mediana_dias}d mediana · {fmtNum(r.total)} casos
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
