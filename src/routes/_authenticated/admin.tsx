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
import {
  formatarData,
  formatarHora,
  formatarMoeda,
  type AppRole,
} from "@/lib/crm";
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
import {
  CARTOES_PAINEL,
  rotuloFase,
  usePreferencias,
} from "@/lib/preferencias";
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

type TabAdmin =
  | "visao_geral"
  | "equipa"
  | "analytics"
  | "seguranca"
  | "permissoes"
  | "definicoes";

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

  // Modais de equipa
  const [modalConvidar, setModalConvidar] = useState(false);
  const [emailConvite, setEmailConvite] = useState("");
  const [roleConvite, setRoleConvite] = useState<AppRole>("colaborador");
  const [aRemoverId, setARemoverId] = useState<string | null>(null);

  const { userId, isAdmin, perfil, funcao } = useUtilizador();
  const { data: perfis = [], isLoading: loadingPerfis } = useProfiles();
  const { data: funcoes = [] } = useRoles();
  const { data: convites = [] } = useConvites();
  const { data: negocios = [] } = useBusinesses();
  const { data: tarefas = [] } = useTasks();
  const { data: chamadas = [] } = useInteractions();
  const { data: atividades = [] } = useActivity();
  const { prefs, guardar } = usePreferencias();

  const convidar = useConvidarMembro();
  const anular = useAnularConvite();
  const remover = useRemoverMembro();
  const alterar = useAlterarFuncao();

  const funcaoDe = (id: string): AppRole =>
    (funcoes.find((f) => f.user_id === id)?.role as AppRole) ?? "colaborador";

  const pendentesConvites = convites.filter((c) => !c.aceite_em);
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

    const volumeTotal = negociosCriados.reduce(
      (tot, n) => tot + Number(n.valor_estimado ?? 0),
      0,
    );

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
      {/* HEADER DA APLICAÇÃO ADMIN */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-info">
            <ShieldCheck className="size-4" />
            <span>NWS Workspace • Aplicação Central</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Administração & Governança
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Gestão da plataforma, membros, segurança forense, auditoria e definições globais.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setModalConvidar(true)}
            className="flex items-center gap-2 rounded-xl bg-info px-4 py-2 text-xs font-bold text-white shadow-lg shadow-info/20 transition hover:bg-info/90 active:scale-95"
          >
            <UserPlus className="size-4" />
            <span>Convidar Colaborador</span>
          </button>
        )}
      </div>

      {/* SEPARADORES DE NAVEGAÇÃO DA ADMINISTRAÇÃO */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/70 bg-surface/50 p-1.5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setTab("visao_geral")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "visao_geral"
              ? "bg-info text-white shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <Layers className="size-3.5" />
          <span>1. Visão Geral</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("equipa")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "equipa"
              ? "bg-info text-white shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <Users className="size-3.5" />
          <span>2. Equipa & Perfis ({perfis.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("analytics")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "analytics"
              ? "bg-info text-white shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <BarChart3 className="size-3.5" />
          <span>3. Analytics & Rendimento</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("seguranca")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "seguranca"
              ? "bg-info text-white shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <ShieldAlert className="size-3.5 text-danger" />
          <span>4. Segurança & Auditoria</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("permissoes")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "permissoes"
              ? "bg-info text-white shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <Key className="size-3.5" />
          <span>5. Permissões & RBAC</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("definicoes")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "definicoes"
              ? "bg-info text-white shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <Settings className="size-3.5" />
          <span>6. Definições da Plataforma</span>
        </button>
      </div>

      {/* CONTEÚDO DOS SEPARADORES */}

      {/* 1. VISÃO GERAL */}
      {tab === "visao_geral" && (
        <div className="space-y-6">
          {/* Card de Estado da Plataforma */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-border/70 bg-surface/50 p-5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-info" /> Membros na Plataforma
              </span>
              <p className="text-3xl font-bold font-mono text-foreground mt-2">
                {perfis.length}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {pendentesConvites.length} convite(s) pendente(s)
              </p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-surface/50 p-5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-success" /> Infraestrutura Supabase
              </span>
              <p className="text-xl font-bold text-success mt-2">
                Operacional
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                PostgreSQL • Auth • Storage RLS
              </p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-surface/50 p-5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" /> Sessão Atual
              </span>
              <p className="text-sm font-bold text-foreground mt-2 truncate">
                {perfil?.nome ?? "Utilizador"}
              </p>
              <p className="text-[10px] text-primary capitalize mt-1 font-semibold">
                Função: {funcao}
              </p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-surface/50 p-5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <Activity className="size-3.5 text-warning" /> Ações Registadas
              </span>
              <p className="text-3xl font-bold font-mono text-foreground mt-2">
                {atividades.length}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Total de logs de auditoria
              </p>
            </div>
          </div>

          {/* Atividade Recente da Plataforma */}
          <div className="rounded-3xl border border-border/70 bg-surface/40 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Activity className="size-4 text-info" />
                Auditoria Recente da Plataforma
              </h2>
            </div>

            {atividades.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                Sem eventos registados recentemente.
              </p>
            ) : (
              <div className="divide-y divide-border/30">
                {atividades.slice(0, 6).map((act) => (
                  <div
                    key={act.id}
                    className="py-3 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground">
                        {perfis.find((p) => p.id === act.autor)?.nome ?? "Equipa"}
                      </span>{" "}
                      <span className="text-muted-foreground">{act.accao}</span>
                      {act.detalhe && (
                        <p className="text-[10px] text-muted-foreground font-mono truncate max-w-md mt-0.5">
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
              Todas as permissões são aplicadas a nível de base de dados (PostgreSQL RLS) e Server Functions.
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
            <button
              className={btnPrimario}
              onClick={submeterConvite}
              disabled={convidar.isPending}
            >
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
