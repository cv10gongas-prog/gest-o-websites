import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Campo } from "@/components/crm/Bits";
import { btnPrimario, btnSecundario, inputClass } from "@/components/crm/Modal";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Orbit CRM" },
      { name: "description", content: "Acesso reservado à equipa comercial do Orbit CRM." },
      { property: "og:title", content: "Entrar — Orbit CRM" },
      { property: "og:description", content: "Acesso reservado à equipa comercial." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "registar">("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aCarregar, setACarregar] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/painel", replace: true });
    });
  }, [navigate]);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setACarregar(true);
    try {
      if (modo === "registar") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nome },
            emailRedirectTo: `${window.location.origin}/painel`,
          },
        });
        if (error) throw error;
        toast.success("Conta criada. Já podes entrar.");
        setModo("entrar");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/painel", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível continuar.");
    } finally {
      setACarregar(false);
    }
  }

  async function entrarComGoogle() {
    const resultado = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (resultado.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (resultado.redirected) return;
    navigate({ to: "/painel", replace: true });
  }

  return (
    <div className="relative grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="orbit-glow pointer-events-none fixed inset-0" />
      <div className="orbit-panel relative w-full max-w-md p-7">
        <div className="flex items-center gap-3">
          <span className="orbit-brand-mark grid size-10 place-items-center rounded-xl">
            <Target className="size-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Orbit CRM</h1>
            <p className="text-[11px] uppercase tracking-[.18em] text-muted-foreground">
              Área da equipa
            </p>
          </div>
        </div>

        <form className="mt-7 grid gap-4" onSubmit={submeter}>
          {modo === "registar" && (
            <Campo label="Nome">
              <input
                className={inputClass}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="O teu nome"
                required
              />
            </Campo>
          )}
          <Campo label="Email">
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Campo>
          <Campo label="Palavra-passe">
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </Campo>
          <button className={btnPrimario} disabled={aCarregar}>
            {aCarregar ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
            {modo === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[.2em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
        </div>

        <button className={`${btnSecundario} w-full`} onClick={entrarComGoogle}>
          Continuar com Google
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {modo === "entrar" ? "Ainda não tens conta?" : "Já tens conta?"}{" "}
          <button
            className="text-primary hover:underline"
            onClick={() => setModo(modo === "entrar" ? "registar" : "entrar")}
          >
            {modo === "entrar" ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}
