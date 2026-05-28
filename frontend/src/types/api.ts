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

export interface TaxaInadimplenciaGeral {
  taxa_pct: number;
  total_parcelas: number;
  parcelas_atrasadas: number;
  parcelas_em_dia: number;
  atraso_medio_dias: number;
  variacao_periodo_ppt: number;
}

export interface TaxaMensal {
  mes: string;
  total: number;
  atrasados: number;
  taxa_pct: number;
}

export interface TaxaSegmento {
  total: number;
  atrasados: number;
  taxa_pct: number;
}

export interface TaxaRecuperacaoGeral {
  taxa_pct: number;
  total_contratos: number;
  contratos_recuperados: number;
  variacao_periodo_ppt: number;
  valor_total_inadimplente: number;
  valor_recuperado: number;
  taxa_recuperacao_valor_pct: number;
}

export interface TaxaRecMensal {
  mes: string;
  total: number;
  acordos: number;
  taxa_pct: number;
}

export interface TaxaRecAssessoria {
  assessoria: string;
  total: number;
  acordos: number;
  taxa_pct: number;
  valor_total: number;
  valor_recuperado: number;
}

export interface TaxaRecStatus {
  status: string;
  total: number;
  pct: number;
  valor: number;
  pct_valor: number;
  cor: string;
}

export interface AtrasoMedioGeral {
  media_dias: number;
  mediana_dias: number;
  desvio_padrao: number;
  max_dias: number;
  total_atrasados: number;
  percentis: { p25: number; p50: number; p75: number; p90: number; p95: number };
}

export interface AtrasoFaixa {
  faixa: string;
  count: number;
  pct: number;
}

export interface AtrasoMedioMensal {
  mes: string;
  total: number;
  media_dias: number;
}

export interface AtrasoMedio {
  indicador_geral: AtrasoMedioGeral;
  faixas_atraso: AtrasoFaixa[];
  evolucao_mensal: AtrasoMedioMensal[];
  por_regiao: Array<{ regiao: string; total: number; media_dias: number; mediana_dias: number }>;
  por_faixa_risco: Array<{ faixa: string; total: number; media_dias: number }>;
  por_forma_pagamento: Array<{ forma: string; total: number; media_dias: number }>;
  insights: Insight[];
}

export interface TaxaRecuperacao {
  indicador_geral: TaxaRecuperacaoGeral;
  evolucao_mensal: TaxaRecMensal[];
  por_regiao: Array<{ regiao: string; total: number; acordos: number; taxa_pct: number }>;
  por_faixa_risco: Array<{ faixa: string; total: number; acordos: number; taxa_pct: number }>;
  por_assessoria: TaxaRecAssessoria[];
  por_status: TaxaRecStatus[];
  insights: Insight[];
}

export interface TaxaInadimplencia {
  indicador_geral: TaxaInadimplenciaGeral;
  evolucao_mensal: TaxaMensal[];
  por_regiao: Array<TaxaSegmento & { regiao: string }>;
  por_faixa_risco: Array<TaxaSegmento & { faixa: string }>;
  por_forma_pagamento: Array<TaxaSegmento & { forma: string }>;
  por_contemplado: Array<TaxaSegmento & { contemplado: string }>;
  insights: Insight[];
}

export interface StatusCobrancas {
  visao_geral: StatusVisaoGeral[];
  por_assessoria: StatusAssessoria[];
  por_regiao: StatusRegiao[];
  insights: Insight[];
}
