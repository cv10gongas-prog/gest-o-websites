import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const periodoSchema = z.enum(["24h", "7d", "30d", "90d"]);

type PeriodoAnalytics = z.infer<typeof periodoSchema>;

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

function obterCredenciais() {
  const propertyId =
    process.env.GA4_PROPERTY_ID?.trim();

  const clientEmail =
    process.env.GA4_CLIENT_EMAIL?.trim();

  const privateKeyRaw =
    process.env.GA4_PRIVATE_KEY;

  if (!propertyId) {
    throw new Error(
      "GA4_PROPERTY_ID não está configurado.",
    );
  }

  if (!clientEmail) {
    throw new Error(
      "GA4_CLIENT_EMAIL não está configurado.",
    );
  }

  if (!privateKeyRaw) {
    throw new Error(
      "GA4_PRIVATE_KEY não está configurado.",
    );
  }

  const privateKey = privateKeyRaw
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n");

  return {
    propertyId,
    clientEmail,
    privateKey,
  };
}

function criarCliente() {
  const {
    clientEmail,
    privateKey,
  } = obterCredenciais();

  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
}

function configuracaoPeriodo(
  periodo: PeriodoAnalytics,
) {
  switch (periodo) {
    case "24h":
      return {
        startDate: "1daysAgo",
        endDate: "today",
        dimension: "dateHour",
      };

    case "7d":
      return {
        startDate: "7daysAgo",
        endDate: "today",
        dimension: "date",
      };

    case "30d":
      return {
        startDate: "30daysAgo",
        endDate: "today",
        dimension: "date",
      };

    case "90d":
      return {
        startDate: "90daysAgo",
        endDate: "today",
        dimension: "date",
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
    Number(value ?? 0);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function formatarLabelGrafico(
  chave: string,
  periodo: PeriodoAnalytics,
) {
  if (periodo === "24h") {
    const hora =
      chave.slice(-2);

    return `${hora}h`;
  }

  if (chave.length !== 8) {
    return chave;
  }

  const dia =
    chave.slice(6, 8);

  const mes =
    chave.slice(4, 6);

  return `${dia}/${mes}`;
}

function limitar24Horas(
  linhas: LinhaGrafico[],
) {
  return [...linhas]
    .sort((a, b) =>
      a.chave.localeCompare(b.chave),
    )
    .slice(-24);
}

export const obterAnalytics =
  createServerFn({
    method: "GET",
  })
    .middleware([
      requireSupabaseAuth,
    ])
    .inputValidator(
      (data: unknown) =>
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
        } = obterCredenciais();

        const client =
          criarCliente();

        const periodo =
          data.periodo;

        const config =
          configuracaoPeriodo(
            periodo,
          );

        const property =
          `properties/${propertyId}`;

        const [
          totaisResponse,
          graficoResponse,
          paginasResponse,
          paisesResponse,
          dispositivosResponse,
        ] = await Promise.all([
          client.runReport({
            property,

            dateRanges: [
              {
                startDate:
                  config.startDate,
                endDate:
                  config.endDate,
              },
            ],

            metrics: [
              {
                name: "sessions",
              },
              {
                name: "totalUsers",
              },
              {
                name: "screenPageViews",
              },
              {
                name: "averageSessionDuration",
              },
            ],
          }),

          client.runReport({
            property,

            dateRanges: [
              {
                startDate:
                  config.startDate,
                endDate:
                  config.endDate,
              },
            ],

            dimensions: [
              {
                name:
                  config.dimension,
              },
            ],

            metrics: [
              {
                name: "sessions",
              },
              {
                name: "totalUsers",
              },
              {
                name: "screenPageViews",
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
              periodo === "24h"
                ? 100
                : 200,
          }),

          client.runReport({
            property,

            dateRanges: [
              {
                startDate:
                  config.startDate,
                endDate:
                  config.endDate,
              },
            ],

            dimensions: [
              {
                name: "pagePath",
              },
              {
                name: "pageTitle",
              },
            ],

            metrics: [
              {
                name: "screenPageViews",
              },
              {
                name: "totalUsers",
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

            limit: 8,
          }),

          client.runReport({
            property,

            dateRanges: [
              {
                startDate:
                  config.startDate,
                endDate:
                  config.endDate,
              },
            ],

            dimensions: [
              {
                name: "country",
              },
              {
                name: "countryId",
              },
            ],

            metrics: [
              {
                name: "totalUsers",
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

            limit: 8,
          }),

          client.runReport({
            property,

            dateRanges: [
              {
                startDate:
                  config.startDate,
                endDate:
                  config.endDate,
              },
            ],

            dimensions: [
              {
                name:
                  "deviceCategory",
              },
            ],

            metrics: [
              {
                name: "totalUsers",
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

            limit: 10,
          }),
        ]);

        const totaisRow =
          totaisResponse[0]
            .rows?.[0];

        const totais = {
          visitas: numero(
            totaisRow
              ?.metricValues?.[0]
              ?.value,
          ),

          utilizadores: numero(
            totaisRow
              ?.metricValues?.[1]
              ?.value,
          ),

          pageviews: numero(
            totaisRow
              ?.metricValues?.[2]
              ?.value,
          ),

          duracaoMedia: numero(
            totaisRow
              ?.metricValues?.[3]
              ?.value,
          ),
        };

        let grafico: LinhaGrafico[] =
          (
            graficoResponse[0]
              .rows ?? []
          ).map((row) => {
            const chave =
              row.dimensionValues?.[0]
                ?.value ?? "";

            return {
              chave,

              label:
                formatarLabelGrafico(
                  chave,
                  periodo,
                ),

              visitas: numero(
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

              pageviews: numero(
                row
                  .metricValues?.[2]
                  ?.value,
              ),
            };
          });

        if (
          periodo === "24h"
        ) {
          grafico =
            limitar24Horas(
              grafico,
            );
        }

        const paginas: PaginaAnalytics[] =
          (
            paginasResponse[0]
              .rows ?? []
          ).map((row) => ({
            path:
              row.dimensionValues?.[0]
                ?.value ?? "/",

            titulo:
              row.dimensionValues?.[1]
                ?.value ??
              "Sem título",

            pageviews: numero(
              row
                .metricValues?.[0]
                ?.value,
            ),

            utilizadores: numero(
              row
                .metricValues?.[1]
                ?.value,
            ),
          }));

        const paises: PaisAnalytics[] =
          (
            paisesResponse[0]
              .rows ?? []
          ).map((row) => ({
            pais:
              row.dimensionValues?.[0]
                ?.value ??
              "Desconhecido",

            codigo:
              (
                row
                  .dimensionValues?.[1]
                  ?.value ?? ""
              ).toUpperCase(),

            utilizadores: numero(
              row
                .metricValues?.[0]
                ?.value,
            ),
          }));

        const dispositivos: DispositivoAnalytics[] =
          (
            dispositivosResponse[0]
              .rows ?? []
          ).map((row) => ({
            dispositivo:
              row.dimensionValues?.[0]
                ?.value ??
              "unknown",

            utilizadores: numero(
              row
                .metricValues?.[0]
                ?.value,
            ),
          }));

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
