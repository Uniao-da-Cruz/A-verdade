# VIGÍLIA - Arquitetura do Sistema

## 🏗️ Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVEGADOR / APP MOBILE                    │
│                   (Frontend - Não incluído)                  │
└───────────────┬─────────────────────────────────────────────┘
                │
                │ HTTP/REST
                │
┌───────────────▼─────────────────────────────────────────────┐
│                                                               │
│                  VIGÍLIA API (FastAPI)                       │
│                  http://localhost:8000                       │
│                                                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  /api/politics │  │  /api/trans... │  │   /api/alerts  │ │
│  │  GET, POST     │  │   GET, POST    │  │   GET, POST    │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│                                                               │
│  ┌────────────────┐  ┌────────────────┐                     │
│  │  /api/stats    │  │   /api/health  │                     │
│  │     GET        │  │      GET       │                     │
│  └────────────────┘  └────────────────┘                     │
│                                                               │
│  Middleware: CORS (permite todas as origens)                │
│                                                               │
└───────────────┬─────────────────────────────────────────────┘
                │
                │ Armazena em memória
                │ (Para dev local)
                │
┌───────────────▼─────────────────────────────────────────────┐
│                    BASE DE DADOS MEMÓRIA                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ POLITICIANS_DB  │  │ TRANSACTIONS_DB │  │  ALERTS_DB  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Modelos de Dados

### **Politician**
```json
{
  "id": "uuid",
  "name": "Nome Completo",
  "party": "Partido",
  "position": "Cargo",
  "state": "UF",
  "wallets": ["endereço1", "endereço2"],
  "wallet_details": [
    {
      "address": "0x123...",
      "network": "bitcoin",
      "label": "Wallet Principal",
      "risk_level": "low",
      "monitoring_status": "monitoring"
    }
  ],
  "monitored_networks": ["bitcoin", "ethereum"],
  "total_transactions": 15,
  "suspicious_count": 3,
  "verified": true,
  "instagram": "nome_instagram",
  "twitter": "nome_twitter",
  "youtube": "canal_youtube",
  "created_at": "2025-03-22T10:30:00"
}
```

### **Transaction**
```json
{
  "id": "uuid",
  "tx_hash": "0x123...",
  "politician_id": "uuid",
  "politician_name": "Nome",
  "from_address": "0xAAA...",
  "to_address": "0xBBB...",
  "amount": 125.50,
  "currency": "BTC",
  "network": "bitcoin",
  "explorer_url": "https://...",
  "status": "verified|suspicious|pending",
  "description": "Descrição da transação",
  "timestamp": "2025-03-22T15:45:00"
}
```

### **Alert**
```json
{
  "id": "uuid",
  "politician_id": "uuid",
  "politician_name": "Nome",
  "severity": "low|medium|high|critical",
  "alert_type": "Large Transaction|Pattern Anomaly|etc",
  "message": "Descrição do alerta",
  "resolved": false,
  "timestamp": "2025-03-22T16:00:00"
}
```

---

## 🔌 Endpoints Disponíveis

### **POLÍTICOS**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/politicians` | Criar novo político |
| GET | `/api/politicians` | Listar todos |
| GET | `/api/politicians/{id}` | Obter um específico |

### **TRANSAÇÕES**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/transactions` | Registrar nova transação |
| GET | `/api/transactions` | Listar recentes (limit=100) |
| GET | `/api/transactions/politician/{id}` | Transações de um político |

### **ALERTAS**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/alerts` | Criar novo alerta |
| GET | `/api/alerts` | Listar alertas (limit=50) |

### **UTILITÁRIOS**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/stats` | Estatísticas do sistema |
| GET | `/api/health` | Verificar saúde da API |
| GET | `/api/` | Raiz (informações) |

---

## 🔄 Fluxo de Dados

### **1. Criar Político**
```
Frontend envia POST /api/politicians
    ↓
FastAPI valida com PoliticianCreate (Pydantic)
    ↓
Normaliza wallets (detecta rede blockchain)
    ↓
Cria objeto Politician com UUID
    ↓
Armazena em POLITICIANS_DB
    ↓
Retorna Politician (JSON)
```

### **2. Registrar Transação**
```
Frontend envia POST /api/transactions
    ↓
FastAPI valida com TransactionCreate
    ↓
Detecta rede blockchain (bitcoin/ethereum)
    ↓
Gera explorer URL (BlockExplorer)
    ↓
Cria objeto Transaction com UUID
    ↓
Armazena em TRANSACTIONS_DB
    ↓
Atualiza contadores do Politician
    ↓
Retorna Transaction (JSON)
```

### **3. Criar Alerta**
```
Frontend envia POST /api/alerts
    ↓
FastAPI valida com AlertCreate
    ↓
Cria objeto Alert com UUID
    ↓
Armazena em ALERTS_DB
    ↓
Retorna Alert (JSON)
```

### **4. Obter Estatísticas**
```
Frontend GET /api/stats
    ↓
FastAPI conta elementos em cada DB
    ↓
Coleta redes monitoradas
    ↓
Retorna objeto com totais e estatísticas
```

---

## 📁 Estrutura de Arquivos

```
vigilancia/
├── vigilancia_backend.py     # Servidor FastAPI
├── requirements.txt          # Dependências Python
├── seed_data.py             # Script de dados de exemplo
├── README.md                # Este arquivo
└── .env (opcional)          # Variáveis de ambiente
```

---

## 🔐 Segurança

### **Desenvolvimento (Atual)**
- ✅ CORS aberto (permite qualquer origem)
- ✅ Sem autenticação
- ✅ Dados em memória
- ✅ HTTP (não HTTPS)

### **Para Produção**
Adicionar:

```python
# 1. Autenticação JWT
from fastapi.security import HTTPBearer, HTTPAuthCredential

# 2. Rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

# 3. Banco de dados real
from pymongo import MongoClient

# 4. CORS restritivo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://seu-dominio.com"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# 5. HTTPS
# Use em servidor com SSL (Let's Encrypt)
```

---

## 🚀 Escalabilidade

### **Fase 1: Local (Atual)**
- ✅ Desenvolvimento
- ✅ Prototipagem
- ✅ Aprendizado
- Limite: Uma máquina, memória RAM

### **Fase 2: Servidor VPS**
```
Substituir:
- Dados em memória → MongoDB
- HTTP → HTTPS (Let's Encrypt)
- CORS aberto → Domínio específico
- Sem auth → JWT/OAuth2
```

### **Fase 3: Produção em Escala**
```
Adicionar:
- Load balancer (NGINX)
- Cache Redis
- CDN (Cloudflare)
- Monitoramento (Sentry)
- Logging (ELK Stack)
- CI/CD (GitHub Actions)
```

---

## 🛠️ Tecnologias Usadas

| Componente | Tecnologia | Por quê? |
|-----------|-----------|---------|
| Framework Web | FastAPI | Rápido, moderno, validação automática |
| Validação | Pydantic | Forte tipagem, autocomplete |
| Servidor | Uvicorn | Async, rápido, ASGI |
| Documentação | Swagger/OpenAPI | Automática, interativa |
| Linguagem | Python | Legível, poderosa, comunidade grande |
| BD (Dev) | Memória | Rápido para testes |
| BD (Prod) | MongoDB | Flexible schema, JSON-like |

---

## 📈 Métricas do Sistema

O endpoint `/api/stats` retorna:

```json
{
  "total_politicians": 9,
  "total_transactions": 128,
  "suspicious_transactions": 32,
  "active_alerts": 21,
  "total_wallets": 14,
  "monitored_networks": ["bitcoin", "ethereum"],
  "primary_explorer": "BlockExplorer",
  "timestamp": "2025-03-22T15:45:00"
}
```

---

## 🔍 Detecção de Rede Blockchain

Algoritmo automático:

```
Endereço começa com:
├─ "bc1" ou "1" ou "3" → BITCOIN
├─ "0x" → ETHEREUM
└─ Padrão → BITCOIN
```

---

## 🌐 Integração Frontend

### **React (Exemplo)**
```javascript
const response = await fetch('http://localhost:8000/api/politicians');
const politicians = await response.json();
```

### **Vue.js (Exemplo)**
```javascript
axios.get('http://localhost:8000/api/stats')
  .then(res => this.stats = res.data)
```

### **Vanilla JS (Exemplo)**
```javascript
fetch('http://localhost:8000/api/alerts')
  .then(r => r.json())
  .then(alerts => console.log(alerts))
```

---

## 🐛 Debugging

### **Ver requisições**
```bash
# Terminal com debug
python -m pdb vigilancia_backend.py
```

### **Logs da API**
A API imprime todas as requisições:
```
INFO:     Started server process [12345]
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     GET /api/politicians
INFO:     POST /api/transactions
```

### **Testar endpoints**
```bash
# Usando curl
curl -X POST http://localhost:8000/api/politicians \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","party":"TEST","position":"Tester"}'
```

---

## 📊 Próximas Melhorias

- [ ] Autenticação JWT
- [ ] Banco de dados MongoDB
- [ ] WebSocket para atualizações em tempo real
- [ ] Cache Redis
- [ ] Rate limiting
- [ ] Logging estruturado
- [ ] Testes unitários
- [ ] Docker/Docker Compose
- [ ] CI/CD com GitHub Actions
- [ ] Frontend web
- [ ] App mobile

---

**Vigília**: Vigilância Política Transparente

Made for Gustavo 🇧🇷
