import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, AlertTriangle, Activity, Users, TrendingUp, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
      setPoliticians(politiciansRes.data);
      setTransactions(transactionsRes.data);
      setAlerts(alertsRes.data);
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
  };

  const filteredPoliticians = politicians.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.party.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="mobile-menu-toggle"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 
              className="font-chivo font-black text-2xl cursor-pointer"
              onClick={() => navigate('/')}
              data-testid="app-logo"
            >
              VIG<span className="text-neon-green">Í</span>LIA
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                data-testid="search-input"
                type="text"
                placeholder="Search politicians..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/50 border-white/20 focus:border-neon-green font-mono text-sm w-64"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search */}
      <div className="md:hidden px-6 py-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            data-testid="mobile-search-input"
            type="text"
            placeholder="Search politicians..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/50 border-white/20 focus:border-neon-green font-mono text-sm w-full"
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6 md:p-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-white/10 p-6"
            data-testid="stat-politicians"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-neon-green" />
              <TrendingUp className="w-5 h-5 text-zinc-600" />
            </div>
            <h3 className="text-3xl font-chivo font-bold mb-1">{stats.total_politicians}</h3>
            <p className="text-zinc-500 text-sm uppercase tracking-wider">Politicians Tracked</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 border border-white/10 p-6"
            data-testid="stat-transactions"
          >
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-republic-blue" />
              <TrendingUp className="w-5 h-5 text-zinc-600" />
            </div>
            <h3 className="text-3xl font-chivo font-bold mb-1">{stats.total_transactions}</h3>
            <p className="text-zinc-500 text-sm uppercase tracking-wider">Total Transactions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 border border-white/10 p-6"
            data-testid="stat-suspicious"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-corruption-red" />
              <TrendingUp className="w-5 h-5 text-zinc-600" />
            </div>
            <h3 className="text-3xl font-chivo font-bold mb-1">{stats.suspicious_transactions}</h3>
            <p className="text-zinc-500 text-sm uppercase tracking-wider">Suspicious Activities</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/50 border border-white/10 p-6"
            data-testid="stat-alerts"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-alert-yellow" />
              <TrendingUp className="w-5 h-5 text-zinc-600" />
            </div>
            <h3 className="text-3xl font-chivo font-bold mb-1">{stats.active_alerts}</h3>
            <p className="text-zinc-500 text-sm uppercase tracking-wider">Active Alerts</p>
          </motion.div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Politicians List */}
          <div className="space-y-4">
            <h2 className="font-chivo font-bold text-2xl mb-6">Monitored Politicians</h2>
            {filteredPoliticians.length === 0 ? (
              <Card className="p-8 bg-zinc-900/50 border-white/10 text-center" data-testid="no-politicians">
                <p className="text-zinc-500">No politicians found. Add some to start tracking.</p>
              </Card>
            ) : (
              filteredPoliticians.map((politician, idx) => (
                <motion.div
                  key={politician.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/politician/${politician.id}`)}
                  className="bg-zinc-900/50 border border-white/10 p-6 cursor-pointer card-hover"
                  data-testid={`politician-card-${idx}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-chivo font-bold text-xl mb-1">{politician.name}</h3>
                      <p className="text-zinc-500 text-sm mb-3">{politician.party} • {politician.position}</p>
                      <div className="flex gap-2 mb-3">
                        {politician.verified && (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs font-mono uppercase">
                            Verified
                          </Badge>
                        )}
                        {politician.suspicious_count > 0 && (
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs font-mono uppercase">
                            {politician.suspicious_count} Suspicious
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-zinc-600">Wallets</p>
                          <p className="font-mono text-zinc-300">{politician.wallets.length}</p>
                        </div>
                        <div>
                          <p className="text-zinc-600">Transactions</p>
                          <p className="font-mono text-zinc-300">{politician.total_transactions}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Recent Activity & Alerts */}
          <div className="space-y-6">
            {/* Recent Transactions */}
            <div>
              <h2 className="font-chivo font-bold text-2xl mb-6">Recent Transactions</h2>
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <Card className="p-8 bg-zinc-900/50 border-white/10 text-center" data-testid="no-transactions">
                    <p className="text-zinc-500">No transactions yet</p>
                  </Card>
                ) : (
                  transactions.slice(0, 8).map((tx, idx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-zinc-900/50 border border-white/10 p-4"
                      data-testid={`transaction-${idx}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={`${getStatusBadge(tx.status)} text-xs font-mono uppercase`}>
                          {tx.status}
                        </Badge>
                        <span className="text-zinc-500 text-xs font-mono">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-mono text-sm text-zinc-400 truncate mb-1">
                        {tx.tx_hash.substring(0, 20)}...{tx.tx_hash.substring(tx.tx_hash.length - 10)}
                      </p>
                      <p className="text-neon-green font-bold">{tx.amount} {tx.currency}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Active Alerts */}
            <div>
              <h2 className="font-chivo font-bold text-2xl mb-6">Active Alerts</h2>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <Card className="p-8 bg-zinc-900/50 border-white/10 text-center" data-testid="no-alerts">
                    <p className="text-zinc-500">No active alerts</p>
                  </Card>
                ) : (
                  alerts.slice(0, 5).map((alert, idx) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-zinc-900/50 border border-white/10 p-4"
                      data-testid={`alert-${idx}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={`${getSeverityBadge(alert.severity)} text-xs font-mono uppercase`}>
                          {alert.severity}
                        </Badge>
                        <span className="text-zinc-500 text-xs font-mono">
                          {new Date(alert.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-bold text-sm mb-1">{alert.politician_name}</p>
                      <p className="text-zinc-400 text-sm">{alert.message}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Official Sources Banner */}
        <div className="mt-12 bg-gradient-to-r from-republic-blue/10 to-transparent border border-republic-blue/20 p-6">
          <div className="flex items-start gap-4">
            <Activity className="w-6 h-6 text-republic-blue flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-chivo font-bold text-lg mb-2">Fontes Oficiais de Dados</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Todos os dados políticos podem ser verificados nos portais oficiais da Câmara dos Deputados:
              </p>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="https://www.camara.leg.br/tv" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-mono uppercase text-republic-blue hover:text-blue-300 transition-colors"
                  data-testid="source-link-tv"
                >
                  TV Câmara →
                </a>
                <a 
                  href="https://www.camara.leg.br/deputados/quem-sao" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-mono uppercase text-republic-blue hover:text-blue-300 transition-colors"
                  data-testid="source-link-deputados"
                >
                  Deputados →
                </a>
                <a 
                  href="https://dadosabertos.camara.leg.br/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-mono uppercase text-republic-blue hover:text-blue-300 transition-colors"
                  data-testid="source-link-dados"
                >
                  Dados Abertos →
                </a>
                <a 
                  href="https://www.camara.leg.br/transparencia/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-mono uppercase text-republic-blue hover:text-blue-300 transition-colors"
                  data-testid="source-link-transparencia"
                >
                  Transparência →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
