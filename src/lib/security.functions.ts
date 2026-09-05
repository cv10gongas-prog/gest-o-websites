import {
  createServerFn,
} from "@tanstack/react-start";
import {
  getRequest,
} from "@tanstack/react-start/server";
import { z } from "zod";

import {
  requireSupabaseAuth,
} from "@/integrations/supabase/auth-middleware";

function obterIp(
  request: Request,
) {
  const forwarded =
    request.headers.get(
      "x-forwarded-for",
    );

  if (forwarded) {
    return (
      forwarded
        .split(",")[0]
        ?.trim() ||
      "desconhecido"
    );
  }

  return (
    request.headers.get(
      "x-real-ip",
    ) ??
    "desconhecido"
  );
}

function obterPais(
  request: Request,
) {
  return (
    request.headers.get(
      "x-vercel-ip-country",
    ) ??
    request.headers.get(
      "cf-ipcountry",
    ) ??
    ""
  ).toUpperCase();
}

function obterCidade(
  request: Request,
) {
  const cidade =
    request.headers.get(
      "x-vercel-ip-city",
    );

  if (!cidade) {
    return null;
  }

  try {
    return decodeURIComponent(
      cidade,
    );
  } catch {
    return cidade;
  }
}

function limitarTexto(
  value: string | null,
  limite = 500,
) {
  if (!value) {
    return null;
  }

  return value.slice(
    0,
    limite,
  );
}

export const registarLoginSucesso =
  createServerFn({
    method: "POST",
  })
    .middleware([
      requireSupabaseAuth,
    ])
    .inputValidator(
      (data: unknown) =>
        z
          .object({
            email: z
              .string()
              .email()
              .max(320),
          })
          .parse(data),
    )
    .handler(
      async ({
        data,
        context,
      }) => {
        const request =
          getRequest();

        if (!request) {
          throw new Error(
            "Pedido indisponível.",
          );
        }

        const ip =
          obterIp(
            request,
          );

        const pais =
          obterPais(
            request,
          );

        const cidade =
          obterCidade(
            request,
          );

        const userAgent =
          limitarTexto(
            request.headers.get(
              "user-agent",
            ),
          );

        const detalhe =
          JSON.stringify({
            ip,

            pais:
              pais || null,

            cidade,

            email:
              data.email
                .trim()
                .toLowerCase(),

            user_id:
              context.userId,

            sucesso: true,

            user_agent:
              userAgent,
          });

        const {
          error,
        } =
          await context.supabase
            .from(
              "activity_log",
            )
            .insert({
              entidade:
                "seguranca",

              entidade_id:
                context.userId,

              accao:
                "iniciou sessão",

              detalhe,

              autor:
                context.userId,

              business_id:
                null,
            });

        if (error) {
          console.error(
            "[Segurança] Erro ao registar login:",
            error,
          );

          throw new Error(
            "Não foi possível registar o login.",
          );
        }

        return {
          ok: true,
        };
      },
    );
