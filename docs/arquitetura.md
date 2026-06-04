# Arquitetura do Sistema — CreditGuard

**Versão:** 1.0 | **Data:** 2026-06-03

---

## Diagrama de Arquitetura

```mermaid
graph TB
    subgraph Browser["🌐 Browser (Usuário)"]
        UI["React SPA\n(Vite + TypeScript)"]
    end

    subgraph DockerNet["Docker Network (bridge interna)"]
        subgraph FE["Frontend Container — nginx:alpine (:80)"]
            NGINX["nginx\nReverse Proxy"]
            STATIC["dist/ — SPA estática"]
        end

        subgraph BE["Backend Container — python:3.11-slim (:5000)"]
            GUNICORN["Gunicorn\n2 workers"]

            subgraph Routes["routes/ (Controller)"]
                R_ANALYSIS["analysis.py\n/analysis/* — 20 endpoints"]
                R_PREPARE["prepare.py\n/prepare-data"]
            end

            subgraph Services["services/ (Model)"]
                SVC_DATA["data_service.py\nload + cache global"]
                SVC_ANALYSIS["analysis_service.py\n20 funções analíticas"]
                SVC_PREPARE["prepare_service.py\nETL pipeline"]
            end

            subgraph DataLayer["data/"]
                RAW_XLSX["raw/fluxo_pagamentos.xlsx"]
                RAW_CSV["raw/cobranca_assessorias.csv"]
                PROC_CSV["processed/unified_dataset.csv\n~16 MB · ~100k linhas"]
                MEM_CACHE[("_cache\n(pandas DataFrame\nem memória)")]
            end
        end
    end

    %% Fluxo de requisição principal
    UI -->|"HTTP GET /_/backend/analysis/*"| NGINX
    NGINX -->|"strip /_/backend → proxy_pass :5000"| GUNICORN
    GUNICORN --> R_ANALYSIS
    R_ANALYSIS --> SVC_ANALYSIS
    SVC_ANALYSIS --> SVC_DATA
    SVC_DATA -->|"1ª leitura"| PROC_CSV
    SVC_DATA <-->|"leituras subsequentes"| MEM_CACHE

    %% Fluxo ETL
    UI -->|"HTTP GET /prepare-data"| NGINX
    NGINX -->|"proxy_pass :5000"| R_PREPARE
    R_PREPARE --> SVC_PREPARE
    SVC_PREPARE --> RAW_XLSX
    SVC_PREPARE --> RAW_CSV
    SVC_PREPARE -->|"join + normalização"| PROC_CSV

    %% Static files
    UI <-->|"HTML/JS/CSS"| STATIC

    %% Docker volume
    RAW_XLSX -. "Docker volume\n./backend/app/data" .- RAW_CSV
    PROC_CSV -. "Docker volume\n./backend/app/data" .- RAW_XLSX

    %% Estilos
    classDef container fill:#1e293b,stroke:#475569,color:#e2e8f0
    classDef service fill:#0f172a,stroke:#3b82f6,color:#93c5fd
    classDef data fill:#0f172a,stroke:#10b981,color:#6ee7b7
    classDef cache fill:#1e1b4b,stroke:#8b5cf6,color:#c4b5fd
    classDef nginx fill:#0f172a,stroke:#f59e0b,color:#fcd34d

    class FE,BE container
    class R_ANALYSIS,R_PREPARE,SVC_DATA,SVC_ANALYSIS,SVC_PREPARE service
    class RAW_XLSX,RAW_CSV,PROC_CSV data
    class MEM_CACHE cache
    class NGINX nginx
```

---

## Visão Geral

CreditGuard é uma plataforma analítica de inadimplência e recuperação de crédito composta por três camadas: **frontend SPA**, **backend API REST** e **camada de dados CSV**. A infraestrutura é conteinerizada via Docker Compose.

```
┌──────────────────────────────────────────────────────────────────┐
│                        USUÁRIO (Browser)                         │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTP :80
┌─────────────────────────────▼────────────────────────────────────┐
│                    FRONTEND CONTAINER                            │
│          nginx:alpine — Reverse Proxy + Static Files             │
│                                                                  │
│  /              → dist/ (React SPA)                              │
│  /_/backend/*   → proxy → backend:5000                           │
│  /prepare-data  → proxy → backend:5000                           │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTP (rede interna Docker)
┌─────────────────────────────▼────────────────────────────────────┐
│                    BACKEND CONTAINER                             │
│         python:3.11-slim — Flask + Gunicorn (2 workers)          │
│                                                                  │
│  routes/                                                         │
│    ├── prepare.py    → GET /prepare-data                         │
│    └── analysis.py   → GET /analysis/*  (20 endpoints)           │
│                                                                  │
│  services/                                                       │
│    ├── prepare_service.py   (pipeline ETL)                       │
│    ├── data_service.py      (load + cache em memória)            │
│    └── analysis_service.py  (20 funções analíticas)              │
│                                                                  │
│  data/                                                           │
│    ├── raw/   fluxo_pagamentos.xlsx + cobranca_assessorias.csv   │
│    └── processed/ unified_dataset.csv (~16 MB, ~100k linhas)     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Padrões de Arquitetura de Software

### Frontend — Component-Based Architecture (padrão React)

Arquitetura padrão do React: a UI é decomposta em componentes independentes e reutilizáveis, organizados por responsabilidade. Não há um Controller ou ViewModel separado — cada componente encapsula sua própria lógica de apresentação e estado local via hooks.

```
pages/      → componentes de rota (orquestram dados e layout de cada módulo)
components/ → componentes reutilizáveis de UI (gráficos, cards, tabelas)
services/   → camada de acesso a dados (chamadas HTTP isoladas em api.ts)
types/      → contratos de dados (interfaces TypeScript)
contexts/   → estado global compartilhado (tema dark/light)
```

Nenhum componente chama axios diretamente — toda comunicação com a API passa por `services/api.ts`, mantendo o isolamento entre UI e I/O.

### Backend — MVC (Model-View-Controller)

O backend segue o padrão MVC adaptado para API REST, onde a View é substituída pela resposta JSON:

| Camada MVC | Implementação | Responsabilidade |
|---|---|---|
| **Controller** | `routes/analysis.py`, `routes/prepare.py` | Recebe requisição HTTP, delega ao service, retorna JSON |
| **Model** | `services/analysis_service.py`, `services/prepare_service.py` | Lógica de negócio, cálculos e transformações |
| **View** | Resposta JSON (`jsonify`) | Representação dos dados para o cliente |

`data_service.py` atua como camada de acesso a dados (Repository), servindo o Model com o DataFrame em cache.

```
routes/     (Controller) → recebe HTTP, delega, serializa JSON
services/   (Model)      → lógica de negócio e cálculos analíticos
data/       (dados)      → CSV como fonte de dados persistida
```

---

## Camadas

### 1. Frontend

| Item | Valor |
|---|---|
| Framework | React 19 + TypeScript |
| Arquitetura | Component-Based (padrão React) |
| Build | Vite |
| Estilo | Tailwind CSS 4.x |
| Gráficos | Recharts 3.x |
| HTTP Client | axios |
| Servidor de produção | nginx:alpine |

Organização de código:

```
src/
  pages/          ← 7 módulos do dashboard (1 por rota)
  components/     ← componentes de visualização reutilizáveis
  services/api.ts ← todas as chamadas HTTP centralizadas
  types/api.ts    ← tipagem TypeScript dos contratos da API
  contexts/       ← ThemeContext (dark/light mode)
```

### 2. Backend

| Item | Valor |
|---|---|
| Framework | Flask 3.x |
| Arquitetura | MVC (Model-View-Controller) |
| Servidor WSGI | Gunicorn (2 workers) |
| Runtime | Python 3.11 |
| Processamento | pandas + numpy |
| Regressão | numpy.polyfit (OLS) |
| CORS | flask-cors |

Organização de código:

```
app/
  __init__.py          ← factory create_app(), registra blueprints, habilita CORS
  routes/              ← Controller: recebe HTTP e delega aos services
    prepare.py         ← blueprint prepare_bp (/prepare-data)
    analysis.py        ← blueprint analysis_bp (/analysis/*)
  services/            ← Model: lógica de negócio e acesso a dados
    prepare_service.py ← ETL: leitura, normalização, join, exportação
    data_service.py    ← singleton com cache global (_cache)
    analysis_service.py← 20 funções de análise
  data/
    raw/               ← fontes brutas (volume persistido via Docker volume)
    processed/         ← CSV unificado gerado pelo ETL
```

### 3. Camada de Dados

O sistema não usa banco relacional. Dados trafegam em arquivos:

| Arquivo | Tipo | Papel |
|---|---|---|
| `data/raw/fluxo_pagamentos.xlsx` | Excel | Fonte primária — parcelas e pagamentos |
| `data/raw/cobranca_assessorias.csv` | CSV | Fonte secundária — contratos em cobrança |
| `data/processed/unified_dataset.csv` | CSV | Dataset consolidado pós-ETL (~16 MB) |

Em runtime, o dataset processado é lido uma única vez e mantido em `_cache` (variável global em `data_service.py`), eliminando I/O em disco nas chamadas subsequentes.

---

## Infraestrutura Docker

```yaml
# docker-compose.yml (resumido)
services:
  backend:
    build: ./backend          # python:3.11-slim, porta 5000
    volumes:
      - ./backend/app/data:/app/app/data   # persiste raw + processed

  frontend:
    build: ./frontend         # nginx:alpine, porta 80
    ports:
      - "80:80"
    depends_on:
      - backend
```

- **Frontend expõe porta 80** ao host. Backend não tem porta exposta ao host — acessível apenas via proxy nginx.
- Volume monta `data/` no backend para que o CSV processado sobreviva reinicios de container.

---

## Roteamento nginx

```nginx
location /_/backend/ {
    rewrite ^/_/backend/(.*)$ /$1 break;
    proxy_pass http://backend:5000;
}

location /prepare-data {
    proxy_pass http://backend:5000;
}
```

O frontend envia todas as chamadas à API para `/_/backend/analysis/*`. O nginx faz strip do prefixo e encaminha para o backend interno.

---

## Padrão de Cache

```python
# data_service.py
_cache = None

def load_data() -> pd.DataFrame:
    global _cache
    if _cache is not None:
        return _cache
    df = pd.read_csv(PROCESSED_PATH)
    # ... parse de datas e tipos
    _cache = df
    return df
```

- Cada worker Gunicorn mantém sua própria cópia em memória (~16 MB por worker).
- Cache invalidado apenas com reinício do processo.
- `/prepare-data` regenera o CSV mas não invalida o cache — requer reinício manual para reload.
