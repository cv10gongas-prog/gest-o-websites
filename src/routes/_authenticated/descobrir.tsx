import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, Info, Sparkles } from "lucide-react";

import { LeadFinderExterno } from "@/components/crm/LeadFinderExterno";
import { useBusinesses } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/descobrir")({
  head: () => ({ meta: [
    { title: "Lead Finder — NWS Intelligence" },
    { name: "description", content: "Pesquisa privada de negócios locais, qualificação e CRM da Nova Web Studio." },
    { name: "robots", content: "noindex,nofollow" },
  ] }),
  component: DescobrirNegocios,
});

function DescobrirNegocios() {
  const { data: negocios = [], isLoading, isError } = useBusinesses();
  return <main className="mx-auto w-full max-w-[1400px] space-y-6 pb-12">
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-violet-400/25 bg-gradient-to-r from-violet-500/10 via-surface/70 to-surface/60 p-4 sm:p-6">
      <div>
        <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.2em] text-violet-300"><Sparkles className="size-4"/> Inteligência Comercial</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Descobrir Negócios</h1>
        <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">Encontra empresas da região, filtra por oportunidades e consulta apenas 12 resultados por página. Importa para o CRM só o que fizer sentido.</p>
      </div>
      <Link to="/analisar" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-violet-400/35 bg-violet-500/5 px-4 text-xs font-bold text-violet-200 transition hover:bg-violet-500/15">Website Analyzer <ArrowRight className="size-4"/></Link>
    </header>
    <LeadFinderExterno negocios={negocios}/>
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-surface/50 p-5" aria-label="Resumo do CRM">
      <div className="flex min-w-0 items-start gap-3">
        <Info className="mt-0.5 size-4 shrink-0 text-violet-300"/>
        <div>
          <p className="text-sm font-bold text-foreground">CRM — registos existentes</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{isLoading ? "A carregar negócios…" : isError ? "Não foi possível consultar o CRM." : `${negocios.length} negócios guardados. Os resultados externos só são adicionados depois de escolheres.`} Para gerir os clientes, usa a página dedicada.</p>
        </div>
      </div>
      <Link to="/negocios" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-violet-400/30 px-4 text-xs font-bold text-violet-200 hover:bg-violet-500/10"><BriefcaseBusiness className="size-4"/> Negócios & Clientes <ArrowRight className="size-3.5"/></Link>
    </section>
  </main>;
}
