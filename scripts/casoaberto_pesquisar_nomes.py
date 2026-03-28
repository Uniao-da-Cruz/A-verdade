#!/usr/bin/env python3
"""Pesquisa nomes no Portal da Transparência (endpoint de servidores).

Uso:
    export PORTAL_TRANSPARENCIA_API_KEY="sua-chave"
    python scripts/casoaberto_pesquisar_nomes.py --nome "MARIA" --nome "JOSE"

Também aceita um arquivo TXT com 1 nome por linha:
    python scripts/casoaberto_pesquisar_nomes.py --nomes-arquivo input/nomes.txt
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import time
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

API_BASE_URL = "https://api.portaldatransparencia.gov.br/api-de-dados/servidores"
DEFAULT_TIMEOUT_SECONDS = 30
DEFAULT_SLEEP_SECONDS = 0.25
DEFAULT_RETRIES = 3
DEFAULT_PAGE_SIZE = 50


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Pesquisa pessoas no endpoint de servidores do Portal da Transparência "
            "e consolida os resultados por nome consultado."
        )
    )
    parser.add_argument(
        "--api-key",
        default=os.getenv("PORTAL_TRANSPARENCIA_API_KEY"),
        help="Chave da API (ou use PORTAL_TRANSPARENCIA_API_KEY).",
    )
    parser.add_argument(
        "--nome",
        action="append",
        default=[],
        help="Nome a pesquisar. Pode ser repetido várias vezes.",
    )
    parser.add_argument(
        "--nomes-arquivo",
        type=Path,
        default=None,
        help="Arquivo .txt com um nome por linha.",
    )
    parser.add_argument(
        "--tamanho-pagina",
        type=int,
        default=DEFAULT_PAGE_SIZE,
        help="Quantidade de registros por página (default: 50).",
    )
    parser.add_argument(
        "--max-paginas",
        type=int,
        default=3,
        help="Limite de páginas por nome (default: 3).",
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
        "--sleep",
        type=float,
        default=DEFAULT_SLEEP_SECONDS,
        help="Pausa entre chamadas para reduzir risco de rate-limit.",
    )
    parser.add_argument(
        "--output-json",
        type=Path,
        default=Path("output/casoaberto_pesquisa_nomes.json"),
        help="Arquivo JSON consolidado de saída.",
    )
    parser.add_argument(
        "--output-csv",
        type=Path,
        default=Path("output/casoaberto_pesquisa_nomes.csv"),
        help="Arquivo CSV detalhado de saída.",
    )
    return parser.parse_args()


def build_names(args: argparse.Namespace) -> List[str]:
    names: List[str] = [n.strip() for n in args.nome if n and n.strip()]

    if args.nomes_arquivo:
        if not args.nomes_arquivo.exists():
            raise SystemExit(f"Arquivo não encontrado: {args.nomes_arquivo}")
        for line in args.nomes_arquivo.read_text(encoding="utf-8").splitlines():
            cleaned = line.strip()
            if cleaned:
                names.append(cleaned)

    unique: List[str] = []
    seen: Set[str] = set()
    for n in names:
        key = n.casefold()
        if key in seen:
            continue
        seen.add(key)
        unique.append(n)

    if not unique:
        raise SystemExit("Informe pelo menos um --nome ou --nomes-arquivo.")
    return unique


def fetch_page(
    api_key: str,
    nome: str,
    pagina: int,
    tamanho_pagina: int,
    timeout: int,
    retries: int,
    sleep_seconds: float,
) -> List[dict]:
    params: Dict[str, str] = {
        "nome": nome,
        "pagina": str(pagina),
        "tamanhoPagina": str(tamanho_pagina),
    }
    url = f"{API_BASE_URL}?{urlencode(params)}"

    request = Request(url)
    request.add_header("accept", "application/json")
    request.add_header("chave-api-dados", api_key)
    request.add_header("user-agent", "vigilia-casoaberto-nomes/1.0")

    for attempt in range(1, retries + 1):
        try:
            with urlopen(request, timeout=timeout) as response:
                payload = response.read().decode("iso-8859-1", errors="replace")
            data = json.loads(payload)
            if not isinstance(data, list):
                raise RuntimeError(
                    f"Resposta inesperada para '{nome}' na página {pagina}: {data}"
                )
            return data
        except HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            is_retryable = exc.code in {429, 500, 502, 503, 504}
            if not is_retryable or attempt == retries:
                raise RuntimeError(
                    f"Erro HTTP {exc.code} para '{nome}' página {pagina}: {body}"
                ) from exc
        except URLError as exc:
            if attempt == retries:
                raise RuntimeError(
                    f"Falha de rede para '{nome}' página {pagina}: {exc}"
                ) from exc

        time.sleep(min(2.0, sleep_seconds * attempt))

    return []


def extract_rows(records: Iterable[dict], nome_consulta: str) -> List[dict]:
    rows: List[dict] = []
    for item in records:
        rows.append(
            {
                "nome_consulta": nome_consulta,
                "nome": (item.get("nome") or "").strip(),
                "cpf": (item.get("cpf") or "").strip(),
                "descricao_cargo": (item.get("descricaoCargo") or "").strip(),
                "descricao_funcao": (item.get("descricaoFuncao") or "").strip(),
                "tipo_servidor": (item.get("tipoServidor") or "").strip(),
                "orgao_lotacao": (item.get("orgaoLotacao") or {}).get("nome") or "",
                "situacao": (item.get("situacaoServidor") or "").strip(),
            }
        )
    return rows


def write_csv(path: Path, rows: List[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "nome_consulta",
        "nome",
        "cpf",
        "descricao_cargo",
        "descricao_funcao",
        "tipo_servidor",
        "orgao_lotacao",
        "situacao",
    ]
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    args = parse_args()
    if not args.api_key:
        raise SystemExit("Informe --api-key ou defina PORTAL_TRANSPARENCIA_API_KEY.")

    names = build_names(args)

    all_rows: List[dict] = []
    resumo: List[dict] = []

    for nome in names:
        print(f"[INFO] Pesquisando: {nome}")
        count_before = len(all_rows)

        for pagina in range(1, args.max_paginas + 1):
            data = fetch_page(
                api_key=args.api_key,
                nome=nome,
                pagina=pagina,
                tamanho_pagina=args.tamanho_pagina,
                timeout=args.timeout,
                retries=args.retries,
                sleep_seconds=args.sleep,
            )
            if not data:
                print(f"[INFO] '{nome}' sem resultados na página {pagina}.")
                break

            rows = extract_rows(data, nome)
            all_rows.extend(rows)
            print(f"[INFO] '{nome}' página {pagina}: {len(rows)} registros.")

            time.sleep(args.sleep)

        total_nome = len(all_rows) - count_before
        resumo.append({"nome_consulta": nome, "total_registros": total_nome})

    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "total_nomes_consultados": len(names),
        "total_registros": len(all_rows),
        "resumo": resumo,
        "resultados": all_rows,
        "fonte": "https://portaldatransparencia.gov.br/servidores/consulta",
    }
    args.output_json.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    write_csv(args.output_csv, all_rows)

    print("[OK] Pesquisa concluída.")
    print(f"[OK] Nomes consultados: {len(names)}")
    print(f"[OK] Registros encontrados: {len(all_rows)}")
    print(f"[OK] JSON: {args.output_json}")
    print(f"[OK] CSV: {args.output_csv}")


if __name__ == "__main__":
    main()
