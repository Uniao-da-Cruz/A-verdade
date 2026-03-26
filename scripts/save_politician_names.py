#!/usr/bin/env python3
"""Salva nomes de políticos a partir da base de servidores do Portal da Transparência.

Exemplo:
    export PORTAL_TRANSPARENCIA_API_KEY="sua-chave"
    python scripts/save_politician_names.py --output output/politician_names.txt
"""

from __future__ import annotations

import argparse
import json
import os
import re
import time
from pathlib import Path
from typing import Dict, Iterable, List, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

API_BASE_URL = "https://api.portaldatransparencia.gov.br/api-de-dados/servidores"
DEFAULT_TIMEOUT_SECONDS = 30
DEFAULT_SLEEP_SECONDS = 0.25
DEFAULT_RETRIES = 3
DEFAULT_PAGE_SIZE = 100
DEFAULT_KEYWORDS = [
    "deputado",
    "deputada",
    "senador",
    "senadora",
    "prefeito",
    "prefeita",
    "governador",
    "governadora",
    "vereador",
    "vereadora",
    "ministro",
    "ministra",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Extrai nomes de políticos usando o endpoint de servidores "
            "associado à consulta pública do Portal da Transparência."
        )
    )
    parser.add_argument(
        "--api-key",
        default=os.getenv("PORTAL_TRANSPARENCIA_API_KEY"),
        help="Chave da API (ou use PORTAL_TRANSPARENCIA_API_KEY).",
    )
    parser.add_argument(
        "--pagina-inicial",
        type=int,
        default=1,
        help="Página inicial da varredura (default: 1).",
    )
    parser.add_argument(
        "--max-paginas",
        type=int,
        default=None,
        help="Limite de páginas para processar (default: sem limite).",
    )
    parser.add_argument(
        "--tamanho-pagina",
        type=int,
        default=DEFAULT_PAGE_SIZE,
        help="Quantidade de registros por página (default: 100).",
    )
    parser.add_argument(
        "--keywords",
        default=",".join(DEFAULT_KEYWORDS),
        help="Palavras-chave separadas por vírgula para detectar políticos.",
    )
    parser.add_argument(
        "--sleep",
        type=float,
        default=DEFAULT_SLEEP_SECONDS,
        help="Pausa entre chamadas para reduzir risco de rate-limit.",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_TIMEOUT_SECONDS,
        help="Timeout em segundos por requisição.",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=DEFAULT_RETRIES,
        help="Tentativas por requisição em falhas temporárias.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("output/politician_names.txt"),
        help="Arquivo de saída com os nomes únicos (1 por linha).",
    )
    parser.add_argument(
        "--output-json",
        type=Path,
        default=Path("output/politician_names.json"),
        help="Arquivo JSON de saída com nomes e metadados.",
    )
    return parser.parse_args()


def parse_keywords(raw_keywords: str) -> List[str]:
    return [term.strip().lower() for term in raw_keywords.split(",") if term.strip()]


def fetch_page(
    api_key: str,
    pagina: int,
    tamanho_pagina: int,
    timeout: int,
    retries: int,
    sleep_seconds: float,
) -> List[dict]:
    params: Dict[str, str] = {
        "pagina": str(pagina),
        "tamanhoPagina": str(tamanho_pagina),
    }
    url = f"{API_BASE_URL}?{urlencode(params)}"

    request = Request(url)
    request.add_header("accept", "application/json")
    request.add_header("chave-api-dados", api_key)
    request.add_header("user-agent", "vigilia-politicians-saver/1.0")

    for attempt in range(1, retries + 1):
        try:
            with urlopen(request, timeout=timeout) as response:
                payload = response.read().decode("iso-8859-1", errors="replace")
            data = json.loads(payload)
            if not isinstance(data, list):
                raise RuntimeError(f"Resposta inesperada na página {pagina}: {data}")
            return data
        except HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            is_retryable = exc.code in {429, 500, 502, 503, 504}
            if not is_retryable or attempt == retries:
                raise RuntimeError(f"Erro HTTP {exc.code} na página {pagina}: {body}") from exc
        except URLError as exc:
            if attempt == retries:
                raise RuntimeError(f"Falha de rede na página {pagina}: {exc}") from exc

        time.sleep(min(2.0, sleep_seconds * attempt))

    return []


def iter_records(args: argparse.Namespace) -> Iterable[dict]:
    pagina = args.pagina_inicial
    pages_processed = 0

    while True:
        if args.max_paginas is not None and pages_processed >= args.max_paginas:
            break

        items = fetch_page(
            api_key=args.api_key,
            pagina=pagina,
            tamanho_pagina=args.tamanho_pagina,
            timeout=args.timeout,
            retries=args.retries,
            sleep_seconds=args.sleep,
        )
        pages_processed += 1

        if not items:
            print(f"[INFO] Página {pagina} vazia. Encerrando varredura.")
            break

        print(f"[INFO] Página {pagina}: {len(items)} registros.")
        for item in items:
            yield item

        pagina += 1
        time.sleep(args.sleep)


def normalize(value: Optional[str]) -> str:
    return (value or "").strip()


def looks_like_politician(record: dict, keywords: List[str]) -> bool:
    cargo = normalize(record.get("descricaoCargo"))
    funcao = normalize(record.get("descricaoFuncao"))
    atividade = normalize(record.get("descricaoAtividade"))
    tipo = normalize(record.get("tipoServidor"))
    joined = " ".join([cargo, funcao, atividade, tipo]).lower()
    return any(re.search(rf"\b{re.escape(keyword)}\b", joined) for keyword in keywords)


def extract_name(record: dict) -> str:
    return normalize(record.get("nome"))


def main() -> None:
    args = parse_args()
    if not args.api_key:
        raise SystemExit("Informe --api-key ou defina PORTAL_TRANSPARENCIA_API_KEY.")

    keywords = parse_keywords(args.keywords)
    names = set()
    total_records = 0
    matched_records = 0

    for record in iter_records(args):
        total_records += 1
        if not looks_like_politician(record, keywords):
            continue
        name = extract_name(record)
        if not name:
            continue
        matched_records += 1
        names.add(name)

    ordered_names = sorted(names)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text("\n".join(ordered_names) + ("\n" if ordered_names else ""), encoding="utf-8")

    payload = {
        "total_registros_processados": total_records,
        "registros_com_match": matched_records,
        "nomes_unicos": len(ordered_names),
        "keywords": keywords,
        "nomes": ordered_names,
        "consulta_referencia": "https://portaldatransparencia.gov.br/servidores/consulta?ordenarPor=nome&direcao=asc",
    }
    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print("[OK] Processamento concluído.")
    print(f"[OK] Registros processados: {total_records}")
    print(f"[OK] Registros com match de cargo/função política: {matched_records}")
    print(f"[OK] Nomes únicos gravados: {len(ordered_names)}")
    print(f"[OK] TXT: {args.output}")
    print(f"[OK] JSON: {args.output_json}")


if __name__ == "__main__":
    main()
