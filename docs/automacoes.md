# Automações — CreditGuard

**Versão:** 1.0 | **Data:** 2026-06-03

---

## Automações Presentes no Sistema

O CreditGuard não possui agendamento ou automação temporal (sem cron jobs, sem webhooks, sem streaming). Todas as operações são acionadas por requisições HTTP explícitas. As automações existentes são **cálculos e derivações automáticas** dentro do pipeline e da camada analítica.

---

## 1. Pipeline ETL (acionado via `GET /prepare-data`)

Ao chamar este endpoint, as seguintes transformações são executadas automaticamente:

| Etapa | O que acontece automaticamente |
|---|---|
| Normalização de colunas | Nomes convertidos para lowercase + snake_case em ambas as fontes |
| Deduplicação | `drop_duplicates()` em `fluxo_pagamentos` e `cobranca_assessorias` |
| Parse de datas | `data_vencimento`, `data_pagamento`, `data_envio_assessoria` → datetime |
| Normalização regional | Texto livre → valor canônico (Norte/Nordeste/Sudeste/Sul/Centro-Oeste) |
| Conversão monetária | `valor_inadimplente_inicial` BRL com formatação → float |
| Imputação de risco | `score_interno_risco` nulos → preenchidos com mediana da coluna |
| Feature engineering | Derivação automática de `dias_atraso`, `pagamento_em_dia`, `percentual_pago` |
| JOIN | LEFT JOIN automático de pagamentos ← cobrança por `id_contrato` |
| Preenchimento de nulos pós-join | `fillna("")` em todos os campos sem match |
| Exportação | CSV gerado automaticamente em `data/processed/unified_dataset.csv` |

A operação é **idempotente**: executar múltiplas vezes produz o mesmo resultado, sobrescrevendo o CSV anterior.

---

## 2. Cache em Memória (automático, acionado na primeira chamada analítica)

```python
# data_service.py — singleton automático
_cache = None

def load_data():
    global _cache
    if _cache is not None:
        return _cache          # ← sem I/O
    df = pd.read_csv(...)
    # parse de tipos
    _cache = df
    return df
```

- Primeira requisição analítica após inicialização: lê CSV do disco e popula cache.
- Requisições subsequentes: retornam o DataFrame em memória sem I/O.
- O processo é transparente — nenhum endpoint precisa gerenciar o cache.

---

## 3. Derivação Automática de Indicadores Analíticos

Cada endpoint calcula seus indicadores no momento da chamada, derivados do DataFrame em cache:

| Indicador | Automação de cálculo |
|---|---|
| Taxa de Inadimplência | `(dias_atraso > 0).sum() / len(df) * 100` + segmentações por mês/região/score/forma de pagamento |
| Taxa de Recuperação | `(status_cobranca == "Acordo Firmado").nunique() / total_contratos * 100` |
| Atraso Médio | `mean(dias_atraso)` com percentis P25/P50/P75/P90/P95 calculados automaticamente |
| Tendência Temporal | Regressão OLS (`numpy.polyfit`) calculada sobre série mensal — slope, R², direção e variação total derivados automaticamente |
| Score de Risco Composto | Normalização 0–100 + ponderação automática: inadimplência 40%, recuperação invertida 30%, judicialização 20%, atraso 10% |
| Score de Saúde da Carteira | `(100 - taxa_inadimplencia) * 0.5 + taxa_recuperacao * 0.5` |
| Score de Eficiência Assessoria | `taxa_recuperacao * (1 - taxa_judicializacao / 100)` |
| Score Desempenho Operacional | `taxa_recuperacao * (1 - taxa_ajuizado / 100)` |
| Classificação de Risco Regional | Automática pelo score composto: ≥ 67 → Alto, 34–66 → Médio, ≤ 33 → Baixo |
| Classificação de Saúde | Automática: ≥ 75 → Saudável, 55–74 → Atenção, < 55 → Crítico |

---

## 4. Validação Automática de KPIs (`/analysis/dashboard-final`)

O endpoint `dashboard-final` aplica thresholds predefinidos automaticamente a cada KPI:

| KPI | OK | ALERTA | CRÍTICO |
|---|---|---|---|
| Taxa de Inadimplência | < 20% | 20–29% | ≥ 30% |
| Taxa de Recuperação | ≥ 50% | 30–49% | < 30% |
| Atraso Médio | ≤ 30 dias | 31–60 dias | > 60 dias |
| Risco Regional | 0 regiões críticas | 1–2 regiões | ≥ 3 regiões |
| Tendência Temporal | Inadimplência caindo ou recuperação subindo | — | Ambas desfavoráveis |

Status geral calculado automaticamente com contagem de KPIs por nível.

---

## 5. Geração Automática de Alertas Executivos

No endpoint `/analysis/visao-diretoria`, alertas são gerados com base na direção das tendências (slope da regressão OLS):

- Slope positivo em inadimplência → alerta gerado
- Slope negativo em recuperação → alerta gerado
- Score de saúde < 55 → alerta crítico gerado

---

## O que NÃO está automatizado

| Capacidade | Status |
|---|---|
| Recarga automática do dataset sem reiniciar o processo | Não implementado |
| Agendamento do ETL (cron) | Fora do escopo |
| Alertas por e-mail/SMS/push | Fora do escopo |
| Integração em tempo real com core banking | Fora do escopo |
| Invalidação de cache após novo ETL | Não implementado (requer reinício) |
