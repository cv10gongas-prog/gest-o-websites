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
  Radio,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  WandSparkles,
  Zap,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Chip } from "@/components/crm/Bits";
import { SiteChrome } from "@/components/site/SiteChrome";
import { dict, PATHS, type Locale } from "@/lib/i18n";

const SERVICE_ICONS = [LayoutTemplate, Gauge, LineChart];
const TYPE_ICONS = [Sparkles, ShoppingBag, Smartphone, Rocket];
const STEP_ICONS = [Target, WandSparkles, Gauge, BadgeCheck];

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setVisible(true);
        observer.unobserve(node);
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0"
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

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

    radioBadge: string;
    radioPartner: string;
    radioTitle: string;
    radioText: string;
    radioFeature1: string;
    radioFeature2: string;
    radioFeature3: string;
    radioVisit: string;

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
    problemTitle:
      "O seu website pode estar a afastar clientes sem perceber",
    problemLead:
      "Um site lento, confuso ou desatualizado transmite uma imagem pior do que o próprio negócio merece.",

    problems: [
      {
        title: "Visual desatualizado",
        text:
          "Um design antigo pode fazer um negócio parecer menos profissional ou menos credível.",
      },
      {
        title: "Experiência fraca no telemóvel",
        text:
          "Se navegar for difícil num smartphone, muitos visitantes simplesmente desistem.",
      },
      {
        title: "Pouca clareza",
        text:
          "Quando serviços, informação ou contactos estão escondidos, o utilizador não sabe o que fazer.",
      },
      {
        title: "Poucos pedidos",
        text:
          "Um website sem chamadas à ação claras pode receber visitas sem gerar contactos.",
      },
    ],

    solutionBadge: "A solução",
    solutionTitle: "Transformamos presença online em confiança",
    solutionLead:
      "Criamos websites pensados para apresentar melhor o negócio, facilitar a navegação e tornar o contacto simples.",

    radioBadge: "Projeto real",
    radioPartner: "Parceiro Nova Web Studio",
    radioTitle: "Rádio AlcabidecheFM",
    radioText:
      "Projeto desenvolvido para reforçar a presença digital da Rádio AlcabidecheFM, organizar a informação da rádio e criar uma experiência moderna e acessível para a comunidade online.",
    radioFeature1: "Presença digital modernizada",
    radioFeature2: "Estrutura adaptada à rádio",
    radioFeature3: "Parceiro local da Nova Web Studio",
    radioVisit: "Ver projeto",

    whyBadge: "Porquê Nova Web Studio",
    whyTitle: "Um processo mais próximo, simples e profissional",
    whyLead:
      "Sem processos complicados, sem soluções genéricas e sem desaparecer depois da entrega.",

    whyItems: [
      {
        title: "Contacto direto",
        text:
          "Fala diretamente connosco durante o projeto, desde a primeira conversa até à publicação.",
      },
      {
        title: "Pensado para o seu negócio",
        text:
          "A estrutura e o design são definidos de acordo com o objetivo real do website.",
      },
      {
        title: "Rápido e responsivo",
        text:
          "Cada projeto é preparado para funcionar bem em telemóvel, tablet e computador.",
      },
      {
        title: "Preparado para crescer",
        text:
          "Criamos uma base sólida para futuras páginas, conteúdos, SEO e novas funcionalidades.",
      },
    ],

    processLead:
      "Da primeira conversa à publicação, cada etapa é simples e transparente.",

    finalBadge: "O próximo website pode ser o seu",
    finalSmall:
      "Sem compromisso. Conte-nos o que pretende e analisamos consigo.",
  },

  en: {
    heroKicker: "Modern websites for businesses that want to grow",
    heroProof: "Real project developed by Nova Web Studio",
    heroProofSmall: "Design, development and digital presence",

    problemBadge: "The problem",
    problemTitle:
      "Your website may be pushing clients away without you noticing",
    problemLead:
      "A slow, confusing or outdated website can make a business look less professional than it really is.",

    problems: [
      {
        title: "Outdated design",
        text:
          "An old-fashioned website can make a business feel less credible or professional.",
      },
      {
        title: "Poor mobile experience",
        text:
          "If a website is hard to use on a phone, many visitors simply leave.",
      },
      {
        title: "Lack of clarity",
        text:
          "When services, information or contact details are hard to find, users do not know what to do next.",
      },
      {
        title: "Too few enquiries",
        text:
          "A website without clear calls to action can get traffic without generating leads.",
      },
    ],

    solutionBadge: "The solution",
    solutionTitle: "We turn your online presence into trust",
    solutionLead:
      "We build websites designed to present the business clearly, make navigation easy and turn contact into a natural next step.",

    radioBadge: "Live project",
    radioPartner: "Nova Web Studio partner",
    radioTitle: "Rádio AlcabidecheFM",
    radioText:
      "A project developed to strengthen Rádio AlcabidecheFM's digital presence, organise the station's information and create a modern and accessible experience for its online community.",
    radioFeature1: "Modernised digital presence",
    radioFeature2: "Structure designed around the radio",
    radioFeature3: "Local Nova Web Studio partner",
    radioVisit: "View project",

    whyBadge: "Why Nova Web Studio",
    whyTitle: "A closer, simpler and more professional process",
    whyLead:
      "No unnecessary complexity, no generic solutions and no disappearing after launch.",

    whyItems: [
      {
        title: "Direct communication",
        text:
          "You speak directly with us throughout the whole project.",
      },
      {
        title: "Built around your business",
        text:
          "Structure and design are shaped around the real purpose of the website.",
      },
      {
        title: "Fast and responsive",
        text:
          "Every project is prepared for phones, tablets and desktop devices.",
      },
      {
        title: "Ready to grow",
        text:
          "We create a solid base for future pages, content, SEO and new features.",
      },
    ],

    processLead:
      "From the first conversation to launch, every step is simple and transparent.",

    finalBadge: "Your next website could be this one",
    finalSmall:
      "No obligation. Tell us what you need and we will review it with you.",
  },

  de: {
    heroKicker:
      "Moderne Websites für Unternehmen mit Wachstumspotenzial",
    heroProof: "Reales Projekt von Nova Web Studio",
    heroProofSmall: "Design, Entwicklung und digitale Präsenz",

    problemBadge: "Das Problem",
    problemTitle:
      "Ihre Website kann Kunden abschrecken, ohne dass Sie es merken",
    problemLead:
      "Eine langsame, unübersichtliche oder veraltete Website kann ein Unternehmen schlechter darstellen, als es tatsächlich ist.",

    problems: [
      {
        title: "Veraltetes Design",
        text:
          "Ein altes Erscheinungsbild kann weniger professionell und vertrauenswürdig wirken.",
      },
      {
        title: "Schwache mobile Nutzung",
        text:
          "Wenn eine Website auf dem Smartphone schwierig zu bedienen ist, verlassen viele Besucher sie.",
      },
      {
        title: "Unklare Struktur",
        text:
          "Wenn Leistungen und Kontaktinformationen schwer zu finden sind, wissen Nutzer nicht, was sie tun sollen.",
      },
      {
        title: "Zu wenige Anfragen",
        text:
          "Ohne klare Handlungsaufforderungen können Besucher kommen, ohne Kontakt aufzunehmen.",
      },
    ],

    solutionBadge: "Die Lösung",
    solutionTitle: "Wir machen aus Online-Präsenz Vertrauen",
    solutionLead:
      "Wir erstellen Websites, die Unternehmen klar präsentieren, einfach zu bedienen sind und den Kontakt erleichtern.",

    radioBadge: "Reales Projekt",
    radioPartner: "Partner von Nova Web Studio",
    radioTitle: "Rádio AlcabidecheFM",
    radioText:
      "Ein Projekt zur Stärkung der digitalen Präsenz von Rádio AlcabidecheFM und zur modernen Präsentation der Radiostation und ihrer Inhalte.",
    radioFeature1: "Modernisierte digitale Präsenz",
    radioFeature2: "Struktur für eine Radiostation",
    radioFeature3: "Lokaler Partner",
    radioVisit: "Projekt ansehen",

    whyBadge: "Warum Nova Web Studio",
    whyTitle:
      "Ein persönlicher, einfacher und professioneller Prozess",
    whyLead:
      "Keine unnötige Komplexität, keine Standardlösung und kein Verschwinden nach dem Launch.",

    whyItems: [
      {
        title: "Direkter Kontakt",
        text:
          "Sie sprechen während des gesamten Projekts direkt mit uns.",
      },
      {
        title: "Für Ihr Unternehmen",
        text:
          "Struktur und Design richten sich nach dem tatsächlichen Ziel der Website.",
      },
      {
        title: "Schnell und responsiv",
        text:
          "Jedes Projekt wird für Smartphone, Tablet und Desktop optimiert.",
      },
      {
        title: "Bereit für Wachstum",
        text:
          "Wir schaffen eine solide Basis für weitere Seiten, SEO und neue Funktionen.",
      },
    ],

    processLead:
      "Vom ersten Gespräch bis zur Veröffentlichung ist jeder Schritt klar und transparent.",

    finalBadge: "Ihre nächste Website könnte hier entstehen",
    finalSmall: "Unverbindlich. Erzählen Sie uns, was Sie brauchen.",
  },

  fr: {
    heroKicker:
      "Des sites modernes pour les entreprises qui veulent grandir",
    heroProof: "Projet réel développé par Nova Web Studio",
    heroProofSmall: "Design, développement et présence digitale",

    problemBadge: "Le problème",
    problemTitle:
      "Votre site peut faire fuir des clients sans que vous le sachiez",
    problemLead:
      "Un site lent, confus ou dépassé peut donner une image moins professionnelle que votre entreprise ne le mérite.",

    problems: [
      {
        title: "Design dépassé",
        text:
          "Une apparence vieillissante peut diminuer la crédibilité de l'entreprise.",
      },
      {
        title: "Mauvaise expérience mobile",
        text:
          "Si le site est difficile à utiliser sur mobile, beaucoup de visiteurs quittent la page.",
      },
      {
        title: "Manque de clarté",
        text:
          "Lorsque les services et contacts sont difficiles à trouver, l'utilisateur ne sait pas quoi faire.",
      },
      {
        title: "Peu de demandes",
        text:
          "Sans appels à l'action clairs, un site peut recevoir des visites sans générer de contacts.",
      },
    ],

    solutionBadge: "La solution",
    solutionTitle:
      "Nous transformons votre présence digitale en confiance",
    solutionLead:
      "Nous créons des sites clairs, simples à utiliser et conçus pour faciliter le contact.",

    radioBadge: "Projet réel",
    radioPartner: "Partenaire Nova Web Studio",
    radioTitle: "Rádio AlcabidecheFM",
    radioText:
      "Un projet développé pour renforcer la présence digitale de Rádio AlcabidecheFM et offrir une expérience moderne à sa communauté en ligne.",
    radioFeature1: "Présence digitale modernisée",
    radioFeature2: "Structure pensée pour la radio",
    radioFeature3: "Partenaire local",
    radioVisit: "Voir le projet",

    whyBadge: "Pourquoi Nova Web Studio",
    whyTitle: "Un processus plus proche, simple et professionnel",
    whyLead:
      "Pas de complexité inutile, pas de solution générique et pas de disparition après la mise en ligne.",

    whyItems: [
      {
        title: "Contact direct",
        text:
          "Vous échangez directement avec nous pendant tout le projet.",
      },
      {
        title: "Adapté à votre activité",
        text:
          "La structure et le design sont pensés selon l'objectif réel du site.",
      },
      {
        title: "Rapide et responsive",
        text:
          "Chaque projet est optimisé pour mobile, tablette et ordinateur.",
      },
      {
        title: "Prêt à évoluer",
        text:
          "Nous créons une base solide pour de nouvelles pages, le SEO et de futures fonctionnalités.",
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
    problemTitle:
      "Tu web puede estar alejando clientes sin que te des cuenta",
    problemLead:
      "Una web lenta, confusa o desactualizada puede transmitir una imagen peor de la que merece tu negocio.",

    problems: [
      {
        title: "Diseño desactualizado",
        text:
          "Una apariencia antigua puede hacer que un negocio parezca menos profesional.",
      },
      {
        title: "Mala experiencia móvil",
        text:
          "Si navegar desde el móvil es difícil, muchos visitantes se van.",
      },
      {
        title: "Poca claridad",
        text:
          "Si los servicios y contactos están escondidos, el usuario no sabe qué hacer.",
      },
      {
        title: "Pocas solicitudes",
        text:
          "Sin llamadas a la acción claras, una web puede tener visitas sin generar contactos.",
      },
    ],

    solutionBadge: "La solución",
    solutionTitle: "Convertimos presencia online en confianza",
    solutionLead:
      "Creamos webs pensadas para presentar mejor el negocio, facilitar la navegación y simplificar el contacto.",

    radioBadge: "Proyecto real",
    radioPartner: "Socio Nova Web Studio",
    radioTitle: "Rádio AlcabidecheFM",
    radioText:
      "Proyecto desarrollado para reforzar la presencia digital de Rádio AlcabidecheFM y ofrecer una experiencia más moderna a su comunidad online.",
    radioFeature1: "Presencia digital modernizada",
    radioFeature2: "Estructura adaptada a la radio",
    radioFeature3: "Socio local",
    radioVisit: "Ver proyecto",

    whyBadge: "Por qué Nova Web Studio",
    whyTitle: "Un proceso más cercano, sencillo y profesional",
    whyLead:
      "Sin procesos complicados, sin soluciones genéricas y sin desaparecer después de publicar.",

    whyItems: [
      {
        title: "Contacto directo",
        text:
          "Hablas directamente con nosotros durante todo el proyecto.",
      },
      {
        title: "Pensado para tu negocio",
        text:
          "La estructura y el diseño se definen según el objetivo real de la web.",
      },
      {
        title: "Rápido y responsive",
        text:
          "Cada proyecto está preparado para móvil, tablet y ordenador.",
      },
      {
        title: "Preparado para crecer",
        text:
          "Creamos una base sólida para futuras páginas, SEO y nuevas funciones.",
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
  const paths = PATHS[locale];
  const extra = EXTRA[locale];

  return (
    <SiteChrome locale={locale} page="home">
      <style>{`
        @keyframes nws-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes nws-wave {
          0%, 100% {
            transform: scaleY(.35);
            opacity: .55;
          }

          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes nws-pulse {
          0%, 100% {
            opacity: .5;
            transform: scale(1);
          }

          50% {
            opacity: .85;
            transform: scale(1.04);
          }
        }

        .nws-float {
          animation: nws-float 6s ease-in-out infinite;
        }

        .nws-wave {
          transform-origin: bottom;
          animation: nws-wave 1.5s ease-in-out infinite;
        }

        .nws-pulse {
          animation: nws-pulse 5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .nws-float,
          .nws-wave,
          .nws-pulse {
            animation: none !important;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/20 px-5 py-9 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="nws-pulse absolute -right-24 -top-24 size-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-primary/5 blur-3xl" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="relative grid items-center gap-12 lg:grid-cols-[1fr_.95fr]">
          <div className="min-w-0">
            <Reveal>
              <Chip tone="primary">{t.chip}</Chip>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">
                <Sparkles className="size-3.5 shrink-0 text-primary" />
                {extra.heroKicker}
              </div>
            </Reveal>

            <Reveal delay={150}>
              <h1 className="orbit-gradient-text mt-4 max-w-3xl text-4xl font-semibold leading-[1.03] tracking-tight sm:text-5xl lg:text-[4rem]">
                {t.h1}
              </h1>
            </Reveal>

            <Reveal delay={220}>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                {t.lead}
              </p>
            </Reveal>

            <Reveal delay={290}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={paths.contact}
                  className="group inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20"
                >
                  <CalendarCheck className="size-4" />
                  {t.ctaProposal}

                  <ArrowRight className="size-0 opacity-0 transition-all duration-300 group-hover:size-4 group-hover:opacity-100" />
                </Link>

                <Link
                  to={paths.portfolio}
                  className="group inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background/50 px-6 text-sm transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-accent"
                >
                  {t.ctaPortfolio}

                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={360}>
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
            </Reveal>
          </div>

          {/* MOCKUP */}
          <Reveal delay={180}>
            <div className="nws-float relative min-w-0">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-background shadow-2xl shadow-black/20">
                <div className="flex h-10 items-center gap-1.5 border-b border-border/60 bg-card/70 px-3">
                  <span className="size-2 rounded-full bg-muted-foreground/30" />
                  <span className="size-2 rounded-full bg-muted-foreground/20" />
                  <span className="size-2 rounded-full bg-muted-foreground/10" />

                  <div className="mx-auto flex h-5 max-w-[55%] flex-1 items-center justify-center rounded-md bg-secondary/60 px-2 text-[8px] text-muted-foreground sm:max-w-none sm:w-44 sm:flex-none">
                    novawebstudio.pt
                  </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-primary/[0.06] via-background to-secondary/30 p-5 sm:min-h-[400px] sm:p-8">
                  <div className="absolute right-5 top-5 size-40 rounded-full bg-primary/10 blur-3xl" />

                  <div className="relative flex min-w-0 items-center gap-3">
                    <img
                      src="/logo.png"
                      alt="Nova Web Studio"
                      className="size-9 shrink-0 object-contain"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        Nova Web Studio
                      </p>

                      <p className="truncate text-[9px] uppercase tracking-[.18em] text-muted-foreground">
                        {nav.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-9 sm:mt-10">
                    <span className="block max-w-full text-[9px] font-semibold uppercase leading-5 tracking-[.15em] text-primary sm:tracking-[.18em]">
                      {extra.heroProofSmall}
                    </span>

                    <div className="mt-4 h-3.5 w-4/5 rounded-full bg-foreground/15 sm:h-4" />
                    <div className="mt-3 h-3.5 w-3/5 rounded-full bg-foreground/10 sm:h-4" />

                    <div className="mt-7 flex gap-2">
                      <span className="h-9 flex-1 rounded-lg bg-primary sm:w-28 sm:flex-none" />

                      <span className="h-9 flex-1 rounded-lg border border-border bg-background/60 sm:w-24 sm:flex-none" />
                    </div>
                  </div>

                  <div className="relative mt-9 grid min-w-0 grid-cols-1 gap-2.5 lg:mt-10 lg:grid-cols-3 lg:gap-3">
                    {t.stats.map((item) => (
                      <div
                        key={item.valor}
                        className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/50 px-4 py-3 backdrop-blur lg:min-h-[126px] lg:flex-col lg:items-start lg:justify-start lg:gap-0 lg:px-4 lg:py-4"
                      >
                        <p className="min-w-0 shrink text-lg font-semibold leading-tight text-foreground lg:w-full lg:text-[16px] xl:text-[17px]">
                          {item.valor}
                        </p>

                        <p className="min-w-0 max-w-[58%] text-right text-[9px] leading-4 text-muted-foreground lg:mt-3 lg:max-w-none lg:text-left lg:leading-[1.55]">
                          {item.texto}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="relative mt-4 grid grid-cols-[1.3fr_.7fr] gap-3 sm:mt-5">
                    <div className="h-16 rounded-2xl bg-secondary/70 sm:h-20" />

                    <div className="h-16 rounded-2xl border border-primary/20 bg-primary/10 sm:h-20" />
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-border bg-background/95 px-4 py-3 shadow-xl backdrop-blur sm:block">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />

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
          </Reveal>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="mt-24">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <Reveal>
            <Chip tone="primary">{extra.problemBadge}</Chip>

            <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {extra.problemTitle}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              {extra.problemLead}
            </p>
          </Reveal>

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
                <Reveal
                  key={problem.title}
                  delay={idx * 90}
                >
                  <article className="group orbit-panel orbit-panel-hover h-full p-5">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 transition duration-300 group-hover:scale-110 group-hover:bg-primary/15">
                      <Icon className="size-4 text-primary" />
                    </span>

                    <h3 className="mt-4 text-sm font-semibold">
                      {problem.title}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                      {problem.text}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <Reveal>
        <section className="mt-24">
          <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-primary/[0.05] p-7 sm:p-10">
            <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />

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
                const Icon =
                  SERVICE_ICONS[idx] ?? LayoutTemplate;

                return (
                  <article
                    key={service.titulo}
                    className="group rounded-2xl border border-border/60 bg-background/50 p-5 backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 transition group-hover:scale-110">
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
      </Reveal>

      {/* RÁDIO */}
      <section className="mt-24">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Chip tone="primary">{extra.radioBadge}</Chip>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                {extra.radioTitle}
              </h2>
            </div>

            <span className="rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[.16em] text-primary">
              {extra.radioPartner}
            </span>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <article className="group overflow-hidden rounded-3xl border border-border/70 bg-card/40 shadow-xl shadow-black/5 transition duration-500 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5">
            <div className="grid lg:grid-cols-[.9fr_1.1fr]">
              <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden border-b border-border/60 bg-gradient-to-br from-[#07111c] via-[#0b1b27] to-[#0d2a32] p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="absolute -left-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />

                <div className="nws-pulse absolute -bottom-24 right-0 size-64 rounded-full bg-cyan-400/10 blur-3xl" />

                <div className="relative w-full max-w-md">
                  <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-sm transition duration-500 group-hover:-translate-y-1 group-hover:border-white/15 sm:p-10">
                    {/* LOGO MAIOR E RECENTRADO */}
                    <div className="flex justify-center">
                      <div className="relative flex size-40 items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] shadow-xl sm:size-52">
                        <img
                          src="/radio-alcabidechefm.png"
                          alt="Rádio AlcabidecheFM"
                          className="relative w-[92%] max-w-none translate-y-1.5 scale-[1.18] object-contain sm:w-[94%] sm:scale-[1.2]"
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

                      {/* EQUALIZADOR */}
                      <div className="mx-auto mt-5 flex h-12 max-w-[230px] items-end justify-center gap-1.5">
                        {[
                          14, 28, 20, 38, 24,
                          46, 30, 18, 34, 22,
                        ].map((height, idx) => (
                          <span
                            key={idx}
                            className="nws-wave w-1.5 rounded-full bg-primary/80"
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

              <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-11">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-primary">
                  <Radio className="size-3.5" />
                  Rádio · Alcabideche
                </div>

                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  Rádio AlcabidecheFM
                </h3>

                <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
                  {extra.radioText}
                </p>

                <div className="mt-7 space-y-3">
                  {[
                    extra.radioFeature1,
                    extra.radioFeature2,
                    extra.radioFeature3,
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="https://radioalcabidechefm.eu"
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/15"
                  >
                    {extra.radioVisit}

                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>

                  <Link
                    to={paths.portfolio}
                    className="group inline-flex h-11 items-center gap-2 rounded-xl border border-border px-5 text-sm transition hover:bg-accent"
                  >
                    {t.ctaPortfolio}

                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </Reveal>
      </section>

      {/* TIPOS */}
      <section className="mt-24">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Chip tone="primary">{t.typesTitle}</Chip>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                {t.servicesTitle}
              </h2>
            </div>

            <Link
              to={paths.contact}
              className="group inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              {t.ctaProposal}

              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.types.map((type, idx) => {
            const Icon = TYPE_ICONS[idx] ?? Sparkles;

            return (
              <Reveal
                key={type.titulo}
                delay={idx * 80}
              >
                <article className="group orbit-panel orbit-panel-hover relative h-full overflow-hidden p-5">
                  <div className="absolute -right-10 -top-10 size-28 rounded-full bg-primary/0 blur-2xl transition duration-500 group-hover:bg-primary/10" />

                  <div className="relative flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 transition group-hover:scale-110">
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
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* PORQUÊ */}
      <section className="mt-24">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <Reveal>
            <Chip tone="primary">{extra.whyBadge}</Chip>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {extra.whyTitle}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              {extra.whyLead}
            </p>
          </Reveal>

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
                <Reveal
                  key={item.title}
                  delay={idx * 80}
                >
                  <article className="group orbit-panel orbit-panel-hover h-full p-5">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 transition group-hover:scale-110">
                      <Icon className="size-4 text-primary" />
                    </span>

                    <h3 className="mt-4 text-sm font-semibold">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                      {item.text}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROCESSO */}
      <section className="mt-24">
        <Reveal>
          <div className="max-w-2xl">
            <Chip tone="primary">{t.processTitle}</Chip>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t.processTitle}
            </h2>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {extra.processLead}
            </p>
          </div>
        </Reveal>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.process.map((step, idx) => {
            const Icon = STEP_ICONS[idx] ?? Target;

            return (
              <Reveal
                key={step.titulo}
                delay={idx * 100}
              >
                <article className="group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/40 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 transition group-hover:scale-110">
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
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <Reveal>
        <section className="mt-24">
          <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/[0.06] px-7 py-10 sm:px-10 sm:py-12">
            <div className="nws-pulse absolute -right-24 -top-24 size-80 rounded-full bg-primary/10 blur-3xl" />

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
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20"
              >
                {t.ctaButton}

                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </SiteChrome>
  );
}
