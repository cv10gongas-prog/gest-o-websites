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
import { obterContextoSeguranca } from "@/lib/security.functions";

export const Route =
  createFileRoute(
    "/auth",
  )({
    ssr: false,

    head: () => ({
      meta: [
        {
          title:
            "Entrar — Nova Web CRM",
        },
        {
          name:
            "description",

          content:
            "Acesso reservado à equipa comercial da Nova Web Studio.",
        },
        {
          property:
            "og:title",

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
          name:
            "robots",

          content:
            "noindex",
        },
      ],
    }),

    component:
      AuthPage,
  });

function AuthPage() {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    aCarregar,
    setACarregar,
  ] =
    useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(
        ({
          data,
        }) => {
          if (
            active &&
            data.session
          ) {
            navigate({
              to: "/painel",
              replace: true,
            });
          }
        },
      );

    return () => {
      active = false;
    };
  }, [
    navigate,
  ]);

  async function registarLogin(
    emailUtilizador: string,
    userId: string,
  ) {
    try {
      const contexto =
        await obterContextoSeguranca();

      const detalhe =
        JSON.stringify({
          ip:
            contexto.ip,

          pais:
            contexto.pais,

          cidade:
            contexto.cidade,

          email:
            emailUtilizador,

          user_id:
            userId,

          sucesso:
            true,

          user_agent:
            contexto.userAgent,
        });

      const {
        error,
      } =
        await supabase
          .from(
            "activity_log",
          )
          .insert({
            entidade:
              "seguranca",

            entidade_id:
              userId,

            accao:
              "iniciou sessão",

            detalhe,

            autor:
              userId,

            business_id:
              null,
          });

      if (error) {
        console.error(
          "[Segurança] Erro Supabase:",
          error,
        );
      }
    } catch (error) {
      console.error(
        "[Segurança] Não foi possível registar o login:",
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

    setACarregar(
      true,
    );

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
        throw error;
      }

      if (
        data.user?.id
      ) {
        await registarLogin(
          emailNormalizado,
          data.user.id,
        );
      }

      toast.success(
        "Sessão iniciada.",
      );

      navigate({
        to: "/painel",
        replace: true,
      });
    } catch (error) {
      console.error(
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível continuar.",
      );
    } finally {
      setACarregar(
        false,
      );
    }
  }

  return (
    <SignInFlow
      email={
        email
      }
      password={
        password
      }
      loading={
        aCarregar
      }
      onEmailChange={
        setEmail
      }
      onPasswordChange={
        setPassword
      }
      onSubmit={
        submeter
      }
    />
  );
}
