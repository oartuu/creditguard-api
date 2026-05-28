# CreditGuard — Documento de Engenharia de Requisitos

**Versão:** 1.0  
**Data:** 2026-05-28  
**Projeto:** CreditGuard — Plataforma de Análise de Inadimplência e Recuperação de Crédito

---

## Sumário

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Stakeholders e Atores](#2-stakeholders-e-atores)
3. [Escopo](#3-escopo)
4. [Requisitos Funcionais](#4-requisitos-funcionais)
5. [Requisitos Não-Funcionais](#5-requisitos-não-funcionais)
6. [Regras de Negócio](#6-regras-de-negócio)
7. [Modelo de Dados](#7-modelo-de-dados)
8. [Pipeline de Preparação de Dados](#8-pipeline-de-preparação-de-dados)
9. [Arquitetura do Sistema](#9-arquitetura-do-sistema)
10. [Contrato da API](#10-contrato-da-api)
11. [Módulos do Dashboard](#11-módulos-do-dashboard)
12. [Restrições e Dependências](#12-restrições-e-dependências)
13. [Glossário](#13-glossário)

---

## 1. Visão Geral do Sistema

O **CreditGuard** é uma plataforma web de análise de inadimplência e recuperação de crédito. O sistema ingere dois conjuntos de dados brutos — fluxo de pagamentos e registros de cobrança por assessoria —, executa um pipeline de preparação para produzir um dataset unificado e expõe análises estruturadas via API REST, consumidas por um dashboard interativo.

O objetivo central é transformar dados operacionais de carteiras de crédito em informação analítica acionável para equipes financeiras, operacionais e executivas.

---

## 2. Stakeholders e Atores

| Ator | Perfil | Interesse principal |
|---|---|---|
| Analista Financeiro | Usuário operacional | Acompanhar indicadores de inadimplência e recuperação |
| Gestor de Cobrança | Usuário operacional | Monitorar desempenho das assessorias e contratos em aberto |
| Diretor Executivo | Usuário estratégico | Visão consolidada de saúde da carteira para decisão |
| Equipe de Dados | Usuário técnico | Manutenção do pipeline e endpoints da API |

---

## 3. Escopo

### 3.1 Dentro do escopo

- Ingestão e preparação de dados de pagamentos e cobrança
- Cálculo de indicadores estratégicos (inadimplência, recuperação, atraso médio, risco regional)
- Análise de padrões, perfis de risco e tendências temporais
- Visualização interativa em dashboard web com 7 módulos analíticos
- API REST com 20 endpoints de análise

### 3.2 Fora do escopo

- Autenticação e controle de acesso de usuários
- Integração em tempo real com sistemas de core banking
- Envio automático de alertas (e-mail, SMS, push)
- Persistência de dados em banco relacional (sistema opera sobre CSV em memória)
- Módulo de simulação ou previsão (machine learning preditivo)

---

## 4. Requisitos Funcionais

### RF-01 — Preparação de Dados

| ID | Descrição |
|---|---|
| RF-01.1 | O sistema deve ler o arquivo `fluxo_pagamentos.xlsx` da pasta `data/raw/` |
| RF-01.2 | O sistema deve ler o arquivo `cobranca_assessorias.csv` da pasta `data/raw/` |
| RF-01.3 | O sistema deve normalizar nomes de colunas (lowercase, sem espaços) |
| RF-01.4 | O sistema deve remover registros duplicados em ambas as fontes |
| RF-01.5 | O sistema deve converter datas para o tipo datetime |
| RF-01.6 | O sistema deve normalizar regiões geográficas para os valores canônicos: Norte, Nordeste, Sudeste, Sul, Centro-Oeste |
| RF-01.7 | O sistema deve converter valores monetários de formato BRL para float |
| RF-01.8 | O sistema deve calcular `dias_atraso` como diferença entre `data_pagamento` e `data_vencimento` |
| RF-01.9 | O sistema deve calcular `pagamento_em_dia` (boolean): `dias_atraso <= 0` |
| RF-01.10 | O sistema deve calcular `percentual_pago` como `valor_pago / valor_parcela` |
| RF-01.11 | O sistema deve preencher valores ausentes de `score_interno_risco` com a mediana da coluna |
| RF-01.12 | O sistema deve unificar os dois datasets via JOIN no campo `id_contrato` (LEFT JOIN: pagamentos ← cobrança) |
| RF-01.13 | O sistema deve exportar o dataset unificado em `data/processed/unified_dataset.csv` |
| RF-01.14 | O endpoint `GET /prepare-data` deve executar o pipeline e retornar o número de linhas e colunas geradas |

---

### RF-02 — Módulo 01: Análise Exploratória dos Dados

| ID | Descrição |
|---|---|
| RF-02.1 | O sistema deve exibir KPIs gerais: taxa de inadimplência, atraso médio, taxa de recuperação, total de pagamentos, acordos firmados, valor inadimplente total e valor recuperado estimado |
| RF-02.2 | O sistema deve exibir a tendência temporal mensal de inadimplência e recuperação |
| RF-02.3 | O sistema deve exibir a distribuição de atrasos por faixas (em dia, 1-30d, 31-60d, 61-90d, 90+d) |
| RF-02.4 | O sistema deve exibir o comportamento de pagamentos por forma de pagamento e por indicador de contemplação |
| RF-02.5 | O sistema deve exibir o status das cobranças (Acordo Firmado, Em Aberto, Insucesso, Ajuizado) em distribuição percentual |
| RF-02.6 | O sistema deve exibir a distribuição regional com ranking de inadimplência e recuperação por região |

---

### RF-03 — Módulo 02: Indicadores Estratégicos

| ID | Descrição |
|---|---|
| RF-03.1 | O sistema deve calcular e exibir a **Taxa de Inadimplência** geral: `parcelas_atrasadas / total_parcelas × 100` |
| RF-03.2 | O sistema deve segmentar a taxa de inadimplência por: mês, região, faixa de score de risco, forma de pagamento e indicador de contemplação |
| RF-03.3 | O sistema deve calcular e exibir a **Taxa de Recuperação** geral: `contratos com Acordo Firmado / total_contratos × 100` |
| RF-03.4 | O sistema deve segmentar a taxa de recuperação por: mês, região, faixa de score de risco e assessoria |
| RF-03.5 | O sistema deve calcular e exibir o **Atraso Médio** em dias para contratos inadimplentes |
| RF-03.6 | O sistema deve exibir percentis (P25, P50, P75, P90, P95) do atraso médio |
| RF-03.7 | O sistema deve segmentar o atraso médio por: mês, região, faixa de score de risco e forma de pagamento |
| RF-03.8 | O sistema deve calcular o **Score de Risco Composto** por região com pesos: inadimplência (40%), recuperação invertida (30%), judicialização (20%), atraso (10%) |
| RF-03.9 | O sistema deve classificar regiões em nível de risco: Alto (score ≥ 67), Médio (34–66), Baixo (≤ 33) |
| RF-03.10 | O sistema deve calcular a **Tendência Temporal** via regressão linear OLS para inadimplência, recuperação e atraso médio |
| RF-03.11 | O sistema deve exibir slope (β), R², direção (subindo/caindo/estável) e variação total de cada tendência |

---

### RF-04 — Módulo 03: Padrões e Insights

| ID | Descrição |
|---|---|
| RF-04.1 | O sistema deve identificar perfis de alto risco pelo cruzamento de score × contemplado × forma de pagamento |
| RF-04.2 | O sistema deve listar as top combinações de perfil com maior taxa de inadimplência |
| RF-04.3 | O sistema deve calcular um score de criticidade por região e classificar em Atenção Crítica, Monitoramento Ativo ou Referência |
| RF-04.4 | O sistema deve calcular um score de eficiência por assessoria: `taxa_recuperacao × (1 - taxa_judicializacao)` |
| RF-04.5 | O sistema deve identificar padrões de sazonalidade mensal e por dia da semana |
| RF-04.6 | O sistema deve gerar insights consolidados com prioridade (alta/média/baixa) |
| RF-04.7 | O sistema deve gerar recomendações acionáveis com prazo estimado e impacto esperado |

---

### RF-05 — Módulo 04: Visão da Diretoria

| ID | Descrição |
|---|---|
| RF-05.1 | O sistema deve calcular e exibir o **Score de Saúde da Carteira**: `(100 - taxa_inadimplencia) × 0.5 + taxa_recuperacao × 0.5` |
| RF-05.2 | O sistema deve classificar a saúde da carteira em: Saudável (≥ 75), Atenção (55–74), Crítico (< 55) |
| RF-05.3 | O sistema deve gerar alertas executivos automáticos com base na direção das tendências |
| RF-05.4 | O sistema deve exibir uma tabela consolidada com valor atual, tendência, variação e avaliação de cada indicador |
| RF-05.5 | O sistema deve exibir gráfico dual de evolução mensal de inadimplência e recuperação |

---

### RF-06 — Módulo 05: Visão Financeira

| ID | Descrição |
|---|---|
| RF-06.1 | O sistema deve exibir o valor total inadimplente, valor recuperado, valor em aberto e taxa de recuperação financeira |
| RF-06.2 | O sistema deve distribuir o valor financeiro por status de cobrança com barras proporcionais |
| RF-06.3 | O sistema deve exibir o atraso médio financeiro por região |
| RF-06.4 | O sistema deve exibir a distribuição regional com valor inadimplente, contratos e taxa de recuperação |
| RF-06.5 | O sistema deve exibir a evolução financeira mensal: valor inadimplente, acordos, valor recuperado e taxa |

---

### RF-07 — Módulo 06: Operação de Cobrança

| ID | Descrição |
|---|---|
| RF-07.1 | O sistema deve exibir o total de contratos em aberto, percentual da carteira e valor financeiro correspondente |
| RF-07.2 | O sistema deve distribuir contratos em aberto por região e por assessoria (oportunidade de recuperação) |
| RF-07.3 | O sistema deve exibir o total de contratos recuperados (Acordo Firmado) com taxa de recuperação e valor |
| RF-07.4 | O sistema deve exibir a evolução mensal da taxa de recuperação em gráfico de área |
| RF-07.5 | O sistema deve exibir a distribuição completa de status de cobrança em gráfico donut e cards de métricas |
| RF-07.6 | O sistema deve exibir a evolução mensal de volume por status em gráfico de barras empilhadas |
| RF-07.7 | O sistema deve calcular e exibir o **Score de Desempenho Operacional** por assessoria: `taxa_recuperacao × (1 - taxa_ajuizado / 100)` |
| RF-07.8 | O sistema deve rankear assessorias por score de desempenho e exibir detalhamento de todos os status |

---

### RF-08 — Módulo 07: Dashboard Final

| ID | Descrição |
|---|---|
| RF-08.1 | O sistema deve validar cada KPI contra thresholds predefinidos e atribuir status: OK, ALERTA ou CRÍTICO |
| RF-08.2 | Thresholds de validação da **Taxa de Inadimplência**: OK < 20%, ALERTA 20–29%, CRÍTICO ≥ 30% |
| RF-08.3 | Thresholds de validação da **Taxa de Recuperação**: OK ≥ 50%, ALERTA 30–49%, CRÍTICO < 30% |
| RF-08.4 | Thresholds de validação do **Atraso Médio**: OK ≤ 30 dias, ALERTA 31–60 dias, CRÍTICO > 60 dias |
| RF-08.5 | Thresholds de validação do **Risco Regional**: OK = 0 regiões críticas, ALERTA = 1–2, CRÍTICO ≥ 3 |
| RF-08.6 | Thresholds de validação da **Tendência Temporal**: OK = inadimplência caindo ou recuperação subindo, CRÍTICO = inadimplência subindo e recuperação caindo |
| RF-08.7 | O sistema deve calcular um status geral de validação com contagem de KPIs por nível |
| RF-08.8 | O sistema deve exibir a revisão consolidada de layout: saúde da carteira, alertas executivos e tabela de indicadores |
| RF-08.9 | O sistema deve gerar material preparado para apresentação: grade de KPIs principais, pontos de força, pontos de atenção, ranking de risco regional e top 3 recomendações priorizadas |

---

## 5. Requisitos Não-Funcionais

### RNF-01 — Desempenho

| ID | Descrição |
|---|---|
| RNF-01.1 | O dataset processado deve ser carregado em memória com cache em processo — leituras subsequentes não releem o arquivo em disco |
| RNF-01.2 | Cada endpoint analítico deve responder em menos de 3 segundos em hardware de desenvolvimento (dataset de 100.000 linhas) |
| RNF-01.3 | O pipeline de preparação (`/prepare-data`) pode levar até 15 segundos — operação executada uma única vez |

### RNF-02 — Disponibilidade e Confiabilidade

| ID | Descrição |
|---|---|
| RNF-02.1 | O backend deve iniciar com erro explícito caso o `unified_dataset.csv` não exista |
| RNF-02.2 | Cada endpoint deve capturar exceções internas e retornar HTTP 500 com mensagem descritiva |
| RNF-02.3 | O frontend deve exibir mensagem de erro amigável quando a API não estiver acessível |

### RNF-03 — Usabilidade

| ID | Descrição |
|---|---|
| RNF-03.1 | O dashboard deve suportar tema claro e escuro com alternância pelo usuário |
| RNF-03.2 | O layout deve ser responsivo para larguras a partir de 768px |
| RNF-03.3 | Enquanto dados carregam, o sistema deve exibir indicador de carregamento por seção |
| RNF-03.4 | Todos os textos, rótulos e mensagens devem estar em português brasileiro |

### RNF-04 — Manutenibilidade

| ID | Descrição |
|---|---|
| RNF-04.1 | A lógica de análise deve estar isolada em `analysis_service.py`, separada das rotas HTTP |
| RNF-04.2 | O carregamento de dados deve estar isolado em `data_service.py` |
| RNF-04.3 | Tipos TypeScript devem estar centralizados em `types/api.ts` |
| RNF-04.4 | Chamadas à API devem estar centralizadas em `services/api.ts` |

### RNF-05 — Segurança

| ID | Descrição |
|---|---|
| RNF-05.1 | O backend deve habilitar CORS para permitir requisições do frontend em `localhost:5173` |
| RNF-05.2 | A API não deve expor caminhos de arquivo internos em respostas de erro |

### RNF-06 — Tecnologia

| ID | Versão mínima |
|---|---|
| Python | 3.10 |
| Node.js | 18 |
| Flask | 3.x |
| React | 19.x |
| TypeScript | 6.x |
| Vite | 8.x |
| Tailwind CSS | 4.x |
| Recharts | 3.x |

---

## 6. Regras de Negócio

| ID | Regra |
|---|---|
| RN-01 | Um pagamento é considerado **inadimplente** quando `dias_atraso > 0` |
| RN-02 | Um pagamento é considerado **em dia** quando `dias_atraso ≤ 0` (inclui pagamentos antecipados) |
| RN-03 | Um contrato é considerado **recuperado** quando seu `status_cobranca = "Acordo Firmado"` |
| RN-04 | Cada linha do dataset representa uma **parcela** (não um contrato); análises de contrato exigem `drop_duplicates("id_contrato")` |
| RN-05 | A **faixa de risco** é definida pelo `score_interno_risco`: Baixo (1–33), Médio (34–66), Alto (67–100) |
| RN-06 | O `score_risco_composto` regional é calculado sobre dados normalizados 0–100 com pesos: inadimplência 40%, recuperação invertida 30%, judicialização 20%, atraso 10% |
| RN-07 | O `score_saude_carteira` é calculado como: `(100 - taxa_inadimplencia) × 0.5 + taxa_recuperacao × 0.5` — escala 0 a 100 |
| RN-08 | O `score_eficiencia_assessoria` é calculado como: `taxa_recuperacao × (1 - taxa_judicializacao / 100)` |
| RN-09 | O `score_desempenho_operacional` (Módulo 06) é calculado como: `taxa_recuperacao × (1 - taxa_ajuizado / 100)` |
| RN-10 | Registros com `dias_em_atraso_inicial = -999` representam contratos sem informação de atraso inicial e devem ser excluídos de análises que utilizem esse campo |
| RN-11 | Nomes de assessoria devem ser normalizados para Title Case antes de qualquer agrupamento |
| RN-12 | A **variação de tendência** é expressa em pontos percentuais (p.p.) — diferença entre o último e o primeiro valor da série mensal |
| RN-13 | A **taxa de recuperação financeira** é calculada sobre contratos únicos: `valor dos contratos com Acordo Firmado / valor total inadimplente` |

---

## 7. Modelo de Dados

### 7.1 Fontes brutas

#### `fluxo_pagamentos.xlsx`

| Campo | Tipo | Descrição |
|---|---|---|
| id_pagamento | string | Identificador único da parcela |
| id_contrato | string | Identificador do contrato (chave de junção) |
| numero_parcela | integer | Número da parcela no contrato |
| data_vencimento | date | Data de vencimento da parcela |
| data_pagamento | date | Data efetiva de pagamento |
| valor_parcela | float | Valor nominal da parcela (R$) |
| valor_pago | float | Valor efetivamente pago (R$) |
| forma_pagamento | string | Meio de pagamento (Boleto, Débito, etc.) |
| indicador_contemplado | string | Se o cliente foi contemplado (Sim/Não) |

#### `cobranca_assessorias.csv`

| Campo | Tipo | Descrição |
|---|---|---|
| id_contrato | string | Identificador do contrato (chave de junção) |
| nome_assessoria | string | Nome da assessoria de cobrança |
| data_envio_assessoria | date | Data de envio para cobrança |
| dias_em_atraso_inicial | integer | Dias em atraso ao entrar em cobrança (-999 = sem info) |
| valor_inadimplente_inicial | float | Valor da dívida enviado à assessoria (R$) |
| status_cobranca | string | Desfecho: Acordo Firmado, Em Aberto, Insucesso, Ajuizado |
| score_interno_risco | float | Score de risco do cliente (1–100) |
| regiao_cliente | string | Região geográfica do cliente |

### 7.2 Dataset processado — `unified_dataset.csv`

Resultado do JOIN LEFT de `fluxo_pagamentos` ← `cobranca_assessorias` por `id_contrato`, acrescido das colunas derivadas:

| Campo derivado | Tipo | Fórmula |
|---|---|---|
| dias_atraso | integer | `data_pagamento - data_vencimento` (dias) |
| pagamento_em_dia | boolean | `dias_atraso <= 0` |
| percentual_pago | float | `valor_pago / valor_parcela` |

**Volume:** ~100.000 linhas · 19 colunas · ~16 MB

---

## 8. Pipeline de Preparação de Dados

```
fluxo_pagamentos.xlsx         cobranca_assessorias.csv
        │                               │
  [read_excel]                    [read_csv]
        │                               │
  normalize_columns()           normalize_columns()
        │                               │
  drop_duplicates()             drop_duplicates()
        │                               │
  parse dates                   parse dates
        │                               │
  calc dias_atraso              normalize_region()
        │                               │
  calc pagamento_em_dia         convert_currency()
        │                               │
  calc percentual_pago          fillna score (mediana)
        │                               │
        └──────── LEFT JOIN ────────────┘
                  on: id_contrato
                        │
                  fillna("")
                        │
               unified_dataset.csv
```

Acionado via `GET /prepare-data`. Operação idempotente.

---

## 9. Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────┐
│                     FRONTEND                        │
│  React 19 + TypeScript + Vite + Tailwind + Recharts │
│                                                     │
│  Dashboard.tsx                                      │
│    ├── Sidebar.tsx (navegação entre módulos)        │
│    ├── Módulo 01 — AnaliseExploratoriaPage          │
│    ├── Módulo 02 — IndicadoresEstrategicosPage      │
│    ├── Módulo 03 — PadroesInsightsPage              │
│    ├── Módulo 04 — VisaoDiretoriaPage               │
│    ├── Módulo 05 — VisaoFinanceiraPage              │
│    ├── Módulo 06 — OperacaoCobrancaPage             │
│    └── Módulo 07 — DashboardFinalPage               │
│                                                     │
│  services/api.ts → axios → http://localhost:5000    │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/JSON
┌─────────────────────▼───────────────────────────────┐
│                     BACKEND                         │
│              Flask + Python 3 + CORS                │
│                                                     │
│  routes/                                            │
│    ├── prepare.py   → /prepare-data                 │
│    └── analysis.py  → /analysis/*                   │
│                                                     │
│  services/                                          │
│    ├── prepare_service.py  (pipeline ETL)           │
│    ├── data_service.py     (load + cache)           │
│    └── analysis_service.py (20 funções analíticas)  │
│                                                     │
│  data/                                              │
│    ├── raw/  (fluxo_pagamentos.xlsx,                │
│    │          cobranca_assessorias.csv)              │
│    └── processed/unified_dataset.csv (16 MB)        │
└─────────────────────────────────────────────────────┘
```

**Padrão de cache:** o dataset é lido do disco uma única vez por processo Flask e mantido em variável global `_cache` via `data_service.py`. Todas as funções analíticas chamam `load_data()` que retorna o objeto em memória.

---

## 10. Contrato da API

Base URL: `http://localhost:5000`

### Preparação

| Método | Endpoint | Descrição | Resposta |
|---|---|---|---|
| GET | `/prepare-data` | Executa pipeline ETL e gera CSV processado | `{ message, rows, columns, output }` |

### Análise — `/analysis/*`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/analysis/kpis` | KPIs gerais da carteira |
| GET | `/analysis/tendencia` | Série mensal de inadimplência e recuperação |
| GET | `/analysis/distribuicao-atrasos` | Distribuição de atrasos por faixas |
| GET | `/analysis/comportamento-pagamentos` | Comportamento por forma de pagamento e contemplação |
| GET | `/analysis/distribuicao-regional` | Rankings e insights regionais |
| GET | `/analysis/status-cobrancas` | Distribuição de status de cobrança |
| GET | `/analysis/taxa-inadimplencia` | Indicador completo com segmentações |
| GET | `/analysis/taxa-recuperacao` | Indicador completo com segmentações |
| GET | `/analysis/atraso-medio` | Indicador completo com percentis |
| GET | `/analysis/risco-regional-estrategico` | Score de risco composto por região |
| GET | `/analysis/tendencia-temporal` | Regressão linear dos 3 indicadores principais |
| GET | `/analysis/padroes-insights` | Perfis de risco, eficiência e recomendações |
| GET | `/analysis/visao-diretoria` | Dashboard executivo consolidado |
| GET | `/analysis/visao-financeira` | Análise financeira da carteira inadimplente |
| GET | `/analysis/operacao-cobranca` | Contratos abertos, recuperados e desempenho operacional |
| GET | `/analysis/dashboard-final` | Validação integrada de KPIs e material de apresentação |
| GET | `/analysis/estatisticas` | Estatísticas descritivas do dataset |
| GET | `/analysis/risco-regional` | Risco regional básico (inadimplência e valor) |
| GET | `/analysis/inadimplencia` | Série de inadimplência agregada |
| GET | `/analysis/recuperacao` | Série de recuperação agregada |

Todos os endpoints retornam `Content-Type: application/json` e HTTP 200 em caso de sucesso.

---

## 11. Módulos do Dashboard

| Nº | Nome | Cor | Seções |
|---|---|---|---|
| 01 | Análise Exploratória | Slate | KPIs, Tendência, Atrasos, Status, Comportamento, Regional |
| 02 | Indicadores Estratégicos | Blue | Taxa Inadimplência, Taxa Recuperação, Atraso Médio, Risco Regional, Tendência Temporal |
| 03 | Padrões e Insights | Yellow | Perfis de Risco, Regiões Críticas, Eficiência Assessorias, Padrões Temporais, Insights, Recomendações |
| 04 | Visão da Diretoria | Blue | Saúde da Carteira, Alertas Executivos, Visão Consolidada, Evolução Dual, Tendência |
| 05 | Visão Financeira | Emerald | Valor Inadimplente, Atraso Médio Financeiro, Distribuição Regional, Evolução Mensal |
| 06 | Operação de Cobrança | Violet | Contratos em Aberto, Contratos Recuperados, Status Cobranças, Desempenho Operacional |
| 07 | Dashboard Final | Indigo | Validação de KPIs, Revisão de Layout, Material para Apresentação |

---

## 12. Restrições e Dependências

| Tipo | Descrição |
|---|---|
| **Dado** | O sistema não opera sem o `unified_dataset.csv` gerado — `/prepare-data` deve ser executado antes de qualquer rota analítica |
| **Infraestrutura** | Backend e frontend devem rodar localmente nas portas 5000 e 5173 respectivamente |
| **CORS** | O frontend acessa `http://localhost:5000` — CORS deve estar habilitado no Flask |
| **Memória** | O dataset (~16 MB) é carregado integralmente em memória RAM |
| **Python** | Requer Python 3.10+ para suporte a operações de tipagem usadas no pandas |
| **Arquivos brutos** | `fluxo_pagamentos.xlsx` e `cobranca_assessorias.csv` devem estar presentes em `data/raw/` antes de executar o pipeline |

---

## 13. Glossário

| Termo | Definição |
|---|---|
| **Inadimplência** | Condição de pagamento com atraso (`dias_atraso > 0`) |
| **Taxa de Inadimplência** | Percentual de parcelas em atraso sobre o total de parcelas |
| **Taxa de Recuperação** | Percentual de contratos enviados à cobrança que resultaram em Acordo Firmado |
| **Atraso Médio** | Média aritmética de dias de atraso entre os pagamentos inadimplentes |
| **Assessoria** | Empresa terceirizada responsável pela cobrança de contratos inadimplentes |
| **Status de Cobrança** | Desfecho do processo de cobrança: Acordo Firmado, Em Aberto, Insucesso ou Ajuizado |
| **Acordo Firmado** | Contrato em que o devedor firmou acordo de pagamento com a assessoria |
| **Em Aberto** | Contrato em processo de cobrança sem desfecho ainda |
| **Insucesso** | Tentativa de cobrança encerrada sem resultado (contato não estabelecido ou recusa) |
| **Ajuizado** | Contrato encaminhado para cobrança judicial |
| **Score de Risco** | Pontuação interna do cliente de 1 a 100 indicando risco de inadimplência |
| **Contemplado** | Cliente que foi contemplado em processo (ex.: consórcio) |
| **Score de Saúde** | Indicador composto (0–100) que mede a saúde da carteira com base em inadimplência e recuperação |
| **Score de Risco Composto** | Indicador regional ponderado que agrega inadimplência, recuperação, judicialização e atraso |
| **Score de Eficiência** | Indicador por assessoria que pondera recuperação e taxa de judicialização |
| **Pipeline ETL** | Processo de Extração, Transformação e Carga dos dados brutos para o dataset unificado |
| **p.p.** | Pontos percentuais — unidade de variação absoluta entre dois percentuais |
| **OLS** | Ordinary Least Squares — método de mínimos quadrados ordinários usado na regressão linear de tendências |
