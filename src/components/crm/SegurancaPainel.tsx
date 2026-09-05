import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Globe2,
  Laptop,
  MapPin,
  MonitorSmartphone,
  Network,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserRound,
  Wifi,
  XCircle,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import {
  useQuery,
} from "@tanstack/react-query";

import {
  useActivity,
  useProfiles,
} from "@/lib/queries";
import {
  obterTentativasFalhadas,
  type TentativaLoginFalhada,
} from "@/lib/security.functions";

type PeriodoSeguranca =
  | "24h"
  | "7d"
  | "30d"
  | "tudo";

type DetalheSeguranca = {
  ip?: string | null;
  pais?: string | null;
  cidade?: string | null;
  email?: string | null;
  user_id?: string | null;
  sucesso?: boolean;
  user_agent?: string | null;
};

type EstadoAcesso =
  | "primeiro"
  | "conhecido"
  | "ip_novo"
  | "pais_novo";

type LoginProcessado = {
  id: string;
  created_at: string;
  autor: string | null;
  seguranca: DetalheSeguranca;
  estadoAcesso: EstadoAcesso;
};

function interpretarDetalhe(
  value: string | null,
): DetalheSeguranca {
  if (!value) {
    return {};
  }

  try {
    const parsed =
      JSON.parse(value);

    if (
      typeof parsed ===
        "object" &&
      parsed !== null
    ) {
      return parsed;
    }

    return {};
  } catch {
    return {};
  }
}

function bandeiraPais(
  codigo?: string | null,
) {
  if (
    !codigo ||
    codigo.length !== 2
  ) {
    return "🌍";
  }

  return String.fromCodePoint(
    ...codigo
      .toUpperCase()
      .split("")
      .map(
        (letra) =>
          127397 +
          letra.charCodeAt(0),
      ),
  );
}

function browserPorUserAgent(
  userAgent?: string | null,
) {
  if (!userAgent) {
    return "Desconhecido";
  }

  if (
    userAgent.includes(
      "Edg/",
    )
  ) {
    return "Microsoft Edge";
  }

  if (
    userAgent.includes(
      "OPR/",
    )
  ) {
    return "Opera";
  }

  if (
    userAgent.includes(
      "Firefox/",
    )
  ) {
    return "Firefox";
  }

  if (
    userAgent.includes(
      "Chrome/",
    )
  ) {
    return "Google Chrome";
  }

  if (
    userAgent.includes(
      "Safari/",
    )
  ) {
    return "Safari";
  }

  return "Outro browser";
}

function dispositivoPorUserAgent(
  userAgent?: string | null,
) {
  if (!userAgent) {
    return {
      nome:
        "Dispositivo desconhecido",

      Icon:
        MonitorSmartphone,
    };
  }

  if (
    /iPhone/i.test(
      userAgent,
    )
  ) {
    return {
      nome:
        "iPhone",

      Icon:
        Smartphone,
    };
  }

  if (
    /Android/i.test(
      userAgent,
    )
  ) {
    return {
      nome:
        "Android",

      Icon:
        Smartphone,
    };
  }

  if (
    /iPad/i.test(
      userAgent,
    )
  ) {
    return {
      nome:
        "iPad",

      Icon:
        Smartphone,
    };
  }

  if (
    /Windows/i.test(
      userAgent,
    )
  ) {
    return {
      nome:
        "Windows",

      Icon:
        Laptop,
    };
  }

  if (
    /Macintosh|Mac OS/i.test(
      userAgent,
    )
  ) {
    return {
      nome:
        "Mac",

      Icon:
        Laptop,
    };
  }

  return {
    nome:
      "Outro dispositivo",

    Icon:
      MonitorSmartphone,
  };
}

function formatarDataHora(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "pt-PT",
    {
      day:
        "2-digit",

      month:
        "short",

      hour:
        "2-digit",

      minute:
        "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function dentroPeriodo(
  data: string,
  periodo:
    PeriodoSeguranca,
) {
  if (
    periodo ===
    "tudo"
  ) {
    return true;
  }

  const horas =
    periodo ===
    "24h"
      ? 24
      : periodo ===
          "7d"
        ? 24 * 7
        : 24 * 30;

  return (
    Date.now() -
      new Date(
        data,
      ).getTime() <=
    horas *
      60 *
      60 *
      1000
  );
}

function estiloEstado(
  estado:
    EstadoAcesso,
) {
  switch (
    estado
  ) {
    case "pais_novo":
      return {
        label:
          "País novo",

        detalhe:
          "Origem diferente do histórico deste utilizador",

        badge:
          "border-red-400/20 bg-red-400/10 text-red-300",

        icon:
          "border-red-400/20 bg-red-400/10 text-red-300",

        Icon:
          ShieldAlert,
      };

    case "ip_novo":
      return {
        label:
          "Novo IP",

        detalhe:
          "Primeiro acesso através deste endereço IP",

        badge:
          "border-amber-400/20 bg-amber-400/10 text-amber-300",

        icon:
          "border-amber-400/20 bg-amber-400/10 text-amber-300",

        Icon:
          Network,
      };

    case "primeiro":
      return {
        label:
          "Primeiro acesso",

        detalhe:
          "Primeiro login registado deste utilizador",

        badge:
          "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",

        icon:
          "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",

        Icon:
          ShieldCheck,
      };

    default:
      return {
        label:
          "IP conhecido",

        detalhe:
          "Endereço já utilizado anteriormente",

        badge:
          "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300",

        icon:
          "border-emerald-400/15 bg-emerald-400/10 text-emerald-300",

        Icon:
          ShieldCheck,
      };
  }
}

function InfoBox({
  icon: Icon,
  titulo,
  principal,
  secundario,
}: {
  icon:
    typeof Wifi;

  titulo:
    string;

  principal:
    string;

  secundario?:
    string;
}) {
  return (
    <div className="min-w-[125px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
        <Icon className="size-3" />

        {titulo}
      </div>

      <p className="mt-1.5 truncate text-[10px]">
        {principal}
      </p>

      {secundario && (
        <p className="mt-0.5 truncate text-[8px] text-muted-foreground">
          {secundario}
        </p>
      )}
    </div>
  );
}

export function SegurancaPainel() {
  const [
    periodo,
    setPeriodo,
  ] =
    useState<PeriodoSeguranca>(
      "7d",
    );

  const {
    data:
      atividades = [],

    isLoading:
      atividadeLoading,
  } =
    useActivity();

  const {
    data:
      perfis = [],
  } =
    useProfiles();

  const {
    data:
      falhasTodas = [],

    isLoading:
      falhasLoading,

    isError:
      falhasErro,
  } =
    useQuery({
      queryKey: [
        "tentativas-login-falhadas",
      ],

      queryFn:
        async (): Promise<
          TentativaLoginFalhada[]
        > =>
          obterTentativasFalhadas(),

      refetchInterval:
        15000,
    });

  const todosLogins =
    useMemo(() => {
      const base =
        atividades
          .filter(
            (
              atividade,
            ) =>
              atividade.entidade ===
              "seguranca",
          )
          .map(
            (
              atividade,
            ) => ({
              ...atividade,

              seguranca:
                interpretarDetalhe(
                  atividade.detalhe,
                ),
            }),
          );

      const cronologico =
        [
          ...base,
        ].sort(
          (
            a,
            b,
          ) =>
            new Date(
              a.created_at,
            ).getTime() -
            new Date(
              b.created_at,
            ).getTime(),
        );

      const historico =
        new Map<
          string,
          {
            ips:
              Set<string>;

            paises:
              Set<string>;

            quantidade:
              number;
          }
        >();

      const estados =
        new Map<
          string,
          EstadoAcesso
        >();

      for (
        const login
        of cronologico
      ) {
        const utilizador =
          login.autor ??
          login
            .seguranca
            .user_id ??
          login
            .seguranca
            .email ??
          "desconhecido";

        const ip =
          login
            .seguranca
            .ip ??
          "";

        const pais =
          login
            .seguranca
            .pais ??
          "";

        const anterior =
          historico.get(
            utilizador,
          ) ?? {
            ips:
              new Set(),

            paises:
              new Set(),

            quantidade:
              0,
          };

        let estado:
          EstadoAcesso;

        if (
          anterior
            .quantidade ===
          0
        ) {
          estado =
            "primeiro";
        } else if (
          pais &&
          anterior
            .paises
            .size >
            0 &&
          !anterior
            .paises
            .has(
              pais,
            )
        ) {
          estado =
            "pais_novo";
        } else if (
          ip &&
          !anterior
            .ips
            .has(
              ip,
            )
        ) {
          estado =
            "ip_novo";
        } else {
          estado =
            "conhecido";
        }

        estados.set(
          login.id,
          estado,
        );

        if (ip) {
          anterior
            .ips
            .add(
              ip,
            );
        }

        if (pais) {
          anterior
            .paises
            .add(
              pais,
            );
        }

        anterior
          .quantidade +=
          1;

        historico.set(
          utilizador,
          anterior,
        );
      }

      return base.map(
        (
          login,
        ): LoginProcessado => ({
          id:
            login.id,

          created_at:
            login.created_at,

          autor:
            login.autor,

          seguranca:
            login.seguranca,

          estadoAcesso:
            estados.get(
              login.id,
            ) ??
            "conhecido",
        }),
      );
    }, [
      atividades,
    ]);

  const logins =
    useMemo(
      () =>
        todosLogins.filter(
          (
            login,
          ) =>
            dentroPeriodo(
              login.created_at,
              periodo,
            ),
        ),

      [
        todosLogins,
        periodo,
      ],
    );

  const falhas =
    useMemo(
      () =>
        falhasTodas.filter(
          (
            falha,
          ) =>
            dentroPeriodo(
              falha.created_at,
              periodo,
            ),
        ),

      [
        falhasTodas,
        periodo,
      ],
    );

  const eventos =
    useMemo(
      () =>
        [
          ...logins.map(
            (
              login,
            ) => ({
              tipo:
                "sucesso" as const,

              created_at:
                login.created_at,

              login,
            }),
          ),

          ...falhas.map(
            (
              falha,
            ) => ({
              tipo:
                "falha" as const,

              created_at:
                falha.created_at,

              falha,
            }),
          ),
        ].sort(
          (
            a,
            b,
          ) =>
            new Date(
              b.created_at,
            ).getTime() -
            new Date(
              a.created_at,
            ).getTime(),
        ),

      [
        logins,
        falhas,
      ],
    );

  const ipsUnicos =
    new Set(
      [
        ...logins.map(
          (
            item,
          ) =>
            item
              .seguranca
              .ip,
        ),

        ...falhas.map(
          (
            item,
          ) =>
            item.ip,
        ),
      ].filter(
        Boolean,
      ),
    ).size;

  const paisesUnicos =
    new Set(
      [
        ...logins.map(
          (
            item,
          ) =>
            item
              .seguranca
              .pais,
        ),

        ...falhas.map(
          (
            item,
          ) =>
            item.pais,
        ),
      ].filter(
        Boolean,
      ),
    ).size;

  const utilizadoresUnicos =
    new Set(
      logins
        .map(
          (
            item,
          ) =>
            item.autor ??
            item
              .seguranca
              .user_id,
        )
        .filter(
          Boolean,
        ),
    ).size;

  const novosAcessos =
    logins.filter(
      (
        item,
      ) =>
        item.estadoAcesso ===
          "ip_novo" ||
        item.estadoAcesso ===
          "pais_novo",
    ).length;

  const falhasPorIp =
    useMemo(() => {
      const mapa =
        new Map<
          string,
          number
        >();

      for (
        const falha
        of falhas
      ) {
        const ip =
          falha.ip ??
          "desconhecido";

        mapa.set(
          ip,
          (
            mapa.get(
              ip,
            ) ??
            0
          ) + 1,
        );
      }

      return mapa;
    }, [
      falhas,
    ]);

  function nomeUtilizador(
    id:
      string | null,

    email?:
      string | null,
  ) {
    if (id) {
      const perfil =
        perfis.find(
          (
            item,
          ) =>
            item.id ===
            id,
        );

      if (
        perfil?.nome
      ) {
        return perfil.nome;
      }
    }

    return (
      email ??
      "Utilizador"
    );
  }

  const loading =
    atividadeLoading ||
    falhasLoading;

  return (
    <section>
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/20 px-5 py-5 sm:px-7">
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-emerald-400/[0.07] blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-300">
              <ShieldCheck className="size-3.5" />

              Monitorização de acesso
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-[-.035em]">
              Segurança
            </h1>

            <p className="mt-1.5 max-w-2xl text-xs leading-6 text-muted-foreground">
              Logins autorizados, tentativas falhadas,
              novos IPs, localizações e dispositivos
              utilizados no CRM.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                "24h",
                "7d",
                "30d",
                "tudo",
              ] as PeriodoSeguranca[]
            ).map(
              (
                item,
              ) => (
                <button
                  key={
                    item
                  }
                  type="button"
                  onClick={() =>
                    setPeriodo(
                      item,
                    )
                  }
                  className={`h-8 rounded-lg border px-3 text-[10px] font-medium transition ${
                    periodo ===
                    item
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border-border/60 bg-background/30 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                  }`}
                >
                  {item ===
                  "tudo"
                    ? "Tudo"
                    : item.toUpperCase()}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Metric
          titulo="Logins"
          valor={
            logins.length
          }
          detalhe="acessos autorizados"
          Icon={
            CheckCircle2
          }
          classe="text-emerald-300 bg-emerald-400/10 border-emerald-400/15"
        />

        <Metric
          titulo="Falhas"
          valor={
            falhas.length
          }
          detalhe="tentativas rejeitadas"
          Icon={
            XCircle
          }
          classe={
            falhas.length >
            0
              ? "text-red-300 bg-red-400/10 border-red-400/20"
              : "text-muted-foreground bg-background/30 border-border/60"
          }
        />

        <Metric
          titulo="IPs"
          valor={
            ipsUnicos
          }
          detalhe="endereços observados"
          Icon={
            Wifi
          }
          classe="text-cyan-300 bg-cyan-400/10 border-cyan-400/15"
        />

        <Metric
          titulo="Países"
          valor={
            paisesUnicos
          }
          detalhe="origens diferentes"
          Icon={
            Globe2
          }
          classe="text-violet-300 bg-violet-400/10 border-violet-400/15"
        />

        <Metric
          titulo="Novos acessos"
          valor={
            novosAcessos
          }
          detalhe="IP ou país novo"
          Icon={
            ShieldAlert
          }
          classe={
            novosAcessos >
            0
              ? "text-amber-300 bg-amber-400/10 border-amber-400/20"
              : "text-muted-foreground bg-background/30 border-border/60"
          }
        />

        <Metric
          titulo="Utilizadores"
          valor={
            utilizadoresUnicos
          }
          detalhe="membros autenticados"
          Icon={
            UserRound
          }
          classe="text-amber-300 bg-amber-400/10 border-amber-400/15"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-border/65 bg-card/25">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">
              Histórico de segurança
            </h2>

            <p className="mt-0.5 text-[9px] text-muted-foreground">
              Logins autorizados e tentativas rejeitadas
            </p>
          </div>

          <ShieldCheck className="size-4 text-emerald-300" />
        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center text-xs text-muted-foreground">
            A carregar registos de segurança…
          </div>
        ) : eventos.length ===
          0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center">
            <ShieldCheck className="size-6 text-muted-foreground" />

            <p className="mt-4 text-sm font-medium">
              Sem atividade de segurança neste período
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/45">
            {eventos.map(
              (
                evento,
              ) => {
                if (
                  evento.tipo ===
                  "falha"
                ) {
                  const falha =
                    evento.falha;

                  const repeticoes =
                    falhasPorIp.get(
                      falha.ip ??
                        "desconhecido",
                    ) ??
                    1;

                  const {
                    nome:
                      dispositivo,

                    Icon:
                      DispositivoIcon,
                  } =
                    dispositivoPorUserAgent(
                      falha.user_agent,
                    );

                  return (
                    <article
                      key={`falha-${falha.id}`}
                      className="bg-red-400/[0.018] p-4 transition hover:bg-red-400/[0.035] sm:p-5"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-red-400/20 bg-red-400/10 text-red-300">
                            <XCircle className="size-4" />
                          </span>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs font-semibold">
                                {falha.email ||
                                  "Email vazio"}
                              </p>

                              <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2 py-0.5 text-[8px] font-semibold text-red-300">
                                Tentativa falhada
                              </span>

                              {repeticoes >=
                                3 && (
                                <span className="rounded-full border border-red-400/30 bg-red-400/15 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-red-200">
                                  Atenção · {repeticoes} falhas deste IP
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-[9px] text-muted-foreground">
                              {falha.motivo}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                          <InfoBox
                            icon={
                              Wifi
                            }
                            titulo="IP"
                            principal={
                              falha.ip ??
                              "Desconhecido"
                            }
                          />

                          <InfoBox
                            icon={
                              Globe2
                            }
                            titulo="País"
                            principal={`${bandeiraPais(
                              falha.pais,
                            )} ${
                              falha.pais ??
                              "Desconhecido"
                            }`}
                          />

                          <InfoBox
                            icon={
                              MapPin
                            }
                            titulo="Cidade"
                            principal={
                              falha.cidade ??
                              "Desconhecida"
                            }
                          />

                          <InfoBox
                            icon={
                              DispositivoIcon
                            }
                            titulo="Dispositivo"
                            principal={
                              dispositivo
                            }
                            secundario={
                              browserPorUserAgent(
                                falha.user_agent,
                              )
                            }
                          />

                          <InfoBox
                            icon={
                              Clock3
                            }
                            titulo="Data"
                            principal={
                              formatarDataHora(
                                falha.created_at,
                              )
                            }
                          />
                        </div>
                      </div>
                    </article>
                  );
                }

                const login =
                  evento.login;

                const info =
                  login.seguranca;

                const estado =
                  estiloEstado(
                    login.estadoAcesso,
                  );

                const EstadoIcon =
                  estado.Icon;

                const {
                  nome:
                    dispositivo,

                  Icon:
                    DispositivoIcon,
                } =
                  dispositivoPorUserAgent(
                    info.user_agent,
                  );

                return (
                  <article
                    key={`login-${login.id}`}
                    className="p-4 transition hover:bg-background/20 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={`grid size-10 shrink-0 place-items-center rounded-xl border ${estado.icon}`}
                        >
                          <EstadoIcon className="size-4" />
                        </span>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-semibold">
                              {nomeUtilizador(
                                login.autor,
                                info.email,
                              )}
                            </p>

                            <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2 py-0.5 text-[8px] font-semibold text-emerald-300">
                              Login autorizado
                            </span>

                            <span
                              className={`rounded-full border px-2 py-0.5 text-[8px] font-semibold ${estado.badge}`}
                            >
                              {estado.label}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-[10px] text-muted-foreground">
                            {info.email ??
                              "Email indisponível"}
                          </p>

                          <p className="mt-1 text-[9px] text-muted-foreground/70">
                            {estado.detalhe}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                        <InfoBox
                          icon={
                            Wifi
                          }
                          titulo="IP"
                          principal={
                            info.ip ??
                            "Desconhecido"
                          }
                        />

                        <InfoBox
                          icon={
                            Globe2
                          }
                          titulo="País"
                          principal={`${bandeiraPais(
                            info.pais,
                          )} ${
                            info.pais ??
                            "Desconhecido"
                          }`}
                        />

                        <InfoBox
                          icon={
                            MapPin
                          }
                          titulo="Cidade"
                          principal={
                            info.cidade ??
                            "Desconhecida"
                          }
                        />

                        <InfoBox
                          icon={
                            DispositivoIcon
                          }
                          titulo="Dispositivo"
                          principal={
                            dispositivo
                          }
                          secundario={
                            browserPorUserAgent(
                              info.user_agent,
                            )
                          }
                        />

                        <InfoBox
                          icon={
                            Clock3
                          }
                          titulo="Data"
                          principal={
                            formatarDataHora(
                              login.created_at,
                            )
                          }
                        />
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </div>

      {falhasErro && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.035] px-3 py-2.5 text-[9px] leading-5 text-red-200">
          <AlertTriangle className="mt-0.5 size-3 shrink-0" />

          Não foi possível carregar as tentativas falhadas.
          Confirma se a nova migration da base de dados foi aplicada.
        </div>
      )}

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/10 bg-amber-400/[0.025] px-3 py-2.5 text-[9px] leading-5 text-muted-foreground">
        <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-300" />

        Um IP ou país novo não significa automaticamente
        uma ameaça. Redes móveis, VPN e alterações do
        fornecedor de Internet podem mudar o endereço e
        a localização aproximada.
      </div>
    </section>
  );
}

function Metric({
  titulo,
  valor,
  detalhe,
  Icon,
  classe,
}: {
  titulo:
    string;

  valor:
    number;

  detalhe:
    string;

  Icon:
    typeof ShieldCheck;

  classe:
    string;
}) {
  return (
    <article className="rounded-2xl border border-border/65 bg-card/30 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">
          {titulo}
        </p>

        <span
          className={`grid size-8 place-items-center rounded-lg border ${classe}`}
        >
          <Icon className="size-3.5" />
        </span>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-[-.04em]">
        {valor}
      </p>

      <p className="mt-1 text-[9px] text-muted-foreground">
        {detalhe}
      </p>
    </article>
  );
}
