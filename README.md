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

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Git

---

### 1. Clonar o repositório

```bash
git clone https://github.com/oartuu/creditguard-api.git
cd creditguard-api
```

### 2. Subir os containers

```bash
docker compose up --build
```

O dashboard ficará disponível em:

```
http://localhost
```

> **Atenção:** antes de usar as rotas analíticas, é necessário gerar o dataset processado. Acesse `http://localhost/prepare-data` uma vez para executar o pipeline. Se alterar os datasets em `backend/app/data/raw/`, chame essa rota novamente para regenerar o arquivo processado.

---

### Resumo dos endereços

| Serviço | URL |
|---|---|
| Dashboard (React) | `http://localhost` |
| Preparar dados | `http://localhost/prepare-data` |

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
