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

export type PageKey = "home" | "portfolio" | "contact" | "restaurantes" | "restaurantesDemo";

export const PATHS = {
  pt: {
    home: "/",
    portfolio: "/portefolio",
    contact: "/contacto",
    restaurantes: "/restaurantes",
    restaurantesDemo: "/restaurantes/demonstracao",
  },
  en: {
    home: "/en",
    portfolio: "/en/portfolio",
    contact: "/en/contact",
    restaurantes: "/en/restaurants",
    restaurantesDemo: "/en/restaurants/demo",
  },
  de: {
    home: "/de",
    portfolio: "/de/portfolio",
    contact: "/de/contact",
    restaurantes: "/de/restaurants",
    restaurantesDemo: "/de/restaurants/demo",
  },
  fr: {
    home: "/fr",
    portfolio: "/fr/portfolio",
    contact: "/fr/contact",
    restaurantes: "/fr/restaurants",
    restaurantesDemo: "/fr/restaurants/demo",
  },
  es: {
    home: "/es",
    portfolio: "/es/portfolio",
    contact: "/es/contact",
    restaurantes: "/es/restaurantes",
    restaurantesDemo: "/es/restaurantes/demo",
  },
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
  const isDemo = page === "restaurantesDemo";

  const metaList = [
    { title: m.title },
    { name: "description", content: m.description },
    ...(isDemo ? [{ name: "robots", content: "noindex, follow" }] : []),
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
  ];

  let scriptsList: { type: string; children: string }[] | undefined = undefined;

  if (page === "restaurantes") {
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "@id": `${url}#software`,
          name: m.title,
          description: m.description,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web (Navegador Web / Web Browser)",
          url: url,
          image: `${SITE_URL}/logo.png`,
          featureList: dict[locale].restaurantes.featureList.map((f) => f.title),
          provider: {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: "Nova Web Studio",
            url: SITE_URL,
            logo: `${SITE_URL}/logo.png`,
          },
        },
        {
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          url: url,
          name: m.title,
          description: m.description,
          inLanguage: HTML_LANG[locale],
          isPartOf: {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: "Nova Web Studio",
            url: SITE_URL,
          },
        },
      ],
    };

    scriptsList = [
      {
        type: "application/ld+json",
        children: JSON.stringify(structuredData),
      },
    ];
  }

  return {
    meta: metaList,
    links: [{ rel: "canonical", href: url }, ...alternateLinks(page)],
    ...(scriptsList ? { scripts: scriptsList } : {}),
  };
}

/** Valores guardados no CRM (sempre em português, independentemente do idioma). */
export const TIPO_VALUES = [
  "Solução para Restaurantes",
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
    restaurantes: string;
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
  restaurantes: {
    heroChip: string;
    heroTagline: string;
    heroTitle: string;
    heroSubtitle: string;
    heroCtaDemo: string;
    heroCtaProposal: string;
    heroBadges: string[];
    heroMockup: {
      live: string;
      activeTables: string;
      todayOrders: string;
      bookings: string;
      bookingsValue: string;
      recentOrdersTitle: string;
      timeTitle: string;
      item1Name: string;
      item1Desc: string;
      item1Status: string;
      item2Name: string;
      item2Desc: string;
      item2Status: string;
      menuDishes: string;
      menuDrinks: string;
      menuDesserts: string;
      dishName: string;
      dishDesc: string;
      dishPrice: string;
      addBtn: string;
      callBtn: string;
      billBtn: string;
    };
    modulesChip: string;
    modulesTitle: string;
    modulesLead: string;
    modulesCtaFull: string;
    modulesDemoLabel: string;
    moduleTabs: {
      overview: string;
      bookings: string;
      tables: string;
      kitchen: string;
      menu: string;
      guest: string;
    };
    modulesData: {
      overview: { badge: string; title: string; desc: string; highlights: string[] };
      bookings: { badge: string; title: string; desc: string; highlights: string[] };
      tables: { badge: string; title: string; desc: string; highlights: string[] };
      kitchen: { badge: string; title: string; desc: string; highlights: string[] };
      menu: { badge: string; title: string; desc: string; highlights: string[] };
      guest: { badge: string; title: string; desc: string; highlights: string[] };
    };
    modulesShowcase: {
      overview: {
        shiftTitle: string;
        shiftStatus: string;
        revenueLabel: string;
        tablesLabel: string;
        ordersLabel: string;
        bookingsLabel: string;
        liveFeedTitle: string;
        liveFeedTime: string;
        event1: string;
        event1Time: string;
        event2: string;
        event2Time: string;
        event3: string;
        event3Time: string;
      };
      bookings: {
        scheduleTitle: string;
        scheduleDate: string;
        confirmedBadge: string;
        onlineBadge: string;
        phoneBadge: string;
        paxLabel: string;
        list: {
          time: string;
          name: string;
          pax: number;
          table: string;
          type: "online" | "phone";
        }[];
      };
      tables: {
        floorTitle: string;
        monitoredBadge: string;
        legendFree: string;
        legendOccupied: string;
        legendBill: string;
        legendReserved: string;
        statusFree: string;
        statusBill: string;
        statusReserved: string;
      };
      kitchen: {
        kdsTitle: string;
        kdsSubtitle: string;
        activeCountBadge: string;
        colNew: string;
        colPrep: string;
        ticket1Table: string;
        ticket1Items: string[];
        ticket1Obs: string;
        ticket1Action: string;
        ticket2Table: string;
        ticket2Status: string;
        ticket2Items: string[];
        ticket2Action: string;
      };
      menu: {
        menuTitle: string;
        menuSubtitle: string;
        testHint: string;
        catStarters: string;
        catMains: string;
        catDesserts: string;
        toggleAvailable: string;
        toggleSoldOut: string;
      };
      guest: {
        tableLabel: string;
        callBtn: string;
        billBtn: string;
        dishName: string;
        dishDesc: string;
        dishCategory: string;
        dishPrice: string;
        sendOrderBtn: string;
        itemsCountLabel: string;
      };
    };
    problemChip: string;
    problemTitle: string;
    problemLead: string;
    problemList: { title: string; text: string }[];
    problemNoTechTitle: string;
    problemNoTechText: string;
    featuresChip: string;
    featuresTitle: string;
    featuresLead: string;
    featuresCta: string;
    featureList: { title: string; text: string }[];
    processChip: string;
    howWorksTitle: string;
    howWorksLead: string;
    howWorksFlow: string[];
    processIntegratedTitle: string;
    processIntegratedText: string;
    processIntegratedCta: string;
    demoTitle: string;
    demoLead: string;
    demoButton: string;
    customChip: string;
    customTitle: string;
    customLead: string;
    customBadges: string[];
    customProfiles: { title: string; desc: string }[];
    finalChip: string;
    finalTitle: string;
    finalLead: string;
    finalCtaProposal: string;
    finalCtaDemo: string;
  };
  restaurantesDemo: {
    chip: string;
    title: string;
    subtitle: string;
    notice: string;
    reset: string;
    back: string;
    ctaProposal: string;
    splitView: string;
    singleView: string;
    logoTagline: string;
    toasts: {
      addedToCart: string;
      statusUpdated: string;
      availabilityUpdated: string;
      bookingSuccess: string;
      quickPhoneSuccess: string;
      resetSuccess: string;
    };
    tabOverview: string;
    tabBookings: string;
    tabTables: string;
    tabKitchen: string;
    tabMenu: string;
    tabGuest: string;
    overview: {
      title: string;
      subtitle: string;
      shiftRevenue: string;
      activeTables: string;
      activeOrders: string;
      todayBookings: string;
      recentActivity: string;
      realtimeBadge: string;
      occupancyTitle: string;
      viewTables: string;
      viewKitchen: string;
      avgPrepTime: string;
      servicePace: string;
      orderPrefix: string;
      bookingPrefix: string;
      paxLabel: string;
    };
    tables: {
      title: string;
      subtitle: string;
      zoneMain: string;
      zoneTerrace: string;
      statusFree: string;
      statusOccupied: string;
      statusBill: string;
      statusReserved: string;
      selectedTitle: string;
      noActiveOrder: string;
      capacity: string;
      orderTotal: string;
      tableLabel: string;
      activeTicketLabel: string;
      scheduledBookingLabel: string;
      paxSuffix: string;
    };
    menu: {
      title: string;
      subtitle: string;
      filterAll: string;
      statusAvailable: string;
      statusSoldOut: string;
      toggleAvailable: string;
      toggleSoldOut: string;
      itemsCount: string;
      addDish: string;
    };
    guest: {
      restaurantName: string;
      table: string;
      categories: {
        all: string;
        starters: string;
        mains: string;
        drinks: string;
        desserts: string;
      };
      addToCart: string;
      soldOut: string;
      notesPlaceholder: string;
      cartTitle: string;
      cartEmpty: string;
      subtotal: string;
      total: string;
      sendOrder: string;
      orderSentTitle: string;
      orderSentSubtitle: string;
      callWaiter: string;
      callWaiterSuccess: string;
      requestBill: string;
      requestBillSuccess: string;
      newOrder: string;
      prepStep1: string;
      prepStep2: string;
      prepStep2Desc: string;
      prepStep3: string;
      prepStep3Desc: string;
      summaryTitle: string;
      itemSelectedSingular: string;
      itemSelectedPlural: string;
    };
    panel: {
      title: string;
      subtitleKds: string;
      activeTables: string;
      todayOrders: string;
      alertsTitle: string;
      noAlerts: string;
      dismissAlert: string;
      statusNew: string;
      statusPrep: string;
      statusReady: string;
      statusDelivered: string;
      startPrep: string;
      markReady: string;
      markDelivered: string;
      noOrders: string;
      itemsCount: string;
      activeCountSuffix: string;
    };
    bookings: {
      title: string;
      subtitle: string;
      formTitle: string;
      date: string;
      time: string;
      guests: string;
      name: string;
      type: string;
      typeOnline: string;
      typePhone: string;
      submit: string;
      quickPhone: string;
      scheduleTitle: string;
      noBookings: string;
      paxSuffix: string;
    };
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
          "Criação de sites em Cascais, Oeiras e Lisboa. Desenvolvimento de websites profissionais para empresas, criação de lojas online e web design para atrair mais clientes.",
      },
      portfolio: {
        title: "Portefólio de Websites | Nova Web Studio",
        description:
          "Veja projetos e conceitos desenvolvidos pela Nova Web Studio para diferentes áreas de negócio, com foco em design moderno, clareza e contacto fácil.",
      },
      restaurantes: {
        title: "Software de Gestão para Restaurantes | Nova Web Studio",
        description:
          "Software de gestão para restaurantes com pedidos por QR Code, menu digital, gestão de mesas e reservas online. Conheça a solução e experimente a demonstração.",
      },
      restaurantesDemo: {
        title: "Demonstração para Restaurantes | Nova Web Studio",
        description:
          "Experimenta a solução digital para restaurantes: menu por QR Code, gestão de pedidos e reservas num ambiente interativo.",
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
      restaurantes: "Restaurantes",
      contact: "Contacto",
      cta: "Marcar reunião",
      team: "Área de equipa",
      tagline: "Um site mais moderno para si",
      language: "Idioma",
    },
    footer: { rights: "Portugal" },
    home: {
      chip: "Web Designer & Criação de Sites em Cascais",
      h1: "Criação de sites profissionais e websites para empresas",
      lead: "Criamos e modernizamos websites para empresas em Cascais, Oeiras, Sintra e Lisboa. Foco em desenvolvimento de websites modernos, lojas online e geração de contactos.",
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
            "Criamos sites profissionais de raiz, adaptados ao seu negócio e preparados para gerar contactos e vendas.",
        },
        {
          titulo: "Redesign e desenvolvimento web",
          texto:
            "Modernizamos websites antigos, melhorando o web design, velocidade e experiência no telemóvel.",
        },
        {
          titulo: "SEO e otimização contínua",
          texto:
            "Preparamos o seu website para ser encontrado no Google pelos termos certos e acompanhamos os resultados.",
        },
      ],
      typesTitle: "Tipos de websites",
      types: [
        {
          titulo: "Websites para empresas",
          texto:
            "Apresente a sua empresa, serviços e equipa com um website profissional e credível.",
        },
        {
          titulo: "Criação de lojas online",
          texto:
            "Venda produtos na internet através de uma loja online moderna, segura e adaptada ao seu negócio.",
        },
        {
          titulo: "Landing pages de conversão",
          texto:
            "Uma página focada num serviço específico para maximizar pedidos de orçamento e contactos.",
        },
        {
          titulo: "Desenvolvimento de websites e portais",
          texto:
            "Aplicações web e soluções digitais sob medida com áreas reservadas e funcionalidades avançadas.",
        },
      ],
      processTitle: "Como trabalhamos",
      process: [
        {
          titulo: "Falamos sobre o negócio",
          texto: "Percebemos o que faz, o que precisa e quais são os objetivos do website.",
        },
        {
          titulo: "Enviamos uma proposta",
          texto: "Recebe uma proposta clara com o trabalho, prazo e valor previstos.",
        },
        {
          titulo: "Criamos o website",
          texto: "Desenvolvemos o projeto e mostramos a evolução antes da publicação.",
        },
        {
          titulo: "Publicamos e acompanhamos",
          texto: "Colocamos o site online e ajudamos com os últimos ajustes necessários.",
        },
      ],
      ctaTitle: "Precisa de criar ou modernizar o website do seu negócio?",
      ctaText:
        "Diga-nos o que precisa. Podemos analisar o website atual ou preparar uma solução de raiz adaptada ao seu negócio.",
      ctaButton: "Pedir orçamento",
      finalTitle: "Fale com a Nova Web Studio",
      finalText: "Criamos websites para negócios em Cascais, Oeiras, Sintra e Lisboa.",
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
      othersLead: "Explorações visuais criadas para demonstrar diferentes abordagens e setores.",
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
    restaurantes: {
      heroChip: "Software de Gestão para Restaurantes",
      heroTagline: "Nova Web Studio · Setor da Restauração",
      heroTitle: "Software de gestão para restaurantes. Tudo num só lugar.",
      heroSubtitle:
        "Website próprio, menu digital para restaurantes, gestão de mesas, reservas online e pedidos por QR Code que simplificam o serviço da sala à cozinha.",
      heroCtaDemo: "Experimentar demonstração",
      heroCtaProposal: "Pedir proposta",
      heroBadges: [
        "Pedidos por QR Code na mesa",
        "Menu digital para restaurantes",
        "Gestão de mesas e reservas online",
      ],
      heroMockup: {
        live: "Em direto",
        activeTables: "Mesas Ativas",
        todayOrders: "Pedidos Hoje",
        bookings: "Reservas",
        bookingsValue: "6 noites",
        recentOrdersTitle: "Últimos Pedidos Recebidos",
        timeTitle: "Tempo",
        item1Name: "Bife da Vazia + Vinho Douro",
        item1Desc: "2 itens · Mesa 4",
        item1Status: "Em preparação",
        item2Name: "Polvo à Lagareiro + Água",
        item2Desc: "1 item · Mesa 2",
        item2Status: "Recebido",
        menuDishes: "Pratos",
        menuDrinks: "Bebidas",
        menuDesserts: "Doces",
        dishName: "Bife da Vazia",
        dishDesc: "Com batata rústica",
        dishPrice: "16,50 €",
        addBtn: "+ Adicionar",
        callBtn: "Chamar",
        billBtn: "Conta",
      },
      modulesChip: "Apresentação Modular",
      modulesTitle: "Explora o sistema por dentro",
      modulesLead:
        "Seleciona as diferentes áreas da plataforma e descobre como cada módulo simplifica o serviço e a gestão diária do teu restaurante.",
      modulesCtaFull: "Experimentar demonstração completa",
      modulesDemoLabel: "Ambiente Demonstrativo Interativo",
      moduleTabs: {
        overview: "Visão Geral",
        bookings: "Reservas",
        tables: "Sala e Mesas",
        kitchen: "Pedidos e Cozinha",
        menu: "Menu Digital",
        guest: "Cliente QR",
      },
      modulesData: {
        overview: {
          badge: "Painel Executivo do Serviço",
          title: "Controlo central em tempo real do turno e da sala",
          desc: "Acompanha a faturação da sessão, pedidos em curso, ocupação das mesas e alertas de assistência num único ecrã panorâmico.",
          highlights: [
            "Faturação acumulada da sessão atualizada em direto",
            "Métricas de mesas ocupadas e pedidos ativos",
            "Feed contínuo com as últimas ocorrências da sala e da cozinha",
          ],
        },
        bookings: {
          badge: "Agenda e Marcações",
          title: "Reservas online e telefónicas num calendário unificado",
          desc: "Elimina sobreposições e anotações dispersas. Regista marcações em segundos e visualiza o fluxo de clientes esperado para o dia.",
          highlights: [
            "Receção automática de reservas submetidas pelo website",
            "Registo rápido de chamadas telefónicas com alocação de mesa",
            "Organização cronológica por turnos de almoço e jantar",
          ],
        },
        tables: {
          badge: "Planta da Sala & Esplanada",
          title: "Gestão visual do estado de cada mesa em direto",
          desc: "Visualiza a ocupação da sala em tempo real: mesas livres, pedidos em preparação, pedidos de conta e marcações reservadas.",
          highlights: [
            "Disposição visual das mesas da sala interior e da esplanada",
            "Diferenciação por cores (livre, ocupada, com alerta ou reservada)",
            "Acesso rápido à comanda ativa e ao total consumido por mesa",
          ],
        },
        kitchen: {
          badge: "Kitchen Display System (KDS)",
          title: "Gestão ágil de comandas com fluxo Kanban de preparação",
          desc: "A cozinha recebe os pedidos organizados por ordem de chegada com observações detalhadas e atualiza o estado com um simples toque.",
          highlights: [
            "Colunas organizadas: Recebidos, Em Preparação, Prontos e Entregues",
            "Destaque para notas especiais e preferências alimentares",
            "Sincronização imediata com a notificação no telemóvel do cliente",
          ],
        },
        menu: {
          badge: "Gestão do Cardápio",
          title: "Catálogo digital com controlo instantâneo de disponibilidade",
          desc: "Atualiza pratos, descrições, preços e ativa ou desativa pratos esgotados com efeito imediato no telemóvel dos clientes.",
          highlights: [
            "Organização clara por entradas, pratos, bebidas e sobremesas",
            "Botão para marcar produtos esgotados instantaneamente",
            "Apresentação moderna com preços, descrição e etiquetas",
          ],
        },
        guest: {
          badge: "Experiência à Mesa",
          title: "Menu e pedidos diretos por QR Code sem instalar aplicações",
          desc: "O cliente lê o QR Code da mesa, consulta a carta com fotos e preços, personaliza o pedido e pode chamar o empregado ou pedir a conta.",
          highlights: [
            "Navegação intuitiva por categorias com pesquisa e carrinho",
            "Envio direto do pedido para a cozinha com campo de observações",
            "Botões dedicados para solicitar assistência do empregado ou a conta",
          ],
        },
      },
      modulesShowcase: {
        overview: {
          shiftTitle: "Turno Atual · Em curso",
          shiftStatus: "Serviço Ativo",
          revenueLabel: "Faturação Sessão",
          tablesLabel: "Mesas Ocupadas",
          ordersLabel: "Pedidos Ativos",
          bookingsLabel: "Reservas Hoje",
          liveFeedTitle: "Feed de Ocorrências em Direto",
          liveFeedTime: "Últimos 15 min",
          event1: "Novo pedido QR recebido: 2 pratos + 1 bebida",
          event1Time: "Agora mesmo",
          event2: "Cliente solicitou a conta à mesa",
          event2Time: "Há 3 min",
          event3: "Reserva confirmada: Dra. Beatriz (4 pax)",
          event3Time: "20:00 · M06",
        },
        bookings: {
          scheduleTitle: "Agenda de Marcações",
          scheduleDate: "Turno de Serviço · Hoje",
          confirmedBadge: "4 Reservas Confirmadas",
          onlineBadge: "Online",
          phoneBadge: "Telefone",
          paxLabel: "pessoas",
          list: [
            { time: "19:30", name: "Gonçalo Ferreira", pax: 2, table: "Mesa 08", type: "online" },
            { time: "20:00", name: "Dra. Beatriz Santos", pax: 4, table: "Mesa 06", type: "phone" },
            { time: "20:30", name: "Mariana Silva", pax: 2, table: "Mesa 04", type: "online" },
            { time: "21:15", name: "Pedro Alvares", pax: 6, table: "Mesa 12", type: "online" },
          ],
        },
        tables: {
          floorTitle: "Planta da Sala & Esplanada",
          monitoredBadge: "12 Mesas Monitorizadas",
          legendFree: "Livre",
          legendOccupied: "Ocupada",
          legendBill: "Conta",
          legendReserved: "Reservada",
          statusFree: "Disponível",
          statusBill: "Pediu Conta",
          statusReserved: "Reservada",
        },
        kitchen: {
          kdsTitle: "Kitchen Display Screen (KDS)",
          kdsSubtitle: "Fluxo de Preparação em Direto",
          activeCountBadge: "3 Comandas Ativas",
          colNew: "Novo",
          colPrep: "A Preparar (12 min)",
          ticket1Table: "Mesa 04 · PED-708",
          ticket1Items: ["1x Pão & Azeitonas Marinadas", "1x Bacalhau com Broa da Casa"],
          ticket1Obs: "Obs: «Sem cebola no bacalhau»",
          ticket1Action: "Iniciar Preparação →",
          ticket2Table: "Mesa 07 · PED-102",
          ticket2Status: "A Preparar (12 min)",
          ticket2Items: ["1x Bife da Vazia com Batata", "1x Vinho Tinto Reserva Douro"],
          ticket2Action: "Marcar Pronto ✓",
        },
        menu: {
          menuTitle: "Gestão da Carta & Stocks",
          menuSubtitle: "Controlo de Disponibilidade em Tempo Real",
          testHint: "Clique para testar",
          catStarters: "Entradas",
          catMains: "Pratos",
          catDesserts: "Sobremesas",
          toggleAvailable: "Disponível (Pausar)",
          toggleSoldOut: "Esgotado (Ativar)",
        },
        guest: {
          tableLabel: "Mesa 04",
          callBtn: "Chamar",
          billBtn: "Conta",
          dishName: "Bacalhau com Broa",
          dishDesc: "Com crosta de milho",
          dishCategory: "Prato",
          dishPrice: "16,50 €",
          sendOrderBtn: "Enviar Pedido",
          itemsCountLabel: "itens",
        },
      },
      problemChip: "O desafio do serviço",
      problemTitle: "Menos complicações na sala e no atendimento",
      problemLead:
        "Reservas dispersas, menus desatualizados, pedidos difíceis de organizar e várias mesas a chamar ao mesmo tempo tornam o serviço mais pesado. A nossa solução reúne as operações essenciais num sistema simples e integrado.",
      problemList: [
        {
          title: "Reservas dispersas",
          text: "Chamadas perdidas, anotações em papel e mensagens em várias plataformas dificultam a organização das mesas.",
        },
        {
          title: "Menus desatualizados",
          text: "Alterações de preços, pratos esgotados ou menus impressos desatualizados causam atrito no serviço.",
        },
        {
          title: "Pedidos difíceis de gerir",
          text: "Várias mesas a pedir em simultâneo com pedidos anotados à mão aumentam o risco de erros na cozinha.",
        },
        {
          title: "Serviço sobrecarregado",
          text: "Clientes à espera para fazer pedidos, chamar o empregado ou pedir a conta em momentos de maior movimento.",
        },
      ],
      problemNoTechTitle: "Sem complicações técnicas",
      problemNoTechText:
        "Não precisas de instalar equipamentos dispendiosos nem alterar os processos já existentes. A solução funciona diretamente nos telemóveis dos clientes e nos ecrãs ou tablets que já utilizas.",
      featuresChip: "Funcionalidades",
      featuresTitle: "Tudo o que o teu restaurante precisa para o dia a dia",
      featuresLead:
        "Ferramentas pensadas para o cliente à mesa e para a equipa na operação, sem complexidade desnecessária.",
      featuresCta: "Ver tudo na demonstração",
      featureList: [
        {
          title: "Website próprio para restaurantes",
          text: "Uma presença online profissional com a identidade, ementa, fotografias, localização, horários e contactos do teu restaurante.",
        },
        {
          title: "Menu digital para restaurantes atualizável em direto",
          text: "Atualiza pratos, descrições, preços e disponibilidade em tempo real, sem necessidade de reimprimir cartas.",
        },
        {
          title: "Pedidos por QR Code na mesa",
          text: "Cada mesa tem o seu código QR dedicado. Os clientes consultam o cardápio e enviam pedidos diretamente do telemóvel sem filas.",
        },
        {
          title: "Reservas online para restaurantes e marcação telefónica",
          text: "Recebe reservas feitas pelo website e regista manualmente marcações recebidas por telefone num único calendário central.",
        },
        {
          title: "Programa para restaurantes e ecrã de cozinha (KDS)",
          text: "Gestão ágil de comandas com fluxo visual Kanban da preparação à entrega dos pratos.",
        },
        {
          title: "Gestão de mesas e sala em tempo real",
          text: "Planta interativa da sala e esplanada com estados visuais: livres, ocupadas, com alerta ou a pedir conta.",
        },
        {
          title: "Chamada de empregado e pedido de conta no telemóvel",
          text: "O cliente pode solicitar a presença do empregado ou a conta diretamente a partir do ecrã do seu telemóvel.",
        },
        {
          title: "Relatórios e controlo operacional do turno",
          text: "Acompanhamento de faturação acumulada, ritmo de serviço e ocupação média da sala.",
        },
      ],
      processChip: "Processo",
      howWorksTitle: "Como funciona na prática",
      howWorksLead: "Um percurso simples e natural para o cliente e para a equipa.",
      howWorksFlow: [
        "Cliente lê o QR Code na mesa com o telemóvel",
        "Consulta o menu digital com fotos e preços atualizados",
        "Seleciona os pratos e envia o pedido diretamente",
        "O restaurante recebe o pedido no painel de gestão",
        "A equipa prepara e entrega o pedido na mesa certa",
      ],
      processIntegratedTitle: "Fluxo de Reservas Integrado:",
      processIntegratedText:
        "Os clientes marcam online através do website ou contactam por telefone. A equipa mantém todas as reservas organizadas num único calendário central.",
      processIntegratedCta: "Saber mais →",
      demoTitle: "Experimenta o sistema",
      demoLead:
        "Explora a experiência do cliente no telemóvel e conhece as funcionalidades da plataforma no nosso ambiente de demonstração.",
      demoButton: "Abrir demonstração",
      customChip: "À medida do teu espaço",
      customTitle: "Adaptado à identidade do teu espaço",
      customLead:
        "A Nova Web Studio personaliza o website, menu, mesas e definições visuais para combinar na perfeição com o estilo e ritmo do teu restaurante, café, bar ou espaço gastronómico.",
      customBadges: [
        "Cores, logótipo e tipografia alinhados com o restaurante",
        "Configuração das categorias, pratos, opções e preços",
        "Geração e design dos códigos QR prontos a imprimir",
        "Apoio e acompanhamento técnico da Nova Web Studio",
      ],
      customProfiles: [
        {
          title: "Restaurantes Tradicionais & Casas de Fado",
          desc: "Menu claro com pratos do dia, seleção de vinhos e reservas organizadas para almoços e jantares.",
        },
        {
          title: "Bistrôs, Cafés & Brunch",
          desc: "Menu dinâmico com fotos, gestão rápida de produtos esgotados e pedidos diretos à mesa sem filas.",
        },
        {
          title: "Bares, Lounges & Esplanadas",
          desc: "Chamadas de empregado e pedidos de conta no telemóvel para agilizar o serviço em áreas amplas.",
        },
        {
          title: "Espaços com Grande Volume de Reservas",
          desc: "Centralização de reservas online e telefónicas num calendário partilhado pela equipa.",
        },
      ],
      finalChip: "Próximo passo",
      finalTitle: "Pronto para modernizar o teu restaurante?",
      finalLead:
        "Fala connosco para conhecer a solução em detalhe e receber uma proposta ajustada ao teu estabelecimento.",
      finalCtaProposal: "Pedir proposta",
      finalCtaDemo: "Experimentar demonstração",
    },
    restaurantesDemo: {
      chip: "Demonstração Interativa",
      title: "Experimenta a nossa solução para restaurantes",
      subtitle: "Descobre como funciona o sistema na perspetiva dos teus clientes e da tua equipa.",
      notice: "Simulação comercial demonstrativa · Sem dados reais",
      reset: "Recomeçar demonstração",
      back: "Voltar à página comercial",
      ctaProposal: "Pedir proposta",
      splitView: "Vista dividida",
      singleView: "Vista individual",
      logoTagline: "Demonstração Oficial",
      toasts: {
        addedToCart: "adicionado ao pedido",
        statusUpdated: "Estado atualizado",
        availabilityUpdated: "Disponibilidade atualizada em rigoroso tempo real.",
        bookingSuccess: "Reserva registada na agenda com sucesso!",
        quickPhoneSuccess: "Reserva telefónica rápida adicionada à agenda!",
        resetSuccess: "Demonstração reiniciada com dados de exemplo iniciais.",
      },
      tabOverview: "Visão Geral",
      tabBookings: "Reservas",
      tabTables: "Sala e Mesas",
      tabKitchen: "Pedidos e Cozinha",
      tabMenu: "Menu Digital",
      tabGuest: "Cliente QR",
      overview: {
        title: "Resumo Operacional do Turno",
        subtitle: "Acompanhamento central da sessão atual do NOVA Restaurante.",
        shiftRevenue: "Faturação da Sessão",
        activeTables: "Mesas Ativas",
        activeOrders: "Pedidos em Curso",
        todayBookings: "Reservas Hoje",
        recentActivity: "Feed de Ocorrências em Direto",
        realtimeBadge: "Tempo Real",
        occupancyTitle: "Taxa de Ocupação da Sala",
        viewTables: "Ver mesas",
        viewKitchen: "Ver cozinha",
        avgPrepTime: "Tempo médio de preparação",
        servicePace: "Ritmo do serviço: Normal",
        orderPrefix: "Novo pedido QR:",
        bookingPrefix: "Reserva:",
        paxLabel: "pax",
      },
      tables: {
        title: "Mapa de Mesas & Sala",
        subtitle: "Gestão visual em tempo real das mesas da sala interior e esplanada.",
        zoneMain: "Sala Principal",
        zoneTerrace: "Esplanada",
        statusFree: "Livre",
        statusOccupied: "Ocupada",
        statusBill: "Conta Pedida",
        statusReserved: "Reservada",
        selectedTitle: "Detalhe da Mesa",
        noActiveOrder: "Mesa livre. Sem pedidos ativos neste momento.",
        capacity: "Capacidade",
        orderTotal: "Total da Comanda",
        tableLabel: "Mesa",
        activeTicketLabel: "Comanda ativa",
        scheduledBookingLabel: "Reserva agendada:",
        paxSuffix: "pax",
      },
      menu: {
        title: "Gestão do Cardápio & Disponibilidade",
        subtitle: "Ativa ou marca pratos como esgotados para testar o efeito na visão do cliente.",
        filterAll: "Todas as categorias",
        statusAvailable: "Disponível",
        statusSoldOut: "Esgotado",
        toggleAvailable: "Marcar Disponível",
        toggleSoldOut: "Marcar Esgotado",
        itemsCount: "pratos e bebidas no menu",
        addDish: "Artigo do Menu",
      },
      guest: {
        restaurantName: "NOVA Restaurante",
        table: "Mesa 04",
        categories: {
          all: "Todos",
          starters: "Entradas",
          mains: "Pratos Principais",
          drinks: "Bebidas",
          desserts: "Sobremesas",
        },
        addToCart: "Adicionar",
        soldOut: "Esgotado",
        notesPlaceholder: "Alguma preferência ou alergia?",
        cartTitle: "O teu pedido",
        cartEmpty: "O carrinho está vazio. Escolhe os pratos do menu.",
        subtotal: "Subtotal",
        total: "Total",
        sendOrder: "Enviar pedido para a cozinha",
        orderSentTitle: "Pedido enviado com sucesso!",
        orderSentSubtitle: "O teu pedido foi recebido pelo restaurante e está a ser preparado.",
        callWaiter: "Chamar empregado",
        callWaiterSuccess: "Empregado chamado à mesa. Já vamos ter consigo!",
        requestBill: "Pedir a conta",
        requestBillSuccess: "Conta solicitada. O empregado trará a conta à mesa.",
        newOrder: "Fazer novo pedido",
        prepStep1: "1. Recebidos",
        prepStep2: "2. Em preparação",
        prepStep2Desc: "A cozinha está a preparar a sua encomenda.",
        prepStep3: "3. Prontos",
        prepStep3Desc: "O empregado está a levar à mesa.",
        summaryTitle: "Resumo:",
        itemSelectedSingular: "item selecionado",
        itemSelectedPlural: "itens selecionados",
      },
      panel: {
        title: "Gestão da Sala & Cozinha",
        subtitleKds: "Kitchen Display System (KDS)",
        activeTables: "Mesas Ativas",
        todayOrders: "Pedidos da Sessão",
        alertsTitle: "Chamadas de Mesa & Pedidos de Conta",
        noAlerts: "Sem pedidos de assistência pendentes.",
        dismissAlert: "Concluir",
        statusNew: "Recebidos",
        statusPrep: "Em preparação",
        statusReady: "Prontos",
        statusDelivered: "Entregues",
        startPrep: "Iniciar preparação",
        markReady: "Marcar como pronto",
        markDelivered: "Marcar como entregue",
        noOrders: "Nenhum pedido nesta fase.",
        itemsCount: "itens",
        activeCountSuffix: "Comandas Ativas",
      },
      bookings: {
        title: "Agenda de Reservas",
        subtitle: "Reservas feitas online e marcações telefónicas reunidas num único calendário.",
        formTitle: "Registar Reserva",
        date: "Data",
        time: "Hora",
        guests: "Pessoas",
        name: "Nome fictício",
        type: "Origem da reserva",
        typeOnline: "Online (Website)",
        typePhone: "Telefone",
        submit: "Confirmar Reserva",
        quickPhone: "Adicionar Reserva Telefónica Rápida",
        scheduleTitle: "Marcações para Hoje",
        noBookings: "Sem reservas registadas para hoje.",
        paxSuffix: "pax",
      },
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
        "Solução para Restaurantes",
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
        title: "Web Design in Cascais & Websites | Nova Web Studio",
        description:
          "Professional web design in Cascais, Oeiras and Lisbon. Custom website creation, business websites and online stores built to grow your local presence and leads.",
      },
      portfolio: {
        title: "Website Portfolio | Nova Web Studio",
        description:
          "See projects and concepts created by Nova Web Studio for different industries, focused on modern design, clarity and easy contact.",
      },
      restaurantes: {
        title: "Restaurant Management Software | Nova Web Studio",
        description:
          "Modern restaurant management software with table QR code ordering, live digital menus, table management, and online reservations. Explore the live interactive demo.",
      },
      restaurantesDemo: {
        title: "Interactive Restaurant Demo | Nova Web Studio",
        description:
          "Test our digital restaurant solution: QR code ordering, live order management, and table reservations.",
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
      restaurantes: "Restaurants",
      contact: "Contact",
      cta: "Book a meeting",
      team: "Team area",
      tagline: "A more modern website for you",
      language: "Language",
    },
    footer: { rights: "Portugal" },
    home: {
      chip: "Web Designer & Website Creation in Cascais",
      h1: "Professional web design and custom business websites",
      lead: "We build and modernise websites for businesses across Cascais, Oeiras, Sintra and Lisbon, delivering high-performance design, mobile clarity, and steady enquiries.",
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
          titulo: "Custom website creation",
          texto:
            "We build professional websites from scratch, tailored to your business and designed to generate enquiries.",
        },
        {
          titulo: "Redesign & web development",
          texto:
            "We update older websites, improving design, technical structure, speed, and the mobile experience.",
        },
        {
          titulo: "SEO & ongoing support",
          texto:
            "We optimise your website for search engines and support your digital presence over time.",
        },
      ],
      typesTitle: "Types of websites",
      types: [
        {
          titulo: "Business websites",
          texto:
            "Present your company, services and contact details with a strong, professional image.",
        },
        {
          titulo: "Ecommerce & online stores",
          texto:
            "Sell products through a modern, secure and intuitive online store built for conversion.",
        },
        {
          titulo: "High-converting landing pages",
          texto:
            "A focused page designed to present a specific service and maximize quote requests.",
        },
        {
          titulo: "Custom web applications",
          texto: "Tailored web development, client portals and bespoke digital solutions.",
        },
      ],
      processTitle: "How we work",
      process: [
        {
          titulo: "We talk about your business",
          texto: "We understand what you do, what you need and the goals of the website.",
        },
        {
          titulo: "We send a proposal",
          texto: "You receive a clear proposal with the scope, timeline and price.",
        },
        {
          titulo: "We build the website",
          texto: "We develop the project and show you the progress before it goes live.",
        },
        {
          titulo: "We publish and support",
          texto: "We put the site online and help with the final adjustments needed.",
        },
      ],
      ctaTitle: "Need to create or modernise your business website?",
      ctaText:
        "Tell us what you need. We can review your current website or build a new solution tailored to your business.",
      ctaButton: "Request a quote",
      finalTitle: "Talk to Nova Web Studio",
      finalText: "We build websites for businesses in Cascais, Oeiras, Sintra and Lisbon.",
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
      othersLead: "Visual explorations created to show different approaches and sectors.",
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
          descricao: "A visual experience designed to showcase the space and encourage bookings.",
          preview: {
            eyebrow: "Holiday Rental",
            headline: "A special stay",
            lines: ["The space", "Location", "Contact"],
          },
        },
        {
          titulo: "Website for a carpentry workshop",
          etiqueta: "Design concept",
          descricao: "An elegant portfolio to highlight work, materials and bespoke services.",
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
    restaurantes: {
      heroChip: "Restaurant Management Software",
      heroTagline: "Nova Web Studio · Hospitality Solutions",
      heroTitle: "Modern restaurant management software. All in one place.",
      heroSubtitle:
        "Custom website, interactive digital menu, table management, online restaurant reservations, and table QR code ordering built for speed.",
      heroCtaDemo: "Try live demo",
      heroCtaProposal: "Request a quote",
      heroBadges: [
        "Table QR code ordering",
        "Live digital menu for restaurants",
        "Table management & online reservations",
      ],
      heroMockup: {
        live: "Live",
        activeTables: "Active Tables",
        todayOrders: "Today's Orders",
        bookings: "Bookings",
        bookingsValue: "6 tonight",
        recentOrdersTitle: "Latest Received Orders",
        timeTitle: "Time",
        item1Name: "Sirloin Steak + Douro Red Wine",
        item1Desc: "2 items · Table 4",
        item1Status: "Preparing",
        item2Name: "Roasted Codfish + Mineral Water",
        item2Desc: "1 item · Table 2",
        item2Status: "Received",
        menuDishes: "Mains",
        menuDrinks: "Drinks",
        menuDesserts: "Desserts",
        dishName: "Sirloin Steak",
        dishDesc: "With rustic potatoes",
        dishPrice: "18.00 €",
        addBtn: "+ Add to order",
        callBtn: "Call",
        billBtn: "Bill",
      },
      modulesChip: "Modular Presentation",
      modulesTitle: "Explore the system modules",
      modulesLead:
        "Select the different areas of the platform and discover how each tool streamlines daily operations in your restaurant.",
      modulesCtaFull: "Experience full interactive demo",
      modulesDemoLabel: "Interactive Demonstration Environment",
      moduleTabs: {
        overview: "Overview",
        bookings: "Reservations",
        tables: "Floor & Tables",
        kitchen: "Orders & Kitchen",
        menu: "Digital Menu",
        guest: "QR Guest",
      },
      modulesData: {
        overview: {
          badge: "Executive Service Dashboard",
          title: "Real-time shift oversight and dining room control",
          desc: "Track session revenue, pending orders, table occupancy and service alerts on a single panoramic screen.",
          highlights: [
            "Live accumulated shift revenue updated in real time",
            "Key metrics on active tables, order counts and seat occupancy",
            "Continuous activity stream capturing kitchen and floor events",
          ],
        },
        bookings: {
          badge: "Unified Agenda & Calendar",
          title: "Online bookings and phone calls in one central schedule",
          desc: "Eliminate double-bookings and scattered notes. Log new parties in seconds and visualize expected traffic across lunch and dinner shifts.",
          highlights: [
            "Instant reception of bookings submitted through your website",
            "Fast phone reservation logging with dedicated table allocation",
            "Chronological organization sorted by shift and party size",
          ],
        },
        tables: {
          badge: "Floor Plan & Terrace Layout",
          title: "Live visual status of every dining room and terrace table",
          desc: "View current room state at a glance: free tables, active tickets in prep, requested bills and upcoming reserved tables.",
          highlights: [
            "Visual layout covering both interior dining room and outdoor terrace",
            "Color-coded states (free, occupied, bill requested or reserved)",
            "One-click access to active tickets and current table spend",
          ],
        },
        kitchen: {
          badge: "Kitchen Display System (KDS)",
          title: "Agile ticket management with visual Kanban preparation flow",
          desc: "The kitchen receives orders sequentially with special requests highlighted and advances tickets with a single tap.",
          highlights: [
            "Structured columns: Received, In Preparation, Ready and Delivered",
            "Clear emphasis on dietary preferences and cooking instructions",
            "Immediate synchronization with the guest's mobile status screen",
          ],
        },
        menu: {
          badge: "Digital Catalog Management",
          title: "Live digital menu with instant sold-out toggle control",
          desc: "Update items, descriptions, prices and mark out-of-stock items instantly without ever reprinting menus.",
          highlights: [
            "Intuitive breakdown into starters, mains, drinks and desserts",
            "One-click switch to mark dishes as sold out in real time",
            "Modern aesthetic with pricing, detailed descriptions and tags",
          ],
        },
        guest: {
          badge: "Tabletop Guest Experience",
          title: "Direct QR ordering with zero app download required",
          desc: "Guests scan the table QR code, browse the photo menu, customize items, send orders, call staff and request their check.",
          highlights: [
            "Effortless category browsing with live search and shopping cart",
            "Direct kitchen order submission with dedicated observation notes",
            "Dedicated buttons to request waiter assistance or request the bill",
          ],
        },
      },
      modulesShowcase: {
        overview: {
          shiftTitle: "Dinner Service · Active",
          shiftStatus: "Service Active",
          revenueLabel: "Session Revenue",
          tablesLabel: "Occupied Tables",
          ordersLabel: "Active Orders",
          bookingsLabel: "Today's Bookings",
          liveFeedTitle: "Live Incident Stream",
          liveFeedTime: "Last 15 min",
          event1: "New QR order received: 2 mains + 1 drink",
          event1Time: "Just now",
          event2: "Guest requested the bill at table",
          event2Time: "3 min ago",
          event3: "Booking confirmed: Dr. Beatriz (4 guests)",
          event3Time: "20:00 · T06",
        },
        bookings: {
          scheduleTitle: "Reservation Calendar",
          scheduleDate: "Current Shift · Today",
          confirmedBadge: "4 Confirmed Bookings",
          onlineBadge: "Online",
          phoneBadge: "Phone Call",
          paxLabel: "guests",
          list: [
            { time: "19:30", name: "Gonçalo Ferreira", pax: 2, table: "Table 08", type: "online" },
            { time: "20:00", name: "Dr. Beatriz Santos", pax: 4, table: "Table 06", type: "phone" },
            { time: "20:30", name: "Mariana Silva", pax: 2, table: "Table 04", type: "online" },
            { time: "21:15", name: "Pedro Alvares", pax: 6, table: "Table 12", type: "online" },
          ],
        },
        tables: {
          floorTitle: "Dining Room & Terrace Floor Plan",
          monitoredBadge: "12 Monitored Tables",
          legendFree: "Free",
          legendOccupied: "Occupied",
          legendBill: "Bill",
          legendReserved: "Reserved",
          statusFree: "Available",
          statusBill: "Bill Requested",
          statusReserved: "Reserved",
        },
        kitchen: {
          kdsTitle: "Kitchen Display Screen (KDS)",
          kdsSubtitle: "Live Preparation Stream",
          activeCountBadge: "3 Active Tickets",
          colNew: "New",
          colPrep: "In Prep (12 min)",
          ticket1Table: "Table 04 · ORD-708",
          ticket1Items: [
            "1x Artisan Bread & Marinated Olives",
            "1x Roasted Codfish with Cornbread Crust",
          ],
          ticket1Obs: "Note: «No onions in the codfish»",
          ticket1Action: "Start Prep →",
          ticket2Table: "Table 07 · ORD-102",
          ticket2Status: "In Prep (12 min)",
          ticket2Items: ["1x Sirloin Steak with Rustic Potatoes", "1x Douro Reserva Red Wine"],
          ticket2Action: "Mark Ready ✓",
        },
        menu: {
          menuTitle: "Menu Catalog & Inventory",
          menuSubtitle: "Real-time Availability Control",
          testHint: "Click to toggle",
          catStarters: "Starters",
          catMains: "Mains",
          catDesserts: "Desserts",
          toggleAvailable: "Available (Pause)",
          toggleSoldOut: "Sold Out (Activate)",
        },
        guest: {
          tableLabel: "Table 04",
          callBtn: "Call",
          billBtn: "Bill",
          dishName: "Roasted Codfish",
          dishDesc: "With cornbread crust",
          dishCategory: "Main",
          dishPrice: "16.50 €",
          sendOrderBtn: "Send Order",
          itemsCountLabel: "items",
        },
      },
      problemChip: "Service challenges",
      problemTitle: "Less friction in the dining room and customer service",
      problemLead:
        "Scattered reservations, outdated menus, difficult order tracking and multiple tables calling at once make service stressful. Our platform unites essential daily operations into a simple, integrated system.",
      problemList: [
        {
          title: "Scattered reservations",
          text: "Missed calls, paper notes and messages across multiple apps make table management chaotic.",
        },
        {
          title: "Outdated menus",
          text: "Price adjustments, sold-out items or reprinted paper menus create unnecessary delays.",
        },
        {
          title: "Order confusion",
          text: "Multiple tables ordering simultaneously on handwritten slips increases the chance of kitchen errors.",
        },
        {
          title: "Overwhelmed staff",
          text: "Customers waiting to place orders, call a waiter or ask for the bill during peak rush hours.",
        },
      ],
      problemNoTechTitle: "No technical complexity",
      problemNoTechText:
        "No expensive equipment or complicated staff training required. The system works directly on your guests' smartphones and on any tablet or screen already in place.",
      featuresChip: "Features",
      featuresTitle: "Everything your restaurant needs every day",
      featuresLead:
        "Tools designed for guests at the table and staff behind the counter, without unnecessary complexity.",
      featuresCta: "See everything in live demo",
      featureList: [
        {
          title: "Custom restaurant website & online presence",
          text: "A professional branded online presence showcasing your menu, atmosphere, location and opening hours.",
        },
        {
          title: "Digital menu for restaurants with instant updates",
          text: "Update dishes, descriptions, prices and sold-out items in real time without reprinting physical menus.",
        },
        {
          title: "Table QR code ordering",
          text: "Each table gets a dedicated QR code. Guests scan, browse the menu, and place orders straight from their phones.",
        },
        {
          title: "Online restaurant reservations & phone bookings",
          text: "Accept online booking requests from your website and log phone reservations in one central schedule.",
        },
        {
          title: "Restaurant management system & kitchen display (KDS)",
          text: "Agile order tracking with a visual Kanban workflow from food prep to table delivery.",
        },
        {
          title: "Real-time table & dining room management",
          text: "Interactive floor plan showing live table statuses: available, dining, calling staff, or requesting the bill.",
        },
        {
          title: "Call waiter & bill request on smartphone",
          text: "Guests can request waiter assistance or ask for their bill directly through their mobile browser.",
        },
        {
          title: "Shift reports & operational oversight",
          text: "Monitor cumulative revenue, service pace, and average table occupancy across each shift.",
        },
      ],
      processChip: "Process",
      howWorksTitle: "How it works in practice",
      howWorksLead: "A smooth, intuitive journey for both guests and team.",
      howWorksFlow: [
        "Guest scans the QR Code on the table with their phone",
        "Browses the digital menu with photos and updated prices",
        "Selects dishes and sends the order directly",
        "The restaurant receives the order on the management dashboard",
        "The team prepares and delivers the order to the correct table",
      ],
      processIntegratedTitle: "Integrated Reservation Workflow:",
      processIntegratedText:
        "Guests book online via your website or call by phone. Your team manages all reservations in one central, synchronized calendar.",
      processIntegratedCta: "Learn more →",
      demoTitle: "Experience the platform",
      demoLead:
        "Explore the guest mobile experience and discover platform capabilities on our live demo environment.",
      demoButton: "Open live demo",
      customChip: "Tailored to your venue",
      customTitle: "Tailored to your establishment's identity",
      customLead:
        "Nova Web Studio customises the website, menu, table setup and styling to match the atmosphere of your restaurant, café, bar or culinary venue.",
      customBadges: [
        "Colors, typography and brand identity matching your venue",
        "Full setup of categories, dishes, options and pricing",
        "Print-ready QR code generation and tabletop collateral design",
        "Dedicated technical onboarding and support from Nova Web Studio",
      ],
      customProfiles: [
        {
          title: "Traditional Dining & Wine Bars",
          desc: "Clear daily menus, wine selections and structured reservations for lunch and dinner shifts.",
        },
        {
          title: "Bistros, Cafés & Brunch Spots",
          desc: "Dynamic photo menus, instant sold-out item toggles and direct table ordering without queues.",
        },
        {
          title: "Cocktail Lounges & Terraces",
          desc: "Mobile waiter calls and check requests to accelerate service across large outdoor areas.",
        },
        {
          title: "High-Volume Event & Group Venues",
          desc: "Centralized online and phone booking management in a shared team calendar.",
        },
      ],
      finalChip: "Next step",
      finalTitle: "Ready to modernise your restaurant?",
      finalLead:
        "Get in touch to explore the solution in detail and receive a tailored proposal for your business.",
      finalCtaProposal: "Request a quote",
      finalCtaDemo: "Try live demo",
    },
    restaurantesDemo: {
      chip: "Interactive Demo",
      title: "Experience our restaurant solution",
      subtitle: "See how the system works from the perspective of your guests and your staff.",
      notice: "Commercial interactive simulation · No real data",
      reset: "Reset demo",
      back: "Back to overview",
      ctaProposal: "Request a quote",
      splitView: "Split view",
      singleView: "Single view",
      logoTagline: "Official Demo",
      toasts: {
        addedToCart: "added to order",
        statusUpdated: "Status updated",
        availabilityUpdated: "Item availability updated in real-time.",
        bookingSuccess: "Reservation registered in schedule successfully!",
        quickPhoneSuccess: "Quick phone reservation added to schedule!",
        resetSuccess: "Demo reset to initial sample data.",
      },
      tabOverview: "Overview",
      tabBookings: "Reservations",
      tabTables: "Floor & Tables",
      tabKitchen: "Orders & Kitchen",
      tabMenu: "Digital Menu",
      tabGuest: "QR Guest",
      overview: {
        title: "Shift Operations Summary",
        subtitle: "Central real-time monitoring for the current session at NOVA Restaurante.",
        shiftRevenue: "Shift Revenue",
        activeTables: "Active Tables",
        activeOrders: "Active Orders",
        todayBookings: "Today's Bookings",
        recentActivity: "Live Activity Stream",
        realtimeBadge: "Real Time",
        occupancyTitle: "Dining Room Occupancy Rate",
        viewTables: "View tables",
        viewKitchen: "View kitchen",
        avgPrepTime: "Avg prep time",
        servicePace: "Service pace: Normal",
        orderPrefix: "New QR order:",
        bookingPrefix: "Booking:",
        paxLabel: "pax",
      },
      tables: {
        title: "Floor Plan & Table Map",
        subtitle: "Visual real-time status of main dining room and outdoor terrace tables.",
        zoneMain: "Main Dining Room",
        zoneTerrace: "Outdoor Terrace",
        statusFree: "Free",
        statusOccupied: "Occupied",
        statusBill: "Bill Requested",
        statusReserved: "Reserved",
        selectedTitle: "Table Details",
        noActiveOrder: "Table is free. No active orders currently.",
        capacity: "Capacity",
        orderTotal: "Ticket Total",
        tableLabel: "Table",
        activeTicketLabel: "Active ticket",
        scheduledBookingLabel: "Scheduled booking:",
        paxSuffix: "pax",
      },
      menu: {
        title: "Digital Menu & Availability",
        subtitle: "Toggle dishes between available and sold out to preview the live guest view.",
        filterAll: "All categories",
        statusAvailable: "Available",
        statusSoldOut: "Sold Out",
        toggleAvailable: "Set Available",
        toggleSoldOut: "Mark Sold Out",
        itemsCount: "dishes & drinks on menu",
        addDish: "Menu Item",
      },
      guest: {
        restaurantName: "NOVA Restaurante",
        table: "Table 04",
        categories: {
          all: "All",
          starters: "Starters",
          mains: "Mains",
          drinks: "Drinks",
          desserts: "Desserts",
        },
        addToCart: "Add to order",
        soldOut: "Sold Out",
        notesPlaceholder: "Any special instructions or allergies?",
        cartTitle: "Your order",
        cartEmpty: "Your cart is empty. Pick dishes from the menu.",
        subtotal: "Subtotal",
        total: "Total",
        sendOrder: "Send order to kitchen",
        orderSentTitle: "Order sent successfully!",
        orderSentSubtitle: "Your order has been received by the kitchen and is being prepared.",
        callWaiter: "Call waiter",
        callWaiterSuccess: "Waiter called to table. Someone will be with you shortly!",
        requestBill: "Request bill",
        requestBillSuccess: "Bill requested. A waiter will bring it to your table.",
        newOrder: "Place another order",
        prepStep1: "1. Received",
        prepStep2: "2. Preparing",
        prepStep2Desc: "The kitchen is preparing your dishes.",
        prepStep3: "3. Ready",
        prepStep3Desc: "A waiter is bringing the dishes to your table.",
        summaryTitle: "Summary:",
        itemSelectedSingular: "item selected",
        itemSelectedPlural: "items selected",
      },
      panel: {
        title: "Floor & Kitchen Operations",
        subtitleKds: "Kitchen Display System (KDS)",
        activeTables: "Active Tables",
        todayOrders: "Session Orders",
        alertsTitle: "Table Calls & Bill Requests",
        noAlerts: "No pending assistance requests.",
        dismissAlert: "Dismiss",
        statusNew: "Received",
        statusPrep: "Preparing",
        statusReady: "Ready",
        statusDelivered: "Delivered",
        startPrep: "Start preparation",
        markReady: "Mark as ready",
        markDelivered: "Mark as delivered",
        noOrders: "No orders in this column.",
        itemsCount: "items",
        activeCountSuffix: "Active Tickets",
      },
      bookings: {
        title: "Reservation Schedule",
        subtitle: "Online bookings and phone reservations united in one real-time schedule.",
        formTitle: "Book a Table",
        date: "Date",
        time: "Time",
        guests: "Guests",
        name: "Guest name",
        type: "Booking source",
        typeOnline: "Online (Website)",
        typePhone: "Phone Call",
        submit: "Confirm Reservation",
        quickPhone: "Add Quick Phone Reservation",
        scheduleTitle: "Today's Reservations",
        noBookings: "No bookings registered for today.",
        paxSuffix: "pax",
      },
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
        "Restaurant Solution",
        "Business website",
        "Online store",
        "Landing page",
        "Web application",
        "Redesign of an existing site",
        "Other",
      ],
      orcamentos: ["Up to €150", "€150 – €250", "€250 – €400", "More than €400"],
    },
  },

  de: {
    meta: {
      home: {
        title: "Webdesign in Cascais & Webseiten | Nova Web Studio",
        description:
          "Professionelles Webdesign in Cascais, Oeiras und Lissabon. Website-Erstellung, Onlineshops und Websites für Unternehmen zur Steigerung von Anfragen und Kunden.",
      },
      portfolio: {
        title: "Website-Portfolio | Nova Web Studio",
        description:
          "Projekte und Konzepte von Nova Web Studio für verschiedene Branchen – modernes Design, Klarheit und einfache Kontaktaufnahme.",
      },
      restaurantes: {
        title: "Restaurant-Management-Software | Nova Web Studio",
        description:
          "All-in-One Gastronomie- und Restaurant-Management-Software mit QR-Code-Bestellungen am Tisch, digitaler Speisekarte, Tischverwaltung und Online-Reservierungen.",
      },
      restaurantesDemo: {
        title: "Interaktive Restaurant-Demo | Nova Web Studio",
        description:
          "Testen Sie unsere digitale Restaurantlösung: QR-Code-Bestellungen, Live-Bestellverwaltung und Tischreservierungen.",
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
      restaurantes: "Restaurants",
      contact: "Kontakt",
      cta: "Termin vereinbaren",
      team: "Teambereich",
      tagline: "Eine modernere Website für Sie",
      language: "Sprache",
    },
    footer: { rights: "Portugal" },
    home: {
      chip: "Webdesigner & Website-Erstellung in Cascais",
      h1: "Professionelles Webdesign und Websites für Unternehmen",
      lead: "Wir erstellen und modernisieren Websites für Betriebe in Cascais, Oeiras, Sintra und Lissabon – optimiert für mobile Nutzung, schnelle Ladezeiten und mehr Kundenanfragen.",
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
          titulo: "Professionelle Website-Erstellung",
          texto:
            "Wir erstellen professionelle Websites von Grund auf, passgenau für Ihr Unternehmen und auf Kundenanfragen ausgerichtet.",
        },
        {
          titulo: "Redesign & Webentwicklung",
          texto:
            "Wir modernisieren bestehende Websites und verbessern Design, technische Struktur, Geschwindigkeit und mobile Nutzung.",
        },
        {
          titulo: "Suchmaschinenoptimierung (SEO)",
          texto:
            "Wir bereiten Ihren Webauftritt gezielt für Google vor und begleiten Ihre digitale Präsenz nachhaltig.",
        },
      ],
      typesTitle: "Arten von Websites",
      types: [
        {
          titulo: "Websites für Unternehmen",
          texto:
            "Präsentieren Sie Firma, Leistungen und Team mit einem professionellen, überzeugenden Auftritt.",
        },
        {
          titulo: "Onlineshop Erstellung",
          texto:
            "Verkaufen Sie Produkte über einen modernen, sicheren und benutzerfreundlichen Onlineshop.",
        },
        {
          titulo: "Conversion-Landingpages",
          texto:
            "Zielgerichtete Einzelseiten zur Bewerbung bestimmter Leistungen und Maximierung von Anfragen.",
        },
        {
          titulo: "Individuelle Webanwendungen",
          texto: "Maßgeschneiderte Webentwicklung, Kundenportale und passgenaue digitale Tools.",
        },
      ],
      processTitle: "So arbeiten wir",
      process: [
        {
          titulo: "Wir sprechen über Ihr Unternehmen",
          texto: "Wir verstehen, was Sie tun, was Sie brauchen und welche Ziele die Website hat.",
        },
        {
          titulo: "Wir senden ein Angebot",
          texto: "Sie erhalten ein klares Angebot mit Umfang, Zeitplan und Preis.",
        },
        {
          titulo: "Wir erstellen die Website",
          texto: "Wir entwickeln das Projekt und zeigen den Fortschritt vor der Veröffentlichung.",
        },
        {
          titulo: "Wir veröffentlichen und begleiten",
          texto: "Wir bringen die Website online und helfen bei den letzten Anpassungen.",
        },
      ],
      ctaTitle: "Möchten Sie Ihre Website erstellen oder modernisieren?",
      ctaText:
        "Sagen Sie uns, was Sie brauchen. Wir prüfen Ihre aktuelle Website oder entwickeln eine neue Lösung für Ihr Unternehmen.",
      ctaButton: "Kostenvoranschlag anfragen",
      finalTitle: "Sprechen Sie mit Nova Web Studio",
      finalText: "Wir erstellen Websites für Unternehmen in Cascais, Oeiras, Sintra und Lissabon.",
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
      othersLead: "Visuelle Studien, die verschiedene Ansätze und Branchen zeigen.",
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
          descricao: "Ein visuelles Erlebnis, das den Ort hervorhebt und Buchungen fördert.",
          preview: {
            eyebrow: "Ferienwohnung",
            headline: "Ein besonderer Aufenthalt",
            lines: ["Der Ort", "Lage", "Kontakt"],
          },
        },
        {
          titulo: "Website für eine Tischlerei",
          etiqueta: "Designkonzept",
          descricao: "Ein elegantes Portfolio für Arbeiten, Materialien und Maßanfertigungen.",
          preview: {
            eyebrow: "Tischlerei",
            headline: "Maßarbeit nach Wunsch",
            lines: ["Projekte", "Materialien", "Angebote"],
          },
        },
      ],
      ctaTitle: "Haben Sie ein Projekt im Kopf?",
      ctaText: "Sagen Sie uns, was Sie brauchen, und erhalten Sie ein unverbindliches Angebot.",
      ctaButton: "Kostenvoranschlag anfragen",
    },
    restaurantes: {
      heroChip: "Restaurant-Management-Software",
      heroTagline: "Nova Web Studio · Gastronomie & Restaurants",
      heroTitle: "Restaurant-Management-Software für die moderne Gastronomie.",
      heroSubtitle:
        "Eigene Website, digitale Speisekarte, QR-Code-Bestellungen am Tisch, Tischverwaltung und Online-Reservierungen in einer Lösung.",
      heroCtaDemo: "Live-Demo testen",
      heroCtaProposal: "Angebot anfragen",
      heroBadges: [
        "QR-Code-Bestellungen am Tisch",
        "Digitale Speisekarte für Restaurants",
        "Tischverwaltung & Online-Reservierungen",
      ],
      heroMockup: {
        live: "Live",
        activeTables: "Aktive Tische",
        todayOrders: "Bestellungen Heute",
        bookings: "Reservierungen",
        bookingsValue: "6 heute Abend",
        recentOrdersTitle: "Zuletzt Eingegangene Bestellungen",
        timeTitle: "Zeit",
        item1Name: "Rumpsteak + Douro Rotwein",
        item1Desc: "2 Artikel · Tisch 4",
        item1Status: "In Zubereitung",
        item2Name: "Kabeljau aus dem Ofen + Mineralwasser",
        item2Desc: "1 Artikel · Tisch 2",
        item2Status: "Eingegangen",
        menuDishes: "Hauptgerichte",
        menuDrinks: "Getränke",
        menuDesserts: "Desserts",
        dishName: "Rumpsteak",
        dishDesc: "Mit Rustikalen Kartoffeln",
        dishPrice: "18,00 €",
        addBtn: "+ Hinzufügen",
        callBtn: "Service",
        billBtn: "Rechnung",
      },
      modulesChip: "Modulare Präsentation",
      modulesTitle: "Entdecken Sie die Systemmodule",
      modulesLead:
        "Wählen Sie die verschiedenen Bereiche der Plattform und erfahren Sie, wie die Module den täglichen Ablauf in Ihrem Restaurant optimieren.",
      modulesCtaFull: "Vollständige interaktive Demo testen",
      modulesDemoLabel: "Interaktive Demonstrationsumgebung",
      moduleTabs: {
        overview: "Übersicht",
        bookings: "Reservierungen",
        tables: "Tische & Saal",
        kitchen: "Bestellungen & Küche",
        menu: "Digitale Speisekarte",
        guest: "QR-Gastansicht",
      },
      modulesData: {
        overview: {
          badge: "Executive Service-Dashboard",
          title: "Zentrale Schicht- und Gastraumübersicht in Echtzeit",
          desc: "Verfolgen Sie Sitzungsumsatz, aktive Bestellungen, Tischbelegung und Serviceanfragen auf einem übersichtlichen Bildschirm.",
          highlights: [
            "Live-Sitzungsumsatz in Echtzeit aktualisiert",
            "Wichtige Kennzahlen zu belegten Tischen und offenen Bons",
            "Kontinuierlicher Aktivitätsstream für Küche und Service",
          ],
        },
        bookings: {
          badge: "Zentraler Buchungskalender",
          title: "Online- und Telefonreservierungen in einem Kalender",
          desc: "Keine Doppelbelegungen mehr. Erfassen Sie Anfragen in Sekunden und behalten Sie den Gästeandrang für Mittag- und Abendschicht im Blick.",
          highlights: [
            "Automatische Erfassung von Buchungen über die eigene Website",
            "Schnelle Erfassung von Telefonreservierungen mit Tischzuweisung",
            "Chronologische Strukturierung nach Schichten und Personenanzahl",
          ],
        },
        tables: {
          badge: "Saalplan & Terrasse",
          title: "Visuelle Live-Statusanzeige aller Innen- und Außentische",
          desc: "Sehen Sie den Raumzustand auf einen Blick: freie Tische, Bestellungen in Zubereitung, Rechnungsanfragen und reservierte Tische.",
          highlights: [
            "Anschaulicher Plan für Gastraum und Außenterrasse",
            "Farbcodierte Zustände (frei, belegt, Rechnung erbeten, reserviert)",
            "Direkter Zugriff auf den aktuellen Bon und Gesamtbetrag pro Tisch",
          ],
        },
        kitchen: {
          badge: "Küchen-Display-System (KDS)",
          title: "Effizientes Bon-Management mit Kanban-Zubereitungsfluss",
          desc: "Die Küche empfängt Bestellungen chronologisch mit hervorgehobenen Sonderwünschen und schaltet Bons mit einem Klick weiter.",
          highlights: [
            "Strukturierte Spalten: Eingegangen, In Zubereitung, Fertig und Serviert",
            "Deutliche Kennzeichnung von Allergenen und Kundenhinweisen",
            "Echtzeit-Synchronisierung mit der Statusanzeige auf dem Gast-Smartphone",
          ],
        },
        menu: {
          badge: "Speisekarten-Management",
          title: "Digitale Karte mit sekundenschneller Ausverkauft-Steuerung",
          desc: "Aktualisieren Sie Speisen, Preise und markieren Sie vergriffene Artikel sofort, ohne neue Speisekarten drucken zu müssen.",
          highlights: [
            "Übersichtliche Gliederung in Vorspeisen, Hauptgerichte, Getränke und Desserts",
            "Schalter zum sofortigen Markieren ausverkaufter Gerichte",
            "Moderne Darstellung mit Preisen, Beschreibungen und Tags",
          ],
        },
        guest: {
          badge: "Gästeerlebnis am Tisch",
          title: "Direkte QR-Bestellung ohne App-Download für Ihre Gäste",
          desc: "Gäste scannen den Tisch-QR-Code, stöbern in der Fotokarte, senden Bestellungen ab, rufen die Bedienung oder fordern die Rechnung an.",
          highlights: [
            "Intuitive Navigation durch Kategorien mit Suche und Warenkorb",
            "Direkte Bestellübermittlung an die Küche mit Hinweisfeld",
            "Eigene Tasten für Service-Rufe und Rechnungsanfragen",
          ],
        },
      },
      modulesShowcase: {
        overview: {
          shiftTitle: "Abendschicht · Aktiv",
          shiftStatus: "Service Aktiv",
          revenueLabel: "Sitzungsumsatz",
          tablesLabel: "Belegte Tische",
          ordersLabel: "Aktive Bons",
          bookingsLabel: "Heutige Reservierungen",
          liveFeedTitle: "Live-Ereignis-Stream",
          liveFeedTime: "Letzte 15 Min.",
          event1: "Neue QR-Bestellung: 2 Hauptgerichte + 1 Getränk",
          event1Time: "Gerade eben",
          event2: "Gast bittet um die Rechnung am Tisch",
          event2Time: "Vor 3 Min.",
          event3: "Reservierung bestätigt: Dr. Beatriz (4 Gäste)",
          event3Time: "20:00 · T06",
        },
        bookings: {
          scheduleTitle: "Reservierungsübersicht",
          scheduleDate: "Aktuelle Schicht · Heute",
          confirmedBadge: "4 Bestätigte Reservierungen",
          onlineBadge: "Online",
          phoneBadge: "Telefon",
          paxLabel: "Personen",
          list: [
            { time: "19:30", name: "Gonçalo Ferreira", pax: 2, table: "Tisch 08", type: "online" },
            { time: "20:00", name: "Dr. Beatriz Santos", pax: 4, table: "Tisch 06", type: "phone" },
            { time: "20:30", name: "Mariana Silva", pax: 2, table: "Tisch 04", type: "online" },
            { time: "21:15", name: "Pedro Alvares", pax: 6, table: "Tisch 12", type: "online" },
          ],
        },
        tables: {
          floorTitle: "Gastraum- und Terrassenplan",
          monitoredBadge: "12 Überwachte Tische",
          legendFree: "Frei",
          legendOccupied: "Belegt",
          legendBill: "Rechnung",
          legendReserved: "Reserviert",
          statusFree: "Verfügbar",
          statusBill: "Rechnung erbeten",
          statusReserved: "Reserviert",
        },
        kitchen: {
          kdsTitle: "Küchen-Display-System (KDS)",
          kdsSubtitle: "Live-Zubereitungsablauf",
          activeCountBadge: "3 Aktive Bons",
          colNew: "Eingegangen",
          colPrep: "In Zubereitung (12 Min.)",
          ticket1Table: "Tisch 04 · BON-708",
          ticket1Items: ["1x Hausbrot mit Marinierten Oliven", "1x Kabeljau mit Maisbrotkruste"],
          ticket1Obs: "Hinweis: «Ohne Zwiebeln beim Kabeljau»",
          ticket1Action: "Zubereitung starten →",
          ticket2Table: "Tisch 07 · BON-102",
          ticket2Status: "In Zubereitung (12 Min.)",
          ticket2Items: ["1x Rumpsteak mit Rustikalen Kartoffeln", "1x Douro Reserva Rotwein"],
          ticket2Action: "Als fertig markieren ✓",
        },
        menu: {
          menuTitle: "Speisekarten- und Bestandsverwaltung",
          menuSubtitle: "Echtzeit-Verfügbarkeitssteuerung",
          testHint: "Klicken zum Umschalten",
          catStarters: "Vorspeisen",
          catMains: "Hauptgerichte",
          catDesserts: "Desserts",
          toggleAvailable: "Verfügbar (Pausieren)",
          toggleSoldOut: "Ausverkauft (Aktivieren)",
        },
        guest: {
          tableLabel: "Tisch 04",
          callBtn: "Service",
          billBtn: "Rechnung",
          dishName: "Kabeljau aus dem Ofen",
          dishDesc: "Mit Maisbrotkruste",
          dishCategory: "Hauptgericht",
          dishPrice: "16,50 €",
          sendOrderBtn: "Bestellung senden",
          itemsCountLabel: "Artikel",
        },
      },
      problemChip: "Herausforderungen im Service",
      problemTitle: "Weniger Stress im Gastraum und Service",
      problemLead:
        "Verstreute Reservierungen, veraltete Speisekarten und unübersichtliche Bestellungen belasten den Service. Unsere Plattform bündelt die wichtigsten Funktionen in einem integrierten System.",
      problemList: [
        {
          title: "Verstreute Reservierungen",
          text: "Verpasste Anrufe, Zettelwirtschaft und Nachrichten auf verschiedenen Kanälen erschweren die Tischorganisation.",
        },
        {
          title: "Veraltete Karten",
          text: "Preisänderungen oder ausverkaufte Gerichte auf gedruckten Karten führen zu Missverständnissen.",
        },
        {
          title: "Bestellchaos",
          text: "Mehrere Tische bestellen gleichzeitig auf handschriftlichen Bons – das erhöht Fehlerquellen in der Küche.",
        },
        {
          title: "Überlastetes Personal",
          text: "Gäste warten bei Stoßzeiten darauf, zu bestellen, die Bedienung zu rufen oder zu bezahlen.",
        },
      ],
      problemNoTechTitle: "Ohne technische Hürden",
      problemNoTechText:
        "Keine teure Spezialhardware oder aufwendige Mitarbeiterschulungen nötig. Das System funktioniert direkt auf den Smartphones Ihrer Gäste und auf vorhandenen Tablets oder Bildschirmen.",
      featuresChip: "Funktionen",
      featuresTitle: "Alles, was Ihr Restaurant für den Alltag braucht",
      featuresLead:
        "Praktische Funktionen für Gäste am Tisch und das Team im Service – ohne überflüssige Komplexität.",
      featuresCta: "Alles in der Demo ansehen",
      featureList: [
        {
          title: "Eigene Website & Webpräsenz für Restaurants",
          text: "Ein professioneller Webauftritt mit Logo, Speisekarte, Fotos, Öffnungszeiten, Standort und Kontaktmöglichkeiten.",
        },
        {
          title: "Digitale Speisekarte für Restaurants in Echtzeit",
          text: "Gerichte, Preise, Beschreibungen und Verfügbarkeiten in Echtzeit aktualisieren – ganz ohne Nachdruck von Papierkarten.",
        },
        {
          title: "QR-Code-Bestellungen am Tisch",
          text: "Jeder Tisch hat einen eigenen QR-Code. Gäste wählen Gerichte und bestellen direkt per Smartphone ohne Wartezeiten.",
        },
        {
          title: "Online-Tischreservierung & Telefonannahme",
          text: "Reservierungen über die Website annehmen und telefonische Anfragen in einem zentralen Kalender übersichtlich erfassen.",
        },
        {
          title: "Gastronomie-Kassensystem & Küchenmonitor (KDS)",
          text: "Übersichtlicher Kanban-Workflow für die Küche vom Bestelleingang bis zur Ausgabe an den Gast.",
        },
        {
          title: "Tischverwaltung & Raumplan in Echtzeit",
          text: "Interaktiver Tischplan für Innenbereich und Terrasse mit Farbanzeige: frei, belegt oder Rechnung erbeten.",
        },
        {
          title: "Service rufen & Rechnung per Smartphone",
          text: "Gäste können direkt über das Handy nach der Bedienung fragen oder um die Rechnung bitten.",
        },
        {
          title: "Schichtberichte & Betriebsübersicht",
          text: "Echtzeit-Überblick über Schichtumsatz, Durchlaufzeiten und durchschnittliche Tischauslastung.",
        },
      ],
      processChip: "Ablauf",
      howWorksTitle: "So funktioniert es in der Praxis",
      howWorksLead: "Ein einfacher, reibungsloser Ablauf für Gast und Team.",
      howWorksFlow: [
        "Gast scannt den QR-Code am Tisch mit dem Smartphone",
        "Öffnet die Speisekarte mit Fotos und aktuellen Preisen",
        "Wählt die gewünschten Gerichte aus und sendet die Bestellung",
        "Das Restaurant empfängt den Auftrag im Verwaltungspanel",
        "Das Team bereitet die Speisen zu und serviert am richtigen Tisch",
      ],
      processIntegratedTitle: "Integrierter Reservierungsablauf:",
      processIntegratedText:
        "Gäste buchen online über Ihre Website oder rufen an. Ihr Team verwaltet alle Reservierungen in einem zentralen, synchronisierten Kalender.",
      processIntegratedCta: "Mehr erfahren →",
      demoTitle: "System testen",
      demoLead:
        "Erleben Sie die mobile Gästeansicht und entdecken Sie die Funktionen der Plattform in unserer Live-Demo.",
      demoButton: "Live-Demo öffnen",
      customChip: "Passend für Ihren Betrieb",
      customTitle: "Individuell auf Ihren Betrieb abgestimmt",
      customLead:
        "Nova Web Studio passt Website, Menüstruktur, Tische und Design perfekt an die Atmosphäre Ihres Restaurants, Cafés oder Bars an.",
      customBadges: [
        "Farben, Logo und Typografie abgestimmt auf Ihr Lokal",
        "Komplette Einrichtung von Kategorien, Gerichten und Preisen",
        "Druckfertige QR-Codes und Tischaufsteller im passenden Design",
        "Persönliche Betreuung und Support durch Nova Web Studio",
      ],
      customProfiles: [
        {
          title: "Traditionelle Restaurants & Weinlokale",
          desc: "Klare Tageskarten, Weinauswahl und strukturierte Reservierungen für Mittag- und Abendschichten.",
        },
        {
          title: "Bistros, Cafés & Brunch-Lokale",
          desc: "Dynamische Fotokarten, schnelle Ausverkauft-Kennzeichnung und direkte Tischbestellungen ohne Anstehen.",
        },
        {
          title: "Bars, Lounges & Außenterrassen",
          desc: "Service-Rufe und Rechnungsanfragen per Smartphone zur Entlastung des Personals auf großen Flächen.",
        },
        {
          title: "Gastronomie mit hohem Reservierungsvolumen",
          desc: "Zentrale Verwaltung von Online- und Telefonbuchungen in einem geteilten Teamkalender.",
        },
      ],
      finalChip: "Nächster Schritt",
      finalTitle: "Bereit, Ihr Restaurant zu modernisieren?",
      finalLead:
        "Kontaktieren Sie uns, um mehr zu erfahren und ein passgenaues Angebot zu erhalten.",
      finalCtaProposal: "Angebot anfragen",
      finalCtaDemo: "Live-Demo testen",
    },
    restaurantesDemo: {
      chip: "Interaktive Demo",
      title: "Erleben Sie unsere Restaurantlösung",
      subtitle: "Entdecken Sie, wie das System aus Sicht Ihrer Gäste und Ihres Teams funktioniert.",
      notice: "Kommerzielle Simulation · Keine echten Daten",
      reset: "Demo zurücksetzen",
      back: "Zurück zur Übersicht",
      ctaProposal: "Angebot anfragen",
      splitView: "Geteilte Ansicht",
      singleView: "Einzelansicht",
      logoTagline: "Offizielle Demo",
      toasts: {
        addedToCart: "zur Bestellung hinzugefügt",
        statusUpdated: "Status aktualisiert",
        availabilityUpdated: "Verfügbarkeit in Echtzeit aktualisiert.",
        bookingSuccess: "Reservierung erfolgreich im Kalender eingetragen!",
        quickPhoneSuccess: "Telefonreservierung schnell hinzugefügt!",
        resetSuccess: "Demo auf Anfangsbeispieldaten zurückgesetzt.",
      },
      tabOverview: "Übersicht",
      tabBookings: "Reservierungen",
      tabTables: "Tische & Saal",
      tabKitchen: "Bestellungen & Küche",
      tabMenu: "Digitale Speisekarte",
      tabGuest: "QR-Gastansicht",
      overview: {
        title: "Betriebliche Schichtübersicht",
        subtitle: "Zentrales Live-Monitoring für die aktuelle Schicht im NOVA Restaurante.",
        shiftRevenue: "Sitzungsumsatz",
        activeTables: "Aktive Tische",
        activeOrders: "Laufende Bestellungen",
        todayBookings: "Reservierungen heute",
        recentActivity: "Live-Ereignis-Stream",
        realtimeBadge: "Echtzeit",
        occupancyTitle: "Saalbelegungsquote",
        viewTables: "Tische ansehen",
        viewKitchen: "Küche ansehen",
        avgPrepTime: "Ø Zubereitungszeit",
        servicePace: "Servicetempo: Normal",
        orderPrefix: "Neue QR-Bestellung:",
        bookingPrefix: "Reservierung:",
        paxLabel: "Pers.",
      },
      tables: {
        title: "Tisch- und Saalplan",
        subtitle: "Visuelle Live-Statusanzeige aller Tische im Innen- und Außenbereich.",
        zoneMain: "Hauptsaal",
        zoneTerrace: "Außenterrasse",
        statusFree: "Frei",
        statusOccupied: "Belegt",
        statusBill: "Rechnung erbeten",
        statusReserved: "Reserviert",
        selectedTitle: "Tischdetails",
        noActiveOrder: "Tisch ist frei. Zurzeit keine aktiven Bestellungen.",
        capacity: "Kapazität",
        orderTotal: "Bon-Gesamtsumme",
        tableLabel: "Tisch",
        activeTicketLabel: "Aktiver Bon",
        scheduledBookingLabel: "Geplante Reservierung:",
        paxSuffix: "Pers.",
      },
      menu: {
        title: "Speisekarte & Verfügbarkeit",
        subtitle: "Aktivieren oder pausieren Sie Gerichte, um die Gästeansicht zu testen.",
        filterAll: "Alle Kategorien",
        statusAvailable: "Verfügbar",
        statusSoldOut: "Ausverkauft",
        toggleAvailable: "Als verfügbar setzen",
        toggleSoldOut: "Als ausverkauft markieren",
        itemsCount: "Gerichte & Getränke auf der Karte",
        addDish: "Speisekartenartikel",
      },
      guest: {
        restaurantName: "NOVA Restaurante",
        table: "Tisch 04",
        categories: {
          all: "Alle",
          starters: "Vorspeisen",
          mains: "Hauptgerichte",
          drinks: "Getränke",
          desserts: "Desserts",
        },
        addToCart: "Hinzufügen",
        soldOut: "Ausverkauft",
        notesPlaceholder: "Besondere Wünsche oder Allergien?",
        cartTitle: "Ihre Bestellung",
        cartEmpty: "Warenkorb ist leer. Wählen Sie Gerichte aus der Karte.",
        subtotal: "Zwischensumme",
        total: "Gesamt",
        sendOrder: "Bestellung an Küche senden",
        orderSentTitle: "Bestellung erfolgreich gesendet!",
        orderSentSubtitle: "Ihre Bestellung ist in der Küche eingegangen und wird zubereitet.",
        callWaiter: "Service rufen",
        callWaiterSuccess: "Service gerufen. Eine Servicekraft kommt gleich zu Ihnen!",
        requestBill: "Rechnung anfordern",
        requestBillSuccess: "Rechnung angefordert. Eine Servicekraft bringt sie an den Tisch.",
        newOrder: "Weitere Bestellung aufgeben",
        prepStep1: "1. Eingegangen",
        prepStep2: "2. In Zubereitung",
        prepStep2Desc: "Die Küche bereitet Ihre Speisen frisch zu.",
        prepStep3: "3. Fertig",
        prepStep3Desc: "Eine Servicekraft bringt die Speisen an Ihren Tisch.",
        summaryTitle: "Übersicht:",
        itemSelectedSingular: "Artikel ausgewählt",
        itemSelectedPlural: "Artikel ausgewählt",
      },
      panel: {
        title: "Gastraum- & Küchenverwaltung",
        subtitleKds: "Kitchen Display System (KDS)",
        activeTables: "Aktive Tische",
        todayOrders: "Sitzungsbestellungen",
        alertsTitle: "Service-Rufe & Rechnungsanfragen",
        noAlerts: "Keine offenen Serviceanfragen.",
        dismissAlert: "Erledigt",
        statusNew: "Eingegangen",
        statusPrep: "In Zubereitung",
        statusReady: "Fertig",
        statusDelivered: "Serviert",
        startPrep: "Zubereitung starten",
        markReady: "Als fertig markieren",
        markDelivered: "Als serviert markieren",
        noOrders: "Keine Bestellungen in dieser Spalte.",
        itemsCount: "Artikel",
        activeCountSuffix: "Aktive Bons",
      },
      bookings: {
        title: "Reservierungsplan",
        subtitle: "Online- und Telefonreservierungen in einem zentralen Zeitplan vereint.",
        formTitle: "Tisch reservieren",
        date: "Datum",
        time: "Uhrzeit",
        guests: "Personen",
        name: "Gastname",
        type: "Reservierungsart",
        typeOnline: "Online (Website)",
        typePhone: "Telefonanruf",
        submit: "Reservierung bestätigen",
        quickPhone: "Schnell-Telefonreservierung hinzufügen",
        scheduleTitle: "Heutige Reservierungen",
        noBookings: "Keine Reservierungen für heute eingetragen.",
        paxSuffix: "Pers.",
      },
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
      errorSend: "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
      success: "Anfrage gesendet. Wir melden uns in Kürze.",
      tipos: [
        "Restaurantlösung",
        "Unternehmenswebsite",
        "Onlineshop",
        "Landingpage",
        "Webanwendung",
        "Redesign einer bestehenden Website",
        "Sonstiges",
      ],
      orcamentos: ["Bis 150 €", "150 € – 250 €", "250 € – 400 €", "Mehr als 400 €"],
    },
  },

  fr: {
    meta: {
      home: {
        title: "Création de Sites Web à Cascais | Nova Web Studio",
        description:
          "Création de sites internet et web design à Cascais, Oeiras et Lisbonne. Sites pour entreprises, refonte et boutiques en ligne conçus pour générer des contacts.",
      },
      portfolio: {
        title: "Portfolio de Sites Web | Nova Web Studio",
        description:
          "Découvrez les projets et concepts réalisés par Nova Web Studio pour différents secteurs : design moderne, clarté et contact facile.",
      },
      restaurantes: {
        title: "Logiciel de Gestion pour Restaurant | Nova Web Studio",
        description:
          "Logiciel complet de gestion pour restaurant : commande par QR Code à table, menu digital, gestion des tables et réservations en ligne. Testez la démo en direct.",
      },
      restaurantesDemo: {
        title: "Démo Interactive pour Restaurants | Nova Web Studio",
        description:
          "Testez notre solution digitale pour restaurants : commandes par QR code, gestion en direct et réservations.",
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
      restaurantes: "Restaurants",
      contact: "Contact",
      cta: "Prendre rendez-vous",
      team: "Espace équipe",
      tagline: "Un site plus moderne pour vous",
      language: "Langue",
    },
    footer: { rights: "Portugal" },
    home: {
      chip: "Web Designer & Création de Sites à Cascais",
      h1: "Création de sites internet et web design pour entreprises",
      lead: "Création et refonte de sites web professionnels à Cascais, Oeiras, Sintra et Lisbonne. Design moderne, performance mobile et génération de contacts qualifiés.",
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
          titulo: "Création de sites internet",
          texto:
            "Nous concevons des sites web professionnels sur mesure, pensés pour valoriser votre entreprise et attirer des prospects.",
        },
        {
          titulo: "Refonte & développement web",
          texto:
            "Modernisation de sites existants : design actualisé, architecture technique optimisée, rapidité et fluidité mobile.",
        },
        {
          titulo: "Référencement naturel (SEO)",
          texto:
            "Optimisation de votre site pour les moteurs de recherche et accompagnement régulier de votre visibilité.",
        },
      ],
      typesTitle: "Types de sites web",
      types: [
        {
          titulo: "Sites pour entreprises",
          texto:
            "Présentation soignée et institutionnelle de votre entreprise, vos prestations et vos coordonnées.",
        },
        {
          titulo: "Création de boutiques en ligne",
          texto:
            "Vendez vos produits sur internet avec un site e-commerce moderne, sécurisé et pensé pour convertir.",
        },
        {
          titulo: "Landing pages de conversion",
          texto:
            "Pages ciblées sur une offre spécifique pour maximiser les demandes de devis et prises de contact.",
        },
        {
          titulo: "Applications web sur mesure",
          texto:
            "Développement web personnalisé, espaces clients réservés et plateformes digitales.",
        },
      ],
      processTitle: "Notre méthode",
      process: [
        {
          titulo: "Nous parlons de votre activité",
          texto: "Nous comprenons ce que vous faites, vos besoins et les objectifs du site.",
        },
        {
          titulo: "Nous envoyons une proposition",
          texto: "Vous recevez une proposition claire avec le périmètre, le délai et le prix.",
        },
        {
          titulo: "Nous créons le site",
          texto: "Nous développons le projet et montrons son évolution avant la mise en ligne.",
        },
        {
          titulo: "Nous publions et accompagnons",
          texto: "Nous mettons le site en ligne et aidons pour les derniers ajustements.",
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
      othersLead: "Explorations visuelles créées pour illustrer différentes approches et secteurs.",
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
      ctaText: "Dites-nous ce dont vous avez besoin et recevez une proposition sans engagement.",
      ctaButton: "Demander un devis",
    },
    restaurantes: {
      heroChip: "Logiciel de Gestion pour Restaurant",
      heroTagline: "Nova Web Studio · Solutions Restauration",
      heroTitle: "Le logiciel de gestion pour restaurant complet et intuitif.",
      heroSubtitle:
        "Site web dédié, menu digital pour restaurant, gestion des tables, réservations en ligne et commandes par QR Code à table.",
      heroCtaDemo: "Tester la démo",
      heroCtaProposal: "Demander un devis",
      heroBadges: [
        "Commande par QR Code à table",
        "Menu digital pour restaurant",
        "Gestion des tables & réservations",
      ],
      heroMockup: {
        live: "En direct",
        activeTables: "Tables Actives",
        todayOrders: "Commandes Aujourd'hui",
        bookings: "Réservations",
        bookingsValue: "6 ce soir",
        recentOrdersTitle: "Dernières Commandes Reçues",
        timeTitle: "Temps",
        item1Name: "Faux-filet grillé + Vin Rouge Douro",
        item1Desc: "2 articles · Table 4",
        item1Status: "En préparation",
        item2Name: "Morue au four + Eau minérale",
        item2Desc: "1 article · Table 2",
        item2Status: "Reçue",
        menuDishes: "Plats",
        menuDrinks: "Boissons",
        menuDesserts: "Desserts",
        dishName: "Faux-filet grillé",
        dishDesc: "Avec pommes de terre",
        dishPrice: "18,00 €",
        addBtn: "+ Ajouter",
        callBtn: "Serveur",
        billBtn: "Addition",
      },
      modulesChip: "Présentation Modulaire",
      modulesTitle: "Explorez les modules du système",
      modulesLead:
        "Sélectionnez les différents espaces de la plateforme et découvrez comment chaque module optimise le service de votre restaurant.",
      modulesCtaFull: "Tester la démonstration complète",
      modulesDemoLabel: "Environnement de Démonstration Interactif",
      moduleTabs: {
        overview: "Vue d'ensemble",
        bookings: "Réservations",
        tables: "Plan de salle & Tables",
        kitchen: "Commandes & Cuisine",
        menu: "Menu Digital",
        guest: "Client QR",
      },
      modulesData: {
        overview: {
          badge: "Tableau de Bord Exécutif",
          title: "Supervision centrale en direct du service et de la salle",
          desc: "Suivez le chiffre d'affaires du service, les commandes en cours, l'occupation des tables et les alertes d'assistance sur un écran unique.",
          highlights: [
            "Chiffre d'affaires de la séance actualisé en direct",
            "Indicateurs clés sur les tables occupées et commandes actives",
            "Fil d'activité continu retraçant les événements de la salle et de la cuisine",
          ],
        },
        bookings: {
          badge: "Planning Centralisé",
          title: "Réservations en ligne et téléphoniques réunies en un seul planning",
          desc: "Évitez les doublons et les notes éparpillées. Enregistrez les réservations en quelques secondes et anticipez le flux de clients.",
          highlights: [
            "Réception automatique des demandes envoyées depuis votre site web",
            "Enregistrement rapide des appels téléphoniques avec attribution de table",
            "Organisation chronologique structurée par service du midi et du soir",
          ],
        },
        tables: {
          badge: "Plan de Salle & Terrasse",
          title: "Visualisation dynamique en direct de l'état de chaque table",
          desc: "Consultez l'état de la salle d'un coup d'œil : tables libres, commandes en cours, demandes d'addition et tables réservées.",
          highlights: [
            "Plan visuel clair pour la salle intérieure et la terrasse extérieure",
            "Code couleur distinct (libre, occupée, addition demandée, réservée)",
            "Accès instantané au ticket de commande et au total par table",
          ],
        },
        kitchen: {
          badge: "Kitchen Display System (KDS)",
          title: "Gestion fluide des bons avec suivi visuel Kanban en cuisine",
          desc: "La cuisine reçoit les commandes par ordre d'arrivée avec les remarques mises en valeur et change de statut d'un simple geste.",
          highlights: [
            "Colonnes structurées : Reçues, En préparation, Prêtes et Servies",
            "Mise en évidence des consignes spéciales et allergies alimentaires",
            "Synchronisation immédiate avec l'écran de suivi sur le smartphone du client",
          ],
        },
        menu: {
          badge: "Gestion de la Carte",
          title: "Carte digitale avec contrôle instantané des ruptures",
          desc: "Mettez à jour vos plats, tarifs et désactivez les produits épuisés sans jamais devoir réimprimer de cartes physiques.",
          highlights: [
            "Organisation claire par entrées, plats, boissons et desserts",
            "Bouton pour marquer les plats épuisés en un clic et en direct",
            "Présentation soignée avec prix, descriptions détaillées et labels",
          ],
        },
        guest: {
          badge: "Expérience Client à Table",
          title: "Commande directe par QR Code sans téléchargement d'application",
          desc: "Vos clients scannent le QR code de table, découvrent la carte illustrée, commandent, appellent un serveur ou demandent l'addition.",
          highlights: [
            "Navigation fluide par catégories avec recherche et panier",
            "Transmission directe de la commande en cuisine avec champ d'instructions",
            "Boutons dédiés pour appeler le serveur ou réclamer l'addition",
          ],
        },
      },
      modulesShowcase: {
        overview: {
          shiftTitle: "Service du Soir · En cours",
          shiftStatus: "Service Actif",
          revenueLabel: "Chiffre d'affaires",
          tablesLabel: "Tables Occupées",
          ordersLabel: "Commandes Actives",
          bookingsLabel: "Réservations Aujourd'hui",
          liveFeedTitle: "Fil d'Événements en Direct",
          liveFeedTime: "15 dernières min.",
          event1: "Nouvelle commande QR : 2 plats + 1 boisson",
          event1Time: "À l'instant",
          event2: "Le client a demandé l'addition à table",
          event2Time: "Il y a 3 min",
          event3: "Réservation confirmée : Dr. Beatriz (4 personnes)",
          event3Time: "20:00 · T06",
        },
        bookings: {
          scheduleTitle: "Planning des Réservations",
          scheduleDate: "Service Actuel · Aujourd'hui",
          confirmedBadge: "4 Réservations Confirmées",
          onlineBadge: "En ligne",
          phoneBadge: "Téléphone",
          paxLabel: "couverts",
          list: [
            { time: "19:30", name: "Gonçalo Ferreira", pax: 2, table: "Table 08", type: "online" },
            { time: "20:00", name: "Dr. Beatriz Santos", pax: 4, table: "Table 06", type: "phone" },
            { time: "20:30", name: "Mariana Silva", pax: 2, table: "Table 04", type: "online" },
            { time: "21:15", name: "Pedro Alvares", pax: 6, table: "Table 12", type: "online" },
          ],
        },
        tables: {
          floorTitle: "Plan de Salle & Terrasse",
          monitoredBadge: "12 Tables Supervisées",
          legendFree: "Libre",
          legendOccupied: "Occupée",
          legendBill: "Addition",
          legendReserved: "Réservée",
          statusFree: "Disponible",
          statusBill: "Addition Demandée",
          statusReserved: "Réservée",
        },
        kitchen: {
          kdsTitle: "Kitchen Display Screen (KDS)",
          kdsSubtitle: "Flux de Préparation en Cuisine",
          activeCountBadge: "3 Bons Actifs",
          colNew: "Reçue",
          colPrep: "En préparation (12 min)",
          ticket1Table: "Table 04 · BON-708",
          ticket1Items: [
            "1x Pain artisanal & Olives marinées",
            "1x Morue au four avec croûte de maïs",
          ],
          ticket1Obs: "Obs: «Sans oignons dans la morue»",
          ticket1Action: "Lancer préparation →",
          ticket2Table: "Table 07 · BON-102",
          ticket2Status: "En préparation (12 min)",
          ticket2Items: ["1x Faux-filet avec pommes de terre", "1x Vin Rouge Réserve Douro"],
          ticket2Action: "Marquer comme prête ✓",
        },
        menu: {
          menuTitle: "Gestion de la Carte & Stocks",
          menuSubtitle: "Contrôle des Disponibilités en Temps Réel",
          testHint: "Cliquez pour tester",
          catStarters: "Entrées",
          catMains: "Plats",
          catDesserts: "Desserts",
          toggleAvailable: "Disponible (Désactiver)",
          toggleSoldOut: "Épuisé (Activer)",
        },
        guest: {
          tableLabel: "Table 04",
          callBtn: "Serveur",
          billBtn: "Addition",
          dishName: "Morue au four",
          dishDesc: "Avec croûte de maïs",
          dishCategory: "Plat",
          dishPrice: "16,50 €",
          sendOrderBtn: "Valider la Commande",
          itemsCountLabel: "articles",
        },
      },
      problemChip: "Les défis du service",
      problemTitle: "Moins de complications en salle et au service",
      problemLead:
        "Réservations dispersées, menus non actualisés et commandes difficiles à suivre alourdissent le service. Notre solution rassemble les opérations clés dans un système simple et intégré.",
      problemList: [
        {
          title: "Réservations dispersées",
          text: "Appels manqués, notes papier et messages éparpillés compliquent la gestion des tables.",
        },
        {
          title: "Menus dépassés",
          text: "Changements de prix ou plats épuisés sur cartes papier causent des pertes de temps.",
        },
        {
          title: "Commandes désorganisées",
          text: "Plusieurs tables commandant simultanément augmentent le risque d'erreur en cuisine.",
        },
        {
          title: "Équipe surchargée",
          text: "Clients en attente pour commander, appeler un serveur ou demander l'addition aux heures d'affluence.",
        },
      ],
      problemNoTechTitle: "Sans complexité technique",
      problemNoTechText:
        "Aucun équipement lourd ni formation complexe requis. Le système fonctionne directement sur le smartphone des clients et sur vos tablettes ou écrans existants.",
      featuresChip: "Fonctionnalités",
      featuresTitle: "Tout ce dont votre restaurant a besoin au quotidien",
      featuresLead:
        "Des outils conçus pour les clients à table et l'équipe en salle, sans complexité superflue.",
      featuresCta: "Tout voir dans la démo",
      featureList: [
        {
          title: "Site internet personnalisé pour restaurant",
          text: "Une présence en ligne professionnelle avec identité visuelle, carte, photos, horaires et localisation.",
        },
        {
          title: "Menu digital pour restaurant modifiable en direct",
          text: "Mettez à jour vos plats, tarifs et ruptures en temps réel sans réimprimer vos cartes papier.",
        },
        {
          title: "Commande par QR Code à table",
          text: "Chaque table dispose d'un QR code dédié. Les clients consultent le menu et commandent directement depuis leur smartphone.",
        },
        {
          title: "Réservations en ligne restaurant et téléphone",
          text: "Recevez les réservations web et saisissez les demandes téléphoniques sur un calendrier unifié.",
        },
        {
          title: "Système de gestion restaurant & écran cuisine (KDS)",
          text: "Suivi visuel des bons de commande sous forme de tableau Kanban, de la préparation au service en salle.",
        },
        {
          title: "Gestion des tables et de la salle en direct",
          text: "Plan de salle interactif avec statuts colorés : tables libres, occupées, en attente ou demande d'addition.",
        },
        {
          title: "Appel serveur & demande d'addition sur smartphone",
          text: "Les clients peuvent solliciter un serveur ou demander l'addition directement via leur navigateur.",
        },
        {
          title: "Rapports de service & suivi d'activité",
          text: "Consultez le chiffre d'affaires cumulé, le rythme du service et le taux d'occupation moyen des tables.",
        },
      ],
      processChip: "Processus",
      howWorksTitle: "Comment ça fonctionne en pratique",
      howWorksLead: "Un parcours simple et fluide pour le client comme pour l'équipe.",
      howWorksFlow: [
        "Le client scanne le QR Code sur sa table avec son téléphone",
        "Il consulte le menu digital avec photos et tarifs à jour",
        "Il sélectionne ses plats et valide sa commande en direct",
        "Le restaurant reçoit instantanément la commande sur son tableau de bord",
        "L'équipe prépare les plats et les sert à la bonne table",
      ],
      processIntegratedTitle: "Flux de Réservations Intégré :",
      processIntegratedText:
        "Vos clients réservent en ligne via le site ou contactent votre équipe par téléphone. Toutes les réservations sont centralisées dans un calendrier partagé.",
      processIntegratedCta: "En savoir plus →",
      demoTitle: "Essayez le système",
      demoLead:
        "Découvrez l'expérience client sur mobile et explorez les fonctionnalités sur notre environnement de démonstration.",
      demoButton: "Ouvrir la démo",
      customChip: "Adapté à votre établissement",
      customTitle: "Adapté à l'identité de votre établissement",
      customLead:
        "Nova Web Studio personnalise le site, la carte, les tables et le design pour s'adapter à votre restaurant, café ou bar.",
      customBadges: [
        "Couleurs, typographie et identité alignées sur votre restaurant",
        "Configuration complète des catégories, plats, options et prix",
        "Génération et design de QR codes prêts à imprimer",
        "Accompagnement et support technique par Nova Web Studio",
      ],
      customProfiles: [
        {
          title: "Restaurants Traditionnels & Bars à Vin",
          desc: "Cartes du jour claires, sélection de vins et réservations structurées pour le service du midi et du soir.",
        },
        {
          title: "Bistrots, Cafés & Brunchs",
          desc: "Carte illustrée dynamique, gestion rapide des ruptures et commandes directes à table sans file d'attente.",
        },
        {
          title: "Bars, Lounges & Terrasses",
          desc: "Appels serveur et demandes d'addition sur mobile pour fluidifier le service sur de grands espaces.",
        },
        {
          title: "Établissements à Fort Volume de Réservations",
          desc: "Centralisation des réservations web et téléphoniques dans un calendrier d'équipe synchronisé.",
        },
      ],
      finalChip: "Étape suivante",
      finalTitle: "Prêt à moderniser votre restaurant ?",
      finalLead:
        "Contactez-nous pour découvrir la solution et recevoir une proposition adaptée à votre établissement.",
      finalCtaProposal: "Demander un devis",
      finalCtaDemo: "Tester la démo",
    },
    restaurantesDemo: {
      chip: "Démo Interactive",
      title: "Découvrez notre solution pour restaurants",
      subtitle:
        "Découvrez le fonctionnement du système du point de vue de vos clients et de votre équipe.",
      notice: "Simulation commerciale · Aucune donnée réelle",
      reset: "Réinitialiser la démo",
      back: "Retour à la présentation",
      ctaProposal: "Demander un devis",
      splitView: "Vue divisée",
      singleView: "Vue individuelle",
      logoTagline: "Démo Officielle",
      toasts: {
        addedToCart: "ajouté à la commande",
        statusUpdated: "Statut mis à jour",
        availabilityUpdated: "Disponibilité mise à jour en temps réel.",
        bookingSuccess: "Réservation enregistrée dans le planning avec succès !",
        quickPhoneSuccess: "Réservation téléphonique rapide enregistrée !",
        resetSuccess: "Démo réinitialisée avec les données de test initiales.",
      },
      tabOverview: "Vue d'ensemble",
      tabBookings: "Réservations",
      tabTables: "Plan de salle & Tables",
      tabKitchen: "Commandes & Cuisine",
      tabMenu: "Menu Digital",
      tabGuest: "Client QR",
      overview: {
        title: "Synthèse Opérationnelle du Service",
        subtitle: "Supervision centrale en temps réel de la séance chez NOVA Restaurante.",
        shiftRevenue: "Chiffre d'affaires du Service",
        activeTables: "Tables Actives",
        activeOrders: "Commandes en Cours",
        todayBookings: "Réservations Aujourd'hui",
        recentActivity: "Fil d'Activité en Direct",
        realtimeBadge: "Temps Réel",
        occupancyTitle: "Taux d'Occupation de la Salle",
        viewTables: "Voir les tables",
        viewKitchen: "Voir la cuisine",
        avgPrepTime: "Temps moyen de préparation",
        servicePace: "Rythme de service : Normal",
        orderPrefix: "Nouvelle commande QR :",
        bookingPrefix: "Réservation :",
        paxLabel: "couv.",
      },
      tables: {
        title: "Plan de Salle & Tables",
        subtitle: "Statut visuel en temps réel des tables en salle principale et en terrasse.",
        zoneMain: "Salle Principale",
        zoneTerrace: "Terrasse Extérieure",
        statusFree: "Libre",
        statusOccupied: "Occupée",
        statusBill: "Addition Demandée",
        statusReserved: "Réservée",
        selectedTitle: "Détail de la Table",
        noActiveOrder: "Table libre. Aucune commande active pour le moment.",
        capacity: "Capacité",
        orderTotal: "Total du Ticket",
        tableLabel: "Table",
        activeTicketLabel: "Ticket actif",
        scheduledBookingLabel: "Réservation prévue :",
        paxSuffix: "couv.",
      },
      menu: {
        title: "Menu Digital & Disponibilités",
        subtitle: "Activez ou marquez des plats comme épuisés pour tester la vue client.",
        filterAll: "Toutes les catégories",
        statusAvailable: "Disponible",
        statusSoldOut: "Épuisé",
        toggleAvailable: "Marquer disponible",
        toggleSoldOut: "Marquer épuisé",
        itemsCount: "plats et boissons à la carte",
        addDish: "Article du Menu",
      },
      guest: {
        restaurantName: "NOVA Restaurante",
        table: "Table 04",
        categories: {
          all: "Tous",
          starters: "Entrées",
          mains: "Plats",
          drinks: "Boissons",
          desserts: "Desserts",
        },
        addToCart: "Ajouter",
        soldOut: "Épuisé",
        notesPlaceholder: "Des préférences ou allergies ?",
        cartTitle: "Votre commande",
        cartEmpty: "Votre panier est vide. Choisissez des plats sur la carte.",
        subtotal: "Sous-total",
        total: "Total",
        sendOrder: "Envoyer la commande en cuisine",
        orderSentTitle: "Commande envoyée avec succès !",
        orderSentSubtitle: "Votre commande a été reçue en cuisine et est en cours de préparation.",
        callWaiter: "Appeler le serveur",
        callWaiterSuccess: "Serveur appelé à votre table. On arrive !",
        requestBill: "Demander l'addition",
        requestBillSuccess: "Addition demandée. Le serveur arrive à votre table.",
        newOrder: "Passer une autre commande",
        prepStep1: "1. Reçue",
        prepStep2: "2. En préparation",
        prepStep2Desc: "La cuisine prépare vos plats fraîchement.",
        prepStep3: "3. Prête",
        prepStep3Desc: "Un serveur apporte les plats à votre table.",
        summaryTitle: "Récapitulatif :",
        itemSelectedSingular: "article sélectionné",
        itemSelectedPlural: "articles sélectionnés",
      },
      panel: {
        title: "Gestion Salle & Cuisine",
        subtitleKds: "Kitchen Display System (KDS)",
        activeTables: "Tables Actives",
        todayOrders: "Commandes du Service",
        alertsTitle: "Appels Serveur & Demandes d'Addition",
        noAlerts: "Aucune demande d'assistance en attente.",
        dismissAlert: "Terminer",
        statusNew: "Reçues",
        statusPrep: "En préparation",
        statusReady: "Prêtes",
        statusDelivered: "Servies",
        startPrep: "Lancer préparation",
        markReady: "Marquer comme prête",
        markDelivered: "Marquer comme servie",
        noOrders: "Aucune commande dans cette colonne.",
        itemsCount: "articles",
        activeCountSuffix: "Bons Actifs",
      },
      bookings: {
        title: "Planning des Réservations",
        subtitle: "Réservations en ligne et téléphoniques réunies dans un planning central.",
        formTitle: "Réserver une Table",
        date: "Date",
        time: "Heure",
        guests: "Couverts",
        name: "Nom du client",
        type: "Canal de réservation",
        typeOnline: "En ligne (Site Web)",
        typePhone: "Appel Téléphonique",
        submit: "Confirmer la Réservation",
        quickPhone: "Ajouter Réservation Téléphonique Rapide",
        scheduleTitle: "Réservations d'Aujourd'hui",
        noBookings: "Aucune réservation enregistrée pour aujourd'hui.",
        paxSuffix: "couv.",
      },
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
        "Solution pour Restaurants",
        "Site vitrine",
        "Boutique en ligne",
        "Landing page",
        "Application web",
        "Refonte d'un site existant",
        "Autre",
      ],
      orcamentos: ["Jusqu'à 150 €", "150 € – 250 €", "250 € – 400 €", "Plus de 400 €"],
    },
  },

  es: {
    meta: {
      home: {
        title: "Diseño Web en Cascais & Páginas | Nova Web Studio",
        description:
          "Creación de páginas web y diseño web en Cascais, Oeiras y Lisboa. Sitios web para empresas, tiendas online y rediseño profesional para captar más clientes.",
      },
      portfolio: {
        title: "Portafolio de Sitios Web | Nova Web Studio",
        description:
          "Proyectos y conceptos desarrollados por Nova Web Studio para distintos sectores, con diseño moderno, claridad y contacto sencillo.",
      },
      restaurantes: {
        title: "Software de Gestión para Restaurantes | Nova Web Studio",
        description:
          "Software de gestión para restaurantes con pedidos por código QR, carta digital interactiva, gestión de mesas y reservas online. Prueba la demo en directo.",
      },
      restaurantesDemo: {
        title: "Demostración Interactiva para Restaurantes | Nova Web Studio",
        description:
          "Prueba nuestra solución digital para restaurantes: pedidos por código QR, gestión en directo y reservas.",
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
      restaurantes: "Restaurantes",
      contact: "Contacto",
      cta: "Agendar reunión",
      team: "Área de equipo",
      tagline: "Una web más moderna para ti",
      language: "Idioma",
    },
    footer: { rights: "Portugal" },
    home: {
      chip: "Diseñador Web & Creación de Páginas en Cascais",
      h1: "Diseño web profesional y creación de páginas para empresas",
      lead: "Creamos y modernizamos páginas web para empresas en Cascais, Oeiras, Sintra y Lisboa. Diseño moderno, adaptado a móviles y optimizado para captar clientes.",
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
          titulo: "Creación de sitios web",
          texto:
            "Desarrollamos páginas web profesionales desde cero, adaptadas a tu negocio y preparadas para captar contactos.",
        },
        {
          titulo: "Rediseño y desarrollo web",
          texto:
            "Actualizamos webs antiguas mejorando su diseño, estructura técnica, velocidad y usabilidad móvil.",
        },
        {
          titulo: "Posicionamiento SEO local",
          texto:
            "Preparamos tu sitio web para buscadores y acompañamos tu presencia digital de forma continua.",
        },
      ],
      typesTitle: "Tipos de webs",
      types: [
        {
          titulo: "Páginas web para empresas",
          texto:
            "Presenta tu empresa, servicios y equipo con una imagen sólida, profesional y de confianza.",
        },
        {
          titulo: "Creación de tiendas online",
          texto:
            "Vende productos por internet mediante una tienda online moderna, segura y optimizada para compras.",
        },
        {
          titulo: "Landing pages de conversión",
          texto:
            "Páginas enfocadas en un servicio específico para maximizar solicitudes de presupuesto.",
        },
        {
          titulo: "Aplicaciones web a medida",
          texto:
            "Desarrollo web a medida, áreas de clientes y herramientas digitales personalizadas.",
        },
      ],
      processTitle: "Cómo trabajamos",
      process: [
        {
          titulo: "Hablamos sobre el negocio",
          texto: "Entendemos qué haces, qué necesitas y cuáles son los objetivos de la web.",
        },
        {
          titulo: "Enviamos una propuesta",
          texto: "Recibes una propuesta clara con el trabajo, el plazo y el precio.",
        },
        {
          titulo: "Creamos la web",
          texto: "Desarrollamos el proyecto y mostramos su evolución antes de publicarlo.",
        },
        {
          titulo: "Publicamos y acompañamos",
          texto: "Ponemos la web online y ayudamos con los últimos ajustes necesarios.",
        },
      ],
      ctaTitle: "¿Necesitas crear o modernizar la web de tu negocio?",
      ctaText:
        "Cuéntanos qué necesitas. Podemos analizar la web actual o preparar una solución desde cero adaptada a tu negocio.",
      ctaButton: "Pedir presupuesto",
      finalTitle: "Habla con Nova Web Studio",
      finalText: "Creamos webs para negocios en Cascais, Oeiras, Sintra y Lisboa.",
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
      othersLead: "Exploraciones visuales creadas para mostrar distintos enfoques y sectores.",
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
    restaurantes: {
      heroChip: "Software de Gestión para Restaurantes",
      heroTagline: "Nova Web Studio · Sector de Restauración",
      heroTitle: "Software de gestión para restaurantes. Todo en un solo lugar.",
      heroSubtitle:
        "Página web propia, carta digital interactiva, gestión de mesas, reservas online y pedidos por código QR en mesa.",
      heroCtaDemo: "Probar demostración",
      heroCtaProposal: "Pedir propuesta",
      heroBadges: [
        "Pedidos por código QR en mesa",
        "Carta digital para restaurantes",
        "Gestión de mesas y reservas online",
      ],
      heroMockup: {
        live: "En directo",
        activeTables: "Mesas Activas",
        todayOrders: "Comandas Hoy",
        bookings: "Reservas",
        bookingsValue: "6 esta noche",
        recentOrdersTitle: "Últimas Comandas Recibidas",
        timeTitle: "Hora",
        item1Name: "Solomillo de Ternera + Vino Tinto Douro",
        item1Desc: "2 artículos · Mesa 4",
        item1Status: "En preparación",
        item2Name: "Bacalao al Horno + Agua Mineral",
        item2Desc: "1 artículo · Mesa 2",
        item2Status: "Recibida",
        menuDishes: "Platos",
        menuDrinks: "Bebidas",
        menuDesserts: "Postres",
        dishName: "Solomillo de Ternera",
        dishDesc: "Con patatas rústicas",
        dishPrice: "18,00 €",
        addBtn: "+ Añadir",
        callBtn: "Camarero",
        billBtn: "Cuenta",
      },
      modulesChip: "Presentación Modular",
      modulesTitle: "Explora los módulos del sistema",
      modulesLead:
        "Selecciona las diferentes áreas de la plataforma y descubre cómo cada módulo simplifica la operativa diaria de tu restaurante.",
      modulesCtaFull: "Probar demostración completa",
      modulesDemoLabel: "Entorno de Demostración Interactivo",
      moduleTabs: {
        overview: "Visión General",
        bookings: "Reservas",
        tables: "Sala y Mesas",
        kitchen: "Pedidos y Cocina",
        menu: "Menú Digital",
        guest: "Cliente QR",
      },
      modulesData: {
        overview: {
          badge: "Panel Ejecutivo del Servicio",
          title: "Supervisión central en tiempo real del turno y de la sala",
          desc: "Sigue la facturación de la sesión, comandas en curso, ocupación de mesas y avisos de asistencia en una sola pantalla panorámica.",
          highlights: [
            "Facturación acumulada del turno actualizada en directo",
            "Métricas clave de mesas ocupadas y pedidos activos",
            "Flujo de actividad continuo con las incidencias de sala y cocina",
          ],
        },
        bookings: {
          badge: "Agenda y Calendario Unificado",
          title: "Reservas online y telefónicas integradas en un solo calendario",
          desc: "Elimina duplicidades y notas dispersas. Anota reservas en segundos y anticipa el flujo de comensales esperado para cada turno.",
          highlights: [
            "Recepción automática de reservas enviadas desde tu sitio web",
            "Anotación rápida de llamadas telefónicas con asignación de mesa",
            "Estructura cronológica organizada por turnos de comida y cena",
          ],
        },
        tables: {
          badge: "Plano de Sala y Terraza",
          title: "Gestión visual en directo del estado de cada mesa",
          desc: "Visualiza el estado de la sala al instante: mesas libres, comandas en preparación, cuentas solicitadas y mesas reservadas.",
          highlights: [
            "Diseño visual claro de mesas en sala interior y terraza",
            "Códigos de color (libre, ocupada, cuenta pedida o reservada)",
            "Acceso inmediato al ticket activo y al gasto acumulado por mesa",
          ],
        },
        kitchen: {
          badge: "Kitchen Display System (KDS)",
          title: "Gestión ágil de comandas con flujo Kanban de cocina",
          desc: "La cocina recibe los pedidos en orden de llegada con observaciones destacadas y avanza los estados con un solo toque.",
          highlights: [
            "Columnas estructuradas: Recibidas, En preparación, Listas y Servidas",
            "Destacado de notas especiales, puntos de cocción y alergias",
            "Sincronización inmediata con el seguimiento en el móvil del cliente",
          ],
        },
        menu: {
          badge: "Gestión de Carta Digital",
          title: "Catálogo digital con control instantáneo de platos agotados",
          desc: "Actualiza platos, precios y desactiva artículos agotados con efecto inmediato en el móvil de los comensales sin reimprimir cartas.",
          highlights: [
            "Organización limpia por entrantes, principales, bebidas y postres",
            "Botón para marcar productos agotados en tiempo real",
            "Presentación cuidada con precios, descripciones y etiquetas",
          ],
        },
        guest: {
          badge: "Experiencia en Mesa",
          title: "Pedidos directos por código QR sin descargas de aplicaciones",
          desc: "Los clientes escanean el QR de su mesa, consultan la carta con fotos, personalizan su comanda, llaman al camarero o piden la cuenta.",
          highlights: [
            "Navegación intuitiva por categorías con buscador y carrito",
            "Envío directo de la comanda a cocina con campo de observaciones",
            "Botones directos para llamar al camarero o solicitar la cuenta",
          ],
        },
      },
      modulesShowcase: {
        overview: {
          shiftTitle: "Turno de Cena · En curso",
          shiftStatus: "Servicio Activo",
          revenueLabel: "Facturación Turno",
          tablesLabel: "Mesas Ocupadas",
          ordersLabel: "Comandas Activas",
          bookingsLabel: "Reservas Hoy",
          liveFeedTitle: "Incidencias en Directo",
          liveFeedTime: "Últimos 15 min",
          event1: "Nueva comanda QR: 2 principales + 1 bebida",
          event1Time: "Ahora mismo",
          event2: "El cliente ha solicitado la cuenta en mesa",
          event2Time: "Hace 3 min",
          event3: "Reserva confirmada: Dra. Beatriz (4 comensales)",
          event3Time: "20:00 · M06",
        },
        bookings: {
          scheduleTitle: "Agenda de Reservas",
          scheduleDate: "Turno Actual · Hoy",
          confirmedBadge: "4 Reservas Confirmadas",
          onlineBadge: "Online",
          phoneBadge: "Teléfono",
          paxLabel: "comensales",
          list: [
            { time: "19:30", name: "Gonçalo Ferreira", pax: 2, table: "Mesa 08", type: "online" },
            { time: "20:00", name: "Dra. Beatriz Santos", pax: 4, table: "Mesa 06", type: "phone" },
            { time: "20:30", name: "Mariana Silva", pax: 2, table: "Mesa 04", type: "online" },
            { time: "21:15", name: "Pedro Alvares", pax: 6, table: "Mesa 12", type: "online" },
          ],
        },
        tables: {
          floorTitle: "Plano de Sala y Terraza",
          monitoredBadge: "12 Mesas Monitorizadas",
          legendFree: "Libre",
          legendOccupied: "Ocupada",
          legendBill: "Cuenta",
          legendReserved: "Reservada",
          statusFree: "Disponible",
          statusBill: "Cuenta Pedida",
          statusReserved: "Reservada",
        },
        kitchen: {
          kdsTitle: "Kitchen Display Screen (KDS)",
          kdsSubtitle: "Flujo de Preparación en Cocina",
          activeCountBadge: "3 Comandas Activas",
          colNew: "Recibida",
          colPrep: "En preparación (12 min)",
          ticket1Table: "Mesa 04 · COM-708",
          ticket1Items: ["1x Pan artesano con aceitunas", "1x Bacalao al horno con costra de maíz"],
          ticket1Obs: "Obs: «Sin cebolla en el bacalao»",
          ticket1Action: "Iniciar preparación →",
          ticket2Table: "Mesa 07 · COM-102",
          ticket2Status: "En preparación (12 min)",
          ticket2Items: ["1x Solomillo con patatas rústicas", "1x Vino Tinto Reserva Douro"],
          ticket2Action: "Marcar como lista ✓",
        },
        menu: {
          menuTitle: "Gestión de Carta y Existencias",
          menuSubtitle: "Control de Disponibilidad en Tiempo Real",
          testHint: "Haz clic para probar",
          catStarters: "Entrantes",
          catMains: "Principales",
          catDesserts: "Postres",
          toggleAvailable: "Disponible (Pausar)",
          toggleSoldOut: "Agotado (Activar)",
        },
        guest: {
          tableLabel: "Mesa 04",
          callBtn: "Camarero",
          billBtn: "Cuenta",
          dishName: "Bacalao al Horno",
          dishDesc: "Con costra de maíz",
          dishCategory: "Plato",
          dishPrice: "16,50 €",
          sendOrderBtn: "Enviar Comanda",
          itemsCountLabel: "artículos",
        },
      },
      problemChip: "El reto del servicio",
      problemTitle: "Menos complicaciones en sala y atención",
      problemLead:
        "Reservas dispersas, menús desactualizados y comandas difíciles de organizar sobrecargan el servicio. Nuestra plataforma reúne las operaciones esenciales en un sistema integrado.",
      problemList: [
        {
          title: "Reservas dispersas",
          text: "Llamadas perdidas, notas en papel y mensajes por múltiples vías dificultan la gestión de las mesas.",
        },
        {
          title: "Menús desactualizados",
          text: "Cambios de precio o platos agotados en cartas impresas generan fricción con los comensales.",
        },
        {
          title: "Gestión de pedidos compleja",
          text: "Varias mesas pidiendo a la vez con notas a mano aumentan los errores en cocina.",
        },
        {
          title: "Servicio sobrecargado",
          text: "Clientes esperando para pedir, llamar al camarero o pedir la cuenta en momentos de alta afluencia.",
        },
      ],
      problemNoTechTitle: "Sin complicaciones técnicas",
      problemNoTechText:
        "Sin necesidad de equipos caros ni instalaciones complejas. La solución funciona directamente en el móvil de los clientes y en las tablets o pantallas que ya utilizas.",
      featuresChip: "Funcionalidades",
      featuresTitle: "Todo lo que tu restaurante necesita en el día a día",
      featuresLead:
        "Herramientas diseñadas para el cliente en la mesa y el equipo en la operativa, sin complicaciones innecesarias.",
      featuresCta: "Ver todo en la demo",
      featureList: [
        {
          title: "Página web para restaurantes y presencia digital",
          text: "Una presencia web profesional con identidad, carta, fotografías, horarios y mapa de ubicación.",
        },
        {
          title: "Carta digital para restaurantes actualizable en directo",
          text: "Actualiza platos, precios y productos agotados en tiempo real sin reimprimir cartas de papel.",
        },
        {
          title: "Pedidos por código QR en mesa",
          text: "Cada mesa cuenta con su código QR. Los comensales consultan la carta y piden directamente desde el móvil sin esperas.",
        },
        {
          title: "Reservas online para restaurantes y teléfono",
          text: "Recibe reservas desde la web y anota llamadas telefónicas en un único calendario centralizado.",
        },
        {
          title: "Programa para restaurantes y pantalla de cocina (KDS)",
          text: "Gestión ágil de comandas con panel Kanban desde la preparación hasta el servicio en mesa.",
        },
        {
          title: "Gestión de mesas y sala en tiempo real",
          text: "Plano interactivo con estados visuales por color: libres, ocupadas, con alerta o solicitando la cuenta.",
        },
        {
          title: "Llamada a camarero y cuenta desde el móvil",
          text: "El cliente puede solicitar asistencia o pedir la factura cómodamente desde el navegador de su teléfono.",
        },
        {
          title: "Informes de servicio y control de turno",
          text: "Seguimiento de facturación de la sesión, ritmo del servicio y nivel medio de ocupación de sala.",
        },
      ],
      processChip: "Proceso",
      howWorksTitle: "Cómo funciona en la práctica",
      howWorksLead: "Un flujo claro y natural para clientes y equipo.",
      howWorksFlow: [
        "El cliente escanea el código QR de su mesa con el móvil",
        "Consulta la carta digital con fotos y precios actualizados",
        "Selecciona los platos y envía su pedido directamente",
        "El restaurante recibe la comanda en el panel de gestión",
        "El equipo prepara y entrega el pedido en la mesa indicada",
      ],
      processIntegratedTitle: "Flujo de Reservas Integrado:",
      processIntegratedText:
        "Tus clientes reservan online desde la web o llaman por teléfono. Tu equipo gestiona todas las reservas en un único calendario centralizado.",
      processIntegratedCta: "Saber más →",
      demoTitle: "Prueba el sistema",
      demoLead:
        "Explora la experiencia del comensal en el móvil y conoce las funciones de la plataforma en nuestro entorno de demostración.",
      demoButton: "Abrir demostración",
      customChip: "A la medida de tu negocio",
      customTitle: "Adaptado a la identidad de tu espacio",
      customLead:
        "Nova Web Studio adapta el sitio web, la carta, las mesas y el estilo visual a las necesidades de tu restaurante, cafetería o bar.",
      customBadges: [
        "Colores, logotipo y tipografía alineados con tu restaurante",
        "Configuración completa de categorías, platos, opciones y precios",
        "Generación y diseño de códigos QR listos para imprimir",
        "Acompañamiento y soporte técnico de Nova Web Studio",
      ],
      customProfiles: [
        {
          title: "Restaurantes Tradicionales y Casas de Comidas",
          desc: "Menú del día claro, selección de vinos y reservas organizadas para turnos de comida y cena.",
        },
        {
          title: "Bistrós, Cafeterías y Brunch",
          desc: "Carta visual interactiva, control rápido de existencias y pedidos directos en mesa sin colas.",
        },
        {
          title: "Bares, Lounges y Terrazas",
          desc: "Avisos al camarero y solicitudes de cuenta desde el móvil para agilizar el servicio en zonas amplias.",
        },
        {
          title: "Locales con Gran Volumen de Reservas",
          desc: "Centralización de reservas web y telefónicas en un calendario de equipo sincronizado.",
        },
      ],
      finalChip: "Siguiente paso",
      finalTitle: "¿Listo para modernizar tu restaurante?",
      finalLead:
        "Contacta con nosotros para conocer la solución en detalle y recibir una propuesta adaptada a tu negocio.",
      finalCtaProposal: "Pedir propuesta",
      finalCtaDemo: "Probar demostración",
    },
    restaurantesDemo: {
      chip: "Demostración Interactiva",
      title: "Prueba nuestra solución para restaurantes",
      subtitle:
        "Descubre cómo funciona el sistema desde la perspectiva de tus clientes y tu equipo.",
      notice: "Simulación comercial interactiva · Sin datos reales",
      reset: "Reiniciar demo",
      back: "Volver a la página",
      ctaProposal: "Pedir propuesta",
      splitView: "Vista dividida",
      singleView: "Vista individual",
      logoTagline: "Demostración Oficial",
      toasts: {
        addedToCart: "añadido a la comanda",
        statusUpdated: "Estado actualizado",
        availabilityUpdated: "Disponibilidad actualizada en tiempo real.",
        bookingSuccess: "¡Reserva registrada en la agenda con éxito!",
        quickPhoneSuccess: "¡Reserva telefónica rápida añadida!",
        resetSuccess: "Demostración reiniciada con datos de prueba iniciales.",
      },
      tabOverview: "Visión General",
      tabBookings: "Reservas",
      tabTables: "Sala y Mesas",
      tabKitchen: "Pedidos y Cocina",
      tabMenu: "Menú Digital",
      tabGuest: "Cliente QR",
      overview: {
        title: "Resumen Operativo del Turno",
        subtitle: "Supervisión central en directo para el turno actual de NOVA Restaurante.",
        shiftRevenue: "Facturación del Turno",
        activeTables: "Mesas Activas",
        activeOrders: "Comandas en Curso",
        todayBookings: "Reservas de Hoy",
        recentActivity: "Flujo de Actividad en Directo",
        realtimeBadge: "Tiempo Real",
        occupancyTitle: "Tasa de Ocupación de Sala",
        viewTables: "Ver mesas",
        viewKitchen: "Ver cocina",
        avgPrepTime: "Tiempo medio de preparación",
        servicePace: "Ritmo de servicio: Normal",
        orderPrefix: "Nueva comanda QR:",
        bookingPrefix: "Reserva:",
        paxLabel: "comens.",
      },
      tables: {
        title: "Plano de Sala y Mesas",
        subtitle: "Estado visual en tiempo real de las mesas en sala interior y terraza.",
        zoneMain: "Sala Principal",
        zoneTerrace: "Terraza",
        statusFree: "Libre",
        statusOccupied: "Ocupada",
        statusBill: "Cuenta Pedida",
        statusReserved: "Reservada",
        selectedTitle: "Detalle de la Mesa",
        noActiveOrder: "Mesa libre. No hay comandas activas en este momento.",
        capacity: "Capacidad",
        orderTotal: "Total de la Comanda",
        tableLabel: "Mesa",
        activeTicketLabel: "Comanda activa",
        scheduledBookingLabel: "Reserva prevista:",
        paxSuffix: "comens.",
      },
      menu: {
        title: "Carta Digital y Disponibilidad",
        subtitle: "Activa o marca platos como agotados para probar la vista del cliente.",
        filterAll: "Todas las categorías",
        statusAvailable: "Disponible",
        statusSoldOut: "Agotado",
        toggleAvailable: "Marcar Disponible",
        toggleSoldOut: "Marcar Agotado",
        itemsCount: "platos y bebidas en la carta",
        addDish: "Artículo de la Carta",
      },
      guest: {
        restaurantName: "NOVA Restaurante",
        table: "Mesa 04",
        categories: {
          all: "Todos",
          starters: "Entrantes",
          mains: "Principales",
          drinks: "Bebidas",
          desserts: "Postres",
        },
        addToCart: "Añadir",
        soldOut: "Agotado",
        notesPlaceholder: "¿Alguna indicación o alergia?",
        cartTitle: "Tu pedido",
        cartEmpty: "El carrito está vacío. Elige platos de la carta.",
        subtotal: "Subtotal",
        total: "Total",
        sendOrder: "Enviar pedido a cocina",
        orderSentTitle: "¡Pedido enviado con éxito!",
        orderSentSubtitle: "Tu pedido ha sido recibido en cocina y se está preparando.",
        callWaiter: "Llamar al camarero",
        callWaiterSuccess: "Camarero avisado. ¡Enseguida nos acercamos a la mesa!",
        requestBill: "Pedir la cuenta",
        requestBillSuccess: "Cuenta solicitada. El camarero la llevará a la mesa.",
        newOrder: "Hacer otro pedido",
        prepStep1: "1. Recibida",
        prepStep2: "2. En preparación",
        prepStep2Desc: "La cocina está preparando tus platos.",
        prepStep3: "3. Lista",
        prepStep3Desc: "El camarero lleva la comanda a tu mesa.",
        summaryTitle: "Resumen:",
        itemSelectedSingular: "artículo seleccionado",
        itemSelectedPlural: "artículos seleccionados",
      },
      panel: {
        title: "Gestión de Sala y Cocina",
        subtitleKds: "Kitchen Display System (KDS)",
        activeTables: "Mesas Activas",
        todayOrders: "Comandas del Servicio",
        alertsTitle: "Avisos de Camarero y Cuentas",
        noAlerts: "Sin solicitudes de asistencia pendientes.",
        dismissAlert: "Completar",
        statusNew: "Recibidas",
        statusPrep: "En preparación",
        statusReady: "Listas",
        statusDelivered: "Servidas",
        startPrep: "Iniciar preparación",
        markReady: "Marcar como lista",
        markDelivered: "Marcar como servida",
        noOrders: "No hay pedidos en esta columna.",
        itemsCount: "artículos",
        activeCountSuffix: "Comandas Activas",
      },
      bookings: {
        title: "Agenda de Reservas",
        subtitle: "Reservas recibidas por la web y anotadas por teléfono en un calendario central.",
        formTitle: "Registrar Reserva",
        date: "Fecha",
        time: "Hora",
        guests: "Comensales",
        name: "Nombre ficticio",
        type: "Origen de reserva",
        typeOnline: "Online (Sitio Web)",
        typePhone: "Llamada Telefónica",
        submit: "Confirmar Reserva",
        quickPhone: "Añadir Reserva Telefónica Rápida",
        scheduleTitle: "Reservas de Hoy",
        noBookings: "No hay reservas registradas para hoy.",
        paxSuffix: "comens.",
      },
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
        "Solución para Restaurantes",
        "Web corporativa",
        "Tienda online",
        "Landing page",
        "Aplicación web",
        "Rediseño de web existente",
        "Otro",
      ],
      orcamentos: ["Hasta 150 €", "150 € – 250 €", "250 € – 400 €", "Más de 400 €"],
    },
  },
};

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "pt";

  const langs = navigator.languages?.length ? navigator.languages : [navigator.language ?? "pt"];

  for (const raw of langs) {
    const code = raw.slice(0, 2).toLowerCase();

    if ((LOCALES as readonly string[]).includes(code)) {
      return code as Locale;
    }
  }

  return "pt";
}
