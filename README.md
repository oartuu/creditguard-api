# CreditGuard API

API desenvolvida em Python utilizando Flask + Pandas para análise e preparação de datasets do projeto CreditGuard.

O objetivo da aplicação é:

* Padronizar datasets
* Tratar dados inconsistentes
* Gerar uma base unificada
* Disponibilizar dados via API para o frontend React gerar dashboards e gráficos

---

# Tecnologias

* Python 3
* Flask
* Pandas
* OpenPyXL
* Flask-CORS

---

# Estrutura do Projeto

```text
creditguard-api/
│
├── app/
│   ├── data/
│   │   ├── raw/
│   │   └── processed/
│   │
│   ├── routes/
│   │
│   ├── services/
│   │
│   └── __init__.py
│
├── run.py
├── requirements.txt
└── README.md
```

---

# Como iniciar o projeto

## 1. Clonar o repositório

```bash
git clone https://github.com/oartuu/creditguard-api.git
```

Entrar na pasta:

```bash
cd creditguard-api
```

---

# 2. Criar ambiente virtual

Linux/Fedora:

```bash
python3 -m venv .venv
```

---

# 3. Ativar ambiente virtual

Linux/Fedora:

```bash
source .venv/bin/activate
```

Se ativou corretamente, o terminal ficará parecido com:

```text
(.venv)
```

---

# 4. Instalar dependências

```bash
pip install -r requirements.txt
```

Caso o `requirements.txt` ainda não exista:

```bash
pip install flask pandas openpyxl flask-cors python-dotenv
```

Depois gerar:

```bash
pip freeze > requirements.txt
```

---

# 5. Adicionar os datasets (Caso ainda não exista)

Colocar os datasets na pasta:

```text
app/data/raw/
```

Arquivos esperados:

```text
fluxo_pagamentos.xlsx
cobranca_assessorias.csv
```

---

# 6. Executar a API

```bash
python run.py
```

A aplicação iniciará em:

```text
http://127.0.0.1:5000
```

---

# Preparação dos datasets

A rota abaixo executa o pipeline de preparação dos dados:

```text
GET /prepare-data
```

Exemplo:

```text
http://127.0.0.1:5000/prepare-data
```

---

# O que o pipeline faz

## Padronização

* Normaliza nomes de colunas
* Padroniza regiões
* Remove inconsistências textuais

Exemplo:

```text
NORDESTE
Nordeste
centro-oeste
```

vira:

```text
Nordeste
Centro Oeste
```

---

## Limpeza

* Remove duplicados
* Trata valores nulos
* Corrige tipos de dados
* Converte valores monetários

---

## Engenharia de atributos

Cria colunas úteis para análise:

* dias_atraso
* pagamento_em_dia
* percentual_pago

---

## Unificação

Os datasets são unidos automaticamente via:

```text
id_contrato
```

---

# Dataset processado

Após executar `/prepare-data`, será gerado:

```text
app/data/processed/unified_dataset.csv
```

Esse arquivo será utilizado pelas rotas analíticas e pelo frontend React.

---

# Fluxo de desenvolvimento

## Atualizar dataset

1. Substituir arquivos em:

```text
app/data/raw/
```

2. Executar:

```text
/prepare-data
```

3. Desenvolver novas análises e gráficos

---

# Próximas rotas planejadas

## KPIs

```text
/kpis
```

* total inadimplente
* percentual pago
* média atraso

---

## Análise de risco

```text
/risk-analysis
```

---

## Assessoria de cobrança

```text
/assessorias
```

---

# Objetivo do projeto

O projeto busca apoiar análises de:

* inadimplência
* recuperação de crédito
* risco financeiro
* comportamento de pagamento
* eficiência de assessorias

utilizando ciência de dados aplicada ao contexto de consórcios e recuperação de crédito.
