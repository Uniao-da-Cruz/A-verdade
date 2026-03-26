#!/usr/bin/env python3
"""Associa nomes aos registros de transações da API do Portal da Transparência.

Uso básico:
    export PORTAL_TRANSPARENCIA_API_KEY="sua-chave"
    python scripts/associate_portal_transparencia.py --ano 2025 --mes 1 --output-dir ./output

O script consulta o endpoint `/api-de-dados/despesas` e gera:
- transactions_with_names.csv: transações com nome/documento do favorecido
- association_summary.csv: consolidação por documento + nome
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import time
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

API_BASE_URL = "https://api.portaldatransparencia.gov.br/api-de-dados/despesas"
DEFAULT_PAGE_SIZE = 100
DEFAULT_TIMEOUT_SECONDS = 30
DEFAULT_RETRIES = 3
DEFAULT_SLEEP_SECONDS = 0.25


@dataclass
class QueryConfig:
    api_key: str
    ano: Optional[int]
    mes: Optional[int]
    pagina_inicial: int
    max_paginas: Optional[int]
    tamanho_pagina: int
    timeout: int
    retries: int
    sleep_seconds: float


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Escaneia despesas federais e associa favorecidos (nome/documento) às transações.")
    parser.add_argument("--api-key", default=os.getenv("PORTAL_TRANSPARENCIA_API_KEY"),
                        help="Chave da API (ou use PORTAL_TRANSPARENCIA_API_KEY).")
    parser.add_argument("--ano", type=int, default=None,
                        help="Ano de referência (ex.: 2025).")
    parser.add_argument("--mes", type=int, default=None,
                        help="Mês de referência de 1 a 12.")
    parser.add_argument("--pagina-inicial", type=int, default=1,
                        help="Página inicial para retomar processamento (default: 1).")
    parser.add_argument("--max-paginas", type=int, default=None,
                        help="Limite de páginas a processar. Sem limite por padrão.")
    parser.add_argument("--tamanho-pagina", type=int, default=DEFAULT_PAGE_SIZE,
                        help="Quantidade por página (default: 100).")
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT_SECONDS,
                        help="Timeout em segundos por requisição.")
    parser.add_argument("--retries", type=int, default=DEFAULT_RETRIES,
                        help="Tentativas por requisição em falha temporária.")
    parser.add_argument("--sleep", type=float, default=DEFAULT_SLEEP_SECONDS,
                        help="Pausa entre páginas para evitar bloqueio/rate-limit.")
    parser.add_argument("--output-dir", type=Path, default=Path("output"),
                        help="Diretório de saída para CSVs.")
    return parser.parse_args()


def build_query_params(cfg: QueryConfig, pagina: int) -> Dict[str, str]:
    params: Dict[str, str] = {
        "pagina": str(pagina),
        "tamanhoPagina": str(cfg.tamanho_pagina),
    }
    if cfg.ano is not None:
        params["ano"] = str(cfg.ano)
    if cfg.mes is not None:
        params["mes"] = str(cfg.mes)
    return params


def extract_transaction_row(item: dict) -> dict:
    favorecido = item.get("favorecido") or {}
    orgao = item.get("orgaoSuperior") or {}
    valor = item.get("valor")
    documento = (
        favorecido.get("cnpjCpfIdgener")
        or favorecido.get("cpfCnpj")
        or favorecido.get("documento")
        or ""
    )

    return {
        "id": item.get("id") or item.get("codigo") or "",
        "data": item.get("data") or item.get("dataDocumento") or "",
        "tipo": item.get("tipoDespesa") or "",
        "valor": valor if valor is not None else "",
        "nome_favorecido": (favorecido.get("nome") or "").strip(),
        "documento_favorecido": str(documento).strip(),
        "uf_favorecido": favorecido.get("uf") or "",
        "municipio_favorecido": favorecido.get("municipio") or "",
        "orgao_superior": orgao.get("nome") or "",
        "orgao_superior_codigo": orgao.get("codigo") or "",
    }


def fetch_page(cfg: QueryConfig, pagina: int) -> List[dict]:
    params = build_query_params(cfg, pagina)
    query = urlencode(params)
    url = f"{API_BASE_URL}?{query}"

    request = Request(url)
    request.add_header("accept", "application/json")
    request.add_header("chave-api-dados", cfg.api_key)
    request.add_header("user-agent", "vigilia-associador/1.0")

    for attempt in range(1, cfg.retries + 1):
        try:
            with urlopen(request, timeout=cfg.timeout) as response:
                payload = response.read().decode("iso-8859-1", errors="replace")
            data = json.loads(payload)
            if not isinstance(data, list):
                raise RuntimeError(f"Resposta inesperada da API (página {pagina}): {data}")
            return data
        except HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            is_retryable = exc.code in {429, 500, 502, 503, 504}
            if not is_retryable or attempt == cfg.retries:
                raise RuntimeError(f"Erro HTTP {exc.code} na página {pagina}: {body}") from exc
        except URLError as exc:
            if attempt == cfg.retries:
                raise RuntimeError(f"Falha de rede na página {pagina}: {exc}") from exc

        time.sleep(min(2.0, cfg.sleep_seconds * attempt))

    return []


def iter_transactions(cfg: QueryConfig) -> Iterable[dict]:
    pagina = cfg.pagina_inicial
    pages_processed = 0

    while True:
        if cfg.max_paginas is not None and pages_processed >= cfg.max_paginas:
            break

        page_data = fetch_page(cfg, pagina)
        pages_processed += 1

        if not page_data:
            print(f"[INFO] Página {pagina} sem registros. Finalizando varredura.")
            break

        print(f"[INFO] Página {pagina}: {len(page_data)} transações.")
        for item in page_data:
            yield extract_transaction_row(item)

        pagina += 1
        time.sleep(cfg.sleep_seconds)


def write_csv(path: Path, rows: Iterable[dict], fieldnames: List[str]) -> int:
    total = 0
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
            total += 1

    return total


def main() -> None:
    args = parse_args()
    if not args.api_key:
        raise SystemExit("Informe --api-key ou defina PORTAL_TRANSPARENCIA_API_KEY.")

    if args.mes is not None and not 1 <= args.mes <= 12:
        raise SystemExit("--mes precisa estar entre 1 e 12.")

    cfg = QueryConfig(
        api_key=args.api_key,
        ano=args.ano,
        mes=args.mes,
        pagina_inicial=args.pagina_inicial,
        max_paginas=args.max_paginas,
        tamanho_pagina=args.tamanho_pagina,
        timeout=args.timeout,
        retries=args.retries,
        sleep_seconds=args.sleep,
    )

    transactions = list(iter_transactions(cfg))
    if not transactions:
        print("[WARN] Nenhuma transação encontrada com os filtros informados.")
        return

    transactions_file = args.output_dir / "transactions_with_names.csv"
    transaction_fields = list(transactions[0].keys())
    total_tx = write_csv(transactions_file, transactions, transaction_fields)

    summary_map: Dict[tuple, dict] = defaultdict(lambda: {
        "documento_favorecido": "",
        "nome_favorecido": "",
        "total_transacoes": 0,
        "valor_total": 0.0,
    })

    for tx in transactions:
        key = (tx["documento_favorecido"], tx["nome_favorecido"])
        row = summary_map[key]
        row["documento_favorecido"] = tx["documento_favorecido"]
        row["nome_favorecido"] = tx["nome_favorecido"]
        row["total_transacoes"] += 1
        try:
            row["valor_total"] += float(tx["valor"])
        except (TypeError, ValueError):
            pass

    summary_file = args.output_dir / "association_summary.csv"
    summary_rows = sorted(summary_map.values(), key=lambda row: row["total_transacoes"], reverse=True)
    summary_fields = ["documento_favorecido", "nome_favorecido", "total_transacoes", "valor_total"]
    total_summary = write_csv(summary_file, summary_rows, summary_fields)

    print("\n[OK] Processamento concluído.")
    print(f"[OK] Transações exportadas: {total_tx}")
    print(f"[OK] Favorecidos associados: {total_summary}")
    print(f"[OK] Arquivo detalhado: {transactions_file}")
    print(f"[OK] Arquivo resumido: {summary_file}")


if __name__ == "__main__":
    main()
