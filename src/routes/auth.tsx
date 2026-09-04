import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { SignInFlow } from "@/components/ui/sign-in-flow-1";
import { supabase } from "@/integrations/supabase/client";
import { registarEventoSeguranca } from "@/lib/security.functions";

export const Route = createFileRoute("/auth")({
  ssr: false,

  head: () => ({
    meta: [
      {
        title: "Entrar — Nova Web CRM",
      },
      {
        name: "description",
        content:
          "Acesso reservado à equipa comercial da Nova Web Studio.",
      },
      {
        property: "og:title",
        content: "Entrar — Nova Web CRM",
      },
      {
        property: "og:description",
        content:
          "Acesso reservado à equipa comercial da Nova Web Studio.",
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

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    aCarregar,
    setACarregar,
  ] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (
          active &&
          data.session
        ) {
          navigate({
            to: "/painel",
            replace: true,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  async function registarSeguranca(
    dados: {
      evento:
        | "login_sucesso"
        | "login_falhou";

      email: string;

      userId?: string | null;

      motivo?: string | null;
    },
  ) {
    try {
      await registarEventoSeguranca({
        data: {
          evento:
            dados.evento,

          email:
            dados.email,

          userId:
            dados.userId ??
            null,

          motivo:
            dados.motivo ??
            null,
        },
      });
    } catch (error) {
      /*
       * Um problema no registo de segurança
       * nunca deve impedir o utilizador de
       * entrar no CRM.
       */
      console.error(
        "[Segurança] Não foi possível registar o evento:",
        error,
      );
    }
  }

  async function submeter(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (aCarregar) {
      return;
    }

    const emailNormalizado =
      email
        .trim()
        .toLowerCase();

    setACarregar(true);

    try {
      const {
        data,
        error,
      } =
        await supabase.auth
          .signInWithPassword({
            email:
              emailNormalizado,

            password,
          });

      if (error) {
        await registarSeguranca({
          evento:
            "login_falhou",

          email:
            emailNormalizado,

          userId:
            null,

          motivo:
            error.message,
        });

        throw error;
      }

      await registarSeguranca({
        evento:
          "login_sucesso",

        email:
          emailNormalizado,

        userId:
          data.user?.id ??
          null,

        motivo:
          null,
      });

      toast.success(
        "Sessão iniciada.",
      );

      navigate({
        to: "/painel",
        replace: true,
      });
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível continuar.",
      );
    } finally {
      setACarregar(false);
    }
  }

  return (
    <SignInFlow
      email={email}
      password={password}
      loading={aCarregar}
      onEmailChange={
        setEmail
      }
      onPasswordChange={
        setPassword
      }
      onSubmit={submeter}
    />
  );
}
