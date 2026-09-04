import {
  createSign,
} from "node:crypto";

import {
  createServerFn,
} from "@tanstack/react-start";
import { z } from "zod";

import {
  requireSupabaseAuth,
} from "@/integrations/supabase/auth-middleware";

const periodoSchema = z.enum([
  "24h",
  "7d",
  "30d",
  "90d",
]);

type PeriodoAnalytics =
  z.infer<typeof periodoSchema>;

type LinhaGrafico = {
  chave: string;
  label: string;
  visitas: number;
  utilizadores: number;
  pageviews: number;
};

type PaginaAnalytics = {
  path: string;
  titulo: string;
  pageviews: number;
  utilizadores: number;
};

type PaisAnalytics = {
  pais: string;
  codigo: string;
  utilizadores: number;
};

type DispositivoAnalytics = {
  dispositivo: string;
  utilizadores: number;
};

export type AnalyticsResumo = {
  periodo: PeriodoAnalytics;

  totais: {
    visitas: number;
    utilizadores: number;
    pageviews: number;
    duracaoMedia: number;
  };

  grafico: LinhaGrafico[];

  paginas: PaginaAnalytics[];

  paises: PaisAnalytics[];

  dispositivos: DispositivoAnalytics[];
};

type GAValue = {
  value?: string;
};

type GARow = {
  dimensionValues?: GAValue[];
  metricValues?: GAValue[];
};

type GAReportResponse = {
  rows?: GARow[];
  rowCount?: number;
};

const ROTAS_INTERNAS = [
  "/auth",
  "/arquivos",
  "/definicoes",
  "/emails",
  "/equipa",
  "/negocios",
  "/painel",
  "/pedidos",
  "/pipeline",
  "/projetos",
  "/tarefas",
];

function filtroSitePublico() {
  return {
    notExpression: {
      filter: {
        fieldName: "pagePath",

        inListFilter: {
          values: ROTAS_INTERNAS,
          caseSensitive: false,
        },
      },
    },
  };
}

function paginaInterna(
  path: string,
) {
  const normalizado =
    path
      .split("?")[0]
      .split("#")[0];

  return ROTAS_INTERNAS.some(
    (rota) =>
      normalizado === rota ||
      normalizado.startsWith(
        `${rota}/`,
      ),
  );
}

function obterCredenciais() {
  const propertyId =
    process.env
      .GA4_PROPERTY_ID
      ?.trim();

  const clientEmail =
    process.env
      .GA4_CLIENT_EMAIL
      ?.trim();

  const privateKeyRaw =
    process.env
      .GA4_PRIVATE_KEY;

  if (!propertyId) {
    throw new Error(
      "GA4_PROPERTY_ID não está configurado no Vercel.",
    );
  }

  if (!clientEmail) {
    throw new Error(
      "GA4_CLIENT_EMAIL não está configurado no Vercel.",
    );
  }

  if (!privateKeyRaw) {
    throw new Error(
      "GA4_PRIVATE_KEY não está configurado no Vercel.",
    );
  }

  const privateKey =
    privateKeyRaw
      .trim()
      .replace(
        /^["']|["']$/g,
        "",
      )
      .replace(
        /\\n/g,
        "\n",
      );

  if (
    !privateKey.includes(
      "BEGIN PRIVATE KEY",
    )
  ) {
    throw new Error(
      "GA4_PRIVATE_KEY não parece ser uma chave privada válida.",
    );
  }

  return {
    propertyId,
    clientEmail,
    privateKey,
  };
}

function base64Url(
  value:
    | string
    | Buffer,
) {
  return Buffer
    .from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function obterAccessToken() {
  const {
    clientEmail,
    privateKey,
  } = obterCredenciais();

  const agora =
    Math.floor(
      Date.now() / 1000,
    );

  const header =
    base64Url(
      JSON.stringify({
        alg: "RS256",
        typ: "JWT",
      }),
    );

  const payload =
    base64Url(
      JSON.stringify({
        iss: clientEmail,

        scope:
          "https://www.googleapis.com/auth/analytics.readonly",

        aud:
          "https://oauth2.googleapis.com/token",

        iat: agora,

        exp:
          agora + 3600,
      }),
    );

  const unsignedToken =
    `${header}.${payload}`;

  const signer =
    createSign(
      "RSA-SHA256",
    );

  signer.update(
    unsignedToken,
  );

  signer.end();

  const assinatura =
    signer.sign(
      privateKey,
    );

  const jwt =
    `${unsignedToken}.${base64Url(
      assinatura,
    )}`;

  const body =
    new URLSearchParams({
      grant_type:
        "urn:ietf:params:oauth:grant-type:jwt-bearer",

      assertion: jwt,
    });

  const response =
    await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body:
          body.toString(),
      },
    );

  const json =
    (await response.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

  if (
    !response.ok ||
    !json.access_token
  ) {
    throw new Error(
      json.error_description ??
        json.error ??
        `Google OAuth respondeu com ${response.status}.`,
    );
  }

  return json.access_token;
}

async function executarRelatorio(
  token: string,
  propertyId: string,
  body: Record<
    string,
    unknown
  >,
) {
  const response =
    await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(body),
      },
    );

  const text =
    await response.text();

  let json:
    | GAReportResponse
    | {
        error?: {
          code?: number;
          message?: string;
          status?: string;
        };
      };

  try {
    json =
      JSON.parse(text);
  } catch {
    throw new Error(
      `A Google devolveu uma resposta inválida (${response.status}).`,
    );
  }

  if (!response.ok) {
    const erro =
      "error" in json
        ? json.error
        : undefined;

    throw new Error(
      erro?.message ??
        `Google Analytics respondeu com erro ${response.status}.`,
    );
  }

  return json as GAReportResponse;
}

function configuracaoPeriodo(
  periodo: PeriodoAnalytics,
) {
  switch (periodo) {
    case "24h":
      return {
        startDate:
          "1daysAgo",

        endDate:
          "today",

        dimension:
          "dateHour",
      };

    case "7d":
      return {
        startDate:
          "6daysAgo",

        endDate:
          "today",

        dimension:
          "date",
      };

    case "30d":
      return {
        startDate:
          "29daysAgo",

        endDate:
          "today",

        dimension:
          "date",
      };

    case "90d":
      return {
        startDate:
          "89daysAgo",

        endDate:
          "today",

        dimension:
          "date",
      };
  }
}

function numero(
  value:
    | string
    | null
    | undefined,
) {
  const parsed =
    Number(
      value ?? 0,
    );

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
}

function formatarLabelGrafico(
  chave: string,
  periodo: PeriodoAnalytics,
) {
  if (
    periodo === "24h"
  ) {
    const hora =
      chave.slice(-2);

    return `${hora}h`;
  }

  if (
    chave.length !== 8
  ) {
    return chave;
  }

  const dia =
    chave.slice(6, 8);

  const mes =
    chave.slice(4, 6);

  return `${dia}/${mes}`;
}

function formatarChaveData(
  data: Date,
) {
  const ano =
    data
      .getFullYear()
      .toString();

  const mes =
    String(
      data.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const dia =
    String(
      data.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${ano}${mes}${dia}`;
}

function preencherDiasSemDados(
  linhas:
    LinhaGrafico[],
  dias: number,
) {
  const porChave =
    new Map(
      linhas.map(
        (linha) => [
          linha.chave,
          linha,
        ],
      ),
    );

  const resultado:
    LinhaGrafico[] = [];

  const hoje =
    new Date();

  for (
    let i = dias - 1;
    i >= 0;
    i--
  ) {
    const data =
      new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - i,
      );

    const chave =
      formatarChaveData(
        data,
      );

    const existente =
      porChave.get(
        chave,
      );

    resultado.push(
      existente ?? {
        chave,

        label:
          formatarLabelGrafico(
            chave,
            "7d",
          ),

        visitas: 0,
        utilizadores: 0,
        pageviews: 0,
      },
    );
  }

  return resultado;
}

function preencherHorasSemDados(
  linhas:
    LinhaGrafico[],
) {
  const porChave =
    new Map(
      linhas.map(
        (linha) => [
          linha.chave,
          linha,
        ],
      ),
    );

  const resultado:
    LinhaGrafico[] = [];

  const agora =
    new Date();

  for (
    let i = 23;
    i >= 0;
    i--
  ) {
    const data =
      new Date(
        agora.getTime() -
          i *
            60 *
            60 *
            1000,
      );

    const chave =
      `${formatarChaveData(
        data,
      )}${String(
        data.getHours(),
      ).padStart(
        2,
        "0",
      )}`;

    const existente =
      porChave.get(
        chave,
      );

    resultado.push(
      existente ?? {
        chave,

        label:
          `${String(
            data.getHours(),
          ).padStart(
            2,
            "0",
          )}h`,

        visitas: 0,
        utilizadores: 0,
        pageviews: 0,
      },
    );
  }

  return resultado;
}

function completarGrafico(
  linhas:
    LinhaGrafico[],
  periodo:
    PeriodoAnalytics,
) {
  if (
    periodo === "24h"
  ) {
    return preencherHorasSemDados(
      linhas,
    );
  }

  if (
    periodo === "7d"
  ) {
    return preencherDiasSemDados(
      linhas,
      7,
    );
  }

  if (
    periodo === "30d"
  ) {
    return preencherDiasSemDados(
      linhas,
      30,
    );
  }

  return preencherDiasSemDados(
    linhas,
    90,
  );
}

export const obterAnalytics =
  createServerFn({
    method: "GET",
  })
    .middleware([
      requireSupabaseAuth,
    ])
    .inputValidator(
      (
        data: unknown,
      ) =>
        z
          .object({
            periodo:
              periodoSchema.default(
                "7d",
              ),
          })
          .parse(data),
    )
    .handler(
      async ({
        data,
      }): Promise<AnalyticsResumo> => {
        const {
          propertyId,
        } =
          obterCredenciais();

        const token =
          await obterAccessToken();

        const periodo =
          data.periodo;

        const config =
          configuracaoPeriodo(
            periodo,
          );

        const dateRanges = [
          {
            startDate:
              config.startDate,

            endDate:
              config.endDate,
          },
        ];

        const dimensionFilter =
          filtroSitePublico();

        const [
          totaisResponse,
          graficoResponse,
          paginasResponse,
          paisesResponse,
          dispositivosResponse,
        ] =
          await Promise.all([
            executarRelatorio(
              token,
              propertyId,
              {
                dateRanges,

                dimensionFilter,

                metrics: [
                  {
                    name:
                      "sessions",
                  },
                  {
                    name:
                      "totalUsers",
                  },
                  {
                    name:
                      "screenPageViews",
                  },
                  {
                    name:
                      "averageSessionDuration",
                  },
                ],
              },
            ),

            executarRelatorio(
              token,
              propertyId,
              {
                dateRanges,

                dimensionFilter,

                dimensions: [
                  {
                    name:
                      config.dimension,
                  },
                ],

                metrics: [
                  {
                    name:
                      "sessions",
                  },
                  {
                    name:
                      "totalUsers",
                  },
                  {
                    name:
                      "screenPageViews",
                  },
                ],

                orderBys: [
                  {
                    dimension: {
                      dimensionName:
                        config.dimension,
                    },
                  },
                ],

                limit:
                  periodo ===
                  "24h"
                    ? "100"
                    : "200",
              },
            ),

            executarRelatorio(
              token,
              propertyId,
              {
                dateRanges,

                dimensionFilter,

                dimensions: [
                  {
                    name:
                      "pagePath",
                  },
                  {
                    name:
                      "pageTitle",
                  },
                ],

                metrics: [
                  {
                    name:
                      "screenPageViews",
                  },
                  {
                    name:
                      "totalUsers",
                  },
                ],

                orderBys: [
                  {
                    metric: {
                      metricName:
                        "screenPageViews",
                    },

                    desc: true,
                  },
                ],

                limit: "20",
              },
            ),

            executarRelatorio(
              token,
              propertyId,
              {
                dateRanges,

                dimensionFilter,

                dimensions: [
                  {
                    name:
                      "country",
                  },
                  {
                    name:
                      "countryId",
                  },
                ],

                metrics: [
                  {
                    name:
                      "totalUsers",
                  },
                ],

                orderBys: [
                  {
                    metric: {
                      metricName:
                        "totalUsers",
                    },

                    desc: true,
                  },
                ],

                limit: "8",
              },
            ),

            executarRelatorio(
              token,
              propertyId,
              {
                dateRanges,

                dimensionFilter,

                dimensions: [
                  {
                    name:
                      "deviceCategory",
                  },
                ],

                metrics: [
                  {
                    name:
                      "totalUsers",
                  },
                ],

                orderBys: [
                  {
                    metric: {
                      metricName:
                        "totalUsers",
                    },

                    desc: true,
                  },
                ],

                limit: "10",
              },
            ),
          ]);

        const totaisRow =
          totaisResponse
            .rows?.[0];

        const totais = {
          visitas:
            numero(
              totaisRow
                ?.metricValues?.[0]
                ?.value,
            ),

          utilizadores:
            numero(
              totaisRow
                ?.metricValues?.[1]
                ?.value,
            ),

          pageviews:
            numero(
              totaisRow
                ?.metricValues?.[2]
                ?.value,
            ),

          duracaoMedia:
            numero(
              totaisRow
                ?.metricValues?.[3]
                ?.value,
            ),
        };

        const linhasGrafico:
          LinhaGrafico[] =
            (
              graficoResponse
                .rows ?? []
            ).map(
              (row) => {
                const chave =
                  row
                    .dimensionValues?.[0]
                    ?.value ??
                  "";

                return {
                  chave,

                  label:
                    formatarLabelGrafico(
                      chave,
                      periodo,
                    ),

                  visitas:
                    numero(
                      row
                        .metricValues?.[0]
                        ?.value,
                    ),

                  utilizadores:
                    numero(
                      row
                        .metricValues?.[1]
                        ?.value,
                    ),

                  pageviews:
                    numero(
                      row
                        .metricValues?.[2]
                        ?.value,
                    ),
                };
              },
            );

        const grafico =
          completarGrafico(
            linhasGrafico,
            periodo,
          );

        const paginas:
          PaginaAnalytics[] =
            (
              paginasResponse
                .rows ?? []
            )
              .map(
                (row) => ({
                  path:
                    row
                      .dimensionValues?.[0]
                      ?.value ??
                    "/",

                  titulo:
                    row
                      .dimensionValues?.[1]
                      ?.value ??
                    "Sem título",

                  pageviews:
                    numero(
                      row
                        .metricValues?.[0]
                        ?.value,
                    ),

                  utilizadores:
                    numero(
                      row
                        .metricValues?.[1]
                        ?.value,
                    ),
                }),
              )
              .filter(
                (pagina) =>
                  !paginaInterna(
                    pagina.path,
                  ),
              )
              .slice(
                0,
                8,
              );

        const paises:
          PaisAnalytics[] =
            (
              paisesResponse
                .rows ?? []
            ).map(
              (row) => {
                const paisOriginal =
                  row
                    .dimensionValues?.[0]
                    ?.value ??
                  "";

                const codigoOriginal =
                  row
                    .dimensionValues?.[1]
                    ?.value ??
                  "";

                const desconhecido =
                  !paisOriginal ||
                  paisOriginal ===
                    "(not set)" ||
                  paisOriginal ===
                    "not set";

                return {
                  pais:
                    desconhecido
                      ? "Desconhecido"
                      : paisOriginal,

                  codigo:
                    desconhecido
                      ? ""
                      : codigoOriginal.toUpperCase(),

                  utilizadores:
                    numero(
                      row
                        .metricValues?.[0]
                        ?.value,
                    ),
                };
              },
            );

        const dispositivos:
          DispositivoAnalytics[] =
            (
              dispositivosResponse
                .rows ?? []
            ).map(
              (row) => ({
                dispositivo:
                  row
                    .dimensionValues?.[0]
                    ?.value ??
                  "unknown",

                utilizadores:
                  numero(
                    row
                      .metricValues?.[0]
                      ?.value,
                  ),
              }),
            );

        return {
          periodo,

          totais,

          grafico,

          paginas,

          paises,

          dispositivos,
        };
      },
    );
