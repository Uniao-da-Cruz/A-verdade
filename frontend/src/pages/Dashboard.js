import { useEffect, useMemo, useState } from "react";
import { Building2, CreditCard, LogOut, RefreshCcw, ScrollText, ShieldCheck, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const planOptions = ["starter", "growth", "enterprise"];

export default function Dashboard() {
  const { user, workspace, logout } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planSaving, setPlanSaving] = useState(false);

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

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Carregando...</div>;
  }

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
            Última atualização: {new Date(snapshot?.stats.timestamp).toLocaleString("pt-BR")}
          </p>
        </Card>
      </main>
    </div>
  );
}
