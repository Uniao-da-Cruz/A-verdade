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
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2 sm:gap-4">
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
            <Button
              onClick={() => navigate('/programas-sociais')}
              className="border border-white/20 bg-transparent px-4 py-2 font-mono text-xs uppercase text-zinc-100 hover:bg-white/5"
              data-testid="social-programs-btn"
            >
              Programas Sociais
            </Button>
            <Button
              onClick={() => navigate('/resources')}
              className="bg-republic-blue hover:bg-blue-600 text-white font-mono text-xs uppercase px-4 py-2"
              data-testid="resources-btn"
            >
              Recursos
            </Button>
            <Button
              onClick={() => navigate('/spectrum')}
              className="bg-neon-green hover:bg-green-600 text-black font-mono text-xs uppercase px-4 py-2"
              data-testid="spectrum-analysis-btn"
            >
              Espectro Político
            </Button>
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
                      
                      {/* Social Media Links */}
                      {(politician.instagram || politician.twitter || politician.youtube) && (
                        <div className="flex gap-2 mb-3">
                          {politician.instagram && (
                            <a
                              href={`https://www.instagram.com/${politician.instagram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neon-green hover:text-green-400 transition-colors"
                              data-testid={`politician-instagram-${idx}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}
                          {politician.youtube && (
                            <a
                              href={`https://www.youtube.com/channel/${politician.youtube}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-corruption-red hover:text-red-400 transition-colors"
                              data-testid={`politician-youtube-${idx}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Youtube className="w-4 h-4" />
                            </a>
                          )}
                          {politician.twitter && (
                            <a
                              href={`https://twitter.com/${politician.twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-alert-yellow hover:text-yellow-400 transition-colors"
                              data-testid={`politician-twitter-${idx}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                      
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

        <ExternalWatchSection
          icon={Landmark}
          title="CadÚnico + Programas Sociais"
          description="Acompanhe o portal da Dataprev para cruzar trilhas de consulta social, programas disponíveis no Cadastro Único e referências oficiais úteis para vigilância cidadã."
          iconClassName="text-neon-green"
          wrapperClassName="mb-6 border border-neon-green/20 bg-gradient-to-r from-neon-green/10 to-transparent p-6"
          sectionTestId="cadunico-watch-section"
          actions={[
            {
              href: 'https://cadunico.dataprev.gov.br/#/programas-sociais',
              label: 'Portal CadÚnico',
              description: 'Acesso direto à vitrine de programas sociais do portal.',
              icon: Landmark,
              className: 'border-neon-green/30 bg-neon-green/10 hover:bg-neon-green/20',
              iconClassName: 'text-neon-green',
              labelClassName: 'text-neon-green',
              testId: 'cadunico-portal-link',
            },
            {
              onClick: () => navigate('/programas-sociais'),
              label: 'Página dedicada',
              description: 'Resumo curado com atalhos oficiais dentro da Vigília.',
              icon: FileSearch,
              className: 'border-republic-blue/30 bg-republic-blue/10 hover:bg-republic-blue/20',
              iconClassName: 'text-republic-blue',
              labelClassName: 'text-republic-blue',
              testId: 'cadunico-internal-page-link',
            },
            {
              href: 'https://www.gov.br/mds/pt-br/acoes-e-programas/cadastro-unico',
              label: 'Sobre o CadÚnico',
              description: 'Base institucional do Governo Federal para contexto e regras.',
              icon: ExternalLink,
              className: 'border-alert-yellow/30 bg-alert-yellow/10 hover:bg-alert-yellow/20',
              iconClassName: 'text-alert-yellow',
              labelClassName: 'text-alert-yellow',
              testId: 'cadunico-about-link',
            },
            {
              href: 'https://www.gov.br/mds/pt-br/acoes-e-programas/cadastro-unico/perguntas-frequentes-cadastro-unico',
              label: 'Perguntas frequentes',
              description: 'Atalho oficial para dúvidas e conferência rápida.',
              icon: AlertTriangle,
              className: 'border-corruption-red/30 bg-corruption-red/10 hover:bg-corruption-red/20',
              iconClassName: 'text-corruption-red',
              labelClassName: 'text-corruption-red',
              testId: 'cadunico-faq-link',
            },
          ]}
          footer="Fonte observada: portal Cadastro Único da Dataprev, com acesso às áreas de consulta por CPF, postos de atendimento, programas sociais e validação de comprovante."
        />

        <ExternalWatchSection
          icon={AlertTriangle}
          title="Perigos da Bomba Atômica"
          description="Integração educativa a partir do documentário do canal Ciência Todo Dia para mostrar como a bomba atômica une destruição em massa, radiação, corrida armamentista e risco político global."
          iconClassName="text-corruption-red"
          wrapperClassName="mb-6 border border-corruption-red/20 bg-gradient-to-r from-corruption-red/10 to-transparent p-6"
          sectionTestId="nuclear-risks-watch-section"
          actions={[
            {
              href: 'https://www.youtube.com/watch?v=6fsuiVHtEfc',
              label: 'Vídeo original',
              description: 'Documentário completo sobre a história e os riscos da bomba atômica.',
              icon: Youtube,
              className: 'border-corruption-red/30 bg-corruption-red/10 hover:bg-corruption-red/20',
              iconClassName: 'text-corruption-red',
              labelClassName: 'text-corruption-red',
              testId: 'nuclear-risks-video-link',
            },
            {
              onClick: () => navigate('/riscos-nucleares'),
              label: 'Página dedicada',
              description: 'Resumo visual com perigos centrais, linha do tempo e referências.',
              icon: FileSearch,
              className: 'border-republic-blue/30 bg-republic-blue/10 hover:bg-republic-blue/20',
              iconClassName: 'text-republic-blue',
              labelClassName: 'text-republic-blue',
              testId: 'nuclear-risks-internal-page-link',
            },
            {
              href: 'https://www.youtube.com/@CienciaTodoDia',
              label: 'Canal fonte',
              description: 'Acesso ao canal Ciência Todo Dia no YouTube.',
              icon: ExternalLink,
              className: 'border-alert-yellow/30 bg-alert-yellow/10 hover:bg-alert-yellow/20',
              iconClassName: 'text-alert-yellow',
              labelClassName: 'text-alert-yellow',
              testId: 'nuclear-risks-channel-source-link',
            },
            {
              href: 'https://www.youtube.com/watch?v=DiGqjYkRQ6o',
              label: 'Chernobyl',
              description: 'Vídeo relacionado para aprofundar riscos e consequências humanas.',
              icon: AlertTriangle,
              className: 'border-neon-green/30 bg-neon-green/10 hover:bg-neon-green/20',
              iconClassName: 'text-neon-green',
              labelClassName: 'text-neon-green',
              testId: 'nuclear-risks-chernobyl-link',
            },
          ]}
          footer="Fonte observada: vídeo ‘REAÇÃO em CADEIA: a HISTÓRIA da BOMBA ATÔMICA’, publicado pelo canal Ciência Todo Dia, com foco em Projeto Manhattan, Teste Trinity, dissuasão nuclear e risco civilizatório."
        />

        {/* Official Sources Banner */}
        <div className="mt-12 bg-gradient-to-r from-republic-blue/10 to-transparent border border-republic-blue/20 p-6 mb-6">
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

        {/* YouTube Vigilance Section */}
        <div className="bg-gradient-to-r from-corruption-red/10 to-transparent border border-corruption-red/20 p-6 mb-6">
          <div className="flex items-start gap-4">
            <Youtube className="w-6 h-6 text-corruption-red flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-chivo font-bold text-lg mb-2">Vigilância no YouTube</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Monitore sessões ao vivo, discursos e atividades parlamentares no canal oficial da Câmara dos Deputados
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <a 
                  href="https://www.youtube.com/channel/UC-ZkSRh-7UEuwXJQ9UMCFJA" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-corruption-red/10 hover:bg-corruption-red/20 border border-corruption-red/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="youtube-camara-link"
                >
                  <Youtube className="w-4 h-4 text-corruption-red" />
                  <span className="text-xs font-mono uppercase text-corruption-red">Canal da Câmara</span>
                </a>
                <span className="text-zinc-600 text-xs">•</span>
                <span className="text-zinc-500 text-xs font-mono">Transmissões ao vivo de sessões e debates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Government Portal Section */}
        <div className="bg-gradient-to-r from-neon-green/10 to-transparent border border-neon-green/20 p-6 mb-6">
          <div className="flex items-start gap-4">
            <Activity className="w-6 h-6 text-neon-green flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-chivo font-bold text-lg mb-2">Portal do Governo Federal</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Acesse serviços públicos, transparência governamental e informações oficiais do Governo Federal
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <a 
                  href="https://www.gov.br/pt-br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="govbr-portal-link"
                >
                  <ExternalLink className="w-4 h-4 text-neon-green" />
                  <span className="text-xs font-mono uppercase text-neon-green">Portal Gov.br</span>
                </a>
                <a 
                  href="https://falabr.cgu.gov.br/web/home" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-alert-yellow/10 hover:bg-alert-yellow/20 border border-alert-yellow/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="fala-br-link"
                >
                  <AlertTriangle className="w-4 h-4 text-alert-yellow" />
                  <span className="text-xs font-mono uppercase text-alert-yellow">Fala.BR (Ouvidoria)</span>
                </a>
                <a 
                  href="https://www.gov.br/acessoainformacao/pt-br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-republic-blue/10 hover:bg-republic-blue/20 border border-republic-blue/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="lai-link"
                >
                  <ExternalLink className="w-4 h-4 text-republic-blue" />
                  <span className="text-xs font-mono uppercase text-republic-blue">Acesso à Informação</span>
                </a>
                <a 
                  href="https://www.portaltransparencia.gov.br/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-republic-blue/10 hover:bg-republic-blue/20 border border-republic-blue/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="transparencia-link"
                >
                  <ExternalLink className="w-4 h-4 text-republic-blue" />
                  <span className="text-xs font-mono uppercase text-republic-blue">Portal da Transparência</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* State Government Transparency - Rio de Janeiro */}
        <div className="bg-gradient-to-r from-republic-blue/10 to-transparent border border-republic-blue/20 p-6 mb-6">
          <div className="flex items-start gap-4">
            <Activity className="w-6 h-6 text-republic-blue flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-chivo font-bold text-lg mb-2">Transparência Estadual - Rio de Janeiro</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Monitore orçamento, receitas, despesas, licitações e contratos do Governo do Estado do Rio de Janeiro
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <a 
                  href="https://www.rj.gov.br/transparencia/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-republic-blue/10 hover:bg-republic-blue/20 border border-republic-blue/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="rj-transparencia-link"
                >
                  <ExternalLink className="w-4 h-4 text-republic-blue" />
                  <span className="text-xs font-mono uppercase text-republic-blue">Portal Transparência RJ</span>
                </a>
                <a 
                  href="https://www.rj.gov.br/transparencia/receitas" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="rj-receitas-link"
                >
                  <ExternalLink className="w-4 h-4 text-neon-green" />
                  <span className="text-xs font-mono uppercase text-neon-green">Receitas RJ</span>
                </a>
                <a 
                  href="https://www.rj.gov.br/transparencia/despesas" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-corruption-red/10 hover:bg-corruption-red/20 border border-corruption-red/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="rj-despesas-link"
                >
                  <ExternalLink className="w-4 h-4 text-corruption-red" />
                  <span className="text-xs font-mono uppercase text-corruption-red">Despesas RJ</span>
                </a>
                <a 
                  href="https://www.rj.gov.br/remuneracao/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-alert-yellow/10 hover:bg-alert-yellow/20 border border-alert-yellow/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="rj-remuneracao-link"
                >
                  <Users className="w-4 h-4 text-alert-yellow" />
                  <span className="text-xs font-mono uppercase text-alert-yellow">Remunerações RJ</span>
                </a>
                <a 
                  href="https://www.rj.gov.br/ouverj/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-alert-yellow/10 hover:bg-alert-yellow/20 border border-alert-yellow/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="ouverj-link"
                >
                  <AlertTriangle className="w-4 h-4 text-alert-yellow" />
                  <span className="text-xs font-mono uppercase text-alert-yellow">OuvERJ (Ouvidoria)</span>
                </a>
                <a 
                  href="https://www.rj.gov.br/transparencia/obras" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-republic-blue/10 hover:bg-republic-blue/20 border border-republic-blue/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="rj-dados-abertos-link"
                >
                  <ExternalLink className="w-4 h-4 text-republic-blue" />
                  <span className="text-xs font-mono uppercase text-republic-blue">Dados Abertos RJ</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps Integration - Political Locations */}
        <div className="bg-gradient-to-r from-alert-yellow/10 to-transparent border border-alert-yellow/20 p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <MapPin className="w-6 h-6 text-alert-yellow flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-chivo font-bold text-lg mb-2">Mapa de Vigilância Política</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Visualize localizações importantes: Câmara dos Deputados, Congresso Nacional, escritórios políticos e obras públicas monitoradas
              </p>
            </div>
          </div>
          
          {/* Embedded Google Map */}
          <div className="w-full h-96 bg-zinc-900/50 border border-white/10 rounded-none overflow-hidden" data-testid="google-maps-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3839.3427893766524!2d-47.88059492464395!3d-15.799681084760787!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935a3b2d27a0c4b9%3A0xe69f8c0b9d7f5c5d!2sCongresso%20Nacional!5e0!3m2!1spt-BR!2sbr!4v1709667890123!5m2!1spt-BR!2sbr"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de Vigilância Política"
              className="grayscale hover:grayscale-0 transition-all duration-300"
            ></iframe>
          </div>
          
          {/* Map Quick Links */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <a
              href="https://www.google.com/maps/place/Congresso+Nacional/@-15.7996811,-47.8805949,17z/data=!3m1!4b1!4m6!3m5!1s0x935a3b2d27a0c4b9:0xe69f8c0b9d7f5c5d!8m2!3d-15.7996863!4d-47.87802!16zL20vMDJoejQ?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-alert-yellow/10 hover:bg-alert-yellow/20 border border-alert-yellow/30 px-3 py-2 rounded-none transition-colors"
              data-testid="map-link-congresso"
            >
              <MapPin className="w-3 h-3 text-alert-yellow" />
              <span className="text-xs font-mono uppercase text-alert-yellow">Congresso</span>
            </a>
            <a
              href="https://www.google.com/maps/place/C%C3%A2mara+dos+Deputados/@-15.7999111,-47.8630094,17z/data=!3m1!4b1!4m6!3m5!1s0x935a3b3d84c5c5c5:0x5c5c5c5c5c5c5c5c!8m2!3d-15.7999163!4d-47.8604345!16s%2Fm%2F02j0zf?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 px-3 py-2 rounded-none transition-colors"
              data-testid="map-link-camara"
            >
              <MapPin className="w-3 h-3 text-neon-green" />
              <span className="text-xs font-mono uppercase text-neon-green">Câmara</span>
            </a>
            <a
              href="https://www.google.com/maps/place/Pal%C3%A1cio+do+Planalto/@-15.7993611,-47.8611111,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-republic-blue/10 hover:bg-republic-blue/20 border border-republic-blue/30 px-3 py-2 rounded-none transition-colors"
              data-testid="map-link-planalto"
            >
              <MapPin className="w-3 h-3 text-republic-blue" />
              <span className="text-xs font-mono uppercase text-republic-blue">Planalto</span>
            </a>
            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-corruption-red/10 hover:bg-corruption-red/20 border border-corruption-red/30 px-3 py-2 rounded-none transition-colors"
              data-testid="map-link-explore"
            >
              <MapPin className="w-3 h-3 text-corruption-red" />
              <span className="text-xs font-mono uppercase text-corruption-red">Explorar</span>
            </a>
          </div>
        </div>

        {/* TSE - Electoral Transparency */}
        <div className="bg-gradient-to-r from-corruption-red/10 to-transparent border border-corruption-red/20 p-6 mb-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-corruption-red flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-chivo font-bold text-lg mb-2">TSE - Transparência Eleitoral</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Monitore financiamento de campanhas, prestação de contas eleitorais e dados sobre eleições
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <a 
                  href="https://www.tse.jus.br/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-corruption-red/10 hover:bg-corruption-red/20 border border-corruption-red/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="tse-portal-link"
                >
                  <ExternalLink className="w-4 h-4 text-corruption-red" />
                  <span className="text-xs font-mono uppercase text-corruption-red">Portal TSE</span>
                </a>
                <a 
                  href="https://divulgacandcontas.tse.jus.br/divulga/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-alert-yellow/10 hover:bg-alert-yellow/20 border border-alert-yellow/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="tse-candidaturas-link"
                >
                  <Users className="w-4 h-4 text-alert-yellow" />
                  <span className="text-xs font-mono uppercase text-alert-yellow">Candidaturas e Contas</span>
                </a>
                <a 
                  href="https://www.tse.jus.br/eleicoes/estatisticas/estatisticas" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-republic-blue/10 hover:bg-republic-blue/20 border border-republic-blue/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="tse-estatisticas-link"
                >
                  <Activity className="w-4 h-4 text-republic-blue" />
                  <span className="text-xs font-mono uppercase text-republic-blue">Estatísticas Eleitorais</span>
                </a>
                <a 
                  href="https://www.tse.jus.br/partidos/contas-partidarias/contas-partidarias" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="tse-contas-partidarias-link"
                >
                  <ExternalLink className="w-4 h-4 text-neon-green" />
                  <span className="text-xs font-mono uppercase text-neon-green">Contas Partidárias</span>
                </a>
                <a 
                  href="https://www.tse.jus.br/transparencia-e-prestacao-de-contas" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-republic-blue/10 hover:bg-republic-blue/20 border border-republic-blue/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="tse-transparencia-link"
                >
                  <ExternalLink className="w-4 h-4 text-republic-blue" />
                  <span className="text-xs font-mono uppercase text-republic-blue">Transparência TSE</span>
                </a>
                <a 
                  href="https://www.tse.jus.br/servicos-eleitorais/servicos/ouvidoria-tse" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-alert-yellow/10 hover:bg-alert-yellow/20 border border-alert-yellow/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="tse-ouvidoria-link"
                >
                  <AlertTriangle className="w-4 h-4 text-alert-yellow" />
                  <span className="text-xs font-mono uppercase text-alert-yellow">Ouvidoria TSE</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Reddit - Public Opinion Monitoring */}
        <div className="bg-gradient-to-r from-neon-green/10 to-transparent border border-neon-green/20 p-6">
          <div className="flex items-start gap-4">
            <Users className="w-6 h-6 text-neon-green flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-chivo font-bold text-lg mb-2">Monitoramento de Opinião Pública - Reddit</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Acompanhe discussões sobre transparência, corrupção e política brasileira em comunidades públicas do Reddit
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <a 
                  href="https://www.reddit.com/r/brasil/search/?q=corrup%C3%A7%C3%A3o%20transpar%C3%AAncia&restrict_sr=1&sort=new" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="reddit-brasil-link"
                >
                  <ExternalLink className="w-4 h-4 text-neon-green" />
                  <span className="text-xs font-mono uppercase text-neon-green">r/brasil (1.2M+)</span>
                </a>
                <a 
                  href="https://www.reddit.com/r/brasilivre/search/?q=transpar%C3%AAncia&restrict_sr=1&sort=new" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-republic-blue/10 hover:bg-republic-blue/20 border border-republic-blue/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="reddit-brasilivre-link"
                >
                  <ExternalLink className="w-4 h-4 text-republic-blue" />
                  <span className="text-xs font-mono uppercase text-republic-blue">r/brasilivre (250K+)</span>
                </a>
                <a 
                  href="https://www.reddit.com/r/politicabrasil/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-alert-yellow/10 hover:bg-alert-yellow/20 border border-alert-yellow/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="reddit-politica-link"
                >
                  <ExternalLink className="w-4 h-4 text-alert-yellow" />
                  <span className="text-xs font-mono uppercase text-alert-yellow">r/politicabrasil (150K+)</span>
                </a>
                <a 
                  href="https://www.reddit.com/search/?q=corrup%C3%A7%C3%A3o%20brasil%20pol%C3%ADtico&sort=new" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-corruption-red/10 hover:bg-corruption-red/20 border border-corruption-red/30 px-4 py-2 rounded-none transition-colors"
                  data-testid="reddit-search-link"
                >
                  <Search className="w-4 h-4 text-corruption-red" />
                  <span className="text-xs font-mono uppercase text-corruption-red">Busca Global Reddit</span>
                </a>
              </div>
              <div className="mt-4 p-3 bg-zinc-900/50 border border-white/10">
                <p className="text-zinc-500 text-xs font-mono">
                  💡 Tópicos Quentes: Eleições 2026, Transparência Digital, CPIs, Denúncias de Corrupção, Lava Jato, STF
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
