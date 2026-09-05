import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Globe2,
  Laptop,
  LogOut,
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
import { useQuery } from "@tanstack/react-query";
import {
  useMemo,
  useState,
} from "react";

import {
  useActivity,
  useProfiles,
} from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

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
  tipo?: string | null;
  user_agent?: string | null;
};

type EstadoAcesso =
  | "primeiro"
  | "conhecido"
  | "ip_novo"
  | "pais_novo";

type EventoLogin = {
  id: string;
  created_at: string;
  autor: string | null;
  seguranca: DetalheSeguranca;
  tipo: "login";
  estadoAcesso: EstadoAcesso;
};

type EventoLogout = {
  id: string;
  created_at: string;
  autor: string | null;
  seguranca: DetalheSeguranca;
  tipo: "logout";
};

type EventoFalha = {
  id: string;
  created_at: string;
  autor: null;
  seguranca: {
    ip: string | null;
    pais: string | null;
    cidade: string | null;
    email: string | null;
    user_agent: string | null;
  };
  tipo: "falha";
  motivo: string | null;
};

type EventoSeguranca =
  | EventoLogin
  | EventoLogout
  | EventoFalha;

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
      nome: "iPhone",
      Icon: Smartphone,
    };
  }

  if (
    /Android/i.test(
      userAgent,
    )
  ) {
    return {
      nome: "Android",
      Icon: Smartphone,
    };
  }

  if (
    /iPad/i.test(
      userAgent,
    )
  ) {
    return {
      nome: "iPad",
      Icon: Smartphone,
    };
  }

  if (
    /Windows/i.test(
      userAgent,
    )
  ) {
    return {
      nome: "Windows",
      Icon: Laptop,
    };
  }

  if (
    /Macintosh|Mac OS/i.test(
      userAgent,
    )
  ) {
    return {
      nome: "Mac",
      Icon: Laptop,
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
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
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
    periodo === "24h"
      ? 24
      : periodo === "7d"
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
  switch (estado) {
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
        "security-login-attempts",
      ],

      queryFn:
        async () => {
          const {
            data,
            error,
          } =
            await supabase
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
                200,
              );

          if (error) {
            throw error;
          }

          return (
            data ??
            []
          );
        },

      refetchInterval:
        15000,
    });

  const eventosBase =
    useMemo(() => {
      return atividades
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
          ) => {
            const seguranca =
              interpretarDetalhe(
                atividade.detalhe,
              );

            const logout =
              atividade.accao ===
                "terminou sessão" ||
              seguranca.tipo ===
                "logout";

            return {
              id:
                atividade.id,

              created_at:
                atividade.created_at,

              autor:
                atividade.autor,

              seguranca,

              tipo:
                logout
                  ? "logout"
                  : "login",
            };
          },
        );
    }, [
      atividades,
    ]);

  const loginsProcessados =
    useMemo(() => {
      const logins =
        eventosBase.filter(
          (
            evento,
          ) =>
            evento.tipo ===
            "login",
        );

      const cronologico =
        [
          ...logins,
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

      const resultado:
        EventoLogin[] =
        [];

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

        resultado.push({
          id:
            login.id,

          created_at:
            login.created_at,

          autor:
            login.autor,

          seguranca:
            login.seguranca,

          tipo:
            "login",

          estadoAcesso:
            estado,
        });
      }

      return resultado;
    }, [
      eventosBase,
    ]);

  const logouts =
    useMemo(
      () =>
        eventosBase
          .filter(
            (
              evento,
            ) =>
              evento.tipo ===
              "logout",
          )
          .map(
            (
              evento,
            ): EventoLogout => ({
              id:
                evento.id,

              created_at:
                evento.created_at,

              autor:
                evento.autor,

              seguranca:
                evento.seguranca,

              tipo:
                "logout",
            }),
          ),

      [
        eventosBase,
      ],
    );

  const falhas:
    EventoFalha[] =
    useMemo(
      () =>
        falhasTodas.map(
          (
            falha,
          ) => ({
            id:
              falha.id,

            created_at:
              falha.created_at,

            autor:
              null,

            seguranca: {
              ip:
                falha.ip,

              pais:
                falha.pais,

              cidade:
                falha.cidade,

              email:
                falha.email,

              user_agent:
                falha.user_agent,
            },

            tipo:
              "falha",

            motivo:
              falha.motivo,
          }),
        ),

      [
        falhasTodas,
      ],
    );

  const eventos =
    useMemo(
      () =>
        [
          ...loginsProcessados,
          ...logouts,
          ...falhas,
        ]
          .filter(
            (
              evento,
            ) =>
              dentroPeriodo(
                evento.created_at,
                periodo,
              ),
          )
          .sort(
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
        loginsProcessados,
        logouts,
        falhas,
        periodo,
      ],
    );

  const loginsPeriodo =
    eventos.filter(
      (
        evento,
      ) =>
        evento.tipo ===
        "login",
    ) as EventoLogin[];

  const logoutsPeriodo =
    eventos.filter(
      (
        evento,
      ) =>
        evento.tipo ===
        "logout",
    ) as EventoLogout[];

  const falhasPeriodo =
    eventos.filter(
      (
        evento,
      ) =>
        evento.tipo ===
        "falha",
    ) as EventoFalha[];

  const ipsUnicos =
    new Set(
      loginsPeriodo
        .map(
          (
            item,
          ) =>
            item
              .seguranca
              .ip,
        )
        .filter(
          Boolean,
        ),
    ).size;

  const paisesUnicos =
    new Set(
      loginsPeriodo
        .map(
          (
            item,
          ) =>
            item
              .seguranca
              .pais,
        )
        .filter(
          Boolean,
        ),
    ).size;

  const utilizadoresUnicos =
    new Set(
      loginsPeriodo
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
    loginsPeriodo.filter(
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
        of falhasPeriodo
      ) {
        const ip =
          falha
            .seguranca
            .ip;

        if (!ip) {
          continue;
        }

        mapa.set(
          ip,
          (
            mapa.get(
              ip,
            ) ??
            0
          ) +
            1,
        );
      }

      return mapa;
    }, [
      falhasPeriodo,
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
              Histórico de logins, logouts e tentativas
              falhadas de acesso ao CRM.
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        <article className="rounded-2xl border border-border/65 bg-card/30 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Logins
            </p>

            <span className="grid size-8 place-items-center rounded-lg border border-emerald-400/15 bg-emerald-400/10 text-emerald-300">
              <CheckCircle2 className="size-3.5" />
            </span>
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-[-.04em]">
            {loginsPeriodo.length}
          </p>

          <p className="mt-1 text-[9px] text-muted-foreground">
            acessos autorizados
          </p>
        </article>

        <article className="rounded-2xl border border-border/65 bg-card/30 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Logouts
            </p>

            <span className="grid size-8 place-items-center rounded-lg border border-slate-400/15 bg-slate-400/10 text-slate-300">
              <LogOut className="size-3.5" />
            </span>
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-[-.04em]">
            {logoutsPeriodo.length}
          </p>

          <p className="mt-1 text-[9px] text-muted-foreground">
            sessões terminadas
          </p>
        </article>

        <article
          className={`rounded-2xl border p-4 ${
            falhasPeriodo.length >
            0
              ? "border-red-400/20 bg-red-400/[0.035]"
              : "border-border/65 bg-card/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Falhas
            </p>

            <span className="grid size-8 place-items-center rounded-lg border border-red-400/20 bg-red-400/10 text-red-300">
              <XCircle className="size-3.5" />
            </span>
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-[-.04em]">
            {falhasPeriodo.length}
          </p>

          <p className="mt-1 text-[9px] text-muted-foreground">
            tentativas rejeitadas
          </p>
        </article>

        <article className="rounded-2xl border border-border/65 bg-card/30 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              IPs
            </p>

            <span className="grid size-8 place-items-center rounded-lg border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
              <Wifi className="size-3.5" />
            </span>
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-[-.04em]">
            {ipsUnicos}
          </p>

          <p className="mt-1 text-[9px] text-muted-foreground">
            redes utilizadas
          </p>
        </article>

        <article className="rounded-2xl border border-border/65 bg-card/30 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Países
            </p>

            <span className="grid size-8 place-items-center rounded-lg border border-violet-400/15 bg-violet-400/10 text-violet-300">
              <Globe2 className="size-3.5" />
            </span>
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-[-.04em]">
            {paisesUnicos}
          </p>

          <p className="mt-1 text-[9px] text-muted-foreground">
            origens diferentes
          </p>
        </article>

        <article className="rounded-2xl border border-border/65 bg-card/30 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Novos acessos
            </p>

            <span className="grid size-8 place-items-center rounded-lg border border-amber-400/15 bg-amber-400/10 text-amber-300">
              <ShieldAlert className="size-3.5" />
            </span>
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-[-.04em]">
            {novosAcessos}
          </p>

          <p className="mt-1 text-[9px] text-muted-foreground">
            IP ou país novo
          </p>
        </article>

        <article className="rounded-2xl border border-border/65 bg-card/30 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Utilizadores
            </p>

            <span className="grid size-8 place-items-center rounded-lg border border-amber-400/15 bg-amber-400/10 text-amber-300">
              <UserRound className="size-3.5" />
            </span>
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-[-.04em]">
            {utilizadoresUnicos}
          </p>

          <p className="mt-1 text-[9px] text-muted-foreground">
            membros autenticados
          </p>
        </article>
      </div>

      {falhasErro && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.04] px-3 py-2.5 text-[10px] leading-5 text-red-200">
          <XCircle className="mt-0.5 size-3.5 shrink-0" />

          <span>
            Não foi possível carregar as tentativas
            falhadas. Confirma que a migration do Lovable
            ficou aplicada e que a policy SELECT permite
            acesso à equipa autenticada.
          </span>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-3xl border border-border/65 bg-card/25">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">
              Histórico de segurança
            </h2>

            <p className="mt-0.5 text-[9px] text-muted-foreground">
              Logins, logouts e tentativas rejeitadas
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
            <span className="grid size-12 place-items-center rounded-2xl border border-border/60 bg-background/40 text-muted-foreground">
              <ShieldCheck className="size-5" />
            </span>

            <p className="mt-4 text-sm font-medium">
              Sem eventos neste período
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/45">
            {eventos.map(
              (
                item,
              ) => {
                const info =
                  item.seguranca;

                const {
                  nome:
                    dispositivo,

                  Icon:
                    DispositivoIcon,
                } =
                  dispositivoPorUserAgent(
                    info.user_agent,
                  );

                const browser =
                  browserPorUserAgent(
                    info.user_agent,
                  );

                if (
                  item.tipo ===
                  "falha"
                ) {
                  const repeticoes =
                    info.ip
                      ? falhasPorIp.get(
                          info.ip,
                        ) ??
                        0
                      : 0;

                  return (
                    <article
                      key={
                        item.id
                      }
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
                                {info.email ??
                                  "Email desconhecido"}
                              </p>

                              <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2 py-0.5 text-[8px] font-semibold text-red-300">
                                Login falhado
                              </span>

                              {repeticoes >=
                                3 && (
                                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[8px] font-semibold text-amber-300">
                                  {repeticoes} tentativas deste IP
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-[9px] text-muted-foreground/70">
                              {item.motivo ??
                                "Credenciais rejeitadas"}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                          <div className="min-w-[120px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                              <Wifi className="size-3" />
                              IP
                            </div>

                            <p className="mt-1.5 font-mono text-[10px]">
                              {info.ip ??
                                "Desconhecido"}
                            </p>
                          </div>

                          <div className="min-w-[125px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                              <Globe2 className="size-3" />
                              País
                            </div>

                            <p className="mt-1.5 text-[10px]">
                              {bandeiraPais(
                                info.pais,
                              )}{" "}
                              {info.pais ??
                                "Desconhecido"}
                            </p>
                          </div>

                          <div className="min-w-[125px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                              <MapPin className="size-3" />
                              Cidade
                            </div>

                            <p className="mt-1.5 truncate text-[10px]">
                              {info.cidade ??
                                "Desconhecida"}
                            </p>
                          </div>

                          <div className="min-w-[145px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                              <DispositivoIcon className="size-3" />
                              Dispositivo
                            </div>

                            <p className="mt-1.5 text-[10px]">
                              {dispositivo}
                            </p>

                            <p className="mt-0.5 text-[8px] text-muted-foreground">
                              {browser}
                            </p>
                          </div>

                          <div className="min-w-[135px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                              <Clock3 className="size-3" />
                              Data
                            </div>

                            <p className="mt-1.5 text-[10px]">
                              {formatarDataHora(
                                item.created_at,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }

                if (
                  item.tipo ===
                  "logout"
                ) {
                  return (
                    <article
                      key={
                        item.id
                      }
                      className="p-4 transition hover:bg-background/20 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-400/15 bg-slate-400/10 text-slate-300">
                            <LogOut className="size-4" />
                          </span>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs font-semibold">
                                {nomeUtilizador(
                                  item.autor,
                                  info.email,
                                )}
                              </p>

                              <span className="rounded-full border border-slate-400/15 bg-slate-400/[0.07] px-2 py-0.5 text-[8px] font-semibold text-slate-300">
                                Logout
                              </span>
                            </div>

                            <p className="mt-1 truncate text-[10px] text-muted-foreground">
                              {info.email ??
                                "Email indisponível"}
                            </p>

                            <p className="mt-1 text-[9px] text-muted-foreground/70">
                              Sessão terminada pelo utilizador
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                          <div className="min-w-[120px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                              <Wifi className="size-3" />
                              IP
                            </div>

                            <p className="mt-1.5 font-mono text-[10px]">
                              {info.ip ??
                                "Desconhecido"}
                            </p>
                          </div>

                          <div className="min-w-[125px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                              <Globe2 className="size-3" />
                              País
                            </div>

                            <p className="mt-1.5 text-[10px]">
                              {bandeiraPais(
                                info.pais,
                              )}{" "}
                              {info.pais ??
                                "Desconhecido"}
                            </p>
                          </div>

                          <div className="min-w-[125px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                              <MapPin className="size-3" />
                              Cidade
                            </div>

                            <p className="mt-1.5 truncate text-[10px]">
                              {info.cidade ??
                                "Desconhecida"}
                            </p>
                          </div>

                          <div className="min-w-[145px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                              <DispositivoIcon className="size-3" />
                              Dispositivo
                            </div>

                            <p className="mt-1.5 text-[10px]">
                              {dispositivo}
                            </p>

                            <p className="mt-0.5 text-[8px] text-muted-foreground">
                              {browser}
                            </p>
                          </div>

                          <div className="min-w-[135px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                              <Clock3 className="size-3" />
                              Data
                            </div>

                            <p className="mt-1.5 text-[10px]">
                              {formatarDataHora(
                                item.created_at,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }

                const estado =
                  estiloEstado(
                    item.estadoAcesso,
                  );

                const EstadoIcon =
                  estado.Icon;

                return (
                  <article
                    key={
                      item.id
                    }
                    className={`p-4 transition sm:p-5 ${
                      item.estadoAcesso ===
                      "pais_novo"
                        ? "bg-red-400/[0.018] hover:bg-red-400/[0.03]"
                        : item.estadoAcesso ===
                            "ip_novo"
                          ? "bg-amber-400/[0.012] hover:bg-amber-400/[0.025]"
                          : "hover:bg-background/20"
                    }`}
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
                                item.autor,
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
                        <div className="min-w-[120px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                          <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                            <Wifi className="size-3" />
                            IP
                          </div>

                          <p className="mt-1.5 font-mono text-[10px]">
                            {info.ip ??
                              "Desconhecido"}
                          </p>
                        </div>

                        <div className="min-w-[125px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                          <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                            <Globe2 className="size-3" />
                            País
                          </div>

                          <p className="mt-1.5 text-[10px]">
                            {bandeiraPais(
                              info.pais,
                            )}{" "}
                            {info.pais ??
                              "Desconhecido"}
                          </p>
                        </div>

                        <div className="min-w-[125px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                          <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                            <MapPin className="size-3" />
                            Cidade
                          </div>

                          <p className="mt-1.5 truncate text-[10px]">
                            {info.cidade ??
                              "Desconhecida"}
                          </p>
                        </div>

                        <div className="min-w-[145px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                          <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                            <DispositivoIcon className="size-3" />
                            Dispositivo
                          </div>

                          <p className="mt-1.5 text-[10px]">
                            {dispositivo}
                          </p>

                          <p className="mt-0.5 text-[8px] text-muted-foreground">
                            {browser}
                          </p>
                        </div>

                        <div className="min-w-[135px] rounded-xl border border-border/50 bg-background/25 px-3 py-2.5">
                          <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[.12em] text-muted-foreground">
                            <Clock3 className="size-3" />
                            Data
                          </div>

                          <p className="mt-1.5 text-[10px]">
                            {formatarDataHora(
                              item.created_at,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/10 bg-amber-400/[0.025] px-3 py-2.5 text-[9px] leading-5 text-muted-foreground">
        <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-300" />

        <span>
          Um IP, país novo ou login falhado não significa
          automaticamente uma ameaça. Mudanças de rede,
          VPNs, dados móveis e erros de password também
          podem gerar estes eventos.
        </span>
      </div>
    </section>
  );
}
