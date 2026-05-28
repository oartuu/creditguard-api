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

// ── Módulo 03 – Padrões e Insights ──────────────────────────────────────────

export interface CrossScoreContemplado {
  score: string;
  contemplado: string;
  total: number;
  atrasados: number;
  taxa_pct: number;
}

export interface CrossScoreForma {
  score: string;
  forma_pagamento: string;
  total: number;
  atrasados: number;
  taxa_pct: number;
}

export interface TopCombinacao {
  score: string;
  contemplado: string;
  forma_pagamento: string;
  total: number;
  atrasados: number;
  taxa_pct: number;
}

export interface RegiaoCritica {
  regiao: string;
  taxa_inadimplencia: number;
  taxa_recuperacao: number;
  taxa_judicializacao: number;
  taxa_em_aberto: number;
  valor_inadimplente: number;
  atraso_medio_dias: number;
  score_criticidade: number;
  urgencia: "Atenção Crítica" | "Monitoramento Ativo" | "Referência";
  total_parcelas: number;
  total_contratos: number;
}

export interface EficienciaAssessoria {
  assessoria: string;
  total_contratos: number;
  acordos: number;
  em_aberto: number;
  insucesso: number;
  ajuizado: number;
  taxa_recuperacao: number;
  taxa_em_aberto: number;
  taxa_insucesso: number;
  taxa_judicializacao: number;
  valor_total: number;
  valor_recuperado: number;
  valor_perdido: number;
  valor_em_aberto: number;
  score_eficiencia: number;
}

export interface InsightConsolidado {
  categoria: string;
  prioridade: "alta" | "media" | "baixa";
  insight: string;
  detalhe: string;
}

export interface Recomendacao {
  prioridade: "Crítica" | "Alta" | "Média";
  area: string;
  titulo: string;
  descricao: string;
  impacto_esperado: string;
  prazo: string;
}

export interface PadroesInsights {
  perfis_alto_risco: {
    cross_score_contemplado: CrossScoreContemplado[];
    cross_score_forma: CrossScoreForma[];
    top_combinacoes: TopCombinacao[];
  };
  regioes_criticas: RegiaoCritica[];
  eficiencia_recuperacao: EficienciaAssessoria[];
  padroes_temporais: {
    sazonalidade_mensal: Array<{ mes_num: number; mes_nome: string; total: number; atrasados: number; taxa_pct: number }>;
    por_dia_semana: Array<{ dia: string; total: number; atrasados: number; taxa_pct: number }>;
    evolucao_mom: Array<{ mes: string; total: number; atrasados: number; taxa_pct: number; mom_ppt: number | null }>;
    pico: { mes: string; taxa_pct: number };
    vale: { mes: string; taxa_pct: number };
    amplitude_ppt: number;
  };
  insights_consolidados: InsightConsolidado[];
  recomendacoes: Recomendacao[];
}

// ── Módulo 02 – Risco Regional / Tendência (continuação) ───────────────────
export interface RiscoRegionalItem {
  regiao: string;
  taxa_inadimplencia: number;
  taxa_recuperacao: number;
  taxa_judicializacao: number;
  atraso_medio: number;
  total_parcelas: number;
  total_contratos: number;
  score_risco_composto: number;
  scores_componentes: {
    inadimplencia: number;
    recuperacao_inv: number;
    judicializacao: number;
    atraso: number;
  };
  nivel_risco: "Alto" | "Médio" | "Baixo";
}

export interface RiscoRegionalEstratégico {
  por_regiao: RiscoRegionalItem[];
  pesos: { inadimplencia: number; recuperacao: number; judicializacao: number; atraso: number };
  insights: Insight[];
}

export interface TendenciaMetrica {
  slope: number;
  r2: number;
  ajuste: string;
  direcao: "subindo" | "caindo" | "estável" | "insuficiente";
  variacao_total: number;
  n_periodos: number;
  valor_inicial: number;
  valor_final: number;
}

export interface TendenciaTemporal {
  inadimplencia: {
    serie_mensal: Array<{ mes: string; total: number; atrasados: number; taxa_pct: number }>;
    tendencia: TendenciaMetrica;
  };
  recuperacao: {
    serie_mensal: Array<{ mes: string; total: number; acordos: number; taxa_pct: number }>;
    tendencia: TendenciaMetrica;
  };
  atraso_medio: {
    serie_mensal: Array<{ mes: string; total: number; media_dias: number }>;
    tendencia: TendenciaMetrica;
  };
  insights: Insight[];
}
