import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BedDouble,
  CheckCircle2,
  Gauge,
  Hammer,
  Palette,
  Radio,
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

    radioBadge: string;
    radioPartner: string;
    radioText: string;
    radioType: string;
    radioObjective: string;
    radioDelivery: string;
    radioItems: string[];
    radioVisit: string;

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

    radioBadge: "Projeto real",

    radioPartner: "Parceiro Nova Web Studio",

    radioText:
      "Projeto desenvolvido para reforçar a presença digital da Rádio AlcabidecheFM, organizar informação e criar uma experiência moderna para a comunidade online.",

    radioType: "Website para rádio",

    radioObjective: "Reforçar a presença digital",

    radioDelivery: "Projeto desenvolvido",

    radioItems: [
      "Presença digital adaptada à identidade da rádio",
      "Estrutura pensada para conteúdos e informação",
      "Experiência responsiva",
      "Ligação à comunidade local",
    ],

    radioVisit: "Visitar website",

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
        text:
          "Organizamos a informação para que o visitante perceba rapidamente o negócio e saiba o que fazer a seguir.",
      },
      {
        title: "Design",
        text:
          "Criamos uma identidade visual coerente, moderna e adequada ao posicionamento de cada projeto.",
      },
      {
        title: "Performance",
        text:
          "Os websites são preparados para carregar rapidamente e funcionar corretamente em diferentes dispositivos.",
      },
      {
        title: "Conversão",
        text:
          "Botões, contactos e conteúdos são posicionados para facilitar pedidos de informação e orçamento.",
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

    radioBadge: "Live project",

    radioPartner: "Nova Web Studio partner",

    radioText:
      "A project developed to strengthen Rádio AlcabidecheFM's digital presence and create a modern online experience for its community.",

    radioType: "Radio website",

    radioObjective: "Strengthen digital presence",

    radioDelivery: "Developed project",

    radioItems: [
      "Digital presence aligned with the radio brand",
      "Structure designed around radio content",
      "Responsive experience",
      "Strong local community connection",
    ],

    radioVisit: "Visit website",

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
        text:
          "We organise information so visitors quickly understand the business and know what to do next.",
      },
      {
        title: "Design",
        text:
          "We create a coherent, modern visual identity suited to each project's positioning.",
      },
      {
        title: "Performance",
        text:
          "Websites are prepared to load quickly and work correctly across different devices.",
      },
      {
        title: "Conversion",
        text:
          "Calls to action, contact details and content are positioned to make enquiries easier.",
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
      "Responsives Design",
      "Klare Präsentation",
      "Vereinfachte Navigation",
    ],

    radioBadge: "Reales Projekt",

    radioPartner: "Partner von Nova Web Studio",

    radioText:
      "Projekt zur Stärkung der digitalen Präsenz von Rádio AlcabidecheFM.",

    radioType: "Radio-Website",

    radioObjective: "Digitale Präsenz stärken",

    radioDelivery: "Entwickeltes Projekt",

    radioItems: [
      "Digitale Markenpräsenz",
      "Struktur für Radioinhalte",
      "Responsive Erfahrung",
      "Lokale Verbindung",
    ],

    radioVisit: "Website besuchen",

    conceptsBadge: "Visuelle Exploration",

    conceptNote:
      "Demonstrationskonzepte für verschiedene Branchen und Anforderungen.",

    conceptLabels: [
      "Lokale Dienstleistungen",
      "Ferienunterkunft",
      "Handwerksbetrieb",
    ],

    approachTitle: "Mehr als nur Farben und Schriftarten",

    approachLead:
      "Jedes Projekt wird an das Unternehmen und seine Ziele angepasst.",

    approach: [
      {
        title: "Strategie",
        text: "Wir strukturieren Informationen klar.",
      },
      {
        title: "Design",
        text: "Wir entwickeln moderne visuelle Identitäten.",
      },
      {
        title: "Performance",
        text: "Websites werden für schnelle Ladezeiten optimiert.",
      },
      {
        title: "Conversion",
        text: "Kontakte werden gezielt erleichtert.",
      },
    ],

    finalBadge: "Verdient Ihr Unternehmen einen besseren Online-Auftritt?",
  },

  fr: {
    introBadge: "Projets & concepts",

    selectedWork: "Projet à la une",

    selectedLead:
      "Des projets développés autour de la clarté et de l'expérience utilisateur.",

    projectType: "Type",

    projectTypeValue: "Site institutionnel",

    objective: "Objectif",

    objectiveValue: "Moderniser la présence digitale",

    delivery: "Projet",

    deliveryValue: "Développement complet",

    workTitle: "Travail réalisé",

    workItems: [
      "Organisation du contenu",
      "Design responsive",
      "Présentation claire",
      "Navigation simplifiée",
    ],

    radioBadge: "Projet réel",

    radioPartner: "Partenaire Nova Web Studio",

    radioText:
      "Projet développé pour renforcer la présence digitale de Rádio AlcabidecheFM.",

    radioType: "Site radio",

    radioObjective: "Renforcer la présence digitale",

    radioDelivery: "Projet développé",

    radioItems: [
      "Identité digitale",
      "Structure adaptée à la radio",
      "Expérience responsive",
      "Lien avec la communauté",
    ],

    radioVisit: "Visiter le site",

    conceptsBadge: "Exploration visuelle",

    conceptNote:
      "Concepts démonstratifs créés pour différents secteurs.",

    conceptLabels: [
      "Services locaux",
      "Hébergement touristique",
      "Entreprise artisanale",
    ],

    approachTitle: "Bien plus que changer des couleurs",

    approachLead:
      "Chaque projet est pensé selon l'activité et ses objectifs.",

    approach: [
      {
        title: "Stratégie",
        text: "Nous organisons clairement l'information.",
      },
      {
        title: "Design",
        text: "Nous créons une identité visuelle moderne.",
      },
      {
        title: "Performance",
        text: "Les sites sont préparés pour être rapides.",
      },
      {
        title: "Conversion",
        text: "Les contacts sont facilités.",
      },
    ],

    finalBadge: "Votre entreprise mérite une meilleure présence en ligne ?",
  },

  es: {
    introBadge: "Proyectos & conceptos",

    selectedWork: "Proyecto destacado",

    selectedLead:
      "Proyectos desarrollados con foco en claridad y experiencia de usuario.",

    projectType: "Tipo",

    projectTypeValue: "Web corporativa",

    objective: "Objetivo",

    objectiveValue: "Modernizar la presencia digital",

    delivery: "Proyecto",

    deliveryValue: "Desarrollo completo",

    workTitle: "Qué se trabajó",

    workItems: [
      "Organización del contenido",
      "Diseño responsive",
      "Presentación clara",
      "Navegación simplificada",
    ],

    radioBadge: "Proyecto real",

    radioPartner: "Socio Nova Web Studio",

    radioText:
      "Proyecto desarrollado para reforzar la presencia digital de Rádio AlcabidecheFM.",

    radioType: "Web para radio",

    radioObjective: "Reforzar la presencia digital",

    radioDelivery: "Proyecto desarrollado",

    radioItems: [
      "Identidad digital",
      "Estructura adaptada a la radio",
      "Experiencia responsive",
      "Conexión local",
    ],

    radioVisit: "Visitar web",

    conceptsBadge: "Exploración visual",

    conceptNote:
      "Conceptos demostrativos creados para distintos sectores.",

    conceptLabels: [
      "Servicios locales",
      "Alojamiento turístico",
      "Negocio artesanal",
    ],

    approachTitle: "Mucho más que cambiar colores",

    approachLead:
      "Cada proyecto se plantea según el negocio y sus objetivos.",

    approach: [
      {
        title: "Estrategia",
        text: "Organizamos la información.",
      },
      {
        title: "Diseño",
        text: "Creamos identidades modernas.",
      },
      {
        title: "Rendimiento",
        text: "Preparamos webs rápidas.",
      },
      {
        title: "Conversión",
        text: "Facilitamos solicitudes y contactos.",
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
}: {
  eyebrow: string;
  headline: string;
  lines: string[];
  icon: typeof Waves;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-background shadow-lg shadow-black/5">
      <div className="flex h-9 items-center gap-1.5 border-b border-border/60 bg-card/60 px-3">
        <span className="size-1.5 rounded-full bg-muted-foreground/30" />
        <span className="size-1.5 rounded-full bg-muted-foreground/20" />
        <span className="size-1.5 rounded-full bg-muted-foreground/10" />

        <div className="ml-3 h-4 flex-1 rounded-md bg-secondary/60" />
      </div>

      <div className="relative min-h-[245px] overflow-hidden p-5">
        <div className="absolute right-5 top-16 grid size-24 place-items-center rounded-[28px] border border-primary/15 bg-primary/[0.06]">
          <Icon className="size-8 text-primary/60" />
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
      <section className="max-w-4xl">
        <Chip tone="primary">{extra.introBadge}</Chip>

        <h1 className="orbit-gradient-text mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
          {t.h1}
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {t.lead}
        </p>
      </section>

      {/* MANIQUE */}
      <section className="mt-14">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">
            {extra.selectedWork}
          </span>

          <span className="text-[10px] uppercase tracking-[.18em] text-muted-foreground">
            01 — {t.realChip}
          </span>
        </div>

        <article className="overflow-hidden rounded-3xl border border-border/70 bg-card/40">
          <div className="grid lg:grid-cols-[1.15fr_.85fr]">
            <div className="relative min-h-[420px] overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-secondary/30 p-8 lg:border-b-0 lg:border-r">
              <span className="text-[9px] font-semibold uppercase tracking-[.2em] text-primary">
                Sociedade 31 de Janeiro
              </span>

              <h2 className="mt-10 max-w-lg text-4xl font-semibold leading-tight tracking-tight">
                {t.featuredHeadline}
              </h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                {t.featuredText}
              </p>
            </div>

            <div className="p-7 sm:p-9">
              <Chip tone="primary">{t.realChip}</Chip>

              <h2 className="mt-5 text-3xl font-semibold">
                Manique de Baixo
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {t.featuredDesc}
              </p>

              <div className="mt-7 space-y-2">
                {extra.workItems.map((item) => (
                  <div
                    key={item}
                    className="flex gap-2 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="size-3.5 shrink-0 text-primary" />

                    {item}
                  </div>
                ))}
              </div>

              <a
                href="https://31janeiromanique.net"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground"
              >
                {t.visit}

                <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        </article>
      </section>

      {/* RADIO */}
      <section className="mt-16">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">
            {extra.selectedWork}
          </span>

          <span className="text-[10px] uppercase tracking-[.18em] text-muted-foreground">
            02 — {extra.radioBadge}
          </span>
        </div>

        <article className="overflow-hidden rounded-3xl border border-border/70 bg-card/40">
          <div className="grid lg:grid-cols-[.9fr_1.1fr]">
            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden border-b border-border/60 bg-[#f5f5f3] p-8 lg:border-b-0 lg:border-r">
              <img
                src="/radio-alcabidechefm.png"
                alt="Rádio AlcabidecheFM"
                className="max-h-[300px] max-w-[75%] object-contain"
              />
            </div>

            <div className="p-7 sm:p-9">
              <div className="flex flex-wrap gap-2">
                <Chip tone="primary">{extra.radioBadge}</Chip>

                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/[0.06] px-3 text-[9px] font-semibold uppercase tracking-[.14em] text-primary">
                  {extra.radioPartner}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-primary">
                <Radio className="size-4" />

                AlcabidecheFM
              </div>

              <h2 className="mt-3 text-3xl font-semibold">
                Rádio AlcabidecheFM
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {extra.radioText}
              </p>

              <div className="mt-7 space-y-2">
                {extra.radioItems.map((item) => (
                  <div
                    key={item}
                    className="flex gap-2 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="size-3.5 shrink-0 text-primary" />

                    {item}
                  </div>
                ))}
              </div>

              <a
                href="https://radioalcabidechefm.eu"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground"
              >
                {extra.radioVisit}

                <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        </article>
      </section>

      {/* CONCEITOS */}
      <section className="mt-20">
        <Chip tone="primary">{extra.conceptsBadge}</Chip>

        <h2 className="mt-4 text-3xl font-semibold">
          {t.othersTitle}
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          {extra.conceptNote}
        </p>

        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {t.concepts.map((project, idx) => {
            const Icon = CONCEPT_ICONS[idx] ?? Waves;

            return (
              <article
                key={project.titulo}
                className="rounded-3xl border border-border/70 bg-card/40 p-4"
              >
                <MiniBrowser
                  eyebrow={project.preview.eyebrow}
                  headline={project.preview.headline}
                  lines={project.preview.lines}
                  icon={Icon}
                />

                <div className="p-2 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-[.14em] text-primary">
                      {project.etiqueta}
                    </span>

                    <span className="text-[10px] text-muted-foreground">
                      0{idx + 3}
                    </span>
                  </div>

                  <h3 className="mt-4 font-semibold">
                    {project.titulo}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    {project.descricao}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* PROCESSO */}
      <section className="mt-20">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <Chip tone="primary">
              Nova Web Studio
            </Chip>

            <h2 className="mt-4 text-3xl font-semibold">
              {extra.approachTitle}
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {extra.approachLead}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {extra.approach.map((item, idx) => {
              const Icon = approachIcons[idx];

              return (
                <article
                  key={item.title}
                  className="orbit-panel orbit-panel-hover p-5"
                >
                  <Icon className="size-4 text-primary" />

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
        <div className="rounded-3xl border border-primary/20 bg-primary/[0.06] p-8 sm:p-10">
          <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">
            {extra.finalBadge}
          </span>

          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                {t.ctaTitle}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {t.ctaText}
              </p>
            </div>

            <Link
              to={paths.contact}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground"
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
