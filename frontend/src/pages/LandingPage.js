import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Activity, Search, AlertTriangle, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-neon-green" />,
      title: "Blockchain Verification",
      description: "Every transaction verified on-chain for complete transparency"
    },
    {
      icon: <Activity className="w-8 h-8 text-alert-yellow" />,
      title: "Real-Time Monitoring",
      description: "Track political wallet activities as they happen"
    },
    {
      icon: <Search className="w-8 h-8 text-republic-blue" />,
      title: "Advanced Search",
      description: "Find any politician or transaction instantly"
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-corruption-red" />,
      title: "Suspicious Activity Detection",
      description: "AI-powered alerts for unusual transaction patterns"
    },
    {
      icon: <Users className="w-8 h-8 text-neon-green" />,
      title: "Comprehensive Profiles",
      description: "Detailed politician profiles with full transaction history"
    },
    {
      icon: <Wallet className="w-8 h-8 text-republic-blue" />,
      title: "Multi-Wallet Tracking",
      description: "Track multiple wallets per politician across blockchains"
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1640655367482-fa9797fe1258?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwyfHxicmF6aWwlMjBjb25ncmVzcyUyMGJ1aWxkaW5nJTIwbW9kZXJuJTIwYXJjaGl0ZWN0dXJlfGVufDB8fHx8MTc3Mjc0MzA1OXww&ixlib=rb-4.1.0&q=85"
            alt="Brazilian Congress"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950"></div>
        </div>

        {/* Scanlines Effect */}
        <div className="absolute inset-0 scanlines pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-chivo font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight mb-6">
              VIG<span className="text-neon-green">Í</span>LIA
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 mb-4 max-w-3xl mx-auto">
              Transparency is the new currency.
            </p>
            <p className="text-base md:text-lg text-zinc-500 mb-12 max-w-2xl mx-auto">
              Empowering Brazilian citizens with blockchain-verified political accountability.
            </p>
            <Button 
              data-testid="enter-dashboard-btn"
              onClick={() => navigate('/dashboard')} 
              className="bg-neon-green hover:bg-green-500 text-black font-bold uppercase tracking-wider px-12 py-6 text-lg rounded-none transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
            >
              Enter Dashboard
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 md:px-12 bg-zinc-950">
        <div className="container mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-chivo font-bold text-4xl md:text-5xl text-center mb-16"
          >
            Built for <span className="text-neon-green">Transparency</span>
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-900/50 border border-white/10 p-8 card-hover group"
                data-testid={`feature-card-${idx}`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-chivo font-bold text-xl mb-3 text-zinc-100">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 bg-zinc-950 border-t border-white/10">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-chivo font-bold text-4xl md:text-5xl mb-6">
              Start Monitoring Today
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of citizens tracking political transparency on the blockchain.
            </p>
            <Button 
              data-testid="cta-dashboard-btn"
              onClick={() => navigate('/dashboard')} 
              className="bg-transparent border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-black font-bold uppercase tracking-wider px-12 py-6 text-lg rounded-none transition-all"
            >
              Access Dashboard
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 bg-black">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-chivo font-bold text-lg mb-3 text-neon-green">Vigília</h3>
              <p className="text-zinc-500 text-sm">Blockchain Politics Vigilance para transparência política no Brasil</p>
            </div>
            <div>
              <h4 className="font-chivo font-bold text-sm mb-3 text-zinc-400 uppercase">Fontes Oficiais</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="https://www.camara.leg.br/tv" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-neon-green transition-colors"
                    data-testid="link-camara-tv"
                  >
                    TV Câmara dos Deputados
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.youtube.com/channel/UC-ZkSRh-7UEuwXJQ9UMCFJA" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-corruption-red transition-colors"
                    data-testid="link-youtube"
                  >
                    YouTube Câmara
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.camara.leg.br/deputados/quem-sao" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-neon-green transition-colors"
                    data-testid="link-deputados"
                  >
                    Portal dos Deputados
                  </a>
                </li>
                <li>
                  <a 
                    href="https://dadosabertos.camara.leg.br/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-neon-green transition-colors"
                    data-testid="link-dados-abertos"
                  >
                    Dados Abertos
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-chivo font-bold text-sm mb-3 text-zinc-400 uppercase">Transparência</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="https://www.gov.br/pt-br" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-neon-green transition-colors"
                  >
                    Portal Gov.br
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.portaltransparencia.gov.br/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-neon-green transition-colors"
                  >
                    Portal da Transparência
                  </a>
                </li>
                <li>
                  <a 
                    href="https://falabr.cgu.gov.br/web/home" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-alert-yellow transition-colors"
                  >
                    Fala.BR (Ouvidoria)
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.gov.br/acessoainformacao/pt-br" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-neon-green transition-colors"
                  >
                    Acesso à Informação
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-zinc-600 text-sm font-mono">Vigília © 2026 | Blockchain Politics Vigilance</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
