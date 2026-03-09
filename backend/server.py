from datetime import datetime, timezone
import logging
import os
from pathlib import Path
from typing import List, Optional
import uuid

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")

BITCOIN_ADDRESS_URL = "https://www.blockexplorer.com/bitcoin/address/{value}"
BITCOIN_TX_URL = "https://www.blockexplorer.com/bitcoin/tx/{value}"


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def parse_datetime(value):
    if isinstance(value, datetime) or value is None:
        return value
    normalized = value.replace("Z", "+00:00") if isinstance(value, str) else value
    return datetime.fromisoformat(normalized)


def infer_network(*values: Optional[str]) -> str:
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
    if not value:
        return None
    if network == "bitcoin":
        if kind == "address":
            return BITCOIN_ADDRESS_URL.format(value=value)
        if kind == "tx":
            return BITCOIN_TX_URL.format(value=value)
    return None


class WalletDetail(BaseModel):
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
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    party: str
    position: str
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
    created_at: datetime = Field(default_factory=now_utc)


class PoliticianCreate(BaseModel):
    name: str
    party: str
    position: str
    wallets: List[str] = Field(default_factory=list)
    wallet_details: List[WalletDetail] = Field(default_factory=list)
    monitored_networks: List[str] = Field(default_factory=list)
    blockchain_focus: Optional[str] = None
    verified: bool = False
    image_url: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None


class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tx_hash: str
    politician_id: str
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
    timestamp: datetime = Field(default_factory=now_utc)
    status: str = "verified"
    description: Optional[str] = None


class TransactionCreate(BaseModel):
    tx_hash: str
    politician_id: str
    from_address: str
    to_address: str
    amount: float
    currency: str = "BTC"
    network: Optional[str] = None
    explorer_url: Optional[str] = None
    monitored_wallet: Optional[str] = None
    counterparty_label: Optional[str] = None
    risk_flags: List[str] = Field(default_factory=list)
    block_height: Optional[int] = None
    value_brl: Optional[float] = None
    status: str = "verified"
    description: Optional[str] = None


class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    politician_id: str
    politician_name: str
    severity: str
    alert_type: str
    message: str
    timestamp: datetime = Field(default_factory=now_utc)
    resolved: bool = False


class AlertCreate(BaseModel):
    politician_id: str
    politician_name: str
    severity: str
    alert_type: str
    message: str


def normalize_wallet_detail(raw_wallet, index: int = 0) -> WalletDetail:
    if isinstance(raw_wallet, str):
        network = infer_network(raw_wallet)
        return WalletDetail(
            address=raw_wallet,
            network=network,
            label=f"Carteira monitorada {index + 1}",
            explorer_url=explorer_url_for(network, "address", raw_wallet),
            monitoring_status="monitoring",
            risk_level="medium" if index == 0 else "low",
        )

    address = raw_wallet.get("address", "")
    network = raw_wallet.get("network") or infer_network(address)
    return WalletDetail(
        address=address,
        network=network,
        label=raw_wallet.get("label") or f"Carteira monitorada {index + 1}",
        explorer_url=raw_wallet.get("explorer_url") or explorer_url_for(network, "address", address),
        monitoring_status=raw_wallet.get("monitoring_status") or "monitoring",
        risk_level=raw_wallet.get("risk_level") or "low",
        notes=raw_wallet.get("notes"),
        last_checked_at=parse_datetime(raw_wallet.get("last_checked_at")),
    )


def serialize_wallet_details(wallet_details: List[WalletDetail]) -> List[dict]:
    serialized = []
    for wallet in wallet_details:
        item = wallet.model_dump()
        if item["last_checked_at"]:
            item["last_checked_at"] = item["last_checked_at"].isoformat()
        serialized.append(item)
    return serialized


def normalize_politician_doc(doc: dict) -> dict:
    wallet_source = doc.get("wallet_details") or doc.get("wallets", [])
    wallet_details = [normalize_wallet_detail(wallet, idx) for idx, wallet in enumerate(wallet_source)]

    doc["wallet_details"] = wallet_details
    doc["wallets"] = [wallet.address for wallet in wallet_details]
    doc["monitored_networks"] = sorted({wallet.network for wallet in wallet_details})
    doc["created_at"] = parse_datetime(doc.get("created_at"))
    return doc


def normalize_transaction_doc(doc: dict) -> dict:
    network = doc.get("network") or infer_network(doc.get("from_address"), doc.get("to_address"), doc.get("monitored_wallet"))
    doc["network"] = network
    doc["explorer_url"] = doc.get("explorer_url") or explorer_url_for(network, "tx", doc.get("tx_hash"))
    doc["monitored_wallet"] = doc.get("monitored_wallet") or doc.get("to_address") or doc.get("from_address")
    doc["risk_flags"] = doc.get("risk_flags", [])
    doc["timestamp"] = parse_datetime(doc.get("timestamp"))
    return doc


def normalize_alert_doc(doc: dict) -> dict:
    doc["timestamp"] = parse_datetime(doc.get("timestamp"))
    return doc


@api_router.post("/politicians", response_model=Politician)
async def create_politician(input: PoliticianCreate):
    politician_dict = input.model_dump(exclude_none=True)
    raw_wallet_details = politician_dict.pop("wallet_details", [])
    wallet_source = raw_wallet_details or politician_dict.get("wallets", [])
    wallet_details = [normalize_wallet_detail(wallet, idx) for idx, wallet in enumerate(wallet_source)]
    politician_dict["wallets"] = [wallet.address for wallet in wallet_details]
    politician_dict["wallet_details"] = wallet_details
    politician_dict["monitored_networks"] = sorted({wallet.network for wallet in wallet_details})

    politician_obj = Politician(**politician_dict)

    doc = politician_obj.model_dump()
    doc["created_at"] = politician_obj.created_at.isoformat()
    doc["wallet_details"] = serialize_wallet_details(politician_obj.wallet_details)

    await db.politicians.insert_one(doc)
    return politician_obj


@api_router.get("/politicians", response_model=List[Politician])
async def get_politicians():
    politicians = await db.politicians.find({}, {"_id": 0}).to_list(1000)
    return [normalize_politician_doc(doc) for doc in politicians]


@api_router.get("/politicians/{politician_id}", response_model=Politician)
async def get_politician(politician_id: str):
    politician = await db.politicians.find_one({"id": politician_id}, {"_id": 0})

    if not politician:
        raise HTTPException(status_code=404, detail="Politician not found")

    return normalize_politician_doc(politician)


@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(input: TransactionCreate):
    transaction_dict = input.model_dump(exclude_none=True)
    network = transaction_dict.get("network") or infer_network(
        transaction_dict.get("from_address"),
        transaction_dict.get("to_address"),
        transaction_dict.get("monitored_wallet"),
    )

    transaction_dict["network"] = network
    transaction_dict["explorer_url"] = transaction_dict.get("explorer_url") or explorer_url_for(network, "tx", transaction_dict["tx_hash"])
    transaction_dict["monitored_wallet"] = transaction_dict.get("monitored_wallet") or transaction_dict.get("to_address")

    transaction_obj = Transaction(**transaction_dict)

    doc = transaction_obj.model_dump()
    doc["timestamp"] = transaction_obj.timestamp.isoformat()

    await db.transactions.insert_one(doc)

    await db.politicians.update_one(
        {"id": input.politician_id},
        {"$inc": {"total_transactions": 1, "suspicious_count": 1 if input.status == "suspicious" else 0}},
    )

    return transaction_obj


@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(limit: int = 100):
    transactions = await db.transactions.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    return [normalize_transaction_doc(doc) for doc in transactions]


@api_router.get("/transactions/politician/{politician_id}", response_model=List[Transaction])
async def get_politician_transactions(politician_id: str):
    transactions = await db.transactions.find({"politician_id": politician_id}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    return [normalize_transaction_doc(doc) for doc in transactions]


@api_router.post("/alerts", response_model=Alert)
async def create_alert(input: AlertCreate):
    alert_obj = Alert(**input.model_dump())

    doc = alert_obj.model_dump()
    doc["timestamp"] = alert_obj.timestamp.isoformat()

    await db.alerts.insert_one(doc)
    return alert_obj


@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(limit: int = 50):
    alerts = await db.alerts.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    return [normalize_alert_doc(doc) for doc in alerts]


@api_router.get("/stats")
async def get_stats():
    total_politicians = await db.politicians.count_documents({})
    total_transactions = await db.transactions.count_documents({})
    suspicious_transactions = await db.transactions.count_documents({"status": "suspicious"})
    active_alerts = await db.alerts.count_documents({"resolved": False})

    politicians = await db.politicians.find({}, {"_id": 0, "wallet_details": 1, "wallets": 1}).to_list(1000)
    wallet_total = 0
    networks = set()
    for politician in politicians:
        wallet_source = politician.get("wallet_details") or politician.get("wallets", [])
        normalized_wallets = [normalize_wallet_detail(wallet, idx) for idx, wallet in enumerate(wallet_source)]
        wallet_total += len(normalized_wallets)
        networks.update(wallet.network for wallet in normalized_wallets)

    return {
        "total_politicians": total_politicians,
        "total_transactions": total_transactions,
        "suspicious_transactions": suspicious_transactions,
        "active_alerts": active_alerts,
        "total_wallets": wallet_total,
        "monitored_networks": sorted(networks),
        "primary_explorer": "BlockExplorer",
    }


@api_router.get("/")
async def root():
    return {"message": "Vigília API - Blockchain Politics Vigilance"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ["CORS_ORIGINS"].split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
