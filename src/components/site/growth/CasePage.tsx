import { ArrowLeft, ArrowRight, ExternalLink, CheckCircle2 } from "lucide-react";
import { SiteChrome } from "@/components/site/SiteChrome";
import { REAL_CASES, findRealCase } from "./cases";

export function CasePage({ slug }: { slug: string }) {
  const project = findRealCase(slug);
  if (!project) {
    return (
      <SiteChrome locale="pt" page="portfolio">
        <div className="mx-auto max-w-3xl py-24 text-center">
          <h1 className="text-3xl font-semibold">Projeto não encontrado</h1>
          <p className="mt-4 text-muted-foreground">Este caso não está disponível.</p>
          <a href="/portefolio" className="mt-7 inline-flex items-center gap-2 text-primary hover:underline"><ArrowLeft className="size-4" />Voltar ao portefólio</a>
        </div>
      </SiteChrome>
    );
  }
  const related = REAL_CASES.filter(item => item.slug !== project.slug).slice(0, 2);
  return (
    <SiteChrome locale="pt" page="portfolio">
      <article className="pb-16">
        <nav aria-label="Navegação do projeto" className="mb-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <a href="/portefolio" className="inline-flex items-center gap-1 hover:text-primary"><ArrowLeft className="size-3.5" />Portefólio</a><span aria-hidden="true">/</span><span className="text-foreground">{project.name}</span>
        </nav>
        <header className="grid gap-9 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[.2em] text-primary">Caso de estudo · Projeto real</span>
            <h1 className="orbit-gradient-text mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{project.name}</h1>
            <p className="mt-3 text-sm font-semibold text-muted-foreground">{project.category}</p>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground">{project.context}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Visitar website <ExternalLink className="size-4" /></a>
              <a href="/contacto?tipo=institucional" className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm hover:border-primary/50">Quero um projeto semelhante <ArrowRight className="size-4" /></a>
            </div>
          </div>
          <div className={`aspect-[16/10] overflow-hidden rounded-3xl border border-border/70 shadow-xl ${project.visualIsLogo ? "bg-white p-10" : "bg-[#07111b]"}`}>
            <img src={project.image} alt={project.imageAlt} className={`h-full w-full ${project.visualIsLogo ? "object-contain" : "object-cover object-top"}`} decoding="async" />
          </div>
        </header>
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <section className="rounded-3xl border border-border/70 bg-card/40 p-6"><span className="text-xs font-semibold uppercase tracking-widest text-primary">01 · Desafio</span><h2 className="mt-3 text-xl font-semibold">O que era preciso resolver</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{project.challenge}</p></section>
          <section className="rounded-3xl border border-border/70 bg-card/40 p-6"><span className="text-xs font-semibold uppercase tracking-widest text-primary">02 · Solução</span><h2 className="mt-3 text-xl font-semibold">O que desenvolvemos</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{project.solution}</p></section>
          <section className="rounded-3xl border border-border/70 bg-card/40 p-6"><span className="text-xs font-semibold uppercase tracking-widest text-primary">03 · Entrega</span><h2 className="mt-3 text-xl font-semibold">O resultado visível</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{project.result}</p></section>
        </div>
        <section className="mt-12 rounded-3xl border border-primary/20 bg-primary/[0.05] p-7 sm:p-10">
          <h2 className="text-2xl font-semibold">O que faz parte deste projeto</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">{project.features.map(x => <div key={x} className="flex items-start gap-3 text-sm leading-6"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /><span>{x}</span></div>)}</div>
        </section>
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Outros trabalhos da Nova Web Studio</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">{related.map(other => <a key={other.slug} href={`/projetos/${other.slug}`} className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card/40 p-4 hover:border-primary/40"><span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1"><img src={other.image} alt="" className="h-full w-full object-contain" loading="lazy" /></span><span className="min-w-0 flex-1"><span className="block font-semibold">{other.name}</span><span className="block text-xs text-muted-foreground">{other.category}</span></span><ArrowRight className="size-4 text-primary" /></a>)}</div>
        </section>
        <section className="mt-16 rounded-3xl border border-border/70 bg-card/50 p-7 text-center sm:p-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">O próximo projeto pode ser o teu.</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">Conta-nos o objetivo, o prazo e o tipo de website. Respondemos com uma proposta ajustada.</p>
          <a href="/contacto" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Pedir orçamento <ArrowRight className="size-4" /></a>
        </section>
      </article>
    </SiteChrome>
  );
}
