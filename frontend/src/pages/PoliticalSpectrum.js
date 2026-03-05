import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SPECTRUM_IMAGE = "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/2xh12j6a_0_4TZH59a2SRhv23md.png";

const VIDEOS = [
  {
    id: 1,
    title: "Análise Política - Vídeo 1",
    url: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/vi3u7rfg_5247125153462251736_play.mp4_logo_BR.mp4",
    description: "Conteúdo sobre vigilância política"
  },
  {
    id: 2,
    title: "Análise Política - Vídeo 2",
    url: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/38hzm6m0_218800317982671df6abe19bcb9c1d29.mp4",
    description: "Discussão sobre transparência"
  },
  {
    id: 3,
    title: "Análise Política - Vídeo 3",
    url: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/ndo9olop_20260127_140224726.mp4_play_BR.mp4",
    description: "Contexto político brasileiro"
  },
  {
    id: 4,
    title: "Análise Política - Vídeo 4",
    url: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/fh56ds1i_58d02b94cb23cbbd7f021204a3b75f53.mp4",
    description: "Análise de corrupção"
  },
  {
    id: 5,
    title: "Discussão Política - Vídeo 5",
    url: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/vh8n23k7_RDT_20260115_234056.mp4",
    description: "Material adicional de análise política"
  }
];

const PoliticalSpectrum = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);

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
              data-testid="back-to-dashboard-spectrum"
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
          <h1 className="font-chivo font-black text-4xl md:text-5xl mb-4">
            Espectro Político <span className="text-neon-green">Brasileiro</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-3xl">
            Entenda as posições ideológicas dos políticos brasileiros através do espectro político multidimensional
          </p>
        </motion.div>

        {/* Political Spectrum Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-zinc-900/50 border-white/10 p-6" data-testid="spectrum-card">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-alert-yellow" />
              <h2 className="font-chivo font-bold text-2xl">Mapa Ideológico</h2>
            </div>
            <p className="text-zinc-400 text-sm mb-6">
              O espectro político é organizado em dois eixos principais: Individualismo vs Coletivismo (Moral e Econômico)
            </p>
            <div className="bg-black/50 p-4 rounded-none border border-white/10">
              <img 
                src={SPECTRUM_IMAGE}
                alt="Espectro Político"
                className="w-full h-auto"
                data-testid="spectrum-image"
              />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neon-green/10 border border-neon-green/20 p-4">
                <h3 className="font-chivo font-bold text-sm mb-2 text-neon-green uppercase">Eixo Econômico</h3>
                <p className="text-zinc-400 text-xs">Individualismo Econômico (Livre Mercado) ↔ Coletivismo Econômico (Estado)</p>
              </div>
              <div className="bg-republic-blue/10 border border-republic-blue/20 p-4">
                <h3 className="font-chivo font-bold text-sm mb-2 text-republic-blue uppercase">Eixo Moral</h3>
                <p className="text-zinc-400 text-xs">Individualismo Moral (Liberdade Individual) ↔ Coletivismo Moral (Valores Tradicionais)</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Video Analysis Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Video className="w-6 h-6 text-corruption-red" />
            <h2 className="font-chivo font-bold text-2xl">Vídeos de Análise Política</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VIDEOS.map((video, idx) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                data-testid={`video-card-${idx}`}
              >
                <Card className="bg-zinc-900/50 border-white/10 p-6 card-hover">
                  <div className="mb-4">
                    <video 
                      controls
                      className="w-full h-auto bg-black rounded-none"
                      poster="/api/placeholder/640/360"
                    >
                      <source src={video.url} type="video/mp4" />
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                  </div>
                  <h3 className="font-chivo font-bold text-lg mb-2">{video.title}</h3>
                  <p className="text-zinc-400 text-sm">{video.description}</p>
                  <Button
                    onClick={() => setSelectedVideo(video)}
                    className="mt-4 bg-corruption-red hover:bg-red-600 text-white font-mono text-xs uppercase"
                    data-testid={`watch-video-${idx}`}
                  >
                    Assistir Completo
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Ideological Quadrants Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <h2 className="font-chivo font-bold text-2xl mb-6">Quadrantes Ideológicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-neon-green/10 to-transparent border-neon-green/20 p-6">
              <h3 className="font-chivo font-bold text-lg mb-3 text-neon-green">Libertário Esquerda</h3>
              <p className="text-zinc-400 text-sm mb-3">Individualismo Moral + Coletivismo Econômico</p>
              <ul className="text-zinc-500 text-xs space-y-1">
                <li>• Socialismo Libertário</li>
                <li>• Anarquismo</li>
                <li>• Progressismo Social</li>
              </ul>
            </Card>
            
            <Card className="bg-gradient-to-br from-alert-yellow/10 to-transparent border-alert-yellow/20 p-6">
              <h3 className="font-chivo font-bold text-lg mb-3 text-alert-yellow">Libertário Direita</h3>
              <p className="text-zinc-400 text-sm mb-3">Individualismo Moral + Individualismo Econômico</p>
              <ul className="text-zinc-500 text-xs space-y-1">
                <li>• Liberalismo Clássico</li>
                <li>• Anarcocapitalismo</li>
                <li>• Libertarianismo</li>
              </ul>
            </Card>
            
            <Card className="bg-gradient-to-br from-republic-blue/10 to-transparent border-republic-blue/20 p-6">
              <h3 className="font-chivo font-bold text-lg mb-3 text-republic-blue">Autoritário Esquerda</h3>
              <p className="text-zinc-400 text-sm mb-3">Coletivismo Moral + Coletivismo Econômico</p>
              <ul className="text-zinc-500 text-xs space-y-1">
                <li>• Socialismo Democrático</li>
                <li>• Nacional Desenvolvimentismo</li>
                <li>• Comunismo</li>
              </ul>
            </Card>
            
            <Card className="bg-gradient-to-br from-corruption-red/10 to-transparent border-corruption-red/20 p-6">
              <h3 className="font-chivo font-bold text-lg mb-3 text-corruption-red">Autoritário Direita</h3>
              <p className="text-zinc-400 text-sm mb-3">Coletivismo Moral + Individualismo Econômico</p>
              <ul className="text-zinc-500 text-xs space-y-1">
                <li>• Conservadorismo Social</li>
                <li>• Conservadorismo Democrático</li>
                <li>• Fascismo</li>
              </ul>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PoliticalSpectrum;
