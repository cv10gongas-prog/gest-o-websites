import {
  createServerFn,
} from "@tanstack/react-start";
import {
  getRequest,
} from "@tanstack/react-start/server";
import {
  createClient,
} from "@supabase/supabase-js";
import { z } from "zod";

import {
  requireSupabaseAuth,
} from "@/integrations/supabase/auth-middleware";

export type TentativaLoginFalhada = {
  id: string;
  email: string;
  ip: string | null;
  pais: string | null;
  cidade: string | null;
  user_agent: string | null;
  motivo: string;
  created_at: string;
};

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

function credenciaisSupabase() {
  const url =
    process.env
      .SUPABASE_URL;

  const key =
    process.env
      .SUPABASE_PUBLISHABLE_KEY;

  if (
    !url ||
    !key
  ) {
    throw new Error(
      "Configuração Supabase indisponível.",
    );
  }

  return {
    url,
    key,
  };
}

export const obterContextoSeguranca =
  createServerFn({
    method: "GET",
  }).handler(
    async () => {
      const request =
        getRequest();

      if (!request) {
        return {
          ip:
            "desconhecido",

          pais:
            null,

          cidade:
            null,

          userAgent:
            null,
        };
      }

      const pais =
        obterPais(
          request,
        );

      return {
        ip:
          obterIp(
            request,
          ),

        pais:
          pais || null,

        cidade:
          obterCidade(
            request,
          ),

        userAgent:
          limitarTexto(
            request.headers.get(
              "user-agent",
            ),
          ),
      };
    },
  );

export const registarTentativaFalhada =
  createServerFn({
    method: "POST",
  })
    .inputValidator(
      (
        data: unknown,
      ) =>
        z
          .object({
            email: z
              .string()
              .max(320),
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
          return {
            ok: false,
          };
        }

        const {
          url,
          key,
        } =
          credenciaisSupabase();

        const supabaseAnon =
          createClient(
            url,
            key,
            {
              auth: {
                persistSession:
                  false,

                autoRefreshToken:
                  false,
              },
            },
          );

        const pais =
          obterPais(
            request,
          );

        /*
         * Nunca guardamos a password.
         *
         * Também não guardamos a mensagem
         * exata do Supabase para evitar
         * colocar detalhes desnecessários
         * no histórico.
         */
        const {
          error,
        } =
          await supabaseAnon
            .from(
              "security_login_attempts",
            )
            .insert({
              email:
                data.email
                  .trim()
                  .toLowerCase()
                  .slice(
                    0,
                    320,
                  ),

              ip:
                obterIp(
                  request,
                ),

              pais:
                pais ||
                null,

              cidade:
                obterCidade(
                  request,
                ),

              user_agent:
                limitarTexto(
                  request.headers.get(
                    "user-agent",
                  ),
                ),

              motivo:
                "Credenciais rejeitadas",
            });

        if (error) {
          console.error(
            "[Segurança] Não foi possível registar tentativa falhada:",
            error,
          );

          return {
            ok: false,
          };
        }

        return {
          ok: true,
        };
      },
    );

export const obterTentativasFalhadas =
  createServerFn({
    method: "GET",
  })
    .middleware([
      requireSupabaseAuth,
    ])
    .handler(
      async (): Promise<
        TentativaLoginFalhada[]
      > => {
        const request =
          getRequest();

        if (!request) {
          return [];
        }

        const authHeader =
          request.headers.get(
            "authorization",
          );

        if (!authHeader) {
          return [];
        }

        const {
          url,
          key,
        } =
          credenciaisSupabase();

        /*
         * Cliente sem os tipos gerados,
         * porque esta é uma tabela nova
         * que ainda não existe no
         * types.ts automático.
         */
        const supabaseSeguranca =
          createClient(
            url,
            key,
            {
              global: {
                headers: {
                  Authorization:
                    authHeader,
                },
              },

              auth: {
                persistSession:
                  false,

                autoRefreshToken:
                  false,
              },
            },
          );

        const {
          data,
          error,
        } =
          await supabaseSeguranca
            .from(
              "security_login_attempts",
            )
            .select(
              "id,email,ip,pais,cidade,user_agent,motivo,created_at",
            )
            .order(
              "created_at",
              {
                ascending:
                  false,
              },
            )
            .limit(
              100,
            );

        if (error) {
          console.error(
            "[Segurança] Erro ao carregar tentativas:",
            error,
          );

          throw new Error(
            "Não foi possível carregar tentativas de login.",
          );
        }

        return (
          data ??
          []
        ) as TentativaLoginFalhada[];
      },
    );
