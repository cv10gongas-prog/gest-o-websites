import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  ExternalLink,
  Gauge,
  LayoutTemplate,
  LineChart,
  MapPin,
  MessageSquareText,
  MonitorSmartphone,
  QrCode,
  Radio,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  UtensilsCrossed,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

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
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
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

    gmdSection: string;
    vinilartText: string;
    vinilartSportText: string;
    otherProjects: string;
    gmdShort: string;
    radioShort: string;
    gmdBadge: string;
    gmdMeta: string;
    gmdTitle: string;
    gmdText: string;
    gmdFeature1: string;
    gmdFeature2: string;
    gmdFeature3: string;
    gmdVisit: string;

    radioBadge: string;
    radioPartner: string;
    radioTitle: string;
    radioText: string;
    radioFeature1: string;
    radioFeature2: string;
    radioFeature3: string;
    radioVisit: string;

    restaurantSection: string;
    restaurantBadge: string;
    restaurantTitle: string;
    restaurantText: string;
    restaurantCtaPage: string;
    restaurantCtaDemo: string;
    restaurantFeature1: string;
    restaurantFeature2: string;
    restaurantFeature3: string;
    mockupLive: string;
    mockupQrTitle: string;
    mockupQrDesc: string;
    mockupQrStatus: string;
    mockupBookingsTitle: string;
    mockupBookingsDesc: string;
    mockupBookingsStatus: string;

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
        text: "Quando serviços, informação ou contactos estão escondidos, o utilizador não sabe o que fazer.",
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

    gmdSection: "Projetos em destaque",
    vinilartText: "Comunicação visual, impressão e personalização com uma presença digital forte e clara.",
    vinilartSportText: "Uma experiência dedicada à personalização desportiva para atletas, clubes e adeptos.",
    otherProjects: "Outros projetos reais",
    gmdShort: "Website institucional da coletividade de Manique de Baixo.",
    radioShort: "Presença digital da rádio local e da sua comunidade online.",
    gmdBadge: "Projeto real",
    gmdMeta: "01 — Website institucional",
    gmdTitle: "Manique de Baixo",
    gmdText:
      "Website institucional desenvolvido para modernizar a presença digital do Grupo Musical e Desportivo 31 de Janeiro, organizar informação e aproximar a coletividade da comunidade.",
    gmdFeature1: "Website institucional responsivo",
    gmdFeature2: "Informação e atividades organizadas",
    gmdFeature3: "Presença digital modernizada",
    gmdVisit: "Ver projeto",

    radioBadge: "Projeto real",
    radioPartner: "Parceiro Nova Web Studio",
    radioTitle: "Rádio AlcabidecheFM",
    radioText:
      "Projeto desenvolvido para reforçar a presença digital da Rádio AlcabidecheFM, organizar a informação da rádio e criar uma experiência moderna e acessível para a comunidade online.",
    radioFeature1: "Presença digital modernizada",
    radioFeature2: "Estrutura adaptada à rádio",
    radioFeature3: "Parceiro local da Nova Web Studio",
    radioVisit: "Ver projeto",

    restaurantSection: "Solução Digital",
    restaurantBadge: "Setor da Restauração",
    restaurantTitle: "Software de gestão e menu digital para restaurantes",
    restaurantText:
      "Do website aos pedidos por QR Code e reservas online: reunimos as ferramentas essenciais para modernizar o serviço do teu restaurante.",
    restaurantCtaPage: "Conhecer solução",
    restaurantCtaDemo: "Ver demonstração",
    restaurantFeature1: "Website próprio & menu digital para restaurantes",
    restaurantFeature2: "Pedidos por QR Code e chamada de empregado à mesa",
    restaurantFeature3: "Reservas online para restaurantes e gestão de mesas",
    mockupLive: "Mesa 04 · Live",
    mockupQrTitle: "QR Code Pedidos",
    mockupQrDesc: "Menu digital direto à mesa",
    mockupQrStatus: "Ativo",
    mockupBookingsTitle: "Reservas Integradas",
    mockupBookingsDesc: "Online & por telefone",
    mockupBookingsStatus: "Sincronizado",

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

    processLead: "Da primeira conversa à publicação, cada etapa é simples e transparente.",

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
        text: "When services, information or contact details are hard to find, users do not know what to do next.",
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

    gmdSection: "Featured projects",
    vinilartText: "Visual communication, printing and personalisation presented through a strong, clear digital presence.",
    vinilartSportText: "A dedicated sports personalisation experience for athletes, clubs and supporters.",
    otherProjects: "Other live projects",
    gmdShort: "Institutional website for the Manique de Baixo community organisation.",
    radioShort: "Digital presence for the local radio station and its online community.",
    gmdBadge: "Live project",
    gmdMeta: "01 — Institutional website",
    gmdTitle: "Manique de Baixo",
    gmdText:
      "An institutional website developed to modernise the digital presence of Grupo Musical e Desportivo 31 de Janeiro and bring the organisation closer to its community.",
    gmdFeature1: "Responsive institutional website",
    gmdFeature2: "Organised information and activities",
    gmdFeature3: "Modernised digital presence",
    gmdVisit: "View project",

    radioBadge: "Live project",
    radioPartner: "Nova Web Studio partner",
    radioTitle: "Rádio AlcabidecheFM",
    radioText:
      "A project developed to strengthen Rádio AlcabidecheFM's digital presence, organise the station's information and create a modern and accessible experience for its online community.",
    radioFeature1: "Modernised digital presence",
    radioFeature2: "Structure designed around the radio",
    radioFeature3: "Local Nova Web Studio partner",
    radioVisit: "View project",

    restaurantSection: "Digital Solution",
    restaurantBadge: "Restaurant Industry",
    restaurantTitle: "Restaurant management software & digital menu",
    restaurantText:
      "From custom websites to table QR code ordering and online reservations: an integrated system built to streamline your restaurant operations.",
    restaurantCtaPage: "Explore solution",
    restaurantCtaDemo: "View live demo",
    restaurantFeature1: "Custom website & live digital menu for restaurants",
    restaurantFeature2: "Table QR code ordering & waiter call on smartphone",
    restaurantFeature3: "Online restaurant reservations & floor management",
    mockupLive: "Table 04 · Live",
    mockupQrTitle: "QR Code Ordering",
    mockupQrDesc: "Digital menu straight to table",
    mockupQrStatus: "Active",
    mockupBookingsTitle: "Integrated Bookings",
    mockupBookingsDesc: "Online & phone calls",
    mockupBookingsStatus: "Synced",

    whyBadge: "Why Nova Web Studio",
    whyTitle: "A closer, simpler and more professional process",
    whyLead: "No unnecessary complexity, no generic solutions and no disappearing after launch.",

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

    processLead: "From the first conversation to launch, every step is simple and transparent.",

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
        text: "Ein altes Erscheinungsbild kann weniger professionell und vertrauenswürdig wirken.",
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

    gmdSection: "Projekte im Fokus",
    vinilartText: "Visuelle Kommunikation, Druck und Personalisierung mit einem starken, klaren digitalen Auftritt.",
    vinilartSportText: "Ein eigenes Erlebnis für Sportpersonalisierung für Athleten, Vereine und Fans.",
    otherProjects: "Weitere reale Projekte",
    gmdShort: "Institutionelle Website für den Verein in Manique de Baixo.",
    radioShort: "Digitaler Auftritt für den lokalen Radiosender und seine Online-Community.",
    gmdBadge: "Reales Projekt",
    gmdMeta: "01 — Unternehmenswebsite",
    gmdTitle: "Manique de Baixo",
    gmdText:
      "Eine institutionelle Website für Grupo Musical e Desportivo 31 de Janeiro mit modernerer Struktur und digitaler Präsenz.",
    gmdFeature1: "Responsive Website",
    gmdFeature2: "Strukturierte Informationen",
    gmdFeature3: "Modernisierte digitale Präsenz",
    gmdVisit: "Projekt ansehen",

    radioBadge: "Reales Projekt",
    radioPartner: "Partner von Nova Web Studio",
    radioTitle: "Rádio AlcabidecheFM",
    radioText:
      "Ein Projekt zur Stärkung der digitalen Präsenz von Rádio AlcabidecheFM und zur modernen Präsentation der Radiostation und ihrer Inhalte.",
    radioFeature1: "Modernisierte digitale Präsenz",
    radioFeature2: "Struktur für eine Radiostation",
    radioFeature3: "Lokaler Partner",
    radioVisit: "Projekt ansehen",

    restaurantSection: "Digitale Lösung",
    restaurantBadge: "Gastronomiebranche",
    restaurantTitle: "Restaurant-Management-Software & digitale Speisekarte",
    restaurantText:
      "Von der Website über QR-Code-Bestellungen am Tisch bis hin zur Tischverwaltung und Reservierungen: Alles in einem System für die Gastronomie.",
    restaurantCtaPage: "Lösung entdecken",
    restaurantCtaDemo: "Live-Demo ansehen",
    restaurantFeature1: "Eigene Website & digitale Speisekarte Restaurant",
    restaurantFeature2: "QR-Code-Bestellungen am Tisch & Service-Ruf",
    restaurantFeature3: "Online-Tischreservierung & Raumplan in Echtzeit",
    mockupLive: "Tisch 04 · Live",
    mockupQrTitle: "QR-Code-Bestellung",
    mockupQrDesc: "Digitale Speisekarte am Tisch",
    mockupQrStatus: "Aktiv",
    mockupBookingsTitle: "Tischreservierungen",
    mockupBookingsDesc: "Online & per Telefon",
    mockupBookingsStatus: "Synchron",

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

    gmdSection: "Projets à la une",
    vinilartText: "Communication visuelle, impression et personnalisation avec une présence digitale forte et claire.",
    vinilartSportText: "Une expérience dédiée à la personnalisation sportive pour athlètes, clubs et supporters.",
    otherProjects: "Autres projets réels",
    gmdShort: "Site institutionnel de l'association de Manique de Baixo.",
    radioShort: "Présence digitale de la radio locale et de sa communauté en ligne.",
    gmdBadge: "Projet réel",
    gmdMeta: "01 — Site institutionnel",
    gmdTitle: "Manique de Baixo",
    gmdText:
      "Site institutionnel développé pour moderniser la présence digitale du Grupo Musical e Desportivo 31 de Janeiro.",
    gmdFeature1: "Site institutionnel responsive",
    gmdFeature2: "Informations mieux organisées",
    gmdFeature3: "Présence digitale modernisée",
    gmdVisit: "Voir le projet",

    radioBadge: "Projet réel",
    radioPartner: "Partenaire Nova Web Studio",
    radioTitle: "Rádio AlcabidecheFM",
    radioText:
      "Un projet développé pour renforcer la présence digitale de Rádio AlcabidecheFM et offrir une expérience moderne à sa communauté en ligne.",
    radioFeature1: "Présence digitale modernisée",
    radioFeature2: "Structure pensée pour la radio",
    radioFeature3: "Partenaire local",
    radioVisit: "Voir le projet",

    restaurantSection: "Solution Digitale",
    restaurantBadge: "Restauration",
    restaurantTitle: "Logiciel de gestion et menu digital pour restaurants",
    restaurantText:
      "Du site web dédié aux commandes par QR Code à table et réservations en ligne : une solution complète pour la restauration.",
    restaurantCtaPage: "Découvrir la solution",
    restaurantCtaDemo: "Voir la démo",
    restaurantFeature1: "Site internet sur mesure & menu digital pour restaurant",
    restaurantFeature2: "Commandes par QR Code à table & appel serveur",
    restaurantFeature3: "Réservations en ligne restaurant & gestion des tables",
    mockupLive: "Table 04 · En direct",
    mockupQrTitle: "Commande QR Code",
    mockupQrDesc: "Menu digital directement à table",
    mockupQrStatus: "Actif",
    mockupBookingsTitle: "Réservations Unifiées",
    mockupBookingsDesc: "En ligne & téléphone",
    mockupBookingsStatus: "Synchronisé",

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

    gmdSection: "Proyectos destacados",
    vinilartText: "Comunicación visual, impresión y personalización con una presencia digital sólida y clara.",
    vinilartSportText: "Una experiencia dedicada a la personalización deportiva para atletas, clubes y aficionados.",
    otherProjects: "Otros proyectos reales",
    gmdShort: "Web institucional de la asociación de Manique de Baixo.",
    radioShort: "Presencia digital de la radio local y de su comunidad online.",
    gmdBadge: "Proyecto real",
    gmdMeta: "01 — Web institucional",
    gmdTitle: "Manique de Baixo",
    gmdText:
      "Web institucional desarrollada para modernizar la presencia digital del Grupo Musical e Desportivo 31 de Janeiro.",
    gmdFeature1: "Web institucional responsive",
    gmdFeature2: "Información organizada",
    gmdFeature3: "Presencia digital modernizada",
    gmdVisit: "Ver proyecto",

    radioBadge: "Proyecto real",
    radioPartner: "Socio Nova Web Studio",
    radioTitle: "Rádio AlcabidecheFM",
    radioText:
      "Proyecto desarrollado para reforzar la presencia digital de Rádio AlcabidecheFM y ofrecer una experiencia más moderna a su comunidad online.",
    radioFeature1: "Presencia digital modernizada",
    radioFeature2: "Estructura adaptada a la radio",
    radioFeature3: "Socio local",
    radioVisit: "Ver proyecto",

    restaurantSection: "Solución Digital",
    restaurantBadge: "Sector de Restauración",
    restaurantTitle: "Software de gestión y carta digital para restaurantes",
    restaurantText:
      "Del sitio web a los pedidos por código QR en mesa y reservas online: una solución completa para tu restaurante.",
    restaurantCtaPage: "Conocer solución",
    restaurantCtaDemo: "Ver demostración",
    restaurantFeature1: "Página web propia & carta digital para restaurantes",
    restaurantFeature2: "Pedidos por código QR en mesa & llamada a camarero",
    restaurantFeature3: "Reservas online para restaurantes & gestión de mesas",
    mockupLive: "Mesa 04 · En directo",
    mockupQrTitle: "Pedidos por QR Code",
    mockupQrDesc: "Carta digital directa a la mesa",
    mockupQrStatus: "Activo",
    mockupBookingsTitle: "Reservas Integradas",
    mockupBookingsDesc: "Online & por teléfono",
    mockupBookingsStatus: "Sincronizado",

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

          {/* HERO MOCKUP */}
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
                      <p className="truncate text-sm font-semibold">Nova Web Studio</p>

                      <p className="truncate text-[9px] uppercase tracking-[.18em] text-muted-foreground">
                        {nav.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-9 sm:mt-10">
                    <span className="block text-[9px] font-semibold uppercase leading-5 tracking-[.15em] text-primary">
                      {extra.heroProofSmall}
                    </span>

                    <div className="mt-4 h-3.5 w-4/5 rounded-full bg-foreground/15" />
                    <div className="mt-3 h-3.5 w-3/5 rounded-full bg-foreground/10" />

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
                        <p className="min-w-0 text-lg font-semibold leading-tight lg:w-full lg:text-[16px] xl:text-[17px]">
                          {item.valor}
                        </p>

                        <p className="max-w-[58%] text-right text-[9px] leading-4 text-muted-foreground lg:mt-3 lg:max-w-none lg:text-left">
                          {item.texto}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="relative mt-4 grid grid-cols-[1.3fr_.7fr] gap-3">
                    <div className="h-16 rounded-2xl bg-secondary/70 sm:h-20" />
                    <div className="h-16 rounded-2xl border border-primary/20 bg-primary/10 sm:h-20" />
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-border bg-background/95 px-4 py-3 shadow-xl backdrop-blur sm:block">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />

                  <div>
                    <p className="text-[10px] font-medium">{extra.heroProof}</p>

                    <p className="mt-0.5 text-[9px] text-muted-foreground">31janeiromanique.net</p>
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
              const icons = [WandSparkles, MonitorSmartphone, MessageSquareText, Target];

              const Icon = icons[idx] ?? Sparkles;

              return (
                <Reveal key={problem.title} delay={idx * 90}>
                  <article className="orbit-panel orbit-panel-hover h-full p-5">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </span>

                    <h3 className="mt-4 text-sm font-semibold">{problem.title}</h3>

                    <p className="mt-2 text-xs leading-6 text-muted-foreground">{problem.text}</p>
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

              <p className="mt-4 text-sm leading-7 text-muted-foreground">{extra.solutionLead}</p>
            </div>

            <div className="relative mt-8 grid gap-4 md:grid-cols-3">
              {t.services.map((service, idx) => {
                const Icon = SERVICE_ICONS[idx] ?? LayoutTemplate;

                return (
                  <article
                    key={service.titulo}
                    className="rounded-2xl border border-border/60 bg-background/50 p-5 backdrop-blur transition duration-300 hover:-translate-y-1"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </span>

                    <h3 className="mt-4 text-sm font-semibold">{service.titulo}</h3>

                    <p className="mt-2 text-xs leading-6 text-muted-foreground">{service.texto}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </Reveal>

      {/* PROJETOS — AMOSTRA COMPACTA */}
      <section className="mt-24">
        <Reveal>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <Chip tone="primary">{extra.gmdSection}</Chip>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                VinilArt & VinilArt Sport
              </h2>
            </div>
            <span className="hidden text-[9px] font-semibold uppercase tracking-[.18em] text-muted-foreground sm:block">
              01 — 02
            </span>
          </div>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-2">
          {[
            {
              name: "VinilArt",
              host: "vinilart.pt",
              url: "https://vinilart.pt",
              preview: "/vinilart-preview.png",
              logo: "/vinilart-logo.png",
              text: extra.vinilartText,
            },
            {
              name: "VinilArt Sport",
              host: "sport.vinilart.pt",
              url: "https://sport.vinilart.pt",
              preview: "/vinilart-sport-preview.png",
              logo: "/vinilart-sport-logo.png",
              text: extra.vinilartSportText,
            },
          ].map((project, idx) => (
            <Reveal key={project.name} delay={80 + idx * 80}>
              <article className="group h-full overflow-hidden rounded-3xl border border-cyan-400/20 bg-card/45 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40">
                <div className="bg-[#07111b] p-3">
                  <div className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#07101a]">
                    <div className="flex h-9 items-center gap-1.5 border-b border-white/10 bg-[#0b1723] px-3">
                      <span className="size-2 rounded-full bg-rose-400/80" />
                      <span className="size-2 rounded-full bg-amber-300/80" />
                      <span className="size-2 rounded-full bg-emerald-400/80" />
                      <span className="ml-2 min-w-0 truncate text-[9px] text-slate-400">
                        {project.host}
                      </span>
                    </div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#050b11]">
                      <img
                        src={project.preview}
                        alt={`${project.name} — homepage`}
                        className="size-full object-cover object-top transition duration-500 group-hover:scale-[1.012]"
                      />
                      <div className="absolute bottom-3 left-3 flex h-8 max-w-32 items-center rounded-lg border border-white/15 bg-black/70 px-2.5 py-1 backdrop-blur-md">
                        <img src={project.logo} alt="" aria-hidden="true" className="max-h-full max-w-full object-contain" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <Chip tone="primary">{extra.gmdBadge}</Chip>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight">{project.name}</h3>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">{project.text}</p>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:-translate-y-0.5"
                  >
                    {extra.gmdVisit}
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={180}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">
                {extra.otherProjects}
              </span>
              <p className="mt-2 text-xs text-muted-foreground">03 — 04</p>
            </div>
            <Link
              to={paths.portfolio}
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              {t.ctaPortfolio}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            {
              name: extra.gmdTitle,
              text: extra.gmdShort,
              url: "https://31janeiromanique.net",
              image: "/gmd-manique.png",
              alt: "Grupo Musical e Desportivo 31 de Janeiro",
              visit: extra.gmdVisit,
            },
            {
              name: extra.radioTitle,
              text: extra.radioShort,
              url: "https://radioalcabidechefm.eu",
              image: "/radio-alcabidechefm.png",
              alt: "Rádio AlcabidecheFM",
              visit: extra.radioVisit,
            },
          ].map((project, idx) => (
            <Reveal key={project.name} delay={220 + idx * 70}>
              <article className="flex h-full items-center gap-4 rounded-2xl border border-border/70 bg-card/35 p-4 transition hover:border-primary/30 hover:bg-card/50">
                <div className="grid size-20 shrink-0 place-items-center rounded-xl border border-border/60 bg-white p-2.5">
                  <img src={project.image} alt={project.alt} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold">{project.name}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{project.text}</p>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    {project.visit}
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* RESTAURANTES HIGHLIGHT SECTION */}
      <section className="mt-24">
        <Reveal>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Chip tone="primary">
                <span className="flex items-center gap-1.5">
                  <UtensilsCrossed className="size-3.5" />
                  {extra.restaurantBadge}
                </span>
              </Chip>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">{extra.restaurantText}</p>
            </div>

            <Link
              to={paths.restaurantes}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {extra.restaurantCtaPage}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <article className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card/60 via-card/30 to-primary/[0.04] shadow-xl shadow-black/10">
            <div className="grid lg:grid-cols-[1fr_1fr]">
              {/* Visual Mockup - Phone & Dashboard snippet */}
              <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/[0.08] via-background to-secondary/30 p-6 sm:min-h-[420px] sm:p-8 lg:border-b-0 lg:border-r">
                <div className="absolute -left-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />

                {/* Composition Card */}
                <div className="relative w-full max-w-md">
                  <div className="rounded-2xl border border-border/70 bg-background/90 p-5 shadow-2xl backdrop-blur">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-semibold">NOVA Restaurante</span>
                      </div>
                      <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[9px] font-bold text-primary">
                        {extra.mockupLive}
                      </span>
                    </div>

                    <div className="mt-3.5 space-y-2.5">
                      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/60 p-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <QrCode className="size-4 text-primary shrink-0" />
                          <div>
                            <p className="font-medium text-[11px]">{extra.mockupQrTitle}</p>
                            <p className="text-[9px] text-muted-foreground">{extra.mockupQrDesc}</p>
                          </div>
                        </div>
                        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[9px] font-medium text-emerald-400">
                          {extra.mockupQrStatus}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/60 p-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="size-4 text-primary shrink-0" />
                          <div>
                            <p className="font-medium text-[11px]">{extra.mockupBookingsTitle}</p>
                            <p className="text-[9px] text-muted-foreground">
                              {extra.mockupBookingsDesc}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[9px] font-medium text-primary">
                          {extra.mockupBookingsStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text & CTAs */}
              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-11">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-primary">
                  <UtensilsCrossed className="size-3.5" />
                  {extra.restaurantSection}
                </div>

                <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {extra.restaurantTitle}
                </h3>

                <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
                  {extra.restaurantText}
                </p>

                <div className="mt-7 space-y-3">
                  {[
                    extra.restaurantFeature1,
                    extra.restaurantFeature2,
                    extra.restaurantFeature3,
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

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={paths.restaurantes}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5"
                  >
                    {extra.restaurantCtaPage}
                    <ArrowRight className="size-4" />
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
              className="inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              {t.ctaProposal}

              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.types.map((type, idx) => {
            const Icon = TYPE_ICONS[idx] ?? Sparkles;

            return (
              <Reveal key={type.titulo} delay={idx * 80}>
                <article className="orbit-panel orbit-panel-hover h-full p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </span>

                    <span className="text-[10px] font-semibold tracking-[.18em] text-muted-foreground">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="mt-5 text-sm font-semibold">{type.titulo}</h3>

                  <p className="mt-2 text-xs leading-6 text-muted-foreground">{type.texto}</p>
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

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">{extra.whyLead}</p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {extra.whyItems.map((item, idx) => {
              const icons = [MessageSquareText, Target, Zap, ShieldCheck];

              const Icon = icons[idx] ?? BadgeCheck;

              return (
                <Reveal key={item.title} delay={idx * 80}>
                  <article className="orbit-panel orbit-panel-hover h-full p-5">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </span>

                    <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>

                    <p className="mt-2 text-xs leading-6 text-muted-foreground">{item.text}</p>
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

            <p className="mt-3 text-sm leading-7 text-muted-foreground">{extra.processLead}</p>
          </div>
        </Reveal>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.process.map((step, idx) => {
            const Icon = STEP_ICONS[idx] ?? Target;

            return (
              <Reveal key={step.titulo} delay={idx * 100}>
                <article className="h-full rounded-2xl border border-border/70 bg-card/40 p-5 transition hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </span>

                    <span className="text-3xl font-semibold text-primary/15">0{idx + 1}</span>
                  </div>

                  <h3 className="mt-5 text-sm font-semibold">{step.titulo}</h3>

                  <p className="mt-2 text-xs leading-6 text-muted-foreground">{step.texto}</p>
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

                <p className="mt-3 text-xs text-muted-foreground">{extra.finalSmall}</p>
              </div>

              <Link
                to={paths.contact}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground"
              >
                {t.ctaButton}

                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </SiteChrome>
  );
}
