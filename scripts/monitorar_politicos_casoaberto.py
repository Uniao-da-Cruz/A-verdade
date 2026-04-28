#!/usr/bin/env python3
"""Monitora possíveis nomes de políticos citados no Caso Aberto e grava no banco.

Fluxo:
1) Coleta manchetes recentes em https://casoaberto.com.br/
2) Extrai candidatos a nomes próprios (heurística)
3) Consulta cada nome no endpoint de servidores do Portal da Transparência
4) Salva/atualiza os nomes encontrados na tabela `politicians`

Uso:
    export PORTAL_TRANSPARENCIA_API_KEY="sua-chave"
    python scripts/monitorar_politicos_casoaberto.py --workspace-slug demo-workspace

Variáveis de ambiente opcionais:
    DATABASE_URL  –  URL de conexão (sqlite:///..., mysql+pymysql://..., postgresql+psycopg://...)
                     Se não definida, usa --db-path (SQLite local).
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, List, Optional, Set, Tuple
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urljoin, urlparse
from urllib.request import Request, urlopen

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

SITE_BASE_URL = "https://casoaberto.com.br/"
PORTAL_API_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados/servidores"
DEFAULT_DB_PATH = Path("backend/vigilia.db")
DEFAULT_TIMEOUT = 30
DEFAULT_RETRIES = 3
DEFAULT_SLEEP = 0.25

STOPWORDS = {
    "Da", "De", "Do", "Das", "Dos", "E", "Em", "No", "Na", "Nos", "Nas", "Ao", "Aos",
    "Caso", "Aberto", "Brasil", "MS", "SP", "RJ", "DF", "Veja", "Após", "Contra", "Com", "Sem",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Coleta nomes no Caso Aberto, valida no Portal da Transparência e sincroniza no banco."
    )
    parser.add_argument("--api-key", default=os.getenv("PORTAL_TRANSPARENCIA_API_KEY"), help="Chave da API do Portal.")
    parser.add_argument("--site-url", default=SITE_BASE_URL, help="URL inicial para coletar manchetes.")
    parser.add_argument("--max-links", type=int, default=80, help="Máximo de links de notícia para analisar.")
    parser.add_argument("--max-names", type=int, default=120, help="Máximo de nomes candidatos para consultar.")
    parser.add_argument("--portal-page-size", type=int, default=10, help="Tamanho da página na API do Portal.")
    parser.add_argument("--portal-max-pages", type=int, default=1, help="Páginas por nome na API do Portal.")
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT, help="Timeout por requisição em segundos.")
    parser.add_argument("--retries", type=int, default=DEFAULT_RETRIES, help="Tentativas em caso de erro transitório.")
    parser.add_argument("--sleep", type=float, default=DEFAULT_SLEEP, help="Pausa entre chamadas HTTP.")
    parser.add_argument("--db-path", type=Path, default=DEFAULT_DB_PATH, help="Banco SQLite do backend (fallback).")
    parser.add_argument("--workspace-id", default=None, help="ID do workspace alvo.")
    parser.add_argument("--workspace-slug", default=None, help="Slug do workspace alvo.")
    parser.add_argument("--default-party", default="Não informado", help="Partido padrão para novos registros.")
    parser.add_argument("--default-position", default="Servidor público", help="Cargo padrão para novos registros.")
    parser.add_argument("--verified", action="store_true", help="Marca registros novos como verificados.")
    parser.add_argument(
        "--output-json",
        type=Path,
        default=Path("output/casoaberto_monitoramento.json"),
        help="Resumo detalhado da execução.",
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


def http_get(url: str, timeout: int, retries: int, sleep_seconds: float, headers: Optional[dict[str, str]] = None) -> str:
    request = Request(url)
    request.add_header("user-agent", "vigilia-casoaberto-monitor/1.0")
    if headers:
        for key, value in headers.items():
            request.add_header(key, value)

    for attempt in range(1, retries + 1):
        try:
            with urlopen(request, timeout=timeout) as response:
                return response.read().decode("utf-8", errors="replace")
        except HTTPError as exc:
            retryable = exc.code in {429, 500, 502, 503, 504}
            if not retryable or attempt == retries:
                body = exc.read().decode("utf-8", errors="replace")
                raise RuntimeError(f"Erro HTTP {exc.code} para {url}: {body[:200]}") from exc
        except URLError as exc:
            if attempt == retries:
                raise RuntimeError(f"Falha de rede para {url}: {exc}") from exc

        time.sleep(min(2.0, sleep_seconds * attempt))

    raise RuntimeError(f"Falha inesperada ao buscar {url}")


def extract_article_links(html_text: str, base_url: str) -> List[str]:
    links: List[str] = []
    for href in re.findall(r'href=["\']([^"\']+)["\']', html_text, flags=re.IGNORECASE):
        full = urljoin(base_url, href)
        parsed = urlparse(full)
        if parsed.netloc and "casoaberto.com.br" not in parsed.netloc:
            continue
        if "/wp-" in parsed.path or parsed.path.startswith("/tag/") or parsed.path.startswith("/category/"):
            continue
        if parsed.path.rstrip("/") in {"", "/"}:
            continue
        if full not in links:
            links.append(full)
    return links


def extract_title(html_text: str) -> str:
    og = re.search(r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']', html_text, flags=re.IGNORECASE)
    if og:
        return html.unescape(og.group(1)).strip()
    title = re.search(r"<title>(.*?)</title>", html_text, flags=re.IGNORECASE | re.DOTALL)
    if title:
        clean = re.sub(r"\s+", " ", title.group(1)).strip()
        return html.unescape(clean)
    return ""


def extract_name_candidates(text: str) -> List[str]:
    normalized = re.sub(r"[^\w\u00C0-\u00FF\s-]", " ", text, flags=re.UNICODE)
    pattern = re.compile(r"\b([A-Z\u00C1\u00C0\u00C2\u00C3\u00C9\u00CA\u00CD\u00D3\u00D4\u00D5\u00DA\u00C7][a-z\u00E1\u00E0\u00E2\u00E3\u00E9\u00EA\u00ED\u00F3\u00F4\u00F5\u00FA\u00E7]+(?:\s+[A-Z\u00C1\u00C0\u00C2\u00C3\u00C9\u00CA\u00CD\u00D3\u00D4\u00D5\u00DA\u00C7][a-z\u00E1\u00E0\u00E2\u00E3\u00E9\u00EA\u00ED\u00F3\u00F4\u00F5\u00FA\u00E7]+){1,3})\b")
    matches = []
    for m in pattern.finditer(normalized):
        raw = " ".join(part for part in m.group(1).split() if part)
        parts = raw.split()
        if any(part in STOPWORDS for part in parts):
            continue
        if len(parts) < 2:
            continue
        matches.append(raw)
    return matches


def query_portal_by_name(
    api_key: str,
    name: str,
    page_size: int,
    max_pages: int,
    timeout: int,
    retries: int,
    sleep_seconds: float,
) -> List[dict]:
    all_rows: List[dict] = []
    for page in range(1, max_pages + 1):
        params = {"nome": name, "pagina": str(page), "tamanhoPagina": str(page_size)}
        url = f"{PORTAL_API_BASE}?{urlencode(params)}"
        payload = http_get(
            url,
            timeout=timeout,
            retries=retries,
            sleep_seconds=sleep_seconds,
            headers={"accept": "application/json", "chave-api-dados": api_key},
        )
        data = json.loads(payload)
        if not isinstance(data, list) or not data:
            break
        all_rows.extend(data)
        time.sleep(sleep_seconds)
    return all_rows


def unique_names(names: Iterable[str]) -> List[str]:
    out: List[str] = []
    seen: Set[str] = set()
    for name in names:
        cleaned = " ".join(name.split()).strip()
        if not cleaned:
            continue
        key = cleaned.casefold()
        if key in seen:
            continue
        seen.add(key)
        out.append(cleaned)
    return out


def resolve_workspace_id(session: Session, database_url: str, workspace_id: Optional[str], workspace_slug: Optional[str]) -> Tuple[str, str]:
    if workspace_id:
        row = session.execute(text("SELECT id, slug FROM workspaces WHERE id = :wid"), {"wid": workspace_id}).fetchone()
        if not row:
            raise SystemExit(f"Workspace não encontrado para id={workspace_id}.")
        return str(row[0]), str(row[1])
    if workspace_slug:
        row = session.execute(text("SELECT id, slug FROM workspaces WHERE slug = :slug"), {"slug": workspace_slug}).fetchone()
        if not row:
            raise SystemExit(f"Workspace não encontrado para slug={workspace_slug}.")
        return str(row[0]), str(row[1])
    row = session.execute(text("SELECT id, slug FROM workspaces ORDER BY created_at ASC LIMIT 1")).fetchone()
    if not row:
        raise SystemExit("Nenhum workspace encontrado. Crie uma conta primeiro ou informe --workspace-id/--workspace-slug.")
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
            text(f"SELECT id, COALESCE(data_source_url, '') FROM politicians WHERE workspace_id = :wid AND {ci_clause} LIMIT 1"),
            {"wid": workspace_id, "name": name},
        ).fetchone()

        if row:
            current_url = str(row[1] or "")
            if source_url and source_url not in current_url:
                merged = f"{current_url}; {source_url}" if current_url.strip() else source_url
                session.execute(
                    text("UPDATE politicians SET data_source_url = :url WHERE id = :pid"),
                    {"url": merged, "pid": str(row[0])},
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
    if not args.api_key:
        raise SystemExit("Informe --api-key ou defina PORTAL_TRANSPARENCIA_API_KEY.")

    database_url = _build_database_url(args.db_path)
    engine = _make_engine(database_url)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

    print(f"[INFO] Database: {database_url.split('@')[-1] if '@' in database_url else database_url}")
    print(f"[INFO] Lendo página inicial: {args.site_url}")
    home = http_get(args.site_url, args.timeout, args.retries, args.sleep)
    links = extract_article_links(home, args.site_url)[: args.max_links]
    print(f"[INFO] Links coletados para análise: {len(links)}")

    candidates: List[str] = []
    for link in links:
        try:
            page = http_get(link, args.timeout, args.retries, args.sleep)
        except RuntimeError:
            continue
        title = extract_title(page)
        if not title:
            continue
        candidates.extend(extract_name_candidates(title))
        time.sleep(args.sleep)

    candidate_names = unique_names(candidates)[: args.max_names]
    print(f"[INFO] Nomes candidatos extraídos das manchetes: {len(candidate_names)}")

    matched_names: List[str] = []
    detailed_matches: List[dict] = []
    for name in candidate_names:
        try:
            rows = query_portal_by_name(
                api_key=args.api_key,
                name=name,
                page_size=args.portal_page_size,
                max_pages=args.portal_max_pages,
                timeout=args.timeout,
                retries=args.retries,
                sleep_seconds=args.sleep,
            )
        except RuntimeError:
            continue
        if not rows:
            continue

        matched_names.append(name)
        for row in rows:
            official_name = str(row.get("nome") or "").strip()
            if official_name:
                detailed_matches.append(
                    {
                        "nome_consulta": name,
                        "nome_portal": official_name,
                        "cpf": str(row.get("cpf") or "").strip(),
                        "descricao_cargo": str(row.get("descricaoCargo") or "").strip(),
                    }
                )

    names_to_sync = unique_names([item["nome_portal"] for item in detailed_matches if item.get("nome_portal")])
    source_url = "https://casoaberto.com.br/; https://portaldatransparencia.gov.br/"

    with SessionLocal() as session:
        workspace_id, workspace_slug = resolve_workspace_id(session, database_url, args.workspace_id, args.workspace_slug)
        created, updated = sync_names(
            session=session,
            database_url=database_url,
            workspace_id=workspace_id,
            names=names_to_sync,
            source_url=source_url,
            default_party=args.default_party,
            default_position=args.default_position,
            verified=args.verified,
        )

    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    report = {
        "site_url": args.site_url,
        "links_analisados": len(links),
        "nomes_candidatos": candidate_names,
        "nomes_consultados_com_match": unique_names(matched_names),
        "total_matches_detalhados": len(detailed_matches),
        "nomes_sincronizados_unicos": len(names_to_sync),
        "workspace": {"id": workspace_id, "slug": workspace_slug},
        "db_sync": {"created": created, "updated": updated},
        "gerado_em": datetime.now(timezone.utc).isoformat(),
    }
    args.output_json.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print("[OK] Monitoramento concluído.")
    print(f"[OK] Workspace: {workspace_slug} ({workspace_id})")
    print(f"[OK] Candidatos encontrados no Caso Aberto: {len(candidate_names)}")
    print(f"[OK] Nomes validados no Portal da Transparência: {len(names_to_sync)}")
    print(f"[OK] Novos registros no banco: {created}")
    print(f"[OK] Registros atualizados no banco: {updated}")
    print(f"[OK] Relatório: {args.output_json}")


if __name__ == "__main__":
    main()
