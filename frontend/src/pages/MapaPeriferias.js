import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, MapPin, Map, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  mapaPeriferiasHighlights,
  mapaPeriferiasOverview,
  mapaPeriferiasReferenceLinks,
} from "@/data/mapaPeriferias";

export default function MapaPeriferias() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* ── Top Navigation ── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 md:px-12">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              data-testid="mapa-periferias-back-dashboard-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p
                className="font-mono text-xs uppercase tracking-[0.3em] text-republic-blue"
                data-testid="mapa-periferias-kicker"
              >
                Vigilância territorial
              </p>
              <h1
                className="font-chivo text-2xl font-black"
                data-testid="mapa-periferias-page-title"
              >
                Mapa das Periferias
              </h1>
            </div>
          </div>
          <Button
            onClick={() => window.open(mapaPeriferiasOverview.sourceUrl, "_blank")}
            className="w-full bg-republic-blue px-4 py-2 font-mono text-xs uppercase text-white hover:bg-blue-600 sm:w-auto"
            data-testid="mapa-periferias-open-source-button"
          >
            <ExternalLink className="mr-2 h-3 w-3" />
            Abrir mapa oficial
          </Button>
        </div>
      </nav>

      <main className="px-6 py-10 md:px-12 md:py-14">
        {/* ── Hero + Map Embed ── */}
        <section
          className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1fr_1.4fr]"
          data-testid="mapa-periferias-hero-section"
        >
          {/* Left: contextual info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden border border-republic-blue/20 bg-gradient-to-br from-republic-blue/10 via-zinc-950 to-zinc-900 p-8"
            data-testid="mapa-periferias-hero-card"
          >
            <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_60%)]" />
            <div className="relative space-y-6">
              <p
                className="inline-flex border border-republic-blue/30 bg-republic-blue/10 px-3 py-1 font-mono text-xs uppercase text-republic-blue"
                data-testid="mapa-periferias-source-badge"
              >
                {mapaPeriferiasOverview.sourceLabel}
              </p>

              <div className="space-y-3">
                <h2
                  className="font-chivo text-4xl font-black sm:text-5xl"
                  data-testid="mapa-periferias-hero-title"
                >
                  {mapaPeriferiasOverview.title}
                </h2>
                <p
                  className="max-w-xl text-sm text-zinc-300 md:text-base"
                  data-testid="mapa-periferias-hero-description"
                >
                  {mapaPeriferiasOverview.subtitle}
                </p>
              </div>

              {/* Metadata chips */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="border border-white/10 bg-black/30 p-4"
                  data-testid="mapa-periferias-meta-category"
                >
                  <div className="mb-2 flex items-center gap-2 text-republic-blue">
                    <Map className="h-4 w-4" />
                    <span className="font-mono text-xs uppercase">Categoria</span>
                  </div>
                  <p className="font-chivo text-base font-bold leading-tight">
                    {mapaPeriferiasOverview.category}
                  </p>
                </div>
                <div
                  className="border border-white/10 bg-black/30 p-4"
                  data-testid="mapa-periferias-meta-source"
                >
                  <div className="mb-2 flex items-center gap-2 text-neon-green">
                    <MapPin className="h-4 w-4" />
                    <span className="font-mono text-xs uppercase">Programa</span>
                  </div>
                  <p className="font-chivo text-base font-bold leading-tight">
                    {mapaPeriferiasOverview.channelName}
                  </p>
                </div>
              </div>

              {/* Why it matters */}
              <div
                className="border border-alert-yellow/20 bg-alert-yellow/10 p-5"
                data-testid="mapa-periferias-why-matters-card"
              >
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-alert-yellow">
                  Por que isso importa
                </p>
                <p className="mt-3 text-sm text-zinc-300">
                  Territórios periféricos concentram os maiores déficits de infraestrutura e os
                  menores índices de acesso a políticas públicas. A Vigília usa esse mapa como
                  referência para contextualizar decisões políticas, alocação de recursos e
                  responsabilidade dos representantes eleitos.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Embedded Map */}
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="space-y-4"
            data-testid="mapa-periferias-embed-panel"
          >
            <div className="overflow-hidden border border-white/10 bg-zinc-900/50">
              {/* Map iframe */}
              <div
                className="relative w-full"
                style={{ paddingBottom: "62%" }}
                data-testid="mapa-periferias-embed-container"
              >
                <iframe
                  src={mapaPeriferiasOverview.embedUrl}
                  title="Mapa das Periferias — Ministério das Cidades"
                  className="absolute inset-0 h-full w-full border-0"
                  allow="geolocation"
                  referrerPolicy="strict-origin-when-cross-origin"
                  data-testid="mapa-periferias-embed"
                />
              </div>

              {/* Panel footer */}
              <div className="space-y-4 p-5">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-republic-blue">
                    Mapa interativo oficial
                  </p>
                  <h3 className="mt-2 font-chivo text-xl font-bold">
                    {mapaPeriferiasOverview.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    Fonte: {mapaPeriferiasOverview.channelName} · Ministério das Cidades
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <a
                    href={mapaPeriferiasOverview.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-republic-blue/30 bg-republic-blue/10 px-4 py-3 transition-colors hover:bg-republic-blue/20"
                    data-testid="mapa-periferias-open-fullscreen-link"
                  >
                    <ExternalLink className="h-4 w-4 text-republic-blue" />
                    <span className="font-mono text-xs uppercase text-republic-blue">
                      Abrir em tela cheia
                    </span>
                  </a>
                  <a
                    href="https://www.gov.br/cidades/pt-br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-neon-green/30 bg-neon-green/10 px-4 py-3 transition-colors hover:bg-neon-green/20"
                    data-testid="mapa-periferias-ministerio-link"
                  >
                    <MapPin className="h-4 w-4 text-neon-green" />
                    <span className="font-mono text-xs uppercase text-neon-green">
                      Ministério das Cidades
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </motion.aside>
        </section>

        {/* ── Highlights Section ── */}
        <section
          className="mx-auto mt-12 max-w-7xl"
          data-testid="mapa-periferias-highlights-section"
        >
          <div className="mb-6 space-y-2">
            <p
              className="font-mono text-xs uppercase tracking-[0.25em] text-republic-blue"
              data-testid="mapa-periferias-highlights-kicker"
            >
              O que o mapa revela
            </p>
            <h3
              className="font-chivo text-3xl font-bold"
              data-testid="mapa-periferias-highlights-title"
            >
              Dimensões monitoradas pelo Vigília
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {mapaPeriferiasHighlights.map((item) => (
              <article
                key={item.id}
                className="border border-white/10 bg-zinc-900/50 p-5 transition-transform hover:-translate-y-1"
                data-testid={`mapa-periferias-highlight-${item.id}`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-republic-blue" />
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-republic-blue">
                    Indicador
                  </p>
                </div>
                <h4
                  className="font-chivo text-lg font-bold"
                  data-testid={`mapa-periferias-highlight-title-${item.id}`}
                >
                  {item.title}
                </h4>
                <p
                  className="mt-3 text-sm text-zinc-400"
                  data-testid={`mapa-periferias-highlight-description-${item.id}`}
                >
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Reference Section ── */}
        <section
          className="mx-auto mt-12 max-w-7xl border border-white/10 bg-zinc-900/40 p-6"
          data-testid="mapa-periferias-reference-section"
        >
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p
                className="font-mono text-xs uppercase tracking-[0.25em] text-neon-green"
                data-testid="mapa-periferias-reference-kicker"
              >
                Fontes relacionadas
              </p>
              <h3
                className="font-chivo text-3xl font-bold"
                data-testid="mapa-periferias-reference-title"
              >
                Links para aprofundar a análise
              </h3>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-white/20 bg-transparent font-mono text-xs uppercase text-zinc-100 hover:bg-white/5"
              data-testid="mapa-periferias-return-dashboard-button"
            >
              Voltar ao dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {mapaPeriferiasReferenceLinks.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col justify-between border border-white/10 bg-black/30 p-5 transition-colors hover:border-neon-green/40 hover:bg-neon-green/10"
                data-testid={`mapa-periferias-reference-link-${item.id}`}
              >
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-neon-green" />
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon-green">
                      Fonte
                    </p>
                  </div>
                  <h4
                    className="font-chivo text-xl font-bold"
                    data-testid={`mapa-periferias-reference-title-${item.id}`}
                  >
                    {item.label}
                  </h4>
                  <p className="mt-3 text-sm text-zinc-400">{item.description}</p>
                </div>
                <span className="mt-6 font-mono text-xs uppercase text-zinc-300">
                  Abrir recurso oficial →
                </span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
