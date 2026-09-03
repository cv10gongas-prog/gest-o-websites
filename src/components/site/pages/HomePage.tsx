import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  Gauge,
  LayoutTemplate,
  LineChart,
  MapPin,
  MessageSquareText,
  MonitorSmartphone,
  Rocket,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";

import { Chip, Panel } from "@/components/crm/Bits";
import { SiteChrome } from "@/components/site/SiteChrome";
import { dict, PATHS, type Locale } from "@/lib/i18n";

const SERVICE_ICONS = [LayoutTemplate, Gauge, LineChart];
const TYPE_ICONS = [Sparkles, ShoppingBag, Smartphone, Rocket];
const PASSOS = ["01", "02", "03", "04"];

const EXTRA_TEXT: Record<
  Locale,
  {
    proof: string;
    featuredLabel: string;
    featuredTitle: string;
    featuredText: string;
    featuredButton: string;
    whyTitle: string;
    whyLead: string;
    advantages: {
      title: string;
      text: string;
    }[];
    processLead: string;
    finalBadge: string;
  }
> = {
  pt: {
    proof: "Projeto real desenvolvido pela Nova Web Studio",
    featuredLabel: "Projeto em destaque",
    featuredTitle: "Sociedade 31 de Janeiro de Manique de Baixo",
    featuredText:
      "Um website institucional moderno desenvolvido para aproximar a coletividade da comunidade, apresentar atividades e facilitar o acesso a informação e contactos.",
    featuredButton: "Ver projeto online",
    whyTitle: "Um website não deve ser apenas bonito",
    whyLead:
      "Criamos experiências digitais pensadas para transmitir confiança, funcionar bem em qualquer dispositivo e tornar mais simples o contacto entre o seu negócio e novos clientes.",
    advantages: [
      {
        title: "Contacto direto",
        text: "Fala diretamente connosco durante todo o projeto, sem processos complicados.",
      },
      {
        title: "Pensado para telemóvel",
        text: "Cada página é preparada para funcionar e apresentar-se bem em qualquer ecrã.",
      },
      {
        title: "Rápido e otimizado",
        text: "Construímos websites leves, claros e preparados para motores de pesquisa.",
      },
      {
        title: "Feito para o seu negócio",
        text: "Não fazemos apenas um site bonito: adaptamos a estrutura aos seus objetivos.",
      },
    ],
    processLead:
      "Um processo simples, transparente e sem complicações desnecessárias.",
    finalBadge: "Comece com uma conversa sem compromisso",
  },

  en: {
    proof: "Real project developed by Nova Web Studio",
    featuredLabel: "Featured project",
    featuredTitle: "Sociedade 31 de Janeiro de Manique de Baixo",
    featuredText:
      "A modern institutional website created to bring the association closer to its community, showcase activities and make information and contact details easier to access.",
    featuredButton: "View live project",
    whyTitle: "A website should do more than look good",
    whyLead:
      "We create digital experiences designed to build trust, work beautifully on every device and make it easier for potential clients to contact your business.",
    advantages: [
      {
        title: "Direct communication",
        text: "You speak directly with us throughout the project, without unnecessary complexity.",
      },
      {
        title: "Mobile first",
        text: "Every page is designed to work and look great across different screen sizes.",
      },
      {
        title: "Fast and optimised",
        text: "We build lightweight, clear websites prepared for search engines.",
      },
      {
        title: "Built around your business",
        text: "We do more than make it look good: the structure is adapted to your goals.",
      },
    ],
    processLead:
      "A simple and transparent process without unnecessary complications.",
    finalBadge: "Start with a no-obligation conversation",
  },

  de: {
    proof: "Reales Projekt von Nova Web Studio",
    featuredLabel: "Ausgewähltes Projekt",
    featuredTitle: "Sociedade 31 de Janeiro de Manique de Baixo",
    featuredText:
      "Eine moderne institutionelle Website, die den Verein näher an seine Gemeinschaft bringt, Aktivitäten präsentiert und Informationen sowie Kontakte leichter zugänglich macht.",
    featuredButton: "Projekt ansehen",
    whyTitle: "Eine Website sollte mehr können als nur gut aussehen",
    whyLead:
      "Wir entwickeln digitale Erlebnisse, die Vertrauen schaffen, auf jedem Gerät funktionieren und den Kontakt zwischen Ihrem Unternehmen und neuen Kunden erleichtern.",
    advantages: [
      {
        title: "Direkter Kontakt",
        text: "Sie sprechen während des gesamten Projekts direkt mit uns.",
      },
      {
        title: "Für Mobilgeräte entwickelt",
        text: "Jede Seite wird für unterschiedliche Bildschirmgrößen optimiert.",
      },
      {
        title: "Schnell und optimiert",
        text: "Wir entwickeln leichte und klare Websites für Nutzer und Suchmaschinen.",
      },
      {
        title: "Für Ihr Unternehmen",
        text: "Struktur und Inhalte werden an die Ziele Ihres Unternehmens angepasst.",
      },
    ],
    processLead:
      "Ein einfacher und transparenter Prozess ohne unnötige Komplikationen.",
    finalBadge: "Beginnen Sie mit einem unverbindlichen Gespräch",
  },

  fr: {
    proof: "Projet réel développé par Nova Web Studio",
    featuredLabel: "Projet à la une",
    featuredTitle: "Sociedade 31 de Janeiro de Manique de Baixo",
    featuredText:
      "Un site institutionnel moderne conçu pour rapprocher l'association de sa communauté, présenter ses activités et faciliter l'accès aux informations et aux contacts.",
    featuredButton: "Voir le projet",
    whyTitle: "Un site ne doit pas seulement être beau",
    whyLead:
      "Nous créons des expériences digitales pensées pour inspirer confiance, fonctionner sur tous les appareils et faciliter le contact entre votre entreprise et de nouveaux clients.",
    advantages: [
      {
        title: "Contact direct",
        text: "Vous échangez directement avec nous pendant toute la durée du projet.",
      },
      {
        title: "Pensé pour le mobile",
        text: "Chaque page est conçue pour fonctionner sur toutes les tailles d'écran.",
      },
      {
        title: "Rapide et optimisé",
        text: "Nous créons des sites légers, clairs et préparés pour les moteurs de recherche.",
      },
      {
        title: "Adapté à votre activité",
        text: "La structure est développée en fonction des objectifs de votre entreprise.",
      },
    ],
    processLead:
      "Un processus simple et transparent, sans complications inutiles.",
    finalBadge: "Commencez par une conversation sans engagement",
  },

  es: {
    proof: "Proyecto real desarrollado por Nova Web Studio",
    featuredLabel: "Proyecto destacado",
    featuredTitle: "Sociedade 31 de Janeiro de Manique de Baixo",
    featuredText:
      "Una web institucional moderna creada para acercar la asociación a su comunidad, presentar actividades y facilitar el acceso a información y contactos.",
    featuredButton: "Ver proyecto",
    whyTitle: "Una web no debería ser solo bonita",
    whyLead:
      "Creamos experiencias digitales pensadas para transmitir confianza, funcionar perfectamente en cualquier dispositivo y facilitar el contacto entre tu negocio y nuevos clientes.",
    advantages: [
      {
        title: "Contacto directo",
        text: "Hablas directamente con nosotros durante todo el proyecto.",
      },
      {
        title: "Pensado para móvil",
        text: "Cada página está preparada para funcionar bien en cualquier pantalla.",
      },
      {
        title: "Rápido y optimizado",
        text: "Creamos webs ligeras, claras y preparadas para los buscadores.",
      },
      {
        title: "Adaptado a tu negocio",
        text: "La estructura se desarrolla en función de los objetivos de tu empresa.",
      },
    ],
    processLead:
      "Un proceso sencillo y transparente, sin complicaciones innecesarias.",
    finalBadge: "Empieza con una conversación sin compromiso",
  },
};

export function HomePage({ locale }: { locale: Locale }) {
  const t = dict[locale].home;
  const portfolio = dict[locale].portfolio;
  const paths = PATHS[locale];
  const extra = EXTRA_TEXT[locale];

  return (
    <SiteChrome locale={locale} page="home">
      {/* HERO */}
      <section className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-14">
          <div>
            <Chip tone="primary">{t.chip}</Chip>

            <h1 className="orbit-gradient-text mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.6rem]">
              {t.h1}
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {t.lead}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to={paths.contact}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 hover:opacity-90"
              >
                <CalendarCheck className="size-4" />
                {t.ctaProposal}
              </Link>

              <Link
                to={paths.portfolio}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background/40 px-5 text-sm text-foreground transition hover:-translate-y-0.5 hover:bg-accent"
              >
                {t.ctaPortfolio}
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" />
                {t.badgeArea}
              </span>

              <span className="flex items-center gap-1.5">
                <BadgeCheck className="size-3.5 text-primary" />
                {t.badgeMobile}
              </span>
            </div>
          </div>

          {/* MOCKUP / STATS */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/5 blur-3xl" />

            <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/60 shadow-2xl shadow-black/10 backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
                <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                <span className="size-2.5 rounded-full bg-muted-foreground/20" />
                <span className="size-2.5 rounded-full bg-muted-foreground/10" />

                <div className="ml-3 h-7 flex-1 rounded-lg border border-border/60 bg-background/50 px-3 text-[10px] leading-7 text-muted-foreground">
                  novawebstudio.pt
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="Nova Web Studio"
                    className="size-9 object-contain"
                  />

                  <div>
                    <p className="text-sm font-semibold">Nova Web Studio</p>
                    <p className="text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                      {dict[locale].nav.tagline}
                    </p>
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  <div className="h-2.5 w-4/5 rounded-full bg-primary/20" />
                  <div className="h-2.5 w-full rounded-full bg-secondary" />
                  <div className="h-2.5 w-3/5 rounded-full bg-secondary" />
                </div>

                <div className="mt-7 grid grid-cols-3 gap-3">
                  {t.stats.map((i) => (
                    <div
                      key={i.valor}
                      className="rounded-2xl border border-border/60 bg-background/40 p-3"
                    >
                      <p className="text-lg font-semibold tracking-tight">
                        {i.valor}
                      </p>

                      <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">
                        {i.texto}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-[1.3fr_.7fr] gap-3">
                  <div className="h-20 rounded-2xl bg-secondary/60" />
                  <div className="h-20 rounded-2xl border border-primary/20 bg-primary/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST LINE */}
      <section className="mt-14">
        <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/30 px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary" />
            {extra.proof}
          </span>

          <span className="flex items-center gap-2">
            <MonitorSmartphone className="size-4 text-primary" />
            {t.badgeMobile}
          </span>

          <span className="flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            {t.stats[1]?.texto}
          </span>
        </div>
      </section>

      {/* FEATURED PROJECT */}
      <section className="mt-20">
        <div className="mb-6">
          <Chip tone="primary">{extra.featuredLabel}</Chip>

          <h2 className="mt-4 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            {portfolio.featuredHeadline}
          </h2>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/50">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="relative min-h-[300px] overflow-hidden border-b border-border/60 bg-background/40 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative mx-auto max-w-xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
                <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                  <span className="size-2 rounded-full bg-muted-foreground/30" />
                  <span className="size-2 rounded-full bg-muted-foreground/20" />
                  <span className="size-2 rounded-full bg-muted-foreground/10" />

                  <div className="ml-2 flex-1 truncate rounded-md bg-secondary/60 px-3 py-1 text-[9px] text-muted-foreground">
                    31janeiromanique.net
                  </div>
                </div>

                <div className="p-6">
                  <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-[.15em] text-primary">
                    {portfolio.realChip}
                  </div>

                  <div className="mt-5 h-3 w-4/5 rounded-full bg-foreground/15" />
                  <div className="mt-2 h-3 w-3/5 rounded-full bg-foreground/10" />

                  <div className="mt-7 grid grid-cols-3 gap-3">
                    <div className="h-20 rounded-xl bg-secondary" />
                    <div className="h-20 rounded-xl bg-secondary" />
                    <div className="h-20 rounded-xl bg-secondary" />
                  </div>

                  <div className="mt-5 h-2 w-full rounded-full bg-secondary" />
                  <div className="mt-2 h-2 w-5/6 rounded-full bg-secondary" />
                  <div className="mt-2 h-2 w-2/3 rounded-full bg-secondary" />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <span className="text-xs font-medium uppercase tracking-[.18em] text-primary">
                {portfolio.realChip}
              </span>

              <h3 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                {extra.featuredTitle}
              </h3>

              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {extra.featuredText}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://31janeiromanique.net"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  {extra.featuredButton}
                  <ArrowUpRight className="size-4" />
                </a>

                <Link
                  to={paths.portfolio}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  {t.ctaPortfolio}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="mt-20">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <Chip tone="primary">{t.aboutTitle}</Chip>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {extra.whyTitle}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              {extra.whyLead}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {extra.advantages.map((item, idx) => {
              const icons = [
                MessageSquareText,
                MonitorSmartphone,
                Zap,
                ShieldCheck,
              ];

              const Icon = icons[idx] ?? BadgeCheck;

              return (
                <article
                  key={item.title}
                  className="orbit-panel orbit-panel-hover p-5"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </span>

                  <h3 className="mt-4 text-sm font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="mt-20">
        <div className="max-w-2xl">
          <Chip tone="primary">{t.servicesTitle}</Chip>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.aboutTitle}
          </h2>

          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {t.aboutP1}
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {t.services.map((s, idx) => {
            const Icon = SERVICE_ICONS[idx] ?? LayoutTemplate;

            return (
              <article
                key={s.titulo}
                className="group orbit-panel orbit-panel-hover relative overflow-hidden p-6"
              >
                <div className="absolute right-0 top-0 size-24 rounded-full bg-primary/5 blur-2xl transition group-hover:bg-primary/10" />

                <span className="relative grid size-10 place-items-center rounded-xl bg-secondary">
                  <Icon className="size-4 text-primary" />
                </span>

                <h3 className="relative mt-5 text-base font-semibold">
                  {s.titulo}
                </h3>

                <p className="relative mt-2 text-xs leading-6 text-muted-foreground">
                  {s.texto}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* WEBSITE TYPES */}
      <section className="mt-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {t.typesTitle}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t.aboutP2}
            </p>
          </div>

          <Link
            to={paths.contact}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            {t.ctaProposal}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.types.map((tipo, idx) => {
            const Icon = TYPE_ICONS[idx] ?? Sparkles;

            return (
              <article
                key={tipo.titulo}
                className="orbit-panel orbit-panel-hover p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </span>

                  <span className="text-[10px] font-semibold tracking-[.18em] text-muted-foreground">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="mt-5 text-sm font-semibold">
                  {tipo.titulo}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {tipo.texto}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* PROCESS */}
      <section className="mt-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t.processTitle}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {extra.processLead}
          </p>
        </div>

        <ol className="relative mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.process.map((p, idx) => (
            <li
              key={p.titulo}
              className="orbit-panel relative overflow-hidden p-5"
            >
              <span className="text-3xl font-semibold tracking-tight text-primary/20">
                {PASSOS[idx]}
              </span>

              <h3 className="mt-5 text-sm font-semibold">
                {p.titulo}
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {p.texto}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* MAIN CTA */}
      <section className="mt-20">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/[0.06] p-7 sm:p-10">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-28 left-16 size-64 rounded-full bg-primary/5 blur-3xl" />

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

      {/* FINAL CONTACT */}
      <Panel className="mt-8" bodyClassName="p-5 sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">
              {t.finalTitle}
            </h2>

            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Search className="size-3.5 text-primary" />
              {t.finalText}
            </p>
          </div>

          <Link
            to={paths.contact}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background/40 px-4 text-sm font-medium transition hover:bg-accent"
          >
            {t.finalButton}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Panel>
    </SiteChrome>
  );
}
