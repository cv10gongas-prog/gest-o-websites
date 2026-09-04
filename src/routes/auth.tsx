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

export const Route =
  createFileRoute("/auth")({
    ssr: false,

    head: () => ({
      meta: [
        {
          title:
            "Entrar — Nova Web CRM",
        },

        {
          name: "description",
          content:
            "Acesso reservado à equipa comercial da Nova Web Studio.",
        },

        {
          property: "og:title",
          content:
            "Entrar — Nova Web CRM",
        },

        {
          property:
            "og:description",

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
  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

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

  async function submeter(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (aCarregar) {
      return;
    }

    setACarregar(true);

    try {
      const {
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              email.trim(),

            password,
          },
        );

      if (error) {
        throw error;
      }

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
