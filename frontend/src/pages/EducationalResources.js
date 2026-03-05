import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Image as ImageIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const RESOURCES = [
  {
    id: 1,
    title: "Bússola Política Completa",
    description: "Mapeamento detalhado de ideologias políticas em um espectro bidimensional (Autoritário-Libertário / Esquerda-Direita Econômica)",
    imageUrl: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/h27v4rv8_nf84uj0sjkk71.png",
    category: "Teoria Política",
    type: "Diagrama"
  },
  {
    id: 2,
    title: "Composição da Câmara dos Deputados 2022",
    description: "Análise da composição partidária da Câmara após eleições 2022, mostrando maiores bancadas e variações desde 2018. PL elegeu 99 deputados, maior número desde 1998.",
    imageUrl: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/eo06mq8w_composicao-camara-senado-out-2022_info-1-1.png",
    category: "Dados Eleitorais",
    type: "Infográfico"
  },
  {
    id: 3,
    title: "Conceitos Básicos de Política",
    description: "Fundamentos essenciais para compreensão do sistema político brasileiro e terminologia política",
    imageUrl: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/y9altrhz_Conceitos_basicos.jpg",
    category: "Teoria Política",
    type: "Guia"
  },
  {
    id: 4,
    title: "Referência Visual Política",
    description: "Material visual complementar sobre contexto político brasileiro",
    imageUrl: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/t38cjdwq_images.jpeg",
    category: "Documentação",
    type: "Imagem"
  },
  {
    id: 5,
    title: "História da União Europeia (1940-2020)",
    description: "Linha do tempo histórica mostrando os principais marcos da formação e evolução da União Europeia",
    imageUrl: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/ge1hql73_LINHA_DO_TEMPO_HISTORIA_DA_UE.png",
    category: "História Política",
    type: "Linha do Tempo"
  },
  {
    id: 6,
    title: "Referência Política 1",
    description: "Material de referência sobre contexto político brasileiro",
    imageUrl: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/jggaig16_IMG-20260227-WA0262.jpg",
    category: "Documentação",
    type: "Imagem"
  },
  {
    id: 7,
    title: "Referência Política 2",
    description: "Material adicional sobre análise política",
    imageUrl: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/vbeugwcc_IMG-20260118-WA0236.jpg",
    category: "Documentação",
    type: "Imagem"
  },
  {
    id: 8,
    title: "Referência Política 3",
    description: "Conteúdo complementar sobre vigilância política",
    imageUrl: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/sbwly6sb_images%20%283%29.jpeg",
    category: "Documentação",
    type: "Imagem"
  },
  {
    id: 9,
    title: "Moralidade e Julgamento Estético",
    description: "Reflexão filosófica sobre critérios morais e percepção de heroísmo vs vilania baseada em estética",
    imageUrl: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/2b7dh1tz_RDT_20260203_1929061402644466279578807.jpg",
    category: "Cultura Digital",
    type: "Meme"
  },
  {
    id: 10,
    title: "Discussão Legal - Pirataria no Brasil",
    description: "Post do Reddit sobre interpretação legal da pirataria no Brasil (Art. 184 Código Penal) - uso pessoal sem lucro",
    imageUrl: "https://customer-assets.emergentagent.com/job_c1f72d8f-8a2e-4747-83ce-9b5fc1370191/artifacts/4thj4mqz_RDT_20251112_0542022394334406172182477.jpg",
    category: "Cultura Digital",
    type: "Screenshot"
  }
];

const EducationalResources = () => {
  const navigate = useNavigate();
  const [selectedResource, setSelectedResource] = useState(null);
  const [filter, setFilter] = useState("all");

  const categories = ["all", "Teoria Política", "Dados Eleitorais", "História Política", "Cultura Digital", "Documentação"];

  const filteredResources = filter === "all" 
    ? RESOURCES 
    : RESOURCES.filter(r => r.category === filter);

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
              data-testid="back-to-dashboard-resources"
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
            <BookOpen className="w-8 h-8 text-neon-green" />
            <h1 className="font-chivo font-black text-4xl md:text-5xl">
              Recursos <span className="text-neon-green">Educacionais</span>
            </h1>
          </div>
          <p className="text-zinc-400 text-lg max-w-3xl">
            Material de referência sobre teoria política, história e análise ideológica para melhor compreensão do cenário político brasileiro e internacional
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`font-mono text-xs uppercase rounded-none ${
                  filter === cat
                    ? 'bg-neon-green text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-white/10'
                }`}
                data-testid={`filter-${cat}`}
              >
                {cat === "all" ? "Todos" : cat}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, idx) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              data-testid={`resource-card-${idx}`}
            >
              <Card className="bg-zinc-900/50 border-white/10 overflow-hidden card-hover">
                <div 
                  className="aspect-video bg-black cursor-pointer relative group"
                  onClick={() => setSelectedResource(resource)}
                >
                  <img 
                    src={resource.imageUrl}
                    alt={resource.title}
                    className="w-full h-full object-contain transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono uppercase px-2 py-1 bg-neon-green/10 text-neon-green border border-neon-green/20">
                      {resource.type}
                    </span>
                    <span className="text-xs font-mono uppercase text-zinc-500">
                      {resource.category}
                    </span>
                  </div>
                  <h3 className="font-chivo font-bold text-lg mb-2">{resource.title}</h3>
                  <p className="text-zinc-400 text-sm mb-4">{resource.description}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedResource(resource)}
                      className="flex-1 bg-republic-blue hover:bg-blue-600 text-white font-mono text-xs uppercase"
                      data-testid={`view-resource-${idx}`}
                    >
                      Visualizar
                    </Button>
                    <Button
                      onClick={() => window.open(resource.imageUrl, '_blank')}
                      variant="outline"
                      size="icon"
                      className="border-white/20 hover:bg-white/10"
                      data-testid={`download-resource-${idx}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Modal for Selected Resource */}
        {selectedResource && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
            onClick={() => setSelectedResource(null)}
          >
            <div 
              className="max-w-6xl w-full bg-zinc-900 border border-white/20 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-chivo font-bold text-2xl">{selectedResource.title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedResource(null)}
                  data-testid="close-modal"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>
              <div className="bg-black p-4 max-h-[70vh] overflow-auto">
                <img 
                  src={selectedResource.imageUrl}
                  alt={selectedResource.title}
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4">
                <p className="text-zinc-400 text-sm">{selectedResource.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-alert-yellow/10 to-transparent border-alert-yellow/20 p-6">
            <div className="flex items-start gap-4">
              <BookOpen className="w-6 h-6 text-alert-yellow flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-chivo font-bold text-lg mb-2">Sobre os Recursos</h3>
                <p className="text-zinc-400 text-sm">
                  Estes materiais educacionais fornecem contexto histórico e teórico fundamental para compreender o cenário político brasileiro e internacional. Utilize-os como referência para análise ideológica e contextualização histórica das ações políticas monitoradas na plataforma Vigília.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default EducationalResources;
