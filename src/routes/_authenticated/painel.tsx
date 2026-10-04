import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  Flame,
  Globe,
  Grid,
  ListTodo,
  Mail,
  Phone,
  PhoneCall,
  Plus,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, Chip, Dot, Vazio } from "@/components/crm/Bits";
import { DialogNegocio } from "@/components/crm/DialogNegocio";
import { useUtilizador } from "@/hooks/useAuth";
import {
  dataExtenso,
  estadoInfo,
  euros,
  formatarData,
  formatarHora,
  formatarMoeda,
  prioridadeInfo,
  saudacao,
  type Business,
} from "@/lib/crm";
import { CARTOES_PAINEL, formatarValor, rotuloFase, usePreferencias } from "@/lib/preferencias";
import {
  useActivity,
  useBusinesses,
  useInteractions,
  useOpportunities,
  useProfiles,
  useTasks,
  useWebsiteRequests,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      {
        title: "Command Center — Nova Web Studio CRM",
      },
      {
        name: "description",
        content: "Centro de comando comercial, pipeline de clientes, tarefas e atividade.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: PainelCRM,
});

type TabCRM = "resumo" | "operacoes" | "atividade";
type PeriodoAtividade = "24h" | "7d" | "30d" | "tudo";

function PainelCRM() {
  const [novoNegocio, setNovoNegocio] = useState(false);
  const [tab, setTab] = useState<TabCRM>("resumo");
  const [periodoAtividade, setPeriodoAtividade] = useState<PeriodoAtividade>("7d");

  const { perfil } = useUtilizador();
  const { data: negocios = [], isLoading: loadingNegocios } = useBusinesses();
  const { data: tarefas = [] } = useTasks();
  const { data: chamadas = [] } = useInteractions();
  const { data: oportunidades = [] } = useOpportunities();
  const { data: pedidos = [] } = useWebsiteRequests();
  const { data: perfis = [] } = useProfiles();
  const { data: atividades = [], isLoading: loadingAtividades } = useActivity();
  const { prefs } = usePreferencias();

  const hoje = new Date().toDateString();
  const hojeIso = new Date().toISOString().slice(0, 10);

  const nomePor = (id: string | null) =>
    perfis.find((p) => p.id === id)?.nome ?? (id ? "Equipa" : "Sistema");

  const nomeNegocio = (id: string | null) => negocios.find((n) => n.id === id)?.nome ?? null;

  // Métricas agregadas do CRM
  const metricas = useMemo(() => {
    const chamadasHoje = chamadas.filter(
      (c) => new Date(c.ocorreu_em).toDateString() === hoje,
    ).length;

    const interessados = negocios.filter((n) => n.estado === "interessado").length;

    const emailsPorEnviar = negocios.filter((n) => n.estado === "email_por_enviar").length;

    const pedidosPendentes = pedidos.filter((p) => !p.tratado).length;

    const valorEmPipeline = negocios
      .filter((n) => !["nao_interessado", "arquivado"].includes(n.estado))
      .reduce((total, n) => total + Number(n.valor_estimado ?? 0), 0);

    const valorFechado = negocios
      .filter((n) => n.estado === "concluido")
      .reduce((total, n) => total + Number(n.valor_estimado ?? 0), 0);

    return {
      chamadasHoje,
      interessados,
      emailsPorEnviar,
      pedidosPendentes,
      valorEmPipeline,
      valorFechado,
    };
  }, [negocios, chamadas, pedidos, hoje]);

  // Ações Urgentes / Atenção Imediata
  const atencaoImediata = useMemo(() => {
    const tarefasVencidas = tarefas.filter(
      (t) => t.estado === "pendente" && t.data_hora && t.data_hora.slice(0, 10) <= hojeIso,
    );

    const leadsParadas = negocios.filter((n) => {
      if (["concluido", "arquivado", "nao_interessado"].includes(n.estado)) return false;
      return n.estado === "seguimento" || n.estado === "email_por_enviar";
    });

    const pedidosNovos = pedidos.filter((p) => !p.tratado);

    return {
      tarefasVencidas,
      leadsParadas,
      pedidosNovos,
      total: tarefasVencidas.length + leadsParadas.length + pedidosNovos.length,
    };
  }, [tarefas, negocios, pedidos, hojeIso]);

  const pendentesTarefas = tarefas
    .filter((t) => t.estado === "pendente")
    .sort((a, b) => (a.data_hora ?? "").localeCompare(b.data_hora ?? ""))
    .slice(0, 5);

  const recentesNegocios = negocios.slice(0, 6);

  const melhorOportunidade = [...oportunidades].sort(
    (a, b) => (b.probabilidade ?? 0) - (a.probabilidade ?? 0),
  )[0];

  const negocioOportunidade = negocios.find((n) => n.id === melhorOportunidade?.business_id);

  const nomePrimeiro = perfil?.nome?.split(" ")[0] ?? "Utilizador";

  return (
    <div className="space-y-8">
      {/* HERO BANNER COMMAND CENTER */}
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-surface/50 p-6 sm:p-9 backdrop-blur-2xl">
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-info/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold uppercase tracking-[.2em] text-primary">
              <Sparkles className="size-3.5" />
              <span>{dataExtenso()}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-muted-foreground">Nova Web Studio CRM</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              {saudacao()},{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-300">
                {nomePrimeiro}
              </span>
              .
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Existem{" "}
              <span className="font-bold text-foreground">
                {metricas.pedidosPendentes} novo(s) pedido(s)
              </span>{" "}
              do website por responder,{" "}
              <span className="font-bold text-foreground">
                {metricas.interessados} oportunidade(s) quente(s)
              </span>{" "}
              e{" "}
              <span className="font-bold text-foreground">
                {pendentesTarefas.length} tarefa(s) agendada(s)
              </span>
              .
            </p>
          </div>

          {/* Ações Rápidas */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/pipeline"
              className="flex items-center gap-2 rounded-2xl border border-border/70 bg-surface/80 px-4 py-2.5 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:bg-surface-strong shadow-sm"
            >
              <BarChart3 className="size-4 text-warning" />
              <span>Pipeline ({negocios.length})</span>
            </Link>

            <button
              type="button"
              onClick={() => setNovoNegocio(true)}
              className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 active:scale-95"
            >
              <Plus className="size-4" />
              <span>Novo Projeto / Cliente</span>
            </button>
          </div>
        </div>
      </section>

      {/* TABS DE MÓDULOS COMERCIAIS */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/70 bg-surface/50 p-1.5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setTab("resumo")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "resumo"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <TrendingUp className="size-3.5" />
          <span>Resumo & Indicadores</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("operacoes")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "operacoes"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <AlertCircle className="size-3.5 text-warning" />
          <span>Atenção Imediata</span>
          {atencaoImediata.total > 0 && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[9px] font-bold tabular-nums",
                tab === "operacoes" ? "bg-black/30 text-white" : "bg-warning/20 text-warning",
              )}
            >
              {atencaoImediata.total}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab("atividade")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "atividade"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <Activity className="size-3.5" />
          <span>Atividade Comercial</span>
          {atividades.length > 0 && (
            <span className="rounded-full bg-surface-strong px-1.5 py-0.2 text-[9px] text-muted-foreground">
              {atividades.length}
            </span>
          )}
        </button>
      </div>

      {/* SEPARADOR 1: RESUMO COMERCIAL & KPIS */}
      {tab === "resumo" && (
        <div className="space-y-6">
          {/* GRID DE KPIS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-primary/30 bg-surface/50 p-5 backdrop-blur-md relative overflow-hidden">
              <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-primary/15 blur-2xl" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Volume em Pipeline
                </span>
                <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                  <CircleDollarSign className="size-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground mt-2 truncate">
                {formatarMoeda(metricas.valorEmPipeline)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {negocios.length} clientes e projetos em carteira
              </p>
            </div>

            <div className="rounded-3xl border border-success/30 bg-surface/50 p-5 backdrop-blur-md relative overflow-hidden">
              <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-success/15 blur-2xl" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Oportunidades Quentes
                </span>
                <span className="grid size-8 place-items-center rounded-xl bg-success/10 text-success">
                  <Flame className="size-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-success mt-2">
                {metricas.interessados}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {oportunidades.length} oportunidades qualificadas
              </p>
            </div>

            <div className="rounded-3xl border border-info/30 bg-surface/50 p-5 backdrop-blur-md relative overflow-hidden">
              <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-info/15 blur-2xl" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Chamadas Hoje
                </span>
                <span className="grid size-8 place-items-center rounded-xl bg-info/10 text-info">
                  <Phone className="size-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-info mt-2">
                {metricas.chamadasHoje}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {chamadas.length} chamadas no total
              </p>
            </div>

            <div className="rounded-3xl border border-warning/30 bg-surface/50 p-5 backdrop-blur-md relative overflow-hidden">
              <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-warning/15 blur-2xl" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Leads do Website
                </span>
                <span className="grid size-8 place-items-center rounded-xl bg-warning/10 text-warning">
                  <Globe className="size-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-warning mt-2">
                {metricas.pedidosPendentes}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {metricas.emailsPorEnviar} emails/propostas por enviar
              </p>
            </div>
          </div>

          {/* PIPELINE RECENTE & A FAZER */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* Tabela de Negócios Recentes */}
            <div className="rounded-3xl border border-border/70 bg-surface/40 backdrop-blur-md overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/60 bg-surface/30 px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <BriefcaseBusiness className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">
                      Projetos & Contactos Recentes
                    </h2>
                    <p className="text-[10px] text-muted-foreground">
                      Últimos clientes acompanhados pela equipa
                    </p>
                  </div>
                </div>

                <Link
                  to="/negocios"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Ver todos ({negocios.length})</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {recentesNegocios.length === 0 ? (
                <div className="p-8">
                  <Vazio texto="Sem projetos registados." />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead className="border-b border-border/40 bg-surface/60 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3.5">Cliente / Negócio</th>
                        <th className="px-3 py-3.5">Fase</th>
                        <th className="px-3 py-3.5">Prioridade</th>
                        <th className="px-4 py-3.5">Valor Estimado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {recentesNegocios.map((n) => {
                        const estado = estadoInfo(n.estado);
                        const prioridade = prioridadeInfo(n.prioridade);

                        return (
                          <tr key={n.id} className="group transition hover:bg-surface-strong/60">
                            <td className="px-6 py-3.5">
                              <Link
                                to="/negocios/$id"
                                params={{ id: n.id }}
                                className="font-bold text-foreground transition group-hover:text-primary flex items-center gap-1.5"
                              >
                                <span>{n.nome}</span>
                                <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition text-primary" />
                              </Link>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {n.categoria ?? "Geral"} {n.localidade ? `• ${n.localidade}` : ""}
                              </div>
                            </td>

                            <td className="px-3 py-3.5">
                              <Chip tone={estado.tone}>{rotuloFase(prefs, n.estado)}</Chip>
                            </td>

                            <td className="px-3 py-3.5">
                              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <Dot tone={prioridade.tone} />
                                {prioridade.label}
                              </span>
                            </td>

                            <td className="px-4 py-3.5">
                              <span className="font-mono font-bold text-foreground">
                                {formatarMoeda(n.valor_estimado)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Coluna Direita: Tarefas Próximas */}
            <div className="space-y-4">
              <div className="rounded-3xl border border-border/70 bg-surface/40 backdrop-blur-md overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/60 bg-surface/30 px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <ListTodo className="size-4 text-warning" />
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Tarefas a Realizar
                    </h2>
                  </div>
                  <Link
                    to="/tarefas"
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Ver todas
                  </Link>
                </div>

                {pendentesTarefas.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <CalendarCheck2 className="size-7 mx-auto mb-2 text-success/60" />
                    <p className="text-xs font-medium text-foreground">Tudo tratado!</p>
                    <p className="text-[10px] mt-0.5">Sem tarefas pendentes de momento.</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {pendentesTarefas.map((t) => (
                      <Link
                        key={t.id}
                        to="/tarefas"
                        className="block rounded-xl border border-border/40 bg-surface/60 p-2.5 text-xs transition hover:border-primary/40 hover:bg-surface-strong"
                      >
                        <div className="font-semibold text-foreground truncate">{t.titulo}</div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                          <span>{formatarData(t.data_hora, true)}</span>
                          <span className="capitalize">{t.tipo}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Destaque Melhor Oportunidade */}
              {melhorOportunidade && negocioOportunidade && (
                <div className="rounded-3xl border border-success/30 bg-success/5 p-5 backdrop-blur-md space-y-3 relative overflow-hidden">
                  <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-success/15 blur-2xl" />

                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-success">
                      Destaque Comercial
                    </span>
                    <span className="text-xs font-mono font-bold text-success">
                      {melhorOportunidade.probabilidade}% prob.
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {negocioOportunidade.nome}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {melhorOportunidade.pretende ?? "Projeto qualificado."}
                    </p>
                  </div>

                  <Link
                    to="/negocios/$id"
                    params={{ id: negocioOportunidade.id }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-success/15 py-2 text-xs font-bold text-success transition hover:bg-success/25"
                  >
                    <span>Abrir Ficha do Cliente</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEPARADOR 2: ATENÇÃO IMEDIATA */}
      {tab === "operacoes" && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Tarefas Urgentes */}
          <div className="rounded-3xl border border-danger/30 bg-surface/40 p-5 space-y-3">
            <span className="text-xs font-bold text-danger uppercase tracking-wider flex items-center gap-1.5">
              <CalendarClock className="size-4" />
              Tarefas Vencidas ({atencaoImediata.tarefasVencidas.length})
            </span>
            {atencaoImediata.tarefasVencidas.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Sem tarefas em atraso.
              </p>
            ) : (
              <div className="space-y-2">
                {atencaoImediata.tarefasVencidas.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs"
                  >
                    <div className="font-semibold text-foreground">{t.titulo}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {formatarData(t.data_hora, true)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leads Paradas */}
          <div className="rounded-3xl border border-warning/30 bg-surface/40 p-5 space-y-3">
            <span className="text-xs font-bold text-warning uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="size-4" />
              Seguimentos Pendentes ({atencaoImediata.leadsParadas.length})
            </span>
            {atencaoImediata.leadsParadas.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Sem seguimentos pendentes.
              </p>
            ) : (
              <div className="space-y-2">
                {atencaoImediata.leadsParadas.slice(0, 4).map((n) => (
                  <Link
                    key={n.id}
                    to="/negocios/$id"
                    params={{ id: n.id }}
                    className="block rounded-xl border border-warning/20 bg-warning/5 p-3 text-xs hover:bg-warning/10 transition"
                  >
                    <div className="font-semibold text-foreground">{n.nome}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {rotuloFase(prefs, n.estado)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Novos Pedidos */}
          <div className="rounded-3xl border border-primary/30 bg-surface/40 p-5 space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="size-4" />
              Pedidos do Site ({atencaoImediata.pedidosNovos.length})
            </span>
            {atencaoImediata.pedidosNovos.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Todos os pedidos foram tratados.
              </p>
            ) : (
              <div className="space-y-2">
                {atencaoImediata.pedidosNovos.map((p) => (
                  <Link
                    key={p.id}
                    to="/pedidos"
                    className="block rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs hover:bg-primary/10 transition"
                  >
                    <div className="font-semibold text-foreground">{p.nome}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {p.mensagem || "Sem mensagem"}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEPARADOR 3: ATIVIDADE COMERCIAL */}
      {tab === "atividade" && (
        <div className="rounded-3xl border border-border/70 bg-surface/40 p-6 backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            Histórico de Ações Comerciais
          </h2>

          {atividades.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              Sem registos de atividade comercial.
            </p>
          ) : (
            <div className="divide-y divide-border/30">
              {atividades.slice(0, 10).map((act) => (
                <div
                  key={act.id}
                  className="py-3.5 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <span className="font-semibold text-foreground">
                      {perfis.find((p) => p.id === act.autor)?.nome ?? "Equipa"}
                    </span>{" "}
                    <span className="text-muted-foreground">{act.accao}</span>
                    {act.detalhe && (
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate max-w-md">
                        {act.detalhe}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                    {formatarData(act.created_at, true)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação de Negócio */}
      {novoNegocio && <DialogNegocio aberto={novoNegocio} onFechar={() => setNovoNegocio(false)} />}
    </div>
  );
}
