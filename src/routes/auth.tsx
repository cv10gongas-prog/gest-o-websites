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
  ) {
    try {
      /*
       * Força o Supabase a validar e utilizar
       * a sessão acabada de criar.
       */
      const {
        data:
          dadosUtilizador,
        error:
          erroUtilizador,
      } =
        await supabase.auth
          .getUser();

      if (
        erroUtilizador
      ) {
        throw erroUtilizador;
      }

      const user =
        dadosUtilizador.user;

      if (!user) {
        throw new Error(
          "Sessão iniciada mas utilizador não encontrado.",
        );
      }

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
            user.id,

          sucesso:
            true,

          user_agent:
            contexto.userAgent,
        });

      const {
        error:
          erroInsert,
      } =
        await supabase
          .from(
            "activity_log",
          )
          .insert({
            entidade:
              "seguranca",

            entidade_id:
              user.id,

            accao:
              "iniciou sessão",

            detalhe,

            autor:
              user.id,

            business_id:
              null,
          });

      if (
        erroInsert
      ) {
        throw erroInsert;
      }

      console.log(
        "[Segurança] Login registado com sucesso.",
      );

      return true;
    } catch (error) {
      console.error(
        "[Segurança] Erro:",
        error,
      );

      const mensagem =
        error instanceof Error
          ? error.message
          : typeof error ===
                "object" &&
              error !== null &&
              "message" in
                error
            ? String(
                (
                  error as {
                    message:
                      unknown;
                  }
                ).message,
              )
            : "Erro desconhecido.";

      toast.error(
        `Segurança: ${mensagem}`,
      );

      return false;
    }
  }

  async function submeter(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      aCarregar
    ) {
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
        !data.session
      ) {
        throw new Error(
          "O login não devolveu uma sessão válida.",
        );
      }

      /*
       * Espera explicitamente que o cliente
       * confirme a sessão antes do INSERT.
       */
      await supabase.auth
        .setSession({
          access_token:
            data.session
              .access_token,

          refresh_token:
            data.session
              .refresh_token,
        });

      await registarLogin(
        emailNormalizado,
      );

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
