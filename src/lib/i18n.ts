export const LOCALES = ["pt", "en", "de", "fr", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const SITE_URL = "https://www.novawebstudio.pt";

export const LOCALE_LABELS: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
  de: "DE",
  fr: "FR",
  es: "ES",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
};

export const HTML_LANG: Record<Locale, string> = {
  pt: "pt-PT",
  en: "en",
  de: "de",
  fr: "fr",
  es: "es",
};

export type PageKey = "home" | "portfolio" | "contact";

export const PATHS = {
  pt: { home: "/", portfolio: "/portefolio", contact: "/contacto" },
  en: { home: "/en", portfolio: "/en/portfolio", contact: "/en/contact" },
  de: { home: "/de", portfolio: "/de/portfolio", contact: "/de/contact" },
  fr: { home: "/fr", portfolio: "/fr/portfolio", contact: "/fr/contact" },
  es: { home: "/es", portfolio: "/es/portfolio", contact: "/es/contact" },
} as const;

export type LocalePaths = (typeof PATHS)[Locale];

export function pathFor(locale: Locale, page: PageKey): string {
  return PATHS[locale][page];
}

export function alternateLinks(page: PageKey) {
  const links = LOCALES.map((l) => ({
    rel: "alternate",
    hrefLang: HTML_LANG[l],
    href: `${SITE_URL}${PATHS[l][page]}`,
  }));

  return [
    ...links,
    {
      rel: "alternate",
      hrefLang: "x-default",
      href: `${SITE_URL}${PATHS.pt[page]}`,
    },
  ];
}

export function canonicalFor(locale: Locale, page: PageKey): string {
  return `${SITE_URL}${PATHS[locale][page]}`;
}

/** Build the head() object for a public page. */
export function buildHead(locale: Locale, page: PageKey) {
  const m = dict[locale].meta[page];
  const url = canonicalFor(locale, page);

  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.description },
      { property: "og:title", content: m.title },
      { property: "og:description", content: m.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:locale", content: HTML_LANG[locale].replace("-", "_") },
      { property: "og:image", content: `${SITE_URL}/logo.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: m.title },
      { name: "twitter:description", content: m.description },
      { name: "twitter:image", content: `${SITE_URL}/logo.png` },
    ],
    links: [{ rel: "canonical", href: url }, ...alternateLinks(page)],
  };
}

/** Valores guardados no CRM (sempre em português, independentemente do idioma). */
export const TIPO_VALUES = [
  "Website institucional",
  "Loja online",
  "Landing page",
  "Aplicação web",
  "Redesign de site existente",
  "Outro",
] as const;

export const ORCAMENTO_VALUES = [
  "Até 150 €",
  "150 € – 250 €",
  "250 € – 400 €",
  "Mais de 400 €",
] as const;

type Dict = {
  meta: Record<PageKey, { title: string; description: string }>;
  nav: {
    home: string;
    portfolio: string;
    contact: string;
    cta: string;
    team: string;
    tagline: string;
    language: string;
  };
  footer: { rights: string };
  home: {
    chip: string;
    h1: string;
    lead: string;
    ctaProposal: string;
    ctaPortfolio: string;
    badgeArea: string;
    badgeMobile: string;
    stats: { valor: string; texto: string }[];
    aboutTitle: string;
    aboutP1: string;
    aboutP2: string;
    servicesTitle: string;
    services: { titulo: string; texto: string }[];
    typesTitle: string;
    types: { titulo: string; texto: string }[];
    processTitle: string;
    process: { titulo: string; texto: string }[];
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
    finalTitle: string;
    finalText: string;
    finalButton: string;
  };
  portfolio: {
    chip: string;
    h1: string;
    lead: string;
    featuredHeadline: string;
    featuredText: string;
    realChip: string;
    featuredDesc: string;
    visit: string;
    othersTitle: string;
    othersLead: string;
    concepts: {
      titulo: string;
      etiqueta: string;
      descricao: string;
      preview: { eyebrow: string; headline: string; lines: string[] };
    }[];
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
  };
  contact: {
    chip: string;
    h1: string;
    lead: string;
    reply: string;
    location: string;
    panelTitle: string;
    panelSubtitle: string;
    sentTitle: string;
    sentText: string;
    labels: {
      nome: string;
      empresa: string;
      email: string;
      telefone: string;
      tipo: string;
      orcamento: string;
      mensagem: string;
    };
    placeholder: string;
    meeting: string;
    submit: string;
    submitting: string;
    note: string;
    errorRequired: string;
    errorSend: string;
    success: string;
    tipos: string[];
    orcamentos: string[];
  };
};

export const dict: Record<Locale, Dict> = {
  pt: {
    meta: {
      home: {
        title: "Criação de Sites em Cascais | Nova Web Studio",
        description:
          "Criação e modernização de websites em Cascais, Oeiras, Sintra e Lisboa. Sites profissionais, rápidos e preparados para gerar mais contactos para o seu negócio.",
      },
      portfolio: {
        title: "Portefólio de Websites | Nova Web Studio",
        description:
          "Veja projetos e conceitos desenvolvidos pela Nova Web Studio para diferentes áreas de negócio, com foco em design moderno, clareza e contacto fácil.",
      },
      contact: {
        title: "Contacto | Nova Web Studio",
        description:
          "Fale com a Nova Web Studio para criar ou modernizar o website do seu negócio. Peça uma proposta simples e sem compromisso.",
      },
    },
    nav: {
      home: "Início",
      portfolio: "Portefólio",
      contact: "Contacto",
      cta: "Marcar reunião",
      team: "Área de equipa",
      tagline: "Um site mais moderno para si",
      language: "Idioma",
    },
    footer: { rights: "Portugal" },
    home: {
      chip: "Web Design em Cascais",
      h1: "Criação de sites profissionais para negócios locais",
      lead: "Criamos e modernizamos websites para empresas e negócios em Cascais, Oeiras, Sintra e Lisboa, com foco numa imagem profissional, utilização simples e mais oportunidades de contacto.",
      ctaProposal: "Pedir proposta",
      ctaPortfolio: "Ver portefólio",
      badgeArea: "Cascais, Oeiras, Sintra e Lisboa",
      badgeMobile: "Sites adaptados a telemóvel",
      stats: [
        { valor: "24 h", texto: "Resposta a novos pedidos" },
        { valor: "1 a 2 semanas", texto: "Prazo típico de entrega" },
        { valor: "100 %", texto: "Sites responsivos e otimizados" },
      ],
      aboutTitle: "Websites para empresas e negócios locais",
      aboutP1:
        "Um website é muitas vezes o primeiro contacto entre um potencial cliente e uma empresa. A Nova Web Studio desenvolve websites modernos para pequenos negócios que precisam de apresentar os seus serviços de forma clara, transmitir confiança e facilitar o contacto com novos clientes.",
      aboutP2:
        "Trabalhamos principalmente com negócios em Cascais, Oeiras, Sintra e Lisboa, tanto na criação de novos websites como na modernização de sites existentes.",
      servicesTitle: "O que fazemos",
      services: [
        {
          titulo: "Criação de websites",
          texto:
            "Criamos sites profissionais de raiz, adaptados ao seu negócio e preparados para gerar contactos.",
        },
        {
          titulo: "Redesign e modernização",
          texto:
            "Atualizamos websites antigos, melhorando o design, organização, velocidade e experiência em telemóvel.",
        },
        {
          titulo: "SEO e acompanhamento",
          texto:
            "Preparamos o website para motores de pesquisa e acompanhamos a sua presença digital ao longo do tempo.",
        },
      ],
      typesTitle: "Tipos de websites",
      types: [
        {
          titulo: "Site institucional",
          texto:
            "Apresente a empresa, serviços e contactos com uma imagem profissional.",
        },
        {
          titulo: "Loja online",
          texto:
            "Venda produtos através de uma loja simples, moderna e adaptada ao seu negócio.",
        },
        {
          titulo: "Landing page",
          texto:
            "Uma página focada em apresentar um serviço e gerar pedidos de contacto.",
        },
        {
          titulo: "Aplicação web",
          texto: "Soluções digitais e áreas reservadas desenvolvidas à medida.",
        },
      ],
      processTitle: "Como trabalhamos",
      process: [
        {
          titulo: "Falamos sobre o negócio",
          texto:
            "Percebemos o que faz, o que precisa e quais são os objetivos do website.",
        },
        {
          titulo: "Enviamos uma proposta",
          texto:
            "Recebe uma proposta clara com o trabalho, prazo e valor previstos.",
        },
        {
          titulo: "Criamos o website",
          texto:
            "Desenvolvemos o projeto e mostramos a evolução antes da publicação.",
        },
        {
          titulo: "Publicamos e acompanhamos",
          texto:
            "Colocamos o site online e ajudamos com os últimos ajustes necessários.",
        },
      ],
      ctaTitle: "Precisa de criar ou modernizar o website do seu negócio?",
      ctaText:
        "Diga-nos o que precisa. Podemos analisar o website atual ou preparar uma solução de raiz adaptada ao seu negócio.",
      ctaButton: "Pedir orçamento",
      finalTitle: "Fale com a Nova Web Studio",
      finalText:
        "Criamos websites para negócios em Cascais, Oeiras, Sintra e Lisboa.",
      finalButton: "Contactar",
    },
    portfolio: {
      chip: "Portefólio",
      h1: "Websites pensados para cada negócio",
      lead: "Uma seleção de websites e conceitos desenvolvidos para diferentes áreas de negócio.",
      featuredHeadline: "Comunidade, atividades e informação num só espaço",
      featuredText:
        "Um website institucional claro e acessível, pensado para aproximar a coletividade da comunidade.",
      realChip: "Projeto real",
      featuredDesc:
        "Website institucional desenvolvido para modernizar a presença digital da coletividade e facilitar o acesso às suas atividades, novidades e contactos.",
      visit: "Visitar website",
      othersTitle: "Outros conceitos",
      othersLead:
        "Explorações visuais criadas para demonstrar diferentes abordagens e setores.",
      concepts: [
        {
          titulo: "Website para serviços de piscinas",
          etiqueta: "Projeto demonstrativo",
          descricao:
            "Uma presença digital moderna e clara para apresentar serviços e gerar pedidos de orçamento.",
          preview: {
            eyebrow: "Piscinas & Manutenção",
            headline: "Cuidamos da sua piscina",
            lines: ["Construção", "Manutenção", "Reparação"],
          },
        },
        {
          titulo: "Website para alojamento turístico",
          etiqueta: "Conceito",
          descricao:
            "Uma experiência visual pensada para valorizar o espaço e incentivar reservas.",
          preview: {
            eyebrow: "Alojamento Local",
            headline: "Uma estadia especial",
            lines: ["O espaço", "Localização", "Contactos"],
          },
        },
        {
          titulo: "Website para carpintaria",
          etiqueta: "Design desenvolvido",
          descricao:
            "Um portefólio elegante para destacar trabalhos, materiais e serviços personalizados.",
          preview: {
            eyebrow: "Carpintaria",
            headline: "Trabalho feito à medida",
            lines: ["Projetos", "Materiais", "Orçamentos"],
          },
        },
      ],
      ctaTitle: "Tem um projeto em mente?",
      ctaText: "Conte-nos o que precisa e receba uma proposta sem compromisso.",
      ctaButton: "Pedir orçamento",
    },
    contact: {
      chip: "Contacto",
      h1: "Vamos falar sobre o seu projeto",
      lead: "Preencha o formulário com o máximo de detalhe possível. Analisamos o pedido e enviamos uma proposta com prazos e valores.",
      reply: "Resposta em 24 horas úteis",
      location: "Portugal · trabalho remoto",
      panelTitle: "Pedido de orçamento",
      panelSubtitle: "Sem compromisso.",
      sentTitle: "Pedido recebido, obrigado!",
      sentText: "A nossa equipa entra em contacto pelo email indicado.",
      labels: {
        nome: "Nome *",
        empresa: "Empresa",
        email: "Email *",
        telefone: "Telefone",
        tipo: "Tipo de projeto",
        orcamento: "Orçamento previsto",
        mensagem: "Mensagem",
      },
      placeholder: "Descreva o que pretende, prazos e referências.",
      meeting: "Quero marcar uma reunião de apresentação",
      submit: "Enviar pedido",
      submitting: "A enviar…",
      note: "Após o envio, entraremos em contacto consigo por email ou telefone para conhecer melhor o projeto.",
      errorRequired: "Indique o nome e o email.",
      errorSend: "Não foi possível enviar o pedido. Tente novamente.",
      success: "Pedido enviado. Entramos em contacto em breve.",
      tipos: [
        "Website institucional",
        "Loja online",
        "Landing page",
        "Aplicação web",
        "Redesign de site existente",
        "Outro",
      ],
      orcamentos: ["Até 150 €", "150 € – 250 €", "250 € – 400 €", "Mais de 400 €"],
    },
  },

  en: {
    meta: {
      home: {
        title: "Website Design in Cascais | Nova Web Studio",
        description:
          "Website creation and redesign in Cascais, Oeiras, Sintra and Lisbon. Professional, fast websites built to bring more enquiries to your business.",
      },
      portfolio: {
        title: "Website Portfolio | Nova Web Studio",
        description:
          "See projects and concepts created by Nova Web Studio for different industries, focused on modern design, clarity and easy contact.",
      },
      contact: {
        title: "Contact | Nova Web Studio",
        description:
          "Talk to Nova Web Studio about creating or modernising your business website. Request a simple, no-obligation proposal.",
      },
    },
    nav: {
      home: "Home",
      portfolio: "Portfolio",
      contact: "Contact",
      cta: "Book a meeting",
      team: "Team area",
      tagline: "A more modern website for you",
      language: "Language",
    },
    footer: { rights: "Portugal" },
    home: {
      chip: "Web design in Cascais",
      h1: "Professional websites for local businesses",
      lead: "We build and modernise websites for companies and businesses in Cascais, Oeiras, Sintra and Lisbon, focused on a professional image, simple use and more contact opportunities.",
      ctaProposal: "Request a proposal",
      ctaPortfolio: "View portfolio",
      badgeArea: "Cascais, Oeiras, Sintra and Lisbon",
      badgeMobile: "Mobile-friendly websites",
      stats: [
        { valor: "24 h", texto: "Reply to new enquiries" },
        { valor: "1 to 2 weeks", texto: "Typical delivery time" },
        { valor: "100 %", texto: "Responsive, optimised websites" },
      ],
      aboutTitle: "Websites for companies and local businesses",
      aboutP1:
        "A website is often the first contact between a potential client and a company. Nova Web Studio builds modern websites for small businesses that need to present their services clearly, convey trust and make it easy for new clients to get in touch.",
      aboutP2:
        "We work mainly with businesses in Cascais, Oeiras, Sintra and Lisbon, both creating new websites and modernising existing ones.",
      servicesTitle: "What we do",
      services: [
        {
          titulo: "Website creation",
          texto:
            "We build professional websites from scratch, tailored to your business and designed to generate enquiries.",
        },
        {
          titulo: "Redesign and modernisation",
          texto:
            "We update older websites, improving design, structure, speed and the mobile experience.",
        },
        {
          titulo: "SEO and ongoing support",
          texto:
            "We prepare your website for search engines and support your digital presence over time.",
        },
      ],
      typesTitle: "Types of websites",
      types: [
        {
          titulo: "Business website",
          texto:
            "Present your company, services and contact details with a professional image.",
        },
        {
          titulo: "Online store",
          texto:
            "Sell products through a simple, modern store adapted to your business.",
        },
        {
          titulo: "Landing page",
          texto: "A single page focused on one service and generating enquiries.",
        },
        {
          titulo: "Web application",
          texto: "Custom digital solutions and private client areas.",
        },
      ],
      processTitle: "How we work",
      process: [
        {
          titulo: "We talk about your business",
          texto:
            "We understand what you do, what you need and the goals of the website.",
        },
        {
          titulo: "We send a proposal",
          texto:
            "You receive a clear proposal with the scope, timeline and price.",
        },
        {
          titulo: "We build the website",
          texto:
            "We develop the project and show you the progress before it goes live.",
        },
        {
          titulo: "We publish and support",
          texto:
            "We put the site online and help with the final adjustments needed.",
        },
      ],
      ctaTitle: "Need to create or modernise your business website?",
      ctaText:
        "Tell us what you need. We can review your current website or build a new solution tailored to your business.",
      ctaButton: "Request a quote",
      finalTitle: "Talk to Nova Web Studio",
      finalText:
        "We build websites for businesses in Cascais, Oeiras, Sintra and Lisbon.",
      finalButton: "Get in touch",
    },
    portfolio: {
      chip: "Portfolio",
      h1: "Websites designed around each business",
      lead: "A selection of websites and concepts created for different industries.",
      featuredHeadline: "Community, activities and information in one place",
      featuredText:
        "A clear, accessible institutional website designed to bring the association closer to its community.",
      realChip: "Live project",
      featuredDesc:
        "Institutional website built to modernise the association's digital presence and make its activities, news and contact details easy to find.",
      visit: "Visit website",
      othersTitle: "Other concepts",
      othersLead:
        "Visual explorations created to show different approaches and sectors.",
      concepts: [
        {
          titulo: "Website for pool services",
          etiqueta: "Demo project",
          descricao:
            "A modern, clear digital presence to present services and generate quote requests.",
          preview: {
            eyebrow: "Pools & Maintenance",
            headline: "We take care of your pool",
            lines: ["Construction", "Maintenance", "Repairs"],
          },
        },
        {
          titulo: "Website for holiday accommodation",
          etiqueta: "Concept",
          descricao:
            "A visual experience designed to showcase the space and encourage bookings.",
          preview: {
            eyebrow: "Holiday Rental",
            headline: "A special stay",
            lines: ["The space", "Location", "Contact"],
          },
        },
        {
          titulo: "Website for a carpentry workshop",
          etiqueta: "Design concept",
          descricao:
            "An elegant portfolio to highlight work, materials and bespoke services.",
          preview: {
            eyebrow: "Carpentry",
            headline: "Made-to-measure work",
            lines: ["Projects", "Materials", "Quotes"],
          },
        },
      ],
      ctaTitle: "Have a project in mind?",
      ctaText: "Tell us what you need and get a no-obligation proposal.",
      ctaButton: "Request a quote",
    },
    contact: {
      chip: "Contact",
      h1: "Let's talk about your project",
      lead: "Fill in the form with as much detail as possible. We review your request and send a proposal with timelines and pricing.",
      reply: "Reply within 24 working hours",
      location: "Portugal · remote work",
      panelTitle: "Quote request",
      panelSubtitle: "No obligation.",
      sentTitle: "Request received, thank you!",
      sentText: "Our team will contact you at the email address provided.",
      labels: {
        nome: "Name *",
        empresa: "Company",
        email: "Email *",
        telefone: "Phone",
        tipo: "Project type",
        orcamento: "Expected budget",
        mensagem: "Message",
      },
      placeholder: "Describe what you need, timelines and references.",
      meeting: "I would like to book an introductory meeting",
      submit: "Send request",
      submitting: "Sending…",
      note: "After sending, we will contact you by email or phone to better understand your project.",
      errorRequired: "Please enter your name and email.",
      errorSend: "We couldn't send your request. Please try again.",
      success: "Request sent. We'll be in touch shortly.",
      tipos: [
        "Business website",
        "Online store",
        "Landing page",
        "Web application",
        "Redesign of an existing site",
        "Other",
      ],
      orcamentos: [
        "Up to €150",
        "€150 – €250",
        "€250 – €400",
        "More than €400",
      ],
    },
  },

  de: {
    meta: {
      home: {
        title: "Webdesign in Cascais | Nova Web Studio",
        description:
          "Erstellung und Modernisierung von Websites in Cascais, Oeiras, Sintra und Lissabon. Professionelle, schnelle Websites für mehr Anfragen.",
      },
      portfolio: {
        title: "Website-Portfolio | Nova Web Studio",
        description:
          "Projekte und Konzepte von Nova Web Studio für verschiedene Branchen – modernes Design, Klarheit und einfache Kontaktaufnahme.",
      },
      contact: {
        title: "Kontakt | Nova Web Studio",
        description:
          "Sprechen Sie mit Nova Web Studio über die Erstellung oder Modernisierung Ihrer Website. Angebot unverbindlich anfragen.",
      },
    },
    nav: {
      home: "Start",
      portfolio: "Portfolio",
      contact: "Kontakt",
      cta: "Termin vereinbaren",
      team: "Teambereich",
      tagline: "Eine modernere Website für Sie",
      language: "Sprache",
    },
    footer: { rights: "Portugal" },
    home: {
      chip: "Webdesign in Cascais",
      h1: "Professionelle Websites für lokale Unternehmen",
      lead: "Wir erstellen und modernisieren Websites für Unternehmen in Cascais, Oeiras, Sintra und Lissabon – mit Fokus auf professionellem Auftritt, einfacher Bedienung und mehr Kontaktmöglichkeiten.",
      ctaProposal: "Angebot anfragen",
      ctaPortfolio: "Portfolio ansehen",
      badgeArea: "Cascais, Oeiras, Sintra und Lissabon",
      badgeMobile: "Für Mobilgeräte optimiert",
      stats: [
        { valor: "24 Std.", texto: "Antwort auf neue Anfragen" },
        { valor: "1 bis 2 Wochen", texto: "Typische Lieferzeit" },
        { valor: "100 %", texto: "Responsive und optimierte Websites" },
      ],
      aboutTitle: "Websites für Unternehmen und lokale Betriebe",
      aboutP1:
        "Eine Website ist oft der erste Kontakt zwischen einem potenziellen Kunden und einem Unternehmen. Nova Web Studio entwickelt moderne Websites für kleine Betriebe, die ihre Leistungen klar darstellen, Vertrauen schaffen und die Kontaktaufnahme erleichtern möchten.",
      aboutP2:
        "Wir arbeiten hauptsächlich mit Unternehmen in Cascais, Oeiras, Sintra und Lissabon – sowohl bei neuen Websites als auch bei der Modernisierung bestehender Seiten.",
      servicesTitle: "Was wir tun",
      services: [
        {
          titulo: "Website-Erstellung",
          texto:
            "Wir erstellen professionelle Websites von Grund auf, passend zu Ihrem Unternehmen und auf Anfragen ausgerichtet.",
        },
        {
          titulo: "Redesign und Modernisierung",
          texto:
            "Wir aktualisieren ältere Websites und verbessern Design, Struktur, Geschwindigkeit und mobile Nutzung.",
        },
        {
          titulo: "SEO und Betreuung",
          texto:
            "Wir bereiten die Website für Suchmaschinen vor und begleiten Ihre digitale Präsenz langfristig.",
        },
      ],
      typesTitle: "Arten von Websites",
      types: [
        {
          titulo: "Unternehmenswebsite",
          texto:
            "Präsentieren Sie Firma, Leistungen und Kontakt mit professionellem Auftritt.",
        },
        {
          titulo: "Onlineshop",
          texto:
            "Verkaufen Sie Produkte über einen einfachen, modernen Shop für Ihr Unternehmen.",
        },
        {
          titulo: "Landingpage",
          texto:
            "Eine Seite, die eine Leistung vorstellt und Anfragen generiert.",
        },
        {
          titulo: "Webanwendung",
          texto: "Individuelle digitale Lösungen und geschützte Bereiche.",
        },
      ],
      processTitle: "So arbeiten wir",
      process: [
        {
          titulo: "Wir sprechen über Ihr Unternehmen",
          texto:
            "Wir verstehen, was Sie tun, was Sie brauchen und welche Ziele die Website hat.",
        },
        {
          titulo: "Wir senden ein Angebot",
          texto:
            "Sie erhalten ein klares Angebot mit Umfang, Zeitplan und Preis.",
        },
        {
          titulo: "Wir erstellen die Website",
          texto:
            "Wir entwickeln das Projekt und zeigen den Fortschritt vor der Veröffentlichung.",
        },
        {
          titulo: "Wir veröffentlichen und begleiten",
          texto:
            "Wir bringen die Website online und helfen bei den letzten Anpassungen.",
        },
      ],
      ctaTitle: "Möchten Sie Ihre Website erstellen oder modernisieren?",
      ctaText:
        "Sagen Sie uns, was Sie brauchen. Wir prüfen Ihre aktuelle Website oder entwickeln eine neue Lösung für Ihr Unternehmen.",
      ctaButton: "Kostenvoranschlag anfragen",
      finalTitle: "Sprechen Sie mit Nova Web Studio",
      finalText:
        "Wir erstellen Websites für Unternehmen in Cascais, Oeiras, Sintra und Lissabon.",
      finalButton: "Kontaktieren",
    },
    portfolio: {
      chip: "Portfolio",
      h1: "Websites, die zu jedem Unternehmen passen",
      lead: "Eine Auswahl an Websites und Konzepten für unterschiedliche Branchen.",
      featuredHeadline: "Gemeinschaft, Aktivitäten und Infos an einem Ort",
      featuredText:
        "Eine klare, zugängliche Website, die den Verein näher an seine Gemeinschaft bringt.",
      realChip: "Reales Projekt",
      featuredDesc:
        "Website zur Modernisierung der digitalen Präsenz des Vereins und für einen einfachen Zugang zu Aktivitäten, Neuigkeiten und Kontakten.",
      visit: "Website besuchen",
      othersTitle: "Weitere Konzepte",
      othersLead:
        "Visuelle Studien, die verschiedene Ansätze und Branchen zeigen.",
      concepts: [
        {
          titulo: "Website für Poolservice",
          etiqueta: "Demoprojekt",
          descricao:
            "Ein moderner, klarer Auftritt zur Präsentation der Leistungen und für Angebotsanfragen.",
          preview: {
            eyebrow: "Pools & Wartung",
            headline: "Wir kümmern uns um Ihren Pool",
            lines: ["Bau", "Wartung", "Reparatur"],
          },
        },
        {
          titulo: "Website für Ferienunterkünfte",
          etiqueta: "Konzept",
          descricao:
            "Ein visuelles Erlebnis, das den Ort hervorhebt und Buchungen fördert.",
          preview: {
            eyebrow: "Ferienwohnung",
            headline: "Ein besonderer Aufenthalt",
            lines: ["Der Ort", "Lage", "Kontakt"],
          },
        },
        {
          titulo: "Website für eine Tischlerei",
          etiqueta: "Designkonzept",
          descricao:
            "Ein elegantes Portfolio für Arbeiten, Materialien und Maßanfertigungen.",
          preview: {
            eyebrow: "Tischlerei",
            headline: "Maßarbeit nach Wunsch",
            lines: ["Projekte", "Materialien", "Angebote"],
          },
        },
      ],
      ctaTitle: "Haben Sie ein Projekt im Kopf?",
      ctaText:
        "Sagen Sie uns, was Sie brauchen, und erhalten Sie ein unverbindliches Angebot.",
      ctaButton: "Kostenvoranschlag anfragen",
    },
    contact: {
      chip: "Kontakt",
      h1: "Sprechen wir über Ihr Projekt",
      lead: "Füllen Sie das Formular möglichst detailliert aus. Wir prüfen die Anfrage und senden ein Angebot mit Fristen und Preisen.",
      reply: "Antwort innerhalb von 24 Werkstunden",
      location: "Portugal · Remote-Arbeit",
      panelTitle: "Angebotsanfrage",
      panelSubtitle: "Unverbindlich.",
      sentTitle: "Anfrage erhalten, vielen Dank!",
      sentText: "Unser Team meldet sich unter der angegebenen E-Mail.",
      labels: {
        nome: "Name *",
        empresa: "Unternehmen",
        email: "E-Mail *",
        telefone: "Telefon",
        tipo: "Projektart",
        orcamento: "Geplantes Budget",
        mensagem: "Nachricht",
      },
      placeholder: "Beschreiben Sie Ihr Vorhaben, Fristen und Referenzen.",
      meeting: "Ich möchte ein Kennenlerngespräch vereinbaren",
      submit: "Anfrage senden",
      submitting: "Wird gesendet…",
      note: "Nach dem Absenden melden wir uns per E-Mail oder Telefon, um Ihr Projekt besser kennenzulernen.",
      errorRequired: "Bitte geben Sie Name und E-Mail an.",
      errorSend:
        "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
      success: "Anfrage gesendet. Wir melden uns in Kürze.",
      tipos: [
        "Unternehmenswebsite",
        "Onlineshop",
        "Landingpage",
        "Webanwendung",
        "Redesign einer bestehenden Website",
        "Sonstiges",
      ],
      orcamentos: [
        "Bis 150 €",
        "150 € – 250 €",
        "250 € – 400 €",
        "Mehr als 400 €",
      ],
    },
  },

  fr: {
    meta: {
      home: {
        title: "Création de Sites à Cascais | Nova Web Studio",
        description:
          "Création et modernisation de sites web à Cascais, Oeiras, Sintra et Lisbonne. Des sites professionnels et rapides pour générer plus de contacts.",
      },
      portfolio: {
        title: "Portfolio de Sites Web | Nova Web Studio",
        description:
          "Découvrez les projets et concepts réalisés par Nova Web Studio pour différents secteurs : design moderne, clarté et contact facile.",
      },
      contact: {
        title: "Contact | Nova Web Studio",
        description:
          "Parlez à Nova Web Studio pour créer ou moderniser le site web de votre entreprise. Demandez une proposition sans engagement.",
      },
    },
    nav: {
      home: "Accueil",
      portfolio: "Portfolio",
      contact: "Contact",
      cta: "Prendre rendez-vous",
      team: "Espace équipe",
      tagline: "Un site plus moderne pour vous",
      language: "Langue",
    },
    footer: { rights: "Portugal" },
    home: {
      chip: "Web design à Cascais",
      h1: "Des sites professionnels pour les entreprises locales",
      lead: "Nous créons et modernisons des sites web pour les entreprises de Cascais, Oeiras, Sintra et Lisbonne, avec une image professionnelle, une utilisation simple et plus d'opportunités de contact.",
      ctaProposal: "Demander une proposition",
      ctaPortfolio: "Voir le portfolio",
      badgeArea: "Cascais, Oeiras, Sintra et Lisbonne",
      badgeMobile: "Sites adaptés au mobile",
      stats: [
        { valor: "24 h", texto: "Réponse aux nouvelles demandes" },
        { valor: "1 à 2 semaines", texto: "Délai de livraison habituel" },
        { valor: "100 %", texto: "Sites responsives et optimisés" },
      ],
      aboutTitle: "Des sites pour les entreprises et commerces locaux",
      aboutP1:
        "Un site web est souvent le premier contact entre un client potentiel et une entreprise. Nova Web Studio développe des sites modernes pour les petites entreprises qui doivent présenter clairement leurs services, inspirer confiance et faciliter la prise de contact.",
      aboutP2:
        "Nous travaillons principalement avec des entreprises de Cascais, Oeiras, Sintra et Lisbonne, aussi bien pour la création que pour la modernisation de sites existants.",
      servicesTitle: "Ce que nous faisons",
      services: [
        {
          titulo: "Création de sites web",
          texto:
            "Nous créons des sites professionnels sur mesure, adaptés à votre activité et pensés pour générer des contacts.",
        },
        {
          titulo: "Refonte et modernisation",
          texto:
            "Nous actualisons les sites anciens en améliorant le design, l'organisation, la vitesse et l'expérience mobile.",
        },
        {
          titulo: "SEO et accompagnement",
          texto:
            "Nous préparons le site pour les moteurs de recherche et accompagnons votre présence digitale dans la durée.",
        },
      ],
      typesTitle: "Types de sites web",
      types: [
        {
          titulo: "Site vitrine",
          texto:
            "Présentez votre entreprise, vos services et vos contacts avec une image professionnelle.",
        },
        {
          titulo: "Boutique en ligne",
          texto:
            "Vendez vos produits via une boutique simple, moderne et adaptée à votre activité.",
        },
        {
          titulo: "Landing page",
          texto:
            "Une page centrée sur un service et sur la génération de demandes.",
        },
        {
          titulo: "Application web",
          texto: "Solutions digitales et espaces réservés développés sur mesure.",
        },
      ],
      processTitle: "Notre méthode",
      process: [
        {
          titulo: "Nous parlons de votre activité",
          texto:
            "Nous comprenons ce que vous faites, vos besoins et les objectifs du site.",
        },
        {
          titulo: "Nous envoyons une proposition",
          texto:
            "Vous recevez une proposition claire avec le périmètre, le délai et le prix.",
        },
        {
          titulo: "Nous créons le site",
          texto:
            "Nous développons le projet et montrons son évolution avant la mise en ligne.",
        },
        {
          titulo: "Nous publions et accompagnons",
          texto:
            "Nous mettons le site en ligne et aidons pour les derniers ajustements.",
        },
      ],
      ctaTitle: "Besoin de créer ou moderniser le site de votre entreprise ?",
      ctaText:
        "Dites-nous ce dont vous avez besoin. Nous pouvons analyser votre site actuel ou créer une solution sur mesure.",
      ctaButton: "Demander un devis",
      finalTitle: "Parlez avec Nova Web Studio",
      finalText:
        "Nous créons des sites pour les entreprises de Cascais, Oeiras, Sintra et Lisbonne.",
      finalButton: "Nous contacter",
    },
    portfolio: {
      chip: "Portfolio",
      h1: "Des sites pensés pour chaque activité",
      lead: "Une sélection de sites et de concepts créés pour différents secteurs.",
      featuredHeadline: "Communauté, activités et informations au même endroit",
      featuredText:
        "Un site institutionnel clair et accessible, pensé pour rapprocher l'association de sa communauté.",
      realChip: "Projet réel",
      featuredDesc:
        "Site institutionnel développé pour moderniser la présence digitale de l'association et faciliter l'accès à ses activités, actualités et contacts.",
      visit: "Visiter le site",
      othersTitle: "Autres concepts",
      othersLead:
        "Explorations visuelles créées pour illustrer différentes approches et secteurs.",
      concepts: [
        {
          titulo: "Site pour services de piscines",
          etiqueta: "Projet démonstratif",
          descricao:
            "Une présence digitale moderne et claire pour présenter les services et générer des devis.",
          preview: {
            eyebrow: "Piscines & Entretien",
            headline: "Nous prenons soin de votre piscine",
            lines: ["Construction", "Entretien", "Réparation"],
          },
        },
        {
          titulo: "Site pour hébergement touristique",
          etiqueta: "Concept",
          descricao:
            "Une expérience visuelle pensée pour valoriser le lieu et encourager les réservations.",
          preview: {
            eyebrow: "Hébergement",
            headline: "Un séjour particulier",
            lines: ["Le lieu", "Localisation", "Contacts"],
          },
        },
        {
          titulo: "Site pour une menuiserie",
          etiqueta: "Concept design",
          descricao:
            "Un portfolio élégant pour mettre en valeur les travaux, matériaux et services sur mesure.",
          preview: {
            eyebrow: "Menuiserie",
            headline: "Du travail sur mesure",
            lines: ["Projets", "Matériaux", "Devis"],
          },
        },
      ],
      ctaTitle: "Vous avez un projet en tête ?",
      ctaText:
        "Dites-nous ce dont vous avez besoin et recevez une proposition sans engagement.",
      ctaButton: "Demander un devis",
    },
    contact: {
      chip: "Contact",
      h1: "Parlons de votre projet",
      lead: "Remplissez le formulaire avec le plus de détails possible. Nous analysons la demande et envoyons une proposition avec délais et tarifs.",
      reply: "Réponse sous 24 heures ouvrables",
      location: "Portugal · travail à distance",
      panelTitle: "Demande de devis",
      panelSubtitle: "Sans engagement.",
      sentTitle: "Demande reçue, merci !",
      sentText: "Notre équipe vous contacte à l'adresse e-mail indiquée.",
      labels: {
        nome: "Nom *",
        empresa: "Entreprise",
        email: "E-mail *",
        telefone: "Téléphone",
        tipo: "Type de projet",
        orcamento: "Budget prévu",
        mensagem: "Message",
      },
      placeholder: "Décrivez votre besoin, les délais et vos références.",
      meeting: "Je souhaite prendre un rendez-vous de présentation",
      submit: "Envoyer la demande",
      submitting: "Envoi…",
      note: "Après l'envoi, nous vous contacterons par e-mail ou téléphone pour mieux connaître votre projet.",
      errorRequired: "Indiquez votre nom et votre e-mail.",
      errorSend: "Impossible d'envoyer la demande. Veuillez réessayer.",
      success: "Demande envoyée. Nous vous contactons bientôt.",
      tipos: [
        "Site vitrine",
        "Boutique en ligne",
        "Landing page",
        "Application web",
        "Refonte d'un site existant",
        "Autre",
      ],
      orcamentos: [
        "Jusqu'à 150 €",
        "150 € – 250 €",
        "250 € – 400 €",
        "Plus de 400 €",
      ],
    },
  },

  es: {
    meta: {
      home: {
        title: "Diseño Web en Cascais | Nova Web Studio",
        description:
          "Creación y modernización de sitios web en Cascais, Oeiras, Sintra y Lisboa. Webs profesionales y rápidas para conseguir más contactos.",
      },
      portfolio: {
        title: "Portafolio de Sitios Web | Nova Web Studio",
        description:
          "Proyectos y conceptos desarrollados por Nova Web Studio para distintos sectores, con diseño moderno, claridad y contacto sencillo.",
      },
      contact: {
        title: "Contacto | Nova Web Studio",
        description:
          "Habla con Nova Web Studio para crear o modernizar la web de tu negocio. Pide una propuesta sencilla y sin compromiso.",
      },
    },
    nav: {
      home: "Inicio",
      portfolio: "Portafolio",
      contact: "Contacto",
      cta: "Agendar reunión",
      team: "Área de equipo",
      tagline: "Una web más moderna para ti",
      language: "Idioma",
    },
    footer: { rights: "Portugal" },
    home: {
      chip: "Diseño web en Cascais",
      h1: "Webs profesionales para negocios locales",
      lead: "Creamos y modernizamos sitios web para empresas y negocios en Cascais, Oeiras, Sintra y Lisboa, con una imagen profesional, uso sencillo y más oportunidades de contacto.",
      ctaProposal: "Pedir propuesta",
      ctaPortfolio: "Ver portafolio",
      badgeArea: "Cascais, Oeiras, Sintra y Lisboa",
      badgeMobile: "Webs adaptadas a móvil",
      stats: [
        { valor: "24 h", texto: "Respuesta a nuevas solicitudes" },
        { valor: "1 a 2 semanas", texto: "Plazo habitual de entrega" },
        { valor: "100 %", texto: "Webs responsivas y optimizadas" },
      ],
      aboutTitle: "Webs para empresas y negocios locales",
      aboutP1:
        "Una web es muchas veces el primer contacto entre un cliente potencial y una empresa. Nova Web Studio desarrolla webs modernas para pequeños negocios que necesitan presentar sus servicios con claridad, transmitir confianza y facilitar el contacto con nuevos clientes.",
      aboutP2:
        "Trabajamos sobre todo con negocios en Cascais, Oeiras, Sintra y Lisboa, tanto en la creación de nuevas webs como en la modernización de sitios existentes.",
      servicesTitle: "Qué hacemos",
      services: [
        {
          titulo: "Creación de webs",
          texto:
            "Creamos webs profesionales desde cero, adaptadas a tu negocio y preparadas para generar contactos.",
        },
        {
          titulo: "Rediseño y modernización",
          texto:
            "Actualizamos webs antiguas mejorando el diseño, la organización, la velocidad y la experiencia móvil.",
        },
        {
          titulo: "SEO y acompañamiento",
          texto:
            "Preparamos la web para los buscadores y acompañamos tu presencia digital a lo largo del tiempo.",
        },
      ],
      typesTitle: "Tipos de webs",
      types: [
        {
          titulo: "Web corporativa",
          texto:
            "Presenta la empresa, los servicios y los contactos con una imagen profesional.",
        },
        {
          titulo: "Tienda online",
          texto:
            "Vende productos con una tienda sencilla, moderna y adaptada a tu negocio.",
        },
        {
          titulo: "Landing page",
          texto:
            "Una página centrada en presentar un servicio y generar solicitudes.",
        },
        {
          titulo: "Aplicación web",
          texto: "Soluciones digitales y áreas privadas desarrolladas a medida.",
        },
      ],
      processTitle: "Cómo trabajamos",
      process: [
        {
          titulo: "Hablamos sobre el negocio",
          texto:
            "Entendemos qué haces, qué necesitas y cuáles son los objetivos de la web.",
        },
        {
          titulo: "Enviamos una propuesta",
          texto: "Recibes una propuesta clara con el trabajo, el plazo y el precio.",
        },
        {
          titulo: "Creamos la web",
          texto:
            "Desarrollamos el proyecto y mostramos su evolución antes de publicarlo.",
        },
        {
          titulo: "Publicamos y acompañamos",
          texto:
            "Ponemos la web online y ayudamos con los últimos ajustes necesarios.",
        },
      ],
      ctaTitle: "¿Necesitas crear o modernizar la web de tu negocio?",
      ctaText:
        "Cuéntanos qué necesitas. Podemos analizar la web actual o preparar una solución desde cero adaptada a tu negocio.",
      ctaButton: "Pedir presupuesto",
      finalTitle: "Habla con Nova Web Studio",
      finalText:
        "Creamos webs para negocios en Cascais, Oeiras, Sintra y Lisboa.",
      finalButton: "Contactar",
    },
    portfolio: {
      chip: "Portafolio",
      h1: "Webs pensadas para cada negocio",
      lead: "Una selección de webs y conceptos desarrollados para distintos sectores.",
      featuredHeadline: "Comunidad, actividades e información en un solo lugar",
      featuredText:
        "Una web institucional clara y accesible, pensada para acercar la asociación a su comunidad.",
      realChip: "Proyecto real",
      featuredDesc:
        "Web institucional desarrollada para modernizar la presencia digital de la asociación y facilitar el acceso a sus actividades, novedades y contactos.",
      visit: "Visitar web",
      othersTitle: "Otros conceptos",
      othersLead:
        "Exploraciones visuales creadas para mostrar distintos enfoques y sectores.",
      concepts: [
        {
          titulo: "Web para servicios de piscinas",
          etiqueta: "Proyecto demostrativo",
          descricao:
            "Una presencia digital moderna y clara para presentar servicios y generar solicitudes de presupuesto.",
          preview: {
            eyebrow: "Piscinas y Mantenimiento",
            headline: "Cuidamos de tu piscina",
            lines: ["Construcción", "Mantenimiento", "Reparación"],
          },
        },
        {
          titulo: "Web para alojamiento turístico",
          etiqueta: "Concepto",
          descricao:
            "Una experiencia visual pensada para destacar el espacio e impulsar las reservas.",
          preview: {
            eyebrow: "Alojamiento",
            headline: "Una estancia especial",
            lines: ["El espacio", "Ubicación", "Contactos"],
          },
        },
        {
          titulo: "Web para carpintería",
          etiqueta: "Diseño desarrollado",
          descricao:
            "Un portafolio elegante para destacar trabajos, materiales y servicios personalizados.",
          preview: {
            eyebrow: "Carpintería",
            headline: "Trabajo hecho a medida",
            lines: ["Proyectos", "Materiales", "Presupuestos"],
          },
        },
      ],
      ctaTitle: "¿Tienes un proyecto en mente?",
      ctaText: "Cuéntanos qué necesitas y recibe una propuesta sin compromiso.",
      ctaButton: "Pedir presupuesto",
    },
    contact: {
      chip: "Contacto",
      h1: "Hablemos de tu proyecto",
      lead: "Rellena el formulario con el máximo detalle posible. Analizamos la solicitud y enviamos una propuesta con plazos y precios.",
      reply: "Respuesta en 24 horas laborables",
      location: "Portugal · trabajo remoto",
      panelTitle: "Solicitud de presupuesto",
      panelSubtitle: "Sin compromiso.",
      sentTitle: "¡Solicitud recibida, gracias!",
      sentText: "Nuestro equipo se pondrá en contacto por el email indicado.",
      labels: {
        nome: "Nombre *",
        empresa: "Empresa",
        email: "Email *",
        telefone: "Teléfono",
        tipo: "Tipo de proyecto",
        orcamento: "Presupuesto previsto",
        mensagem: "Mensaje",
      },
      placeholder: "Describe qué necesitas, plazos y referencias.",
      meeting: "Quiero agendar una reunión de presentación",
      submit: "Enviar solicitud",
      submitting: "Enviando…",
      note: "Tras el envío, nos pondremos en contacto contigo por email o teléfono para conocer mejor el proyecto.",
      errorRequired: "Indica el nombre y el email.",
      errorSend: "No se pudo enviar la solicitud. Inténtalo de nuevo.",
      success: "Solicitud enviada. Te contactamos en breve.",
      tipos: [
        "Web corporativa",
        "Tienda online",
        "Landing page",
        "Aplicación web",
        "Rediseño de web existente",
        "Otro",
      ],
      orcamentos: [
        "Hasta 150 €",
        "150 € – 250 €",
        "250 € – 400 €",
        "Más de 400 €",
      ],
    },
  },
};

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "pt";

  const langs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language ?? "pt"];

  for (const raw of langs) {
    const code = raw.slice(0, 2).toLowerCase();

    if ((LOCALES as readonly string[]).includes(code)) {
      return code as Locale;
    }
  }

  return "pt";
}
