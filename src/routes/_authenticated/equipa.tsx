import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Key,
  Layers,
  ListTodo,
  Lock,
  Mail,
  MailPlus,
  Phone,
  PhoneCall,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, Campo, Chip, Dot, Panel, Vazio } from "@/components/crm/Bits";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/equipa")({
  head: () => ({
    meta: [
      { title: "Equipa & Governança — Nova Web Studio" },
      {
        name: "description",
        content: "Membros, produtividade individual, RBAC, analytics da equipa e sessões.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Equipa,
});

type SeparadorEquipa = "membros" | "perfil" | "analytics" | "permissoes" | "seguranca";

const FUNCOES: { value: AppRole; label: string; descricao: string }[] = [
  {
    value: "administrador",
    label: "Administrador",
    descricao: "Acesso total à gestão da equipa, segurança, eliminação e definições.",
  },
  {
    value: "colaborador",
    label: "Colaborador",
    descricao: "Gestão operacional de clientes, chamadas, tarefas e arquivos.",
  },
];

function Equipa() {
  const { userId, isAdmin, perfil: meuPerfil } = useUtilizador();
  const { data: perfis = [], isLoading } = useProfiles();
  const { data: funcoes = [] } = useRoles();
  const { data: convites = [] } = useConvites();
  const { data: negocios = [] } = useBusinesses();
  const { data: tarefas = [] } = useTasks();
  const { data: chamadas = [] } = useInteractions();
  const { data: atividades = [] } = useActivity();

  const convidar = useConvidarMembro();
  const anular = useAnularConvite();
  const remover = useRemoverMembro();
  const alterar = useAlterarFuncao();

  const [tab, setTab] = useState<SeparadorEquipa>("membros");
  const [membroSelecionadoId, setMembroSelecionadoId] = useState<string | null>(null);
  const [aberto, setAberto] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("colaborador");
  const [aRemover, setARemover] = useState<string | null>(null);

  const funcaoDe = (id: string): AppRole =>
    (funcoes.find((f) => f.user_id === id)?.role as AppRole) ?? "colaborador";

  const pendentes = convites.filter((c) => !c.aceite_em);
  const alvo = perfis.find((p) => p.id === aRemover);

  // Membro focado no separador de Perfil Individual
  const membroAtivo = useMemo(() => {
    if (membroSelecionadoId) {
      return perfis.find((p) => p.id === membroSelecionadoId) ?? perfis[0];
    }
    return perfis.find((p) => p.id === userId) ?? perfis[0];
  }, [perfis, membroSelecionadoId, userId]);

  // Métricas individuais do membro ativo
  const metricasMembro = useMemo(() => {
    if (!membroAtivo) return null;
    const mid = membroAtivo.id;

    const negociosCriados = negocios.filter((n) => n.encontrado_por === mid);
    const negociosContactados = negocios.filter((n) => n.contactado_por === mid);
    const chamadasFeitas = chamadas.filter((c) => c.realizada_por === mid);
    const tarefasAtribuidas = tarefas.filter((t) => t.responsavel === mid);
    const tarefasConcluidas = tarefasAtribuidas.filter((t) => t.estado === "concluida");
    const atividadesDoMembro = atividades.filter((a) => a.autor === mid);

    const valorAngariado = negociosCriados.reduce(
      (tot, n) => tot + Number(n.valor_estimado ?? 0),
      0,
    );

    return {
      negociosCriados: negociosCriados.length,
      negociosContactados: negociosContactados.length,
      chamadasFeitas: chamadasFeitas.length,
      tarefasAtribuidas: tarefasAtribuidas.length,
      tarefasConcluidas: tarefasConcluidas.length,
      valorAngariado,
      atividadesRecentes: atividadesDoMembro.slice(0, 10),
    };
  }, [membroAtivo, negocios, chamadas, tarefas, atividades]);

  // Analytics Global da Equipa
  const analyticsEquipa = useMemo(() => {
    const totalChamadas = chamadas.length;
    const totalTarefas = tarefas.length;
    const totalConcluidas = tarefas.filter((t) => t.estado === "concluida").length;
    const taxaCumprimento =
      totalTarefas > 0 ? Math.round((totalConcluidas / totalTarefas) * 100) : 100;

    const volumeTotal = negocios.reduce((tot, n) => tot + Number(n.valor_estimado ?? 0), 0);

    return {
      totalChamadas,
      totalTarefas,
      totalConcluidas,
      taxaCumprimento,
      volumeTotal,
    };
  }, [chamadas, tarefas, negocios]);

  async function submeterConvite() {
    if (!email.trim()) return;
    await convidar.mutateAsync({ email, role });
    setEmail("");
    setRole("colaborador");
    setAberto(false);
  }

  return (
    <div className="space-y-6">
      {/* HEADER DA EQUIPA */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Users className="size-3.5" />
            <span>Estrutura Organizacional</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Equipa & Governança
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {perfis.length} {perfis.length === 1 ? "membro ativo" : "membros ativos"} •{" "}
            {pendentes.length} {pendentes.length === 1 ? "convite pendente" : "convites pendentes"}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setAberto(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 active:scale-95"
          >
            <UserPlus className="size-4" />
            <span>Convidar Colaborador</span>
          </button>
        )}
      </div>

      {/* SEPARADORES DA EQUIPA */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/70 bg-surface/50 p-1.5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setTab("membros")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "membros"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <Users className="size-3.5" />
          <span>1. Membros & Convites</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("perfil")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "perfil"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <User className="size-3.5" />
          <span>2. Perfil Individual</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("analytics")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "analytics"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <BarChart3 className="size-3.5" />
          <span>3. Analytics & Produtividade</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("permissoes")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "permissoes"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <Key className="size-3.5" />
          <span>4. Permissões & RBAC</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("seguranca")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "seguranca"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <ShieldAlert className="size-3.5 text-danger" />
          <span>5. Segurança da Equipa</span>
        </button>
      </div>

      {/* SEPARADOR 1: MEMBROS & CONVITES */}
      {tab === "membros" && (
        <div className="space-y-6">
          {/* Tabela de Membros Ativos */}
          <div className="rounded-3xl border border-border/70 bg-surface/40 backdrop-blur-md overflow-hidden">
            <div className="border-b border-border/60 bg-surface/30 px-6 py-4">
              <h2 className="text-sm font-bold text-foreground">Colaboradores Ativos</h2>
              <p className="text-[10px] text-muted-foreground">
                Utilizadores com autenticação ativa e acesso autorizado ao CRM.
              </p>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                A carregar colaboradores...
              </div>
            ) : perfis.length === 0 ? (
              <div className="p-8 text-center">
                <Vazio texto="Ainda não existem membros registados." />
              </div>
            ) : (
              <ul className="divide-y divide-border/30">
                {perfis.map((p) => {
                  const f = funcaoDe(p.id);
                  const proprio = p.id === userId;
                  const totalNegocios = negocios.filter(
                    (n) => n.contactado_por === p.id || n.encontrado_por === p.id,
                  ).length;

                  return (
                    <li
                      key={p.id}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between transition hover:bg-surface-strong/60"
                    >
                      <div className="flex items-center gap-3.5">
                        <Avatar nome={p.nome} url={p.foto_url} size="size-11" />
                        <div>
                          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                            <span>{p.nome ?? "Sem nome"}</span>
                            {proprio && (
                              <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                                Tu
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{p.email}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {totalNegocios} projeto(s) associado(s)
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <Chip tone={f === "administrador" ? "primary" : "info"}>
                          {f === "administrador" ? "Administrador" : "Colaborador"}
                        </Chip>

                        <button
                          type="button"
                          onClick={() => {
                            setMembroSelecionadoId(p.id);
                            setTab("perfil");
                          }}
                          className="rounded-xl border border-border/70 bg-surface/80 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-surface-strong transition"
                        >
                          Ver Perfil
                        </button>

                        {isAdmin && !proprio && (
                          <>
                            <select
                              className="h-8 rounded-xl border border-border/70 bg-surface/80 px-2.5 text-xs font-semibold text-foreground transition focus:outline-none"
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
                              onClick={() => setARemover(p.id)}
                              className="grid size-8 place-items-center rounded-xl border border-border/70 bg-surface/80 text-muted-foreground hover:border-danger/40 hover:bg-danger/10 hover:text-danger transition"
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
            )}
          </div>

          {/* Painel de Convites Pendentes */}
          <div className="rounded-3xl border border-border/70 bg-surface/40 backdrop-blur-md overflow-hidden">
            <div className="border-b border-border/60 bg-surface/30 px-6 py-4">
              <h2 className="text-sm font-bold text-foreground">Convites Pendentes</h2>
              <p className="text-[10px] text-muted-foreground">
                Emails autorizados a aceder ao CRM após a criação de conta no Supabase Auth.
              </p>
            </div>

            {pendentes.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <MailPlus className="size-6 mx-auto mb-2 opacity-50" />
                Sem convites pendentes de aceitação.
              </div>
            ) : (
              <ul className="divide-y divide-border/30">
                {pendentes.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6 transition hover:bg-surface-strong/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Mail className="size-4" />
                      </span>
                      <div>
                        <div className="font-semibold text-xs text-foreground">{c.email}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Convidado em {formatarData(c.created_at)}
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

      {/* SEPARADOR 2: PERFIL INDIVIDUAL */}
      {tab === "perfil" && (
        <div className="space-y-6">
          {/* Seletor de Membro */}
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl border border-border/70 bg-surface/50">
            <span className="text-xs font-semibold text-muted-foreground px-2">
              Selecionar Colaborador:
            </span>
            {perfis.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setMembroSelecionadoId(p.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition",
                  membroAtivo?.id === p.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border/60 bg-surface/60 text-foreground hover:bg-surface-strong",
                )}
              >
                <Avatar nome={p.nome} url={p.foto_url} size="size-5" />
                <span>{p.nome ?? p.email}</span>
              </button>
            ))}
          </div>

          {membroAtivo && metricasMembro && (
            <div className="space-y-6">
              {/* Header do Membro */}
              <div className="rounded-3xl border border-border/70 bg-surface/60 p-6 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar nome={membroAtivo.nome} url={membroAtivo.foto_url} size="size-16" />
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {membroAtivo.nome ?? "Sem nome"}
                    </h2>
                    <p className="text-xs text-muted-foreground">{membroAtivo.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Chip
                        tone={funcaoDe(membroAtivo.id) === "administrador" ? "primary" : "info"}
                      >
                        {funcaoDe(membroAtivo.id) === "administrador"
                          ? "Administrador"
                          : "Colaborador"}
                      </Chip>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-surface/80 p-4 text-right">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Volume Total Angariado
                  </span>
                  <p className="text-xl font-mono font-bold text-primary mt-0.5">
                    {formatarMoeda(metricasMembro.valorAngariado)}
                  </p>
                </div>
              </div>

              {/* Grid de Produtividade Individual */}
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-border/70 bg-surface/50 p-4">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Negócios Angariados
                  </span>
                  <p className="text-2xl font-bold font-mono text-foreground mt-1">
                    {metricasMembro.negociosCriados}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-surface/50 p-4">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Contactos Atribuídos
                  </span>
                  <p className="text-2xl font-bold font-mono text-foreground mt-1">
                    {metricasMembro.negociosContactados}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-surface/50 p-4">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Chamadas Realizadas
                  </span>
                  <p className="text-2xl font-bold font-mono text-foreground mt-1">
                    {metricasMembro.chamadasFeitas}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-surface/50 p-4">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Tarefas Concluídas
                  </span>
                  <p className="text-2xl font-bold font-mono text-foreground mt-1">
                    {metricasMembro.tarefasConcluidas} / {metricasMembro.tarefasAtribuidas}
                  </p>
                </div>
              </div>

              {/* Atividade Recente do Membro */}
              <div className="rounded-3xl border border-border/70 bg-surface/40 p-5 backdrop-blur-md space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Últimas Ações de {membroAtivo.nome}
                </h3>
                {metricasMembro.atividadesRecentes.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    Sem atividade recente registada.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {metricasMembro.atividadesRecentes.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between rounded-xl border border-border/30 bg-surface/60 p-2.5 text-xs"
                      >
                        <span className="text-foreground">{act.accao}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatarData(act.created_at, true)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEPARADOR 3: ANALYTICS & PRODUTIVIDADE */}
      {tab === "analytics" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-foreground">Métricas Operacionais da Equipa</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rendimento coletivo calculado exclusivamente a partir de dados reais do CRM.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-surface/50 p-5">
              <span className="text-[10px] uppercase font-bold text-primary flex items-center gap-1.5">
                <PhoneCall className="size-3.5" /> Total de Interações
              </span>
              <p className="text-3xl font-bold font-mono text-foreground mt-2">
                {analyticsEquipa.totalChamadas}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Chamadas registadas</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-surface/50 p-5">
              <span className="text-[10px] uppercase font-bold text-success flex items-center gap-1.5">
                <CalendarCheck2 className="size-3.5" /> Cumprimento de Tarefas
              </span>
              <p className="text-3xl font-bold font-mono text-foreground mt-2">
                {analyticsEquipa.taxaCumprimento}%
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {analyticsEquipa.totalConcluidas} de {analyticsEquipa.totalTarefas} tarefas
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-surface/50 p-5">
              <span className="text-[10px] uppercase font-bold text-warning flex items-center gap-1.5">
                <CircleDollarSign className="size-3.5" /> Volume Total Gerido
              </span>
              <p className="text-2xl font-bold font-mono text-foreground mt-2">
                {formatarMoeda(analyticsEquipa.volumeTotal)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {negocios.length} clientes/projetos
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-surface/50 p-5">
              <span className="text-[10px] uppercase font-bold text-info flex items-center gap-1.5">
                <Users className="size-3.5" /> Membros em Operação
              </span>
              <p className="text-3xl font-bold font-mono text-foreground mt-2">{perfis.length}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Contas ativas</p>
            </div>
          </div>
        </div>
      )}

      {/* SEPARADOR 4: PERMISSÕES & MATRIZ RBAC */}
      {tab === "permissoes" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-foreground">
              Matriz de Permissões (RBAC) & Segurança RLS
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Todas as permissões são validadas a nível de base de dados (PostgreSQL RLS) e Server
              Functions.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Card Administrador */}
            <div className="rounded-3xl border border-primary/40 bg-surface/50 p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                  Administrador
                </span>
                <ShieldCheck className="size-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                Controlo total de gestão, governança, segurança e infraestrutura.
              </p>
              <ul className="space-y-2 text-xs text-foreground divide-y divide-border/30">
                <li className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Convidar novos membros e anular convites</span>
                </li>
                <li className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Alterar funções e remover colaboradores</span>
                </li>
                <li className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Acesso completo à Central de Segurança & IPs</span>
                </li>
                <li className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Eliminação definitiva de clientes e arquivos</span>
                </li>
              </ul>
            </div>

            {/* Card Colaborador */}
            <div className="rounded-3xl border border-info/40 bg-surface/50 p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-info/20 px-3 py-1 text-xs font-bold text-info uppercase tracking-wider">
                  Colaborador
                </span>
                <UserCheck className="size-5 text-info" />
              </div>
              <p className="text-xs text-muted-foreground">
                Acesso operacional à prospeção, pipeline e acompanhamento de clientes.
              </p>
              <ul className="space-y-2 text-xs text-foreground divide-y divide-border/30">
                <li className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Criar, editar e mover projetos no Pipeline</span>
                </li>
                <li className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Registar chamadas e criar tarefas comerciais</span>
                </li>
                <li className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Carregar e descarregar arquivos de projeto (.rar)</span>
                </li>
                <li className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>Consultar e responder a pedidos do website</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SEPARADOR 5: SEGURANÇA & SESSÕES DA EQUIPA */}
      {tab === "seguranca" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-foreground">
              Sessões & Auditoria de Acessos da Equipa
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Monitorização de integridade das contas dos colaboradores.
            </p>
          </div>

          <div className="rounded-3xl border border-border/70 bg-surface/40 p-5 divide-y divide-border/30">
            {perfis.map((p) => {
              const ultimosLogins = atividades.filter(
                (a) => a.autor === p.id && a.entidade === "seguranca",
              );

              return (
                <div
                  key={p.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Avatar nome={p.nome} url={p.foto_url} size="size-9" />
                    <div>
                      <div className="font-bold text-foreground">{p.nome ?? p.email}</div>
                      <div className="text-[10px] text-muted-foreground">{p.email}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Última Atividade Registada
                    </span>
                    <p className="text-xs font-mono font-medium text-foreground">
                      {ultimosLogins[0]
                        ? formatarData(ultimosLogins[0].created_at, true)
                        : "Sem registo recente"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAIS DE CONVITE E REMOÇÃO */}
      <Modal
        aberto={aberto}
        onFechar={() => setAberto(false)}
        titulo="Convidar Colaborador"
        descricao="O novo membro terá acesso ao CRM assim que criar conta com este email."
        rodape={
          <>
            <button className={btnSecundario} onClick={() => setAberto(false)}>
              Cancelar
            </button>
            <button className={btnPrimario} onClick={submeterConvite} disabled={convidar.isPending}>
              Enviar Convite
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Campo label="Email Profissional">
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@novawebstudio.pt"
            />
          </Campo>

          <Campo label="Função Prevista">
            <select
              className={selectClass}
              value={role}
              onChange={(e) => setRole(e.target.value as AppRole)}
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

      <Modal
        aberto={!!aRemover}
        onFechar={() => setARemover(null)}
        titulo="Remover Colaborador"
        descricao="Esta ação remove definitivamente a conta do Supabase Auth e do CRM."
        rodape={
          <>
            <button className={btnSecundario} onClick={() => setARemover(null)}>
              Cancelar
            </button>
            <button
              className={btnPrimario}
              disabled={remover.isPending}
              onClick={async () => {
                if (!aRemover) return;
                await remover.mutateAsync(aRemover);
                setARemover(null);
              }}
            >
              Confirmar Remoção
            </button>
          </>
        }
      >
        <p className="text-xs text-muted-foreground">
          Confirmas a remoção de {alvo?.nome ?? alvo?.email ?? "este colaborador"}? Todos os acessos
          serão revogados imediatamente.
        </p>
      </Modal>
    </div>
  );
}
