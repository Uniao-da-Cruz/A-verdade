
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const initialPoliticianForm = {
  name: "",
  party: "",
  position: "",
  state: "",
  wallets: "",
  instagram: "",
  twitter: "",
};

const planOptions = ["starter", "growth", "enterprise"];

function statusClasses(status) {
  return {
    verified: "bg-green-500/10 text-green-400 border-green-500/20",
    suspicious: "bg-red-500/10 text-red-400 border-red-500/20",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  }[status] || "bg-zinc-500/10 text-zinc-300 border-zinc-500/20";
}

function severityClasses(status) {
  return {
    critical: "bg-red-500/10 text-red-400 border-red-500/20",
    high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  }[status] || "bg-zinc-500/10 text-zinc-300 border-zinc-500/20";
}

export default function Dashboard() {
  const { user, workspace, logout } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planSaving, setPlanSaving] = useState(false);
  const [politicianForm, setPoliticianForm] = useState(initialPoliticianForm);

  const loadDashboard = async () => {
    try {
      setLoading(true);

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
      { title: "Políticos", value: snapshot.stats.total_politicians, icon: ShieldCheck, color: "text-neon-green" },
      { title: "Transações", value: snapshot.stats.total_transactions, icon: Wallet, color: "text-republic-blue" },
      { title: "Alertas ativos", value: snapshot.stats.active_alerts, icon: Bell, color: "text-alert-yellow" },
      { title: "Carteiras", value: snapshot.stats.total_wallets, icon: Database, color: "text-corruption-red" },
    ];
  }, [snapshot]);

  const handleCreatePolitician = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await api.post("/politicians", {
        name: politicianForm.name,
        party: politicianForm.party,
        position: politicianForm.position,
        state: politicianForm.state || null,
        instagram: politicianForm.instagram || null,
        twitter: politicianForm.twitter || null,
        wallets: politicianForm.wallets
          .split(",")
          .map((wallet) => wallet.trim())
          .filter(Boolean),
      });
      toast.success("Político criado no workspace");
      setPoliticianForm(initialPoliticianForm);
      await loadDashboard();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Não foi possível salvar o político");
    } finally {
      setSaving(false);
    }
  };

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
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-sm">
        Carregando workspace...
      </div>
    );
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
            <Button variant="outline" className="rounded-none border-white/10 bg-transparent" onClick={loadDashboard}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" className="rounded-none border-white/10 bg-transparent" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
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

        <section className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <Card className="bg-zinc-900/70 border-white/10 rounded-none p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-[0.3em] font-mono">SaaS snapshot</p>
                <h2 className="font-chivo font-bold text-2xl mt-2">Resumo operacional</h2>
              </div>
              <Badge className="rounded-none uppercase tracking-wider bg-neon-green/10 text-neon-green border-neon-green/20">
                {snapshot?.stats.plan}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="border border-white/10 p-4 bg-black/20">
                <p className="text-zinc-500 mb-2">Redes monitoradas</p>
                <div className="flex flex-wrap gap-2">
                  {snapshot?.stats.monitored_networks.length ? snapshot.stats.monitored_networks.map((network) => (
                    <Badge key={network} variant="outline" className="rounded-none border-white/10 text-zinc-200">
                      {network}
                    </Badge>
                  )) : <span className="text-zinc-400">Nenhuma ainda</span>}
                </div>
              </div>
              <div className="border border-white/10 p-4 bg-black/20">
                <p className="text-zinc-500 mb-2">Explorer padrão</p>
                <p className="text-zinc-100">{snapshot?.stats.primary_explorer}</p>
              </div>
              <div className="border border-white/10 p-4 bg-black/20">
                <p className="text-zinc-500 mb-2">Owner</p>
                <p className="text-zinc-100">{user?.full_name}</p>
              </div>
              <div className="border border-white/10 p-4 bg-black/20">
                <p className="text-zinc-500 mb-2">Momento do snapshot</p>
                <p className="text-zinc-100">{new Date(snapshot?.stats.timestamp).toLocaleString("pt-BR")}</p>
              </div>
            </div>

            <div className="mt-6 border border-white/10 p-4 bg-black/20">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 mb-3">Upgrade de plano</p>
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
            </div>
          </Card>

          <Card className="bg-zinc-900/70 border-white/10 rounded-none p-6">
            <div className="mb-6">
              <p className="text-zinc-500 text-xs uppercase tracking-[0.3em] font-mono">Onboarding</p>
              <h2 className="font-chivo font-bold text-2xl mt-2">Adicionar novo político</h2>
            </div>

            <form className="space-y-4" onSubmit={handleCreatePolitician}>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={politicianForm.name} onChange={(e) => setPoliticianForm((current) => ({ ...current, name: e.target.value }))} className="rounded-none bg-black/20 border-white/10" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="party">Partido</Label>
                  <Input id="party" value={politicianForm.party} onChange={(e) => setPoliticianForm((current) => ({ ...current, party: e.target.value }))} className="rounded-none bg-black/20 border-white/10" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">UF</Label>
                  <Input id="state" value={politicianForm.state} onChange={(e) => setPoliticianForm((current) => ({ ...current, state: e.target.value }))} className="rounded-none bg-black/20 border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input id="position" value={politicianForm.position} onChange={(e) => setPoliticianForm((current) => ({ ...current, position: e.target.value }))} className="rounded-none bg-black/20 border-white/10" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallets">Carteiras monitoradas</Label>
                <Input id="wallets" value={politicianForm.wallets} onChange={(e) => setPoliticianForm((current) => ({ ...current, wallets: e.target.value }))} className="rounded-none bg-black/20 border-white/10" placeholder="Separe por vírgula" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" value={politicianForm.instagram} onChange={(e) => setPoliticianForm((current) => ({ ...current, instagram: e.target.value }))} className="rounded-none bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">X / Twitter</Label>
                  <Input id="twitter" value={politicianForm.twitter} onChange={(e) => setPoliticianForm((current) => ({ ...current, twitter: e.target.value }))} className="rounded-none bg-black/20 border-white/10" />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-none bg-neon-green text-black hover:bg-green-500 font-bold uppercase tracking-wider" disabled={saving}>
                <Plus className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Adicionar ao workspace"}
              </Button>
            </form>
          </Card>
        </section>

        <section className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <Card className="bg-zinc-900/70 border-white/10 rounded-none p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-chivo font-bold text-2xl">Políticos monitorados</h2>
              <Badge variant="outline" className="rounded-none border-white/10 text-zinc-300">
                {snapshot?.politicians.length} itens recentes
              </Badge>
            </div>
            <div className="space-y-4">
              {snapshot?.politicians.map((politician) => (
                <div key={politician.id} className="border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-chivo font-bold text-xl">{politician.name}</h3>
                      <p className="text-zinc-400 text-sm">{politician.party} · {politician.position}{politician.state ? ` · ${politician.state}` : ""}</p>
                    </div>
                    {politician.verified && <Badge className="rounded-none bg-neon-green/10 text-neon-green border-neon-green/20">Verificado</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {politician.monitored_networks.map((network) => (
                      <Badge key={network} variant="outline" className="rounded-none border-white/10 text-zinc-300">{network}</Badge>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-zinc-300">
                    <div>
                      <p className="text-zinc-500 mb-1">Carteiras</p>
                      <ul className="space-y-1">
                        {politician.wallet_details.map((wallet) => (
                          <li key={wallet.address} className="truncate">{wallet.label}: {wallet.address}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Indicadores</p>
                      <p>{politician.total_transactions} transações · {politician.suspicious_count} suspeitas</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="bg-zinc-900/70 border-white/10 rounded-none p-6">
              <h2 className="font-chivo font-bold text-2xl mb-5">Transações recentes</h2>
              <div className="space-y-3">
                {snapshot?.recent_transactions.map((transaction) => (
                  <div key={transaction.id} className="border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-medium">{transaction.politician_name}</p>
                        <p className="text-zinc-500 text-xs break-all">{transaction.tx_hash}</p>
                      </div>
                      <Badge className={`rounded-none border ${statusClasses(transaction.status)}`}>{transaction.status}</Badge>
                    </div>
                    <p className="text-zinc-300 text-sm">{transaction.amount} {transaction.currency} · {transaction.network}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-zinc-900/70 border-white/10 rounded-none p-6">
              <h2 className="font-chivo font-bold text-2xl mb-5">Alertas recentes</h2>
              <div className="space-y-3">
                {snapshot?.recent_alerts.map((alert) => (
                  <div key={alert.id} className="border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-medium">{alert.politician_name}</p>
                      <Badge className={`rounded-none border ${severityClasses(alert.severity)}`}>{alert.severity}</Badge>
                    </div>
                    <p className="text-zinc-300 text-sm">{alert.message}</p>
                  </div>


      </main>
    </div>
  );
}
