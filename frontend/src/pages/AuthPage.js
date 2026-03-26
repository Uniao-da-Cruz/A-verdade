import { useState } from "react";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const initialRegister = {
  full_name: "",
  workspace_name: "",
  email: "",
  password: "",
};

const initialLogin = {
  email: "",
  password: "",
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [loadingMode, setLoadingMode] = useState(null);

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      setLoadingMode("register");
      await register(registerForm);
      toast.success("Workspace criado com sucesso");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Não foi possível criar sua conta");
    } finally {
      setLoadingMode(null);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      setLoadingMode("login");
      await login(loginForm);
      toast.success("Login realizado com sucesso");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Credenciais inválidas");
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 px-6 py-10 md:px-12">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
        <div>
          <Button asChild variant="ghost" className="mb-6 text-zinc-400 hover:text-zinc-100 rounded-none px-0">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <h1 className="font-chivo font-black text-5xl leading-tight mb-4">Login e onboarding do SaaS</h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            Registre um workspace, receba dados iniciais automaticamente e gerencie monitoramento político com sessão protegida.
          </p>
          <div className="space-y-4 text-sm text-zinc-300">
            {[
              "Conta nova já entra com seed de exemplo.",
              "Cada usuário enxerga apenas o próprio workspace.",
              "O backend aceita SQLite local ou PostgreSQL para produção.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 border border-white/10 bg-zinc-900/60 p-4">
                <span className="w-2 h-2 rounded-full bg-neon-green mt-1.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="bg-zinc-900/70 border-white/10 p-6 md:p-8 rounded-none">
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid grid-cols-2 rounded-none bg-black/30">
              <TabsTrigger value="register" className="rounded-none gap-2">
                <UserPlus className="w-4 h-4" />
                Criar conta
              </TabsTrigger>
              <TabsTrigger value="login" className="rounded-none gap-2">
                <LogIn className="w-4 h-4" />
                Entrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="mt-6">
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome</Label>
                  <Input id="full_name" value={registerForm.full_name} onChange={(e) => setRegisterForm((current) => ({ ...current, full_name: e.target.value }))} className="rounded-none bg-black/20 border-white/10" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspace_name">Nome do workspace</Label>
                  <Input id="workspace_name" value={registerForm.workspace_name} onChange={(e) => setRegisterForm((current) => ({ ...current, workspace_name: e.target.value }))} className="rounded-none bg-black/20 border-white/10" placeholder="Opcional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register_email">Email</Label>
                  <Input id="register_email" type="email" value={registerForm.email} onChange={(e) => setRegisterForm((current) => ({ ...current, email: e.target.value }))} className="rounded-none bg-black/20 border-white/10" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register_password">Senha</Label>
                  <Input id="register_password" type="password" minLength={8} value={registerForm.password} onChange={(e) => setRegisterForm((current) => ({ ...current, password: e.target.value }))} className="rounded-none bg-black/20 border-white/10" required />
                </div>
                <Button type="submit" className="w-full rounded-none bg-neon-green text-black hover:bg-green-500 font-bold uppercase tracking-wider" disabled={loadingMode === "register"}>
                  {loadingMode === "register" ? "Criando..." : "Criar workspace"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="login" className="mt-6">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="login_email">Email</Label>
                  <Input id="login_email" type="email" value={loginForm.email} onChange={(e) => setLoginForm((current) => ({ ...current, email: e.target.value }))} className="rounded-none bg-black/20 border-white/10" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login_password">Senha</Label>
                  <Input id="login_password" type="password" value={loginForm.password} onChange={(e) => setLoginForm((current) => ({ ...current, password: e.target.value }))} className="rounded-none bg-black/20 border-white/10" required />
                </div>
                <Button type="submit" className="w-full rounded-none bg-neon-green text-black hover:bg-green-500 font-bold uppercase tracking-wider" disabled={loadingMode === "login"}>
                  {loadingMode === "login" ? "Entrando..." : "Entrar no dashboard"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
