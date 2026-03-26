import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Database, LockKeyhole, Rocket, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: <LockKeyhole className="w-6 h-6 text-neon-green" />,
    title: "Autenticação pronta",
    description: "Cadastro, login, sessão persistente e isolamento por workspace para cada cliente.",
  },
  {
    icon: <Database className="w-6 h-6 text-republic-blue" />,
    title: "Banco persistente",
    description: "Seu monitoramento agora roda em SQLite local ou PostgreSQL em produção via DATABASE_URL.",
  },
  {
    icon: <Users className="w-6 h-6 text-alert-yellow" />,
    title: "SaaS por workspace",
    description: "Cada conta recebe ambiente próprio com dados seed, métricas e CRUD protegido por token.",
  },
  {
    icon: <Rocket className="w-6 h-6 text-corruption-red" />,
    title: "Deploy simplificado",
    description: "Dockerfiles, compose e variáveis de ambiente para publicar frontend e API rapidamente.",
  },
];

const plans = [
  ["Starter", "1 workspace", "Autenticação JWT", "Dashboard com métricas"],
  ["Growth", "Mais automações", "Alertas refinados", "Configuração de plano"],
  ["Enterprise", "PostgreSQL dedicado", "Escalável em containers", "Base para RBAC futuro"],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <section className="relative px-6 py-24 md:px-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-green/30 bg-neon-green/10 text-neon-green text-xs uppercase tracking-[0.3em] font-mono mb-6">
                <BadgeCheck className="w-4 h-4" />
                SaaS Ready
              </div>
              <h1 className="font-chivo font-black text-5xl md:text-7xl leading-[0.95] mb-6">
                Transformei a <span className="text-neon-green">Vigília</span> em uma operação SaaS.
              </h1>
              <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
                O projeto agora tem backend com persistência, login, multi-workspace, dashboard protegido e base pronta para deploy em Docker.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-neon-green hover:bg-green-500 text-black font-bold px-8 py-6 rounded-none text-base uppercase tracking-wider">
                  <Link to="/auth">
                    Criar conta
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/15 bg-transparent text-zinc-100 hover:bg-white/5 rounded-none px-8 py-6 uppercase tracking-wider">
                  <Link to="/dashboard">Entrar no dashboard</Link>
                </Button>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div className="bg-zinc-900/70 border border-white/10 p-6 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 font-mono">Stack</p>
                  <h2 className="font-chivo font-bold text-2xl mt-2">FastAPI + React + SQLAlchemy</h2>
                </div>
                <ShieldCheck className="w-12 h-12 text-neon-green" />
              </div>
              <div className="space-y-4 text-sm">
                {[
                  "JWT para autenticação",
                  "Banco relacional com isolamento por workspace",
                  "Seed inicial automático para onboarding",
                  "Deploy via Docker e variáveis de ambiente",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 border border-white/5 bg-black/30 p-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-neon-green" />
                    <span className="text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-chivo font-bold text-3xl md:text-4xl mb-10">O que mudou</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {features.map((feature) => (
              <div key={feature.title} className="bg-zinc-900/60 border border-white/10 p-6 card-hover">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-chivo font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-chivo font-bold text-3xl md:text-4xl mb-10">Estrutura comercial sugerida</h2>
          <div className="grid lg:grid-cols-3 gap-5">
            {plans.map(([title, ...items]) => (
              <div key={title} className="border border-white/10 bg-black/40 p-6">
                <p className="text-neon-green font-mono text-xs uppercase tracking-[0.3em] mb-4">{title}</p>
                <ul className="space-y-3 text-zinc-300 text-sm">
                  {items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="text-neon-green">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>


        </div>
      </section>
    </div>
  );
}
