# Integrações — CreditGuard

**Versão:** 1.0 | **Data:** 2026-06-03

---

## Visão Geral

O CreditGuard não possui integrações com sistemas externos em tempo real. Todas as integrações são baseadas em **arquivo estático** (ingestão batch) ou em **chamadas HTTP internas** entre os contêineres.

```
[Sistemas externos]          [CreditGuard]
    Excel / CSV    ──────►   data/raw/        (ingestão manual)
                             ETL Pipeline
                             unified_dataset.csv
                                   │
                             Backend API
                                   │
                             Frontend SPA
```

---

## 1. Integração Frontend ↔ Backend

**Tipo:** HTTP/JSON via proxy nginx  
**Protocolo:** HTTP 1.1  
**Autenticação:** Nenhuma  

### Mapeamento de Rotas

| Frontend chama | nginx intercepta | Backend recebe |
|---|---|---|
| `/_/backend/analysis/<endpoint>` | strip `/_/backend` | `/analysis/<endpoint>` |
| `/prepare-data` | proxy direto | `/prepare-data` |

### Endpoints Expostos

**Base URL frontend:** `/_/backend/analysis`

| Método | Rota | Função backend |
|---|---|---|
| GET | `/kpis` | `get_kpis()` |
| GET | `/tendencia` | `get_tendencia()` |
| GET | `/distribuicao-atrasos` | `get_distribuicao_atrasos()` |
| GET | `/comportamento-pagamentos` | `get_comportamento_pagamentos()` |
| GET | `/distribuicao-regional` | `get_distribuicao_regional()` |
| GET | `/status-cobrancas` | `get_status_cobrancas()` |
| GET | `/taxa-inadimplencia` | `get_taxa_inadimplencia()` |
| GET | `/taxa-recuperacao` | `get_taxa_recuperacao()` |
| GET | `/atraso-medio` | `get_atraso_medio()` |
| GET | `/risco-regional-estrategico` | `get_risco_regional_estrategico()` |
| GET | `/tendencia-temporal` | `get_tendencia_temporal()` |
| GET | `/padroes-insights` | `get_padroes_insights()` |
| GET | `/visao-diretoria` | `get_visao_diretoria()` |
| GET | `/visao-financeira` | `get_visao_financeira()` |
| GET | `/operacao-cobranca` | `get_operacao_cobranca()` |
| GET | `/dashboard-final` | `get_dashboard_final()` |
| GET | `/estatisticas` | `get_estatisticas()` |
| GET | `/risco-regional` | `get_risco_regional()` |
| GET | `/inadimplencia` | `get_inadimplencia()` |
| GET | `/recuperacao` | `get_recuperacao()` |

**ETL:**

| Método | Rota | Função backend |
|---|---|---|
| GET | `/prepare-data` | `prepare_service.prepare_dataset()` |

### Contrato de Resposta

Todas as respostas bem-sucedidas:
- `Content-Type: application/json`
- `HTTP 200`
- Payload: objeto JSON (estrutura varia por endpoint — ver `frontend/src/types/api.ts`)

Respostas de erro:
- `HTTP 500` + `{ "error": "<mensagem descritiva>" }`

---

## 2. Integração com Fontes de Dados (Batch / Arquivo)

**Tipo:** Ingestão manual de arquivos  
**Frequência:** Sob demanda (antes de cada ciclo de análise)

| Arquivo fonte | Formato | Localização esperada |
|---|---|---|
| Fluxo de pagamentos | Excel (.xlsx) | `backend/app/data/raw/fluxo_pagamentos.xlsx` |
| Cobrança por assessorias | CSV | `backend/app/data/raw/cobranca_assessorias.csv` |

### Requisitos de Formato

**`fluxo_pagamentos.xlsx`** — colunas esperadas (case-insensitive):

| Coluna | Tipo esperado |
|---|---|
| id_pagamento | texto |
| id_contrato | texto |
| numero_parcela | inteiro |
| data_vencimento | data (parseável por pandas) |
| data_pagamento | data (parseável por pandas) |
| valor_parcela | numérico |
| valor_pago | numérico |
| forma_pagamento | texto |
| indicador_contemplado | Sim / Não |

**`cobranca_assessorias.csv`** — colunas esperadas:

| Coluna | Tipo esperado |
|---|---|
| id_contrato | texto |
| nome_assessoria | texto |
| data_envio_assessoria | data |
| dias_em_atraso_inicial | inteiro (-999 para sem info) |
| valor_inadimplente_inicial | numérico (aceita formato BRL: "R$ 1.234,56") |
| status_cobranca | Acordo Firmado / Em Aberto / Insucesso / Ajuizado |
| score_interno_risco | float 1–100 (nulos imputados com mediana) |
| regiao_cliente | texto livre (normalizado pelo ETL) |

### Tolerâncias do ETL

| Problema | Tratamento |
|---|---|
| Nomes de coluna com espaços/maiúsculas | Normalizados automaticamente |
| Duplicatas | Removidas via `drop_duplicates()` |
| Valor monetário BRL formatado | Parseado por `convert_currency()` |
| Região com variação de capitalização | Mapeada para valor canônico |
| Score de risco nulo | Substituído pela mediana |
| Contratos sem registro de cobrança | Mantidos (LEFT JOIN) com campos de cobrança vazios |

---

## 3. Integração de Rede Docker Interna

Os serviços se comunicam via rede virtual criada pelo Docker Compose:

| De | Para | Protocolo | Porta |
|---|---|---|---|
| nginx (frontend) | backend | HTTP | 5000 |
| Host | nginx (frontend) | HTTP | 80 |

Backend **não expõe porta ao host** — acessível apenas via proxy nginx.

---

## Integrações Fora do Escopo

| Integração | Motivo da exclusão |
|---|---|
| Core banking (tempo real) | Fora do escopo definido |
| APIs de bureau de crédito | Fora do escopo |
| E-mail / SMS / push notifications | Fora do escopo |
| Banco de dados relacional | Sistema opera sobre CSV em memória |
| Autenticação externa (OAuth, SSO) | Fora do escopo |
| BI tools (Power BI, Tableau) | Não integrado — dados disponíveis via API REST |
