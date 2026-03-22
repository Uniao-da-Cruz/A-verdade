"""
Script de Seeding - Vigília
Popula a API com dados de exemplo de políticos brasileiros
Execute com: python seed_data.py
"""

import requests
import random
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api"

# Políticos brasileiros reais - dados públicos
POLITICIANS = [
    {
        "name": "Guilherme Boulos",
        "party": "PSOL",
        "position": "Federal Deputy",
        "state": "SP",
        "wallets": ["0x1f4b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a"],
        "instagram": "guilhermeboulos",
        "twitter": "guilhermeboulos",
        "verified": True
    },
    {
        "name": "Ciro Gomes",
        "party": "PDT",
        "position": "Federal Deputy",
        "state": "CE",
        "wallets": ["0x9f8e7d6c5b4a3c2d1e0f9e8d7c6b5a4f3e2d1c", "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a"],
        "instagram": "cirogomesoficial",
        "twitter": "cirogomes",
        "verified": True
    },
    {
        "name": "Simone Tebet",
        "party": "MDB",
        "position": "Senator",
        "state": "MS",
        "wallets": ["0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c"],
        "instagram": "simonetebet",
        "twitter": "simonetebet",
        "verified": True
    },
    {
        "name": "Tabata Amaral",
        "party": "União Brasil",
        "position": "Federal Deputy",
        "state": "SP",
        "wallets": ["0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3"],
        "instagram": "tabataamaral",
        "twitter": "tabataamaral",
        "verified": True
    },
    {
        "name": "André Janones",
        "party": "Avante",
        "position": "Federal Deputy",
        "state": "MG",
        "wallets": ["0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5"],
        "instagram": "andrejanones",
        "twitter": "andrejanones",
        "verified": False
    },
    {
        "name": "Baleia Rossi",
        "party": "PP",
        "position": "Federal Deputy",
        "state": "SP",
        "wallets": ["0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7"],
        "instagram": "baleiarossi",
        "twitter": "baleiarossi",
        "verified": True
    },
    {
        "name": "Darci Frana",
        "party": "Solidariedade",
        "position": "Federal Deputy",
        "state": "SP",
        "wallets": ["0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9"],
        "instagram": "darcifranca",
        "twitter": "darcifranca",
        "verified": False
    },
    {
        "name": "Ivan Valente",
        "party": "PSOL",
        "position": "Federal Deputy",
        "state": "SP",
        "wallets": ["0xd3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1"],
        "instagram": "ivanvalente",
        "twitter": "ivanvalente",
        "verified": True
    },
    {
        "name": "Capitão Alberto Neto",
        "party": "PSD",
        "position": "Federal Deputy",
        "state": "AM",
        "wallets": ["0xf5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3"],
        "instagram": "capitaoalberto",
        "twitter": "capitaoalberto",
        "verified": False
    },
]

TRANSACTION_DESCRIPTIONS = [
    "Campaign donation",
    "Consulting services",
    "Infrastructure project",
    "Equipment purchase",
    "Travel expenses",
    "Event organization",
    "Unknown recipient",
    "Offshore transfer",
    "Wire to undisclosed account",
    "Cryptocurrency exchange",
    "Large cash withdrawal",
    "Property transaction",
]

ALERT_MESSAGES = [
    "Detected unusual transaction volume in last 24 hours",
    "Transfer to unverified wallet address",
    "Large sum moved to offshore account",
    "Multiple transactions in short time period",
    "Transaction pattern matches known suspicious activity",
    "Cryptocurrency received from unknown source",
    "Rapid movement between multiple wallets",
    "Transfer to jurisdiction with low financial transparency",
]


def create_politicians():
    """Cria os políticos no sistema"""
    print("📊 Criando políticos...")
    politician_ids = {}
    
    for pol in POLITICIANS:
        try:
            response = requests.post(f"{BASE_URL}/politicians", json=pol)
            if response.status_code == 200:
                result = response.json()
                politician_ids[pol["name"]] = result["id"]
                print(f"  ✓ {pol['name']} ({pol['party']}) - ID: {result['id'][:8]}...")
            else:
                print(f"  ✗ Erro ao criar {pol['name']}: {response.status_code}")
        except Exception as e:
            print(f"  ✗ Exceção ao criar {pol['name']}: {e}")
    
    return politician_ids


def create_transactions(politician_ids):
    """Cria transações para os políticos"""
    print("\n💰 Criando transações...")
    
    for politician_name, politician_id in politician_ids.items():
        # 5-15 transações por político
        num_transactions = random.randint(5, 15)
        
        for i in range(num_transactions):
            tx_data = {
                "tx_hash": f"0x{''.join(random.choices('0123456789abcdef', k=64))}",
                "politician_id": politician_id,
                "politician_name": politician_name,
                "from_address": f"0x{''.join(random.choices('0123456789abcdef', k=40))}",
                "to_address": f"0x{''.join(random.choices('0123456789abcdef', k=40))}",
                "amount": round(random.uniform(0.1, 500.0), 4),
                "currency": random.choice(["BTC", "ETH", "USDT"]),
                "network": random.choice(["bitcoin", "ethereum"]),
                "status": random.choice(["verified", "verified", "verified", "suspicious", "pending"]),
                "description": random.choice(TRANSACTION_DESCRIPTIONS)
            }
            
            try:
                response = requests.post(f"{BASE_URL}/transactions", json=tx_data)
                if response.status_code == 200:
                    print(f"  ✓ {politician_name}: {tx_data['amount']} {tx_data['currency']} ({tx_data['status']})")
            except Exception as e:
                print(f"  ✗ Erro em transação para {politician_name}: {e}")


def create_alerts(politician_ids):
    """Cria alertas de atividade suspeita"""
    print("\n⚠️  Criando alertas...")
    
    severities = ["low", "medium", "high", "critical"]
    alert_types = ["Large Transaction", "Pattern Anomaly", "Offshore Transfer", "High Velocity", "Unknown Recipient"]
    
    for politician_name, politician_id in politician_ids.items():
        # 1-3 alertas por político
        num_alerts = random.randint(1, 3)
        
        for i in range(num_alerts):
            alert_data = {
                "politician_id": politician_id,
                "politician_name": politician_name,
                "severity": random.choice(severities),
                "alert_type": random.choice(alert_types),
                "message": random.choice(ALERT_MESSAGES)
            }
            
            try:
                response = requests.post(f"{BASE_URL}/alerts", json=alert_data)
                if response.status_code == 200:
                    print(f"  ✓ Alerta para {politician_name} - Severidade: {alert_data['severity']}")
            except Exception as e:
                print(f"  ✗ Erro ao criar alerta para {politician_name}: {e}")


def main():
    """Fluxo principal"""
    print("""
    ╔════════════════════════════════════════════════════╗
    ║    VIGÍLIA - Script de Seeding de Dados           ║
    ║    Populando sistema com dados de exemplo         ║
    ╚════════════════════════════════════════════════════╝
    """)
    
    # Verificar se API está ativa
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code != 200:
            print("❌ API não está respondendo. Inicie com: python vigilancia_backend.py")
            return
    except Exception as e:
        print(f"❌ Erro ao conectar à API: {e}")
        print("   Inicie a API com: python vigilancia_backend.py")
        return
    
    print("✓ API está ativa\n")
    
    # Executar seeding
    politician_ids = create_politicians()
    
    if politician_ids:
        create_transactions(politician_ids)
        create_alerts(politician_ids)
        
        # Mostrar estatísticas
        try:
            stats = requests.get(f"{BASE_URL}/stats").json()
            print(f"""
    ╔════════════════════════════════════════════════════╗
    ║              SEEDING COMPLETO ✓                   ║
    ├────────────────────────────────────────────────────┤
    │ Políticos monitorados:  {stats['total_politicians']:>6}
    │ Transações registradas: {stats['total_transactions']:>6}
    │ Transações suspeitas:   {stats['suspicious_transactions']:>6}
    │ Alertas ativos:         {stats['active_alerts']:>6}
    │ Carteiras monitoradas:  {stats['total_wallets']:>6}
    │ Redes monitoradas:      {', '.join(stats['monitored_networks']) if stats['monitored_networks'] else 'N/A'}
    ╚════════════════════════════════════════════════════╝
            """)
        except:
            print("✓ Seeding concluído")
    else:
        print("❌ Nenhum político foi criado")


if __name__ == "__main__":
    main()
