import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  Flame,
  Globe,
  Layers,
  LayoutDashboard,
  Lock,
  Plus,
  QrCode,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useMemo } from "react";

import { Avatar, Chip, Dot } from "@/components/crm/Bits";
import { useUtilizador } from "@/hooks/useAuth";
import { dataExtenso, euros, formatarData, formatarMoeda, saudacao } from "@/lib/crm";
import {
  useActivity,
  useBusinesses,
  useInteractions,
  useOpportunities,
  useProfiles,
  useTasks,
  useWebsiteRequests,
} from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adminQuery } from "@/lib/restaurant/store";
import { isRestaurantDatabaseConfigured } from "@/lib/restaurant/cloud";
import { isDemoMode } from "@/lib/demo-mode";
import { useMatch } from "@/lib/match/store";
import { todayISO } from "@/lib/restaurant/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/hub")({
  head: () => ({
    meta: [
      { title: "NWS Workspace — Nova Web Studio" },
      {
        name: "description",
        content:
          "Plataforma central de aplicações da Nova Web Studio: CRM, Restaurantes, Match e Administração.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WorkspaceHub,
});

function WorkspaceHub() {
  const { perfil, funcao, isAdmin } = useUtilizador();
  const { data: negocios = [] } = useBusinesses();
  const { data: tarefas = [] } = useTasks();
  const { data: pedidos = [] } = useWebsiteRequests();
  const { data: perfis = [] } = useProfiles();
  const { data: chamadas = [] } = useInteractions();
  const match = useMatch();

  // Tentativas anómalas de login recentes para o card de administração
  const { data: tentativas = [] } = useQuery({
    queryKey: ["security-hub-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_login_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) return [];
      return data ?? [];
    },
    staleTime: 30000,
  });

  // Dados reais em direto do NWS Restaurantes
  const { data: restData } = useQuery(adminQuery());

  const restStats = useMemo(() => {
    if (
      !restData ||
      !Array.isArray(restData.orders) ||
      !Array.isArray(restData.tables) ||
      !Array.isArray(restData.reservations)
    ) {
      return {
        nome: "NWS Restaurantes",
        pedidosAtivos: 0,
        mesasAtivas: 0,
        reservasHoje: 0,
      };
    }
    const pedidosAtivos = restData.orders.filter(
      (o) => !o.closed && o.status !== "entregue",
    ).length;
    const mesasAtivas = restData.tables.filter((t) => t.active).length;
    const reservasHoje = restData.reservations.filter(
      (r) => r.date === todayISO() && r.status !== "cancelada",
    ).length;
    return {
      nome: restData.settings?.name || "NWS Restaurantes",
      pedidosAtivos,
      mesasAtivas,
      reservasHoje,
    };
  }, [restData]);

  const restBadge = isDemoMode()
    ? { label: "Modo Demonstração", tone: "text-warning bg-warning/15" }
    : isRestaurantDatabaseConfigured()
      ? { label: "Operação em Direto", tone: "text-success bg-success/15" }
      : { label: "Configuração Pendente", tone: "text-amber-400 bg-amber-400/15" };

  const hojeIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Dados reais para os cartões
  const crmStats = useMemo(() => {
    const ativos = negocios.filter((n) => !["concluido", "arquivado"].includes(n.estado)).length;

    const valorPipeline = negocios
      .filter((n) => !["nao_interessado", "arquivado"].includes(n.estado))
      .reduce((t, n) => t + Number(n.valor_estimado ?? 0), 0);

    const pedidosPendentes = pedidos.filter((p) => !p.tratado).length;

    const tarefasUrgentes = tarefas.filter(
      (t) => t.estado === "pendente" && t.data_hora && t.data_hora.slice(0, 10) <= hojeIso,
    ).length;

    return {
      ativos,
      valorPipeline,
      pedidosPendentes,
      tarefasUrgentes,
    };
  }, [negocios, pedidos, tarefas, hojeIso]);

  const restaurantesStats = useMemo(() => {
    const totalRestaurantes = negocios.filter((n) => {
      const cat = (n.categoria ?? "").toLowerCase();
      const nome = n.nome.toLowerCase();
      return (
        cat.includes("restaurante") ||
        cat.includes("café") ||
        cat.includes("bar") ||
        cat.includes("pizzaria") ||
        nome.includes("restaurante") ||
        nome.includes("tasca")
      );
    }).length;

    return {
      total: totalRestaurantes,
    };
  }, [negocios]);

  const nomePrimeiro = perfil?.nome?.split(" ")[0] ?? "Utilizador";

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-between space-y-10 py-4 max-w-[1400px] mx-auto">
      {/* HERO & SAUDAÇÃO PERSONALIZADA */}
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-surface/50 p-7 sm:p-10 backdrop-blur-2xl">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 size-96 rounded-full bg-info/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-primary">
              <Sparkles className="size-4" />
              <span>NWS Command Workspace</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-muted-foreground">{dataExtenso()}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {saudacao()},{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-info">
                {nomePrimeiro}
              </span>
              .
            </h1>

            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Bem-vindo ao centro unificado da Nova Web Studio. Selecione a aplicação que pretende
              operar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-2 rounded-2xl border border-border/70 bg-surface/80 px-4 py-2.5 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:bg-surface-strong shadow-sm"
            >
              <Globe className="size-4 text-primary" />
              <span>Website Público</span>
              <ExternalLink className="size-3 opacity-60" />
            </Link>
          </div>
        </div>
      </section>

      {/* GRELHA 2x2 DAS 4 GRANDES APLICAÇÕES */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ============================================================ */}
        {/* APP 1: NOVA WEB STUDIO — CRM */}
        {/* ============================================================ */}
        <Link
          to="/painel"
          className="group relative overflow-hidden rounded-3xl border border-primary/30 bg-surface/40 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:bg-surface/70 hover:shadow-[0_20px_50px_-20px_rgba(57,217,230,0.25)] flex flex-col justify-between"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-primary/10 blur-3xl transition duration-500 group-hover:scale-150 group-hover:bg-primary/20" />

          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-inner">
                  <BriefcaseBusiness className="size-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition">
                      Nova Web Studio — CRM
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Operação Comercial & Clientes
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Ativo
              </span>
            </div>

            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Gestão de clientes, pipeline Kanban, tarefas, propostas, chamadas, contactos do
              website e arquivos de projetos.
            </p>

            {/* Resumo com Dados Reais */}
            <div className="mt-6 grid grid-cols-3 gap-2.5 rounded-2xl border border-border/50 bg-surface/60 p-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Projetos Ativos
                </span>
                <p className="text-base font-bold font-mono text-foreground mt-0.5">
                  {crmStats.ativos}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Pipeline (€)
                </span>
                <p className="text-base font-bold font-mono text-primary mt-0.5 truncate">
                  {formatarMoeda(crmStats.valorPipeline)}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Novas Leads
                </span>
                <p className="text-base font-bold font-mono text-warning mt-0.5">
                  {crmStats.pedidosPendentes}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold text-primary">
            <span>Abrir Command Center CRM</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* ============================================================ */}
        {/* APP 2: NWS RESTAURANTES */}
        {/* ============================================================ */}
        <Link
          to="/produtos/restaurantes"
          className="group relative overflow-hidden rounded-3xl border border-warning/30 bg-surface/40 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-warning/60 hover:bg-surface/70 hover:shadow-[0_20px_50px_-20px_rgba(245,158,11,0.25)] flex flex-col justify-between"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-warning/10 blur-3xl transition duration-500 group-hover:scale-150 group-hover:bg-warning/20" />

          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl border border-warning/30 bg-warning/10 text-warning shadow-inner">
                  <UtensilsCrossed className="size-6" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground group-hover:text-warning transition">
                    NWS Restaurantes
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    {restStats.nome} · Sistema de Gestão & Sala
                  </p>
                </div>
              </div>

              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                  restBadge.tone,
                )}
              >
                {restBadge.label}
              </span>
            </div>

            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Plataforma dedicada de restauração: gestão de pedidos em tempo real, mapa de mesas com
              QR Codes, ementa digital, reservas e cozinha.
            </p>

            {/* Resumo com Dados Reais da Base de Dados do Restaurante */}
            <div className="mt-6 grid grid-cols-3 gap-2.5 rounded-2xl border border-border/50 bg-surface/60 p-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Pedidos Ativos
                </span>
                <p className="text-base font-bold font-mono text-warning mt-0.5">
                  {restStats.pedidosAtivos}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Mesas Ativas
                </span>
                <p className="text-base font-bold font-mono text-foreground mt-0.5">
                  {restStats.mesasAtivas}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Reservas Hoje
                </span>
                <p className="text-base font-bold font-mono text-info mt-0.5">
                  {restStats.reservasHoje}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold text-warning">
            <span>Abrir Painel de Gestão do Restaurante</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* ============================================================ */}
        {/* APP 3: NWS MATCH */}
        {/* ============================================================ */}
        <Link
          to="/produtos/match"
          className="group relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-surface/40 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/60 hover:bg-surface/70 hover:shadow-[0_20px_50px_-20px_rgba(16,185,129,0.25)] flex flex-col justify-between"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-emerald-500/10 blur-3xl transition duration-500 group-hover:scale-150 group-hover:bg-emerald-500/20" />

          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-inner">
                  <Trophy className="size-6" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground group-hover:text-emerald-400 transition">
                    NWS Match
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    Futebol (11, 9, 7) & Futsal Oficial
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Flame className="size-3 text-emerald-400" />
                {match.isRunning ? "Em Jogo (Live)" : "Live Engine Ativo"}
              </span>
            </div>

            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Plataforma de alta performance para controlo de jogos em direto, cronómetros
              regulamentares, faltas acumuladas e relatórios estatísticos.
            </p>

            {/* Resumo com Dados Reais da Partida Ativa */}
            <div className="mt-6 grid grid-cols-3 gap-2.5 rounded-2xl border border-border/50 bg-surface/60 p-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Partida Ativa
                </span>
                <p className="text-xs font-bold font-mono text-foreground mt-0.5 truncate">
                  {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Resultado
                </span>
                <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                  {match.homeScore} - {match.awayScore}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Acontecimentos
                </span>
                <p className="text-base font-bold font-mono text-foreground mt-0.5">
                  {match.events.length}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold text-emerald-400">
            <span>Abrir Painel em Direto do Match</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* ============================================================ */}
        {/* APP 4: ADMINISTRAÇÃO & GOVERNANÇA */}
        {/* ============================================================ */}
        <Link
          to="/admin"
          className="group relative overflow-hidden rounded-3xl border border-info/30 bg-surface/40 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-info/60 hover:bg-surface/70 hover:shadow-[0_20px_50px_-20px_rgba(139,92,246,0.25)] flex flex-col justify-between"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-info/10 blur-3xl transition duration-500 group-hover:scale-150 group-hover:bg-info/20" />

          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl border border-info/30 bg-info/10 text-info shadow-inner">
                  <ShieldCheck className="size-6" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-foreground group-hover:text-info transition">
                    Administração & Governança
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    Equipa, Segurança, Permissões & Plataforma
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-info/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-info">
                {isAdmin ? "Acesso Total" : "Acesso Restrito"}
              </span>
            </div>

            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Gestão de colaboradores, perfis, auditoria forense de acessos, deteção de anomalias
              por IP, matriz RBAC e definições da plataforma.
            </p>

            {/* Resumo com Dados Reais */}
            <div className="mt-6 grid grid-cols-2 gap-2.5 rounded-2xl border border-border/50 bg-surface/60 p-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Membros Ativos
                </span>
                <p className="text-base font-bold font-mono text-foreground mt-0.5">
                  {perfis.length} colaboradores
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Integridade
                </span>
                <p className="text-xs font-semibold text-info mt-1 flex items-center gap-1">
                  <span>Monitorizada</span>
                  <Lock className="size-3.5" />
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-bold text-info">
            <span>Abrir Painel de Administração</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* FOOTER DISCRETO DO WORKSPACE */}
      <footer className="pt-4 text-center text-xs text-muted-foreground">
        <p>
          Nova Web Studio © 2026 • Command Center Workspace v2.0 • Infraestrutura de Alta
          Performance
        </p>
      </footer>
    </div>
  );
}
