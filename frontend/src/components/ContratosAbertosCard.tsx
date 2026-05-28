import type { OperacaoCobranca } from "../types/api";

const fmtBRL = (v: number) =>
  v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toFixed(2).replace(".", ",")}M`
    : `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

interface Props {
  data: OperacaoCobranca["contratos_aberto"];
  totalContratos: number;
  valorCarteira: number;
}

export default function ContratosAbertosCard({ data, totalContratos, valorCarteira }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">

      {/* Hero metric */}
      <div className="px-8 py-7 border-b border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="flex-1">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Contratos em Aberto
          </p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-orange-500 leading-none">
              {data.total.toLocaleString("pt-BR")}
            </span>
            <span className="text-lg font-bold text-orange-400 mb-1">
              ({data.pct_total}%)
            </span>
          </div>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
            de {totalContratos.toLocaleString("pt-BR")} contratos em cobrança
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 flex-shrink-0">
          {[
            { label: "Valor em aberto", value: fmtBRL(data.valor_total), color: "text-orange-500" },
            { label: "% da carteira", value: `${data.pct_valor}%`, color: "text-orange-400" },
            { label: "Total carteira", value: fmtBRL(valorCarteira), color: "text-slate-700 dark:text-slate-200" },
            { label: "Contratos abertos", value: data.total.toLocaleString("pt-BR"), color: "text-orange-500" },
          ].map(c => (
            <div key={c.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 text-center border border-slate-100 dark:border-slate-700">
              <div className={`text-base font-black ${c.color}`}>{c.value}</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Por região */}
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700/60">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
          Distribuição por Região
        </p>
        <div className="flex flex-col gap-3">
          {data.por_regiao.map(r => {
            const pct = data.valor_total > 0 ? (r.valor_total / data.valor_total) * 100 : 0;
            return (
              <div key={r.regiao} className="flex items-center gap-3">
                <div className="w-24 text-[12px] text-slate-600 dark:text-slate-300 text-right flex-shrink-0 font-medium truncate">
                  {r.regiao}
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-44 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                  {r.total} contratos · {fmtBRL(r.valor_total)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Por assessoria */}
      <div className="px-8 py-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
          Oportunidade por Assessoria
        </p>
        <div className="flex flex-col gap-2">
          {data.por_assessoria.map((a, i) => (
            <div key={a.assessoria} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/60">
              <span className="w-5 text-[11px] font-bold text-slate-400 dark:text-slate-500 text-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">
                {a.assessoria}
              </span>
              <span className="text-[12px] font-bold text-orange-500 flex-shrink-0">
                {a.total} · {fmtBRL(a.valor_total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
