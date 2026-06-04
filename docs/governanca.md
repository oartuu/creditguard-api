# Governança — CreditGuard

**Versão:** 1.0 | **Data:** 2026-06-03

---

## Modelo de Responsabilidades

| Papel | Responsabilidade |
|---|---|
| **Equipe de Dados** | Manutenção do pipeline ETL, qualidade dos dados brutos, execução do `/prepare-data` |
| **Analista Financeiro** | Consumo dos módulos 01 (Exploratória) e 05 (Financeira) |
| **Gestor de Cobrança** | Consumo dos módulos 06 (Operação) e 03 (Padrões) |
| **Diretor Executivo** | Consumo dos módulos 04 (Diretoria) e 07 (Dashboard Final) |

---

## Ciclo de Vida dos Dados

```
1. COLETA
   Fontes operacionais → exportação manual de:
     - fluxo_pagamentos.xlsx   (sistema de gestão de pagamentos)
     - cobranca_assessorias.csv (sistema de CRM/cobrança)

2. INGESTÃO
   Arquivos depositados em data/raw/
   Requer verificação manual de completude antes do ETL

3. PREPARAÇÃO
   GET /prepare-data → ETL → unified_dataset.csv
   Responsável: Equipe de Dados

4. ANÁLISE
   Dashboard disponível para usuários autorizados (sem controle de acesso atual)

5. RETENÇÃO
   unified_dataset.csv persiste em volume Docker enquanto o container existir
   Prazo de retenção: não definido (recomendado: alinhar com política da organização)

6. DESCARTE
   Remoção manual dos arquivos em data/raw/ e data/processed/
```

---

## Qualidade de Dados

### Verificações Automáticas (realizadas pelo ETL)

| Verificação | Ação |
|---|---|
| Registros duplicados | Removidos automaticamente (`drop_duplicates()`) |
| Score de risco nulo | Imputado com mediana |
| Região fora do padrão | Normalizada para valor canônico |
| Valor monetário malformatado | Convertido pelo `convert_currency()` |
| Datas não parseáveis | Marcadas como `NaT` (not a time) via `errors="coerce"` |

### Verificações Manuais Recomendadas (antes de executar ETL)

| Verificação | O que verificar |
|---|---|
| Completude temporal | O período dos dados cobre o intervalo esperado |
| Volume esperado | Número de registros dentro do range histórico |
| Arquivos corretos | `fluxo_pagamentos.xlsx` e `cobranca_assessorias.csv` são do ciclo atual |
| Sentinela -999 | Proporção de `dias_em_atraso_inicial = -999` aceitável |

### Alertas de Qualidade (endpoint `/analysis/estatisticas`)

O endpoint `estatisticas` reporta automaticamente:
- Campos com valores nulos e percentual
- Registros com sentinela -999 em `dias_em_atraso_inicial`
- Variações de capitalização em `nome_assessoria`

---

## Versionamento e Rastreabilidade

| Artefato | Controle |
|---|---|
| Código-fonte | Git (branch `main`) |
| Dados brutos | Sem versionamento — substituição manual |
| Dataset processado | Sem versionamento — gerado a cada ETL |
| Documentação | Git (`docs/`) |

**Recomendação:** nomear arquivos brutos com data (`fluxo_pagamentos_2026-06.xlsx`) e manter histórico em subpastas para rastreabilidade de qual dataset gerou cada análise.

---

## Procedimentos Operacionais

### Atualização do Dataset

1. Obter novos arquivos brutos do sistema de origem
2. Verificar completude e volume (inspeção manual)
3. Depositar em `backend/app/data/raw/` (sobrescrever ou renomear anterior)
4. Chamar `GET /prepare-data` (aguardar até 15s)
5. Reiniciar containers para invalidar cache: `docker compose restart backend`
6. Verificar `/analysis/estatisticas` para alertas de qualidade

### Diagnóstico de Problemas

| Sintoma | Causa provável | Solução |
|---|---|---|
| Endpoints analíticos retornam HTTP 500 | `unified_dataset.csv` não existe | Executar `/prepare-data` |
| Dados desatualizados mesmo após ETL | Cache do worker não invalidado | `docker compose restart backend` |
| Região aparece como "Nao informado" | Valor de região não mapeado | Verificar `normalize_region()` e adicionar mapeamento |
| Score de risco uniforme (todos iguais) | Dataset sem variação — todos nulos | Verificar fonte `cobranca_assessorias.csv` |
| JOIN retorna zero linhas de cobrança | `id_contrato` sem correspondência entre fontes | Verificar chave de junção nas duas fontes |

---

## Indicadores de Saúde do Sistema

Verificações periódicas recomendadas:

| Indicador | Endpoint | Sinal de alerta |
|---|---|---|
| Saúde da carteira | `/analysis/visao-diretoria` | Score < 55 (Crítico) |
| KPIs validados | `/analysis/dashboard-final` | Qualquer KPI em CRÍTICO |
| Risco regional | `/analysis/risco-regional-estrategico` | ≥ 3 regiões em nível Alto |
| Qualidade dos dados | `/analysis/estatisticas` | Alertas de qualidade presentes |

---

## Thresholds e Critérios de Negócio

Parâmetros de classificação que devem ser revisados periodicamente com a área de negócio:

| Parâmetro | Valor atual | Responsável pela revisão |
|---|---|---|
| Taxa Inadimplência OK | < 20% | Gestor de Crédito |
| Taxa Inadimplência CRÍTICO | ≥ 30% | Gestor de Crédito |
| Taxa Recuperação OK | ≥ 50% | Gestor de Cobrança |
| Atraso Médio OK | ≤ 30 dias | Analista Financeiro |
| Pesos do Score de Risco Composto | 40/30/20/10 | Equipe de Dados + Negócio |
| Pesos do Score de Saúde | 50/50 | Diretoria |

---

## Dependências Externas e Pontos de Falha

| Dependência | Impacto se indisponível | Mitigação |
|---|---|---|
| `fluxo_pagamentos.xlsx` ausente | ETL falha, dataset não gerado | Garantir arquivo antes de acionar ETL |
| `cobranca_assessorias.csv` ausente | ETL falha | Garantir arquivo antes de acionar ETL |
| `unified_dataset.csv` ausente | Todos os endpoints analíticos falham | Executar ETL |
| Docker daemon parado | Sistema indisponível | Reiniciar serviços |
| RAM insuficiente | Dataset não carrega em memória (~16 MB × workers) | Mínimo recomendado: 512 MB RAM disponível |
