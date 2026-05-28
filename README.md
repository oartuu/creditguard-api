# CreditGuard

Plataforma de análise de inadimplência e recuperação de crédito, composta por uma API Python/Flask no backend e um dashboard React/TypeScript no frontend.

---

## Estrutura do projeto

```
creditguard-api/
├── backend/
│   ├── app/
│   │   ├── data/
│   │   │   ├── raw/                  # datasets originais
│   │   │   └── processed/            # unified_dataset.csv (gerado)
│   │   ├── routes/
│   │   │   ├── analysis.py           # rotas analíticas
│   │   │   └── prepare.py            # rota de preparação dos dados
│   │   ├── services/
│   │   │   ├── analysis_service.py   # lógica de análise
│   │   │   ├── data_service.py       # carregamento do dataset
│   │   │   └── prepare_service.py    # pipeline de preparação
│   │   └── __init__.py
│   ├── run.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/               # componentes de UI e gráficos
    │   ├── contexts/                 # ThemeContext
    │   ├── pages/                    # Dashboard, módulos
    │   ├── services/                 # chamadas à API
    │   └── types/                    # tipos TypeScript
    ├── package.json
    └── vite.config.ts
```

---

## Pré-requisitos

- Python 3.10+
- Node.js 18+
- npm

---

## Como rodar o projeto

O projeto precisa de dois terminais rodando ao mesmo tempo: um para o backend e outro para o frontend.

---

### Terminal 1 — Backend (Flask)

```bash
# 1. Entrar na pasta do backend
cd creditguard-api/backend

# 2. Criar o ambiente virtual
python3 -m venv .venv

# 3. Ativar o ambiente virtual
source .venv/bin/activate        # Linux / macOS
# .venv\Scripts\activate         # Windows

# 4. Instalar as dependências
pip install -r requirements.txt

# 5. Rodar o servidor
python run.py
```

A API ficará disponível em:

```
http://localhost:5000
```

> **Atenção:** antes de usar as rotas analíticas, é necessário gerar o dataset processado. Acesse `http://localhost:5000/prepare-data` uma vez para executar o pipeline.

---

### Terminal 2 — Frontend (React + Vite)

```bash
# 1. Entrar na pasta do frontend
cd creditguard-api/frontend

# 2. Instalar as dependências
npm install

# 3. Rodar o servidor de desenvolvimento
npm run dev
```

O dashboard ficará disponível em:

```
http://localhost:5173
```

---

## Scripts disponíveis — Frontend

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Verifica o código com ESLint |

---

## Rotas da API

### Preparação

| Método | Rota | Descrição |
|---|---|---|
| GET | `/prepare-data` | Executa o pipeline de preparação e gera o `unified_dataset.csv` |

### Análise

| Método | Rota | Descrição |
|---|---|---|
| GET | `/analysis/kpis` | Indicadores-chave gerais |
| GET | `/analysis/tendencia` | Tendência temporal de inadimplência e recuperação |
| GET | `/analysis/distribuicao-atrasos` | Distribuição detalhada dos atrasos |
| GET | `/analysis/comportamento-pagamentos` | Comportamento por forma de pagamento e contemplação |
| GET | `/analysis/distribuicao-regional` | Análise por região geográfica |
| GET | `/analysis/status-cobrancas` | Status das cobranças por assessoria |
| GET | `/analysis/taxa-inadimplencia` | Taxa de inadimplência com segmentação completa |
| GET | `/analysis/taxa-recuperacao` | Taxa de recuperação com segmentação por assessoria |
| GET | `/analysis/atraso-medio` | Atraso médio com percentis e distribuição por faixas |

---

## Módulos do dashboard

### Módulo 01 — Análise Exploratória dos Dados
Visão estatística completa da carteira: KPIs, tendência temporal, distribuição de atrasos, status de cobranças, comportamento de pagamentos e distribuição regional.

### Módulo 02 — Indicadores Estratégicos
Três indicadores calculados com segmentação por região, score de risco, forma de pagamento e assessoria:
- **Taxa de Inadimplência** — percentual de parcelas em atraso
- **Taxa de Recuperação** — percentual de contratos com Acordo Firmado e valor recuperado
- **Atraso Médio** — média de dias de atraso com percentis e distribuição por faixas

---

## Tecnologias

**Backend**
- Python 3 · Flask · Pandas · NumPy · OpenPyXL · Flask-CORS

**Frontend**
- React 19 · TypeScript · Vite · Tailwind CSS v4 · Recharts · Axios
