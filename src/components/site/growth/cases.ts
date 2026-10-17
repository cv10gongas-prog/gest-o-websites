export type CaseStudy = {
  slug: string;
  name: string;
  category: string;
  domain: string;
  link: string;
  image: string;
  imageAlt: string;
  visualIsLogo?: boolean;
  context: string;
  challenge: string;
  solution: string;
  features: string[];
  result: string;
};

/** Only confirmed, public projects. No fabricated testimonials, traffic or revenue numbers. */
export const REAL_CASES: CaseStudy[] = [
  {
    slug: "vinilart",
    name: "VinilArt",
    category: "Comércio e comunicação visual",
    domain: "vinilart.pt",
    link: "https://vinilart.pt",
    image: "/vinilart-preview.webp",
    imageAlt: "Captura da página inicial do website VinilArt",
    context: "Uma marca dedicada à comunicação visual, impressão e personalização.",
    challenge: "Organizar a oferta de produtos e serviços num website fácil de explorar e com uma imagem coerente com a marca.",
    solution: "Desenvolvimento de uma presença digital própria, com páginas dedicadas, apresentação de produtos e caminhos claros para o contacto e encomenda.",
    features: ["Apresentação de produtos e serviços", "Experiência adaptada a diferentes ecrãs", "Percurso de contacto e encomenda"],
    result: "Website publicado, com apresentação dos serviços e produtos da marca num espaço próprio.",
  },
  {
    slug: "vinilart-sport",
    name: "VinilArt Sport",
    category: "Desporto e personalização",
    domain: "sport.vinilart.pt",
    link: "https://sport.vinilart.pt",
    image: "/vinilart-sport-preview.webp",
    imageAlt: "Captura da página inicial do website VinilArt Sport",
    context: "Uma vertente da VinilArt dedicada a produtos e personalização desportiva.",
    challenge: "Apresentar o catálogo desportivo e tornar mais compreensível a escolha e personalização de artigos.",
    solution: "Criação de uma experiência digital própria para a marca Sport, com catálogo e ferramentas de personalização de produtos.",
    features: ["Catálogo de produtos desportivos", "Experiência de personalização", "Identidade visual adaptada à área desportiva"],
    result: "Projeto acessível ao público, com catálogo e apresentação de soluções de personalização.",
  },
  {
    slug: "gespool",
    name: "GESPOOL",
    category: "Piscinas e serviços técnicos",
    domain: "gespool.pt",
    link: "https://gespool.pt",
    image: "/gespool.png",
    imageAlt: "Identidade gráfica da GESPOOL",
    visualIsLogo: true,
    context: "Empresa dedicada ao setor das piscinas.",
    challenge: "Apresentar os serviços e os trabalhos realizados de forma organizada, clara e fácil de atualizar.",
    solution: "Construção de um website com secções de serviços e portefólio de obras, preparado para gestão de conteúdos.",
    features: ["Serviços organizados", "Portefólio por projeto", "Estrutura para atualizar conteúdos"],
    result: "Estrutura web pensada para dar visibilidade aos serviços e organizar a apresentação de obras.",
  },
  {
    slug: "31-janeiro",
    name: "GMD 31 de Janeiro",
    category: "Coletividades e comunidade",
    domain: "31janeiromanique.net",
    link: "https://31janeiromanique.net",
    image: "/gmd-manique.png",
    imageAlt: "Logótipo do Grupo Musical e Desportivo 31 de Janeiro",
    visualIsLogo: true,
    context: "Coletividade de Manique de Baixo, com atividades e ligação à comunidade local.",
    challenge: "Tornar a informação institucional mais fácil de encontrar e apresentar as atividades com uma identidade digital atualizada.",
    solution: "Website institucional responsivo com conteúdos organizados e espaços para divulgar a vida da coletividade.",
    features: ["Informação institucional", "Estrutura de atividades e notícias", "Navegação adaptada a telemóveis"],
    result: "Presença online acessível através do website da coletividade.",
  },
  {
    slug: "alcabidechefm",
    name: "Rádio AlcabidecheFM",
    category: "Rádio e comunicação local",
    domain: "radioalcabidechefm.eu",
    link: "https://radioalcabidechefm.eu",
    image: "/radio-alcabidechefm.png",
    imageAlt: "Identidade gráfica da Rádio AlcabidecheFM",
    visualIsLogo: true,
    context: "Projeto de rádio local ligado à comunidade de Alcabideche.",
    challenge: "Reunir num mesmo espaço a apresentação da rádio e a informação relevante para ouvintes e visitantes.",
    solution: "Website concebido para a identidade da rádio, dando prioridade à clareza e ao acesso à informação.",
    features: ["Identidade da rádio", "Informações e contactos organizados", "Apresentação responsiva"],
    result: "Website público disponível para a comunidade e os ouvintes.",
  },
];

export function findRealCase(slug: string): CaseStudy | undefined {
  return REAL_CASES.find((item) => item.slug === slug);
}
