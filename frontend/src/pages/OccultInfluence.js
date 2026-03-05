import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Lock, Network, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const OccultInfluence = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);

  const connections = [
    {
      id: 1,
      title: "Aleister Crowley e Thelema",
      description: "Ocultista britânico (1875-1947) fundador da filosofia Thelema: 'Faze o que tu queres há de ser tudo da Lei'",
      icon: <Eye className="w-8 h-8 text-corruption-red" />,
      details: [
        "Membro da Ordem Hermética da Aurora Dourada",
        "Fundador da A∴A∴ e líder da O.T.O.",
        "Influenciou músicos: Beatles, Ozzy Osbourne, Raul Seixas",
        "Conceito de 'Verdadeira Vontade' vs Libertinagem",
        "Liber AL vel Legis - O Livro da Lei"
      ],
      color: "corruption-red"
    },
    {
      id: 2,
      title: "Sociedades Secretas e Poder",
      description: "Ordens esotéricas e sua suposta influência em decisões políticas globais",
      icon: <Lock className="w-8 h-8 text-alert-yellow" />,
      details: [
        "Ordem Hermética da Aurora Dourada (Golden Dawn)",
        "Ordo Templi Orientis (O.T.O.)",
        "Maçonaria e Illuminati",
        "Skull and Bones (Yale University)",
        "Bohemian Grove"
      ],
      color: "alert-yellow"
    },
    {
      id: 3,
      title: "Simbolismo Oculto na Política",
      description: "Símbolos esotéricos em instituições governamentais e moedas",
      icon: <Network className="w-8 h-8 text="neon-green" />,
      details: [
        "Pirâmide e Olho que Tudo Vê (dólar americano)",
        "Arquitetura de Washington DC (pentagramas)",
        "Número 33 na Maçonaria",
        "Hexagrama e símbolos cabalísticos",
        "Rituais de iniciação política"
      ],
      color: "neon-green"
    },
    {
      id: 4,
      title: "Teoria: Controle vs Coincidência",
      description: "Análise crítica entre conspiração e coincidência histórica",
      icon: <AlertTriangle className="w-8 h-8 text-republic-blue" />,
      details: [
        "Viés de Confirmação: Ver padrões onde não existem",
        "Apofenia: Conexões significativas em dados aleatórios",
        "Navalha de Hanlon: Incompetência vs Malícia",
        "Burden of Proof: Ônus da prova extraordinária",
        "Pensamento Crítico: Evidências vs Especulação"
      ],
      color: "republic-blue"
    }
  ];

  const influencers = [
    { name: "Aleister Crowley", role: "Ocultista, Mago", era: "1875-1947" },
    { name: "Helena Blavatsky", role: "Teosofia", era: "1831-1891" },
    { name: "Eliphas Lévi", role: "Mago, Cabalista", era: "1810-1875" },
    { name: "S.L. MacGregor Mathers", role: "Aurora Dourada", era: "1854-1918" },
    { name: "Gerald Gardner", role: "Wicca Moderna", era: "1884-1964" }
  ];

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
              data-testid="back-to-dashboard-occult"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-chivo font-black text-2xl">
              VIG<span className="text-neon-green">Í</span>LIA
            </h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 md:p-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-8 h-8 text-corruption-red" />
            <h1 className="font-chivo font-black text-4xl md:text-5xl">
              Ocultismo e <span className="text-corruption-red">Poder</span>
            </h1>
          </div>
          <p className="text-zinc-400 text-lg max-w-3xl">
            Explorando conexões entre esoterismo, sociedades secretas e influência política. Uma análise crítica entre teoria conspiratória e fatos históricos.
          </p>
        </motion.div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-alert-yellow/10 to-transparent border-alert-yellow/20 p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-alert-yellow flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-chivo font-bold text-lg mb-2">Aviso Importante</h3>
                <p className="text-zinc-400 text-sm">
                  Este conteúdo explora teorias históricas e culturais sobre ocultismo e política. Não endossamos teorias conspiratórias sem evidências. 
                  O pensamento crítico e a verificação de fontes são essenciais. Muitas "conexões" são especulação, coincidência ou interpretação simbólica sem base factual.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {connections.map((connection, idx) => (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              data-testid={`connection-card-${idx}`}
            >
              <Card 
                className={`bg-zinc-900/50 border-${connection.color}/20 p-6 card-hover cursor-pointer`}
                onClick={() => setSelectedTopic(connection)}
              >
                <div className="mb-4">{connection.icon}</div>
                <h3 className="font-chivo font-bold text-xl mb-3">{connection.title}</h3>
                <p className="text-zinc-400 text-sm mb-4">{connection.description}</p>
                <div className="flex flex-wrap gap-2">
                  {connection.details.slice(0, 2).map((detail, i) => (
                    <Badge key={i} className={`bg-${connection.color}/10 text-${connection.color} border-${connection.color}/20 text-xs`}>
                      {detail.length > 30 ? detail.substring(0, 30) + '...' : detail}
                    </Badge>
                  ))}
                  <Badge className="bg-white/10 text-zinc-400 border-white/20 text-xs">
                    +{connection.details.length - 2} mais
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Historical Figures */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <h2 className="font-chivo font-bold text-2xl mb-6">Figuras Históricas do Ocultismo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {influencers.map((person, idx) => (
              <Card key={idx} className="bg-zinc-900/50 border-white/10 p-4 text-center">
                <h3 className="font-chivo font-bold text-sm mb-2">{person.name}</h3>
                <p className="text-zinc-500 text-xs mb-1">{person.role}</p>
                <p className="text-zinc-600 font-mono text-xs">{person.era}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* External Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="bg-gradient-to-r from-corruption-red/10 to-transparent border-corruption-red/20 p-6">
            <div className="flex items-start gap-4">
              <Eye className="w-6 h-6 text-corruption-red flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-chivo font-bold text-lg mb-2">Saiba Mais sobre Aleister Crowley</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Leia a biografia completa e contexto histórico na Wikipédia
                </p>
                <Button
                  onClick={() => window.open('https://pt.wikipedia.org/wiki/Aleister_Crowley', '_blank')}
                  className="bg-corruption-red hover:bg-red-600 text-white font-mono text-xs uppercase"
                  data-testid="wikipedia-link"
                >
                  Abrir Wikipédia
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Modal for Selected Topic */}
        {selectedTopic && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
            onClick={() => setSelectedTopic(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-2xl w-full bg-zinc-900 border border-white/20 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-chivo font-bold text-2xl">{selectedTopic.title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTopic(null)}
                  data-testid="close-modal"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-zinc-400 text-sm mb-6">{selectedTopic.description}</p>
              <div className="space-y-3">
                {selectedTopic.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-black/50 border border-white/10">
                    <span className="text-neon-green font-mono text-sm">•</span>
                    <p className="text-zinc-300 text-sm">{detail}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OccultInfluence;
