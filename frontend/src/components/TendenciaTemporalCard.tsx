import type { TendenciaMetrica } from "../types/api";
import ChartCard from "./ChartCard";

interface MetricaTendencia {
  nome: string;
  tendencia: TendenciaMetrica;
  cor: string;
  sufixo: string;
  melhorCaindo: boolean;
}

const DIRECAO_ICON: Record<string, string> = {
  subindo: "↑",
  caindo: "↓",
  estável: "→",
  insuficiente: "—",
};

function sinalStyle(direcao: string, melhorCaindo: boolean) {
  if (direcao === "estável" || direcao === "insuficiente") return "text-slate-500 dark:text-slate-400";
  const ehBom = melhorCaindo ? direcao === "caindo" : direcao === "subindo";
  return ehBom ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400";
}

function ajusteColor(ajuste: string) {
  if (ajuste === "forte") return "text-green-600 dark:text-green-400";
  if (ajuste === "fraco") return "text-slate-400 dark:text-slate-500";
  return "text-amber-500 dark:text-amber-400";
}

function MetricaCard({ nome, tendencia: t, cor, sufixo, melhorCaindo }: MetricaTendencia) {
  const icon = DIRECAO_ICON[t.direcao] ?? "—";
  const iconStyle = sinalStyle(t.direcao, melhorCaindo);
  const slopeStr = t.slope >= 0 ? `+${t.slope.toFixed(3)}` : t.slope.toFixed(3);
  const varStr = t.variacao_total >= 0 ? `+${t.variacao_total.toFixed(2)}` : t.variacao_total.toFixed(2);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500">{nome}</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-bold leading-none ${iconStyle}`}>{icon}</span>
            <span className={`text-base font-semibold capitalize ${iconStyle}`}>{t.direcao}</span>
          </div>
        </div>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: cor }}
        >
          β
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col gap-0.5 bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2.5">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Slope</span>
          <span className="text-slate-800 dark:text-slate-100 font-mono font-semibold">{slopeStr}{sufixo}/mês</span>
        </div>
        <div className="flex flex-col gap-0.5 bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2.5">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">R²</span>
          <span className={`font-mono font-semibold ${ajusteColor(t.ajuste)}`}>{t.r2.toFixed(3)}</span>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 capitalize">ajuste {t.ajuste}</span>
        </div>
        <div className="flex flex-col gap-0.5 bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2.5">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Variação total</span>
          <span className="text-slate-800 dark:text-slate-100 font-mono font-semibold">{varStr}{sufixo}</span>
        </div>
        <div className="flex flex-col gap-0.5 bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2.5">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Período</span>
          <span className="text-slate-800 dark:text-slate-100 font-mono font-semibold">{t.n_periodos} meses</span>
          <span className="text-[9px] text-slate-400 dark:text-slate-500">{t.valor_inicial.toFixed(1)} → {t.valor_final.toFixed(1)}{sufixo}</span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  inadimplencia: TendenciaMetrica;
  recuperacao: TendenciaMetrica;
  atraso_medio: TendenciaMetrica;
}

export default function TendenciaTemporalCard({ inadimplencia, recuperacao, atraso_medio }: Props) {
  const metricas: MetricaTendencia[] = [
    { nome: "Inadimplência", tendencia: inadimplencia, cor: "#e32551", sufixo: "%", melhorCaindo: true },
    { nome: "Recuperação",   tendencia: recuperacao,   cor: "#22c55e", sufixo: "%", melhorCaindo: false },
    { nome: "Atraso Médio",  tendencia: atraso_medio,  cor: "#f07c19", sufixo: " d", melhorCaindo: true },
  ];

  return (
    <ChartCard
      title="Regressão Linear — Tendência Temporal"
      subtitle="Slope (β) estimado por mínimos quadrados ordinários sobre a série mensal de cada indicador"
    >
      <div className="grid grid-cols-3 gap-3 pt-1">
        {metricas.map(m => <MetricaCard key={m.nome} {...m} />)}
      </div>
    </ChartCard>
  );
}
