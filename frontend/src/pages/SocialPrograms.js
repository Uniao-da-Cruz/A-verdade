import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, FileCheck, FileSearch, HelpCircle, Landmark, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  socialProgramsJourney,
  socialProgramsList,
  socialProgramsOverview,
  socialProgramsPortalFeatures,
  socialProgramsReferenceLinks,
} from "@/data/socialPrograms";

const iconMap = {
  "consulta-cpf": FileSearch,
  "postos-atendimento": Landmark,
  "programas-sociais": Users,
  "validar-comprovante": FileCheck,
  "sobre-cadunico": Landmark,
  "faq-cadunico": HelpCircle,
  "portal-programas-sociais": ExternalLink,
};

export default function SocialPrograms() {
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
              data-testid="social-programs-back-dashboard-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon-green" data-testid="social-programs-kicker">
                Vigilância social
              </p>
              <h1 className="font-chivo text-2xl font-black" data-testid="social-programs-page-title">
                Programas Sociais
              </h1>
            </div>
          </div>
          <Button
            onClick={() => window.open(socialProgramsOverview.sourceUrl, "_blank")}
            className="w-full bg-neon-green px-4 py-2 font-mono text-xs uppercase text-black hover:bg-green-500 sm:w-auto"
            data-testid="social-programs-open-source-button"
          >
            Abrir portal oficial
          </Button>
        </div>
      </nav>

      <main className="px-6 py-10 md:px-12 md:py-14">
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden border border-neon-green/20 bg-gradient-to-br from-neon-green/10 via-zinc-950 to-zinc-900 p-8"
            data-testid="social-programs-hero"
          >
            <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_60%)]" />
            <div className="relative space-y-5">
              <p className="inline-flex border border-neon-green/30 bg-neon-green/10 px-3 py-1 font-mono text-xs uppercase text-neon-green" data-testid="social-programs-source-badge">
                {socialProgramsOverview.sourceLabel}
              </p>
              <div className="space-y-3">
                <h2 className="font-chivo text-4xl font-black sm:text-5xl lg:text-6xl" data-testid="social-programs-hero-title">
                  {socialProgramsOverview.title}
                </h2>
                <p className="max-w-2xl text-sm text-zinc-300 md:text-base" data-testid="social-programs-hero-description">
                  {socialProgramsOverview.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {socialProgramsPortalFeatures.map((feature) => {
                  const FeatureIcon = iconMap[feature.id] || ExternalLink;

                  return (
                    <a
                      key={feature.id}
                      href={feature.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group border border-white/10 bg-black/30 p-4 transition-colors hover:border-neon-green/40 hover:bg-neon-green/10"
                      data-testid={`social-programs-feature-${feature.id}`}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <FeatureIcon className="h-4 w-4 text-neon-green" />
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon-green">{feature.title}</p>
                      </div>
                      <p className="text-sm text-zinc-400">{feature.description}</p>
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="space-y-4 border border-white/10 bg-zinc-900/50 p-6"
            data-testid="social-programs-journey-panel"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-alert-yellow" data-testid="social-programs-journey-kicker">
                Jornada oficial
              </p>
              <h3 className="mt-2 font-chivo text-2xl font-bold" data-testid="social-programs-journey-title">
                Como navegar no CadÚnico
              </h3>
            </div>
            <div className="space-y-3">
              {socialProgramsJourney.map((item, index) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4 border border-white/10 bg-black/30 p-4 transition-colors hover:border-alert-yellow/40 hover:bg-alert-yellow/10"
                  data-testid={`social-programs-journey-${item.id}`}
                >
                  <div className="flex h-8 w-8 items-center justify-center border border-alert-yellow/30 bg-alert-yellow/10 font-mono text-xs text-alert-yellow">
                    0{index + 1}
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase text-alert-yellow">{item.step}</p>
                    <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.aside>
        </section>

        <section className="mx-auto mt-12 max-w-7xl" data-testid="social-programs-listed-section">
          <div className="mb-6 space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-republic-blue" data-testid="social-programs-listed-kicker">
              Programas listados no portal
            </p>
            <h3 className="font-chivo text-3xl font-bold" data-testid="social-programs-listed-title">
              Trilhas de consulta social
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {socialProgramsList.map((program) => (
              <article
                key={program.id}
                className="border border-white/10 bg-zinc-900/50 p-5 transition-transform hover:-translate-y-1"
                data-testid={`social-program-card-${program.id}`}
              >
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-republic-blue">Programa</p>
                <h4 className="mt-3 font-chivo text-xl font-bold" data-testid={`social-program-name-${program.id}`}>
                  {program.name}
                </h4>
                <p className="mt-3 text-sm text-zinc-400" data-testid={`social-program-summary-${program.id}`}>
                  {program.summary}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-7xl border border-white/10 bg-zinc-900/40 p-6" data-testid="social-programs-reference-section">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-neon-green" data-testid="social-programs-reference-kicker">
                Atalhos oficiais
              </p>
              <h3 className="font-chivo text-3xl font-bold" data-testid="social-programs-reference-title">
                Referências para auditoria e contexto
              </h3>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-white/20 bg-transparent font-mono text-xs uppercase text-zinc-100 hover:bg-white/5"
              data-testid="social-programs-return-dashboard-button"
            >
              Voltar ao dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {socialProgramsReferenceLinks.map((item) => {
              const LinkIcon = iconMap[item.id] || ExternalLink;

              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col justify-between border border-white/10 bg-black/30 p-5 transition-colors hover:border-neon-green/40 hover:bg-neon-green/10"
                  data-testid={`social-programs-reference-${item.id}`}
                >
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <LinkIcon className="h-4 w-4 text-neon-green" />
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-neon-green">Fonte</p>
                    </div>
                    <h4 className="font-chivo text-xl font-bold" data-testid={`social-programs-reference-label-${item.id}`}>
                      {item.label}
                    </h4>
                    <p className="mt-3 text-sm text-zinc-400">{item.description}</p>
                  </div>
                  <span className="mt-6 font-mono text-xs uppercase text-zinc-300">Abrir recurso oficial →</span>
                </a>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}