import requests
import random
from datetime import datetime, timedelta

BACKEND_URL = "https://vigilia-politics.preview.emergentagent.com/api"

# Brazilian politician names and parties
politicians_data = [
    {
        "name": "Gustavo Lima de Amorim", 
        "party": "União Brasil", 
        "position": "Federal Deputy", 
        "wallets": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "0x8e5e9c6d4a3b2c1f0e9d8c7b6a5f4e3d2c1b0a"],
        "instagram": "gustavo.lima.de.amorim",
        "twitter": "gustavolimabr",
        "youtube": "UC-ZkSRh-7UEuwXJQ9UMCFJA"
    },
    {
        "name": "Carlos Eduardo Silva", 
        "party": "PT", 
        "position": "Federal Deputy", 
        "wallets": ["0x1f4b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a", "0x9f8e7d6c5b4a3c2d1e0f9e8d7c6b5a4f3e2d1c"],
        "instagram": "carlossilvapt",
        "twitter": "carlossilva",
        "youtube": "UC-ZkSRh-7UEuwXJQ9UMCFJA"
    },
    {
        "name": "Maria Santos Oliveira", 
        "party": "PSDB", 
        "position": "Senator", 
        "wallets": ["0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a"],
        "instagram": "mariasantos_oficial",
        "twitter": "mariasantos",
        "youtube": "UC-ZkSRh-7UEuwXJQ9UMCFJA"
    },
    {
        "name": "João Pedro Costa", 
        "party": "MDB", 
        "position": "State Deputy", 
        "wallets": ["0x9f8e7d6c5b4a3c2d1e0f9e8d7c6b5a4f3e2d1c", "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1"],
        "instagram": "joaopedro.mdb"
    },
    {
        "name": "Ana Paula Lima", 
        "party": "PP", 
        "position": "Federal Deputy", 
        "wallets": ["0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3"],
        "instagram": "anapaula_pp",
        "youtube": "UC-ZkSRh-7UEuwXJQ9UMCFJA"
    },
    {
        "name": "Roberto Almeida", 
        "party": "PSB", 
        "position": "Mayor", 
        "wallets": ["0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5", "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7"],
        "twitter": "robertoalmeidapsb"
    },
    {
        "name": "Fernanda Rodrigues", 
        "party": "PDT", 
        "position": "Senator", 
        "wallets": ["0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9"],
        "instagram": "fernandarod_pdt",
        "youtube": "UC-ZkSRh-7UEuwXJQ9UMCFJA"
    },
    {
        "name": "Lucas Ferreira", 
        "party": "PSOL", 
        "position": "State Deputy", 
        "wallets": ["0xd3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1"],
        "instagram": "lucasferreirapsol",
        "twitter": "lucaspsol"
    },
    {
        "name": "Patricia Gomes", 
        "party": "Novo", 
        "position": "Federal Deputy", 
        "wallets": ["0xf5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3", "0xa6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4"],
        "instagram": "patriciagomes.novo",
        "youtube": "UC-ZkSRh-7UEuwXJQ9UMCFJA"
    }
]

def create_politicians():
    print("Creating politicians...")
    politician_ids = []
    for pol_data in politicians_data:
        try:
            response = requests.post(f"{BACKEND_URL}/politicians", json=pol_data)
            if response.status_code == 200:
                politician = response.json()
                politician_ids.append(politician['id'])
                print(f"Created: {pol_data['name']} (ID: {politician['id']})")
            else:
                print(f"Failed to create {pol_data['name']}: {response.status_code}")
        except Exception as e:
            print(f"Error creating {pol_data['name']}: {e}")
    return politician_ids

def create_transactions(politician_ids):
    print("\nCreating transactions...")
    statuses = ["verified", "verified", "verified", "suspicious", "pending"]
    
    for pol_id in politician_ids:
        # Create 5-15 random transactions per politician
        num_transactions = random.randint(5, 15)
        for i in range(num_transactions):
            tx_data = {
                "tx_hash": f"0x{''.join(random.choices('0123456789abcdef', k=64))}",
                "politician_id": pol_id,
                "from_address": f"0x{''.join(random.choices('0123456789abcdef', k=40))}",
                "to_address": f"0x{''.join(random.choices('0123456789abcdef', k=40))}",
                "amount": round(random.uniform(0.1, 100.0), 4),
                "currency": random.choice(["ETH", "BTC", "USDT"]),
                "status": random.choice(statuses),
                "description": random.choice([
                    "Campaign donation",
                    "Infrastructure project payment",
                    "Consultant fee",
                    "Unknown recipient",
                    "Large transfer to offshore account",
                    None
                ])
            }
            try:
                response = requests.post(f"{BACKEND_URL}/transactions", json=tx_data)
                if response.status_code == 200:
                    print(f"  Transaction created for politician {pol_id[:8]}... ({tx_data['amount']} {tx_data['currency']})")
            except Exception as e:
                print(f"  Error creating transaction: {e}")

def create_alerts(politician_ids):
    print("\nCreating alerts...")
    alert_types = [
        "Large Transaction",
        "Unusual Pattern",
        "Offshore Transfer",
        "Rapid Movement",
        "Unknown Recipient"
    ]
    severities = ["low", "medium", "high", "critical"]
    messages = [
        "Detected unusual transaction volume in the last 24 hours",
        "Transfer to unverified wallet address",
        "Large sum moved to offshore account",
        "Multiple transactions in short time period",
        "Transaction pattern matches known money laundering schemes"
    ]
    
    # Get politician data for names
    try:
        politicians = requests.get(f"{BACKEND_URL}/politicians").json()
        politician_map = {p['id']: p['name'] for p in politicians}
    except:
        print("Failed to fetch politicians for alerts")
        return
    
    # Create 2-3 alerts for each politician
    for pol_id in politician_ids:
        num_alerts = random.randint(2, 3)
        for i in range(num_alerts):
            alert_data = {
                "politician_id": pol_id,
                "politician_name": politician_map.get(pol_id, "Unknown"),
                "severity": random.choice(severities),
                "alert_type": random.choice(alert_types),
                "message": random.choice(messages)
            }
            try:
                response = requests.post(f"{BACKEND_URL}/alerts", json=alert_data)
                if response.status_code == 200:
                    print(f"  Alert created for {alert_data['politician_name']} ({alert_data['severity']})")
            except Exception as e:
                print(f"  Error creating alert: {e}")

if __name__ == "__main__":
    print("Starting data seeding...\n")
    politician_ids = create_politicians()
    
    if politician_ids:
        create_transactions(politician_ids)
        create_alerts(politician_ids)
        
        print("\n=== Seeding Complete ===")
        print(f"Created {len(politician_ids)} politicians with transactions and alerts")
    else:
        print("Failed to create politicians. Check your backend connection.")
