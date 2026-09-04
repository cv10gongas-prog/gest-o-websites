import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Clock3,
  Eye,
  Globe2,
  Laptop,
  MonitorSmartphone,
  MousePointerClick,
  RefreshCw,
  Smartphone,
  Tablet,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";

import {
  obterAnalytics,
  type AnalyticsResumo,
} from "@/lib/analytics.functions";

type PeriodoAnalytics =
  | "24h"
  | "7d"
  | "30d"
  | "90d";

function formatarNumero(
  value: number,
) {
  return new Intl.NumberFormat(
    "pt-PT",
  ).format(value);
}

function formatarDuracao(
  segundos: number,
) {
  if (!segundos) {
    return "0s";
  }

  if (segundos < 60) {
    return `${Math.round(
      segundos,
    )}s`;
  }

  const minutos =
    Math.floor(segundos / 60);

  const resto =
    Math.round(segundos % 60);

  return `${minutos}m ${resto}s`;
}

function bandeira(
  codigo: string,
) {
  const code =
    codigo
      .trim()
      .toUpperCase();

  if (
    !/^[A-Z]{2}$/.test(code)
  ) {
    return "🌍";
  }

  return String.fromCodePoint(
    ...[...code].map(
      (char) =>
        127397 +
        char.charCodeAt(0),
    ),
  );
}

function nomeDispositivo(
  value: string,
) {
  switch (
    value.toLowerCase()
  ) {
    case "desktop":
      return "Desktop";

    case "mobile":
      return "Telemóvel";

    case "tablet":
      return "Tablet";

    default:
      return value || "Outro";
  }
}

function iconeDispositivo(
  value: string,
) {
  switch (
    value.toLowerCase()
  ) {
    case "desktop":
      return Laptop;

    case "mobile":
      return Smartphone;

    case "tablet":
      return Tablet;

    default:
      return MonitorSmartphone;
  }
}

function AnalyticsCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/65 bg-card/30 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card/45">
      <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-primary/[0.06] blur-3xl transition duration-500 group-hover:scale-125" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-medium uppercase tracking-[.12em] text-muted-foreground">
            {label}
          </p>

          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/[0.07] text-primary">
            <Icon className="size-4" />
          </span>
        </div>

        <p className="mt-5 text-[27px] font-semibold leading-none tracking-[-.045em]">
          {value}
        </p>

        <p className="mt-2 text-[10px] text-muted-foreground">
          {detail}
        </p>
      </div>
    </article>
  );
}

function TooltipGrafico({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    dataKey?: string;
  }>;
  label?: string;
}) {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  return (
    <div className="min-w-[150px] rounded-xl border border-border/70 bg-background/95 p-3 shadow-xl backdrop-blur-xl">
      <p className="text-[10px] font-medium text-foreground">
        {label}
      </p>

      <div className="mt-2 space-y-1.5">
        {payload.map(
          (item) => (
            <div
              key={
                item.dataKey
              }
              className="flex items-center justify-between gap-5 text-[9px]"
            >
              <span className="text-muted-foreground">
                {item.name}
              </span>

              <span className="font-medium text-foreground">
                {formatarNumero(
                  Number(
                    item.value ??
                      0,
                  ),
                )}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function LoadingAnalytics() {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center rounded-3xl border border-border/60 bg-card/20">
      <span className="grid size-12 place-items-center rounded-2xl border border-primary/15 bg-primary/[0.06] text-primary">
        <RefreshCw className="size-5 animate-spin" />
      </span>

      <p className="mt-4 text-xs font-medium">
        A carregar Analytics…
      </p>

      <p className="mt-1 text-[10px] text-muted-foreground">
        A obter dados do Google
        Analytics.
      </p>
    </div>
  );
}

function ErroAnalytics({
  mensagem,
  onRetry,
}: {
  mensagem: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-destructive/20 bg-destructive/[0.025] px-6 text-center">
      <span className="grid size-12 place-items-center rounded-2xl border border-destructive/20 bg-destructive/[0.07] text-destructive">
        <Activity className="size-5" />
      </span>

      <h2 className="mt-4 text-sm font-semibold">
        Não foi possível carregar
        o Analytics
      </h2>

      <p className="mt-2 max-w-md text-[10px] leading-5 text-muted-foreground">
        {mensagem}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl border border-border/70 bg-background/40 px-4 text-[10px] font-medium transition hover:border-primary/25 hover:text-primary"
      >
        <RefreshCw className="size-3.5" />
        Tentar novamente
      </button>
    </div>
  );
}

function ConteudoAnalytics({
  analytics,
}: {
  analytics: AnalyticsResumo;
}) {
  const totalPais =
    analytics.paises.reduce(
      (total, pais) =>
        total +
        pais.utilizadores,
      0,
    );

  const totalDispositivos =
    analytics.dispositivos.reduce(
      (total, item) =>
        total +
        item.utilizadores,
      0,
    );

  return (
    <>
      {/* MÉTRICAS */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard
          icon={MousePointerClick}
          label="Visitas"
          value={formatarNumero(
            analytics.totais
              .visitas,
          )}
          detail="Sessões registadas"
        />

        <AnalyticsCard
          icon={Users}
          label="Visitantes"
          value={formatarNumero(
            analytics.totais
              .utilizadores,
          )}
          detail="Utilizadores únicos"
        />

        <AnalyticsCard
          icon={Eye}
          label="Páginas vistas"
          value={formatarNumero(
            analytics.totais
              .pageviews,
          )}
          detail="Visualizações de páginas"
        />

        <AnalyticsCard
          icon={Clock3}
          label="Duração média"
          value={formatarDuracao(
            analytics.totais
              .duracaoMedia,
          )}
          detail="Tempo médio por sessão"
        />
      </div>

      {/* GRÁFICO */}
      <div className="mt-4 overflow-hidden rounded-3xl border border-border/65 bg-card/25">
        <div className="flex flex-col gap-3 border-b border-border/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Activity className="size-3.5" />
              </span>

              <div>
                <h2 className="text-sm font-semibold">
                  Evolução das visitas
                </h2>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Visitas, visitantes
                  e páginas vistas ao
                  longo do período.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-cyan-300" />
              Visitas
            </span>

            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-violet-300" />
              Visitantes
            </span>
          </div>
        </div>

        <div className="h-[320px] w-full px-2 py-5 sm:px-5">
          {analytics.grafico
            .length === 0 ? (
            <div className="grid h-full place-items-center text-[11px] text-muted-foreground">
              Ainda não existem dados
              suficientes neste
              período.
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={
                  analytics.grafico
                }
                margin={{
                  top: 5,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(148,163,184,.10)"
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill:
                      "rgba(148,163,184,.65)",
                    fontSize: 9,
                  }}
                  minTickGap={20}
                />

                <YAxis
                  allowDecimals={
                    false
                  }
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill:
                      "rgba(148,163,184,.55)",
                    fontSize: 9,
                  }}
                />

                <Tooltip
                  content={
                    <TooltipGrafico />
                  }
                  cursor={{
                    stroke:
                      "rgba(148,163,184,.15)",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="visitas"
                  name="Visitas"
                  stroke="#67e8f9"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="utilizadores"
                  name="Visitantes"
                  stroke="#c4b5fd"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* LISTAS */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_.8fr_.8fr]">
        {/* PÁGINAS */}
        <div className="overflow-hidden rounded-3xl border border-border/65 bg-card/25">
          <div className="border-b border-border/50 px-5 py-4">
            <h2 className="text-sm font-semibold">
              Páginas mais vistas
            </h2>

            <p className="mt-1 text-[10px] text-muted-foreground">
              Conteúdo com mais
              visualizações.
            </p>
          </div>

          {analytics.paginas
            .length === 0 ? (
            <div className="grid min-h-[260px] place-items-center px-5 text-center text-[10px] text-muted-foreground">
              Sem páginas registadas
              neste período.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {analytics.paginas.map(
                (
                  pagina,
                  index,
                ) => (
                  <div
                    key={`${pagina.path}-${index}`}
                    className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-background/20"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-border/60 bg-background/30 text-[9px] font-semibold text-muted-foreground">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium">
                        {pagina.path}
                      </p>

                      <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
                        {
                          pagina.titulo
                        }
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-semibold">
                        {formatarNumero(
                          pagina.pageviews,
                        )}
                      </p>

                      <p className="mt-0.5 text-[8px] text-muted-foreground">
                        visualizações
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* PAÍSES */}
        <div className="overflow-hidden rounded-3xl border border-border/65 bg-card/25">
          <div className="border-b border-border/50 px-5 py-4">
            <div className="flex items-center gap-2">
              <Globe2 className="size-4 text-primary" />

              <h2 className="text-sm font-semibold">
                Países
              </h2>
            </div>

            <p className="mt-1 text-[10px] text-muted-foreground">
              Origem aproximada dos
              visitantes.
            </p>
          </div>

          {analytics.paises
            .length === 0 ? (
            <div className="grid min-h-[260px] place-items-center px-5 text-center text-[10px] text-muted-foreground">
              Sem países registados.
            </div>
          ) : (
            <div className="space-y-4 p-5">
              {analytics.paises.map(
                (
                  pais,
                  index,
                ) => {
                  const percentagem =
                    totalPais > 0
                      ? Math.round(
                          (pais.utilizadores /
                            totalPais) *
                            100,
                        )
                      : 0;

                  return (
                    <div
                      key={`${pais.codigo}-${index}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="text-base">
                            {bandeira(
                              pais.codigo,
                            )}
                          </span>

                          <span className="truncate text-[10px] font-medium">
                            {
                              pais.pais
                            }
                          </span>
                        </div>

                        <span className="shrink-0 text-[9px] text-muted-foreground">
                          {
                            percentagem
                          }
                          %
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{
                            width: `${Math.max(
                              percentagem,
                              2,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>

        {/* DISPOSITIVOS */}
        <div className="overflow-hidden rounded-3xl border border-border/65 bg-card/25">
          <div className="border-b border-border/50 px-5 py-4">
            <div className="flex items-center gap-2">
              <MonitorSmartphone className="size-4 text-primary" />

              <h2 className="text-sm font-semibold">
                Dispositivos
              </h2>
            </div>

            <p className="mt-1 text-[10px] text-muted-foreground">
              Como as pessoas acedem
              ao site.
            </p>
          </div>

          {analytics.dispositivos
            .length === 0 ? (
            <div className="grid min-h-[260px] place-items-center px-5 text-center text-[10px] text-muted-foreground">
              Sem dispositivos
              registados.
            </div>
          ) : (
            <div className="space-y-3 p-5">
              {analytics.dispositivos.map(
                (
                  dispositivo,
                  index,
                ) => {
                  const Icon =
                    iconeDispositivo(
                      dispositivo.dispositivo,
                    );

                  const percentagem =
                    totalDispositivos >
                    0
                      ? Math.round(
                          (dispositivo.utilizadores /
                            totalDispositivos) *
                            100,
                        )
                      : 0;

                  return (
                    <div
                      key={`${dispositivo.dispositivo}-${index}`}
                      className="rounded-xl border border-border/50 bg-background/20 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 place-items-center rounded-lg bg-primary/[0.07] text-primary">
                          <Icon className="size-3.5" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[10px] font-medium">
                              {nomeDispositivo(
                                dispositivo.dispositivo,
                              )}
                            </p>

                            <span className="text-[9px] font-semibold">
                              {
                                percentagem
                              }
                              %
                            </span>
                          </div>

                          <p className="mt-1 text-[8px] text-muted-foreground">
                            {formatarNumero(
                              dispositivo.utilizadores,
                            )}{" "}
                            utilizadores
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function AnalyticsPainel() {
  const [
    periodo,
    setPeriodo,
  ] =
    useState<PeriodoAnalytics>(
      "7d",
    );

  const analyticsQuery =
    useQuery({
      queryKey: [
        "ga4-analytics",
        periodo,
      ],

      queryFn: () =>
        obterAnalytics({
          data: {
            periodo,
          },
        }),

      staleTime:
        5 * 60 * 1000,

      retry: 1,
    });

  return (
    <section>
      {/* CABEÇALHO */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/20 px-5 py-5 sm:px-7">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/[0.07] blur-3xl" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
            backgroundSize:
              "42px 42px",
          }}
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-primary">
              <Activity className="size-3.5" />

              Google Analytics
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-[-.035em]">
              Analytics do website
            </h1>

            <p className="mt-1.5 max-w-2xl text-xs leading-6 text-muted-foreground">
              Visitas, utilizadores,
              páginas, países e
              dispositivos diretamente
              no Nova Web CRM.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                "24h",
                "7d",
                "30d",
                "90d",
              ] as PeriodoAnalytics[]
            ).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setPeriodo(
                      item,
                    )
                  }
                  className={`h-8 rounded-lg border px-3 text-[10px] font-medium transition ${
                    periodo ===
                    item
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border/60 bg-background/30 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() =>
                analyticsQuery.refetch()
              }
              disabled={
                analyticsQuery.isFetching
              }
              className="grid size-8 place-items-center rounded-lg border border-border/60 bg-background/30 text-muted-foreground transition hover:border-primary/25 hover:text-primary disabled:opacity-50"
              aria-label="Atualizar Analytics"
              title="Atualizar dados"
            >
              <RefreshCw
                className={`size-3.5 ${
                  analyticsQuery.isFetching
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {analyticsQuery.isLoading ? (
          <LoadingAnalytics />
        ) : analyticsQuery.error ? (
          <ErroAnalytics
            mensagem={
              analyticsQuery
                .error instanceof Error
                ? analyticsQuery
                    .error.message
                : "Erro desconhecido ao carregar o Google Analytics."
            }
            onRetry={() =>
              analyticsQuery.refetch()
            }
          />
        ) : analyticsQuery.data ? (
          <ConteudoAnalytics
            analytics={
              analyticsQuery.data
            }
          />
        ) : (
          <ErroAnalytics
            mensagem="O Google Analytics não devolveu dados."
            onRetry={() =>
              analyticsQuery.refetch()
            }
          />
        )}
      </div>
    </section>
  );
}
