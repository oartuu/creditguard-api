export interface Kpis {
  taxa_inadimplencia_pct: number;
  atraso_medio_dias: number;
  taxa_recuperacao_pct: number;
  total_pagamentos: number;
  pagamentos_atrasados: number;
  total_contratos_cobranca: number;
  acordos_firmados: number;
  valor_inadimplente_total: number;
  valor_recuperado_estimado: number;
}

export interface TendenciaMes {
  mes: string;
  total?: number;
  atrasados?: number;
  taxa_inadimplencia_pct?: number;
  total_cobranca?: number;
  acordos?: number;
  taxa_recuperacao_pct?: number;
}

export interface Tendencia {
  inadimplencia_por_mes: TendenciaMes[];
  recuperacao_por_mes: TendenciaMes[];
}

export interface FaixaAtraso {
  faixa: string;
  count: number;
  pct_atrasados: number;
  pct_total: number;
}

export interface Insight {
  insight: string;
  detalhe: string;
}

export interface DistribuicaoAtrasos {
  resumo: Record<string, number | Record<string, number>>;
  faixas_atraso: FaixaAtraso[];
  correlacoes: { interpretacao: string };
  insights: Insight[];
}

export interface TipoPagamento {
  count: number;
  pct: number;
}

export interface ComportamentoContemplado {
  contemplado: string;
  total: number;
  inadimplentes: number;
  taxa_inadimplencia_pct: number;
  valor_medio_parcela: number;
  valor_medio_pago: number;
}

export interface ComportamentoForma {
  forma_pagamento: string;
  total: number;
  inadimplentes: number;
  taxa_inadimplencia_pct: number;
}

export interface ComportamentoPagamentos {
  tipos_pagamento: Record<string, TipoPagamento>;
  por_indicador_contemplado: ComportamentoContemplado[];
  por_forma_pagamento: ComportamentoForma[];
  insights: Insight[];
}

export interface RankingItem {
  regiao: string;
  taxa_inadimplencia_pct?: number;
  valor_total_inadimplente?: number;
  pct_valor_carteira?: number;
  taxa_recuperacao_pct?: number;
  taxa_judicializacao_pct?: number;
}

export interface DistribuicaoRegional {
  por_regiao: Record<string, unknown>[];
  rankings: {
    inadimplencia: RankingItem[];
    valor_inadimplente: RankingItem[];
    recuperacao: RankingItem[];
  };
  insights: Insight[];
}

export interface StatusVisaoGeral {
  status: string;
  total_contratos: number;
  pct_contratos: number;
  valor_total: number;
  pct_valor: number;
}

export interface StatusAssessoria {
  assessoria: string;
  total: number;
  acordo_firmado: number;
  pct_acordo_firmado: number;
  em_aberto: number;
  pct_em_aberto: number;
  insucesso: number;
  pct_insucesso: number;
  ajuizado: number;
  pct_ajuizado: number;
}

export interface StatusRegiao {
  regiao: string;
  total: number;
  acordo_firmado: number;
  pct_acordo_firmado: number;
  em_aberto: number;
  pct_em_aberto: number;
  insucesso: number;
  pct_insucesso: number;
  ajuizado: number;
  pct_ajuizado: number;
}

export interface StatusCobrancas {
  visao_geral: StatusVisaoGeral[];
  por_assessoria: StatusAssessoria[];
  por_regiao: StatusRegiao[];
  insights: Insight[];
}
