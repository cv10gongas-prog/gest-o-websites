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
    secondWork: string;

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
    secondWork: "Outro projeto real",

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
    secondWork: "Another live project",

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
    secondWork: "Weiteres reales Projekt",

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
    secondWork: "Autre projet réel",

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
    secondWork: "Otro proyecto real",

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
      <style>{`
        @keyframes nws-portfolio-wave {
          0%, 100% {
            transform: scaleY(.32);
            opacity: .55;
          }

          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes nws-portfolio-pulse {
          0%, 100% {
            opacity: .45;
            transform: scale(1);
          }

          50% {
            opacity: .85;
            transform: scale(1.06);
          }
        }

        .nws-portfolio-wave {
          transform-origin: bottom;
          animation: nws-portfolio-wave 1.45s ease-in-out infinite;
        }

        .nws-portfolio-pulse {
          animation: nws-portfolio-pulse 5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .nws-portfolio-wave,
          .nws-portfolio-pulse {
            animation: none !important;
          }
        }
      `}</style>

      {/* INTRO */}
      <section className="max-w-4xl">
        <Chip tone="primary">{extra.introBadge}</Chip>

        <h1 className="orbit-gradient-text mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
          {t.h1}
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {t.lead}
        </p>

        <div className="mt-6 inline-flex max-w-2xl items-center gap-3 rounded-2xl border border-border/60 bg-card/30 px-4 py-3 text-xs text-muted-foreground">
          <Sparkles className="size-4 shrink-0 text-primary" />
          {extra.selectedLead}
        </div>
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

        <article className="overflow-hidden rounded-3xl border border-border/70 bg-card/40 shadow-xl shadow-black/5">
          <div className="grid lg:grid-cols-[1.15fr_.85fr]">
            <div className="relative min-h-[420px] overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-secondary/30 p-8 lg:border-b-0 lg:border-r">
              <div className="absolute -left-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative">
                <span className="text-[9px] font-semibold uppercase tracking-[.2em] text-primary">
                  Sociedade 31 de Janeiro
                </span>

                <p className="mt-2 text-xs text-muted-foreground">
                  Manique de Baixo
                </p>

                <h2 className="mt-10 max-w-lg text-4xl font-semibold leading-tight tracking-tight">
                  {t.featuredHeadline}
                </h2>

                <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                  {t.featuredText}
                </p>

                <div className="mt-7 flex gap-2">
                  <span className="h-9 w-28 rounded-lg bg-primary" />
                  <span className="h-9 w-24 rounded-lg border border-border bg-background/60" />
                </div>

                <div className="mt-10 grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
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

            <div className="flex flex-col justify-center p-7 sm:p-9">
              <Chip tone="primary">{t.realChip}</Chip>

              <h2 className="mt-5 text-3xl font-semibold tracking-tight">
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

      {/* RÁDIO */}
      <section className="mt-16">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">
            {extra.secondWork}
          </span>

          <span className="text-[10px] uppercase tracking-[.18em] text-muted-foreground">
            02 — {extra.radioBadge}
          </span>
        </div>

        <article className="overflow-hidden rounded-3xl border border-border/70 bg-card/40 shadow-xl shadow-black/5">
          <div className="grid lg:grid-cols-[.9fr_1.1fr]">
            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden border-b border-border/60 bg-gradient-to-br from-[#07111c] via-[#0b1b27] to-[#0d2a32] p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="absolute -left-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />

              <div className="nws-portfolio-pulse absolute -bottom-24 right-0 size-64 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative w-full max-w-md">
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-sm transition duration-500 hover:-translate-y-1 hover:border-white/15 sm:p-10">
                  <div className="flex justify-center">
                    <div className="relative flex size-40 items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.05] p-3 shadow-xl sm:size-52 sm:p-4">
                      <img
                        src="/radio-alcabidechefm.png"
                        alt="Rádio AlcabidecheFM"
                        className="max-h-[82%] max-w-[88%] object-contain sm:max-h-[86%] sm:max-w-[90%]"
                      />
                    </div>
                  </div>

                  <div className="mt-7 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-primary">
                      Rádio · Alcabideche
                    </p>

                    <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                      Rádio AlcabidecheFM
                    </h3>

                    <div className="mx-auto mt-5 flex h-12 max-w-[230px] items-end justify-center gap-1.5">
                      {[
                        14, 28, 20, 38, 24,
                        46, 30, 18, 34, 22,
                      ].map((height, idx) => (
                        <span
                          key={idx}
                          className="nws-portfolio-wave w-1.5 rounded-full bg-primary/80"
                          style={{
                            height,
                            animationDelay: `${idx * 90}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-10">
              <div className="flex flex-wrap gap-2">
                <Chip tone="primary">{extra.radioBadge}</Chip>

                <span className="inline-flex min-h-7 items-center rounded-full border border-primary/20 bg-primary/[0.06] px-3 text-[9px] font-semibold uppercase tracking-[.14em] text-primary">
                  {extra.radioPartner}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-primary">
                <Radio className="size-3.5" />
                Rádio · Alcabideche
              </div>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Rádio AlcabidecheFM
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {extra.radioText}
              </p>

              <div className="mt-7 grid gap-3">
                <div className="grid grid-cols-[90px_1fr] gap-4 border-b border-border/60 pb-3 text-xs">
                  <span className="text-muted-foreground">
                    {extra.projectType}
                  </span>

                  <span className="font-medium">
                    {extra.radioType}
                  </span>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-4 border-b border-border/60 pb-3 text-xs">
                  <span className="text-muted-foreground">
                    {extra.objective}
                  </span>

                  <span className="font-medium">
                    {extra.radioObjective}
                  </span>
                </div>

                <div className="grid grid-cols-[90px_1fr] gap-4 text-xs">
                  <span className="text-muted-foreground">
                    {extra.delivery}
                  </span>

                  <span className="font-medium">
                    {extra.radioDelivery}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-xs font-semibold">
                  {extra.workTitle}
                </p>

                <div className="mt-3 space-y-2">
                  {extra.radioItems.map((item) => (
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

              <div className="mt-8">
                <a
                  href="https://radioalcabidechefm.eu"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90"
                >
                  {extra.radioVisit}

                  <ArrowUpRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* CONCEITOS */}
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
            03 — 05
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
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1 text-[9px] font-semibold uppercase tracking-[.12em] text-primary">
                      {project.etiqueta}
                    </span>

                    <span className="text-[10px] font-semibold tracking-[.18em] text-muted-foreground">
                      0{idx + 3}
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

      {/* ABORDAGEM */}
      <section className="mt-20">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <Chip tone="primary">
              Nova Web Studio
            </Chip>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {extra.approachTitle}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              {extra.approachLead}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {extra.approach.map((item, idx) => {
              const Icon = approachIcons[idx] ?? BadgeCheck;

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
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/[0.06] p-8 sm:p-10">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">
                {extra.finalBadge}
              </span>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                {t.ctaTitle}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                {t.ctaText}
              </p>
            </div>

            <Link
              to={paths.contact}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90"
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
