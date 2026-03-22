 """
VIGÍLIA - Backend de Vigilância Política
Sistema transparente de monitoramento de transações e atividades políticas
Sem censura. Sem filtros seletivos. Dados públicos genuínos.
"""

from datetime import datetime, timezone
import os
from typing import List, Optional
import uuid

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field


# ============================================================================
# CONFIGURAÇÃO CORE
# ============================================================================

app = FastAPI(title="Vigília API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# URLs de exploradores blockchain
BITCOIN_ADDRESS_URL = "https://www.blockexplorer.com/bitcoin/address/{value}"
BITCOIN_TX_URL = "https://www.blockexplorer.com/bitcoin/tx/{value}"


# ============================================================================
# MODELOS DE DADOS (Pydantic)
# ============================================================================

class WalletDetail(BaseModel):
    """Detalhes de uma carteira monitorada"""
    model_config = ConfigDict(extra="ignore")
    
    address: str
    network: str = "bitcoin"
    label: Optional[str] = None
    explorer_url: Optional[str] = None
    monitoring_status: str = "monitoring"
    risk_level: str = "low"
    notes: Optional[str] = None
    last_checked_at: Optional[datetime] = None


class Politician(BaseModel):
    """Modelo de político com carteiras monitoradas"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    party: str
    position: str
    state: Optional[str] = None
    wallets: List[str] = Field(default_factory=list)
    wallet_details: List[WalletDetail] = Field(default_factory=list)
    monitored_networks: List[str] = Field(default_factory=list)
    blockchain_focus: Optional[str] = None
    total_transactions: int = 0
    suspicious_count: int = 0
    verified: bool = False
    image_url: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PoliticianCreate(BaseModel):
    """Input para criar político"""
    name: str
    party: str
    position: str
    state: Optional[str] = None
    wallets: List[str] = Field(default_factory=list)
    wallet_details: List[WalletDetail] = Field(default_factory=list)
    verified: bool = False
    image_url: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None


class Transaction(BaseModel):
    """Modelo de transação blockchain"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tx_hash: str
    politician_id: str
    politician_name: str
    from_address: str
    to_address: str
    amount: float
    currency: str = "BTC"
    network: str = "bitcoin"
    explorer_url: Optional[str] = None
    monitored_wallet: Optional[str] = None
    counterparty_label: Optional[str] = None
    risk_flags: List[str] = Field(default_factory=list)
    block_height: Optional[int] = None
    value_brl: Optional[float] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "verified"
    description: Optional[str] = None


class TransactionCreate(BaseModel):
    """Input para criar transação"""
    tx_hash: str
    politician_id: str
    politician_name: str
    from_address: str
    to_address: str
    amount: float
    currency: str = "BTC"
    network: Optional[str] = None
    explorer_url: Optional[str] = None
    monitored_wallet: Optional[str] = None
    counterparty_label: Optional[str] = None
    risk_flags: List[str] = Field(default_factory=list)
    status: str = "verified"
    description: Optional[str] = None


class Alert(BaseModel):
    """Modelo de alerta de atividade suspeita"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    politician_id: str
    politician_name: str
    severity: str
    alert_type: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved: bool = False


class AlertCreate(BaseModel):
    """Input para criar alerta"""
    politician_id: str
    politician_name: str
    severity: str
    alert_type: str
    message: str


# ============================================================================
# DADOS EM MEMÓRIA (Para desenvolvimento local)
# Em produção: usar MongoDB conforme código original
# ============================================================================

POLITICIANS_DB: List[Politician] = []
TRANSACTIONS_DB: List[Transaction] = []
ALERTS_DB: List[Alert] = []


# ============================================================================
# UTILITÁRIOS
# ============================================================================

def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def parse_datetime(value):
    if isinstance(value, datetime) or value is None:
        return value
    normalized = value.replace("Z", "+00:00") if isinstance(value, str) else value
    return datetime.fromisoformat(normalized)


def infer_network(*values: Optional[str]) -> str:
    """Detecta rede blockchain pelo formato do endereço"""
    for value in values:
        if not value:
            continue
        lowered = value.lower()
        if lowered.startswith("bc1") or value.startswith("1") or value.startswith("3"):
            return "bitcoin"
        if lowered.startswith("0x"):
            return "ethereum"
    return "bitcoin"


def explorer_url_for(network: str, kind: str, value: Optional[str]) -> Optional[str]:
    """Gera URL do explorador blockchain"""
    if not value:
        return None
    if network == "bitcoin":
        if kind == "address":
            return BITCOIN_ADDRESS_URL.format(value=value)
        if kind == "tx":
            return BITCOIN_TX_URL.format(value=value)
    return None


def normalize_wallet_detail(raw_wallet, index: int = 0) -> WalletDetail:
    """Normaliza detalhes de carteira"""
    if isinstance(raw_wallet, str):
        network = infer_network(raw_wallet)
        return WalletDetail(
            address=raw_wallet,
            network=network,
            label=f"Wallet {index + 1}",
            explorer_url=explorer_url_for(network, "address", raw_wallet),
        )
    
    address = raw_wallet.get("address", "")
    network = raw_wallet.get("network") or infer_network(address)
    return WalletDetail(
        address=address,
        network=network,
        label=raw_wallet.get("label") or f"Wallet {index + 1}",
        explorer_url=raw_wallet.get("explorer_url") or explorer_url_for(network, "address", address),
        monitoring_status=raw_wallet.get("monitoring_status") or "monitoring",
        risk_level=raw_wallet.get("risk_level") or "low",
        notes=raw_wallet.get("notes"),
        last_checked_at=parse_datetime(raw_wallet.get("last_checked_at")),
    )


# ============================================================================
# ENDPOINTS - POLÍTICOS
# ============================================================================

@api_router.post("/politicians", response_model=Politician)
async def create_politician(input: PoliticianCreate):
    """Cria novo político no sistema"""
    politician_dict = input.model_dump(exclude_none=True)
    raw_wallet_details = politician_dict.pop("wallet_details", [])
    wallet_source = raw_wallet_details or politician_dict.get("wallets", [])
    wallet_details = [normalize_wallet_detail(wallet, idx) for idx, wallet in enumerate(wallet_source)]
    
    politician_dict["wallets"] = [wallet.address for wallet in wallet_details]
    politician_dict["wallet_details"] = wallet_details
    politician_dict["monitored_networks"] = sorted({wallet.network for wallet in wallet_details})
    
    politician = Politician(**politician_dict)
    POLITICIANS_DB.append(politician)
    
    return politician


@api_router.get("/politicians", response_model=List[Politician])
async def get_politicians():
    """Lista todos os políticos monitorados"""
    return POLITICIANS_DB


@api_router.get("/politicians/{politician_id}", response_model=Politician)
async def get_politician(politician_id: str):
    """Obtém detalhes de um político específico"""
    for politician in POLITICIANS_DB:
        if politician.id == politician_id:
            return politician
    raise HTTPException(status_code=404, detail="Politician not found")


# ============================================================================
# ENDPOINTS - TRANSAÇÕES
# ============================================================================

@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(input: TransactionCreate):
    """Registra nova transação"""
    transaction_dict = input.model_dump(exclude_none=True)
    network = transaction_dict.get("network") or infer_network(
        transaction_dict.get("from_address"),
        transaction_dict.get("to_address"),
    )
    
    transaction_dict["network"] = network
    transaction_dict["explorer_url"] = transaction_dict.get("explorer_url") or explorer_url_for(
        network, "tx", transaction_dict.get("tx_hash")
    )
    
    transaction = Transaction(**transaction_dict)
    TRANSACTIONS_DB.append(transaction)
    
    # Atualiza contador de transações do político
    for politician in POLITICIANS_DB:
        if politician.id == input.politician_id:
            politician.total_transactions += 1
            if input.status == "suspicious":
                politician.suspicious_count += 1
    
    return transaction


@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(limit: int = 100):
    """Lista transações recentes"""
    sorted_txs = sorted(TRANSACTIONS_DB, key=lambda x: x.timestamp, reverse=True)
    return sorted_txs[:limit]


@api_router.get("/transactions/politician/{politician_id}", response_model=List[Transaction])
async def get_politician_transactions(politician_id: str):
    """Lista transações de um político específico"""
    txs = [tx for tx in TRANSACTIONS_DB if tx.politician_id == politician_id]
    return sorted(txs, key=lambda x: x.timestamp, reverse=True)


# ============================================================================
# ENDPOINTS - ALERTAS
# ============================================================================

@api_router.post("/alerts", response_model=Alert)
async def create_alert(input: AlertCreate):
    """Cria novo alerta de atividade suspeita"""
    alert = Alert(**input.model_dump())
    ALERTS_DB.append(alert)
    return alert


@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(limit: int = 50):
    """Lista alertas recentes"""
    sorted_alerts = sorted(ALERTS_DB, key=lambda x: x.timestamp, reverse=True)
    return sorted_alerts[:limit]


# ============================================================================
# ENDPOINTS - ESTATÍSTICAS
# ============================================================================

@api_router.get("/stats")
async def get_stats():
    """Retorna estatísticas agregadas do sistema"""
    total_politicians = len(POLITICIANS_DB)
    total_transactions = len(TRANSACTIONS_DB)
    suspicious_transactions = len([tx for tx in TRANSACTIONS_DB if tx.status == "suspicious"])
    active_alerts = len([a for a in ALERTS_DB if not a.resolved])
    
    # Contar carteiras
    total_wallets = sum(len(p.wallets) for p in POLITICIANS_DB)
    networks = set()
    for politician in POLITICIANS_DB:
        networks.update(politician.monitored_networks)
    
    return {
        "total_politicians": total_politicians,
        "total_transactions": total_transactions,
        "suspicious_transactions": suspicious_transactions,
        "active_alerts": active_alerts,
        "total_wallets": total_wallets,
        "monitored_networks": sorted(networks),
        "primary_explorer": "BlockExplorer",
        "timestamp": now_utc().isoformat()
    }


# ============================================================================
# HEALTH CHECK
# ============================================================================

@api_router.get("/health")
async def health_check():
    """Verifica saúde da API"""
    return {
        "status": "healthy",
        "timestamp": now_utc().isoformat(),
        "version": "1.0.0"
    }


@api_router.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "message": "Vigília - Vigilância Política Transparente",
        "documentation": "/docs",
        "health": "/api/health"
    }


# ============================================================================
# CONFIGURAÇÃO
# ============================================================================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# EXECUÇÃO
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    print("""
    ╔══════════════════════════════════════════════╗
    ║      VIGÍLIA - Vigilância Política           ║
    ║      Transparência. Sem Censura.             ║
    ╚══════════════════════════════════════════════╝
    
    API iniciando em http://localhost:8000
    Documentação: http://localhost:8000/docs
    """)
    uvicorn.run(app, host="0.0.0.0", port=8000)
