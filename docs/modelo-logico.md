# Modelo Lógico — CreditGuard

**Versão:** 1.0 | **Data:** 2026-06-03

---

## Entidades e Relacionamentos

O sistema opera sobre dois conjuntos de dados que se relacionam pelo campo `id_contrato`.

```
┌─────────────────────────────────┐       ┌──────────────────────────────────┐
│         FLUXO_PAGAMENTOS        │       │      COBRANCA_ASSESSORIAS        │
│  (1 linha = 1 parcela)          │       │  (1 linha = 1 contrato)          │
├─────────────────────────────────┤       ├──────────────────────────────────┤
│ PK  id_pagamento        string  │       │ PK  id_contrato          string  │
│ FK  id_contrato         string  │──────►│     nome_assessoria       string  │
│     numero_parcela      integer │       │     data_envio_assessoria date    │
│     data_vencimento     date    │       │     dias_em_atraso_inicial integer│
│     data_pagamento      date    │       │     valor_inadimplente_inicial R$ │
│     valor_parcela       float   │       │     status_cobranca       string  │
│     valor_pago          float   │       │     score_interno_risco   float   │
│     forma_pagamento     string  │       │     regiao_cliente        string  │
│     indicador_contemplado string│       └──────────────────────────────────┘
└─────────────────────────────────┘
         LEFT JOIN on id_contrato
```

**Cardinalidade:** Um contrato pode ter N parcelas em `fluxo_pagamentos`. O JOIN replica os campos de cobrança para cada parcela do contrato.

---

## Dataset Unificado — `unified_dataset.csv`

Resultado do LEFT JOIN com colunas derivadas adicionadas:

### Campos origem `fluxo_pagamentos`

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id_pagamento` | string | NOT NULL | Identificador único da parcela |
| `id_contrato` | string | NOT NULL, FK | Chave de junção com cobrança |
| `numero_parcela` | integer | ≥ 1 | Número da parcela no contrato |
| `data_vencimento` | datetime | NOT NULL | Data de vencimento |
| `data_pagamento` | datetime | nullable | Data efetiva de pagamento |
| `valor_parcela` | float | > 0 | Valor nominal (R$) |
| `valor_pago` | float | ≥ 0 | Valor pago (R$) |
| `forma_pagamento` | string | enum | Boleto, Débito, Pix, Cartão, etc. |
| `indicador_contemplado` | string | Sim/Não | Se contemplado em consórcio |

### Campos origem `cobranca_assessorias`

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `nome_assessoria` | string | nullable | Nome da empresa de cobrança |
| `data_envio_assessoria` | datetime | nullable | Data de envio para cobrança |
| `dias_em_atraso_inicial` | integer | -999 = sem info | Atraso ao entrar em cobrança |
| `valor_inadimplente_inicial` | float | ≥ 0 | Dívida enviada à assessoria (R$) |
| `status_cobranca` | string | enum | Acordo Firmado / Em Aberto / Insucesso / Ajuizado |
| `score_interno_risco` | float | 1–100, imputado | Score de risco do cliente |
| `regiao_cliente` | string | enum | Norte / Nordeste / Sudeste / Sul / Centro-Oeste |

### Campos derivados (Feature Engineering)

| Campo | Tipo | Fórmula | Semântica |
|---|---|---|---|
| `dias_atraso` | integer | `(data_pagamento - data_vencimento).days` | Positivo = atraso, negativo = adiantado |
| `pagamento_em_dia` | boolean | `dias_atraso <= 0` | True se pago na data ou antes |
| `percentual_pago` | float | `valor_pago / valor_parcela` | Proporção paga (1.0 = 100%) |

**Volume esperado:** ~100.000 linhas × 19 colunas × ~16 MB

---

## Entidades Derivadas (calculadas em runtime)

Estas entidades não existem como tabelas — são computadas por `analysis_service.py` a cada chamada:

### Perfil de Risco

Agrupamento de `{score_faixa × indicador_contemplado × forma_pagamento}`:

| Campo | Derivação |
|---|---|
| `score_faixa` | Baixo (1–33), Médio (34–66), Alto (67–100) com base em `score_interno_risco` |
| `taxa_inadimplencia_perfil` | % inadimplentes dentro do grupo |
| `criticidade` | score de criticidade por cruzamento das três dimensões |

### Score de Risco Composto Regional

Por `regiao_cliente`:

```
score_risco_composto = (
    inadimplencia_normalizada   × 0.40 +
    (100 - recuperacao_normalizada) × 0.30 +
    judicializacao_normalizada  × 0.20 +
    atraso_normalizado          × 0.10
)
```

Classificação: Alto (≥ 67) | Médio (34–66) | Baixo (≤ 33)

### Score de Saúde da Carteira

```
score_saude = (100 - taxa_inadimplencia) × 0.5 + taxa_recuperacao × 0.5
```

Classificação: Saudável (≥ 75) | Atenção (55–74) | Crítico (< 55)

### Score de Eficiência de Assessoria

```
score_eficiencia = taxa_recuperacao × (1 - taxa_judicializacao / 100)
```

### Score de Desempenho Operacional

```
score_desempenho = taxa_recuperacao × (1 - taxa_ajuizado / 100)
```

---

## Domínios de Enumeração

| Domínio | Valores válidos |
|---|---|
| `status_cobranca` | Acordo Firmado, Em Aberto, Insucesso, Ajuizado |
| `regiao_cliente` | Norte, Nordeste, Sudeste, Sul, Centro-Oeste |
| `indicador_contemplado` | Sim, Não |
| `faixa_atraso` | Em Dia, 1–30 dias, 31–60 dias, 61–90 dias, 90+ dias |
| `nivel_risco` | Baixo, Médio, Alto |
| `saude_carteira` | Saudável, Atenção, Crítico |
| `status_kpi` | OK, ALERTA, CRÍTICO |

---

## Regras de Negócio — Restrições de Dados

| RN | Regra |
|---|---|
| RN-01 | `dias_atraso > 0` → parcela inadimplente |
| RN-02 | `dias_atraso <= 0` → pagamento em dia (inclui antecipados) |
| RN-03 | `status_cobranca = "Acordo Firmado"` → contrato recuperado |
| RN-04 | Análises de contrato usam `drop_duplicates("id_contrato")` — uma linha por contrato |
| RN-10 | `dias_em_atraso_inicial = -999` → sentinela, excluído de análises desse campo |
| RN-11 | `nome_assessoria` normalizado para Title Case antes de agrupamentos |
