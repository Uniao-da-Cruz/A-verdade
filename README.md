
-# VIGÍLIA - Vigilância Política Transparente
+# Vigília SaaS
 
-## 🎯 O que é?
+A versão atual do projeto transforma a antiga prova de conceito em uma base SaaS completa para monitoramento político e blockchain.
 
-Sistema **100% transparente** de monitoramento de atividades políticas e transações blockchain. Sem censura. Sem filtros. Dados públicos genuínos.
+## O que foi adicionado
 
-- ✅ Backend API (FastAPI)
-- ✅ Documentação automática (Swagger)
-- ✅ Dados de exemplo com políticos brasileiros reais
-- ✅ Pronto para expandir com frontend
+- **Backend FastAPI com autenticação JWT**.
+- **Persistência com SQLAlchemy**, funcionando com SQLite local e PostgreSQL em produção.
+- **Workspaces isolados por conta**, para que cada cliente veja apenas os próprios dados.
+- **Seed automático no cadastro**, criando um workspace pronto para demonstração.
+- **Frontend React protegido por login**, com landing page, onboarding e dashboard operacional.
+- **Arquivos de deploy com Docker**, incluindo `docker-compose.yml` para subir tudo de uma vez.
 
----
+## Estrutura
 
-## 🚀 Instalação Rápida (5 minutos)
+- `backend/server.py`: API principal, auth, banco e regras de negócio.
+- `frontend/src`: SPA React com login, sessão persistente e dashboard.
+- `scripts/seed_data.py`: utilitário para criar/reutilizar uma conta demo via API.
+- `docker-compose.yml`: stack pronta com frontend, backend e PostgreSQL.
 
-### **1. Pré-requisitos**
+## Rodando localmente
 
-Você precisa de Python 3.10+ instalado. Verificar com:
-
-```bash
-python --version
-```
-
-Se não tiver, baixe em: https://www.python.org/downloads/
-
-### **2. Clone/Baixe os arquivos**
-
-Você tem estes arquivos:
-- `vigilancia_backend.py` - Código do servidor
-- `requirements.txt` - Dependências Python
-- `seed_data.py` - Script para popular dados
-
-Coloque todos em uma pasta, exemplo: `~/vigilancia/`
-
-### **3. Instale as dependências**
+### 1. Backend
 
 ```bash
+cd backend
+python -m venv .venv
+source .venv/bin/activate
 pip install -r requirements.txt
+cp .env.example .env
+uvicorn server:app --reload
 ```
 
-Output esperado:
-```
-Successfully installed fastapi-0.110.1 uvicorn-0.25.0 pydantic-2.6.4 python-dotenv-1.0.1
-```
-
-### **4. Inicie o servidor**
-
-```bash
-python vigilancia_backend.py
-```
-
-Você verá:
-```
-╔══════════════════════════════════════════════╗
-║      VIGÍLIA - Vigilância Política           ║
-║      Transparência. Sem Censura.             ║
-╚══════════════════════════════════════════════╝
-
-API iniciando em http://localhost:8000
-Documentação: http://localhost:8000/docs
-```
-
-**A API está rodando!**
-
----
-
-## 📊 Populando com Dados
-
-Em **outro terminal** (mantendo o servidor ativo):
-
-```bash
-python seed_data.py
-```
-
-Você verá:
-```
-╔════════════════════════════════════════════════════╗
-║    VIGÍLIA - Script de Seeding de Dados           ║
-║    Populando sistema com dados de exemplo         ║
-╚════════════════════════════════════════════════════╝
-
-✓ API está ativa
-
-📊 Criando políticos...
-  ✓ Guilherme Boulos (PSOL) - ID: 1f4b3c4d...
-  ✓ Ciro Gomes (PDT) - ID: 9f8e7d6c...
-  [mais políticos...]
-
-💰 Criando transações...
-  ✓ Guilherme Boulos: 123.45 BTC (verified)
-  [mais transações...]
-
-⚠️  Criando alertas...
-  ✓ Alerta para Guilherme Boulos - Severidade: high
-  [mais alertas...]
-
-╔════════════════════════════════════════════════════╗
-║              SEEDING COMPLETO ✓                   ║
-├────────────────────────────────────────────────────┤
-│ Políticos monitorados:       9
-│ Transações registradas:    128
-│ Transações suspeitas:       32
-│ Alertas ativos:             21
-│ Carteiras monitoradas:      14
-│ Redes monitoradas:          bitcoin, ethereum
-╚════════════════════════════════════════════════════╝
-```
-
----
-
-## 🔍 Acessar a API
-
-### **1. Interface Interativa (Swagger UI)**
-
-Abra no navegador:
-```
-http://localhost:8000/docs
-```
-
-Você pode:
-- Ver todos os endpoints
-- Testar cada endpoint
-- Ver requisições e respostas
-
-### **2. Endpoints Principais**
-
-#### **Listar todos os políticos**
-```
-GET http://localhost:8000/api/politicians
-```
-
-Exemplo de resposta:
-```json
-[
-  {
-    "id": "1f4b3c4d-...",
-    "name": "Guilherme Boulos",
-    "party": "PSOL",
-    "position": "Federal Deputy",
-    "wallets": ["0x1f4b3c4d5e6f7a8b..."],
-    "total_transactions": 15,
-    "suspicious_count": 3,
-    "verified": true,
-    "instagram": "guilhermeboulos",
-    "created_at": "2025-03-22T10:30:00..."
-  }
-]
-```
-
-#### **Obter estatísticas**
-```
-GET http://localhost:8000/api/stats
-```
-
-Exemplo de resposta:
-```json
-{
-  "total_politicians": 9,
-  "total_transactions": 128,
-  "suspicious_transactions": 32,
-  "active_alerts": 21,
-  "total_wallets": 14,
-  "monitored_networks": ["bitcoin", "ethereum"],
-  "primary_explorer": "BlockExplorer",
-  "timestamp": "2025-03-22T15:45:00..."
-}
-```
-
-#### **Listar transações de um político**
-```
-GET http://localhost:8000/api/transactions/politician/{id}
-```
-
-#### **Criar novo político**
-```
-POST http://localhost:8000/api/politicians
-
-{
-  "name": "Seu Nome Aqui",
-  "party": "Seu Partido",
-  "position": "Sua Posição",
-  "wallets": ["endereço_blockchain"],
-  "instagram": "seu_instagram",
-  "verified": false
-}
-```
-
----
+A API sobe em `http://localhost:8000`.
 
-## 🛠️ Testar com cURL (Terminal)
-
-Se preferir linha de comando:
+### 2. Frontend
 
 ```bash
-# Ver todos os políticos
-curl http://localhost:8000/api/politicians
-
-# Ver estatísticas
-curl http://localhost:8000/api/stats
-
-# Verificar saúde da API
-curl http://localhost:8000/api/health
+cd frontend
+cp .env.example .env
+npm install --legacy-peer-deps
+npm start
 ```
 
----
-
-## 📱 Próximos Passos: Frontend
-
-Para adicionar interface web bonita:
-
-1. Use o código frontend do repositório original
-2. Aponte para `http://localhost:8000/api`
-3. Ou crie seu próprio frontend em:
-   - React
-   - Vue.js
-   - Svelte
-   - Qualquer coisa
+O app sobe em `http://localhost:3000`.
 
----
+### 3. Criar uma conta demo
 
-## 🔐 Segurança para Produção
+Com a API rodando:
 
-Quando colocar em servidor real:
-
-1. **Use HTTPS** - Not just HTTP
-2. **Variáveis de ambiente** - Não deixe dados sensíveis no código
-3. **Autenticação** - Adicione JWT/OAuth
-4. **Rate limiting** - Proteja de DDoS
-5. **Banco de dados real** - MongoDB, PostgreSQL
-6. **CORS configurado** - Apenas domínios confiáveis
-7. **Validação** - Sempre validar inputs
-
----
-
-## 🐛 Troubleshooting
-
-### Erro: "Port 8000 already in use"
 ```bash
-# Linux/Mac: Matar processo na porta 8000
-lsof -ti:8000 | xargs kill -9
-
-# Ou usar outra porta:
-python vigilancia_backend.py --port 8001
+python scripts/seed_data.py
 ```
 
-### Erro: "Module not found"
-```bash
-# Reinstalar dependências
-pip install --upgrade -r requirements.txt
-```
-
-### API não responde
-```bash
-# Verificar se servidor está rodando
-curl http://localhost:8000/api/health
+O script tenta registrar a conta demo e, se ela já existir, faz login e imprime as credenciais.
 
-# Se não responder, reinicie
-# Ctrl+C para parar, então:
-python vigilancia_backend.py
-```
+## Deploy com Docker Compose
 
-### Dados não aparecem
 ```bash
-# Execute o script de seed com a API rodando
-python seed_data.py
-```
-
----
-
-## 📚 Entendendo o Código
-
-### **vigilancia_backend.py**
-
-Estrutura:
+docker compose up --build
 ```
-1. IMPORTS - FastAPI, Pydantic, etc
-2. CONFIGURAÇÃO - Apps, routers
-3. MODELOS - Politician, Transaction, Alert
-4. DADOS - Listas em memória (para desenvolvimento)
-5. UTILITÁRIOS - Funções auxiliares
-6. ENDPOINTS - Rotas da API
-7. MIDDLEWARE - CORS, etc
-8. EXECUÇÃO - Main
-```
-
-**Áreas-chave:**
-
-- **Modelos (Pydantic)**: Definem estrutura dos dados
-- **Endpoints**: Rotas que a API expõe
-- **POLITICIANS_DB, TRANSACTIONS_DB, ALERTS_DB**: Armazenamento em memória
-
-Para **produção**, troque essas listas por MongoDB como no código original.
-
-### **seed_data.py**
-
-Faz 3 coisas:
-1. **Cria políticos** - Com dados reais brasileiros
-2. **Cria transações** - Simuladas com padrões variados
-3. **Cria alertas** - Para transações suspeitas
-
-Fácil expandir:
-- Adicione mais políticos em `POLITICIANS`
-- Mude número de transações em `create_transactions()`
-- Customize mensagens de alerta em `ALERT_MESSAGES`
-
----
-
-## 🎓 Aprendizado
-
-Este sistema te ensina:
-
-- ✅ FastAPI (framework moderno Python)
-- ✅ REST APIs (endpoints, JSON)
-- ✅ Pydantic (validação de dados)
-- ✅ Documentação automática (Swagger)
-- ✅ CORS (compartilhamento de recursos)
-- ✅ Estrutura de projeto profissional
-
----
-
-## ⚖️ Transparência Total
-
-**Nenhuma censura aqui:**
 
-- ✅ Todos os dados são públicos
-- ✅ Sem filtros seletivos
-- ✅ Sem exclusão de registros
-- ✅ Código aberto
-- ✅ Fácil auditoria
+Serviços publicados:
 
-Se você quer adicionar segurança específica (autenticação, permissões), é **sua escolha consciente**.
+- Frontend: `http://localhost:3000`
+- Backend: `http://localhost:8000`
+- PostgreSQL: porta interna do compose
 
----
+## Variáveis importantes
 
-## 📞 Próximos Passos
+### Backend
 
-1. **Rode o backend** - `python vigilancia_backend.py`
-2. **Popule dados** - `python seed_data.py`
-3. **Acesse Swagger** - http://localhost:8000/docs
-4. **Teste endpoints** - Use a interface Swagger
-5. **Crie frontend** - Conecte à API
-6. **Expanda dados** - Adicione mais políticos/transações
-7. **Implemente segurança** - JWT, BD real, etc
+- `DATABASE_URL`: SQLite ou PostgreSQL.
+- `SECRET_KEY`: segredo para assinar JWT.
+- `ACCESS_TOKEN_EXPIRE_HOURS`: duração do token.
+- `CORS_ORIGINS`: origens permitidas no frontend.
 
----
+### Frontend
 
-## 📖 Referências
+- `REACT_APP_BACKEND_URL`: base URL da API.
 
-- FastAPI: https://fastapi.tiangolo.com/
-- Pydantic: https://docs.pydantic.dev/
-- Uvicorn: https://www.uvicorn.org/
-- OpenAPI/Swagger: https://swagger.io/
+## Fluxo SaaS implementado
 
----
+1. Usuário cria uma conta em `/auth`.
+2. A API cria um workspace próprio.
+3. O backend faz seed dos dados iniciais.
+4. O frontend guarda o token e restaura a sessão.
+5. O dashboard exibe métricas, alertas, transações e permite cadastrar novos políticos.
 
-**Vigília**: Vigilância Política Genuína. Transparência. Sem Censura.
+## Próximas evoluções recomendadas
 
-Made for Gustavo 🇧🇷
+- cobrança real com Stripe ou Mercado Pago;
+- RBAC com múltiplos membros por workspace;
+- webhooks e ingestão automática de dados externos;
+- migrations com Alembic;
+- testes E2E com Playwright.
 
EOF
)

## Coleta real do Portal da Transparência

Para escanear dados públicos de despesas federais e associar nomes aos registros de transação, use o script:

```bash
python scripts/associate_portal_transparencia.py --ano 2025 --mes 1 --max-paginas 50 --output-dir output/transparencia
```

Pré-requisito: definir a chave da API oficial do Portal da Transparência.

```bash
export PORTAL_TRANSPARENCIA_API_KEY="sua-chave"
```

Saídas geradas:
- `transactions_with_names.csv`: uma linha por transação com nome e documento do favorecido.
- `association_summary.csv`: consolidação por documento + nome do favorecido.
