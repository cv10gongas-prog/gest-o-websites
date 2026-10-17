import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, ChevronDown, ChevronUp, ClipboardList, Compass, FileSearch, Mail, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FaixaComercialV42Props {
  pagina: string;
  pendentes: number;
  oportunidades: number;
  onPesquisar: () => void;
  onNovaTarefa: () => void;
}

const passos = [
  { to: "/descobrir", titulo: "Encontrar", subtitulo: "Leads locais", icon: Compass, ordem: "01" },
  { to: "/analisar", titulo: "Analisar", subtitulo: "Websites", icon: FileSearch, ordem: "02" },
  { to: "/emails", titulo: "Propor", subtitulo: "Email Studio", icon: Mail, ordem: "03" },
  { to: "/operacoes", titulo: "Acompanhar", subtitulo: "Modo Foco", icon: ClipboardList, ordem: "04" },
] as const;

/**
 * Acesso rápido transversal ao CRM. Apenas navegação e ações manuais;
 * não muda o estado das fichas, não envia emails e não guarda dados fora do CRM.
 */
export function FaixaComercialV42({ pagina, pendentes, oportunidades, onPesquisar, onNovaTarefa }: FaixaComercialV42Props) {
  const [expandido, setExpandido] = useState(true);
  return (
    <section aria-label="Barra de trabalho comercial" className="border-b border-border/60 bg-surface/45 px-3 py-2.5 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1550px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary"><Sparkles className="size-4" /></span>
            <div className="min-w-0"><div className="text-[11px] font-extrabold tracking-wide">Fluxo Comercial <span className="font-medium text-primary">V4.2</span></div>
              <p className="max-w-[180px] truncate text-[10px] text-muted-foreground sm:max-w-[270px]">{pagina} · da descoberta ao seguimento</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link to="/operacoes" className="hidden items-center gap-1.5 rounded-lg border border-border/70 bg-background/45 px-2.5 py-1.5 text-[11px] font-semibold transition hover:border-primary/40 sm:flex" title="Ver prioridades no CRM">
              <span className="size-1.5 rounded-full bg-amber-400" />{oportunidades} prioridade alta
            </Link>
            <Link to="/tarefas" className="hidden items-center gap-1.5 rounded-lg border border-border/70 bg-background/45 px-2.5 py-1.5 text-[11px] font-semibold transition hover:border-primary/40 md:flex" title="Ver tarefas pendentes">
              <CalendarClock className="size-3.5 text-cyan-300" /> {pendentes} tarefas
            </Link>
            <button type="button" className="rounded-lg border border-border/60 bg-background/50 p-2 text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary" onClick={onPesquisar} title="Pesquisar no HUB (Ctrl + K)" aria-label="Pesquisar no HUB"><Search className="size-4" /></button>
            <button type="button" onClick={() => setExpandido((valor) => !valor)} aria-expanded={expandido} aria-label={expandido ? "Recolher atalhos comerciais" : "Mostrar atalhos comerciais"} aria-controls="nws-v42-atalhos" className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/50 px-2.5 py-2 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">
              {expandido ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}<span className="hidden sm:inline">{expandido ? "Recolher" : "Mostrar"}</span>
            </button>
          </div>
        </div>
        {expandido && <div id="nws-v42-atalhos" className="mt-2.5 flex gap-2 overflow-x-auto pb-1" role="navigation" aria-label="Passos do fluxo comercial">
          {passos.map((passo, index) => <div key={passo.to} className="flex min-w-0 shrink-0 items-center gap-2">
            <Link to={passo.to} search={passo.to === "/emails" ? {} : undefined} className={cn("group flex min-w-[125px] items-center gap-2.5 rounded-xl border border-border/55 bg-background/40 px-3 py-2 text-left transition hover:border-primary/50 hover:bg-primary/[.08] focus-visible:outline-2 focus-visible:outline-primary sm:min-w-[151px]")}>
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary/20"><passo.icon className="size-4" /></span>
              <span className="min-w-0"><span className="flex gap-1 text-[11px] font-bold"><span className="text-[9px] font-mono text-muted-foreground">{passo.ordem}</span>{passo.titulo}</span><span className="block truncate text-[10px] text-muted-foreground">{passo.subtitulo}</span></span>
            </Link>
            {index < passos.length - 1 && <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/35" aria-hidden="true" />}
          </div>)}
          <button type="button" onClick={onNovaTarefa} className="ml-auto flex shrink-0 items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-3.5 py-2 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-400/10 focus-visible:outline-2 focus-visible:outline-cyan-300"><CalendarClock className="size-4" /> Agendar tarefa</button>
        </div>}
      </div>
    </section>
  );
}
