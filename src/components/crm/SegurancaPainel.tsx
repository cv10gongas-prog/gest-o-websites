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
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import {
  useActivity,
  useProfiles,
} from "@/lib/queries";

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

type EventoSeguranca = {
  id: string;
  created_at: string;
  autor: string | null;
  accao: string;
  seguranca: DetalheSeguranca;
  tipo: "login" | "logout";
  estadoAcesso?: EstadoAcesso;
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

function estiloEstado(
  estado: EstadoAcesso,
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

function dentroPeriodo(
  data: string,
  periodo: PeriodoSeguranca,
) {
  if (
    periodo ===
    "tudo"
  ) {
    return true;
  }

  const agora =
    Date.now();

  const limite =
    periodo === "24h"
      ? 24 *
        60 *
        60 *
        1000
      : periodo === "7d"
        ? 7 *
          24 *
          60 *
          60 *
          1000
        : 30 *
          24 *
          60 *
          60 *
          1000;

  return (
    agora -
      new Date(
        data,
      ).getTime() <=
    limite
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
    data: atividades = [],
    isLoading,
  } = useActivity();

  const {
    data: perfis = [],
  } = useProfiles();

  const eventosBase =
    useMemo(() => {
      return atividades
        .filter(
          (atividade) =>
            atividade.entidade ===
            "seguranca",
        )
        .map(
          (atividade) => {
            const seguranca =
              interpretarDetalhe(
                atividade.detalhe,
              );

            const tipo:
              | "login"
              | "logout" =
              atividade.accao ===
                "terminou sessão" ||
              seguranca.tipo ===
                "logout"
                ? "logout"
                : "login";

            return {
              id:
                atividade.id,

              created_at:
                atividade.created_at,

              autor:
                atividade.autor,

              accao:
                atividade.accao,

              seguranca,

              tipo,
            } satisfies EventoSeguranca;
          },
        );
    }, [
      atividades,
    ]);

  const loginsComEstado =
    useMemo(() => {
      const apenasLogins =
        eventosBase.filter(
          (evento) =>
            evento.tipo ===
            "login",
        );

      const cronologico = [
        ...apenasLogins,
      ].sort(
        (a, b) =>
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
            ips: Set<string>;
            paises: Set<string>;
            quantidade: number;
          }
        >();

      const estados =
        new Map<
          string,
          EstadoAcesso
        >();

      for (
        const login of cronologico
      ) {
        const utilizador =
          login.autor ??
          login.seguranca
            .user_id ??
          login.seguranca
            .email ??
          "desconhecido";

        const ip =
          login.seguranca
            .ip ??
          "";

        const pais =
          login.seguranca
            .pais ??
          "";

        const anterior =
          historico.get(
            utilizador,
          ) ?? {
            ips:
              new Set<string>(),

            paises:
              new Set<string>(),

            quantidade: 0,
          };

        let estado:
          EstadoAcesso;

        if (
          anterior.quantidade ===
          0
        ) {
          estado =
            "primeiro";
        } else if (
          pais &&
          anterior.paises.size >
            0 &&
          !anterior.paises.has(
            pais,
          )
        ) {
          estado =
            "pais_novo";
        } else if (
          ip &&
          !anterior.ips.has(
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
          anterior.ips.add(
            ip,
          );
        }

        if (pais) {
          anterior.paises.add(
            pais,
          );
        }

        anterior.quantidade +=
          1;

        historico.set(
          utilizador,
          anterior,
        );
      }

      return apenasLogins.map(
        (login) => ({
          ...login,

          estadoAcesso:
            estados.get(
              login.id,
            ) ??
            "conhecido",
        }),
      );
    }, [
      eventosBase,
    ]);

  const eventos =
    useMemo(() => {
      const mapaLogins =
        new Map(
          loginsComEstado.map(
            (login) => [
              login.id,
              login,
            ],
          ),
        );

      return eventosBase
        .map(
          (evento) => {
            if (
              evento.tipo ===
              "login"
            ) {
              return (
                mapaLogins.get(
                  evento.id,
                ) ??
                evento
              );
            }

            return evento;
          },
        )
        .filter(
          (evento) =>
            dentroPeriodo(
              evento.created_at,
              periodo,
            ),
        )
        .sort(
          (a, b) =>
            new Date(
              b.created_at,
            ).getTime() -
            new Date(
              a.created_at,
            ).getTime(),
        );
    }, [
      eventosBase,
      loginsComEstado,
      periodo,
    ]);

  const logins =
    eventos.filter(
      (evento) =>
        evento.tipo ===
        "login",
    );

  const logouts =
    eventos.filter(
      (evento) =>
        evento.tipo ===
        "logout",
    );

  const ipsUnicos =
    new Set(
      logins
        .map(
          (item) =>
            item.seguranca
              .ip,
        )
        .filter(Boolean),
    ).size;

  const paisesUnicos =
    new Set(
      logins
        .map(
          (item) =>
            item.seguranca
              .pais,
        )
        .filter(Boolean),
    ).size;

  const utilizadoresUnicos =
    new Set(
      logins
        .map(
          (item) =>
            item.autor ??
            item.seguranca
              .user_id,
        )
        .filter(Boolean),
    ).size;

  const alertas =
    logins.filter(
      (item) =>
        "estadoAcesso" in
          item &&
        (
          item.estadoAcesso ===
            "ip_novo" ||
          item.estadoAcesso ===
            "pais_novo"
        ),
    ).length;

  function nomeUtilizador(
    id: string | null,
    email?: string | null,
  ) {
    if (id) {
      const perfil =
        perfis.find(
          (item) =>
            item.id === id,
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
              Histórico de entradas e saídas do CRM,
              identificação de novos IPs, localizações
              e dispositivos utilizados.
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
              (item) => (
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
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
            {logins.length}
          </p>

          <p className="mt-1 text-[9px] text-muted-foreground">
            entradas autorizadas
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
            {logouts.length}
          </p>

          <p className="mt-1 text-[9px] text-muted-foreground">
            sessões terminadas
          </p>
        </article>

        <article className="rounded-2xl border border-border/65 bg-card/30 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              IPs diferentes
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

        <article
          className={`rounded-2xl border p-4 ${
            alertas > 0
              ? "border-amber-400/20 bg-amber-400/[0.035]"
              : "border-border/65 bg-card/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              Novos acessos
            </p>

            <span
              className={`grid size-8 place-items-center rounded-lg border ${
                alertas > 0
                  ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                  : "border-border/60 bg-background/30 text-muted-foreground"
              }`}
            >
              <ShieldAlert className="size-3.5" />
            </span>
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-[-.04em]">
            {alertas}
          </p>

          <p className="mt-1 text-[9px] text-muted-foreground">
            IP ou país nunca vistos
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

      <div className="mt-4 overflow-hidden rounded-3xl border border-border/65 bg-card/25">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">
              Histórico de sessões
            </h2>

            <p className="mt-0.5 text-[9px] text-muted-foreground">
              Entradas e saídas do CRM
            </p>
          </div>

          <ShieldCheck className="size-4 text-emerald-300" />
        </div>

        {isLoading ? (
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
              Ainda não há eventos registados
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/45">
            {eventos.map(
              (item) => {
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

                const logout =
                  item.tipo ===
                  "logout";

                if (logout) {
                  return (
                    <article
                      key={
                        item.id
                      }
                      className="group p-4 transition hover:bg-background/20 sm:p-5"
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
                    (
                      item as EventoSeguranca & {
                        estadoAcesso:
                          EstadoAcesso;
                      }
                    )
                      .estadoAcesso ??
                      "conhecido",
                  );

                const EstadoIcon =
                  estado.Icon;

                return (
                  <article
                    key={
                      item.id
                    }
                    className="group p-4 transition hover:bg-background/20 sm:p-5"
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
          Um IP ou país novo não significa automaticamente
          que exista uma ameaça. Pode acontecer por mudança
          de rede, dados móveis, VPN ou localização aproximada
          do fornecedor de Internet.
        </span>
      </div>
    </section>
  );
}
