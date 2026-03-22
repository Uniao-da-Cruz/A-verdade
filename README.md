# Vigília SaaS

A versão atual do projeto transforma a antiga prova de conceito em uma base SaaS completa para monitoramento político e blockchain.

## O que foi adicionado

- **Backend FastAPI com autenticação JWT**.
- **Persistência com SQLAlchemy**, funcionando com SQLite local e PostgreSQL em produção.
- **Workspaces isolados por conta**, para que cada cliente veja apenas os próprios dados.
- **Seed automático no cadastro**, criando um workspace pronto para demonstração.
- **Frontend React protegido por login**, com landing page, onboarding e dashboard operacional.
- **Arquivos de deploy com Docker**, incluindo `docker-compose.yml` para subir tudo de uma vez.

## Estrutura

- `backend/server.py`: API principal, auth, banco e regras de negócio.
- `frontend/src`: SPA React com login, sessão persistente e dashboard.
- `scripts/seed_data.py`: utilitário para criar/reutilizar uma conta demo via API.
- `docker-compose.yml`: stack pronta com frontend, backend e PostgreSQL.

## Rodando localmente

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn server:app --reload
```

A API sobe em `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
npm start
```

O app sobe em `http://localhost:3000`.

### 3. Criar uma conta demo

Com a API rodando:

```bash
python scripts/seed_data.py
```

O script tenta registrar a conta demo e, se ela já existir, faz login e imprime as credenciais.

## Deploy com Docker Compose

```bash
docker compose up --build
```

Serviços publicados:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- PostgreSQL: porta interna do compose

## Variáveis importantes

### Backend

- `DATABASE_URL`: SQLite ou PostgreSQL.
- `SECRET_KEY`: segredo para assinar JWT.
- `ACCESS_TOKEN_EXPIRE_HOURS`: duração do token.
- `CORS_ORIGINS`: origens permitidas no frontend.

### Frontend

- `REACT_APP_BACKEND_URL`: base URL da API.

## Fluxo SaaS implementado

1. Usuário cria uma conta em `/auth`.
2. A API cria um workspace próprio.
3. O backend faz seed dos dados iniciais.
4. O frontend guarda o token e restaura a sessão.
5. O dashboard exibe métricas, alertas, transações e permite cadastrar novos políticos.

## Próximas evoluções recomendadas

- cobrança real com Stripe ou Mercado Pago;
- RBAC com múltiplos membros por workspace;
- webhooks e ingestão automática de dados externos;
- migrations com Alembic;
- testes E2E com Playwright.
