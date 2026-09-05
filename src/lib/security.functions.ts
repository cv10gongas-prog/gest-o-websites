import {
  createServerFn,
} from "@tanstack/react-start";
import {
  getRequest,
} from "@tanstack/react-start/server";

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
