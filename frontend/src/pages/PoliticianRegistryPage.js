import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Landmark, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";

const initialForm = {
  name: "",
  party: "",
  position: "",
  state: "",
  declared_assets_brl: "",
  declaration_year: String(new Date().getFullYear()),
  data_source_url: "",
};

export default function PoliticianRegistryPage() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [politicians, setPoliticians] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPoliticians = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/politicians");
      setPoliticians(data);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao carregar políticos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoliticians();
  }, []);

  const totalDeclared = useMemo(() => politicians.reduce((acc, item) => acc + (item.declared_assets_brl || 0), 0), [politicians]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await api.post("/politicians", {
        name: form.name,
        party: form.party,
        position: form.position,
        state: form.state || null,
        wallets: [],
        declared_assets_brl: Number(form.declared_assets_brl || 0),
        declaration_year: Number(form.declaration_year),
        data_source_url: form.data_source_url || null,
      });
      toast.success("Político registrado com declaração de bens");
      setForm(initialForm);
      await loadPoliticians();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Falha ao registrar político");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 px-6 py-8 md:px-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">Conformidade pública</p>
            <h1 className="font-chivo font-black text-4xl mt-2">Registro de políticos e declaração de bens</h1>
          </div>
          <Button asChild variant="outline" className="rounded-none border-white/10 bg-transparent">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao dashboard
            </Link>
          </Button>
        </div>

        <Card className="bg-zinc-900/70 border-white/10 rounded-none p-5 text-sm text-zinc-300 space-y-2">
          <p className="font-semibold text-zinc-100">Fontes oficiais recomendadas:</p>
          <a href="https://www.gov.br/receitafederal/pt-br" target="_blank" rel="noreferrer" className="text-neon-green underline underline-offset-4 block">Receita Federal</a>
          <a href="https://www.bcb.gov.br/" target="_blank" rel="noreferrer" className="text-neon-green underline underline-offset-4 block">Banco Central do Brasil (BCB)</a>
        </Card>

        <section className="grid lg:grid-cols-[1fr_1fr] gap-6">
          <Card className="bg-zinc-900/70 border-white/10 rounded-none p-6">
            <h2 className="font-chivo font-bold text-2xl mb-5">Novo registro</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="rounded-none bg-black/20 border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="party">Partido</Label>
                  <Input id="party" required value={form.party} onChange={(event) => setForm((current) => ({ ...current, party: event.target.value }))} className="rounded-none bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">UF</Label>
                  <Input id="state" value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} className="rounded-none bg-black/20 border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input id="position" required value={form.position} onChange={(event) => setForm((current) => ({ ...current, position: event.target.value }))} className="rounded-none bg-black/20 border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="declared_assets_brl">Bens declarados (R$)</Label>
                  <Input id="declared_assets_brl" required type="number" min="0" step="0.01" value={form.declared_assets_brl} onChange={(event) => setForm((current) => ({ ...current, declared_assets_brl: event.target.value }))} className="rounded-none bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declaration_year">Ano da declaração</Label>
                  <Input id="declaration_year" required type="number" min="2000" value={form.declaration_year} onChange={(event) => setForm((current) => ({ ...current, declaration_year: event.target.value }))} className="rounded-none bg-black/20 border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_source_url">URL da fonte (Receita/BCB/outro órgão)</Label>
                <Input id="data_source_url" type="url" value={form.data_source_url} onChange={(event) => setForm((current) => ({ ...current, data_source_url: event.target.value }))} className="rounded-none bg-black/20 border-white/10" placeholder="https://..." />
              </div>

              <Button type="submit" className="w-full rounded-none bg-neon-green text-black hover:bg-green-500 font-bold uppercase tracking-wider" disabled={saving}>
                <PlusCircle className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Registrar político"}
              </Button>
            </form>
          </Card>

          <Card className="bg-zinc-900/70 border-white/10 rounded-none p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-chivo font-bold text-2xl">Declarações recentes</h2>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Total declarado</p>
                <p className="text-neon-green font-bold">R$ {totalDeclared.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              {loading && <p className="text-zinc-400">Carregando...</p>}
              {!loading && politicians.length === 0 && <p className="text-zinc-400">Nenhum político cadastrado ainda.</p>}
              {politicians.map((politician) => (
                <div key={politician.id} className="border border-white/10 bg-black/20 p-4 space-y-2">
                  <p className="font-semibold text-zinc-100">{politician.name}</p>
                  <p className="text-zinc-400 text-sm">{politician.party} · {politician.position} {politician.state ? `· ${politician.state}` : ""}</p>
                  <p className="text-zinc-200 flex items-center gap-2"><Landmark className="w-4 h-4 text-neon-green" /> R$ {(politician.declared_assets_brl || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <p className="text-zinc-500 text-xs">Ano: {politician.declaration_year || "não informado"}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
