import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  ExternalLink,
  FileArchive,
  Flame,
  Globe,
  Grid,
  History,
  Key,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Phone,
  Plus,
  QrCode,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Table2,
  Trophy,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";

import { Avatar } from "@/components/crm/Bits";
import { CommandPalette } from "@/components/crm/CommandPalette";
import { NotificationCenter } from "@/components/crm/NotificationCenter";
import { DialogNegocio } from "@/components/crm/DialogNegocio";
import { DialogTarefa } from "@/components/crm/DialogTarefa";
import { supabase } from "@/integrations/supabase/client";
import { useUtilizador } from "@/hooks/useAuth";
import { PreferenciasProvider, rotuloSeccao, usePreferencias } from "@/lib/preferencias";
import { obterContextoSeguranca } from "@/lib/security.functions";
import { useBusinesses, useTasks, useWebsiteRequests } from "@/lib/queries";
import { adminQuery } from "@/lib/restaurant/store";
import { todayISO } from "@/lib/restaurant/demo-data";
import { isDemoMode, demoStore } from "@/lib/demo-mode";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Navegação focada exclusivamente no CRM Comercial
const NAVEGACAO_CRM = [
  {
    titulo: "Gestão Comercial",
    itens: [
      {
        to: "/painel",
        label: "Command Center",
        sublabel: "Dashboard Comercial",
        icon: LayoutDashboard,
      },
      {
        to: "/negocios",
        label: "Negócios & Clientes",
        sublabel: "Criação de Sites",
        icon: BriefcaseBusiness,
        chave: "negocios",
      },
      {
        to: "/pipeline",
        label: "Pipeline Comercial",
        sublabel: "Quadro Kanban",
        icon: BarChart3,
      },
      {
        to: "/tarefas",
        label: "Tarefas & Agenda",
        sublabel: "Follow-ups e Prazos",
        icon: CalendarClock,
        chave: "tarefas",
      },
      {
        to: "/pedidos",
        label: "Pedidos do Site",
        sublabel: "Contactos Recebidos",
        icon: Globe,
        chave: "pedidos",
      },
    ],
  },
  {
    titulo: "Recursos & Produção",
    itens: [
      {
        to: "/emails",
        label: "Modelos de Email",
        sublabel: "Templates Comerciais",
        icon: Mail,
      },
      {
        to: "/projetos",
        label: "Portfólio de Projetos",
        sublabel: "Vitrine e GitHub",
        icon: Sparkles,
      },
      {
        to: "/arquivos",
        label: "Arquivos de Projetos",
        sublabel: "Staging e Backups .rar",
        icon: FileArchive,
      },
      {
        to: "/definicoes",
        label: "Definições do CRM",
        sublabel: "Preferências e Fases",
        icon: Settings,
      },
    ],
  },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <PreferenciasProvider>
      <AppShellInner>{children}</AppShellInner>
    </PreferenciasProvider>
  );
}

function AppShellInner({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [cmdAberto, setCmdAberto] = useState(false);
  const [modalNovoNegocio, setModalNovoNegocio] = useState(false);
  const [modalNovaTarefa, setModalNovaTarefa] = useState(false);

  const navigate = useNavigate();
  const qc = useQueryClient();

  const { perfil, funcao, isAdmin } = useUtilizador();
  const { data: negocios = [] } = useBusinesses();
  const { data: tarefas = [] } = useTasks();
  const { data: pedidos = [] } = useWebsiteRequests();
  const { prefs } = usePreferencias();

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const ehHub = pathname === "/hub";
  const ehAdmin = pathname.startsWith("/admin");
  const ehRestaurantes = pathname.startsWith("/produtos/restaurantes");
  const ehMatch = pathname.startsWith("/produtos/match");

  // Consulta do restaurante quando na área de restaurantes
  const { data: restData } = useQuery({
    ...adminQuery(),
    enabled: ehRestaurantes,
  });

  const restCounts = useMemo(() => {
    if (!restData)
      return { pedidos: 0, pedidosNovos: 0, pedidosAbertos: 0, mesasAtencao: 0, reservasHoje: 0 };
    const pedidosNovos = restData.orders.filter((o) => !o.closed && o.status === "recebido").length;
    const pedidosAbertos = restData.orders.filter(
      (o) => !o.closed && o.status !== "entregue",
    ).length;
    const mesasAtencao = restData.requests.filter((r) => !r.resolved).length;
    const reservasHoje = restData.reservations.filter(
      (r) => r.date === todayISO() && r.status !== "cancelada" && r.status !== "concluida",
    ).length;
    return { pedidos: pedidosAbertos, pedidosNovos, pedidosAbertos, mesasAtencao, reservasHoje };
  }, [restData]);

  const contagens = useMemo(
    () => ({
      negocios: negocios.length,
      tarefas: tarefas.filter((t) => t.estado === "pendente").length,
      pedidos: pedidos.filter((p) => !p.tratado).length,
      prioridade: negocios.filter(
        (n) => n.prioridade === "alta" && !["concluido", "arquivado"].includes(n.estado),
      ).length,
      emails: negocios.filter((n) => n.estado === "email_por_enviar").length,
      seguimentos: negocios.filter((n) => n.estado === "seguimento").length,
    }),
    [negocios, tarefas, pedidos],
  );

  // Breadcrumbs contextuais
  const breadcrumb = useMemo(() => {
    if (ehHub) return { app: "NWS Workspace", tela: "Hub Central" };
    if (ehAdmin) return { app: "Administração", tela: "Governança da Plataforma" };

    // Breadcrumbs detalhados do NWS Restaurantes
    if (ehRestaurantes) {
      if (pathname === "/produtos/restaurantes") {
        return { app: "NWS Restaurantes", tela: "Visão Geral" };
      }
      if (pathname.startsWith("/produtos/restaurantes/pedidos")) {
        return { app: "NWS Restaurantes", tela: "Quadro de Pedidos & Cozinha" };
      }
      if (pathname.startsWith("/produtos/restaurantes/mesas")) {
        return { app: "NWS Restaurantes", tela: "Mesas & QR Codes" };
      }
      if (pathname.startsWith("/produtos/restaurantes/menu")) {
        return { app: "NWS Restaurantes", tela: "Menu & Ementa Digital" };
      }
      if (pathname.startsWith("/produtos/restaurantes/reservas")) {
        return { app: "NWS Restaurantes", tela: "Gestão de Reservas" };
      }
      if (pathname.startsWith("/produtos/restaurantes/equipa")) {
        return { app: "NWS Restaurantes", tela: "Equipa & Acessos" };
      }
      if (pathname.startsWith("/produtos/restaurantes/definicoes")) {
        return { app: "NWS Restaurantes", tela: "Configurações" };
      }
      return { app: "NWS Restaurantes", tela: "Gestão Gastronómica" };
    }

    if (ehMatch) return { app: "NWS Match", tela: "Estatísticas Desportivas" };

    if (pathname.startsWith("/negocios/")) {
      return { app: "Nova Web Studio CRM", tela: "Ficha do Cliente" };
    }
    if (pathname.startsWith("/negocios")) {
      return { app: "Nova Web Studio CRM", tela: "Negócios & Clientes" };
    }
    if (pathname.startsWith("/pipeline")) {
      return { app: "Nova Web Studio CRM", tela: "Pipeline Comercial" };
    }
    if (pathname.startsWith("/tarefas")) {
      return { app: "Nova Web Studio CRM", tela: "Tarefas & Agenda" };
    }
    if (pathname.startsWith("/pedidos")) {
      return { app: "Nova Web Studio CRM", tela: "Pedidos do Site" };
    }
    if (pathname.startsWith("/emails")) {
      return { app: "Nova Web Studio CRM", tela: "Modelos de Email" };
    }
    if (pathname.startsWith("/projetos")) {
      return { app: "Nova Web Studio CRM", tela: "Portfólio" };
    }
    if (pathname.startsWith("/arquivos")) {
      return { app: "Nova Web Studio CRM", tela: "Arquivos .rar" };
    }
    if (pathname.startsWith("/definicoes")) {
      return { app: "Nova Web Studio CRM", tela: "Definições" };
    }
    return { app: "Nova Web Studio CRM", tela: "Command Center" };
  }, [pathname, ehHub, ehAdmin, ehRestaurantes, ehMatch]);

  async function registarLogout() {
    try {
      const { data: dadosUtilizador } = await supabase.auth.getUser();
      const user = dadosUtilizador?.user;
      if (!user) return;

      const contexto = await obterContextoSeguranca();
      const detalhe = JSON.stringify({
        ip: contexto.ip,
        pais: contexto.pais,
        cidade: contexto.cidade,
        email: user.email ?? null,
        user_id: user.id,
        sucesso: true,
        tipo: "logout",
        user_agent: contexto.userAgent,
      });

      await supabase.from("activity_log").insert({
        entidade: "seguranca",
        entidade_id: user.id,
        accao: "terminou sessão",
        detalhe,
        autor: user.id,
        business_id: null,
      });
    } catch (error) {
      console.error("[Segurança] Erro no logout:", error);
    }
  }

  async function terminarSessao() {
    await registarLogout();
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Luz ambiente discreta */}
      <div className="orbit-glow pointer-events-none fixed inset-0 z-0" />

      {/* Backdrop Mobile */}
      {menu && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md lg:hidden"
          onClick={() => setMenu(false)}
        />
      )}

      {/* ============================================================ */}
      {/* SIDEBAR DEDICADA DO CRM (Não renderiza no Hub)               */}
      {/* ============================================================ */}
      {!ehHub && (
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border/70 bg-sidebar/95 backdrop-blur-2xl transition-transform duration-200 lg:translate-x-0",
            menu ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {/* Topo da Sidebar: Botão de Retorno ao Workspace Hub */}
          <div className="p-3 border-b border-border/60">
            <Link
              to="/hub"
              className="flex w-full items-center gap-2.5 rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/20 hover:border-primary/50 shadow-sm"
            >
              <Grid className="size-4" />
              <span className="flex-1 truncate">NWS Workspace</span>
              <ChevronLeft className="size-3.5 opacity-60" />
            </Link>
          </div>

          {/* Nome da Aplicação Atual */}
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-lg bg-surface-strong text-primary">
                {ehAdmin ? (
                  <ShieldCheck className="size-3.5 text-info" />
                ) : ehRestaurantes ? (
                  <UtensilsCrossed className="size-3.5 text-warning" />
                ) : ehMatch ? (
                  <Trophy className="size-3.5 text-emerald-400" />
                ) : (
                  <BriefcaseBusiness className="size-3.5 text-primary" />
                )}
              </span>
              <span className="font-bold text-xs text-foreground truncate">
                {ehAdmin
                  ? "Administração"
                  : ehRestaurantes
                    ? "NWS Restaurantes"
                    : ehMatch
                      ? "NWS Match"
                      : "Nova Web Studio CRM"}
              </span>
            </div>

            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMenu(false)}
              aria-label="Fechar menu"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Pesquisa Global na Sidebar */}
          <div className="px-3 pt-3">
            <button
              type="button"
              onClick={() => setCmdAberto(true)}
              className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-surface/50 px-3 py-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:bg-surface-strong hover:text-foreground"
            >
              <div className="flex items-center gap-2">
                <Search className="size-3.5 text-primary" />
                <span>Pesquisar...</span>
              </div>
              <kbd className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 text-[9px] font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Navegação da Aplicação */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-sm">
            {/* Navegação Normal do CRM */}
            {!ehAdmin && !ehRestaurantes && !ehMatch && (
              <>
                {NAVEGACAO_CRM.map((categoria) => (
                  <div key={categoria.titulo} className="space-y-1">
                    <div className="px-2.5 text-[10px] font-bold uppercase tracking-[.2em] text-muted-foreground/70">
                      {categoria.titulo}
                    </div>

                    <div className="space-y-0.5">
                      {categoria.itens.map((item) => (
                        <NavItem
                          key={item.to}
                          to={item.to}
                          icon={item.icon}
                          label={rotuloSeccao(prefs, item.to, item.label)}
                          active={
                            pathname === item.to ||
                            (item.to !== "/painel" && pathname.startsWith(item.to))
                          }
                          count={
                            prefs.mostrarContagens && "chave" in item && item.chave
                              ? contagens[item.chave as "negocios" | "tarefas" | "pedidos"]
                              : undefined
                          }
                          onClick={() => setMenu(false)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Navegação se estiver na Administração */}
            {ehAdmin && (
              <div className="space-y-1">
                <div className="px-2.5 text-[10px] font-bold uppercase tracking-[.2em] text-muted-foreground/70">
                  Painel de Administração
                </div>
                <NavItem
                  to="/admin"
                  icon={Layers}
                  label="Visão Geral"
                  active={pathname === "/admin"}
                  onClick={() => setMenu(false)}
                />
              </div>
            )}

            {/* Navegação se estiver no Restaurantes */}
            {ehRestaurantes && (
              <div className="space-y-1">
                <div className="px-2.5 text-[10px] font-bold uppercase tracking-[.2em] text-warning/90 flex items-center justify-between">
                  <span>NWS Restaurantes</span>
                  <span className="size-2 rounded-full bg-warning animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <NavItem
                    to="/produtos/restaurantes"
                    icon={LayoutDashboard}
                    label="Visão Geral"
                    active={pathname === "/produtos/restaurantes"}
                    onClick={() => setMenu(false)}
                  />
                  <NavItem
                    to="/produtos/restaurantes/pedidos"
                    icon={ClipboardList}
                    label="Pedidos & Cozinha"
                    count={restCounts.pedidosNovos}
                    active={pathname.startsWith("/produtos/restaurantes/pedidos")}
                    onClick={() => setMenu(false)}
                  />
                  <NavItem
                    to="/produtos/restaurantes/mesas"
                    icon={Table2}
                    label="Mesas & QR Codes"
                    count={restCounts.mesasAtencao}
                    active={pathname.startsWith("/produtos/restaurantes/mesas")}
                    onClick={() => setMenu(false)}
                  />
                  <NavItem
                    to="/produtos/restaurantes/menu"
                    icon={UtensilsCrossed}
                    label="Menu & Ementa"
                    active={pathname.startsWith("/produtos/restaurantes/menu")}
                    onClick={() => setMenu(false)}
                  />
                  <NavItem
                    to="/produtos/restaurantes/reservas"
                    icon={CalendarDays}
                    label="Reservas"
                    count={restCounts.reservasHoje}
                    active={pathname.startsWith("/produtos/restaurantes/reservas")}
                    onClick={() => setMenu(false)}
                  />
                  <NavItem
                    to="/produtos/restaurantes/equipa"
                    icon={Users}
                    label="Equipa & Acessos"
                    active={pathname.startsWith("/produtos/restaurantes/equipa")}
                    onClick={() => setMenu(false)}
                  />
                  <NavItem
                    to="/produtos/restaurantes/definicoes"
                    icon={Settings}
                    label="Configurações"
                    active={pathname.startsWith("/produtos/restaurantes/definicoes")}
                    onClick={() => setMenu(false)}
                  />
                </div>

                {!isDemoMode() && (
                  <div className="pt-4 border-t border-border/40 mt-4 px-2">
                    <a
                      href="https://restaurante.novawebstudio.pt"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs font-semibold text-warning hover:bg-warning/20 transition"
                    >
                      <span className="flex items-center gap-1.5">
                        <Globe className="size-3.5" />
                        <span>Ementa Pública</span>
                      </span>
                      <ExternalLink className="size-3 opacity-70" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Navegação se estiver no Match */}
            {ehMatch && (
              <div className="space-y-1">
                <div className="px-2.5 text-[10px] font-bold uppercase tracking-[.2em] text-muted-foreground/70">
                  NWS Match
                </div>
                <NavItem
                  to="/produtos/match"
                  icon={Trophy}
                  label="NWS Match"
                  active={pathname === "/produtos/match"}
                  onClick={() => setMenu(false)}
                />
              </div>
            )}
          </div>

          {/* Rodapé da Sidebar */}
          <div className="border-t border-border/60 bg-surface/30 p-3 space-y-2">
            <div className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-surface/50 p-2">
              <Avatar nome={perfil?.nome} url={perfil?.foto_url} size="size-8" />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-foreground">
                  {perfil?.nome ?? "Utilizador"}
                </span>
                <span className="block truncate text-[10px] capitalize text-primary font-medium">
                  {funcao ?? "Colaborador"}
                </span>
              </div>
            </div>

            <button
              onClick={terminarSessao}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-muted-foreground transition hover:bg-danger/10 hover:text-danger"
            >
              <LogOut className="size-3.5" />
              <span>Terminar Sessão</span>
            </button>
          </div>
        </aside>
      )}

      {/* ============================================================ */}
      {/* CONTEÚDO PRINCIPAL (COM HEADER CONTEXTUAL)                   */}
      {/* ============================================================ */}
      <div className={cn("flex-1 flex flex-col min-w-0 relative z-10", !ehHub && "lg:pl-[260px]")}>
        {/* Banner de Identificação de Staging / Modo de Demonstração */}
        {isDemoMode() && (
          <div className="bg-gradient-to-r from-amber-500/20 via-primary/15 to-info/20 border-b border-warning/40 px-4 py-1.5 text-center text-[11px] font-bold text-warning backdrop-blur-md flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <span className="size-2 rounded-full bg-warning animate-pulse" />
              <span>
                NWS Workspace — MODO DE DEMONSTRAÇÃO (Ambiente Isolado com Dados Fictícios)
              </span>
            </div>

            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              {!demoStore.isPopulated ? (
                <button
                  type="button"
                  onClick={() => {
                    demoStore.loadSampleData();
                    qc.invalidateQueries();
                    toast.success("Dados de exemplo carregados no modo demo!");
                  }}
                  className="rounded-lg bg-warning/20 border border-warning/50 px-2.5 py-0.5 text-[10px] font-bold text-warning hover:bg-warning hover:text-black transition shadow-sm"
                >
                  ⚡ Carregar dados de exemplo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    demoStore.resetDemo();
                    qc.invalidateQueries();
                    toast.info("Demonstração reposta para o estado vazio inicial.");
                  }}
                  className="rounded-lg bg-surface border border-border/80 px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground hover:bg-danger/20 hover:text-danger hover:border-danger/40 transition"
                >
                  🔄 Repor demonstração
                </button>
              )}
            </div>
          </div>
        )}

        {/* Top Header Sticky */}
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3 min-w-0">
            {!ehHub && (
              <button
                className="lg:hidden text-muted-foreground hover:text-foreground"
                onClick={() => setMenu(true)}
                aria-label="Abrir menu"
              >
                <Menu className="size-5" />
              </button>
            )}

            {/* Logótipo quando no Hub */}
            {ehHub ? (
              <Link to="/hub" className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-surface-strong border border-border/80 shadow-inner">
                  <img src="/logo.png" alt="Nova Web Studio" className="size-6 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold tracking-tight text-foreground">
                      Nova Web Studio
                    </span>
                    <span className="rounded bg-primary/15 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                      Workspace
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              /* Breadcrumbs Contextuais */
              <div className="flex items-center gap-2 text-xs">
                <Link
                  to="/hub"
                  className="font-bold text-muted-foreground hover:text-primary transition flex items-center gap-1"
                >
                  <Grid className="size-3.5" />
                  <span>Workspace</span>
                </Link>
                <ChevronRight className="size-3.5 text-muted-foreground/50" />
                <span className="font-semibold text-foreground tracking-tight">
                  {breadcrumb.app}
                </span>
                <ChevronRight className="size-3.5 text-muted-foreground/50" />
                <span className="text-muted-foreground">{breadcrumb.tela}</span>
              </div>
            )}
          </div>

          {/* Ações Rápidas no Header */}
          <div className="flex items-center gap-2.5">
            {/* Atalho Workspace no Header */}
            {!ehHub && (
              <Link
                to="/hub"
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition"
              >
                <Grid className="size-3.5" />
                <span>Workspace</span>
              </Link>
            )}

            {/* Pesquisa Global */}
            <button
              type="button"
              onClick={() => setCmdAberto(true)}
              className="hidden md:flex items-center gap-2 rounded-xl border border-border/70 bg-surface/50 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:bg-surface-strong hover:text-foreground"
            >
              <Search className="size-3.5 text-primary" />
              <span>Pesquisar...</span>
              <kbd className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 text-[9px] font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Ações contextuais de Topo */}
            {/* 1. No CRM: Botão Novo Negócio */}
            {!ehHub && !ehAdmin && !ehRestaurantes && !ehMatch && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setModalNovoNegocio(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  <Plus className="size-3.5" />
                  <span>Novo Negócio</span>
                </button>
              </div>
            )}

            {/* 2. No Restaurante: Ações contextuais rápidas */}
            {ehRestaurantes && (
              <div className="flex items-center gap-2">
                {!isDemoMode() && (
                  <a
                    href="https://restaurante.novawebstudio.pt"
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs font-bold text-warning hover:bg-warning/20 transition"
                  >
                    <Globe className="size-3.5" />
                    <span>Site Público</span>
                    <ExternalLink className="size-3 opacity-60" />
                  </a>
                )}

                <Link
                  to="/produtos/restaurantes/pedidos"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-warning px-3 py-1.5 text-xs font-bold text-black shadow-sm transition hover:bg-warning/90"
                >
                  <ClipboardList className="size-3.5" />
                  <span className="hidden xs:inline">Pedidos</span>
                  {restCounts.pedidosNovos > 0 && (
                    <span className="rounded-full bg-black px-1.5 py-0.2 text-[9px] font-extrabold text-warning">
                      {restCounts.pedidosNovos}
                    </span>
                  )}
                </Link>
              </div>
            )}

            <div className="h-6 w-px bg-border/80 mx-1" />

            {/* Centro de Notificações */}
            <NotificationCenter />

            {/* Perfil / Sair (no Hub) */}
            {ehHub && (
              <button
                onClick={terminarSessao}
                className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-surface/50 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-danger/10 hover:text-danger hover:border-danger/40 transition"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
          </div>
        </header>

        {/* Corpo da Página */}
        <main
          className={cn(
            "flex-1 p-4 sm:p-7 w-full mx-auto",
            ehHub ? "max-w-[1400px]" : "max-w-[1550px]",
          )}
        >
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        open={cmdAberto}
        onOpenChange={setCmdAberto}
        onOpenNovoNegocio={() => setModalNovoNegocio(true)}
        onOpenNovaTarefa={() => setModalNovaTarefa(true)}
      />

      {/* Modais Globais */}
      {modalNovoNegocio && (
        <DialogNegocio aberto={modalNovoNegocio} onFechar={() => setModalNovoNegocio(false)} />
      )}

      {modalNovaTarefa && (
        <DialogTarefa aberto={modalNovaTarefa} onFechar={() => setModalNovaTarefa(false)} />
      )}
    </div>
  );
}

function NavItem({
  to,
  search,
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: {
  to: string;
  search?: Record<string, string>;
  icon: typeof Phone;
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      search={search as never}
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition duration-150",
        active
          ? "bg-primary/10 font-semibold text-primary ring-1 ring-inset ring-primary/20 shadow-sm"
          : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
        )}
      />

      <span className="flex-1 truncate">{label}</span>

      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums",
            active
              ? "bg-primary/20 text-primary"
              : "bg-surface-strong text-muted-foreground group-hover:text-foreground",
          )}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
