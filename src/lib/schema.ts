import { canonicalFor, dict, HTML_LANG, SITE_URL, type Locale } from "@/lib/i18n";

export function localBusinessSchema(locale: Locale) {
  const url = canonicalFor(locale, "home");
  const isPt = locale === "pt";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "ProfessionalService"],
        "@id": `${SITE_URL}/#organization`,
        name: "Nova Web Studio",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        image: `${SITE_URL}/logo.png`,
        email: "geral@novawebstudio.pt",
        telephone: "+351937642061",
        sameAs: [
          "https://www.instagram.com/novawebstudio.pt/",
          "https://www.facebook.com/novawebstudio.pt",
          "https://www.linkedin.com/company/novawebstudiopt",
        ],
        description: dict[locale].meta.home.description,
        ...(isPt ? { areaServed: { "@type": "Country", name: "Portugal" } } : {}),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: isPt
            ? "Serviços de Criação de Sites e Web Design"
            : "Web Design and Development Services",
          itemListElement: dict[locale].home.types.map((t) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: t.titulo,
              description: t.texto,
            },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Nova Web Studio",
        inLanguage: HTML_LANG[locale],
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: dict[locale].meta.home.title,
        description: dict[locale].meta.home.description,
        inLanguage: HTML_LANG[locale],
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
      },
    ],
  };
}
