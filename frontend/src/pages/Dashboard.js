import { useEffect, useMemo, useState } from "react";
import { Building2, CreditCard, LogOut, RefreshCcw, ScrollText, ShieldAlert, ShieldCheck, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const planOptions = ["starter", "growth", "enterprise"];

export default function Dashboard() {
  const { user, workspace, logout } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planSaving, setPlanSaving] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    category: "geral",
    evidence_url: "",
    anonymous: true,
  });
  const [reportSending, setReportSending] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/dashboard");
      setSnapshot(data);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const statsCards = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    return [
      {
        title: "Políticos",
        value: snapshot.stats.total_politicians,
        icon: ShieldCheck,
        color: "text-neon-green",
      },
      {
        title: "Transações",
        value: snapshot.stats.total_transactions,
        icon: Wallet,
        color: "text-republic-blue",
      },
      {
        title: "Alertas ativos",
        value: snapshot.stats.active_alerts,
        icon: ScrollText,
        color: "text-alert-yellow",
      },
      {
        title: "Carteiras",
        value: snapshot.stats.total_wallets,
        icon: Building2,
        color: "text-corruption-red",
      },
    ];
  }, [snapshot]);

  const handlePlanChange = async (plan) => {
    try {
      setPlanSaving(true);
      await api.patch("/workspace/plan", { plan });
      toast.success(`Plano alterado para ${plan}`);
      await loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Falha ao alterar plano");
    } finally {
      setPlanSaving(false);
    }
  };

  const handleReportSubmit = async (event) => {
    event.preventDefault();
    try {
      setReportSending(true);
      const { data } = await api.post("/reports", reportForm);
      toast.success(`Denúncia recebida com protocolo ${data.protocol}`);
      setReportForm({
        title: "",
        description: "",
        category: "geral",
        evidence_url: "",
        anonymous: true,
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Falha ao enviar denúncia");
    } finally {
      setReportSending(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Carregando...</div>;
  }

  if (!snapshot?.stats) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-6">
        <Card className="w-full max-w-lg bg-zinc-900/70 border-white/10 rounded-none p-6 space-y-4">
          <h1 className="font-chivo font-bold text-2xl">Não foi possível carregar o dashboard</h1>
          <p className="text-zinc-400 text-sm">
            Tente atualizar novamente. Se o erro persistir, faça login de novo para renovar sua sessão.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-none border-white/10 bg-transparent" onClick={loadDashboard}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Tentar novamente
            </Button>
            <Button variant="outline" className="rounded-none border-white/10 bg-transparent" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const lastUpdated = snapshot?.stats?.timestamp
    ? new Date(snapshot.stats.timestamp).toLocaleString("pt-BR")
    : "Não disponível";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-white/10 sticky top-0 bg-zinc-950/90 backdrop-blur-xl z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">Workspace</p>
            <h1 className="font-chivo font-black text-3xl mt-1">{snapshot?.stats.workspace_name}</h1>
            <p className="text-zinc-400 text-sm mt-1">{workspace?.slug} · {user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-none bg-neon-green text-black hover:bg-green-500">
              <Link to="/registro-politicos">Registrar políticos e bens</Link>
            </Button>
            <Button variant="outline" className="rounded-none border-white/10 bg-transparent" onClick={loadDashboard}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Atualizar
            </Button>
            <Button variant="outline" className="rounded-none border-white/10 bg-transparent" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-8">
        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statsCards.map((card) => (
            <Card key={card.title} className="bg-zinc-900/70 border-white/10 rounded-none p-5">
              <div className="flex items-center gap-3 mb-3">
                <card.icon className={`w-5 h-5 ${card.color}`} />
                <span className="text-zinc-400 text-sm uppercase tracking-wider">{card.title}</span>
              </div>
              <p className={`font-chivo font-black text-4xl ${card.color}`}>{card.value}</p>
            </Card>
          ))}
        </section>

        <Card className="bg-zinc-900/70 border-white/10 rounded-none p-6">
          <h2 className="font-chivo font-bold text-2xl mb-4">Plano do workspace</h2>
          <div className="flex flex-wrap gap-3">
            {planOptions.map((plan) => (
              <Button
                key={plan}
                type="button"
                variant="outline"
                className={`rounded-none border-white/10 ${snapshot?.stats.plan === plan ? "bg-neon-green/10 text-neon-green" : "bg-transparent"}`}
                disabled={planSaving}
                onClick={() => handlePlanChange(plan)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {plan}
              </Button>
            ))}
          </div>
          <p className="text-zinc-400 text-sm mt-4">
            Última atualização: {lastUpdated}
          </p>
        </Card>

        <Card className="bg-zinc-900/70 border-white/10 rounded-none p-6">
          <div className="mb-4">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">Canal seguro</p>
            <h2 className="font-chivo font-bold text-2xl mt-2 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-alert-yellow" />
              Denúncia anônima
            </h2>
            <p className="text-zinc-400 text-sm mt-2">
              O formulário não pede identificação pessoal. Envie o relato e acompanhe pelo protocolo recebido.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleReportSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="space-y-2 text-sm">
                <span className="text-zinc-300">Título</span>
                <input
                  required
                  minLength={5}
                  maxLength={160}
                  className="w-full bg-zinc-950 border border-white/10 px-3 py-2 text-zinc-100"
                  value={reportForm.title}
                  onChange={(event) => setReportForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-zinc-300">Categoria</span>
                <select
                  className="w-full bg-zinc-950 border border-white/10 px-3 py-2 text-zinc-100"
                  value={reportForm.category}
                  onChange={(event) => setReportForm((prev) => ({ ...prev, category: event.target.value }))}
                >
                  <option value="geral">Geral</option>
                  <option value="financeira">Financeira</option>
                  <option value="conflito_interesse">Conflito de interesse</option>
                  <option value="lavagem">Lavagem de dinheiro</option>
                </select>
              </label>
            </div>

            <label className="space-y-2 text-sm block">
              <span className="text-zinc-300">Descrição da denúncia</span>
              <textarea
                required
                minLength={20}
                maxLength={3000}
                rows={5}
                className="w-full bg-zinc-950 border border-white/10 px-3 py-2 text-zinc-100"
                value={reportForm.description}
                onChange={(event) => setReportForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>

            <label className="space-y-2 text-sm block">
              <span className="text-zinc-300">Link opcional de evidência</span>
              <input
                type="url"
                placeholder="https://"
                className="w-full bg-zinc-950 border border-white/10 px-3 py-2 text-zinc-100"
                value={reportForm.evidence_url}
                onChange={(event) => setReportForm((prev) => ({ ...prev, evidence_url: event.target.value }))}
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={reportForm.anonymous}
                onChange={(event) => setReportForm((prev) => ({ ...prev, anonymous: event.target.checked }))}
              />
              Enviar de forma anônima
            </label>

            <div>
              <Button type="submit" disabled={reportSending} className="rounded-none bg-alert-yellow text-black hover:bg-yellow-400">
                {reportSending ? "Enviando..." : "Enviar denúncia"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
