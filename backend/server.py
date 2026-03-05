from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class Politician(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    party: str
    position: str
    wallets: List[str] = Field(default_factory=list)
    total_transactions: int = 0
    suspicious_count: int = 0
    verified: bool = False
    image_url: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PoliticianCreate(BaseModel):
    name: str
    party: str
    position: str
    wallets: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None


class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tx_hash: str
    politician_id: str
    from_address: str
    to_address: str
    amount: float
    currency: str = "ETH"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "verified"  # verified, suspicious, pending
    description: Optional[str] = None


class TransactionCreate(BaseModel):
    tx_hash: str
    politician_id: str
    from_address: str
    to_address: str
    amount: float
    currency: str = "ETH"
    status: str = "verified"
    description: Optional[str] = None


class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    politician_id: str
    politician_name: str
    severity: str  # low, medium, high, critical
    alert_type: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved: bool = False


class AlertCreate(BaseModel):
    politician_id: str
    politician_name: str
    severity: str
    alert_type: str
    message: str


# Politicians endpoints
@api_router.post("/politicians", response_model=Politician)
async def create_politician(input: PoliticianCreate):
    politician_dict = input.model_dump()
    politician_obj = Politician(**politician_dict)
    
    doc = politician_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.politicians.insert_one(doc)
    return politician_obj


@api_router.get("/politicians", response_model=List[Politician])
async def get_politicians():
    politicians = await db.politicians.find({}, {"_id": 0}).to_list(1000)
    
    for pol in politicians:
        if isinstance(pol['created_at'], str):
            pol['created_at'] = datetime.fromisoformat(pol['created_at'])
    
    return politicians


@api_router.get("/politicians/{politician_id}", response_model=Politician)
async def get_politician(politician_id: str):
    politician = await db.politicians.find_one({"id": politician_id}, {"_id": 0})
    
    if not politician:
        raise HTTPException(status_code=404, detail="Politician not found")
    
    if isinstance(politician['created_at'], str):
        politician['created_at'] = datetime.fromisoformat(politician['created_at'])
    
    return politician


# Transactions endpoints
@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(input: TransactionCreate):
    transaction_dict = input.model_dump()
    transaction_obj = Transaction(**transaction_dict)
    
    doc = transaction_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.transactions.insert_one(doc)
    
    # Update politician stats
    await db.politicians.update_one(
        {"id": input.politician_id},
        {"$inc": {"total_transactions": 1, "suspicious_count": 1 if input.status == "suspicious" else 0}}
    )
    
    return transaction_obj


@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(limit: int = 100):
    transactions = await db.transactions.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    
    for tx in transactions:
        if isinstance(tx['timestamp'], str):
            tx['timestamp'] = datetime.fromisoformat(tx['timestamp'])
    
    return transactions


@api_router.get("/transactions/politician/{politician_id}", response_model=List[Transaction])
async def get_politician_transactions(politician_id: str):
    transactions = await db.transactions.find({"politician_id": politician_id}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    
    for tx in transactions:
        if isinstance(tx['timestamp'], str):
            tx['timestamp'] = datetime.fromisoformat(tx['timestamp'])
    
    return transactions


# Alerts endpoints
@api_router.post("/alerts", response_model=Alert)
async def create_alert(input: AlertCreate):
    alert_dict = input.model_dump()
    alert_obj = Alert(**alert_dict)
    
    doc = alert_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.alerts.insert_one(doc)
    return alert_obj


@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(limit: int = 50):
    alerts = await db.alerts.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    
    for alert in alerts:
        if isinstance(alert['timestamp'], str):
            alert['timestamp'] = datetime.fromisoformat(alert['timestamp'])
    
    return alerts


@api_router.get("/stats")
async def get_stats():
    total_politicians = await db.politicians.count_documents({})
    total_transactions = await db.transactions.count_documents({})
    suspicious_transactions = await db.transactions.count_documents({"status": "suspicious"})
    active_alerts = await db.alerts.count_documents({"resolved": False})
    
    return {
        "total_politicians": total_politicians,
        "total_transactions": total_transactions,
        "suspicious_transactions": suspicious_transactions,
        "active_alerts": active_alerts
    }


@api_router.get("/")
async def root():
    return {"message": "Vigília API - Blockchain Politics Vigilance"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
