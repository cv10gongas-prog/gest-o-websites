import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BedDouble,
  CheckCircle2,
  Code2,
  ExternalLink,
  Gauge,
  Hammer,
  Layers3,
  Monitor,
  Palette,
  Smartphone,
  Sparkles,
  Target,
  Waves,
} from "lucide-react";

import { Chip } from "@/components/crm/Bits";
import { SiteChrome } from "@/components/site/SiteChrome";
import { dict, PATHS, type Locale } from "@/lib/i18n";

const CONCEPT_ICONS = [Waves, BedDouble, Hammer];

const EXTRA_TEXT: Record<
  Locale,
  {
    introBadge: string;
    selectedWork: string;
    selectedLead: string;

    projectType: string;
    projectTypeValue: string;
    objective: string;
    objectiveValue: string;
    delivery: string;
    deliveryValue: string;

    workTitle: string;
    workItems: string[];

    conceptsBadge: string;
    conceptNote: string;

    conceptLabels: string[];

    approachTitle: string;
    approachLead: string;

    approach: {
      title: string;
      text: string;
    }[];

    finalBadge: string;
  }
> = {
  pt: {
    introBadge: "Projetos & conceitos",
    selectedWork: "Trabalho em destaque",
    selectedLead:
      "Projetos desenvolvidos com foco em clareza, experiência de utilização e uma presença digital mais profissional.",

    projectType: "Tipo",
    projectTypeValue: "Website institucional",

    objective: "Objetivo",
    objectiveValue: "Modernizar a presença digital",

    delivery: "Projeto",
    deliveryValue: "Desenvolvimento completo",

    workTitle: "O que foi trabalhado",
    workItems: [
      "Estrutura e organização do conteúdo",
      "Design responsivo para telemóvel e computador",
      "Apresentação clara de atividades e informação",
      "Contactos e navegação simplificados",
    ],

    conceptsBadge: "Exploração visual",
    conceptNote:
      "Os projetos abaixo são conceitos demonstrativos criados para explorar diferentes setores, estilos e necessidades.",

    conceptLabels: [
      "Serviços locais",
      "Alojamento turístico",
      "Negócio artesanal",
    ],

    approachTitle: "Mais do que mudar cores e fontes",
    approachLead:
      "Cada projeto é pensado de acordo com o negócio, o público e aquilo que o website precisa realmente de fazer.",

    approach: [
      {
        title: "Estratégia",
        text: "Organizamos a informação para que o visitante perceba rapidamente o negócio e saiba o que fazer a seguir.",
      },
      {
        title: "Design",
        text: "Criamos uma identidade visual coerente, moderna e adequada ao posicionamento de cada projeto.",
      },
      {
        title: "Performance",
        text: "Os websites são preparados para carregar rapidamente e funcionar corretamente em diferentes dispositivos.",
      },
      {
        title: "Conversão",
        text: "Botões, contactos e conteúdos são posicionados para facilitar pedidos de informação e orçamento.",
      },
    ],

    finalBadge: "Tem um negócio que merece uma presença melhor?",
  },

  en: {
    introBadge: "Projects & concepts",
    selectedWork: "Featured work",
    selectedLead:
      "Projects developed with a focus on clarity, user experience and a stronger digital presence.",

    projectType: "Type",
    projectTypeValue: "Business website",

    objective: "Goal",
    objectiveValue: "Modernise the digital presence",

    delivery: "Project",
    deliveryValue: "Full website development",

    workTitle: "What we worked on",
    workItems: [
      "Content structure and organisation",
      "Responsive design for mobile and desktop",
      "Clear presentation of activities and information",
      "Simplified navigation and contact",
    ],

    conceptsBadge: "Visual exploration",
    conceptNote:
      "The projects below are demonstration concepts created to explore different industries, styles and needs.",

    conceptLabels: [
      "Local services",
      "Holiday accommodation",
      "Craft business",
    ],

    approachTitle: "More than changing colours and fonts",
    approachLead:
      "Each project is shaped around the business, its audience and what the website actually needs to achieve.",

    approach: [
      {
        title: "Strategy",
        text: "We organise information so visitors quickly understand the business and know what to do next.",
      },
      {
        title: "Design",
        text: "We create a coherent, modern visual identity suited to each project's positioning.",
      },
      {
        title: "Performance",
        text: "Websites are prepared to load quickly and work correctly across different devices.",
      },
      {
        title: "Conversion",
        text: "Calls to action, contact details and content are positioned to make enquiries easier.",
      },
    ],

    finalBadge: "Does your business deserve a stronger online presence?",
  },

  de: {
    introBadge: "Projekte & Konzepte",
    selectedWork: "Ausgewähltes Projekt",
    selectedLead:
      "Projekte mit Fokus auf Klarheit, Benutzerfreundlichkeit und einen professionelleren digitalen Auftritt.",

    projectType: "Typ",
    projectTypeValue: "Unternehmenswebsite",

    objective: "Ziel",
    objectiveValue: "Digitale Präsenz modernisieren",

    delivery: "Projekt",
    deliveryValue: "Komplette Entwicklung",

    workTitle: "Was umgesetzt wurde",
    workItems: [
      "Struktur und Organisation der Inhalte",
      "Responsives Design für Mobilgeräte und Desktop",
      "Klare Präsentation von Aktivitäten und Informationen",
      "Vereinfachte Navigation und Kontaktaufnahme",
    ],

    conceptsBadge: "Visuelle Exploration",
    conceptNote:
      "Die folgenden Projekte sind Demonstrationskonzepte für verschiedene Branchen, Stile und Anforderungen.",

    conceptLabels: [
      "Lokale Dienstleistungen",
      "Ferienunterkunft",
      "Handwerksbetrieb",
    ],

    approachTitle: "Mehr als nur Farben und Schriftarten",
    approachLead:
      "Jedes Projekt wird an das Unternehmen, seine Zielgruppe und die tatsächlichen Ziele der Website angepasst.",

    approach: [
      {
        title: "Strategie",
        text: "Wir strukturieren Informationen so, dass Besucher das Unternehmen schnell verstehen.",
      },
      {
        title: "Design",
        text: "Wir entwickeln eine moderne und konsistente visuelle Identität.",
      },
      {
        title: "Performance",
        text: "Websites werden für schnelle Ladezeiten und verschiedene Geräte optimiert.",
      },
      {
        title: "Conversion",
        text: "Kontaktmöglichkeiten und Inhalte werden gezielt platziert, um Anfragen zu erleichtern.",
      },
    ],

    finalBadge: "Verdient Ihr Unternehmen einen besseren Online-Auftritt?",
  },

  fr: {
    introBadge: "Projets & concepts",
    selectedWork: "Projet à la une",
    selectedLead:
      "Des projets développés autour de la clarté, de l'expérience utilisateur et d'une présence digitale plus professionnelle.",

    projectType: "Type",
    projectTypeValue: "Site institutionnel",

    objective: "Objectif",
    objectiveValue: "Moderniser la présence digitale",

    delivery: "Projet",
    deliveryValue: "Développement complet",

    workTitle: "Travail réalisé",
    workItems: [
      "Structure et organisation du contenu",
      "Design responsive mobile et ordinateur",
      "Présentation claire des activités et informations",
      "Navigation et contact simplifiés",
    ],

    conceptsBadge: "Exploration visuelle",
    conceptNote:
      "Les projets ci-dessous sont des concepts démonstratifs créés pour explorer différents secteurs et styles.",

    conceptLabels: [
      "Services locaux",
      "Hébergement touristique",
      "Entreprise artisanale",
    ],

    approachTitle: "Bien plus que changer des couleurs",
    approachLead:
      "Chaque projet est pensé selon l'activité, le public et les objectifs réels du site.",

    approach: [
      {
        title: "Stratégie",
        text: "Nous organisons l'information pour que le visiteur comprenne rapidement l'activité.",
      },
      {
        title: "Design",
        text: "Nous créons une identité visuelle moderne et cohérente adaptée au projet.",
      },
      {
        title: "Performance",
        text: "Les sites sont préparés pour être rapides et fonctionner sur tous les appareils.",
      },
      {
        title: "Conversion",
        text: "Les appels à l'action et les contacts sont placés pour faciliter les demandes.",
      },
    ],

    finalBadge: "Votre entreprise mérite une meilleure présence en ligne ?",
  },

  es: {
    introBadge: "Proyectos & conceptos",
    selectedWork: "Proyecto destacado",
    selectedLead:
      "Proyectos desarrollados con foco en claridad, experiencia de usuario y una presencia digital más profesional.",

    projectType: "Tipo",
    projectTypeValue: "Web corporativa",

    objective: "Objetivo",
    objectiveValue: "Modernizar la presencia digital",

    delivery: "Proyecto",
    deliveryValue: "Desarrollo completo",

    workTitle: "Qué se trabajó",
    workItems: [
      "Estructura y organización del contenido",
      "Diseño responsive para móvil y ordenador",
      "Presentación clara de actividades e información",
      "Navegación y contacto simplificados",
    ],

    conceptsBadge: "Exploración visual",
    conceptNote:
      "Los proyectos siguientes son conceptos demostrativos creados para explorar distintos sectores, estilos y necesidades.",

    conceptLabels: [
      "Servicios locales",
      "Alojamiento turístico",
      "Negocio artesanal",
    ],

    approachTitle: "Mucho más que cambiar colores y tipografías",
    approachLead:
      "Cada proyecto se plantea según el negocio, su público y lo que la web realmente necesita conseguir.",

    approach: [
      {
        title: "Estrategia",
        text: "Organizamos la información para que el visitante entienda rápidamente el negocio.",
      },
      {
        title: "Diseño",
        text: "Creamos una identidad visual moderna y coherente adaptada a cada proyecto.",
      },
      {
        title: "Rendimiento",
        text: "Las webs se preparan para cargar rápido y funcionar correctamente en distintos dispositivos.",
      },
      {
        title: "Conversión",
        text: "Los contactos y llamadas a la acción se colocan para facilitar solicitudes.",
      },
    ],

    finalBadge: "¿Tu negocio merece una mejor presencia online?",
  },
};

function MiniBrowser({
  eyebrow,
  headline,
  lines,
  icon: Icon,
  index,
}: {
  eyebrow: string;
  headline: string;
  lines: string[];
  icon: typeof Waves;
  index: number;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-background shadow-lg shadow-black/5">
      <div className="flex h-9 items-center gap-1.5 border-b border-border/60 bg-card/60 px-3">
        <span className="size-1.5 rounded-full bg-muted-foreground/30" />
        <span className="size-1.5 rounded-full bg-muted-foreground/20" />
        <span className="size-1.5 rounded-full bg-muted-foreground/10" />

        <div className="ml-3 h-4 flex-1 rounded-md bg-secondary/60" />
      </div>

      <div className="relative min-h-[245px] overflow-hidden p-5">
        <div className="absolute -right-12 -top-12 size-40 rounded-full bg-primary/10 blur-3xl transition duration-500 group-hover:bg-primary/20" />

        <div
          className={`absolute ${
            index === 1 ? "bottom-5 right-5" : "right-5 top-16"
          }`}
        >
          <div className="relative grid size-24 place-items-center rounded-[28px] border border-primary/15 bg-primary/[0.06]">
            <Icon className="size-8 text-primary/60" />

            <div className="absolute -bottom-4 -left-6 h-16 w-10 rounded-xl border border-border bg-background p-1.5 shadow-xl">
              <div className="h-5 rounded-md bg-primary/15" />
              <div className="mt-1 h-1 rounded-full bg-secondary" />
              <div className="mt-1 h-1 w-3/4 rounded-full bg-secondary" />
              <div className="mt-2 h-2.5 rounded bg-primary/70" />
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-[65%]">
          <span className="text-[9px] font-semibold uppercase tracking-[.18em] text-primary">
            {eyebrow}
          </span>

          <h3 className="mt-3 text-xl font-semibold leading-tight tracking-tight">
            {headline}
          </h3>

          <div className="mt-5 space-y-2">
            {lines.map((line) => (
              <div
                key={line}
                className="flex items-center gap-2 text-[9px] text-muted-foreground"
              >
                <CheckCircle2 className="size-3 text-primary" />
                {line}
              </div>
            ))}
          </div>

          <div className="mt-6 h-7 w-24 rounded-lg bg-primary/90" />
        </div>
      </div>
    </div>
  );
}

export function PortfolioPage({ locale }: { locale: Locale }) {
  const t = dict[locale].portfolio;
  const paths = PATHS[locale];
  const extra = EXTRA_TEXT[locale];

  const approachIcons = [Target, Palette, Gauge, BadgeCheck];

  return (
    <SiteChrome locale={locale} page="portfolio">
      {/* INTRO */}
      <section className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
          <Chip tone="primary">{extra.introBadge}</Chip>

          <h1 className="orbit-gradient-text mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {t.h1}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {t.lead}
          </p>
        </div>

        <div className="hidden items-center gap-3 rounded-2xl border border-border/60 bg-card/30 px-4 py-3 text-xs text-muted-foreground lg:flex">
          <Sparkles className="size-4 text-primary" />
          {extra.selectedLead}
        </div>
      </section>

      {/* FEATURED REAL PROJECT */}
      <section className="mt-14">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">
              {extra.selectedWork}
            </span>
          </div>

          <span className="hidden text-[10px] uppercase tracking-[.18em] text-muted-foreground sm:block">
            01 — {t.realChip}
          </span>
        </div>

        <article className="overflow-hidden rounded-3xl border border-border/70 bg-card/40 shadow-xl shadow-black/5">
          <div className="grid lg:grid-cols-[1.15fr_.85fr]">
            {/* VISUAL */}
            <div className="relative overflow-hidden border-b border-border/60 bg-background/30 p-5 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="absolute -left-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-28 right-0 size-64 rounded-full bg-primary/5 blur-3xl" />

              <div className="relative mx-auto max-w-2xl">
                <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/10">
                  <div className="flex h-10 items-center gap-1.5 border-b border-border/60 bg-card/80 px-3">
                    <span className="size-2 rounded-full bg-muted-foreground/30" />
                    <span className="size-2 rounded-full bg-muted-foreground/20" />
                    <span className="size-2 rounded-full bg-muted-foreground/10" />

                    <div className="mx-auto flex h-5 w-44 items-center justify-center rounded-md bg-secondary/60 text-[8px] text-muted-foreground">
                      31janeiromanique.net
                    </div>
                  </div>

                  <div className="relative min-h-[350px] overflow-hidden bg-gradient-to-br from-primary/[0.08] via-background to-secondary/30 p-6 sm:min-h-[410px] sm:p-9">
                    <div className="absolute right-8 top-8 size-40 rounded-full bg-primary/10 blur-3xl" />

                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-semibold uppercase tracking-[.2em] text-primary">
                            Sociedade 31 de Janeiro
                          </span>

                          <p className="mt-2 text-xs text-muted-foreground">
                            Manique de Baixo
                          </p>
                        </div>

                        <div className="hidden gap-2 sm:flex">
                          <span className="h-7 w-14 rounded-lg border border-border bg-background/70" />
                          <span className="h-7 w-20 rounded-lg bg-primary" />
                        </div>
                      </div>

                      <div className="mt-12 max-w-lg">
                        <h2 className="text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
                          {t.featuredHeadline}
                        </h2>

                        <p className="mt-4 max-w-md text-xs leading-6 text-muted-foreground sm:text-sm">
                          {t.featuredText}
                        </p>

                        <div className="mt-6 flex gap-2">
                          <span className="h-9 w-28 rounded-lg bg-primary" />
                          <span className="h-9 w-24 rounded-lg border border-border bg-background/50" />
                        </div>
                      </div>

                      <div className="mt-10 grid grid-cols-3 gap-3">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-border/50 bg-background/50 p-3"
                          >
                            <div className="h-10 rounded-lg bg-primary/[0.08]" />
                            <div className="mt-3 h-1.5 rounded-full bg-secondary" />
                            <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-secondary" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-5 -right-1 hidden h-44 w-24 rounded-[24px] border border-border bg-background p-2 shadow-2xl sm:block">
                  <div className="h-5 rounded-md bg-secondary" />
                  <div className="mt-3 h-16 rounded-xl bg-primary/10" />
                  <div className="mt-3 h-1.5 rounded-full bg-secondary" />
                  <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-secondary" />
                  <div className="mt-4 h-6 rounded-md bg-primary" />
                </div>
              </div>
            </div>

            {/* DETAILS */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <Chip tone="primary">{t.realChip}</Chip>

              <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                Manique de Baixo
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {t.featuredDesc}
              </p>

              <div className="mt-7 grid gap-3">
                <div className="grid grid-cols-[90px_1fr] gap-4 border-b border-border/60 pb-3 text-xs">
                  <span className="text-muted-foreground">
                    {extra.projectType}
                  </span>

                  <span className="font-medium">
                    {extra.projectTypeValue}
                  </span>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-4 border-b border-border/60 pb-3 text-xs">
                  <span className="text-muted-foreground">
                    {extra.objective}
                  </span>

                  <span className="font-medium">
                    {extra.objectiveValue}
                  </span>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-4 text-xs">
                  <span className="text-muted-foreground">
                    {extra.delivery}
                  </span>

                  <span className="font-medium">
                    {extra.deliveryValue}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-xs font-semibold">
                  {extra.workTitle}
                </p>

                <div className="mt-3 space-y-2">
                  {extra.workItems.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="https://31janeiromanique.net"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90"
                >
                  {t.visit}
                  <ArrowUpRight className="size-4" />
                </a>

                <Link
                  to={paths.contact}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-5 text-sm transition hover:bg-accent"
                >
                  {t.ctaButton}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* CONCEPTS */}
      <section className="mt-20">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="max-w-2xl">
            <Chip tone="primary">{extra.conceptsBadge}</Chip>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t.othersTitle}
            </h2>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {extra.conceptNote}
            </p>
          </div>

          <span className="hidden text-[10px] uppercase tracking-[.18em] text-muted-foreground sm:block">
            02 — 04
          </span>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {t.concepts.map((project, idx) => {
            const Icon = CONCEPT_ICONS[idx] ?? Waves;

            return (
              <article
                key={project.titulo}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/40 transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-black/5"
              >
                <div className="p-4 pb-0">
                  <MiniBrowser
                    eyebrow={project.preview.eyebrow}
                    headline={project.preview.headline}
                    lines={project.preview.lines}
                    icon={Icon}
                    index={idx}
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-[9px] font-semibold uppercase tracking-[.12em] text-primary">
                      {project.etiqueta}
                    </span>

                    <span className="text-[10px] font-semibold tracking-[.18em] text-muted-foreground">
                      0{idx + 2}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-semibold leading-snug">
                    {project.titulo}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    {project.descricao}
                  </p>

                  <div className="mt-auto pt-6">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-muted-foreground">
                      <Icon className="size-3.5 text-primary" />
                      {extra.conceptLabels[idx]}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* APPROACH */}
      <section className="mt-20">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <Chip tone="primary">Nova Web Studio</Chip>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {extra.approachTitle}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              {extra.approachLead}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {extra.approach.map((item, idx) => {
              const Icon = approachIcons[idx] ?? Layers3;

              return (
                <article
                  key={item.title}
                  className="orbit-panel orbit-panel-hover p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </span>

                    <span className="text-[10px] font-semibold tracking-[.18em] text-muted-foreground">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    {item.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/[0.06] p-7 sm:p-10">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-28 left-20 size-64 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">
                {extra.finalBadge}
              </span>

              <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
                {t.ctaTitle}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                {t.ctaText}
              </p>
            </div>

            <Link
              to={paths.contact}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 hover:opacity-90"
            >
              {t.ctaButton}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
