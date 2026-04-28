#!/usr/bin/env python3
"""Linka nomes da Transparência (Dataprev) na tabela `politicians` do Vigília.

Uso:
    python scripts/link_dataprev_names_db.py \
      --nomes-arquivo output/casoaberto_pesquisa_nomes.csv \
      --workspace-slug demo-workspace

Variáveis de ambiente opcionais:
    DATABASE_URL  –  URL de conexão (sqlite:///..., mysql+pymysql://..., postgresql+psycopg://...)
                     Se não definida, usa --db-path (SQLite local).
"""

from __future__ import annotations

import argparse
import csv
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, List, Optional, Tuple

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

DEFAULT_SOURCE_URL = "https://www.dataprev.gov.br/transparencia"
DEFAULT_DB_PATH = Path("backend/vigilia.db")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Importa/atualiza nomes na tabela politicians e marca a origem "
            "como Transparência Dataprev."
        )
    )
    parser.add_argument(
        "--nomes-arquivo",
        type=Path,
        default=Path("output/casoaberto_pesquisa_nomes.csv"),
        help="CSV (com coluna `nome`) ou TXT (1 nome por linha).",
    )
    parser.add_argument(
        "--db-path",
        type=Path,
        default=DEFAULT_DB_PATH,
        help="Caminho do banco SQLite do backend (fallback quando DATABASE_URL não definida).",
    )
    parser.add_argument(
        "--workspace-id",
        default=None,
        help="ID do workspace alvo.",
    )
    parser.add_argument(
        "--workspace-slug",
        default=None,
        help="Slug do workspace alvo (usado se --workspace-id não for informado).",
    )
    parser.add_argument(
        "--source-url",
        default=DEFAULT_SOURCE_URL,
        help="URL de origem para gravar no campo data_source_url.",
    )
    parser.add_argument(
        "--default-party",
        default="Não informado",
        help="Partido padrão para novos nomes.",
    )
    parser.add_argument(
        "--default-position",
        default="Servidor público",
        help="Cargo padrão para novos nomes.",
    )
    parser.add_argument(
        "--verified",
        action="store_true",
        help="Marca nomes novos como verificados.",
    )
    return parser.parse_args()


def _build_database_url(db_path: Path) -> str:
    """Return a SQLAlchemy database URL from DATABASE_URL env or fallback to SQLite."""
    url = os.getenv("DATABASE_URL", "").strip()
    if url:
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://") and "+psycopg" not in url:
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url
    return f"sqlite:///{db_path.resolve()}"


def _make_engine(database_url: str):
    connect_args = {}
    if database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    return create_engine(database_url, future=True, connect_args=connect_args)


def _is_sqlite(database_url: str) -> bool:
    return database_url.startswith("sqlite")


def _ci_equals(database_url: str) -> str:
    """Return the case-insensitive comparison clause for the current DB."""
    if _is_sqlite(database_url):
        return "name = :name COLLATE NOCASE"
    if "mysql" in database_url:
        return "name = :name"
    return "LOWER(name) = LOWER(:name)"


def build_names(path: Path) -> List[str]:
    if not path.exists():
        raise SystemExit(f"Arquivo de nomes não encontrado: {path}")

    if path.suffix.lower() == ".csv":
        with path.open("r", encoding="utf-8", newline="") as file:
            reader = csv.DictReader(file)
            if "nome" not in (reader.fieldnames or []):
                raise SystemExit("CSV precisa conter a coluna 'nome'.")
            raw = [str(row.get("nome", "")).strip() for row in reader]
    else:
        raw = [line.strip() for line in path.read_text(encoding="utf-8").splitlines()]

    unique: List[str] = []
    seen = set()
    for name in raw:
        if not name:
            continue
        key = name.casefold()
        if key in seen:
            continue
        seen.add(key)
        unique.append(name)

    if not unique:
        raise SystemExit("Nenhum nome válido encontrado no arquivo de entrada.")

    return unique


def resolve_workspace_id(
    session: Session,
    database_url: str,
    workspace_id: Optional[str],
    workspace_slug: Optional[str],
) -> Tuple[str, str]:
    if workspace_id:
        row = session.execute(
            text("SELECT id, slug FROM workspaces WHERE id = :wid"),
            {"wid": workspace_id},
        ).fetchone()
        if not row:
            raise SystemExit(f"Workspace não encontrado para id={workspace_id}.")
        return str(row[0]), str(row[1])

    if workspace_slug:
        row = session.execute(
            text("SELECT id, slug FROM workspaces WHERE slug = :slug"),
            {"slug": workspace_slug},
        ).fetchone()
        if not row:
            raise SystemExit(f"Workspace não encontrado para slug={workspace_slug}.")
        return str(row[0]), str(row[1])

    row = session.execute(
        text("SELECT id, slug FROM workspaces ORDER BY created_at ASC LIMIT 1")
    ).fetchone()
    if not row:
        raise SystemExit(
            "Nenhum workspace encontrado. Crie uma conta primeiro ou informe --workspace-id."
        )
    return str(row[0]), str(row[1])


def sync_names(
    session: Session,
    database_url: str,
    workspace_id: str,
    names: Iterable[str],
    source_url: str,
    default_party: str,
    default_position: str,
    verified: bool,
) -> Tuple[int, int]:
    now = datetime.now(timezone.utc).isoformat()
    ci_clause = _ci_equals(database_url)

    created = 0
    updated = 0

    for name in names:
        row = session.execute(
            text(
                f"SELECT id, COALESCE(data_source_url, '') "
                f"FROM politicians "
                f"WHERE workspace_id = :wid AND {ci_clause} "
                f"LIMIT 1"
            ),
            {"wid": workspace_id, "name": name},
        ).fetchone()

        if row:
            current_url = str(row[1] or "")
            if source_url and source_url not in current_url:
                merged_url = (
                    f"{current_url}; {source_url}" if current_url.strip() else source_url
                )
                session.execute(
                    text("UPDATE politicians SET data_source_url = :url WHERE id = :pid"),
                    {"url": merged_url, "pid": str(row[0])},
                )
                updated += 1
            continue

        verified_val: object
        if _is_sqlite(database_url):
            verified_val = 1 if verified else 0
        else:
            verified_val = verified

        session.execute(
            text(
                "INSERT INTO politicians "
                "(id, workspace_id, name, party, position, state, verified, "
                "image_url, instagram, twitter, youtube, blockchain_focus, "
                "declared_assets_brl, declaration_year, data_source_url, "
                "total_transactions, suspicious_count, created_at) "
                "VALUES (:id, :wid, :name, :party, :position, :state, :verified, "
                ":image_url, :instagram, :twitter, :youtube, :blockchain_focus, "
                ":declared_assets_brl, :declaration_year, :data_source_url, "
                ":total_transactions, :suspicious_count, :created_at)"
            ),
            {
                "id": str(uuid.uuid4()),
                "wid": workspace_id,
                "name": name,
                "party": default_party,
                "position": default_position,
                "state": None,
                "verified": verified_val,
                "image_url": None,
                "instagram": None,
                "twitter": None,
                "youtube": None,
                "blockchain_focus": None,
                "declared_assets_brl": None,
                "declaration_year": None,
                "data_source_url": source_url,
                "total_transactions": 0,
                "suspicious_count": 0,
                "created_at": now,
            },
        )
        created += 1

    session.commit()
    return created, updated


def main() -> None:
    args = parse_args()
    names = build_names(args.nomes_arquivo)

    database_url = _build_database_url(args.db_path)
    engine = _make_engine(database_url)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

    print(f"[INFO] Database: {database_url.split('@')[-1] if '@' in database_url else database_url}")

    with SessionLocal() as session:
        workspace_id, workspace_slug = resolve_workspace_id(
            session,
            database_url,
            workspace_id=args.workspace_id,
            workspace_slug=args.workspace_slug,
        )
        created, updated = sync_names(
            session,
            database_url=database_url,
            workspace_id=workspace_id,
            names=names,
            source_url=args.source_url,
            default_party=args.default_party,
            default_position=args.default_position,
            verified=args.verified,
        )

    print("[OK] Nomes sincronizados com sucesso.")
    print(f"[OK] Workspace: {workspace_slug} ({workspace_id})")
    print(f"[OK] Total nomes de entrada: {len(names)}")
    print(f"[OK] Novos registros: {created}")
    print(f"[OK] Registros atualizados (data_source_url): {updated}")


if __name__ == "__main__":
    main()
