import { canonicalFor, dict, SITE_URL, type Locale } from "@/lib/i18n";

export function localBusinessSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",

    name: "Nova Web Studio",

    url: canonicalFor(locale, "home"),

    logo: `${SITE_URL}/logo.png`,

    image: `${SITE_URL}/logo.png`,

    email: "geral@novawebstudio.pt",

    telephone: "+351937642061",

    description: dict[locale].meta.home.description,

    areaServed: [
      { "@type": "City", name: "Cascais" },
      { "@type": "City", name: "Oeiras" },
      { "@type": "City", name: "Sintra" },
      { "@type": "City", name: "Lisboa" },
    ],

    makesOffer: dict[locale].home.types.map((t) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: t.titulo,
      },
    })),
  };
}
