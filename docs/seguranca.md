# Segurança — CreditGuard

**Versão:** 1.0 | **Data:** 2026-06-03

---

## Postura de Segurança Geral

CreditGuard é uma plataforma analítica de uso interno (ambiente local/intranet). O sistema opera **sem autenticação e sem controle de acesso** — qualquer host que alcance a porta 80 tem acesso irrestrito a todos os dados e endpoints.

Esta postura é adequada para ambiente acadêmico/desenvolvimento. Para uso em produção com dados reais de clientes, as lacunas listadas na seção [Lacunas de Segurança](#lacunas-de-segurança) devem ser endereçadas.

---

## Controles Implementados

### 1. CORS (Cross-Origin Resource Sharing)

```python
# app/__init__.py
from flask_cors import CORS
CORS(app)
```

- `flask-cors` com configuração padrão: permite todas as origens (`*`).
- Controla quais domínios podem fazer requisições cross-origin ao backend.

**Limitação:** configuração permissiva (`*`) — aceita requisições de qualquer origem. Em produção, restringir ao domínio do frontend.

### 2. Backend Não Exposto Diretamente

O backend Flask (porta 5000) não é mapeado para o host externo no `docker-compose.yml`:

```yaml
services:
  backend:
    # sem "ports:" → porta 5000 acessível apenas internamente
  frontend:
    ports:
      - "80:80"   # único ponto de entrada externo
```

Toda requisição ao backend passa obrigatoriamente pelo nginx (proxy reverso), que isola o Flask da exposição direta.

### 3. Não Exposição de Caminhos Internos em Erros

Conforme RNF-05.2, respostas de erro não expõem caminhos de arquivo internos do servidor. Exceções são capturadas antes de retornar ao cliente.

### 4. Volume Docker com Dados Sensíveis Isolado

O volume de dados está mapeado apenas para o container backend:

```yaml
volumes:
  - ./backend/app/data:/app/app/data
```

Os dados brutos (`fluxo_pagamentos.xlsx`, `cobranca_assessorias.csv`) e o dataset processado não são servidos diretamente pelo nginx.

### 5. Imagem Slim sem Ferramentas Desnecessárias

```dockerfile
FROM python:3.11-slim
```

Imagem minimalista — reduz superfície de ataque em comparação com imagem full.

---

## Lacunas de Segurança

| ID | Lacuna | Risco | Mitigação recomendada |
|---|---|---|---|
| S-01 | Sem autenticação | Qualquer usuário na rede acessa todos os dados | Implementar JWT ou sessão com login |
| S-02 | Sem autorização por papel | Não há separação de acesso entre analista, gestor e diretor | RBAC (Role-Based Access Control) |
| S-03 | CORS permissivo (`*`) | Qualquer origem pode chamar a API | Restringir para domínio do frontend |
| S-04 | Sem HTTPS | Dados trafegam em plaintext | TLS via nginx com certificado |
| S-05 | Sem rate limiting | API suscetível a abuso de requisições | nginx `limit_req` ou middleware Flask |
| S-06 | Sem validação de parâmetros de entrada | Endpoints não recebem parâmetros de query — risco baixo, mas sem sanitização explícita | Adicionar validação se parâmetros forem introduzidos |
| S-07 | Arquivos brutos sem validação de conteúdo | ETL processa qualquer arquivo depositado em `data/raw/` | Validar schema e tipos antes de processar |
| S-08 | Cache sem isolamento entre usuários | DataFrame compartilhado por todos os workers — sem separação de tenant | Aceitável para sistema single-tenant |
| S-09 | Sem auditoria de acesso | Nenhum log de quem acessou quais dados | Implementar logging com identidade de usuário |
| S-10 | Dados pessoais de clientes sem anonimização | `id_contrato`, `score_interno_risco`, `regiao_cliente` são dados sensíveis | Avaliar conformidade com LGPD; anonimizar IDs |

---

## Conformidade LGPD

O sistema processa dados potencialmente pessoais de clientes inadimplentes:

| Dado | Sensibilidade | Observação |
|---|---|---|
| `id_contrato` | Identificador de pessoa física/jurídica | Pode ser vinculado a CPF/CNPJ no sistema de origem |
| `score_interno_risco` | Dado financeiro sensível | Indica capacidade de pagamento do cliente |
| `regiao_cliente` | Dado de localização | Menor sensibilidade, mas é dado pessoal |
| `status_cobranca` | Dado financeiro negativo | Indica inadimplência — dado sensível |

**Ações recomendadas antes de uso em produção:**
1. Mapear base legal para tratamento de dados (art. 7º LGPD)
2. Anonimizar ou pseudonimizar `id_contrato` no dataset analítico
3. Implementar controle de acesso para restringir dados por papel
4. Definir prazo de retenção e exclusão do `unified_dataset.csv`

---

## Configuração de Segurança nginx

```nginx
# nginx.conf atual
location /_/backend/ {
    rewrite ^/_/backend/(.*)$ /$1 break;
    proxy_pass http://backend:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

**Cabeçalhos de segurança não configurados** (recomendados para produção):

```nginx
# Adicionar em bloco server {}
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'";
```
