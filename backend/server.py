 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/backend/server.py b/backend/server.py
index 089ea803600e47e4e4951e623ba6cc4f21146082..4abb6f56c6abcf4e14055827368530c9d14a1332 100644
--- a/backend/server.py
+++ b/backend/server.py
@@ -210,154 +210,190 @@ def normalize_politician_doc(doc: dict) -> dict:
     wallet_source = doc.get("wallet_details") or doc.get("wallets", [])
     wallet_details = [normalize_wallet_detail(wallet, idx) for idx, wallet in enumerate(wallet_source)]
 
     doc["wallet_details"] = wallet_details
     doc["wallets"] = [wallet.address for wallet in wallet_details]
     doc["monitored_networks"] = sorted({wallet.network for wallet in wallet_details})
     doc["created_at"] = parse_datetime(doc.get("created_at"))
     return doc
 
 
 def normalize_transaction_doc(doc: dict) -> dict:
     network = doc.get("network") or infer_network(doc.get("from_address"), doc.get("to_address"), doc.get("monitored_wallet"))
     doc["network"] = network
     doc["explorer_url"] = doc.get("explorer_url") or explorer_url_for(network, "tx", doc.get("tx_hash"))
     doc["monitored_wallet"] = doc.get("monitored_wallet") or doc.get("to_address") or doc.get("from_address")
     doc["risk_flags"] = doc.get("risk_flags", [])
     doc["timestamp"] = parse_datetime(doc.get("timestamp"))
     return doc
 
 
 def normalize_alert_doc(doc: dict) -> dict:
     doc["timestamp"] = parse_datetime(doc.get("timestamp"))
     return doc
 
 
+def should_exclude_politician_name(name: Optional[str]) -> bool:
+    return bool(name and "gustavo" in name.lower())
+
+
+async def get_excluded_politician_ids() -> set[str]:
+    excluded = await db.politicians.find(
+        {"name": {"$regex": "gustavo", "$options": "i"}},
+        {"_id": 0, "id": 1},
+    ).to_list(1000)
+    return {doc["id"] for doc in excluded if doc.get("id")}
+
+
 @api_router.post("/politicians", response_model=Politician)
 async def create_politician(input: PoliticianCreate):
     politician_dict = input.model_dump(exclude_none=True)
     raw_wallet_details = politician_dict.pop("wallet_details", [])
     wallet_source = raw_wallet_details or politician_dict.get("wallets", [])
     wallet_details = [normalize_wallet_detail(wallet, idx) for idx, wallet in enumerate(wallet_source)]
     politician_dict["wallets"] = [wallet.address for wallet in wallet_details]
     politician_dict["wallet_details"] = wallet_details
     politician_dict["monitored_networks"] = sorted({wallet.network for wallet in wallet_details})
 
     politician_obj = Politician(**politician_dict)
 
     doc = politician_obj.model_dump()
     doc["created_at"] = politician_obj.created_at.isoformat()
     doc["wallet_details"] = serialize_wallet_details(politician_obj.wallet_details)
 
     await db.politicians.insert_one(doc)
     return politician_obj
 
 
 @api_router.get("/politicians", response_model=List[Politician])
 async def get_politicians():
     politicians = await db.politicians.find({}, {"_id": 0}).to_list(1000)
-    return [normalize_politician_doc(doc) for doc in politicians]
+    visible_politicians = [doc for doc in politicians if not should_exclude_politician_name(doc.get("name"))]
+    return [normalize_politician_doc(doc) for doc in visible_politicians]
 
 
 @api_router.get("/politicians/{politician_id}", response_model=Politician)
 async def get_politician(politician_id: str):
     politician = await db.politicians.find_one({"id": politician_id}, {"_id": 0})
 
-    if not politician:
+    if not politician or should_exclude_politician_name(politician.get("name")):
         raise HTTPException(status_code=404, detail="Politician not found")
 
     return normalize_politician_doc(politician)
 
 
 @api_router.post("/transactions", response_model=Transaction)
 async def create_transaction(input: TransactionCreate):
     transaction_dict = input.model_dump(exclude_none=True)
     network = transaction_dict.get("network") or infer_network(
         transaction_dict.get("from_address"),
         transaction_dict.get("to_address"),
         transaction_dict.get("monitored_wallet"),
     )
 
     transaction_dict["network"] = network
     transaction_dict["explorer_url"] = transaction_dict.get("explorer_url") or explorer_url_for(network, "tx", transaction_dict["tx_hash"])
     transaction_dict["monitored_wallet"] = transaction_dict.get("monitored_wallet") or transaction_dict.get("to_address")
 
     transaction_obj = Transaction(**transaction_dict)
 
     doc = transaction_obj.model_dump()
     doc["timestamp"] = transaction_obj.timestamp.isoformat()
 
     await db.transactions.insert_one(doc)
 
     await db.politicians.update_one(
         {"id": input.politician_id},
         {"$inc": {"total_transactions": 1, "suspicious_count": 1 if input.status == "suspicious" else 0}},
     )
 
     return transaction_obj
 
 
 @api_router.get("/transactions", response_model=List[Transaction])
 async def get_transactions(limit: int = 100):
-    transactions = await db.transactions.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
-    return [normalize_transaction_doc(doc) for doc in transactions]
+    excluded_politician_ids = await get_excluded_politician_ids()
+    transactions = await db.transactions.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit + len(excluded_politician_ids) + 50)
+    visible_transactions = [doc for doc in transactions if doc.get("politician_id") not in excluded_politician_ids]
+    return [normalize_transaction_doc(doc) for doc in visible_transactions[:limit]]
 
 
 @api_router.get("/transactions/politician/{politician_id}", response_model=List[Transaction])
 async def get_politician_transactions(politician_id: str):
+    excluded_politician_ids = await get_excluded_politician_ids()
+    if politician_id in excluded_politician_ids:
+        return []
+
     transactions = await db.transactions.find({"politician_id": politician_id}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
     return [normalize_transaction_doc(doc) for doc in transactions]
 
 
 @api_router.post("/alerts", response_model=Alert)
 async def create_alert(input: AlertCreate):
     alert_obj = Alert(**input.model_dump())
 
     doc = alert_obj.model_dump()
     doc["timestamp"] = alert_obj.timestamp.isoformat()
 
     await db.alerts.insert_one(doc)
     return alert_obj
 
 
 @api_router.get("/alerts", response_model=List[Alert])
 async def get_alerts(limit: int = 50):
-    alerts = await db.alerts.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
-    return [normalize_alert_doc(doc) for doc in alerts]
+    excluded_politician_ids = await get_excluded_politician_ids()
+    alerts = await db.alerts.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit + len(excluded_politician_ids) + 50)
+    visible_alerts = [
+        doc for doc in alerts
+        if doc.get("politician_id") not in excluded_politician_ids
+        and not should_exclude_politician_name(doc.get("politician_name"))
+    ]
+    return [normalize_alert_doc(doc) for doc in visible_alerts[:limit]]
 
 
 @api_router.get("/stats")
 async def get_stats():
-    total_politicians = await db.politicians.count_documents({})
-    total_transactions = await db.transactions.count_documents({})
-    suspicious_transactions = await db.transactions.count_documents({"status": "suspicious"})
-    active_alerts = await db.alerts.count_documents({"resolved": False})
-
-    politicians = await db.politicians.find({}, {"_id": 0, "wallet_details": 1, "wallets": 1}).to_list(1000)
+    excluded_politician_ids = await get_excluded_politician_ids()
+    total_politicians = await db.politicians.count_documents({
+        "name": {"$not": {"$regex": "gustavo", "$options": "i"}}
+    })
+    total_transactions = await db.transactions.count_documents({"politician_id": {"$nin": list(excluded_politician_ids)}})
+    suspicious_transactions = await db.transactions.count_documents({
+        "status": "suspicious",
+        "politician_id": {"$nin": list(excluded_politician_ids)},
+    })
+    active_alerts = await db.alerts.count_documents({
+        "resolved": False,
+        "politician_id": {"$nin": list(excluded_politician_ids)},
+    })
+
+    politicians = await db.politicians.find({}, {"_id": 0, "name": 1, "wallet_details": 1, "wallets": 1}).to_list(1000)
     wallet_total = 0
     networks = set()
     for politician in politicians:
+        if should_exclude_politician_name(politician.get("name")):
+            continue
         wallet_source = politician.get("wallet_details") or politician.get("wallets", [])
         normalized_wallets = [normalize_wallet_detail(wallet, idx) for idx, wallet in enumerate(wallet_source)]
         wallet_total += len(normalized_wallets)
         networks.update(wallet.network for wallet in normalized_wallets)
 
     return {
         "total_politicians": total_politicians,
         "total_transactions": total_transactions,
         "suspicious_transactions": suspicious_transactions,
         "active_alerts": active_alerts,
         "total_wallets": wallet_total,
         "monitored_networks": sorted(networks),
         "primary_explorer": "BlockExplorer",
     }
 
 
 @api_router.get("/")
 async def root():
     return {"message": "Vigília API - Blockchain Politics Vigilance"}
 
 
 app.include_router(api_router)
 
 app.add_middleware(
     CORSMiddleware,
 
EOF
)
