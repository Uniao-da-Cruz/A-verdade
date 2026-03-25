import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search, AlertTriangle, Activity, Users, TrendingUp,
  Menu, X, Instagram, ExternalLink, Youtube, MapPin,
  FileSearch, Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalWatchSection } from "@/components/dashboard/ExternalWatchSection";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_politicians: 0,
    total_transactions: 0,
    suspicious_transactions: 0,
    active_alerts: 0
  });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 font-mono text-sm">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-black border-r border-white/10 transform transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-chivo font-black text-xl">
              VIG<span className="text-neon-green">Í</span>LIA
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="space-y-1">
            {[
              { label: "Dashboard", path: "/dashboard", testId: "sidebar-dashboard-link" },
              { label: "Espectro Político", path: "/spectrum", testId: "sidebar-spectrum-link" },
              { label: "Recursos Educacionais", path: "/resources", testId: "sidebar-resources-link" },
              { label: "Programas Sociais", path: "/programas-sociais", testId: "sidebar-social-programs-link" },
              { label: "Riscos Nucleares", path: "/riscos-nucleares", testId: "sidebar-nuclear-link" },
            ].map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider rounded-none"
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                data-testid={item.testId}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            data-testid="sidebar-toggle"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-chivo font-black text-2xl">
            VIG<span className="text-neon-green">Í</span>LIA
          </h1>
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              className="bg-zinc-900/50 border-white/10 pl-9 font-mono text-sm placeholder:text-zinc-600 rounded-none"
              placeholder="Search politicians..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-input"
            />
          </div>
          <Button
            onClick={() => navigate("/programas-sociais")}
            className="hidden md:flex bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20 font-mono text-xs uppercase rounded-none"
            data-testid="social-programs-btn"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Prog. Sociais
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 md:p-8 max-w-7xl mx-auto">

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Politicians", value: stats.total_politicians, icon: Users, color: "text-neon-green" },
            { label: "Transactions", value: stats.total_transactions, icon: Activity, color: "text-republic-blue" },
            { label: "Suspicious", value: stats.suspicious_transactions, icon: AlertTriangle, color: "text-corruption-red" },
            { label: "Active Alerts", value: stats.active_alerts, icon: TrendingUp, color: "text-alert-yellow" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-zinc-900/50 border border-white/10 p-4"
              data-testid={`stat-card-${idx}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <p className="text-zinc-500 text-xs uppercase tracking-wider">{stat.label}</p>
              </div>
              <p className={`font-chivo font-black text-3xl ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Politicians Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
          data-testid="politicians-section"
        >
          <h2 className="font-chivo font-bold text-xl mb-4">Monitored Politicians</h2>
          {filteredPoliticians.length === 0 ? (
            <Card className="p-8 bg-zinc-900/50 border-white/10 text-center">
              <p className="text-zinc-500">
                {searchQuery
                  ? `No politicians matching "${searchQuery}"`
                  : "No politicians registered yet"}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPoliticians.map((politician, idx) => (
                <motion.div
                  key={politician.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.03 }}
                  className="bg-zinc-900/50 border border-white/10 p-5 card-hover cursor-pointer"
                  onClick={() => navigate(`/politician/${politician.id}`)}
                  data-testid={`politician-card-${idx}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-chivo font-bold text-base leading-tight truncate">
                        {politician.name}
                      </h3>
                      <p className="text-zinc-400 text-sm mt-1">
                        {politician.party} · {politician.position}
                      </p>
                    </div>
                    {politician.verified && (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs font-mono uppercase ml-2 flex-shrink-0">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm mb-3">
                    <span className="text-zinc-500">{politician.total_transactions} txs</span>
                    {politician.suspicious_count > 0 && (
                      <span className="text-corruption-red">
                        {politician.suspicious_count} suspicious
                      </span>
                    )}
                  </div>
                  {(politician.instagram || politician.twitter || politician.youtube) && (
                    <div className="flex gap-3">
                      {politician.instagram && (
                        <a
                          href={`https://www.instagram.com/${politician.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-zinc-600 hover:text-neon-green transition-colors"
                          data-testid={`politician-instagram-${idx}`}
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                      {politician.youtube && (
                        <a
                          href={`https://www.youtube.com/channel/${politician.youtube}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-zinc-600 hover:text-corruption-red transition-colors"
                          data-testid={`politician-youtube-${idx}`}
                        >
                          <Youtube className="w-4 h-4" />
                        </a>
                      )}
                      {politician.twitter && (
                        <a
                          href={`https://twitter.com/${politician.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-zinc-600 hover:text-republic-blue transition-colors"
                          data-testid={`politician-twitter-${idx}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Transactions & Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Transactions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            data-testid="transactions-section"
          >
            <h2 className="font-chivo font-bold text-xl mb-4">Recent Transactions</h2>
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <Card className="p-6 bg-zinc-900/50 border-white/10 text-center">
                  <p className="text-zinc-500">No transactions recorded</p>
                </Card>
              ) : (
                transactions.slice(0, 8).map((tx, idx) => (
                  <div
                    key={tx.id}
                    className="bg-zinc-900/50 border border-white/10 p-4 hover:border-white/20 transition-colors"
                    data-testid={`transaction-row-${idx}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge className={`${getStatusBadge(tx.status)} text-xs font-mono uppercase flex-shrink-0`}>
                          {tx.status}
                        </Badge>
                        <span className="text-zinc-400 text-sm truncate">
                          {tx.politician_name}
                        </span>
                      </div>
                      <span className="font-chivo font-bold text-neon-green ml-2 flex-shrink-0">
                        {tx.amount} {tx.currency}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-zinc-600 truncate">{tx.tx_hash}</p>
                  </div>
                ))
              )}
            </div>
          </motion.section>

          {/* Active Alerts */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            data-testid="alerts-section"
          >
            <h2 className="font-chivo font-bold text-xl mb-4">Active Alerts</h2>
            <div className="space-y-2">
              {alerts.length === 0 ? (
                <Card className="p-6 bg-zinc-900/50 border-white/10 text-center">
                  <p className="text-zinc-500">No active alerts</p>
                </Card>
              ) : (
                alerts.slice(0, 8).map((alert, idx) => (
                  <div
                    key={alert.id}
                    className="bg-zinc-900/50 border border-white/10 p-4 hover:border-white/20 transition-colors"
                    data-testid={`alert-row-${idx}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${getSeverityBadge(alert.severity)} text-xs font-mono uppercase flex-shrink-0`}>
                            {alert.severity}
                          </Badge>
                          <span className="text-zinc-400 text-sm truncate">
                            {alert.politician_name}
                          </span>
                        </div>
                        <p className="text-zinc-300 text-sm truncate">{alert.message}</p>
                      </div>
                      <AlertTriangle className="w-4 h-4 text-alert-yellow flex-shrink-0 mt-0.5" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.section>
        </div>

        {/* CadÚnico Watch Section */}
        <ExternalWatchSection
          icon={Landmark}
          title="CadÚnico + Dataprev"
          description="Consulte programas sociais, cadastro e serviços integrados ao Cadastro Único via portal oficial da Dataprev."
          iconClassName="text-neon-green"
          wrapperClassName="mb-6 bg-zinc-900/50 border border-neon-green/20 p-6"
          sectionTestId="cadunico-watch-section"
          gridClassName="grid grid-cols-1 md:grid-cols-2 gap-3"
          actions={[
            {
              testId: "cadunico-internal-page-link",
              icon: FileSearch,
              label: "Ver página interna",
              description: "Programas sociais no Vigília",
              className: "border-neon-green/20 bg-neon-green/5 hover:bg-neon-green/10",
              iconClassName: "text-neon-green",
              labelClassName: "text-neon-green",
              onClick: () => navigate("/programas-sociais"),
            },
            {
              testId: "cadunico-dataprev-link",
              icon: ExternalLink,
              label: "Portal oficial Dataprev",
              description: "cadunico.dataprev.gov.br",
              className: "border-white/10 hover:border-neon-green/20 hover:bg-neon-green/5",
              iconClassName: "text-zinc-400",
              labelClassName: "text-zinc-300",
              href: "https://cadunico.dataprev.gov.br/#/programas-sociais",
            },
          ]}
          footer="Dados integrados ao portal oficial do Governo Federal — Dataprev."
        />

        {/* Nuclear Risks Watch Section */}
        <ExternalWatchSection
          icon={AlertTriangle}
          title="Riscos Nucleares — Bomba Atômica"
          description="Documentário educativo sobre a história da bomba atômica e os riscos nucleares. Fonte: Ciência Todo Dia (4.5M+ visualizações)."
          iconClassName="text-corruption-red"
          wrapperClassName="mb-6 bg-zinc-900/50 border border-corruption-red/20 p-6"
          sectionTestId="nuclear-risks-watch-section"
          gridClassName="grid grid-cols-1 md:grid-cols-2 gap-3"
          actions={[
            {
              testId: "nuclear-risks-video-link",
              icon: Youtube,
              label: "Assistir no YouTube",
              description: "REAÇÃO em CADEIA: a HISTÓRIA da BOMBA ATÔMICA",
              className: "border-corruption-red/20 bg-corruption-red/5 hover:bg-corruption-red/10",
              iconClassName: "text-corruption-red",
              labelClassName: "text-corruption-red",
              href: "https://www.youtube.com/watch?v=6fsuiVHtEfc",
            },
            {
              testId: "nuclear-risks-internal-page-link",
              icon: FileSearch,
              label: "Ver página de riscos",
              description: "Análise detalhada no Vigília",
              className: "border-white/10 hover:border-corruption-red/20 hover:bg-corruption-red/5",
              iconClassName: "text-zinc-400",
              labelClassName: "text-zinc-300",
              onClick: () => navigate("/riscos-nucleares"),
            },
            {
              testId: "nuclear-risks-channel-source-link",
              icon: ExternalLink,
              label: "Canal Ciência Todo Dia",
              description: "Fonte original do conteúdo",
              className: "border-white/10 hover:border-republic-blue/20 hover:bg-republic-blue/5",
              iconClassName: "text-zinc-400",
              labelClassName: "text-zinc-300",
              href: "https://www.youtube.com/@CienciaTodoDia",
            },
            {
              testId: "nuclear-risks-chernobyl-link",
              icon: AlertTriangle,
              label: "Chernobyl: A História Completa",
              description: "Conteúdo relacionado",
              className: "border-white/10 hover:border-alert-yellow/20 hover:bg-alert-yellow/5",
              iconClassName: "text-zinc-400",
              labelClassName: "text-zinc-300",
              href: "https://www.youtube.com/watch?v=DiGqjYkRQ6o",
            },
          ]}
          footer="Conteúdo educativo. Fonte: Canal Ciência Todo Dia — YouTube."
        />

        {/* AI Assistants Section */}
        <ExternalWatchSection
          icon={Search}
          title="Assistentes de IA"
          description="Use ferramentas de IA para aprofundar pesquisas, resumir documentos públicos e comparar argumentos."
          iconClassName="text-republic-blue"
          wrapperClassName="mb-6 bg-zinc-900/50 border border-republic-blue/20 p-6"
          sectionTestId="ai-assistants-section"
          gridClassName="grid grid-cols-1 md:grid-cols-2 gap-3"
          actions={[
            {
              testId: "ai-claude-link",
              icon: ExternalLink,
              label: "Claude",
              description: "Abrir claude.ai",
              className: "border-republic-blue/20 bg-republic-blue/5 hover:bg-republic-blue/10",
              iconClassName: "text-republic-blue",
              labelClassName: "text-republic-blue",
              href: "https://claude.ai",
            },
            {
              testId: "ai-gemini-link",
              icon: ExternalLink,
              label: "Gemini",
              description: "Abrir gemini.google.com",
              className: "border-white/10 hover:border-republic-blue/20 hover:bg-republic-blue/5",
              iconClassName: "text-zinc-400",
              labelClassName: "text-zinc-300",
              href: "https://gemini.google.com/app?hl=pt-BR",
            },
          ]}
          footer="Sempre valide respostas de IA com fontes oficiais e dados públicos auditáveis."
        />

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { label: "Espectro Político", path: "/spectrum", color: "border-republic-blue/20 hover:bg-republic-blue/5 hover:border-republic-blue/40" },
            { label: "Recursos Educacionais", path: "/resources", color: "border-neon-green/20 hover:bg-neon-green/5 hover:border-neon-green/40" },
            { label: "Programas Sociais", path: "/programas-sociais", color: "border-alert-yellow/20 hover:bg-alert-yellow/5 hover:border-alert-yellow/40" },
            { label: "Riscos Nucleares", path: "/riscos-nucleares", color: "border-corruption-red/20 hover:bg-corruption-red/5 hover:border-corruption-red/40" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`p-4 border text-left font-mono text-xs uppercase tracking-wider text-zinc-400 hover:text-zinc-200 transition-colors ${item.color}`}
              data-testid={`nav-${item.path.replace("/", "")}`}
            >
              {item.label} →
            </button>
          ))}
        </motion.div>

      </main>
    </div>
  );
};

export default Dashboard;
