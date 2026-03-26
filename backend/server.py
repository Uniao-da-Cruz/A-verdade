from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Generator, List, Optional
from urllib.parse import quote_plus

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, create_engine, func, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, joinedload, mapped_column, relationship, sessionmaker


load_dotenv()

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "24"))
SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-in-production")
DEFAULT_CORS = "http://localhost:3000,http://127.0.0.1:3000"
BITCOIN_ADDRESS_URL = "https://mempool.space/address/{value}"
BITCOIN_TX_URL = "https://mempool.space/tx/{value}"
ETHEREUM_ADDRESS_URL = "https://etherscan.io/address/{value}"
ETHEREUM_TX_URL = "https://etherscan.io/tx/{value}"


class Base(DeclarativeBase):
    pass


class WorkspaceORM(Base):
    __tablename__ = "workspaces"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(120))
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    plan: Mapped[str] = mapped_column(String(40), default="starter")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    users: Mapped[List["UserORM"]] = relationship(back_populates="workspace", cascade="all, delete-orphan")
    politicians: Mapped[List["PoliticianORM"]] = relationship(back_populates="workspace", cascade="all, delete-orphan")


class UserORM(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id"), index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(40), default="owner")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    workspace: Mapped[WorkspaceORM] = relationship(back_populates="users")


class PoliticianORM(Base):
    __tablename__ = "politicians"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id"), index=True)
    name: Mapped[str] = mapped_column(String(140), index=True)
    party: Mapped[str] = mapped_column(String(80))
    position: Mapped[str] = mapped_column(String(120))
    state: Mapped[Optional[str]] = mapped_column(String(8), nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    instagram: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    twitter: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    youtube: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    blockchain_focus: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    total_transactions: Mapped[int] = mapped_column(Integer, default=0)
    suspicious_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    workspace: Mapped[WorkspaceORM] = relationship(back_populates="politicians")
    wallet_details: Mapped[List["WalletORM"]] = relationship(back_populates="politician", cascade="all, delete-orphan")
    transactions: Mapped[List["TransactionORM"]] = relationship(back_populates="politician", cascade="all, delete-orphan")
    alerts: Mapped[List["AlertORM"]] = relationship(back_populates="politician", cascade="all, delete-orphan")


class WalletORM(Base):
    __tablename__ = "wallets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    politician_id: Mapped[str] = mapped_column(ForeignKey("politicians.id"), index=True)
    address: Mapped[str] = mapped_column(String(255))
    network: Mapped[str] = mapped_column(String(40), default="bitcoin")
    label: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    explorer_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    monitoring_status: Mapped[str] = mapped_column(String(40), default="monitoring")
    risk_level: Mapped[str] = mapped_column(String(40), default="low")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    last_checked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    politician: Mapped[PoliticianORM] = relationship(back_populates="wallet_details")


class TransactionORM(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id"), index=True)
    politician_id: Mapped[str] = mapped_column(ForeignKey("politicians.id"), index=True)
    politician_name: Mapped[str] = mapped_column(String(140))
    tx_hash: Mapped[str] = mapped_column(String(255), index=True)
    from_address: Mapped[str] = mapped_column(String(255))
    to_address: Mapped[str] = mapped_column(String(255))
    amount: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(24), default="BTC")
    network: Mapped[str] = mapped_column(String(40), default="bitcoin")
    explorer_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    monitored_wallet: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    counterparty_label: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    risk_flags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    block_height: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    value_brl: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    status: Mapped[str] = mapped_column(String(40), default="verified")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    politician: Mapped[PoliticianORM] = relationship(back_populates="transactions")


class AlertORM(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id: Mapped[str] = mapped_column(ForeignKey("workspaces.id"), index=True)
    politician_id: Mapped[str] = mapped_column(ForeignKey("politicians.id"), index=True)
    politician_name: Mapped[str] = mapped_column(String(140))
    severity: Mapped[str] = mapped_column(String(40))
    alert_type: Mapped[str] = mapped_column(String(80))
    message: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)

    politician: Mapped[PoliticianORM] = relationship(back_populates="alerts")


def normalize_database_url(raw_url: str) -> str:
    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql+psycopg://", 1)
    if raw_url.startswith("postgresql://") and "+psycopg" not in raw_url:
        return raw_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return raw_url


DEFAULT_DATABASE_PATH = os.path.join(os.path.dirname(__file__), "vigilia.db")
DATABASE_URL = normalize_database_url(os.getenv("DATABASE_URL", f"sqlite:///{quote_plus(DEFAULT_DATABASE_PATH)}"))
if DATABASE_URL.startswith("sqlite:///") and "%2F" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("%2F", "/")

engine = create_engine(DATABASE_URL, future=True, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False, future=True)
Base.metadata.create_all(bind=engine)
security = HTTPBearer(auto_error=False)


class WalletDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    address: str
    network: str = "bitcoin"
    label: Optional[str] = None
    explorer_url: Optional[str] = None
    monitoring_status: str = "monitoring"
    risk_level: str = "low"
    notes: Optional[str] = None
    last_checked_at: Optional[datetime] = None


class PoliticianBase(BaseModel):
    name: str
    party: str
    position: str
    state: Optional[str] = None
    verified: bool = False
    image_url: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None
    blockchain_focus: Optional[str] = None


class PoliticianCreate(PoliticianBase):
    wallets: List[str] = Field(default_factory=list)
    wallet_details: List[WalletDetail] = Field(default_factory=list)


class PoliticianResponse(PoliticianBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    wallets: List[str] = Field(default_factory=list)
    wallet_details: List[WalletDetail] = Field(default_factory=list)
    monitored_networks: List[str] = Field(default_factory=list)
    total_transactions: int = 0
    suspicious_count: int = 0
    created_at: datetime


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


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tx_hash: str
    politician_id: str
    politician_name: str
    from_address: str
    to_address: str
    amount: float
    currency: str
    network: str
    explorer_url: Optional[str] = None
    monitored_wallet: Optional[str] = None
    counterparty_label: Optional[str] = None
    risk_flags: List[str] = Field(default_factory=list)
    block_height: Optional[int] = None
    value_brl: Optional[float] = None
    timestamp: datetime
    status: str
    description: Optional[str] = None


class AlertCreate(BaseModel):
    politician_id: str
    severity: str
    alert_type: str
    message: str
    resolved: bool = False


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    politician_id: str
    politician_name: str
    severity: str
    alert_type: str
    message: str
    timestamp: datetime
    resolved: bool


class PaginatedTransactions(BaseModel):
    items: List[TransactionResponse]
    total: int
    limit: int
    offset: int
    has_more: bool


class PaginatedAlerts(BaseModel):
    items: List[AlertResponse]
    total: int
    limit: int
    offset: int
    has_more: bool


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    created_at: datetime


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: str
    created_at: datetime


class AuthRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)
    workspace_name: Optional[str] = None


class AuthLogin(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    workspace: WorkspaceResponse


class DashboardStats(BaseModel):
    total_politicians: int
    total_transactions: int
    suspicious_transactions: int
    active_alerts: int
    total_wallets: int
    monitored_networks: List[str]
    primary_explorer: str
    workspace_name: str
    workspace_slug: str
    plan: str
    timestamp: datetime


class DashboardSnapshot(BaseModel):
    stats: DashboardStats
    politicians: List[PoliticianResponse]
    recent_transactions: List[TransactionResponse]
    recent_alerts: List[AlertResponse]


class HealthResponse(BaseModel):
    status: str
    database: str
    timestamp: datetime
    version: str


class UpdateWorkspacePlan(BaseModel):
    plan: str


def slugify(value: str) -> str:
    allowed = [c.lower() if c.isalnum() else "-" for c in value.strip()]
    slug = "".join(allowed)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-") or f"workspace-{secrets.token_hex(3)}"


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def parse_datetime(value: Optional[str | datetime]) -> Optional[datetime]:
    if value is None or isinstance(value, datetime):
        return value
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def infer_network(*values: Optional[str]) -> str:
    for value in values:
        if not value:
            continue
        lowered = value.lower()
        if lowered.startswith("0x"):
            return "ethereum"
        if lowered.startswith("bc1") or value.startswith("1") or value.startswith("3"):
            return "bitcoin"
    return "bitcoin"


def explorer_url_for(network: str, kind: str, value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    if network == "ethereum":
        return ETHEREUM_ADDRESS_URL.format(value=value) if kind == "address" else ETHEREUM_TX_URL.format(value=value)
    return BITCOIN_ADDRESS_URL.format(value=value) if kind == "address" else BITCOIN_TX_URL.format(value=value)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    iterations = 120000
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations)
    return f"pbkdf2_sha256${iterations}${salt}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt, hex_digest = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        new_digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), int(iterations))
        return hmac.compare_digest(new_digest.hex(), hex_digest)
    except ValueError:
        return False


def create_access_token(user: UserORM) -> str:
    expire = now_utc() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": user.id,
        "workspace_id": user.workspace_id,
        "email": user.email,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def serialize_wallet(wallet: WalletORM) -> WalletDetail:
    return WalletDetail.model_validate(wallet)


def serialize_politician(politician: PoliticianORM) -> PoliticianResponse:
    wallets = [wallet.address for wallet in politician.wallet_details]
    networks = sorted({wallet.network for wallet in politician.wallet_details})
    return PoliticianResponse(
        id=politician.id,
        name=politician.name,
        party=politician.party,
        position=politician.position,
        state=politician.state,
        verified=politician.verified,
        image_url=politician.image_url,
        instagram=politician.instagram,
        twitter=politician.twitter,
        youtube=politician.youtube,
        blockchain_focus=politician.blockchain_focus,
        wallets=wallets,
        wallet_details=[serialize_wallet(wallet) for wallet in politician.wallet_details],
        monitored_networks=networks,
        total_transactions=politician.total_transactions,
        suspicious_count=politician.suspicious_count,
        created_at=politician.created_at,
    )


def serialize_transaction(transaction: TransactionORM) -> TransactionResponse:
    flags = [flag for flag in (transaction.risk_flags or "").split("|") if flag]
    return TransactionResponse(
        id=transaction.id,
        tx_hash=transaction.tx_hash,
        politician_id=transaction.politician_id,
        politician_name=transaction.politician_name,
        from_address=transaction.from_address,
        to_address=transaction.to_address,
        amount=transaction.amount,
        currency=transaction.currency,
        network=transaction.network,
        explorer_url=transaction.explorer_url,
        monitored_wallet=transaction.monitored_wallet,
        counterparty_label=transaction.counterparty_label,
        risk_flags=flags,
        block_height=transaction.block_height,
        value_brl=transaction.value_brl,
        timestamp=transaction.timestamp,
        status=transaction.status,
        description=transaction.description,
    )


def serialize_alert(alert: AlertORM) -> AlertResponse:
    return AlertResponse.model_validate(alert)


def normalize_wallet_detail(raw_wallet: WalletDetail | str, index: int = 0) -> WalletDetail:
    if isinstance(raw_wallet, str):
        network = infer_network(raw_wallet)
        return WalletDetail(
            address=raw_wallet,
            network=network,
            label=f"Wallet {index + 1}",
            explorer_url=explorer_url_for(network, "address", raw_wallet),
        )
    network = raw_wallet.network or infer_network(raw_wallet.address)
    return WalletDetail(
        address=raw_wallet.address,
        network=network,
        label=raw_wallet.label or f"Wallet {index + 1}",
        explorer_url=raw_wallet.explorer_url or explorer_url_for(network, "address", raw_wallet.address),
        monitoring_status=raw_wallet.monitoring_status,
        risk_level=raw_wallet.risk_level,
        notes=raw_wallet.notes,
        last_checked_at=parse_datetime(raw_wallet.last_checked_at),
    )


def create_wallets_for_politician(politician: PoliticianORM, wallet_inputs: List[WalletDetail | str]) -> None:
    wallet_details = [normalize_wallet_detail(wallet, idx) for idx, wallet in enumerate(wallet_inputs)]
    for wallet in wallet_details:
        politician.wallet_details.append(
            WalletORM(
                address=wallet.address,
                network=wallet.network,
                label=wallet.label,
                explorer_url=wallet.explorer_url,
                monitoring_status=wallet.monitoring_status,
                risk_level=wallet.risk_level,
                notes=wallet.notes,
                last_checked_at=wallet.last_checked_at,
            )
        )


def ensure_unique_slug(db: Session, desired_slug: str) -> str:
    slug = desired_slug
    suffix = 1
    while db.scalar(select(WorkspaceORM).where(WorkspaceORM.slug == slug)):
        suffix += 1
        slug = f"{desired_slug}-{suffix}"
    return slug


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> UserORM:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    user = db.get(UserORM, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


def get_workspace_or_404(db: Session, workspace_id: str) -> WorkspaceORM:
    workspace = db.get(WorkspaceORM, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace


def get_politician_or_404(db: Session, workspace_id: str, politician_id: str) -> PoliticianORM:
    stmt = (
        select(PoliticianORM)
        .where(PoliticianORM.id == politician_id, PoliticianORM.workspace_id == workspace_id)
        .options(joinedload(PoliticianORM.wallet_details))
    )
    politician = db.scalar(stmt)
    if not politician:
        raise HTTPException(status_code=404, detail="Politician not found")
    return politician


def recalculate_politician_counters(db: Session, politician: PoliticianORM) -> None:
    tx_count = db.scalar(select(func.count(TransactionORM.id)).where(TransactionORM.politician_id == politician.id)) or 0
    suspicious_count = db.scalar(
        select(func.count(TransactionORM.id)).where(
            TransactionORM.politician_id == politician.id,
            TransactionORM.status == "suspicious",
        )
    ) or 0
    politician.total_transactions = tx_count
    politician.suspicious_count = suspicious_count


def seed_workspace(db: Session, workspace: WorkspaceORM) -> None:
    existing = db.scalar(select(func.count(PoliticianORM.id)).where(PoliticianORM.workspace_id == workspace.id))
    if existing:
        return

    sample_politicians = [
        {
            "name": "Guilherme Boulos",
            "party": "PSOL",
            "position": "Federal Deputy",
            "state": "SP",
            "verified": True,
            "instagram": "guilhermeboulos",
            "twitter": "GuilhermeBoulos",
            "blockchain_focus": "bitcoin",
            "wallets": [
                WalletDetail(address="bc1qvigiliaowner001", network="bitcoin", label="Official BTC", risk_level="medium"),
                WalletDetail(address="0x7f5c1aa933d3af08", network="ethereum", label="Campaign ETH", risk_level="low"),
            ],
        },
        {
            "name": "Ciro Gomes",
            "party": "PDT",
            "position": "Former Minister",
            "state": "CE",
            "verified": True,
            "instagram": "cirogomes",
            "twitter": "cirogomes",
            "blockchain_focus": "ethereum",
            "wallets": [WalletDetail(address="0x31cd4f1d9840a122", network="ethereum", label="Primary ETH", risk_level="high")],
        },
        {
            "name": "Tabata Amaral",
            "party": "PSB",
            "position": "Federal Deputy",
            "state": "SP",
            "verified": True,
            "instagram": "tabataamaralsp",
            "twitter": "tabataamaralsp",
            "blockchain_focus": "bitcoin",
            "wallets": [WalletDetail(address="bc1qpublicwallet003", network="bitcoin", label="Public BTC", risk_level="low")],
        },
    ]

    created_politicians: list[PoliticianORM] = []
    for item in sample_politicians:
        politician = PoliticianORM(
            workspace_id=workspace.id,
            name=item["name"],
            party=item["party"],
            position=item["position"],
            state=item["state"],
            verified=item["verified"],
            instagram=item["instagram"],
            twitter=item["twitter"],
            blockchain_focus=item["blockchain_focus"],
        )
        create_wallets_for_politician(politician, item["wallets"])
        db.add(politician)
        created_politicians.append(politician)

    db.flush()

    tx_templates = [
        {
            "tx_hash": "0xbtc001sample",
            "amount": 3.21,
            "currency": "BTC",
            "network": "bitcoin",
            "status": "verified",
            "description": "Donation batch tracked by public source",
            "risk_flags": [],
        },
        {
            "tx_hash": "0xeth002sample",
            "amount": 87.5,
            "currency": "ETH",
            "network": "ethereum",
            "status": "suspicious",
            "description": "Large transfer flagged for off-hours movement",
            "risk_flags": ["after_hours", "high_value"],
        },
        {
            "tx_hash": "0xbtc003sample",
            "amount": 0.78,
            "currency": "BTC",
            "network": "bitcoin",
            "status": "pending",
            "description": "Awaiting chain confirmation",
            "risk_flags": ["pending_confirmation"],
        },
    ]

    alert_templates = [
        ("high", "large_transfer", "Transfer above workspace threshold detected."),
        ("medium", "new_wallet", "New monitored wallet added for review."),
        ("critical", "pattern_change", "Behavior shifted from historical transaction patterns."),
    ]

    for politician, tx_template, alert_template in zip(created_politicians, tx_templates, alert_templates):
        wallet = politician.wallet_details[0]
        transaction = TransactionORM(
            workspace_id=workspace.id,
            politician_id=politician.id,
            politician_name=politician.name,
            tx_hash=tx_template["tx_hash"],
            from_address=wallet.address,
            to_address="0xCounterpartyMonitor",
            amount=tx_template["amount"],
            currency=tx_template["currency"],
            network=tx_template["network"],
            explorer_url=explorer_url_for(tx_template["network"], "tx", tx_template["tx_hash"]),
            monitored_wallet=wallet.address,
            counterparty_label="External Counterparty",
            risk_flags="|".join(tx_template["risk_flags"]),
            status=tx_template["status"],
            description=tx_template["description"],
            value_brl=tx_template["amount"] * 1000,
            block_height=900000 + len(created_politicians),
        )
        db.add(transaction)
        db.flush()

        severity, alert_type, message = alert_template
        db.add(
            AlertORM(
                workspace_id=workspace.id,
                politician_id=politician.id,
                politician_name=politician.name,
                severity=severity,
                alert_type=alert_type,
                message=message,
            )
        )
        recalculate_politician_counters(db, politician)

    db.flush()


def build_stats(db: Session, workspace: WorkspaceORM) -> DashboardStats:
    total_politicians = db.scalar(select(func.count(PoliticianORM.id)).where(PoliticianORM.workspace_id == workspace.id)) or 0
    total_transactions = db.scalar(select(func.count(TransactionORM.id)).where(TransactionORM.workspace_id == workspace.id)) or 0
    suspicious_transactions = db.scalar(
        select(func.count(TransactionORM.id)).where(
            TransactionORM.workspace_id == workspace.id,
            TransactionORM.status == "suspicious",
        )
    ) or 0
    active_alerts = db.scalar(
        select(func.count(AlertORM.id)).where(AlertORM.workspace_id == workspace.id, AlertORM.resolved.is_(False))
    ) or 0
    total_wallets = db.scalar(
        select(func.count(WalletORM.id)).join(PoliticianORM).where(PoliticianORM.workspace_id == workspace.id)
    ) or 0

    network_rows = db.execute(
        select(WalletORM.network)
        .join(PoliticianORM)
        .where(PoliticianORM.workspace_id == workspace.id)
        .distinct()
        .order_by(WalletORM.network.asc())
    ).all()
    networks = [row[0] for row in network_rows]

    return DashboardStats(
        total_politicians=total_politicians,
        total_transactions=total_transactions,
        suspicious_transactions=suspicious_transactions,
        active_alerts=active_alerts,
        total_wallets=total_wallets,
        monitored_networks=networks,
        primary_explorer="mempool.space / etherscan",
        workspace_name=workspace.name,
        workspace_slug=workspace.slug,
        plan=workspace.plan,
        timestamp=now_utc(),
    )


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Vigília SaaS API", version="2.0.0", lifespan=lifespan)

origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", DEFAULT_CORS).split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    database_name = "sqlite" if DATABASE_URL.startswith("sqlite") else "postgresql"
    return HealthResponse(status="healthy", database=database_name, timestamp=now_utc(), version="2.0.0")


@app.get("/api")
def api_root():
    return {
        "message": "Vigília SaaS API",
        "docs": "/docs",
        "health": "/api/health",
        "features": ["auth", "workspace isolation", "persistent database", "deploy-ready docker"],
    }


@app.post("/api/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: AuthRegister, db: Session = Depends(get_db)) -> AuthResponse:
    existing_user = db.scalar(select(UserORM).where(UserORM.email == payload.email.lower()))
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    workspace_name = payload.workspace_name or f"{payload.full_name.split()[0]} Workspace"
    workspace = WorkspaceORM(name=workspace_name, slug=ensure_unique_slug(db, slugify(workspace_name)))
    db.add(workspace)
    db.flush()

    user = UserORM(
        workspace_id=workspace.id,
        full_name=payload.full_name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.flush()

    seed_workspace(db, workspace)
    db.commit()
    db.refresh(workspace)
    db.refresh(user)

    return AuthResponse(
        access_token=create_access_token(user),
        user=UserResponse(id=user.id, full_name=user.full_name, email=user.email, role=user.role, created_at=user.created_at),
        workspace=WorkspaceResponse(id=workspace.id, name=workspace.name, slug=workspace.slug, plan=workspace.plan, created_at=workspace.created_at),
    )


@app.post("/api/auth/login", response_model=AuthResponse)
def login(payload: AuthLogin, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(UserORM).where(UserORM.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    workspace = get_workspace_or_404(db, user.workspace_id)
    return AuthResponse(
        access_token=create_access_token(user),
        user=UserResponse(id=user.id, full_name=user.full_name, email=user.email, role=user.role, created_at=user.created_at),
        workspace=WorkspaceResponse(id=workspace.id, name=workspace.name, slug=workspace.slug, plan=workspace.plan, created_at=workspace.created_at),
    )


@app.get("/api/auth/me")
def me(current_user: UserORM = Depends(get_current_user), db: Session = Depends(get_db)):
    workspace = get_workspace_or_404(db, current_user.workspace_id)
    return {
        "user": UserResponse(
            id=current_user.id,
            full_name=current_user.full_name,
            email=current_user.email,
            role=current_user.role,
            created_at=current_user.created_at,
        ),
        "workspace": WorkspaceResponse(
            id=workspace.id,
            name=workspace.name,
            slug=workspace.slug,
            plan=workspace.plan,
            created_at=workspace.created_at,
        ),
    }


@app.get("/api/workspace", response_model=WorkspaceResponse)
def get_workspace(current_user: UserORM = Depends(get_current_user), db: Session = Depends(get_db)) -> WorkspaceResponse:
    workspace = get_workspace_or_404(db, current_user.workspace_id)
    return WorkspaceResponse(id=workspace.id, name=workspace.name, slug=workspace.slug, plan=workspace.plan, created_at=workspace.created_at)


@app.patch("/api/workspace/plan", response_model=WorkspaceResponse)
def update_workspace_plan(
    payload: UpdateWorkspacePlan,
    current_user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkspaceResponse:
    workspace = get_workspace_or_404(db, current_user.workspace_id)
    workspace.plan = payload.plan
    db.commit()
    db.refresh(workspace)
    return WorkspaceResponse(id=workspace.id, name=workspace.name, slug=workspace.slug, plan=workspace.plan, created_at=workspace.created_at)


@app.get("/api/stats", response_model=DashboardStats)
def get_stats(current_user: UserORM = Depends(get_current_user), db: Session = Depends(get_db)) -> DashboardStats:
    workspace = get_workspace_or_404(db, current_user.workspace_id)
    return build_stats(db, workspace)


@app.get("/api/dashboard", response_model=DashboardSnapshot)
def dashboard(current_user: UserORM = Depends(get_current_user), db: Session = Depends(get_db)) -> DashboardSnapshot:
    workspace = get_workspace_or_404(db, current_user.workspace_id)
    politicians = db.scalars(
        select(PoliticianORM)
        .where(PoliticianORM.workspace_id == workspace.id)
        .options(joinedload(PoliticianORM.wallet_details))
        .order_by(PoliticianORM.created_at.desc())
        .limit(6)
    ).unique().all()
    transactions = db.scalars(
        select(TransactionORM)
        .where(TransactionORM.workspace_id == workspace.id)
        .order_by(TransactionORM.timestamp.desc())
        .limit(8)
    ).all()
    alerts = db.scalars(
        select(AlertORM)
        .where(AlertORM.workspace_id == workspace.id)
        .order_by(AlertORM.timestamp.desc())
        .limit(8)
    ).all()
    return DashboardSnapshot(
        stats=build_stats(db, workspace),
        politicians=[serialize_politician(p) for p in politicians],
        recent_transactions=[serialize_transaction(tx) for tx in transactions],
        recent_alerts=[serialize_alert(alert) for alert in alerts],
    )


@app.post("/api/politicians", response_model=PoliticianResponse, status_code=status.HTTP_201_CREATED)
def create_politician(
    payload: PoliticianCreate,
    current_user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PoliticianResponse:
    politician = PoliticianORM(
        workspace_id=current_user.workspace_id,
        name=payload.name,
        party=payload.party,
        position=payload.position,
        state=payload.state,
        verified=payload.verified,
        image_url=payload.image_url,
        instagram=payload.instagram,
        twitter=payload.twitter,
        youtube=payload.youtube,
        blockchain_focus=payload.blockchain_focus,
    )
    wallet_inputs: List[WalletDetail | str] = payload.wallet_details if payload.wallet_details else payload.wallets
    create_wallets_for_politician(politician, wallet_inputs)
    db.add(politician)
    db.commit()
    db.refresh(politician)
    politician = get_politician_or_404(db, current_user.workspace_id, politician.id)
    return serialize_politician(politician)


@app.get("/api/politicians", response_model=List[PoliticianResponse])
def get_politicians(
    current_user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
    search: Optional[str] = Query(default=None),
) -> List[PoliticianResponse]:
    stmt = (
        select(PoliticianORM)
        .where(PoliticianORM.workspace_id == current_user.workspace_id)
        .options(joinedload(PoliticianORM.wallet_details))
        .order_by(PoliticianORM.created_at.desc())
    )
    politicians = db.scalars(stmt).unique().all()
    if search:
        needle = search.lower()
        politicians = [p for p in politicians if needle in p.name.lower() or needle in p.party.lower()]
    return [serialize_politician(p) for p in politicians]


@app.get("/api/politicians/{politician_id}", response_model=PoliticianResponse)
def get_politician(
    politician_id: str,
    current_user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PoliticianResponse:
    politician = get_politician_or_404(db, current_user.workspace_id, politician_id)
    return serialize_politician(politician)


@app.post("/api/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    current_user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TransactionResponse:
    politician = get_politician_or_404(db, current_user.workspace_id, payload.politician_id)
    network = payload.network or infer_network(payload.from_address, payload.to_address)
    transaction = TransactionORM(
        workspace_id=current_user.workspace_id,
        politician_id=politician.id,
        politician_name=politician.name,
        tx_hash=payload.tx_hash,
        from_address=payload.from_address,
        to_address=payload.to_address,
        amount=payload.amount,
        currency=payload.currency,
        network=network,
        explorer_url=payload.explorer_url or explorer_url_for(network, "tx", payload.tx_hash),
        monitored_wallet=payload.monitored_wallet,
        counterparty_label=payload.counterparty_label,
        risk_flags="|".join(payload.risk_flags),
        block_height=payload.block_height,
        value_brl=payload.value_brl,
        status=payload.status,
        description=payload.description,
    )
    db.add(transaction)
    db.flush()
    recalculate_politician_counters(db, politician)
    db.commit()
    db.refresh(transaction)
    db.refresh(politician)
    return serialize_transaction(transaction)


@app.get("/api/transactions", response_model=PaginatedTransactions)
def get_transactions(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    politician_id: Optional[str] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    current_user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaginatedTransactions:
    stmt = select(TransactionORM).where(TransactionORM.workspace_id == current_user.workspace_id)
    count_stmt = select(func.count(TransactionORM.id)).where(TransactionORM.workspace_id == current_user.workspace_id)
    if politician_id:
        stmt = stmt.where(TransactionORM.politician_id == politician_id)
        count_stmt = count_stmt.where(TransactionORM.politician_id == politician_id)
    if status_filter:
        stmt = stmt.where(TransactionORM.status == status_filter)
        count_stmt = count_stmt.where(TransactionORM.status == status_filter)
    total = db.scalar(count_stmt) or 0
    items = db.scalars(stmt.order_by(TransactionORM.timestamp.desc()).offset(offset).limit(limit)).all()
    return PaginatedTransactions(
        items=[serialize_transaction(tx) for tx in items],
        total=total,
        limit=limit,
        offset=offset,
        has_more=offset + limit < total,
    )


@app.get("/api/transactions/politician/{politician_id}", response_model=PaginatedTransactions)
def get_politician_transactions(
    politician_id: str,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaginatedTransactions:
    get_politician_or_404(db, current_user.workspace_id, politician_id)
    total = db.scalar(
        select(func.count(TransactionORM.id)).where(
            TransactionORM.workspace_id == current_user.workspace_id,
            TransactionORM.politician_id == politician_id,
        )
    ) or 0
    items = db.scalars(
        select(TransactionORM)
        .where(TransactionORM.workspace_id == current_user.workspace_id, TransactionORM.politician_id == politician_id)
        .order_by(TransactionORM.timestamp.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    return PaginatedTransactions(
        items=[serialize_transaction(tx) for tx in items],
        total=total,
        limit=limit,
        offset=offset,
        has_more=offset + limit < total,
    )


@app.post("/api/alerts", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    payload: AlertCreate,
    current_user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AlertResponse:
    politician = get_politician_or_404(db, current_user.workspace_id, payload.politician_id)
    alert = AlertORM(
        workspace_id=current_user.workspace_id,
        politician_id=politician.id,
        politician_name=politician.name,
        severity=payload.severity,
        alert_type=payload.alert_type,
        message=payload.message,
        resolved=payload.resolved,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return serialize_alert(alert)


@app.get("/api/alerts", response_model=PaginatedAlerts)
def get_alerts(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    resolved: Optional[bool] = Query(default=None),
    severity: Optional[str] = Query(default=None),
    politician_id: Optional[str] = Query(default=None),
    current_user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaginatedAlerts:
    stmt = select(AlertORM).where(AlertORM.workspace_id == current_user.workspace_id)
    count_stmt = select(func.count(AlertORM.id)).where(AlertORM.workspace_id == current_user.workspace_id)
    if resolved is not None:
        stmt = stmt.where(AlertORM.resolved.is_(resolved))
        count_stmt = count_stmt.where(AlertORM.resolved.is_(resolved))
    if severity:
        stmt = stmt.where(AlertORM.severity == severity)
        count_stmt = count_stmt.where(AlertORM.severity == severity)
    if politician_id:
        stmt = stmt.where(AlertORM.politician_id == politician_id)
        count_stmt = count_stmt.where(AlertORM.politician_id == politician_id)
    total = db.scalar(count_stmt) or 0
    items = db.scalars(stmt.order_by(AlertORM.timestamp.desc()).offset(offset).limit(limit)).all()
    return PaginatedAlerts(
        items=[serialize_alert(item) for item in items],
        total=total,
        limit=limit,
        offset=offset,
        has_more=offset + limit < total,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
