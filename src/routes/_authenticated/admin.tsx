import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  HelpCircle,
  History,
  Key,
  Layers,
  Lock,
  Mail,
  MailPlus,
  Network,
  PhoneCall,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, Campo, Chip, Dot, Vazio } from "@/components/crm/Bits";
import { AnalyticsPainel } from "@/components/crm/AnalyticsPainel";
import { SegurancaPainel } from "@/components/crm/SegurancaPainel";
import {
  Modal,
  btnPequeno,
  btnPrimario,
  btnSecundario,
  inputClass,
  selectClass,
} from "@/components/crm/Modal";
import { useUtilizador } from "@/hooks/useAuth";
import { formatarData, formatarHora, formatarMoeda, type AppRole } from "@/lib/crm";
import {
  useActivity,
  useAlterarFuncao,
  useAnularConvite,
  useBusinesses,
  useConvidarMembro,
  useConvites,
  useInteractions,
  useProfiles,
  useRemoverMembro,
  useRoles,
  useTasks,
} from "@/lib/queries";
import { CARTOES_PAINEL, rotuloFase, usePreferencias } from "@/lib/preferencias";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administração & Governança — Nova Web Studio" },
      {
        name: "description",
        content:
          "Aplicação de administração da plataforma, equipa, analytics, segurança, RBAC e definições.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminApp,
});

type TabAdmin = "visao_geral" | "equipa" | "analytics" | "seguranca" | "permissoes" | "definicoes";

const FUNCOES: { value: AppRole; label: string; descricao: string }[] = [
  {
    value: "administrador",
    label: "Administrador",
    descricao: "Acesso integral a governança, equipa, segurança e definições.",
  },
  {
    value: "colaborador",
    label: "Colaborador",
    descricao: "Acesso operacional a CRM, clientes e tarefas.",
  },
];

function AdminApp() {
  const [tab, setTab] = useState<TabAdmin>("visao_geral");
  const [membroFocadoId, setMembroFocadoId] = useState<string | null>(null);
  const [auditFilter, setAuditFilter] = useState<"tudo" | "acessos" | "alteracoes">("tudo");

  // Modais de equipa
  const [modalConvidar, setModalConvidar] = useState(false);
  const [emailConvite, setEmailConvite] = useState("");
  const [roleConvite, setRoleConvite] = useState<AppRole>("colaborador");
  const [aRemoverId, setARemoverId] = useState<string | null>(null);

  const { userId, isAdmin, perfil, funcao } = useUtilizador();
  const { data: perfis = [], isLoading: loadingPerfis, isError: erroPerfis } = useProfiles();
  const { data: funcoes = [] } = useRoles();
  const { data: convites = [] } = useConvites();
  const { data: negocios = [] } = useBusinesses();
  const { data: tarefas = [] } = useTasks();
  const { data: chamadas = [] } = useInteractions();
  const {
    data: atividades = [],
    isLoading: loadingAtividades,
    isError: erroAtividades,
  } = useActivity();
  const { prefs, guardar } = usePreferencias();

  const convidar = useConvidarMembro();
  const anular = useAnularConvite();
  const remover = useRemoverMembro();
  const alterar = useAlterarFuncao();

  const funcaoDe = (id: string): AppRole =>
    (funcoes.find((f) => f.user_id === id)?.role as AppRole) ?? "colaborador";

  const pendentesConvites = convites.filter((c) => !c.aceite_em);
  const auditoriaFiltrada = atividades
    .filter((a) =>
      auditFilter === "tudo"
        ? true
        : auditFilter === "acessos"
          ? a.entidade === "seguranca"
          : a.entidade !== "seguranca",
    )
    .slice(0, 8);
  const dataCarregada = !loadingPerfis && !loadingAtividades && !erroPerfis && !erroAtividades;
  const membroARemover = perfis.find((p) => p.id === aRemoverId);

  // Membro focado para visualização de perfil
  const membroFocado = useMemo(() => {
    if (membroFocadoId) {
      return perfis.find((p) => p.id === membroFocadoId) ?? perfis[0];
    }
    return perfis.find((p) => p.id === userId) ?? perfis[0];
  }, [perfis, membroFocadoId, userId]);

  // Estatísticas de Produtividade do Membro Focado
  const statsMembroFocado = useMemo(() => {
    if (!membroFocado) return null;
    const mid = membroFocado.id;

    const negociosCriados = negocios.filter((n) => n.encontrado_por === mid);
    const negociosContactados = negocios.filter((n) => n.contactado_por === mid);
    const chamadasFeitas = chamadas.filter((c) => c.realizada_por === mid);
    const tarefasAtribuidas = tarefas.filter((t) => t.responsavel === mid);
    const tarefasConcluidas = tarefasAtribuidas.filter((t) => t.estado === "concluida");
    const atividadesDoMembro = atividades.filter((a) => a.autor === mid);

    const volumeTotal = negociosCriados.reduce((tot, n) => tot + Number(n.valor_estimado ?? 0), 0);

    return {
      negociosCriados: negociosCriados.length,
      negociosContactados: negociosContactados.length,
      chamadasFeitas: chamadasFeitas.length,
      tarefasAtribuidas: tarefasAtribuidas.length,
      tarefasConcluidas: tarefasConcluidas.length,
      volumeTotal,
      atividadesRecentes: atividadesDoMembro.slice(0, 8),
    };
  }, [membroFocado, negocios, chamadas, tarefas, atividades]);

  async function submeterConvite() {
    if (!emailConvite.trim()) return;
    await convidar.mutateAsync({ email: emailConvite, role: roleConvite });
    setEmailConvite("");
    setRoleConvite("colaborador");
    setModalConvidar(false);
  }

  return (
    <div className="space-y-6">
      {/* Centro de controlo: estado e atalhos operacionais */}
      <section className="relative overflow-hidden rounded-[28px] border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.13] via-surface/80 to-cyan-500/[0.06] p-5 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-32 size-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[.18em] text-violet-300">
              <ShieldCheck className="size-4" /> Centro de controlo{" "}
              <span className="size-1 rounded-full bg-violet-300/70" /> NWS Workspace
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Administração da plataforma
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              A tua equipa, atividade e segurança num só lugar. Consulta o estado das áreas e
              resolve o que precisa da tua atenção.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-semibold text-foreground">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    dataCarregada
                      ? "bg-emerald-400"
                      : erroPerfis || erroAtividades
                        ? "bg-rose-400"
                        : "bg-amber-400",
                  )}
                />
                {dataCarregada
                  ? "Dados disponíveis"
                  : erroPerfis || erroAtividades
                    ? "Dados parcialmente indisponíveis"
                    : "A carregar dados"}
              </span>
              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs text-violet-200">
                {isAdmin ? "Administrador" : "Acesso de colaborador"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:max-w-[240px] lg:justify-end">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setModalConvidar(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-violet-500/10 transition hover:bg-violet-300"
              >
                <UserPlus className="size-4" /> Convidar membro
              </button>
            )}
            <button
              type="button"
              onClick={() => setTab("seguranca")}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-300/20 bg-background/50 px-4 py-2.5 text-xs font-semibold text-foreground transition hover:border-violet-300/50"
            >
              <Shield className="size-4 text-violet-300" /> Centro de segurança
            </button>
          </div>
        </div>
      </section>

      {/* Navegação compacta e utilizável em ecrãs pequenos */}
      <nav
        aria-label="Áreas de administração"
        className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible"
      >
        {(
          [
            ["visao_geral", "Visão geral", Layers],
            ["equipa", `Equipa (${perfis.length})`, Users],
            ["analytics", "Analytics", BarChart3],
            ["seguranca", "Segurança", ShieldAlert],
            ["permissoes", "Permissões", Key],
            ["definicoes", "Definições", Settings],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition",
              tab === id
                ? "border-violet-400/50 bg-violet-500/15 text-violet-200 shadow-sm"
                : "border-border/50 bg-surface/50 text-muted-foreground hover:border-border hover:bg-surface-strong hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* CONTEÚDO DOS SEPARADORES */}

      {/* 1. VISÃO GERAL — métricas reais e ações úteis */}
      {tab === "visao_geral" && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Membros",
                value: loadingPerfis ? "…" : erroPerfis ? "—" : String(perfis.length),
                detail: "Contas com perfil",
                Icon: Users,
                tone: "text-cyan-300 bg-cyan-400/10",
              },
              {
                label: "Convites pendentes",
                value: String(pendentesConvites.length),
                detail: pendentesConvites.length ? "Por aceitar" : "Tudo em dia",
                Icon: Mail,
                tone: "text-amber-300 bg-amber-400/10",
              },
              {
                label: "Negócios",
                value: String(negocios.length),
                detail: "Registos no CRM",
                Icon: Building2,
                tone: "text-violet-300 bg-violet-400/10",
              },
              {
                label: "Eventos carregados",
                value: loadingAtividades ? "…" : erroAtividades ? "—" : String(atividades.length),
                detail: "Até 100 registos recentes",
                Icon: Activity,
                tone: "text-emerald-300 bg-emerald-400/10",
              },
            ].map(({ label, value, detail, Icon, tone }) => (
              <div
                key={label}
                className="group rounded-2xl border border-border/65 bg-surface/45 p-5 transition hover:border-violet-300/25 hover:bg-surface/75"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <span className={cn("grid size-9 place-items-center rounded-xl", tone)}>
                    <Icon className="size-4" />
                  </span>
                </div>
                <p className="mt-4 text-[32px] font-bold leading-none tracking-tight text-foreground">
                  {value}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,1fr)]">
            <section className="overflow-hidden rounded-2xl border border-border/60 bg-surface/35">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 p-5">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Activity className="size-4 text-cyan-300" /> Atividade recente
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ações registadas na plataforma, sem expor dados técnicos em bruto.
                  </p>
                </div>
                <div
                  className="flex gap-1 rounded-xl border border-border/60 bg-background/40 p-1"
                  aria-label="Filtrar auditoria"
                >
                  {(
                    [
                      ["tudo", "Tudo"],
                      ["acessos", "Acessos"],
                      ["alteracoes", "Alterações"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAuditFilter(value)}
                      className={cn(
                        "rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition",
                        auditFilter === value
                          ? "bg-violet-400/20 text-violet-200"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {erroAtividades ? (
                <div className="p-7 text-sm text-rose-300">
                  Não foi possível consultar a atividade. Consulta a área de Segurança para mais
                  detalhes.
                </div>
              ) : loadingAtividades ? (
                <div className="p-7 text-sm text-muted-foreground">A carregar eventos…</div>
              ) : auditoriaFiltrada.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Ainda não há eventos nesta categoria.
                </div>
              ) : (
                <div className="divide-y divide-border/30 px-5">
                  {auditoriaFiltrada.map((act) => (
                    <div key={act.id} className="flex items-start gap-3 py-3.5">
                      <span
                        className={cn(
                          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl",
                          act.entidade === "seguranca"
                            ? "bg-cyan-400/10 text-cyan-300"
                            : "bg-violet-400/10 text-violet-300",
                        )}
                      >
                        {act.entidade === "seguranca" ? (
                          <Shield className="size-4" />
                        ) : (
                          <Activity className="size-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-5 text-foreground">
                          <span className="font-bold">
                            {perfis.find((p) => p.id === act.autor)?.nome ?? "Equipa"}
                          </span>{" "}
                          <span className="text-muted-foreground">{act.accao}</span>
                        </p>
                        {act.detalhe && (
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {act.detalhe.trim().startsWith("{") ||
                            act.detalhe.trim().startsWith("[")
                              ? "Detalhe técnico disponível em Segurança"
                              : act.detalhe}
                          </p>
                        )}
                      </div>
                      <time
                        className="shrink-0 text-right text-[10px] text-muted-foreground"
                        dateTime={act.created_at}
                      >
                        {formatarData(act.created_at, true)}
                      </time>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setTab("seguranca")}
                className="w-full border-t border-border/50 px-5 py-3 text-left text-xs font-semibold text-cyan-300 transition hover:bg-surface-strong/50"
              >
                Abrir auditoria e segurança →
              </button>
            </section>
            <div className="space-y-5">
              <section className="rounded-2xl border border-border/60 bg-surface/40 p-5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-300" />
                  <h2 className="text-base font-semibold">Prioridades</h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">O que precisa da tua atenção.</p>
                <button
                  type="button"
                  onClick={() => setTab("equipa")}
                  className="mt-4 flex w-full items-center justify-between rounded-xl border border-border/60 bg-background/30 p-3 text-left transition hover:border-violet-400/40"
                >
                  <span>
                    <span className="block text-xs font-semibold">Convites de colaboradores</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {pendentesConvites.length
                        ? `${pendentesConvites.length} por aceitar`
                        : "Nenhum convite pendente"}
                    </span>
                  </span>
                  <Mail className="size-4 text-violet-300" />
                </button>
                {(erroPerfis || erroAtividades) && (
                  <div className="mt-3 rounded-xl border border-rose-400/25 bg-rose-400/5 p-3 text-xs text-rose-200">
                    Alguns dados não carregaram. Verifica a ligação e volta a tentar.
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setTab("permissoes")}
                  className="mt-3 flex w-full items-center justify-between rounded-xl border border-border/60 bg-background/30 p-3 text-left transition hover:border-violet-400/40"
                >
                  <span>
                    <span className="block text-xs font-semibold">Acessos e permissões</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      Rever funções da equipa
                    </span>
                  </span>
                  <Key className="size-4 text-cyan-300" />
                </button>
              </section>
              <section className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-400/10 to-transparent p-5">
                <h2 className="text-base font-semibold">Acesso rápido</h2>
                <p className="mt-1 text-xs text-muted-foreground">Ferramentas de administração.</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {(
                    [
                      ["Equipa", "equipa", Users],
                      ["Analytics", "analytics", BarChart3],
                      ["Segurança", "seguranca", ShieldAlert],
                      ["Definições", "definicoes", Settings],
                    ] as const
                  ).map(([label, destino, Icon]) => (
                    <button
                      key={destino}
                      type="button"
                      onClick={() => setTab(destino)}
                      className="flex flex-col items-start gap-3 rounded-xl border border-border/60 bg-background/40 p-3 text-left text-xs font-semibold transition hover:border-violet-300/40 hover:bg-surface-strong"
                    >
                      <Icon className="size-4 text-violet-300" />
                      {label}
                    </button>
                  ))}
                </div>
              </section>
              <p className="px-1 text-[11px] leading-5 text-muted-foreground">
                Os indicadores refletem apenas os registos carregados. O estado completo da
                infraestrutura e das políticas RLS não é inferido a partir destes números.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. EQUIPA & PERFIS */}
      {tab === "equipa" && (
        <div className="space-y-6">
          {/* Listagem de Membros */}
          <div className="rounded-3xl border border-border/70 bg-surface/40 backdrop-blur-md overflow-hidden">
            <div className="border-b border-border/60 bg-surface/30 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground">Membros com Acesso</h2>
                <p className="text-[10px] text-muted-foreground">
                  Gestão de acessos à plataforma Nova Web Studio.
                </p>
              </div>
            </div>

            <ul className="divide-y divide-border/30">
              {perfis.map((p) => {
                const f = funcaoDe(p.id);
                const proprio = p.id === userId;

                return (
                  <li
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition hover:bg-surface-strong/50"
                  >
                    <div className="flex items-center gap-3.5">
                      <Avatar nome={p.nome} url={p.foto_url} size="size-10" />
                      <div>
                        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                          <span>{p.nome ?? "Sem nome"}</span>
                          {proprio && (
                            <span className="rounded bg-info/20 px-1.5 py-0.2 text-[9px] font-bold text-info">
                              Tu
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Chip tone={f === "administrador" ? "primary" : "info"}>
                        {f === "administrador" ? "Administrador" : "Colaborador"}
                      </Chip>

                      <button
                        type="button"
                        onClick={() => setMembroFocadoId(p.id)}
                        className="rounded-xl border border-border/70 bg-surface/80 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-strong transition"
                      >
                        Inspecionar
                      </button>

                      {isAdmin && !proprio && (
                        <>
                          <select
                            className="h-8 rounded-xl border border-border/70 bg-surface/80 px-2.5 text-xs font-semibold text-foreground focus:outline-none"
                            value={f}
                            onChange={(e) =>
                              alterar.mutate({
                                userId: p.id,
                                role: e.target.value as AppRole,
                              })
                            }
                          >
                            {FUNCOES.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => setARemoverId(p.id)}
                            className="grid size-8 place-items-center rounded-xl border border-border/70 bg-surface/80 text-muted-foreground hover:text-danger hover:border-danger/40 transition"
                            aria-label={`Remover ${p.nome ?? p.email}`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Inspetor de Perfil Individual */}
          {membroFocado && statsMembroFocado && (
            <div className="rounded-3xl border border-info/30 bg-surface/50 p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-3">
                <Avatar nome={membroFocado.nome} url={membroFocado.foto_url} size="size-12" />
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Perfil Individual: {membroFocado.nome ?? membroFocado.email}
                  </h3>
                  <p className="text-xs text-muted-foreground">{membroFocado.email}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/50 bg-surface/60 p-3">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Negócios Angariados
                  </span>
                  <p className="text-xl font-bold font-mono text-foreground mt-1">
                    {statsMembroFocado.negociosCriados}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-surface/60 p-3">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Chamadas Realizadas
                  </span>
                  <p className="text-xl font-bold font-mono text-foreground mt-1">
                    {statsMembroFocado.chamadasFeitas}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-surface/60 p-3">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Tarefas Concluídas
                  </span>
                  <p className="text-xl font-bold font-mono text-foreground mt-1">
                    {statsMembroFocado.tarefasConcluidas} / {statsMembroFocado.tarefasAtribuidas}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Convites Pendentes */}
          <div className="rounded-3xl border border-border/70 bg-surface/40 backdrop-blur-md overflow-hidden">
            <div className="border-b border-border/60 bg-surface/30 px-6 py-4">
              <h2 className="text-sm font-bold text-foreground">Convites Pendentes</h2>
              <p className="text-[10px] text-muted-foreground">
                Emails autorizados a criar conta com papel pré-atribuído.
              </p>
            </div>

            {pendentesConvites.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Sem convites pendentes de aceitação.
              </div>
            ) : (
              <ul className="divide-y divide-border/30">
                {pendentesConvites.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6 transition hover:bg-surface-strong/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-xl bg-info/10 text-info">
                        <Mail className="size-4" />
                      </span>
                      <div>
                        <div className="font-semibold text-xs text-foreground">{c.email}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Convidado a {formatarData(c.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Chip tone={c.role === "administrador" ? "primary" : "info"}>
                        {c.role === "administrador" ? "Administrador" : "Colaborador"}
                      </Chip>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => anular.mutate(c.id)}
                          className="rounded-xl border border-border/70 bg-surface/80 px-2.5 py-1 text-xs font-semibold text-danger hover:bg-danger/10 transition"
                        >
                          Anular
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 3. ANALYTICS */}
      {tab === "analytics" && (
        <div className="space-y-6">
          <AnalyticsPainel />
        </div>
      )}

      {/* 4. SEGURANÇA */}
      {tab === "seguranca" && (
        <div className="space-y-6">
          <SegurancaPainel />
        </div>
      )}

      {/* 5. PERMISSÕES & RBAC */}
      {tab === "permissoes" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-foreground">
              Matriz de Governança RBAC & Políticas RLS
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Todas as permissões são aplicadas a nível de base de dados (PostgreSQL RLS) e Server
              Functions.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-primary/40 bg-surface/50 p-6 backdrop-blur-md space-y-4">
              <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider inline-block">
                Administrador
              </span>
              <ul className="space-y-2 text-xs text-foreground divide-y divide-border/30">
                <li className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Acesso completo à aplicação de Administração</span>
                </li>
                <li className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Convidar e remover membros da equipa</span>
                </li>
                <li className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Central de Segurança forense e auditoria de IPs</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-info/40 bg-surface/50 p-6 backdrop-blur-md space-y-4">
              <span className="rounded-full bg-info/20 px-3 py-1 text-xs font-bold text-info uppercase tracking-wider inline-block">
                Colaborador
              </span>
              <ul className="space-y-2 text-xs text-foreground divide-y divide-border/30">
                <li className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Acesso operacional ao CRM e Pipeline</span>
                </li>
                <li className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Registo de chamadas, contactos e tarefas</span>
                </li>
                <li className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Upload e download de ficheiros de projeto (.rar)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 6. DEFINIÇÕES DA PLATAFORMA */}
      {tab === "definicoes" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-foreground">
              Configurações Gerais da Plataforma
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personalização global da marca, moeda e preferências do sistema.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-border/70 bg-surface/40 p-6 backdrop-blur-md space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Identidade da Marca
              </h3>
              <Campo label="Nome da Marca">
                <input
                  className={inputClass}
                  value={prefs.marcaNome}
                  onChange={(e) => guardar({ marcaNome: e.target.value })}
                />
              </Campo>
              <Campo label="Subtítulo">
                <input
                  className={inputClass}
                  value={prefs.marcaSubtitulo}
                  onChange={(e) => guardar({ marcaSubtitulo: e.target.value })}
                />
              </Campo>
            </div>

            <div className="rounded-3xl border border-border/70 bg-surface/40 p-6 backdrop-blur-md space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Moeda e Localização
              </h3>
              <Campo label="Símbolo de Moeda">
                <select
                  className={selectClass}
                  value={prefs.moeda}
                  onChange={(e) => guardar({ moeda: e.target.value })}
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="GBP">Libra (£)</option>
                  <option value="BRL">Real (R$)</option>
                </select>
              </Campo>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONVIDAR COLABORADOR */}
      <Modal
        aberto={modalConvidar}
        onFechar={() => setModalConvidar(false)}
        titulo="Convidar Colaborador"
        descricao="O novo membro receberá acesso à plataforma ao autenticar-se com este email."
        rodape={
          <>
            <button className={btnSecundario} onClick={() => setModalConvidar(false)}>
              Cancelar
            </button>
            <button className={btnPrimario} onClick={submeterConvite} disabled={convidar.isPending}>
              Enviar Convite
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Campo label="Email do Colaborador">
            <input
              className={inputClass}
              type="email"
              value={emailConvite}
              onChange={(e) => setEmailConvite(e.target.value)}
              placeholder="colaborador@novawebstudio.pt"
            />
          </Campo>

          <Campo label="Função Prevista">
            <select
              className={selectClass}
              value={roleConvite}
              onChange={(e) => setRoleConvite(e.target.value as AppRole)}
            >
              {FUNCOES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label} — {o.descricao}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </Modal>

      {/* MODAL DE REMOVER COLABORADOR */}
      <Modal
        aberto={!!aRemoverId}
        onFechar={() => setARemoverId(null)}
        titulo="Remover Colaborador"
        descricao="Esta ação revoga definitivamente o acesso à plataforma e ao Supabase Auth."
        rodape={
          <>
            <button className={btnSecundario} onClick={() => setARemoverId(null)}>
              Cancelar
            </button>
            <button
              className={btnPrimario}
              disabled={remover.isPending}
              onClick={async () => {
                if (!aRemoverId) return;
                await remover.mutateAsync(aRemoverId);
                setARemoverId(null);
              }}
            >
              Confirmar Remoção
            </button>
          </>
        }
      >
        <p className="text-xs text-muted-foreground">
          Confirmas a remoção de{" "}
          <strong className="text-foreground">
            {membroARemover?.nome ?? membroARemover?.email ?? "este colaborador"}
          </strong>
          ?
        </p>
      </Modal>
    </div>
  );
}
