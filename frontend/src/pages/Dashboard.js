 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/frontend/src/pages/Dashboard.js b/frontend/src/pages/Dashboard.js
index c61bf87015143bc9f635cfbe8e2b2a5c46d842b1..79ad0519a9eb6f7a844eb18a0969c8f01896a464 100644
--- a/frontend/src/pages/Dashboard.js
+++ b/frontend/src/pages/Dashboard.js
@@ -1,68 +1,70 @@
 import { useState, useEffect } from "react";
 import { motion } from "framer-motion";
 import { useNavigate } from "react-router-dom";
 import axios from "axios";
 import { Search, AlertTriangle, Activity, Users, TrendingUp, Menu, X, Instagram, ExternalLink, Youtube, MapPin, FileSearch, Landmark } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Card } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { ExternalWatchSection } from "@/components/dashboard/ExternalWatchSection";
 import { toast } from "sonner";
 
 const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
 const API = `${BACKEND_URL}/api`;
 
+const shouldHidePolitician = (name = "") => name.toLowerCase().includes("gustavo");
+
 const Dashboard = () => {
   const navigate = useNavigate();
   const [stats, setStats] = useState({ total_politicians: 0, total_transactions: 0, suspicious_transactions: 0, active_alerts: 0 });
   const [politicians, setPoliticians] = useState([]);
   const [transactions, setTransactions] = useState([]);
   const [alerts, setAlerts] = useState([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [loading, setLoading] = useState(true);
   const [sidebarOpen, setSidebarOpen] = useState(false);
 
   useEffect(() => {
     loadDashboardData();
   }, []);
 
   const loadDashboardData = async () => {
     try {
       setLoading(true);
       const [statsRes, politiciansRes, transactionsRes, alertsRes] = await Promise.all([
         axios.get(`${API}/stats`),
         axios.get(`${API}/politicians`),
         axios.get(`${API}/transactions?limit=20`),
         axios.get(`${API}/alerts?limit=10`)
       ]);
 
       setStats(statsRes.data);
-      setPoliticians(politiciansRes.data);
-      setTransactions(transactionsRes.data);
-      setAlerts(alertsRes.data);
+      setPoliticians(politiciansRes.data.filter((politician) => !shouldHidePolitician(politician.name)));
+      setTransactions(transactionsRes.data.filter((transaction) => !shouldHidePolitician(transaction.politician_name)));
+      setAlerts(alertsRes.data.filter((alert) => !shouldHidePolitician(alert.politician_name)));
     } catch (error) {
       console.error("Error loading dashboard data:", error);
       toast.error("Failed to load dashboard data");
     } finally {
       setLoading(false);
     }
   };
 
   const getStatusBadge = (status) => {
     const variants = {
       verified: "bg-green-500/10 text-green-400 border-green-500/20",
       suspicious: "bg-red-500/10 text-red-400 border-red-500/20",
       pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
     };
     return variants[status] || variants.verified;
   };
 
   const getSeverityBadge = (severity) => {
     const variants = {
       critical: "bg-red-500/10 text-red-400 border-red-500/20",
       high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
       medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
       low: "bg-blue-500/10 text-blue-400 border-blue-500/20"
     };
     return variants[severity] || variants.low;
 
EOF
)
