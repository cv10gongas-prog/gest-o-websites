import { Link } from "@tanstack/react-router";
import { Target } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/portefolio", label: "Portefólio" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="orbit-glow pointer-events-none fixed inset-0" />

      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="orbit-brand-mark grid size-9 place-items-center rounded-xl">
              <Target className="size-5" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold tracking-tight">Nova Web Studio</span>
              <span className="block text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                Websites à medida
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            {NAV.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "bg-secondary/60 text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="rounded-lg px-3 py-2 transition hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/contacto"
              className="ml-2 hidden h-9 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:inline-flex"
            >
              Marcar reunião
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-5 py-12 sm:py-16">{children}</main>

      <footer className="relative border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Nova Web Studio · Portugal</span>
          <div className="flex gap-4">
            <Link to="/portefolio">Portefólio</Link>
            <Link to="/contacto">Contacto</Link>
            <Link to="/auth">Área de equipa</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
