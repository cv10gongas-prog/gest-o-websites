import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  Gauge,
  LayoutTemplate,
  LineChart,
  Rocket,
  Search,
  ShoppingBag,
  Smartphone,
  Sparkles,
} from "lucide-react";

import { Chip, Panel } from "@/components/crm/Bits";
import { SiteChrome } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nova Web Studio — Websites e lojas online à medida" },
      {
        name: "description",
        content:
          "Criamos websites rápidos, modernos e otimizados para conversão: sites institucionais, lojas online e aplicações web.",
      },
      { property: "og:title", content: "Nova Web Studio — Websites e lojas online à medida" },
      {
        property: "og:description",
        content: "Sites institucionais, lojas online e aplicações web feitos à medida do seu negócio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SERVICOS = [
  {
    icon: LayoutTemplate,
    titulo: "Design e desenvolvimento",
    texto: "Interfaces desenhadas de raiz, sem modelos genéricos, focadas no seu público.",
  },
  {
    icon: Gauge,
    titulo: "Performance e SEO",
    texto: "Páginas rápidas, acessíveis e preparadas para aparecer nos motores de busca.",
  },
  {
    icon: LineChart,
    titulo: "Acompanhamento contínuo",
    texto: "Manutenção, atualizações de conteúdo e análise de resultados mês a mês.",
  },
];

const TIPOS = [
  { icon: Sparkles, titulo: "Site institucional", texto: "Apresente a empresa com credibilidade." },
  { icon: ShoppingBag, titulo: "Loja online", texto: "Venda com pagamentos e stock integrados." },
  { icon: Smartphone, titulo: "Landing page", texto: "Uma página focada em captar contactos." },
  { icon: Rocket, titulo: "Aplicação web", texto: "Plataformas e áreas reservadas à medida." },
];

const PROCESSO = [
  { n: "01", titulo: "Reunião inicial", texto: "Percebemos o negócio, objetivos e prazos." },
  { n: "02", titulo: "Proposta", texto: "Enviamos âmbito, calendário e valores fechados." },
  { n: "03", titulo: "Design e desenvolvimento", texto: "Validação por etapas, sem surpresas." },
  { n: "04", titulo: "Lançamento", texto: "Publicação, formação e acompanhamento." },
];

function Index() {
  return (
    <SiteChrome>
      <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <Chip tone="primary">Estúdio digital em Portugal</Chip>
          <h1 className="orbit-gradient-text mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Websites que trabalham para o seu negócio
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Desenhamos e desenvolvemos sites institucionais, lojas online e aplicações web rápidas,
            bonitas e preparadas para gerar contactos reais.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/contacto"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <CalendarCheck className="size-4" />
              Marcar reunião
            </Link>
            <Link
              to="/portefolio"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              Ver portefólio
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <Panel bodyClassName="p-6">
          <div className="space-y-4">
            {[
              { valor: "24 h", texto: "Resposta a novos pedidos" },
              { valor: "1 a 2 semanas", texto: "Prazo típico de entrega" },
              { valor: "100 %", texto: "Sites responsivos e otimizados" },
            ].map((i) => (
              <div key={i.valor} className="flex items-baseline justify-between gap-4">
                <span className="text-2xl font-semibold tracking-tight">{i.valor}</span>
                <span className="text-right text-xs text-muted-foreground">{i.texto}</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">O que fazemos</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {SERVICOS.map((s) => (
            <article key={s.titulo} className="orbit-panel orbit-panel-hover p-5">
              <span className="grid size-9 place-items-center rounded-lg bg-secondary">
                <s.icon className="size-4 text-primary" />
              </span>
              <h3 className="mt-3 text-sm font-semibold">{s.titulo}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">Tipos de websites</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIPOS.map((t) => (
            <article key={t.titulo} className="orbit-panel orbit-panel-hover p-5">
              <t.icon className="size-5 text-primary" />
              <h3 className="mt-3 text-sm font-semibold">{t.titulo}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">Como trabalhamos</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESSO.map((p) => (
            <li key={p.n} className="orbit-panel p-5">
              <span className="text-[11px] font-semibold tracking-[.2em] text-primary">{p.n}</span>
              <h3 className="mt-2 text-sm font-semibold">{p.titulo}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <Panel className="mt-16" bodyClassName="p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Pronto para começar?</h2>
            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Search className="size-3.5" />
              Diga-nos o que precisa e recebe uma proposta detalhada.
            </p>
          </div>
          <Link
            to="/contacto"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Pedir orçamento
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Panel>
    </SiteChrome>
  );
}
