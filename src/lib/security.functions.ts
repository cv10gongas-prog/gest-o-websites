import { getRequest } from "@tanstack/react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const eventoSchema = z.enum([
  "login_sucesso",
  "login_falhou",
]);

function obterIp(request: Request) {
  const forwarded =
    request.headers.get("x-forwarded-for");

  if (forwarded) {
    return (
      forwarded
        .split(",")[0]
        ?.trim() || "desconhecido"
    );
  }

  return (
    request.headers.get("x-real-ip") ??
    "desconhecido"
  );
}

function obterPais(request: Request) {
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

function obterCidade(request: Request) {
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

export const registarEventoSeguranca =
  createServerFn({
    method: "POST",
  })
    .inputValidator(
      (data: unknown) =>
        z
          .object({
            evento:
              eventoSchema,

            email: z
              .string()
              .email()
              .max(320),

            userId: z
              .string()
              .uuid()
              .nullable()
              .optional(),

            motivo: z
              .string()
              .max(300)
              .nullable()
              .optional(),
          })
          .parse(data),
    )
    .handler(
      async ({
        data,
      }) => {
        const request =
          getRequest();

        if (!request) {
          throw new Error(
            "Pedido indisponível.",
          );
        }

        const ip =
          obterIp(request);

        const pais =
          obterPais(request);

        const cidade =
          obterCidade(request);

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
              data.userId ??
              null,
            sucesso:
              data.evento ===
              "login_sucesso",
            motivo:
              data.motivo ??
              null,
            user_agent:
              userAgent,
          });

        const {
          supabaseAdmin,
        } = await import(
          "@/integrations/supabase/client.server"
        );

        const {
          error,
        } =
          await supabaseAdmin
            .from(
              "activity_log",
            )
            .insert({
              entidade:
                "seguranca",

              entidade_id:
                data.userId ??
                null,

              accao:
                data.evento ===
                "login_sucesso"
                  ? "iniciou sessão"
                  : "tentativa de login falhada",

              detalhe,

              autor:
                data.userId ??
                null,

              business_id:
                null,
            });

        if (error) {
          console.error(
            "[Segurança] Falha ao registar evento:",
            error,
          );

          throw new Error(
            "Não foi possível registar o evento de segurança.",
          );
        }

        return {
          ok: true,
        };
      },
    );
