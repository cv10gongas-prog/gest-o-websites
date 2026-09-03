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
  MapPin,
  BadgeCheck,
} from "lucide-react";

import { Chip, Panel } from "@/components/crm/Bits";
import { SiteChrome } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Criação de Sites em Cascais | Nova Web Studio",
      },
      {
        name: "description",
        content:
          "Criação e modernização de websites em Cascais, Oeiras, Sintra e Lisboa. Sites profissionais, rápidos e preparados para gerar mais contactos para o seu negócio.",
      },
      {
        property: "og:title",
        content: "Criação de Sites em Cascais | Nova Web Studio",
      },
      {
        property: "og:description",
        content:
          "Websites modernos e profissionais para negócios em Cascais, Oeiras, Sintra e Lisboa.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: "https://www.novawebstudio.pt/",
      },
      {
        property: "og:image",
        content: "https://www.novawebstudio.pt/logo.png",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Criação de Sites em Cascais | Nova Web Studio",
      },
      {
        name: "twitter:description",
        content:
          "Criação e modernização de websites para negócios locais em Cascais, Oeiras, Sintra e Lisboa.",
      },
      {
        name: "twitter:image",
        content: "https://www.novawebstudio.pt/logo.png",
      },
    ],

    links: [
      {
        rel: "canonical",
        href: "https://www.novawebstudio.pt/",
      },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",

          name: "Nova Web Studio",

          url: "https://www.novawebstudio.pt/",

          logo: "https://www.novawebstudio.pt/logo.png",

          image: "https://www.novawebstudio.pt/logo.png",

          email: "geral@novawebstudio.pt",

          telephone: "+351937642061",

          description:
            "Criação de sites, web design e modernização de websites para negócios locais em Cascais, Oeiras, Sintra e Lisboa.",

          areaServed: [
            {
              "@type": "City",
              name: "Cascais",
            },
            {
              "@type": "City",
              name: "Oeiras",
            },
            {
              "@type": "City",
              name: "Sintra",
            },
            {
              "@type": "City",
              name: "Lisboa",
            },
          ],

          makesOffer: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Criação de sites em Cascais",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Web design",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Redesign de websites",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Landing pages",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Lojas online",
              },
            },
          ],
        }),
      },
    ],
  }),

  component: Index,
});

const SERVICOS = [
  {
    icon: LayoutTemplate,
    titulo: "Criação de websites",
    texto:
      "Criamos sites profissionais de raiz, adaptados ao seu negócio e preparados para gerar contactos.",
  },
  {
    icon: Gauge,
    titulo: "Redesign e modernização",
    texto:
      "Atualizamos websites antigos, melhorando o design, organização, velocidade e experiência em telemóvel.",
  },
  {
    icon: LineChart,
    titulo: "SEO e acompanhamento",
    texto:
      "Preparamos o website para motores de pesquisa e acompanhamos a sua presença digital ao longo do tempo.",
  },
];

const TIPOS = [
  {
    icon: Sparkles,
    titulo: "Site institucional",
    texto: "Apresente a empresa, serviços e contactos com uma imagem profissional.",
  },
  {
    icon: ShoppingBag,
    titulo: "Loja online",
    texto: "Venda produtos através de uma loja simples, moderna e adaptada ao seu negócio.",
  },
  {
    icon: Smartphone,
    titulo: "Landing page",
    texto: "Uma página focada em apresentar um serviço e gerar pedidos de contacto.",
  },
  {
    icon: Rocket,
    titulo: "Aplicação web",
    texto: "Soluções digitais e áreas reservadas desenvolvidas à medida.",
  },
];

const PROCESSO = [
  {
    n: "01",
    titulo: "Falamos sobre o negócio",
    texto: "Percebemos o que faz, o que precisa e quais são os objetivos do website.",
  },
  {
    n: "02",
    titulo: "Enviamos uma proposta",
    texto: "Recebe uma proposta clara com o trabalho, prazo e valor previstos.",
  },
  {
    n: "03",
    titulo: "Criamos o website",
    texto: "Desenvolvemos o projeto e mostramos a evolução antes da publicação.",
  },
  {
    n: "04",
    titulo: "Publicamos e acompanhamos",
    texto: "Colocamos o site online e ajudamos com os últimos ajustes necessários.",
  },
];

function Index() {
  return (
    <SiteChrome>
      <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <Chip tone="primary">Web Design em Cascais</Chip>

          <h1 className="orbit-gradient-text mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Criação de sites profissionais para negócios locais
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Criamos e modernizamos websites para empresas e negócios em Cascais,
            Oeiras, Sintra e Lisboa, com foco numa imagem profissional,
            utilização simples e mais oportunidades de contacto.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/contacto"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <CalendarCheck className="size-4" />
              Pedir proposta
            </Link>

            <Link
              to="/portefolio"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              Ver portefólio
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              Cascais, Oeiras, Sintra e Lisboa
            </span>

            <span className="flex items-center gap-1.5">
              <BadgeCheck className="size-3.5 text-primary" />
              Sites adaptados a telemóvel
            </span>
          </div>
        </div>

        <Panel bodyClassName="p-6">
          <div className="space-y-4">
            {[
              {
                valor: "24 h",
                texto: "Resposta a novos pedidos",
              },
              {
                valor: "1 a 2 semanas",
                texto: "Prazo típico de entrega",
              },
              {
                valor: "100 %",
                texto: "Sites responsivos e otimizados",
              },
            ].map((i) => (
              <div
                key={i.valor}
                className="flex items-baseline justify-between gap-4"
              >
                <span className="text-2xl font-semibold tracking-tight">
                  {i.valor}
                </span>

                <span className="text-right text-xs text-muted-foreground">
                  {i.texto}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-16">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight">
            Websites para empresas e negócios locais
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Um website é muitas vezes o primeiro contacto entre um potencial
            cliente e uma empresa. A Nova Web Studio desenvolve websites
            modernos para pequenos negócios que precisam de apresentar os seus
            serviços de forma clara, transmitir confiança e facilitar o contacto
            com novos clientes.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Trabalhamos principalmente com negócios em Cascais, Oeiras, Sintra
            e Lisboa, tanto na criação de novos websites como na modernização de
            sites existentes.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">
          O que fazemos
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {SERVICOS.map((s) => (
            <article
              key={s.titulo}
              className="orbit-panel orbit-panel-hover p-5"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-secondary">
                <s.icon className="size-4 text-primary" />
              </span>

              <h3 className="mt-3 text-sm font-semibold">
                {s.titulo}
              </h3>

              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {s.texto}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">
          Tipos de websites
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIPOS.map((t) => (
            <article
              key={t.titulo}
              className="orbit-panel orbit-panel-hover p-5"
            >
              <t.icon className="size-5 text-primary" />

              <h3 className="mt-3 text-sm font-semibold">
                {t.titulo}
              </h3>

              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {t.texto}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">
          Como trabalhamos
        </h2>

        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESSO.map((p) => (
            <li
              key={p.n}
              className="orbit-panel p-5"
            >
              <span className="text-[11px] font-semibold tracking-[.2em] text-primary">
                {p.n}
              </span>

              <h3 className="mt-2 text-sm font-semibold">
                {p.titulo}
              </h3>

              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {p.texto}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <div className="orbit-panel p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-lg font-semibold">
                Precisa de criar ou modernizar o website do seu negócio?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Diga-nos o que precisa. Podemos analisar o website atual ou
                preparar uma solução de raiz adaptada ao seu negócio.
              </p>
            </div>

            <Link
              to="/contacto"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Pedir orçamento
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <Panel
        className="mt-16"
        bodyClassName="p-6 sm:p-8"
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Fale com a Nova Web Studio
            </h2>

            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Search className="size-3.5" />
              Criamos websites para negócios em Cascais, Oeiras, Sintra e
              Lisboa.
            </p>
          </div>

          <Link
            to="/contacto"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Contactar
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Panel>
    </SiteChrome>
  );
}
