interface FormulaVar {
  symbol: string;
  definition: string;
}

interface FormulaBlock {
  id: string;
  indicador: string;
  cor: string;
  formula: string;
  descricao: string;
  variaveis: FormulaVar[];
}

const FORMULAS: FormulaBlock[] = [
  {
    id: "inadimplencia",
    indicador: "Taxa de Inadimplência",
    cor: "bg-red-500",
    formula: "TI = (P_atrasadas / P_total) × 100",
    descricao: "Percentual de parcelas com data de vencimento ultrapassada e pagamento_em_dia = false sobre o total de parcelas na carteira.",
    variaveis: [
      { symbol: "P_atrasadas", definition: "parcelas com dias_atraso > 0 (pagamento_em_dia = false)" },
      { symbol: "P_total", definition: "total de registros na tabela de pagamentos" },
    ],
  },
  {
    id: "recuperacao",
    indicador: "Taxa de Recuperação",
    cor: "bg-green-500",
    formula: "TR = (C_acordo / C_total) × 100",
    descricao: "Percentual de contratos únicos enviados à assessoria que encerraram com status 'Acordo Firmado' sobre o total de contratos em cobrança.",
    variaveis: [
      { symbol: "C_acordo", definition: "contratos únicos com status_cobranca = 'Acordo Firmado'" },
      { symbol: "C_total", definition: "total de contratos únicos (id_contrato) enviados à assessoria" },
    ],
  },
  {
    id: "atraso",
    indicador: "Atraso Médio",
    cor: "bg-orange-500",
    formula: "AM = (1/n) × Σ dᵢ,   dᵢ > 0",
    descricao: "Média aritmética dos dias de atraso somente para parcelas efetivamente atrasadas. Parcelas em dia (dias_atraso ≤ 0) são excluídas do cálculo.",
    variaveis: [
      { symbol: "dᵢ", definition: "dias_atraso da parcela i (apenas registros com dᵢ > 0)" },
      { symbol: "n", definition: "número de parcelas com dᵢ > 0" },
    ],
  },
  {
    id: "risco",
    indicador: "Score de Risco Composto Regional",
    cor: "bg-indigo-500",
    formula: "SRC = 0,35·NI + 0,30·NR_inv + 0,20·NJ + 0,15·NA",
    descricao: "Score sintético de risco por região normalizado em [0, 100]. Cada componente é normalizado pelo valor máximo da carteira. Recuperação é invertida: menor recuperação = maior risco.",
    variaveis: [
      { symbol: "NI", definition: "(TI_r / max TI) × 100 — Inadimplência normalizada" },
      { symbol: "NR_inv", definition: "(1 − TR_r / 100) × 100 — Recuperação invertida e normalizada" },
      { symbol: "NJ", definition: "(TJ_r / max TJ) × 100 — Judicialização normalizada" },
      { symbol: "NA", definition: "(AM_r / max AM) × 100 — Atraso médio normalizado" },
      { symbol: "TJ_r", definition: "(C_ajuizados_r / C_total_r) × 100 — taxa de judicialização da região r" },
    ],
  },
  {
    id: "tendencia",
    indicador: "Tendência Temporal (Regressão Linear)",
    cor: "bg-slate-500",
    formula: "ŷₜ = α + β·t,   β = [Σ(t−t̄)(y−ȳ)] / Σ(t−t̄)²",
    descricao: "Regressão linear simples por mínimos quadrados ordinários (MQO) sobre a série mensal de cada indicador. O slope β indica a variação média por período (mês). R² mede o ajuste linear.",
    variaveis: [
      { symbol: "β (slope)", definition: "variação estimada do indicador por mês (p.p./mês ou dias/mês)" },
      { symbol: "α (intercept)", definition: "valor estimado no período t = 0 (origem temporal)" },
      { symbol: "t", definition: "índice temporal (0, 1, 2, … n−1 meses)" },
      { symbol: "R²", definition: "1 − SS_res/SS_tot — coeficiente de determinação (ajuste linear)" },
    ],
  },
];

function FormulaCard({ block }: { block: FormulaBlock }) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 transition-colors">
      <div className="flex items-center gap-2.5">
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${block.cor}`} />
        <h4 className="m-0 text-slate-800 dark:text-slate-100 text-sm font-semibold">{block.indicador}</h4>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg px-4 py-3 font-mono text-sm text-slate-700 dark:text-slate-200 tracking-wide overflow-x-auto">
        {block.formula}
      </div>

      <p className="m-0 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{block.descricao}</p>

      <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-700/40 pt-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Variáveis</span>
        {block.variaveis.map(v => (
          <div key={v.symbol} className="flex gap-2 text-xs">
            <code className="shrink-0 font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded text-[11px]">
              {v.symbol}
            </code>
            <span className="text-slate-500 dark:text-slate-400 leading-relaxed self-center">{v.definition}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FormulasIndicadores() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 flex flex-col gap-4 transition-colors">
      <div className="flex flex-col gap-1">
        <h3 className="m-0 text-slate-900 dark:text-slate-100 text-sm font-semibold">Documentação das Fórmulas</h3>
        <p className="m-0 text-xs text-slate-400 dark:text-slate-500">
          Definições matemáticas formais de todos os indicadores calculados neste módulo.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {FORMULAS.map(f => <FormulaCard key={f.id} block={f} />)}
      </div>
    </div>
  );
}
