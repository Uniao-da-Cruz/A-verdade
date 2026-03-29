#!/usr/bin/env python3
"""Linka nomes da Transparência (Dataprev) na tabela `politicians` do Vigília.

Uso:
    python scripts/link_dataprev_names_db.py \
      --nomes-arquivo output/casoaberto_pesquisa_nomes.csv \
      --workspace-slug demo-workspace
"""

from __future__ import annotations

import argparse
import csv
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, List, Optional, Tuple

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
        help="Caminho do banco SQLite do backend (default: backend/vigilia.db).",
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
    connection: sqlite3.Connection,
    workspace_id: Optional[str],
    workspace_slug: Optional[str],
) -> Tuple[str, str]:
    cursor = connection.cursor()

    if workspace_id:
        row = cursor.execute(
            "SELECT id, slug FROM workspaces WHERE id = ?",
            (workspace_id,),
        ).fetchone()
        if not row:
            raise SystemExit(f"Workspace não encontrado para id={workspace_id}.")
        return str(row[0]), str(row[1])

    if workspace_slug:
        row = cursor.execute(
            "SELECT id, slug FROM workspaces WHERE slug = ?",
            (workspace_slug,),
        ).fetchone()
        if not row:
            raise SystemExit(f"Workspace não encontrado para slug={workspace_slug}.")
        return str(row[0]), str(row[1])

    row = cursor.execute("SELECT id, slug FROM workspaces ORDER BY created_at ASC LIMIT 1").fetchone()
    if not row:
        raise SystemExit(
            "Nenhum workspace encontrado. Crie uma conta primeiro ou informe --workspace-id."
        )
    return str(row[0]), str(row[1])


def sync_names(
    connection: sqlite3.Connection,
    workspace_id: str,
    names: Iterable[str],
    source_url: str,
    default_party: str,
    default_position: str,
    verified: bool,
) -> Tuple[int, int]:
    now = datetime.now(timezone.utc).isoformat()
    cursor = connection.cursor()

    created = 0
    updated = 0

    for name in names:
        existing = cursor.execute(
            """
            SELECT id, COALESCE(data_source_url, '')
            FROM politicians
            WHERE workspace_id = ? AND name = ? COLLATE NOCASE
            LIMIT 1
            """,
            (workspace_id, name),
        ).fetchone()

        if existing:
            current_url = str(existing[1] or "")
            if source_url and source_url not in current_url:
                merged_url = (
                    f"{current_url}; {source_url}" if current_url.strip() else source_url
                )
                cursor.execute(
                    "UPDATE politicians SET data_source_url = ? WHERE id = ?",
                    (merged_url, str(existing[0])),
                )
                updated += 1
            continue

        cursor.execute(
            """
            INSERT INTO politicians (
                id, workspace_id, name, party, position, state, verified,
                image_url, instagram, twitter, youtube, blockchain_focus,
                declared_assets_brl, declaration_year, data_source_url,
                total_transactions, suspicious_count, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                str(uuid.uuid4()),
                workspace_id,
                name,
                default_party,
                default_position,
                None,
                1 if verified else 0,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                source_url,
                0,
                0,
                now,
            ),
        )
        created += 1

    connection.commit()
    return created, updated


def main() -> None:
    args = parse_args()
    names = build_names(args.nomes_arquivo)

    with sqlite3.connect(args.db_path) as connection:
        workspace_id, workspace_slug = resolve_workspace_id(
            connection,
            workspace_id=args.workspace_id,
            workspace_slug=args.workspace_slug,
        )
        created, updated = sync_names(
            connection,
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
