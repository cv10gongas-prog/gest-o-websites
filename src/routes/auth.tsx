import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { SignInFlow } from "@/components/ui/sign-in-flow-1";
import { supabase } from "@/integrations/supabase/client";
import { obterContextoSeguranca } from "@/lib/security.functions";
import { isDemoMode } from "@/lib/demo-mode";

/** Lista de prefixos internos autorizados para redirecionamento pós-login */
const ALLOWED_REDIRECT_PREFIXES = [
  "/hub",
  "/painel",
  "/negocios",
  "/pipeline",
  "/tarefas",
  "/pedidos",
  "/emails",
  "/projetos",
  "/arquivos",
  "/definicoes",
  "/admin",
  "/produtos/restaurantes",
  "/produtos/match",
] as const;

/** Validador seguro contra Open Redirect e caminhos maliciosos */
function sanitizeRedirectTarget(target?: string): string {
  if (!target || typeof target !== "string") return "/hub";
  const trimmed = target.trim();

  // Rejeita URLs externos, protocolo relativo, barras invertidas e esquemas de URL
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://") ||
    trimmed.includes("\\") ||
    trimmed.includes("\0")
  ) {
    return "/hub";
  }

  // Verifica se o caminho pertence à lista de destinos internos autorizados
  const isAllowed = ALLOWED_REDIRECT_PREFIXES.some(
    (prefix) =>
      trimmed === prefix || trimmed.startsWith(`${prefix}/`) || trimmed.startsWith(`${prefix}?`),
  );

  return isAllowed ? trimmed : "/hub";
}

const authSearchSchema = z.object({
  redirect: z
    .string()
    .optional()
    .transform((v) => (v ? sanitizeRedirectTarget(v) : undefined)),
});

export const Route = createFileRoute("/auth")({
  ssr: false,

  validateSearch: (search: Record<string, unknown>) => authSearchSchema.parse(search),

  head: () => ({
    meta: [
      {
        title: "Entrar — Nova Web CRM",
      },
      {
        name: "description",
        content:
          "Acesso reservado à equipa comercial e utilizadores autorizados da Nova Web Studio.",
      },
      {
        property: "og:title",
        content: "Entrar — Nova Web CRM",
      },
      {
        property: "og:description",
        content:
          "Acesso reservado à equipa comercial e utilizadores autorizados da Nova Web Studio.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),

  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const rawRedirect = search.redirect;
  const safeRedirect = sanitizeRedirectTarget(rawRedirect);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aCarregar, setACarregar] = useState(false);

  useEffect(() => {
    let active = true;

    if (isDemoMode()) {
      navigate({
        to: safeRedirect as "/hub",
        replace: true,
      });
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data }: { data: { session: import("@supabase/supabase-js").Session | null } }) => {
        if (active && data.session) {
          navigate({
            to: safeRedirect as "/hub",
            replace: true,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [navigate, safeRedirect]);

  async function registarLogin(emailUtilizador: string) {
    try {
      const { data: dadosUtilizador, error: erroUtilizador } = await supabase.auth.getUser();

      if (erroUtilizador) {
        throw erroUtilizador;
      }

      const user = dadosUtilizador.user;
      if (!user) {
        throw new Error("Sessão iniciada mas utilizador não encontrado.");
      }

      const contexto = await obterContextoSeguranca();
      const detalhe = JSON.stringify({
        ip: contexto.ip,
        pais: contexto.pais,
        cidade: contexto.cidade,
        email: emailUtilizador,
        user_id: user.id,
        sucesso: true,
        user_agent: contexto.userAgent,
      });

      const { error: erroInsert } = await supabase.from("activity_log").insert({
        entidade: "seguranca",
        entidade_id: user.id,
        accao: "iniciou sessão",
        detalhe,
        autor: user.id,
        business_id: null,
      });

      if (erroInsert) {
        throw erroInsert;
      }

      console.log("[Segurança] Login registado com sucesso.");
      return true;
    } catch (error) {
      console.error("[Segurança] Erro:", error);
      return false;
    }
  }

  async function registarTentativaFalhada(emailUtilizador: string) {
    try {
      const contexto = await obterContextoSeguranca();
      const detalhe = JSON.stringify({
        ip: contexto.ip,
        pais: contexto.pais,
        cidade: contexto.cidade,
        email: emailUtilizador,
        sucesso: false,
        motivo: "Credenciais inválidas ou erro no Supabase Auth",
        user_agent: contexto.userAgent,
      });

      await supabase.from("activity_log").insert({
        entidade: "seguranca",
        entidade_id: emailUtilizador,
        accao: "tentativa de login falhada",
        detalhe,
        autor: null,
        business_id: null,
      });
    } catch (e) {
      console.error("[Segurança] Falha ao registar tentativa:", e);
    }
  }

  async function submeter(e: React.FormEvent) {
    e.preventDefault();

    if (isDemoMode()) {
      setACarregar(true);
      toast.success("Sessão iniciada em modo de demonstração.");
      navigate({
        to: safeRedirect as "/hub",
        replace: true,
      });
      setACarregar(false);
      return;
    }

    if (!email || !password) {
      toast.error("Preencha o email e a palavra-passe.");
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();
    setACarregar(true);

    try {
      // IP bloqueado após 3 tentativas falhadas — só um administrador o pode desbloquear.
      const { data: bloqueado } = await supabase.rpc("login_ip_blocked");
      if (bloqueado === true) {
        throw new Error(
          "Este endereço IP foi bloqueado após várias tentativas falhadas. Contacte o administrador.",
        );
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailNormalizado,
        password,
      });

      if (error) {
        await registarTentativaFalhada(emailNormalizado);
        const { data: ficouBloqueado } = await supabase.rpc("register_login_failure", {
          p_email: emailNormalizado,
          p_user_agent: navigator.userAgent.slice(0, 500),
        });
        if (ficouBloqueado === true) {
          throw new Error(
            "Demasiadas tentativas falhadas. Este endereço IP foi bloqueado.",
          );
        }
        throw error;
      }

      void supabase.rpc("register_login_success");

      if (!data.session) {
        throw new Error("O login não devolveu uma sessão válida.");
      }

      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      await registarLogin(emailNormalizado);
      toast.success("Sessão iniciada com sucesso.");

      // Verificar função para encaminhar corretamente
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id)
        .maybeSingle();

      let destino = safeRedirect;

      // Se não houver redirect explícito e o utilizador não for CRM Admin/Comercial, encaminhar ao restaurante
      if (!rawRedirect && !roleData?.role) {
        destino = "/produtos/restaurantes";
      }

      navigate({
        to: destino as "/hub",
        replace: true,
      });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Não foi possível continuar.");
    } finally {
      setACarregar(false);
    }
  }

  return (
    <SignInFlow
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      loading={aCarregar}
      onSubmit={submeter}
    />
  );
}
