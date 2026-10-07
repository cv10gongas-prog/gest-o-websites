import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  FileArchive,
  Flame,
  Globe,
  HelpCircle,
  History,
  Layers,
  ListTodo,
  Mail,
  MapPin,
  MessageSquareHeart,
  Pencil,
  Phone,
  PhoneCall,
  Plus,
  Send,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, Chip, Dot, Vazio } from "@/components/crm/Bits";
import { DialogChamada } from "@/components/crm/DialogChamada";
import { DialogNegocio } from "@/components/crm/DialogNegocio";
import { DialogTarefa } from "@/components/crm/DialogTarefa";
import { PainelArquivos } from "@/components/crm/PainelArquivos";
import { SeccaoSatisfacaoNegocio } from "@/components/crm/SeccaoSatisfacaoNegocio";
import {
  ESTADOS,
  estadoInfo,
  euros,
  formatarData,
  formatarHora,
  formatarMoeda,
  prioridadeInfo,
  resultadoInfo,
  tipoTarefaLabel,
  type BusinessStatus,
} from "@/lib/crm";
import { lerCamposExtra, notasSemExtras, rotuloFase, usePreferencias } from "@/lib/preferencias";
import {
  useActivity,
  useActualizarNegocio,
  useApagarNegocio,
  useBusiness,
  useInteractions,
  useOpportunities,
  useProfiles,
  useTasks,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/negocios/$id")({
  head: () => ({
    meta: [
      { title: "Ficha do Cliente — Nova Web Studio" },
      {
        name: "description",
        content: "Ficha 360º de cliente, propostas, tarefas, arquivos e histórico.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FichaNegocio,
});

type SeparadorFicha = "geral" | "chamadas" | "propostas" | "tarefas" | "satisfacao" | "arquivos" | "auditoria";

function FichaNegocio() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: negocio, isLoading } = useBusiness(id);
  const { data: chamadas = [] } = useInteractions(id);
  const { data: oportunidades = [] } = useOpportunities(id);
  const { data: historico = [] } = useActivity(id);
  const { data: tarefas = [] } = useTasks();
  const { data: perfis = [] } = useProfiles();

  const actualizar = useActualizarNegocio();
  const apagar = useApagarNegocio();
  const { prefs } = usePreferencias();

  const [tab, setTab] = useState<SeparadorFicha>("geral");
  const [editar, setEditar] = useState(false);
  const [chamada, setChamada] = useState(false);
  const [tarefa, setTarefa] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Vazio texto="A carregar ficha do cliente..." />
      </div>
    );
  }

  if (!negocio) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Vazio texto="Cliente / Negócio não encontrado." />
      </div>
    );
  }

  const nomePor = (uid: string | null) =>
    perfis.find((p) => p.id === uid)?.nome ?? (uid ? "Equipa" : "Sistema");

  const tarefasNegocio = tarefas.filter((t) => t.business_id === negocio.id);
  const tarefasPendentes = tarefasNegocio.filter((t) => t.estado === "pendente");
  const estadoAtual = estadoInfo(negocio.estado);
  const prioridadeAtual = prioridadeInfo(negocio.prioridade);
  const camposExtra = lerCamposExtra(negocio.notas);
  const notasLimpas = notasSemExtras(negocio.notas);

  return (
    <div className="space-y-6">
      {/* NAVEGAÇÃO & HEADER DA FICHA 360 */}
      <div className="space-y-4">
        <Link
          to="/negocios"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="size-3.5" />
          <span>Voltar à lista de Negócios</span>
        </Link>

        {/* HERO CARD DO CLIENTE */}
        <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/60 p-6 sm:p-7 backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            {/* Dados Principais do Cliente */}
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {negocio.nome}
                </h1>
                <Chip tone={estadoAtual.tone}>{rotuloFase(prefs, negocio.estado)}</Chip>
                <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-surface/80 px-2.5 py-0.5 text-xs text-muted-foreground">
                  <Dot tone={prioridadeAtual.tone} />
                  {prioridadeAtual.label}
                </span>
              </div>

              {/* Informações de Contacto Rápidas */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                  <Building2 className="size-3.5 text-primary" />
                  {negocio.categoria ?? "Sem categoria definida"}
                </span>

                {negocio.localidade && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-info" />
                    {negocio.localidade}
                  </span>
                )}

                {negocio.telefone && (
                  <a
                    href={`tel:${negocio.telefone}`}
                    className="flex items-center gap-1.5 text-primary font-medium hover:underline"
                  >
                    <Phone className="size-3.5" />
                    {negocio.telefone}
                  </a>
                )}

                {negocio.email && (
                  <a
                    href={`mailto:${negocio.email}`}
                    className="flex items-center gap-1.5 text-info hover:underline"
                  >
                    <Mail className="size-3.5" />
                    {negocio.email}
                  </a>
                )}

                {negocio.website && (
                  <a
                    href={negocio.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition"
                  >
                    <Globe className="size-3.5" />
                    {negocio.website_dominio ?? negocio.website}
                    <ExternalLink className="size-2.5 opacity-60" />
                  </a>
                )}
              </div>
            </div>

            {/* Ações Rápidas & Mudança de Fase */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="h-9 rounded-xl border border-border/80 bg-surface-strong/80 px-3 text-xs font-semibold text-foreground transition hover:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary"
                value={negocio.estado}
                onChange={(ev) =>
                  actualizar.mutate({
                    id: negocio.id,
                    valores: { estado: ev.target.value as BusinessStatus },
                    descricao: `alterou o estado para ${rotuloFase(prefs, ev.target.value as BusinessStatus)}`,
                  })
                }
              >
                {ESTADOS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {rotuloFase(prefs, op.value as BusinessStatus)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setChamada(true)}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-95"
              >
                <Phone className="size-3.5" />
                <span>Registar Chamada</span>
              </button>

              <button
                type="button"
                onClick={() => setTarefa(true)}
                className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-surface-strong px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:bg-accent"
              >
                <CalendarClock className="size-3.5 text-warning" />
                <span>Agendar Tarefa</span>
              </button>

              <button
                type="button"
                onClick={() => setEditar(true)}
                className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-surface-strong px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground hover:bg-accent"
              >
                <Pencil className="size-3.5" />
                <span>Editar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      `Tens a certeza que pretendes eliminar definitivamente o cliente "${negocio.nome}"?`,
                    )
                  ) {
                    apagar.mutate(negocio.id, {
                      onSuccess: () => navigate({ to: "/negocios" }),
                    });
                  }
                }}
                className="grid size-9 place-items-center rounded-xl border border-border/70 bg-surface-strong text-muted-foreground transition hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
                aria-label="Apagar cliente"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* SEPARADORES DA FICHA 360 */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/70 bg-surface/50 p-1.5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setTab("geral")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "geral"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <Layers className="size-3.5" />
          <span>1. Visão Geral</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("chamadas")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "chamadas"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <PhoneCall className="size-3.5" />
          <span>2. Chamadas & Timeline</span>
          {chamadas.length > 0 && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[9px] font-bold",
                tab === "chamadas"
                  ? "bg-black/25 text-white"
                  : "bg-surface-strong text-muted-foreground",
              )}
            >
              {chamadas.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab("propostas")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "propostas"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <CircleDollarSign className="size-3.5" />
          <span>3. Oportunidades & Propostas</span>
          {oportunidades.length > 0 && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[9px] font-bold",
                tab === "propostas" ? "bg-black/25 text-white" : "bg-success/20 text-success",
              )}
            >
              {oportunidades.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab("tarefas")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "tarefas"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <ListTodo className="size-3.5" />
          <span>4. Tarefas & Follow-ups</span>
          {tarefasPendentes.length > 0 && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[9px] font-bold",
                tab === "tarefas" ? "bg-black/25 text-white" : "bg-warning/20 text-warning",
              )}
            >
              {tarefasPendentes.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab("satisfacao")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "satisfacao"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <MessageSquareHeart className="size-3.5" />
          <span>5. Satisfação & Testemunhos</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("arquivos")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "arquivos"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <FileArchive className="size-3.5" />
          <span>6. Arquivos & Staging (.rar)</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("auditoria")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "auditoria"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <History className="size-3.5" />
          <span>7. Auditoria & Log</span>
        </button>
      </div>

      {/* CONTEÚDO DOS SEPARADORES */}

      {/* TAB 1: VISÃO GERAL */}
      {tab === "geral" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card Resumo Comercial */}
          <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur-md space-y-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <CircleDollarSign className="size-4 text-primary" />
              Parâmetros Comerciais
            </h2>

            <dl className="divide-y divide-border/30 text-xs">
              <div className="flex justify-between py-2.5">
                <dt className="text-muted-foreground">Valor Estimado do Projeto</dt>
                <dd className="font-mono font-bold text-foreground text-sm">
                  {formatarMoeda(negocio.valor_estimado)}
                </dd>
              </div>

              <div className="flex justify-between py-2.5">
                <dt className="text-muted-foreground">Próxima Ação Agendada</dt>
                <dd className="font-semibold text-primary">{negocio.proxima_acao ?? "—"}</dd>
              </div>

              <div className="flex justify-between py-2.5">
                <dt className="text-muted-foreground">Data do Próximo Seguimento</dt>
                <dd className="font-medium text-foreground">
                  {negocio.data_seguimento ? formatarData(negocio.data_seguimento, true) : "—"}
                </dd>
              </div>

              <div className="flex justify-between py-2.5">
                <dt className="text-muted-foreground">Última Interação Realizada</dt>
                <dd className="font-medium text-foreground">
                  {formatarData(negocio.ultima_interacao, true)}
                </dd>
              </div>

              <div className="flex justify-between py-2.5">
                <dt className="text-muted-foreground">Encontrado por</dt>
                <dd className="font-semibold text-foreground">{nomePor(negocio.encontrado_por)}</dd>
              </div>

              <div className="flex justify-between py-2.5">
                <dt className="text-muted-foreground">Contactado por</dt>
                <dd className="font-semibold text-foreground">
                  {negocio.contactado_por ? nomePor(negocio.contactado_por) : "Ainda sem contacto"}
                </dd>
              </div>

              <div className="flex justify-between py-2.5">
                <dt className="text-muted-foreground">Origem da Lead</dt>
                <dd className="font-medium text-foreground">
                  {negocio.origem ?? "Prospeção direta"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Card Notas e Campos Extra */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur-md space-y-3">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Pencil className="size-4 text-info" />
                Notas do Projeto
              </h2>
              {notasLimpas ? (
                <div className="rounded-2xl border border-border/40 bg-surface/40 p-4 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                  {notasLimpas}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">
                  Sem notas registadas para este cliente.
                </p>
              )}
            </div>

            {/* Campos Personalizados */}
            {Object.keys(camposExtra).length > 0 && (
              <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur-md space-y-3">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="size-4 text-warning" />
                  Campos Personalizados
                </h2>
                <dl className="divide-y divide-border/30 text-xs">
                  {Object.entries(camposExtra).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2">
                      <dt className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</dt>
                      <dd className="font-medium text-foreground">{v || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CHAMADAS & TIMELINE */}
      {tab === "chamadas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="size-4 text-primary" />
              Histórico de Chamadas ({chamadas.length})
            </h2>
            <button
              type="button"
              onClick={() => setChamada(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
            >
              <Plus className="size-3.5" />
              <span>Nova Chamada</span>
            </button>
          </div>

          {chamadas.length === 0 ? (
            <div className="rounded-3xl border border-border/70 bg-surface/40 p-12 text-center">
              <Vazio texto="Ainda não existem chamadas registadas para este cliente." />
            </div>
          ) : (
            <div className="space-y-3">
              {chamadas.map((c) => {
                const r = resultadoInfo(c.resultado);
                return (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-border/60 bg-surface/50 p-4 text-xs transition hover:bg-surface-strong/60 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Chip tone={r?.tone ?? "muted"}>{r?.label ?? c.resultado}</Chip>
                        {c.pessoa_contactada && (
                          <span className="font-semibold text-foreground">
                            Falou com {c.pessoa_contactada}
                            {c.funcao ? ` (${c.funcao})` : ""}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {formatarData(c.ocorreu_em, true)} • {nomePor(c.realizada_por)}
                        {c.duracao_min ? ` • ${c.duracao_min} min` : ""}
                      </span>
                    </div>

                    {c.notas && (
                      <p className="rounded-xl bg-surface/80 p-3 text-xs leading-relaxed text-foreground border border-border/30">
                        {c.notas}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OPORTUNIDADES & PROPOSTAS */}
      {tab === "propostas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <CircleDollarSign className="size-4 text-success" />
                Oportunidades Comerciais & Propostas
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Qualificação comercial e probabilidade de conversão baseada em dados reais.
              </p>
            </div>
          </div>

          {oportunidades.length === 0 ? (
            <div className="rounded-3xl border border-border/70 bg-surface/40 p-12 text-center">
              <Vazio texto="Não existem oportunidades comerciais qualificadas registadas." />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {oportunidades.map((o) => (
                <div
                  key={o.id}
                  className="rounded-3xl border border-success/30 bg-success/5 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      {o.pretende ?? "Interesse Geral no Website"}
                    </span>
                    <span className="rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-bold text-success font-mono">
                      {o.probabilidade ?? 50}% probabilidade
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-border/40 bg-surface/60 p-2.5">
                      <span className="text-[10px] text-muted-foreground uppercase">
                        Valor Previsto
                      </span>
                      <p className="font-mono font-bold text-sm text-foreground mt-0.5">
                        {euros(o.orcamento_previsto ?? o.preco_indicado)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border/40 bg-surface/60 p-2.5">
                      <span className="text-[10px] text-muted-foreground uppercase">
                        Próxima Conversa
                      </span>
                      <p className="font-medium text-xs text-foreground mt-0.5">
                        {o.data_proxima_conversa
                          ? formatarData(o.data_proxima_conversa)
                          : "Por agendar"}
                      </p>
                    </div>
                  </div>

                  {o.tipo_projeto && (
                    <p className="text-xs text-muted-foreground bg-surface/40 p-2.5 rounded-xl border border-border/30">
                      Tipo: {o.tipo_projeto}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TAREFAS & FOLLOW-UPS */}
      {tab === "tarefas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <ListTodo className="size-4 text-warning" />
              Tarefas do Projeto ({tarefasNegocio.length})
            </h2>
            <button
              type="button"
              onClick={() => setTarefa(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
            >
              <Plus className="size-3.5" />
              <span>Nova Tarefa</span>
            </button>
          </div>

          {tarefasNegocio.length === 0 ? (
            <div className="rounded-3xl border border-border/70 bg-surface/40 p-12 text-center">
              <Vazio texto="Sem tarefas associadas a este cliente." />
            </div>
          ) : (
            <div className="space-y-2">
              {tarefasNegocio.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface/50 p-3.5 text-xs transition hover:bg-surface-strong/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground truncate">{t.titulo}</span>
                      <Chip
                        tone={
                          t.estado === "concluida" ? "success" : prioridadeInfo(t.prioridade).tone
                        }
                      >
                        {t.estado === "concluida" ? "Concluída" : "Pendente"}
                      </Chip>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {tipoTarefaLabel(t.tipo)} • Data: {formatarData(t.data_hora, true)}
                      {t.responsavel ? ` • Atribuída a ${nomePor(t.responsavel)}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SATISFAÇÃO DO CLIENTE */}
      {tab === "satisfacao" && (
        <SeccaoSatisfacaoNegocio businessId={negocio.id} businessNome={negocio.nome} />
      )}

      {/* TAB 6: ARQUIVOS & STAGING */}
      {tab === "arquivos" && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur-md">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
              <FileArchive className="size-4 text-primary" />
              Arquivos de Projeto & Staging (.rar / .zip até 300MB)
            </h2>
            <PainelArquivos businessId={negocio.id} />
          </div>
        </div>
      )}

      {/* TAB 7: AUDITORIA & LOG */}
      {tab === "auditoria" && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <History className="size-4 text-info" />
            Histórico Imutável de Alterações
          </h2>

          {historico.length === 0 ? (
            <div className="rounded-3xl border border-border/70 bg-surface/40 p-12 text-center">
              <Vazio texto="Sem atividade registada para este projeto." />
            </div>
          ) : (
            <div className="rounded-3xl border border-border/70 bg-surface/40 p-5 divide-y divide-border/30">
              {historico.map((h) => (
                <div key={h.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-foreground">{nomePor(h.autor)}</span>{" "}
                    <span className="text-muted-foreground">{h.accao}</span>
                    {h.detalhe && (
                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5 bg-surface/80 p-1.5 rounded">
                        {h.detalhe}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                    {formatarData(h.created_at, true)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAIS OPERACIONAIS */}
      {editar && <DialogNegocio aberto onFechar={() => setEditar(false)} negocio={negocio} />}
      {chamada && <DialogChamada aberto onFechar={() => setChamada(false)} negocio={negocio} />}
      {tarefa && (
        <DialogTarefa aberto onFechar={() => setTarefa(false)} businessIdInicial={negocio.id} />
      )}
    </div>
  );
}
