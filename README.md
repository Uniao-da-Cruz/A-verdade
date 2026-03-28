# Vigília — Monitoramento Político Transparente

> Plataforma SaaS open source para monitoramento de atividades políticas e transações blockchain. Dados públicos. Sem filtros. Sem censura.

[![Python](https://img.shields.io/badge/Python-3.10+-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Índice

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Rodando localmente](#rodando-localmente)
- [Deploy com Docker](#deploy-com-docker)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Integração com o Portal da Transparência](#integração-com-o-portal-da-transparência)
- [Fluxo SaaS](#fluxo-saas)
- [Roadmap](#roadmap)
- [Como contribuir](#como-contribuir)
- [Licença](#licença)

---

## Visão geral

O **Vigília** começou como uma prova de conceito e evoluiu para uma base SaaS completa. Cada conta tem seu próprio workspace isolado, recebe dados de demonstração no cadastro e acessa um dashboard operacional com métricas, alertas e registros de transações.

O objetivo é simples: tornar mais fácil para jornalistas, pesquisadores e cidadãos acompanhar movimentações financeiras e atividades de figuras públicas, usando apenas dados já disponíveis ao público.

---

## Funcionalidades

- **Autenticação JWT** — cadastro, login e sessão persistente no frontend.
- **Workspaces por conta** — cada usuário vê apenas seus próprios dados.
- **Seed automático** — workspace de demonstração criado logo após o cadastro.
- **Dashboard React** — métricas, alertas, transações e cadastro de políticos.
- **API documentada** — Swagger disponível em `/docs` durante o desenvolvimento.
- **Coleta do Portal da Transparência** — script para ingestão de despesas federais reais.
- **Integração IBGE** — endpoint para consumir estados brasileiros em tempo real via API oficial do IBGE.
- **Stack containerizada** — sobe tudo com um único `docker compose up`.

---

## Arquitetura

```
vigilia/
├── backend/
│   ├── server.py          # API principal, autenticação, banco e regras de negócio
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/               # SPA React — login, sessão e dashboard
│   └── .env.example
├── scripts/
│   ├── seed_data.py                      # Cria/reutiliza conta demo via API
│   └── associate_portal_transparencia.py # Ingestão de dados do Portal da Transparência
└── docker-compose.yml     # Stack completa: frontend, backend e PostgreSQL
```

**Tecnologias principais:**

| Camada | Tecnologia |
|---|---|
| API | FastAPI + Uvicorn |
| Banco | SQLAlchemy (SQLite local / PostgreSQL em produção) |
| Auth | JWT (python-jose) |
| Frontend | React 18 |
| Container | Docker + Docker Compose |

---

## Pré-requisitos

- Python 3.10+
- Node.js 18+
- Docker e Docker Compose (opcional, para deploy)

---

## Rodando localmente

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # edite as variáveis conforme necessário
uvicorn server:app --reload
```

API disponível em `http://localhost:8000`.  
Documentação interativa em `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm start
```

App disponível em `http://localhost:3000`.

### 3. Criar conta demo (opcional)

Com a API em execução:

```bash
python scripts/seed_data.py
```

O script cria a conta demo se ainda não existir, ou faz login e exibe as credenciais caso já tenha sido criada anteriormente.

---

## Deploy com Docker

Sobe o stack inteiro (frontend, backend e PostgreSQL) com um único comando:

```bash
docker compose up --build
```

Serviços expostos:

| Serviço | Endereço |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:8000` |
| PostgreSQL | porta interna do compose |

---

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Descrição | Padrão |
|---|---|---|
| `DATABASE_URL` | URL de conexão (SQLite ou PostgreSQL) | `sqlite:///./vigilia.db` |
| `SECRET_KEY` | Segredo para assinar tokens JWT | — |
| `ACCESS_TOKEN_EXPIRE_HOURS` | Duração do token em horas | `24` |
| `CORS_ORIGINS` | Origens permitidas pelo frontend | `http://localhost:3000` |

### Frontend (`frontend/.env`)

| Variável | Descrição |
|---|---|
| `REACT_APP_BACKEND_URL` | URL base da API |

---

## Integração com o Portal da Transparência

Para coletar despesas federais reais e associar nomes e documentos aos registros:

```bash
export PORTAL_TRANSPARENCIA_API_KEY="sua-chave"

python scripts/associate_portal_transparencia.py \
  --ano 2025 \
  --mes 1 \
  --max-paginas 50 \
  --output-dir output/transparencia
```

Você obtém a chave gratuitamente em [portaldatransparencia.gov.br/api-de-dados](https://portaldatransparencia.gov.br/api-de-dados).

**Arquivos gerados:**

| Arquivo | Conteúdo |
|---|---|
| `transactions_with_names.csv` | Uma linha por transação com nome e documento do favorecido |
| `association_summary.csv` | Consolidação por documento e nome do favorecido |

---

## Integração com o IBGE

Para consultar os estados brasileiros direto da API oficial do IBGE:

```bash
curl "http://localhost:8000/api/ibge/states"
```

Filtrar por uma sigla específica (ex.: SP):

```bash
curl "http://localhost:8000/api/ibge/states?sigla=SP"
```

O backend consulta `https://servicodados.ibge.gov.br/api/v1/localidades/estados` e retorna um snapshot com horário da coleta e lista normalizada por estado.

---

## Fluxo SaaS

```
Cadastro → Criação do workspace → Seed de dados iniciais
    → Login → Token salvo no frontend → Dashboard
```

1. Usuário cria conta em `/auth`.
2. A API cria um workspace isolado para aquela conta.
3. O backend popula o workspace com dados de demonstração.
4. O frontend armazena o token e restaura a sessão automaticamente.
5. O dashboard exibe métricas, alertas e transações, e permite cadastrar novos políticos.

---

## Roadmap

- [ ] Cobrança recorrente via Stripe ou Mercado Pago
- [ ] RBAC com múltiplos membros por workspace
- [ ] Webhooks e ingestão automática de dados externos
- [ ] Migrations com Alembic
- [ ] Testes E2E com Playwright
- [ ] Suporte a mais redes blockchain (Solana, Polygon)

Tem uma ideia? [Abra uma issue](../../issues) ou mande um pull request.

---

## Como contribuir

1. Faça um fork do repositório.
2. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`.
3. Faça commit das mudanças: `git commit -m 'feat: minha feature'`.
4. Envie para o seu fork: `git push origin feature/minha-feature`.
5. Abra um Pull Request descrevendo o que foi feito e por quê.

Bugs, sugestões e perguntas são bem-vindos nas [Issues](../../issues).

---

## Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](LICENSE) para mais detalhes.

---

*Vigília — transparência política genuína. Feito no Brasil 🇧🇷*
