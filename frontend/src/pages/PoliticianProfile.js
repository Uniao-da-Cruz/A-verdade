import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Wallet, Activity, AlertTriangle, ExternalLink, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PoliticianProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [politician, setPolitician] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoliticianData();
  }, [id]);

  const loadPoliticianData = async () => {
    try {
      setLoading(true);
      const [politicianRes, transactionsRes] = await Promise.all([
        axios.get(`${API}/politicians/${id}`),
        axios.get(`${API}/transactions/politician/${id}`)
      ]);

      setPolitician(politicianRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error("Error loading politician data:", error);
      toast.error("Failed to load politician data");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!politician) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Politician not found</p>
          <Button onClick={() => navigate('/dashboard')} data-testid="back-button">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              data-testid="back-to-dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-chivo font-black text-2xl">
              VIG<span className="text-neon-green">Í</span>LIA
            </h1>
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <section className="px-6 md:px-12 py-12 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h1 className="font-chivo font-black text-4xl md:text-5xl mb-4" data-testid="politician-name">
                {politician.name}
              </h1>
              <p className="text-zinc-400 text-lg mb-6">{politician.party} • {politician.position}</p>
              
              <div className="flex gap-3 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://www.camara.leg.br/deputados/quem-sao', '_blank')}
                  className="bg-transparent border border-republic-blue/50 text-republic-blue hover:bg-republic-blue/10 text-xs font-mono uppercase"
                  data-testid="verify-official-btn"
                >
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Verificar na Câmara
                </Button>
                
                {politician.instagram && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://www.instagram.com/${politician.instagram}`, '_blank')}
                    className="bg-transparent border border-neon-green/50 text-neon-green hover:bg-neon-green/10 text-xs font-mono uppercase"
                    data-testid="instagram-btn"
                  >
                    <Instagram className="w-3 h-3 mr-2" />
                    Instagram
                  </Button>
                )}
                
                {politician.youtube && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://www.youtube.com/channel/${politician.youtube}`, '_blank')}
                    className="bg-transparent border border-corruption-red/50 text-corruption-red hover:bg-corruption-red/10 text-xs font-mono uppercase"
                    data-testid="youtube-btn"
                  >
                    <Youtube className="w-3 h-3 mr-2" />
                    YouTube
                  </Button>
                )}
                
                {politician.twitter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://twitter.com/${politician.twitter}`, '_blank')}
                    className="bg-transparent border border-alert-yellow/50 text-alert-yellow hover:bg-alert-yellow/10 text-xs font-mono uppercase"
                    data-testid="twitter-btn"
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Twitter
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2 mb-6">
                {politician.verified && (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs font-mono uppercase" data-testid="verified-badge">
                    Verified
                  </Badge>
                )}
                {politician.suspicious_count > 0 && (
                  <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs font-mono uppercase" data-testid="suspicious-badge">
                    {politician.suspicious_count} Suspicious
                  </Badge>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-zinc-900/50 border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-neon-green" />
                    <p className="text-zinc-500 text-sm uppercase tracking-wider">Wallets</p>
                  </div>
                  <p className="text-2xl font-chivo font-bold">{politician.wallets.length}</p>
                </div>
                <div className="bg-zinc-900/50 border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-republic-blue" />
                    <p className="text-zinc-500 text-sm uppercase tracking-wider">Transactions</p>
                  </div>
                  <p className="text-2xl font-chivo font-bold">{politician.total_transactions}</p>
                </div>
                <div className="bg-zinc-900/50 border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-corruption-red" />
                    <p className="text-zinc-500 text-sm uppercase tracking-wider">Suspicious</p>
                  </div>
                  <p className="text-2xl font-chivo font-bold">{politician.suspicious_count}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Wallets Section */}
      <section className="px-6 md:px-12 py-12 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-chivo font-bold text-2xl mb-6">Tracked Wallets</h2>
          <div className="grid grid-cols-1 gap-3">
            {politician.wallets.length === 0 ? (
              <Card className="p-8 bg-zinc-900/50 border-white/10 text-center" data-testid="no-wallets">
                <p className="text-zinc-500">No wallets registered</p>
              </Card>
            ) : (
              politician.wallets.map((wallet, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-zinc-900/50 border border-white/10 p-4 flex items-center justify-between"
                  data-testid={`wallet-${idx}`}
                >
                  <p className="font-mono text-sm text-zinc-300">{wallet}</p>
                  <ExternalLink className="w-4 h-4 text-zinc-600" />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Transactions Section */}
      <section className="px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-chivo font-bold text-2xl mb-6">Transaction History</h2>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <Card className="p-8 bg-zinc-900/50 border-white/10 text-center" data-testid="no-transactions">
                <p className="text-zinc-500">No transactions recorded</p>
              </Card>
            ) : (
              transactions.map((tx, idx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-zinc-900/50 border border-white/10 p-6"
                  data-testid={`transaction-${idx}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={`${getStatusBadge(tx.status)} text-xs font-mono uppercase`}>
                          {tx.status}
                        </Badge>
                        <span className="text-zinc-500 text-sm font-mono">
                          {new Date(tx.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-zinc-600 mb-1">TX HASH</p>
                      <p className="font-mono text-sm text-zinc-400 mb-4">{tx.tx_hash}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-zinc-600 text-xs uppercase mb-1">From</p>
                          <p className="font-mono text-sm text-zinc-300 truncate">{tx.from_address}</p>
                        </div>
                        <div>
                          <p className="text-zinc-600 text-xs uppercase mb-1">To</p>
                          <p className="font-mono text-sm text-zinc-300 truncate">{tx.to_address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-chivo font-bold text-neon-green">{tx.amount}</p>
                      <p className="text-zinc-500 text-sm">{tx.currency}</p>
                    </div>
                  </div>
                  {tx.description && (
                    <p className="text-zinc-400 text-sm border-t border-white/10 pt-3 mt-3">{tx.description}</p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PoliticianProfile;
