import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Flame,
  ListTodo,
  Mail,
  Phone,
  PhoneCall,
  Plus,
  Sparkles,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  Avatar,
  Chip,
  Dot,
  Vazio,
} from "@/components/crm/Bits";
import { DialogNegocio } from "@/components/crm/DialogNegocio";
import { btnPrimario } from "@/components/crm/Modal";
import { useUtilizador } from "@/hooks/useAuth";
import {
  dataExtenso,
  estadoInfo,
  euros,
  formatarData,
  formatarHora,
  prioridadeInfo,
  saudacao,
} from "@/lib/crm";
import {
  CARTOES_PAINEL,
  formatarValor,
  rotuloFase,
  usePreferencias,
} from "@/lib/preferencias";
import {
  useActivity,
  useBusinesses,
  useInteractions,
  useOpportunities,
  useProfiles,
  useTasks,
} from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Gestão — Nova Web CRM" },
      {
        name: "description",
        content:
          "Métricas do dia, projetos em curso, atividade e tarefas prioritárias.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),

  component: Painel,
});

type PainelTab = "resumo" | "atividade";

type PeriodoAtividade =
  | "24h"
  | "7d"
  | "30d"
  | "tudo";

type TipoAtividade =
  | "tudo"
  | "negocio"
  | "tarefa"
  | "chamada";

type MetricTone =
  | "primary"
  | "success"
  | "info"
  | "warning";

const METRIC_STYLES: Record<
  MetricTone,
  {
    icon: string;
    glow: string;
    value: string;
    bar: string;
  }
> = {
  primary: {
    icon:
      "border-cyan-400/15 bg-cyan-400/10 text-cyan-300",
    glow: "bg-cyan-400/10",
    value: "text-foreground",
    bar: "from-cyan-400/80 to-cyan-400/0",
  },

  success: {
    icon:
      "border-emerald-400/15 bg-emerald-400/10 text-emerald-300",
    glow: "bg-emerald-400/10",
    value: "text-foreground",
    bar: "from-emerald-400/80 to-emerald-400/0",
  },

  info: {
    icon:
      "border-violet-400/15 bg-violet-400/10 text-violet-300",
    glow: "bg-violet-400/10",
    value: "text-foreground",
    bar: "from-violet-400/80 to-violet-400/0",
  },

  warning: {
    icon:
      "border-amber-400/15 bg-amber-400/10 text-amber-300",
    glow: "bg-amber-400/10",
    value: "text-foreground",
    bar: "from-amber-400/80 to-amber-400/0",
  },
};

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
  featured = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone: MetricTone;
  featured?: boolean;
}) {
  const style = METRIC_STYLES[tone];

  return (
    <article
      className={`group relative min-h-[128px] overflow-hidden rounded-2xl border bg-card/35 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card/50 ${
        featured
          ? "border-primary/20 shadow-[0_16px_50px_-32px_rgba(45,212,191,.35)]"
          : "border-border/65"
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 size-32 rounded-full blur-3xl transition duration-500 group-hover:scale-125 ${style.glow}`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r ${style.bar}`}
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium text-muted-foreground">
            {label}
          </p>

          <span
            className={`grid size-9 shrink-0 place-items-center rounded-xl border ${style.icon}`}
          >
            <Icon className="size-4" />
          </span>
        </div>

        <div className="mt-4">
          <p
            className={`text-[26px] font-semibold leading-none tracking-[-.04em] ${style.value}`}
          >
            {value}
          </p>

          <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
            {detail}
          </p>
        </div>
      </div>
    </article>
  );
}

function iconeAtividade(entidade: string) {
  switch (entidade) {
    case "negocio":
      return BriefcaseBusiness;

    case "tarefa":
      return ListTodo;

    case "chamada":
      return PhoneCall;

    default:
      return Activity;
  }
}

function estiloAtividade(entidade: string) {
  switch (entidade) {
    case "negocio":
      return {
        icon:
          "border-cyan-400/15 bg-cyan-400/10 text-cyan-300",
        dot: "bg-cyan-300",
      };

    case "tarefa":
      return {
        icon:
          "border-violet-400/15 bg-violet-400/10 text-violet-300",
        dot: "bg-violet-300",
      };

    case "chamada":
      return {
        icon:
          "border-emerald-400/15 bg-emerald-400/10 text-emerald-300",
        dot: "bg-emerald-300",
      };

    default:
      return {
        icon:
          "border-border/70 bg-secondary/50 text-muted-foreground",
        dot: "bg-muted-foreground",
      };
  }
}

function dataHoraAtividade(value: string) {
  const data = new Date(value);

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

function diaAtividade(value: string) {
  const data = new Date(value);
  const hoje = new Date();

  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  if (
    data.toDateString() ===
    hoje.toDateString()
  ) {
    return "Hoje";
  }

  if (
    data.toDateString() ===
    ontem.toDateString()
  ) {
    return "Ontem";
  }

  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(data);
}

function Painel() {
  const [novo, setNovo] = useState(false);

  const [tab, setTab] =
    useState<PainelTab>("resumo");

  const [
    periodoAtividade,
    setPeriodoAtividade,
  ] =
    useState<PeriodoAtividade>("7d");

  const [
    tipoAtividade,
    setTipoAtividade,
  ] =
    useState<TipoAtividade>("tudo");

  const { perfil } = useUtilizador();

  const { data: negocios = [] } =
    useBusinesses();

  const { data: tarefas = [] } =
    useTasks();

  const { data: chamadas = [] } =
    useInteractions();

  const { data: oportunidades = [] } =
    useOpportunities();

  const { data: perfis = [] } =
    useProfiles();

  const {
    data: atividades = [],
    isLoading: atividadesLoading,
  } = useActivity();

  const { prefs } = usePreferencias();

  const verCartao = (
    c: (typeof CARTOES_PAINEL)[number]["chave"],
  ) => prefs.cartoesPainel.includes(c);

  const nomePor = (
    id: string | null,
  ) =>
    perfis.find(
      (p) => p.id === id,
    )?.nome ??
    (id ? "Equipa" : "Sistema");

  const nomeNegocio = (
    id: string | null,
  ) =>
    negocios.find(
      (n) => n.id === id,
    )?.nome ?? null;

  const metricas = useMemo(() => {
    const hoje =
      new Date().toDateString();

    const emailsEnviados =
      negocios.filter(
        (n) =>
          n.estado ===
          "email_enviado",
      ).length;

    const emailsPorEnviar =
      negocios.filter(
        (n) =>
          n.estado ===
          "email_por_enviar",
      ).length;

    return {
      chamadasHoje:
        chamadas.filter(
          (c) =>
            new Date(
              c.ocorreu_em,
            ).toDateString() === hoje,
        ).length,

      interessados:
        negocios.filter(
          (n) =>
            n.estado ===
            "interessado",
        ).length,

      emailsEnviados,

      emailsPorEnviar,

      valor: negocios
        .filter(
          (n) =>
            ![
              "nao_interessado",
              "arquivado",
            ].includes(n.estado),
        )
        .reduce(
          (total, n) =>
            total +
            Number(
              n.valor_estimado ??
                0,
            ),
          0,
        ),
    };
  }, [negocios, chamadas]);

  const pendentes = tarefas
    .filter(
      (t) =>
        t.estado === "pendente",
    )
    .sort((a, b) =>
      (
        a.data_hora ?? ""
      ).localeCompare(
        b.data_hora ?? "",
      ),
    )
    .slice(0, 5);

  const recentes =
    negocios.slice(0, 6);

  const melhorOportunidade = [
    ...oportunidades,
  ].sort(
    (a, b) =>
      (b.probabilidade ?? 0) -
      (a.probabilidade ?? 0),
  )[0];

  const negocioOportunidade =
    negocios.find(
      (n) =>
        n.id ===
        melhorOportunidade?.business_id,
    );

  const nomePrimeiro =
    perfil?.nome?.split(" ")[0] ??
    "equipa";

  const atividadesFiltradas =
    useMemo(() => {
      const agora =
        new Date().getTime();

      const limitePeriodo =
        periodoAtividade === "24h"
          ? 24 * 60 * 60 * 1000
          : periodoAtividade ===
              "7d"
            ? 7 *
              24 *
              60 *
              60 *
              1000
            : periodoAtividade ===
                "30d"
              ? 30 *
                24 *
                60 *
                60 *
                1000
              : null;

      return atividades.filter(
        (atividade) => {
          if (
            tipoAtividade !==
              "tudo" &&
            atividade.entidade !==
              tipoAtividade
          ) {
            return false;
          }

          if (
            limitePeriodo !==
            null
          ) {
            const tempo =
              new Date(
                atividade.created_at,
              ).getTime();

            if (
              agora - tempo >
              limitePeriodo
            ) {
              return false;
            }
          }

          return true;
        },
      );
    }, [
      atividades,
      periodoAtividade,
      tipoAtividade,
    ]);

  const atividadesPorDia =
    useMemo(() => {
      const grupos: Record<
        string,
        typeof atividadesFiltradas
      > = {};

      for (const atividade of atividadesFiltradas) {
        const chave =
          new Date(
            atividade.created_at,
          ).toDateString();

        if (!grupos[chave]) {
          grupos[chave] = [];
        }

        grupos[chave].push(
          atividade,
        );
      }

      return Object.entries(
        grupos,
      );
    }, [atividadesFiltradas]);

  return (
    <>
      {/* TABS PRINCIPAIS */}
      <div className="mb-5 flex items-center gap-1 rounded-2xl border border-border/60 bg-card/30 p-1.5">
        <button
          type="button"
          onClick={() =>
            setTab("resumo")
          }
          className={`flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-medium transition ${
            tab === "resumo"
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
          }`}
        >
          <TrendingUp className="size-3.5" />
          Resumo
        </button>

        <button
          type="button"
          onClick={() =>
            setTab("atividade")
          }
          className={`flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-medium transition ${
            tab === "atividade"
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
          }`}
        >
          <Activity className="size-3.5" />
          Atividade

          {atividades.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[8px] font-semibold">
              {atividades.length}
            </span>
          )}
        </button>
      </div>

      {tab === "resumo" ? (
        <>
          {/* HERO / RESUMO */}
          {verCartao("saudacao") && (
            <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/20 px-5 py-5 sm:px-7 sm:py-6">
              <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/[0.07] blur-3xl" />

              <div
                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
                  backgroundSize:
                    "42px 42px",
                }}
              />

              <div className="relative flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
                <div className="max-w-4xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-primary">
                      {dataExtenso()}
                    </p>

                    <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:block" />

                    <span className="hidden items-center gap-1.5 text-[10px] text-muted-foreground sm:flex">
                      <Sparkles className="size-3 text-primary" />
                      Resumo comercial
                      de hoje
                    </span>
                  </div>

                  <h1 className="mt-2.5 text-2xl font-semibold leading-tight tracking-[-.04em] sm:text-[32px]">
                    {saudacao()},{" "}
                    {nomePrimeiro}.{" "}
                    <span className="text-foreground/65">
                      Vamos fechar
                      projetos.
                    </span>
                  </h1>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Tens{" "}
                    <span className="font-medium text-foreground">
                      {
                        pendentes.length
                      }
                    </span>{" "}
                    ações pendentes e{" "}
                    <span className="font-medium text-foreground">
                      {
                        metricas.interessados
                      }
                    </span>{" "}
                    oportunidades
                    quentes.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    to="/negocios"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/35 px-4 text-xs font-medium text-muted-foreground transition hover:border-primary/25 hover:bg-accent hover:text-foreground"
                  >
                    <BriefcaseBusiness className="size-3.5" />
                    Ver pipeline
                  </Link>

                  <button
                    className={
                      btnPrimario
                    }
                    onClick={() =>
                      setNovo(true)
                    }
                  >
                    <Plus className="size-4" />
                    Novo projeto de
                    site
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* MÉTRICAS */}
          <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {verCartao(
              "m_chamadas",
            ) && (
              <MetricCard
                icon={Phone}
                label="Chamadas hoje"
                value={String(
                  metricas.chamadasHoje,
                )}
                detail={`${chamadas.length} chamadas registadas no total`}
                tone="primary"
              />
            )}

            {verCartao(
              "m_interessados",
            ) && (
              <MetricCard
                icon={Flame}
                label="Interessados"
                value={String(
                  metricas.interessados,
                )}
                detail={`${oportunidades.length} oportunidades registadas`}
                tone="success"
                featured={
                  metricas.interessados >
                  0
                }
              />
            )}

            {verCartao(
              "m_emails",
            ) && (
              <MetricCard
                icon={Mail}
                label="Emails por enviar"
                value={String(
                  metricas.emailsPorEnviar,
                )}
                detail={`${metricas.emailsEnviados} já enviados`}
                tone="info"
                featured={
                  metricas.emailsPorEnviar >
                  0
                }
              />
            )}

            {verCartao(
              "m_valor",
            ) && (
              <MetricCard
                icon={
                  CircleDollarSign
                }
                label="Valor em aberto"
                value={formatarValor(
                  prefs,
                  metricas.valor,
                )}
                detail={`${negocios.length} projetos registados`}
                tone="warning"
                featured
              />
            )}
          </section>

          {/* CONTEÚDO PRINCIPAL */}
          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* PIPELINE */}
            {verCartao(
              "tabela",
            ) && (
              <div className="overflow-hidden rounded-3xl border border-border/65 bg-card/30">
                <div className="flex flex-col gap-3 border-b border-border/55 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <TrendingUp className="size-3.5" />
                    </span>

                    <div>
                      <h2 className="text-sm font-semibold">
                        Pipeline de
                        projetos
                      </h2>

                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Últimos contactos
                        e próximas ações
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/negocios"
                    className="group inline-flex items-center gap-1.5 text-[11px] font-medium text-primary"
                  >
                    Ver todos

                    <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>

                {recentes.length ===
                0 ? (
                  <div className="p-5">
                    <Vazio texto="Ainda não há negócios. Adiciona o primeiro." />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] text-left text-xs">
                      <thead className="border-b border-border/45 bg-background/20 text-[9px] uppercase tracking-[.14em] text-muted-foreground">
                        <tr>
                          <th className="px-5 py-3 font-medium">
                            Cliente /
                            Projeto
                          </th>

                          <th className="px-3 py-3 font-medium">
                            Estado
                          </th>

                          <th className="px-3 py-3 font-medium">
                            Prioridade
                          </th>

                          <th className="px-3 py-3 font-medium">
                            Responsável
                          </th>

                          <th className="px-3 py-3 font-medium">
                            Próxima ação
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentes.map(
                          (n) => {
                            const estado =
                              estadoInfo(
                                n.estado,
                              );

                            const prioridade =
                              prioridadeInfo(
                                n.prioridade,
                              );

                            return (
                              <tr
                                key={
                                  n.id
                                }
                                className="group border-b border-border/35 transition duration-200 last:border-b-0 hover:bg-primary/[0.025]"
                              >
                                <td className="relative px-5 py-4">
                                  <span className="absolute inset-y-2 left-0 w-[2px] scale-y-0 rounded-full bg-primary transition-transform duration-200 group-hover:scale-y-100" />

                                  <Link
                                    to="/negocios/$id"
                                    params={{
                                      id: n.id,
                                    }}
                                    className="inline-flex items-center gap-1.5 font-medium transition group-hover:text-primary"
                                  >
                                    {
                                      n.nome
                                    }

                                    <ArrowUpRight className="size-3 opacity-0 transition duration-200 group-hover:opacity-60" />
                                  </Link>

                                  <div className="mt-1 text-[10px] text-muted-foreground">
                                    {n.categoria ??
                                      "Sem categoria"}

                                    {n.localidade
                                      ? ` · ${n.localidade}`
                                      : ""}
                                  </div>
                                </td>

                                <td className="px-3 py-4">
                                  <Chip
                                    tone={
                                      estado.tone
                                    }
                                  >
                                    {rotuloFase(
                                      prefs,
                                      n.estado,
                                    )}
                                  </Chip>
                                </td>

                                <td className="px-3 py-4">
                                  <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                    <Dot
                                      tone={
                                        prioridade.tone
                                      }
                                    />

                                    {
                                      prioridade.label
                                    }
                                  </span>
                                </td>

                                <td className="px-3 py-4">
                                  <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                    <Avatar
                                      nome={nomePor(
                                        n.contactado_por ??
                                          n.encontrado_por,
                                      )}
                                      size="size-6"
                                    />

                                    <span className="max-w-[120px] truncate">
                                      {nomePor(
                                        n.contactado_por ??
                                          n.encontrado_por,
                                      )}
                                    </span>
                                  </span>
                                </td>

                                <td className="max-w-[220px] px-3 py-4">
                                  <span className="block truncate text-[11px] text-muted-foreground">
                                    {n.proxima_acao ??
                                      "—"}
                                  </span>
                                </td>
                              </tr>
                            );
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* COLUNA DIREITA */}
            <div className="space-y-5">
              {verCartao(
                "tarefas",
              ) && (
                <div className="overflow-hidden rounded-3xl border border-border/65 bg-card/30">
                  <div className="flex items-center justify-between border-b border-border/55 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                        <ListTodo className="size-3.5" />
                      </span>

                      <div>
                        <h2 className="text-sm font-semibold">
                          A fazer agora
                        </h2>

                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          Por ordem de
                          data
                        </p>
                      </div>
                    </div>

                    {pendentes.length >
                      0 && (
                      <span className="grid min-w-6 place-items-center rounded-full border border-primary/15 bg-primary/[0.07] px-1.5 py-1 text-[9px] font-semibold text-primary">
                        {
                          pendentes.length
                        }
                      </span>
                    )}
                  </div>

                  {pendentes.length ===
                  0 ? (
                    <div className="flex min-h-[210px] flex-col items-center justify-center px-5 py-8 text-center">
                      <span className="grid size-12 place-items-center rounded-2xl border border-border/60 bg-background/40 text-muted-foreground">
                        <CalendarCheck2 className="size-5" />
                      </span>

                      <p className="mt-4 text-xs font-medium">
                        Tudo tratado por
                        agora
                      </p>

                      <p className="mt-1 max-w-[220px] text-[10px] leading-5 text-muted-foreground">
                        Não tens tarefas
                        pendentes.
                        Aproveita para
                        preparar os
                        próximos
                        contactos.
                      </p>

                      <Link
                        to="/tarefas"
                        className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-primary"
                      >
                        Ver tarefas

                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2 p-3">
                      {pendentes.map(
                        (t) => {
                          const atrasada =
                            t.data_hora
                              ? new Date(
                                  t.data_hora,
                                ) <
                                new Date()
                              : false;

                          return (
                            <Link
                              key={
                                t.id
                              }
                              to="/tarefas"
                              className="group flex w-full items-center gap-3 rounded-xl border border-border/55 bg-background/25 p-3 text-left transition duration-200 hover:border-primary/25 hover:bg-accent/30"
                            >
                              <span
                                className={`grid size-7 shrink-0 place-items-center rounded-lg ${
                                  atrasada
                                    ? "bg-destructive/10"
                                    : "bg-primary/[0.07]"
                                }`}
                              >
                                <Dot
                                  tone={
                                    atrasada
                                      ? "danger"
                                      : prioridadeInfo(
                                          t.prioridade,
                                        )
                                          .tone
                                  }
                                />
                              </span>

                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[11px] font-medium">
                                  {
                                    t.titulo
                                  }
                                </span>

                                <span className="mt-0.5 block truncate text-[9px] text-muted-foreground">
                                  {t.notas ??
                                    "Sem notas"}
                                </span>
                              </span>

                              <span className="text-[9px] text-muted-foreground transition group-hover:text-foreground">
                                {t.data_hora
                                  ? formatarHora(
                                      t.data_hora,
                                    )
                                  : "—"}
                              </span>
                            </Link>
                          );
                        },
                      )}

                      <Link
                        to="/tarefas"
                        className="flex items-center justify-center gap-1.5 py-2 text-[10px] font-medium text-muted-foreground transition hover:text-primary"
                      >
                        Ver todas as
                        tarefas
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {verCartao(
                "oportunidade",
              ) &&
                melhorOportunidade &&
                negocioOportunidade && (
                  <div className="group relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.035] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/30">
                    <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-emerald-400/10 blur-3xl" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <span className="grid size-10 place-items-center rounded-xl border border-emerald-400/15 bg-emerald-400/10 text-emerald-300">
                          <CheckCircle2 className="size-5" />
                        </span>

                        <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[.16em] text-emerald-300">
                          Melhor
                          oportunidade
                        </span>
                      </div>

                      <h3 className="mt-5 text-sm font-semibold">
                        {
                          negocioOportunidade.nome
                        }
                      </h3>

                      <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                        {melhorOportunidade.pretende ??
                          "Oportunidade registada."}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-border/50 bg-background/25 p-3">
                          <p className="text-[8px] uppercase tracking-[.13em] text-muted-foreground">
                            Probabilidade
                          </p>

                          <p className="mt-1 text-sm font-semibold text-emerald-300">
                            {
                              melhorOportunidade.probabilidade
                            }
                            %
                          </p>
                        </div>

                        <div className="rounded-xl border border-border/50 bg-background/25 p-3">
                          <p className="text-[8px] uppercase tracking-[.13em] text-muted-foreground">
                            Valor
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {euros(
                              melhorOportunidade.orcamento_previsto ??
                                melhorOportunidade.preco_indicado,
                            )}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-[9px] text-muted-foreground">
                        Próxima conversa
                        ·{" "}
                        {formatarData(
                          melhorOportunidade.data_proxima_conversa,
                        )}
                      </p>

                      <Link
                        to="/negocios/$id"
                        params={{
                          id: negocioOportunidade.id,
                        }}
                        className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-emerald-300"
                      >
                        Abrir projeto

                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
            </div>
          </section>
        </>
      ) : (
        /* ATIVIDADE */
        <section>
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/20 px-5 py-5 sm:px-7">
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/[0.06] blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-primary">
                  <Activity className="size-3.5" />
                  Registos internos
                </div>

                <h1 className="mt-2 text-2xl font-semibold tracking-[-.035em]">
                  Atividade da equipa
                </h1>

                <p className="mt-1.5 max-w-2xl text-xs leading-6 text-muted-foreground">
                  Histórico de alterações,
                  chamadas, tarefas e
                  ações realizadas dentro
                  do CRM.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "24h",
                    "7d",
                    "30d",
                    "tudo",
                  ] as PeriodoAtividade[]
                ).map(
                  (periodo) => (
                    <button
                      key={periodo}
                      type="button"
                      onClick={() =>
                        setPeriodoAtividade(
                          periodo,
                        )
                      }
                      className={`h-8 rounded-lg border px-3 text-[10px] font-medium transition ${
                        periodoAtividade ===
                        periodo
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/60 bg-background/30 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                      }`}
                    >
                      {periodo ===
                      "tudo"
                        ? "Tudo"
                        : periodo.toUpperCase()}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              {
                value: "tudo",
                label: "Tudo",
              },
              {
                value: "negocio",
                label: "Projetos",
              },
              {
                value: "tarefa",
                label: "Tarefas",
              },
              {
                value: "chamada",
                label: "Chamadas",
              },
            ].map(
              (item) => (
                <button
                  key={
                    item.value
                  }
                  type="button"
                  onClick={() =>
                    setTipoAtividade(
                      item.value as TipoAtividade,
                    )
                  }
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-medium transition ${
                    tipoAtividade ===
                    item.value
                      ? "border-primary/25 bg-primary/[0.08] text-primary"
                      : "border-border/60 bg-card/20 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {
                    item.label
                  }
                </button>
              ),
            )}
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-border/65 bg-card/25">
            {atividadesLoading ? (
              <div className="flex min-h-[300px] items-center justify-center text-xs text-muted-foreground">
                A carregar atividade…
              </div>
            ) : atividadesFiltradas.length ===
              0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
                <span className="grid size-12 place-items-center rounded-2xl border border-border/60 bg-background/40 text-muted-foreground">
                  <Activity className="size-5" />
                </span>

                <p className="mt-4 text-sm font-medium">
                  Sem atividade neste
                  período
                </p>

                <p className="mt-1 text-[10px] text-muted-foreground">
                  Experimenta alterar os
                  filtros acima.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/45">
                {atividadesPorDia.map(
                  ([
                    dia,
                    listaDia,
                  ]) => (
                    <div
                      key={dia}
                      className="p-4 sm:p-5"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-[9px] font-semibold uppercase tracking-[.17em] text-muted-foreground">
                          {diaAtividade(
                            listaDia[0]
                              .created_at,
                          )}
                        </span>

                        <span className="h-px flex-1 bg-border/45" />
                      </div>

                      <div className="space-y-2">
                        {listaDia.map(
                          (
                            atividade,
                          ) => {
                            const Icon =
                              iconeAtividade(
                                atividade.entidade,
                              );

                            const estilo =
                              estiloAtividade(
                                atividade.entidade,
                              );

                            const negocio =
                              nomeNegocio(
                                atividade.business_id,
                              );

                            const autor =
                              nomePor(
                                atividade.autor,
                              );

                            return (
                              <article
                                key={
                                  atividade.id
                                }
                                className="group relative flex gap-3 rounded-2xl border border-transparent px-2 py-3 transition hover:border-border/55 hover:bg-background/30 sm:px-3"
                              >
                                <div className="relative flex flex-col items-center">
                                  <span
                                    className={`grid size-9 shrink-0 place-items-center rounded-xl border ${estilo.icon}`}
                                  >
                                    <Icon className="size-4" />
                                  </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                      <p className="text-xs leading-5">
                                        <span className="font-semibold text-foreground">
                                          {
                                            autor
                                          }
                                        </span>{" "}
                                        <span className="text-muted-foreground">
                                          {
                                            atividade.accao
                                          }
                                        </span>
                                      </p>

                                      {atividade.detalhe && (
                                        <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                                          {
                                            atividade.detalhe
                                          }
                                        </p>
                                      )}

                                      <div className="mt-2 flex flex-wrap items-center gap-2">
                                        {negocio && (
                                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/55 bg-background/25 px-2.5 py-1 text-[9px] text-muted-foreground">
                                            <BriefcaseBusiness className="size-3 text-primary/70" />

                                            {
                                              negocio
                                            }
                                          </span>
                                        )}

                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/20 px-2.5 py-1 text-[9px] capitalize text-muted-foreground">
                                          <span
                                            className={`size-1.5 rounded-full ${estilo.dot}`}
                                          />

                                          {
                                            atividade.entidade
                                          }
                                        </span>
                                      </div>
                                    </div>

                                    <span className="flex shrink-0 items-center gap-1.5 text-[9px] text-muted-foreground">
                                      <Clock3 className="size-3" />

                                      {dataHoraAtividade(
                                        atividade.created_at,
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </article>
                            );
                          },
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 px-1 text-[9px] text-muted-foreground">
            <UserRound className="size-3" />

            Ações associadas a utilizadores
            autenticados aparecem com o
            respetivo membro da equipa.
          </div>
        </section>
      )}

      <DialogNegocio
        aberto={novo}
        onFechar={() =>
          setNovo(false)
        }
      />
    </>
  );
}
