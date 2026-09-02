import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  Clock3,
  Flame,
  Globe,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Phone,
  Settings,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";

import { Avatar } from "@/components/crm/Bits";
import { supabase } from "@/integrations/supabase/client";
import { useUtilizador } from "@/hooks/useAuth";
import { PreferenciasProvider, rotuloSeccao, usePreferencias } from "@/lib/preferencias";
import { useBusinesses, useTasks, useWebsiteRequests } from "@/lib/queries";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/painel", label: "Gestão", icon: LayoutDashboard },
  {
    to: "/negocios",
    label: "Criação e Modernização de Sites",
    icon: BriefcaseBusiness,
    chave: "negocios",
  },
  { to: "/pipeline", label: "Pipeline", icon: BarChart3 },
  { to: "/tarefas", label: "Tarefas", icon: CalendarClock, chave: "tarefas" },
  { to: "/emails", label: "Modelos de email", icon: Mail },
  { to: "/projetos", label: "Projetos", icon: Sparkles },
  { to: "/arquivos", label: "Arquivos de projetos", icon: FileArchive },
  { to: "/pedidos", label: "Pedidos do site", icon: Globe, chave: "pedidos" },
  { to: "/equipa", label: "Equipa", icon: Users },
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
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { perfil, funcao } = useUtilizador();
  const { data: negocios = [] } = useBusinesses();
  const { data: tarefas = [] } = useTasks();
  const { data: pedidos = [] } = useWebsiteRequests();
  const { prefs } = usePreferencias();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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

  async function terminarSessao() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="orbit-glow pointer-events-none fixed inset-0" />

      {menu && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMenu(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col overflow-y-auto border-r border-border/60 bg-sidebar/95 p-4 backdrop-blur-xl transition-transform lg:translate-x-0",
          menu ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-7 flex items-center justify-between px-2 pt-1">
          <Link to="/painel" className="flex items-center gap-3">
            <span className="orbit-brand-mark grid size-9 place-items-center rounded-xl">
              <Target className="size-5" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold tracking-tight">{prefs.marcaNome}</span>
              <span className="block text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                {prefs.marcaSubtitulo}
              </span>
            </span>
          </Link>
          <button className="lg:hidden" onClick={() => setMenu(false)} aria-label="Fechar menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="space-y-1 text-sm">
          {LINKS.filter((l) => prefs.seccoes.includes(l.to)).map((l) => (
            <NavItem
              key={l.to}
              to={l.to}
              icon={l.icon}
              label={rotuloSeccao(prefs, l.to, l.label)}
              active={pathname.startsWith(l.to)}
              count={
                prefs.mostrarContagens && "chave" in l && l.chave
                  ? contagens[l.chave as "negocios" | "tarefas" | "pedidos"]
                  : undefined
              }
              onClick={() => setMenu(false)}
            />
          ))}
        </nav>

        {prefs.mostrarAtalhos && (
          <>
            <div className="mt-7 px-3 text-[10px] font-semibold uppercase tracking-[.2em] text-muted-foreground">
              Atalhos
            </div>
            <nav className="mt-2 space-y-1 text-sm">
              {prefs.atalhos.includes("prioridade") && (
              <NavItem
                to="/negocios"
                search={{ prioridade: "alta" }}
                icon={Flame}
                label="Prioridade alta"
                count={prefs.mostrarContagens ? contagens.prioridade : undefined}
                onClick={() => setMenu(false)}
              />
              )}
              {prefs.atalhos.includes("emails") && (
              <NavItem
                to="/negocios"
                search={{ estado: "email_por_enviar" }}
                icon={Mail}
                label="Emails por enviar"
                count={prefs.mostrarContagens ? contagens.emails : undefined}
                onClick={() => setMenu(false)}
              />
              )}
              {prefs.atalhos.includes("seguimentos") && (
              <NavItem
                to="/negocios"
                search={{ estado: "seguimento" }}
                icon={Clock3}
                label="Seguimentos"
                count={prefs.mostrarContagens ? contagens.seguimentos : undefined}
                onClick={() => setMenu(false)}
              />
              )}
            </nav>
          </>
        )}

        <div className="mt-auto space-y-2 pt-6">
          <NavItem
            to="/definicoes"
            icon={Settings}
            label="Definições"
            active={pathname.startsWith("/definicoes")}
            onClick={() => setMenu(false)}
          />
          <button
            onClick={terminarSessao}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <LogOut className="size-4" /> Terminar sessão
          </button>
        </div>
      </aside>

      <main className="relative lg:pl-[250px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMenu(true)} aria-label="Abrir menu">
              <Menu className="size-5" />
            </button>
            <Link
              to="/"
              className="hidden items-center gap-2 rounded-xl border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground sm:flex"
            >
              <Globe className="size-3.5" /> Ver website público
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/tarefas"
              className="relative grid size-9 place-items-center rounded-xl border border-border/70"
              aria-label="Tarefas pendentes"
            >
              <Bell className="size-4 text-muted-foreground" />
              {contagens.tarefas > 0 && (
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
              )}
            </Link>
            <div className="h-7 w-px bg-border" />
            <Link to="/equipa" className="flex items-center gap-2.5">
              <Avatar nome={perfil?.nome} url={perfil?.foto_url} size="size-9" />
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-medium">{perfil?.nome ?? "Utilizador"}</span>
                <span className="block text-[10px] capitalize text-muted-foreground">{funcao}</span>
              </span>
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] p-4 sm:p-7">{children}</div>
      </main>
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
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
        active
          ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      <span className="flex-1">{label}</span>
      {count !== undefined && count > 0 && <span className="text-[10px] opacity-70">{count}</span>}
    </Link>
  );
}
