#!/usr/bin/env python3
"""Coleta dados dos gráficos da página de servidores do Portal da Transparência.

Uso:
    python scripts/coletar_graficos_servidores.py
"""

from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE_URL = "https://portaldatransparencia.gov.br"
PAINEL_JS = f"{BASE_URL}/static/js/servidores/painel.js?v=6.0.1"
OUT_PATH = Path("data/servidores_graficos_portal_transparencia.json")


def fetch_json(url: str, params: dict | None = None):
    if params:
        query = urllib.parse.urlencode(params)
        url = f"{url}?{query}"

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = resp.read().decode("utf-8", "ignore")

    try:
        return json.loads(body)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Resposta não-JSON para {url}") from exc


def extract_endpoints() -> list[str]:
    req = urllib.request.Request(PAINEL_JS, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        js = resp.read().decode("utf-8", "ignore")

    found = re.findall(r'springUrl\+"(servidores/[^"]+)"', js)
    unique = sorted(set(found))
    # Remove endpoint-base que depende de concatenação dinâmica no JS
    return [ep for ep in unique if not ep.endswith("-")]


def main() -> None:
    endpoints = extract_endpoints()

    special_params = {
        "servidores/distribuicao-por-faixa-etaria": [
            {"idSituacaoServidor": 1},  # ativos
            {"idSituacaoServidor": 2},  # inativos
            {"idSituacaoServidor": 3},  # pensionistas
        ],
        "servidores/distribuicao-por-orgao-aposentados-pensionistas": [
            {"idSituacaoServidor": 2},
            {"idSituacaoServidor": 3},
        ],
        "servidores/distribuicao-tipo-servidor-civil": [
            {"idSituacaoServidor": 2},
            {"idSituacaoServidor": 3},
        ],
        "servidores/distribuicao-tipo-servidor-militar": [
            {"idSituacaoServidor": 2},
            {"idSituacaoServidor": 3},
        ],
    }

    datasets = {}
    for endpoint in endpoints:
        base = f"{BASE_URL}/{endpoint}/resultadoGrafico"
        param_sets = special_params.get(endpoint, [None])
        collected = []
        for params in param_sets:
            payload = fetch_json(base, params)
            collected.append({"params": params or {}, "data": payload})
        datasets[endpoint] = collected

    result = {
        "fonte": f"{BASE_URL}/servidores",
        "coletado_em_utc": datetime.now(timezone.utc).isoformat(),
        "total_endpoints": len(endpoints),
        "endpoints": endpoints,
        "datasets": datasets,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Arquivo salvo em: {OUT_PATH}")
    print(f"Endpoints coletados: {len(endpoints)}")


if __name__ == "__main__":
    main()
