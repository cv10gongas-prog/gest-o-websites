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
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  WandSparkles,
  Zap,
} from "lucide-react";

import { Chip } from "@/components/crm/Bits";
import { SiteChrome } from "@/components/site/SiteChrome";
import { dict, PATHS, type Locale } from "@/lib/i18n";

const SERVICE_ICONS = [LayoutTemplate, Gauge, LineChart];
const TYPE_ICONS = [Sparkles, ShoppingBag, Smartphone, Rocket];
const STEP_ICONS = [Target, WandSparkles, Gauge, BadgeCheck];

const EXTRA: Record<
  Locale,
  {
    heroKicker: string;
    heroProof: string;
    heroProofSmall: string;

    problemBadge: string;
    problemTitle: string;
    problemLead: string;
    problems: {
      title: string;
      text: string;
    }[];

    solutionBadge: string;
    solutionTitle: string;
    solutionLead: string;

    projectBadge: string;
    projectEyebrow: string;
    projectTitle: string;
    projectText: string;
    projectVisit: string;

    whyBadge: string;
    whyTitle: string;
    whyLead: string;
    whyItems: {
      title: string;
      text: string;
    }[];

    processLead: string;

    finalBadge: string;
    finalSmall: string;
  }
> = {
  pt: {
    heroKicker: "Websites modernos para negócios que querem crescer",
    heroProof: "Projeto real desenvolvido pela Nova Web Studio",
    heroProofSmall: "Design, desenvolvimento e presença digital",

    problemBadge: "O problema",
    problemTitle: "O seu website pode estar a afastar clientes sem perceber",
    problemLead:
      "Um site lento, confuso ou desatualizado transmite uma imagem pior do que o próprio negócio merece.",
    problems: [
      {
        title: "Visual desatualizado",
        text: "Um design antigo pode fazer um negócio parecer menos profissional ou menos credível.",
      },
      {
        title: "Experiência fraca no telemóvel",
        text: "Se navegar for difícil num smartphone, muitos visitantes simplesmente desistem.",
      },
      {
        title: "Pouca clareza",
        text: "Quando serviços, preços ou contactos estão escondidos, o utilizador não sabe o que fazer.",
      },
      {
        title: "Poucos pedidos",
        text: "Um website sem chamadas à ação claras pode receber visitas sem gerar contactos.",
      },
    ],

    solutionBadge: "A solução",
    solutionTitle: "Transformamos presença online em confiança",
    solutionLead:
      "Criamos websites pensados para apresentar melhor o negócio, facilitar a navegação e tornar o contacto simples.",

    projectBadge: "Projeto real",
    projectEyebrow: "Sociedade 31 de Janeiro",
    projectTitle: "Manique de Baixo",
    projectText:
      "Website institucional desenvolvido para modernizar a presença digital da coletividade, organizar informação e aproximar a comunidade.",
    projectVisit: "Ver projeto",

    whyBadge: "Porquê Nova Web Studio",
    whyTitle: "Um processo mais próximo, simples e profissional",
    whyLead:
      "Sem processos complicados, sem soluções genéricas e sem desaparecer depois da entrega.",
    whyItems: [
      {
        title: "Contacto direto",
        text: "Fala diretamente connosco durante o projeto, desde a primeira conversa até à publicação.",
      },
      {
        title: "Pensado para o seu negócio",
        text: "A estrutura e o design são definidos de acordo com o objetivo real do website.",
      },
      {
        title: "Rápido e responsivo",
        text: "Cada projeto é preparado para funcionar bem em telemóvel, tablet e computador.",
      },
      {
        title: "Preparado para crescer",
        text: "Criamos uma base sólida para futuras páginas, conteúdos, SEO e novas funcionalidades.",
      },
    ],

    processLead:
      "Da primeira conversa à publicação, cada etapa é simples e transparente.",

    finalBadge: "O próximo website pode ser o seu",
    finalSmall: "Sem compromisso. Conte-nos o que pretende e analisamos consigo.",
  },

  en: {
    heroKicker: "Modern websites for businesses that want to grow",
    heroProof: "Real project developed by Nova Web Studio",
    heroProofSmall: "Design, development and digital presence",

    problemBadge: "The problem",
    problemTitle: "Your website may be pushing clients away without you noticing",
    problemLead:
      "A slow, confusing or outdated website can make a business look less professional than it really is.",
    problems: [
      {
        title: "Outdated design",
        text: "An old-fashioned website can make a business feel less credible or professional.",
      },
      {
        title: "Poor mobile experience",
        text: "If a website is hard to use on a phone, many visitors simply leave.",
      },
      {
        title: "Lack of clarity",
        text: "When services and contact information are difficult to find, users do not know what to do next.",
      },
      {
        title: "Too few enquiries",
        text: "A website without clear calls to action can get traffic without generating leads.",
      },
    ],

    solutionBadge: "The solution",
    solutionTitle: "We turn your online presence into trust",
    solutionLead:
      "We build websites designed to present the business clearly, make navigation easy and turn contact into a natural next step.",

    projectBadge: "Live project",
    projectEyebrow: "Sociedade 31 de Janeiro",
    projectTitle: "Manique de Baixo",
    projectText:
      "A business website created to modernise the association's online presence, organise information and connect with its community.",
    projectVisit: "View project",

    whyBadge: "Why Nova Web Studio",
    whyTitle: "A closer, simpler and more professional process",
    whyLead:
      "No unnecessary complexity, no generic solutions and no disappearing after launch.",
    whyItems: [
      {
        title: "Direct communication",
        text: "You speak directly with us throughout the whole project.",
      },
      {
        title: "Built around your business",
        text: "Structure and design are shaped around the real purpose of the website.",
      },
      {
        title: "Fast and responsive",
        text: "Every project is prepared for phones, tablets and desktop devices.",
      },
      {
        title: "Ready to grow",
        text: "We create a solid base for future pages, content, SEO and new features.",
      },
    ],

    processLead:
      "From the first conversation to launch, every step is simple and transparent.",

    finalBadge: "Your next website could be this one",
    finalSmall: "No obligation. Tell us what you need and we will review it with you.",
  },

  de: {
    heroKicker: "Moderne Websites für Unternehmen mit Wachstumspotenzial",
    heroProof: "Reales Projekt von Nova Web Studio",
    heroProofSmall: "Design, Entwicklung und digitale Präsenz",

    problemBadge: "Das Problem",
    problemTitle: "Ihre Website kann Kunden abschrecken, ohne dass Sie es merken",
    problemLead:
      "Eine langsame, unübersichtliche oder veraltete Website kann ein Unternehmen schlechter darstellen, als es tatsächlich ist.",
    problems: [
      {
        title: "Veraltetes Design",
        text: "Ein altes Erscheinungsbild kann weniger professionell und weniger vertrauenswürdig wirken.",
      },
      {
        title: "Schwache mobile Nutzung",
        text: "Wenn eine Website auf dem Smartphone schwierig zu bedienen ist, verlassen viele Besucher sie.",
      },
      {
        title: "Unklare Struktur",
        text: "Wenn Leistungen und Kontaktinformationen schwer zu finden sind, wissen Nutzer nicht, was sie tun sollen.",
      },
      {
        title: "Zu wenige Anfragen",
        text: "Ohne klare Handlungsaufforderungen können Besucher kommen, ohne Kontakt aufzunehmen.",
      },
    ],

    solutionBadge: "Die Lösung",
    solutionTitle: "Wir machen aus Online-Präsenz Vertrauen",
    solutionLead:
      "Wir erstellen Websites, die Unternehmen klar präsentieren, einfach zu bedienen sind und den Kontakt erleichtern.",

    projectBadge: "Reales Projekt",
    projectEyebrow: "Sociedade 31 de Janeiro",
    projectTitle: "Manique de Baixo",
    projectText:
      "Eine institutionelle Website zur Modernisierung des digitalen Auftritts und zur besseren Organisation von Informationen.",
    projectVisit: "Projekt ansehen",

    whyBadge: "Warum Nova Web Studio",
    whyTitle: "Ein persönlicher, einfacher und professioneller Prozess",
    whyLead:
      "Keine unnötige Komplexität, keine Standardlösung und kein Verschwinden nach dem Launch.",
    whyItems: [
      {
        title: "Direkter Kontakt",
        text: "Sie sprechen während des gesamten Projekts direkt mit uns.",
      },
      {
        title: "Für Ihr Unternehmen",
        text: "Struktur und Design richten sich nach dem tatsächlichen Ziel der Website.",
      },
      {
        title: "Schnell und responsiv",
        text: "Jedes Projekt wird für Smartphone, Tablet und Desktop optimiert.",
      },
      {
        title: "Bereit für Wachstum",
        text: "Wir schaffen eine solide Basis für weitere Seiten, SEO und neue Funktionen.",
      },
    ],

    processLead:
      "Vom ersten Gespräch bis zur Veröffentlichung ist jeder Schritt klar und transparent.",

    finalBadge: "Ihre nächste Website könnte hier entstehen",
    finalSmall: "Unverbindlich. Erzählen Sie uns, was Sie brauchen.",
  },

  fr: {
    heroKicker: "Des sites modernes pour les entreprises qui veulent grandir",
    heroProof: "Projet réel développé par Nova Web Studio",
    heroProofSmall: "Design, développement et présence digitale",

    problemBadge: "Le problème",
    problemTitle: "Votre site peut faire fuir des clients sans que vous le sachiez",
    problemLead:
      "Un site lent, confus ou dépassé peut donner une image moins professionnelle que votre entreprise ne le mérite.",
    problems: [
      {
        title: "Design dépassé",
        text: "Une apparence vieillissante peut diminuer la crédibilité de l'entreprise.",
      },
      {
        title: "Mauvaise expérience mobile",
        text: "Si le site est difficile à utiliser sur mobile, beaucoup de visiteurs quittent la page.",
      },
      {
        title: "Manque de clarté",
        text: "Lorsque les services et contacts sont difficiles à trouver, l'utilisateur ne sait pas quoi faire.",
      },
      {
        title: "Peu de demandes",
        text: "Sans appels à l'action clairs, un site peut recevoir des visites sans générer de contacts.",
      },
    ],

    solutionBadge: "La solution",
    solutionTitle: "Nous transformons votre présence digitale en confiance",
    solutionLead:
      "Nous créons des sites clairs, simples à utiliser et conçus pour faciliter le contact.",

    projectBadge: "Projet réel",
    projectEyebrow: "Sociedade 31 de Janeiro",
    projectTitle: "Manique de Baixo",
    projectText:
      "Un site institutionnel créé pour moderniser la présence digitale, organiser l'information et rapprocher l'association de sa communauté.",
    projectVisit: "Voir le projet",

    whyBadge: "Pourquoi Nova Web Studio",
    whyTitle: "Un processus plus proche, simple et professionnel",
    whyLead:
      "Pas de complexité inutile, pas de solution générique et pas de disparition après la mise en ligne.",
    whyItems: [
      {
        title: "Contact direct",
        text: "Vous échangez directement avec nous pendant tout le projet.",
      },
      {
        title: "Adapté à votre activité",
        text: "La structure et le design sont pensés selon l'objectif réel du site.",
      },
      {
        title: "Rapide et responsive",
        text: "Chaque projet est optimisé pour mobile, tablette et ordinateur.",
      },
      {
        title: "Prêt à évoluer",
        text: "Nous créons une base solide pour de nouvelles pages, le SEO et de futures fonctionnalités.",
      },
    ],

    processLead:
      "De la première conversation à la publication, chaque étape reste simple et transparente.",

    finalBadge: "Votre prochain site peut commencer ici",
    finalSmall: "Sans engagement. Expliquez-nous votre besoin.",
  },

  es: {
    heroKicker: "Webs modernas para negocios que quieren crecer",
    heroProof: "Proyecto real desarrollado por Nova Web Studio",
    heroProofSmall: "Diseño, desarrollo y presencia digital",

    problemBadge: "El problema",
    problemTitle: "Tu web puede estar alejando clientes sin que te des cuenta",
    problemLead:
      "Una web lenta, confusa o desactualizada puede transmitir una imagen peor de la que merece tu negocio.",
    problems: [
      {
        title: "Diseño desactualizado",
        text: "Una apariencia antigua puede hacer que un negocio parezca menos profesional.",
      },
      {
        title: "Mala experiencia móvil",
        text: "Si navegar desde el móvil es difícil, muchos visitantes se van.",
      },
      {
        title: "Poca claridad",
        text: "Si los servicios y contactos están escondidos, el usuario no sabe qué hacer.",
      },
      {
        title: "Pocas solicitudes",
        text: "Sin llamadas a la acción claras, una web puede tener visitas sin generar contactos.",
      },
    ],

    solutionBadge: "La solución",
    solutionTitle: "Convertimos presencia online en confianza",
    solutionLead:
      "Creamos webs pensadas para presentar mejor el negocio, facilitar la navegación y simplificar el contacto.",

    projectBadge: "Proyecto real",
    projectEyebrow: "Sociedade 31 de Janeiro",
    projectTitle: "Manique de Baixo",
    projectText:
      "Web institucional creada para modernizar la presencia digital, organizar la información y acercar la asociación a su comunidad.",
    projectVisit: "Ver proyecto",

    whyBadge: "Por qué Nova Web Studio",
    whyTitle: "Un proceso más cercano, sencillo y profesional",
    whyLead:
      "Sin procesos complicados, sin soluciones genéricas y sin desaparecer después de publicar.",
    whyItems: [
      {
        title: "Contacto directo",
        text: "Hablas directamente con nosotros durante todo el proyecto.",
      },
      {
        title: "Pensado para tu negocio",
        text: "La estructura y el diseño se definen según el objetivo real de la web.",
      },
      {
        title: "Rápido y responsive",
        text: "Cada proyecto está preparado para móvil, tablet y ordenador.",
      },
      {
        title: "Preparado para crecer",
        text: "Creamos una base sólida para futuras páginas, SEO y nuevas funciones.",
      },
    ],

    processLead:
      "Desde la primera conversación hasta la publicación, cada paso es sencillo y transparente.",

    finalBadge: "Tu próxima web puede empezar aquí",
    finalSmall: "Sin compromiso. Cuéntanos qué necesitas.",
  },
};

export function HomePage({ locale }: { locale: Locale }) {
  const t = dict[locale].home;
  const nav = dict[locale].nav;
  const portfolio = dict[locale].portfolio;
  const paths = PATHS[locale];
  const extra = EXTRA[locale];

  return (
    <SiteChrome locale={locale} page="home">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/20 px-6 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative grid items-center gap-12 lg:grid-cols-[1fr_.95fr]">
          <div>
            <Chip tone="primary">{t.chip}</Chip>

            <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              {extra.heroKicker}
            </div>

            <h1 className="orbit-gradient-text mt-4 max-w-3xl text-4xl font-semibold leading-[1.03] tracking-tight sm:text-5xl lg:text-[4rem]">
              {t.h1}
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {t.lead}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={paths.contact}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 hover:opacity-90"
              >
                <CalendarCheck className="size-4" />
                {t.ctaProposal}
              </Link>

              <Link
                to={paths.portfolio}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background/50 px-6 text-sm transition hover:-translate-y-0.5 hover:bg-accent"
              >
                {t.ctaPortfolio}
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
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

          {/* PREMIUM MOCKUP */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-background shadow-2xl shadow-black/20">
              <div className="flex h-10 items-center gap-1.5 border-b border-border/60 bg-card/70 px-3">
                <span className="size-2 rounded-full bg-muted-foreground/30" />
                <span className="size-2 rounded-full bg-muted-foreground/20" />
                <span className="size-2 rounded-full bg-muted-foreground/10" />

                <div className="mx-auto flex h-5 w-44 items-center justify-center rounded-md bg-secondary/60 text-[8px] text-muted-foreground">
                  novawebstudio.pt
                </div>
              </div>

              <div className="relative min-h-[400px] overflow-hidden bg-gradient-to-br from-primary/[0.06] via-background to-secondary/30 p-6 sm:p-8">
                <div className="absolute right-5 top-5 size-40 rounded-full bg-primary/10 blur-3xl" />

                <div className="relative flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="Nova Web Studio"
                    className="size-9 object-contain"
                  />

                  <div>
                    <p className="text-sm font-semibold">Nova Web Studio</p>
                    <p className="text-[9px] uppercase tracking-[.18em] text-muted-foreground">
                      {nav.tagline}
                    </p>
                  </div>
                </div>

                <div className="relative mt-10">
                  <span className="text-[9px] font-semibold uppercase tracking-[.18em] text-primary">
                    {extra.heroProofSmall}
                  </span>

                  <div className="mt-4 h-4 w-4/5 rounded-full bg-foreground/15" />
                  <div className="mt-3 h-4 w-3/5 rounded-full bg-foreground/10" />

                  <div className="mt-7 flex gap-2">
                    <span className="h-9 w-28 rounded-lg bg-primary" />
                    <span className="h-9 w-24 rounded-lg border border-border bg-background/60" />
                  </div>
                </div>

                <div className="relative mt-10 grid grid-cols-3 gap-3">
                  {t.stats.map((item) => (
                    <div
                      key={item.valor}
                      className="rounded-2xl border border-border/60 bg-background/50 p-3 backdrop-blur"
                    >
                      <p className="text-lg font-semibold">
                        {item.valor}
                      </p>

                      <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">
                        {item.texto}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="relative mt-5 grid grid-cols-[1.3fr_.7fr] gap-3">
                  <div className="h-20 rounded-2xl bg-secondary/70" />
                  <div className="h-20 rounded-2xl border border-primary/20 bg-primary/10" />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-border bg-background/95 px-4 py-3 shadow-xl backdrop-blur sm:block">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />

                <div>
                  <p className="text-[10px] font-medium">
                    {extra.heroProof}
                  </p>

                  <p className="mt-0.5 text-[9px] text-muted-foreground">
                    31janeiromanique.net
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="mt-24">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <Chip tone="primary">{extra.problemBadge}</Chip>

            <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {extra.problemTitle}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              {extra.problemLead}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {extra.problems.map((problem, idx) => {
              const icons = [
                WandSparkles,
                MonitorSmartphone,
                MessageSquareText,
                Target,
              ];

              const Icon = icons[idx] ?? Sparkles;

              return (
                <article
                  key={problem.title}
                  className="group orbit-panel orbit-panel-hover p-5"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </span>

                  <h3 className="mt-4 text-sm font-semibold">
                    {problem.title}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    {problem.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="mt-24">
        <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-primary/[0.05] p-7 sm:p-10">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 left-10 size-56 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative max-w-3xl">
            <Chip tone="primary">{extra.solutionBadge}</Chip>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {extra.solutionTitle}
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {extra.solutionLead}
            </p>
          </div>

          <div className="relative mt-8 grid gap-4 md:grid-cols-3">
            {t.services.map((service, idx) => {
              const Icon = SERVICE_ICONS[idx] ?? LayoutTemplate;

              return (
                <article
                  key={service.titulo}
                  className="rounded-2xl border border-border/60 bg-background/50 p-5 backdrop-blur transition hover:-translate-y-1 hover:border-primary/20"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </span>

                  <h3 className="mt-4 text-sm font-semibold">
                    {service.titulo}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    {service.texto}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* REAL PROJECT */}
      <section className="mt-24">
        <div className="mb-6">
          <Chip tone="primary">{extra.projectBadge}</Chip>

          <h2 className="mt-4 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            {portfolio.featuredHeadline}
          </h2>
        </div>

        <article className="overflow-hidden rounded-3xl border border-border/70 bg-card/40 shadow-xl shadow-black/5">
          <div className="grid lg:grid-cols-[1.08fr_.92fr]">
            <div className="relative overflow-hidden border-b border-border/60 bg-background/30 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="absolute -left-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
                <div className="flex h-10 items-center gap-1.5 border-b border-border/60 px-3">
                  <span className="size-2 rounded-full bg-muted-foreground/30" />
                  <span className="size-2 rounded-full bg-muted-foreground/20" />
                  <span className="size-2 rounded-full bg-muted-foreground/10" />

                  <div className="mx-auto flex h-5 w-44 items-center justify-center rounded-md bg-secondary/60 text-[8px] text-muted-foreground">
                    31janeiromanique.net
                  </div>
                </div>

                <div className="relative min-h-[360px] bg-gradient-to-br from-primary/[0.08] via-background to-secondary/30 p-7 sm:p-9">
                  <span className="text-[9px] font-semibold uppercase tracking-[.2em] text-primary">
                    {extra.projectEyebrow}
                  </span>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Manique de Baixo
                  </p>

                  <h3 className="mt-10 max-w-lg text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl">
                    {portfolio.featuredHeadline}
                  </h3>

                  <p className="mt-4 max-w-md text-xs leading-6 text-muted-foreground sm:text-sm">
                    {portfolio.featuredText}
                  </p>

                  <div className="mt-7 flex gap-2">
                    <span className="h-9 w-28 rounded-lg bg-primary" />
                    <span className="h-9 w-24 rounded-lg border border-border bg-background/60" />
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

            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <span className="text-[10px] font-semibold uppercase tracking-[.18em] text-primary">
                {extra.projectBadge}
              </span>

              <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                {extra.projectTitle}
              </h3>

              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {extra.projectText}
              </p>

              <div className="mt-7 space-y-2">
                {[
                  t.badgeMobile,
                  t.stats[1]?.texto,
                  t.services[1]?.titulo,
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="size-3.5 text-primary" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="https://31janeiromanique.net"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90"
                >
                  {extra.projectVisit}
                  <ArrowUpRight className="size-4" />
                </a>

                <Link
                  to={paths.portfolio}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-5 text-sm transition hover:bg-accent"
                >
                  {t.ctaPortfolio}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* WEBSITE TYPES */}
      <section className="mt-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Chip tone="primary">{t.typesTitle}</Chip>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t.servicesTitle}
            </h2>
          </div>

          <Link
            to={paths.contact}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            {t.ctaProposal}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.types.map((type, idx) => {
            const Icon = TYPE_ICONS[idx] ?? Sparkles;

            return (
              <article
                key={type.titulo}
                className="group orbit-panel orbit-panel-hover relative overflow-hidden p-5"
              >
                <div className="absolute -right-10 -top-10 size-28 rounded-full bg-primary/5 blur-2xl transition group-hover:bg-primary/10" />

                <div className="relative flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </span>

                  <span className="text-[10px] font-semibold tracking-[.18em] text-muted-foreground">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="relative mt-5 text-sm font-semibold">
                  {type.titulo}
                </h3>

                <p className="relative mt-2 text-xs leading-6 text-muted-foreground">
                  {type.texto}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* WHY US */}
      <section className="mt-24">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <Chip tone="primary">{extra.whyBadge}</Chip>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {extra.whyTitle}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              {extra.whyLead}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {extra.whyItems.map((item, idx) => {
              const icons = [
                MessageSquareText,
                Target,
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

                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    {item.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="mt-24">
        <div className="max-w-2xl">
          <Chip tone="primary">{t.processTitle}</Chip>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.processTitle}
          </h2>

          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {extra.processLead}
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.process.map((step, idx) => {
            const Icon = STEP_ICONS[idx] ?? Target;

            return (
              <article
                key={step.titulo}
                className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/40 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </span>

                  <span className="text-3xl font-semibold text-primary/15">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="mt-5 text-sm font-semibold">
                  {step.titulo}
                </h3>

                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  {step.texto}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mt-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/[0.06] px-7 py-10 sm:px-10 sm:py-12">
          <div className="absolute -right-24 -top-24 size-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 size-64 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">
                {extra.finalBadge}
              </span>

              <h2 className="mt-4 max-w-2xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                {t.ctaTitle}
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                {t.ctaText}
              </p>

              <p className="mt-3 text-xs text-muted-foreground">
                {extra.finalSmall}
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
