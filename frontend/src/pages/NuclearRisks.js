import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Clock3, ExternalLink, Eye, ShieldAlert, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  nuclearDangerCards,
  nuclearReferenceLinks,
  nuclearRiskOverview,
  nuclearTimeline,
} from "@/data/nuclearRisks";

export default function NuclearRisks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-12">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              data-testid="nuclear-risks-back-dashboard-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-corruption-red" data-testid="nuclear-risks-kicker">
                Vigilância nuclear
              </p>
              <h1 className="font-chivo text-2xl font-black" data-testid="nuclear-risks-page-title">
                Riscos da Bomba Atômica
              </h1>
            </div>
          </div>
          <Button
            onClick={() => window.open(nuclearRiskOverview.videoUrl, "_blank")}
            className="w-full bg-corruption-red px-4 py-2 font-mono text-xs uppercase text-white hover:bg-red-600 sm:w-auto"
            data-testid="nuclear-risks-open-video-button"
          >
            Ver vídeo original
          </Button>
        </div>
      </nav>

      <main className="px-6 py-10 md:px-12 md:py-14">
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.95fr]" data-testid="nuclear-risks-hero-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden border border-corruption-red/20 bg-gradient-to-br from-corruption-red/10 via-zinc-950 to-zinc-900 p-8"
            data-testid="nuclear-risks-hero-card"
          >
            <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.16),transparent_60%)]" />
            <div className="relative space-y-5">
              <p className="inline-flex border border-corruption-red/30 bg-corruption-red/10 px-3 py-1 font-mono text-xs uppercase text-corruption-red" data-testid="nuclear-risks-source-badge">
                Fonte: YouTube / Ciência Todo Dia
              </p>
              <div className="space-y-3">
                <h2 className="font-chivo text-4xl font-black sm:text-5xl lg:text-6xl" data-testid="nuclear-risks-hero-title">
                  {nuclearRiskOverview.title}
                </h2>
                <p className="max-w-2xl text-sm text-zinc-300 md:text-base" data-testid="nuclear-risks-hero-description">
                  {nuclearRiskOverview.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <div className="border border-white/10 bg-black/30 p-4" data-testid="nuclear-risks-meta-duration">
                  <div className="mb-2 flex items-center gap-2 text-corruption-red">
                    <Clock3 className="h-4 w-4" />
                    <span className="font-mono text-xs uppercase">Duração</span>
                  </div>
                  <p className="font-chivo text-2xl font-bold">{nuclearRiskOverview.duration}</p>
                </div>
                <div className="border border-white/10 bg-black/30 p-4" data-testid="nuclear-risks-meta-views">
                  <div className="mb-2 flex items-center gap-2 text-alert-yellow">
                    <Eye className="h-4 w-4" />
                    <span className="font-mono text-xs uppercase">Alcance</span>
                  </div>
                  <p className="font-chivo text-2xl font-bold">{nuclearRiskOverview.views}</p>
                </div>
                <div className="border border-white/10 bg-black/30 p-4" data-testid="nuclear-risks-meta-date">
                  <div className="mb-2 flex items-center gap-2 text-republic-blue">
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-mono text-xs uppercase">Publicado</span>
                  </div>
                  <p className="font-chivo text-lg font-bold">{nuclearRiskOverview.publishedAt}</p>
                </div>
                <div className="border border-white/10 bg-black/30 p-4" data-testid="nuclear-risks-meta-category">
                  <div className="mb-2 flex items-center gap-2 text-neon-green">
                    <ShieldAlert className="h-4 w-4" />
                    <span className="font-mono text-xs uppercase">Categoria</span>
                  </div>
                  <p className="font-chivo text-lg font-bold">{nuclearRiskOverview.category}</p>
                </div>
              </div>

              <div className="border border-white/10 bg-zinc-900/60 p-5" data-testid="nuclear-risks-source-summary">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Resumo do conteúdo</p>
                <p className="mt-3 text-sm text-zinc-300">{nuclearRiskOverview.sourceSummary}</p>
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="space-y-4"
            data-testid="nuclear-risks-video-panel"
          >
            <div className="overflow-hidden border border-white/10 bg-zinc-900/50">
              <div className="aspect-video w-full" data-testid="nuclear-risks-video-embed-container">
                <iframe
                  src={nuclearRiskOverview.embedUrl}
                  title={nuclearRiskOverview.videoTitle}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  data-testid="nuclear-risks-video-embed"
                />
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-corruption-red" data-testid="nuclear-risks-video-kicker">
                    Documentário de referência
                  </p>
                  <h3 className="mt-2 font-chivo text-2xl font-bold" data-testid="nuclear-risks-video-title">
                    {nuclearRiskOverview.videoTitle}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-400" data-testid="nuclear-risks-video-channel">
                    Canal: {nuclearRiskOverview.channelName}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <a
                    href={nuclearRiskOverview.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-corruption-red/30 bg-corruption-red/10 px-4 py-3 transition-colors hover:bg-corruption-red/20"
                    data-testid="nuclear-risks-watch-youtube-link"
                  >
                    <Youtube className="h-4 w-4 text-corruption-red" />
                    <span className="font-mono text-xs uppercase text-corruption-red">Assistir no YouTube</span>
                  </a>
                  <a
                    href={nuclearRiskOverview.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-republic-blue/30 bg-republic-blue/10 px-4 py-3 transition-colors hover:bg-republic-blue/20"
                    data-testid="nuclear-risks-channel-link"
                  >
                    <ExternalLink className="h-4 w-4 text-republic-blue" />
                    <span className="font-mono text-xs uppercase text-republic-blue">Abrir canal</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="border border-alert-yellow/20 bg-alert-yellow/10 p-5" data-testid="nuclear-risks-why-matters-card">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-alert-yellow">Por que isso importa</p>
              <p className="mt-3 text-sm text-zinc-300">
                Entender o risco nuclear ajuda a vigiar como poder científico, militar e político se combinam. A Vigília usa esse contexto para reforçar análise crítica,
                responsabilidade pública e leitura histórica de decisões de Estado.
              </p>
            </div>
          </motion.aside>
        </section>

        <section className="mx-auto mt-12 max-w-7xl" data-testid="nuclear-risks-dangers-section">
          <div className="mb-6 space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-corruption-red" data-testid="nuclear-risks-dangers-kicker">
              Perigos centrais
            </p>
            <h3 className="font-chivo text-3xl font-bold" data-testid="nuclear-risks-dangers-title">
              O que torna a bomba atômica tão perigosa
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {nuclearDangerCards.map((danger) => (
              <article
                key={danger.id}
                className="border border-white/10 bg-zinc-900/50 p-5 transition-transform hover:-translate-y-1"
                data-testid={`nuclear-danger-card-${danger.id}`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-corruption-red" />
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-corruption-red">Risco</p>
                </div>
                <h4 className="font-chivo text-xl font-bold" data-testid={`nuclear-danger-title-${danger.id}`}>
                  {danger.title}
                </h4>
                <p className="mt-3 text-sm text-zinc-400" data-testid={`nuclear-danger-description-${danger.id}`}>
                  {danger.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-7xl border border-white/10 bg-zinc-900/40 p-6" data-testid="nuclear-risks-timeline-section">
          <div className="mb-6 space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-republic-blue" data-testid="nuclear-risks-timeline-kicker">
              Linha do tempo
            </p>
            <h3 className="font-chivo text-3xl font-bold" data-testid="nuclear-risks-timeline-title">
              Da descoberta científica ao risco global
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {nuclearTimeline.map((item) => (
              <article
                key={item.id}
                className="border border-white/10 bg-black/30 p-4"
                data-testid={`nuclear-timeline-item-${item.id}`}
              >
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-republic-blue">{item.year}</p>
                <h4 className="mt-3 font-chivo text-lg font-bold" data-testid={`nuclear-timeline-title-${item.id}`}>
                  {item.title}
                </h4>
                <p className="mt-3 text-sm text-zinc-400">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-7xl border border-white/10 bg-zinc-900/40 p-6" data-testid="nuclear-risks-reference-section">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-neon-green" data-testid="nuclear-risks-reference-kicker">
                Fontes relacionadas
              </p>
              <h3 className="font-chivo text-3xl font-bold" data-testid="nuclear-risks-reference-title">
                Links para aprofundar a leitura
              </h3>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-white/20 bg-transparent font-mono text-xs uppercase text-zinc-100 hover:bg-white/5"
              data-testid="nuclear-risks-return-dashboard-button"
            >
              Voltar ao dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {nuclearReferenceLinks.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col justify-between border border-white/10 bg-black/30 p-5 transition-colors hover:border-neon-green/40 hover:bg-neon-green/10"
                data-testid={`nuclear-reference-link-${item.id}`}
              >
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-neon-green" />
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon-green">Fonte</p>
                  </div>
                  <h4 className="font-chivo text-xl font-bold" data-testid={`nuclear-reference-title-${item.id}`}>
                    {item.label}
                  </h4>
                  <p className="mt-3 text-sm text-zinc-400">{item.description}</p>
                </div>
                <span className="mt-6 font-mono text-xs uppercase text-zinc-300">Abrir conteúdo →</span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}