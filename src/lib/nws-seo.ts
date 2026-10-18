/** Metadados da NWS para páginas públicas com URL próprio. */
const SITE_ORIGIN = "https://www.novawebstudio.pt";

export const NWS_PROJECT_META = {
  "vinilart": {
    title: "VinilArt | Website e Identidade Digital | Nova Web Studio",
    description: "Conhece o projeto VinilArt desenvolvido pela Nova Web Studio: apresentação da marca, serviços e portefólio num website personalizado.",
  },
  "vinilart-sport": {
    title: "VinilArt Sport | Loja Online Personalizada | Nova Web Studio",
    description: "Descobre o website VinilArt Sport, com loja online e personalização de artigos desportivos, desenvolvido pela Nova Web Studio.",
  },
  "gespool": {
    title: "GESPOOL | Website de Serviços | Nova Web Studio",
    description: "Conhece o website GESPOOL para apresentar serviços de piscinas, trabalhos realizados e facilitar o contacto com novos clientes.",
  },
  "31-janeiro": {
    title: "31 de Janeiro de Manique de Baixo | Nova Web Studio",
    description: "Projeto de website para a coletividade 31 de Janeiro de Manique de Baixo, com informação e atividades para a comunidade.",
  },
  "radio-alcabideche": {
    title: "Rádio AlcabidecheFM | Projeto Digital | Nova Web Studio",
    description: "Conhece o projeto digital Rádio AlcabidecheFM no portefólio da Nova Web Studio.",
  },
} as const;

type PageSeo = {
  path: string;
  title: string;
  description: string;
};

export function buildStandaloneSeoHead({ path, title, description }: PageSeo) {
  const url = `${SITE_ORIGIN}${path}`;
  const image = `${SITE_ORIGIN}/logo.png`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:locale", content: "pt_PT" },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": url + "#webpage",
        url,
        name: title,
        description,
        inLanguage: "pt-PT",
        isPartOf: { "@id": SITE_ORIGIN + "/#website" },
        publisher: { "@id": SITE_ORIGIN + "/#organization" },
      }),
    }],
  };
}
