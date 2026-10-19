/**
 * NWS Lead Finder — pesquisa manual em dados abertos OpenStreetMap.
 *
 * Conversão e importação de dados comunitários OpenStreetMap.
 * As consultas são executadas pelo servidor autenticado em lead-finder.server.ts.
 */
export const ZONAS_LEADS = {
  Cascais: { lat: 38.6979, lon: -9.4215 },
  Alcabideche: { lat: 38.7385, lon: -9.408 },
  Estoril: { lat: 38.705, lon: -9.395 },
  Carcavelos: { lat: 38.686, lon: -9.337 },
  Parede: { lat: 38.693, lon: -9.357 },
  Sintra: { lat: 38.798, lon: -9.382 },
  Oeiras: { lat: 38.691, lon: -9.311 },
  São_Domingos_de_Rana: { lat: 38.7059, lon: -9.3406 },
  São_Pedro_do_Estoril: { lat: 38.6945, lon: -9.3689 },
} as const;

export const CATEGORIAS_LEADS = {
  restaurantes: { rotulo: "Restaurantes", tags: ['["amenity"="restaurant"]'] },
  cafes: { rotulo: "Cafés e pastelarias", tags: ['["amenity"~"^(cafe|fast_food)$"]', '["shop"="bakery"]'] },
  barbearias: { rotulo: "Cabeleireiros e barbearias", tags: ['["shop"~"^(hairdresser|beauty)$"]'] },
  oficinas: { rotulo: "Oficinas automóveis", tags: ['["shop"~"^(car_repair|tyres)$"]'] },
  piscinas: { rotulo: "Piscinas e equipamentos", tags: ['["shop"="swimming_pool"]', '["craft"="swimming_pool"]'] },
  carpintarias: { rotulo: "Carpintarias", tags: ['["craft"="carpenter"]'] },
  construcao: { rotulo: "Construção", tags: ['["office"="construction_company"]', '["craft"~"^(builder|roofer)$"]'] },
  clinicas: { rotulo: "Clínicas e dentistas", tags: ['["amenity"~"^(clinic|doctors|dentist)$"]'] },
  alojamentos: { rotulo: "Alojamentos", tags: ['["tourism"~"^(hotel|guest_house|apartment|hostel)$"]'] },
  imobiliarias: { rotulo: "Imobiliárias", tags: ['["office"="estate_agent"]'] },
  limpeza: { rotulo: "Lavandarias e limpeza", tags: ['["shop"~"^(dry_cleaning|laundry)$"]', '["craft"="cleaning"]'] },
  outros: { rotulo: "Lojas e serviços", tags: ['["shop"]'] },
} as const;

export type CategoriaLead = keyof typeof CATEGORIAS_LEADS;
export type LocalidadeLead = keyof typeof ZONAS_LEADS;
export type LeadExterno = {
  id: string;
  tipoNws?: CategoriaLead;
  nome: string;
  categoria: string | null;
  morada: string | null;
  website: string | null;
  email: string | null;
  telefone: string | null;
  mapsUrl: string;
  classificacao: null;
  avaliacoes: null;
  esplanada: "sim" | "nao" | "desconhecido";
  oportunidade: "sem_website_identificado" | "site_identificado";
  latitude: number | null;
  longitude: number | null;
  localidade: string | null;
};

export type PesquisaLeadsResultado = {
  estado: "ok";
  resultados: LeadExterno[];
  pesquisadoEm: string;
  fonte: string;
  nota: string;
  servidor: string;
  raio: number;
  localidade: LocalidadeLead;
};

export type PesquisaLeadsOpcoes = {
  categoria: CategoriaLead;
  localidade: LocalidadeLead;
  raio: number;
};

type ElementoOSM = {
  type?: "node" | "way" | "relation";
  id?: number;
  tags?: Record<string, string>;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
};

export class ErroPesquisaLeads extends Error {
  constructor(message: string, public readonly codigo: string) {
    super(message);
    this.name = "ErroPesquisaLeads";
  }
}

function websiteValido(valor?: string): string | null {
  if (!valor?.trim()) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(valor) ? valor.trim() : `https://${valor.trim()}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch { return null; }
}

function morada(tags: Record<string, string>): string | null {
  const rua = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  const cidade = [tags["addr:postcode"], tags["addr:city"]].filter(Boolean).join(" ");
  return [rua, cidade].filter(Boolean).join(", ") || null;
}

export function converterElementoOSM(item: ElementoOSM): LeadExterno | null {
  if (!item.type || typeof item.id !== "number" || !item.tags?.name?.trim()) return null;
  if (!["node", "way", "relation"].includes(item.type)) return null;
  const t = item.tags;
  const site = websiteValido(t.website || t["contact:website"] || t.url);
  const e = (t.email || t["contact:email"] || "").trim();
  const email = /^[^\s@;]+@[^\s@;]+\.[^\s@;]+$/.test(e) ? e : null;
  const lat = item.lat ?? item.center?.lat;
  const lon = item.lon ?? item.center?.lon;
  const categoria = t.amenity || t.shop || t.craft || t.office || t.tourism || null;
  return {
    id: `${item.type}/${item.id}`,
    nome: t.name.trim(),
    categoria,
    morada: morada(t),
    website: site,
    email,
    telefone: t.phone || t["contact:phone"] || null,
    mapsUrl: `https://www.openstreetmap.org/${item.type}/${item.id}`,
    classificacao: null, avaliacoes: null,
    esplanada: t.outdoor_seating === "yes" ? "sim" : t.outdoor_seating === "no" ? "nao" : "desconhecido",
    oportunidade: site ? "site_identificado" : "sem_website_identificado",
    latitude: typeof lat === "number" && Number.isFinite(lat) ? lat : null,
    longitude: typeof lon === "number" && Number.isFinite(lon) ? lon : null,
    localidade: t["addr:city"] || null,
  };
}

export function prepararConsultaLeads(opts: Pick<PesquisaLeadsOpcoes, "categoria" | "localidade" | "raio">): string {
  const zona = ZONAS_LEADS[opts.localidade];
  const categoria = CATEGORIAS_LEADS[opts.categoria];
  if (!zona || !categoria || !Number.isFinite(opts.raio) || opts.raio < 500 || opts.raio > 6000) {
    throw new ErroPesquisaLeads("Filtros de pesquisa inválidos.", "FILTROS");
  }
  const linhas = categoria.tags.map((f) => `nwr(around:${opts.raio},${zona.lat},${zona.lon})${f}["name"];`).join("\n");
  return `[out:json][timeout:18];(\n${linhas}\n);out center 120;`;
}

export function obterUrlOverpassTurbo(opts: Pick<PesquisaLeadsOpcoes, "categoria" | "localidade" | "raio">): string {
  return `https://overpass-turbo.eu/?Q=${encodeURIComponent(prepararConsultaLeads(opts))}&R`;
}

function normalizar(v: string) {
  return v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Importação local quando o serviço externo bloqueia o navegador.
 * Aceita exportação Raw JSON da API Overpass ou GeoJSON do Overpass Turbo.
 * Nunca envia o ficheiro para a NWS ou para outro serviço. */
export function importarDadosOsmJson(
  conteudo: string,
  opts: Pick<PesquisaLeadsOpcoes, "localidade" | "raio">,
): PesquisaLeadsResultado {
  if (conteudo.length > 12_000_000) {
    throw new ErroPesquisaLeads("O ficheiro é demasiado grande (máximo 12 MB).", "FICHEIRO_GRANDE");
  }
  let dados: unknown;
  try { dados = JSON.parse(conteudo); }
  catch { throw new ErroPesquisaLeads("Este ficheiro não contém JSON válido. No Overpass Turbo, exporta como GeoJSON ou Raw data (JSON).", "FORMATO"); }
  if (!dados || typeof dados !== "object") {
    throw new ErroPesquisaLeads("Formato de ficheiro não reconhecido.", "FORMATO");
  }
  const obj = dados as { elements?: unknown; type?: unknown; features?: unknown };
  let elementos: ElementoOSM[];
  if (Array.isArray(obj.elements)) {
    if (obj.elements.length > 25000) throw new ErroPesquisaLeads("Muitos elementos. Reduz o raio e exporta novamente.", "TAMANHO");
    elementos = obj.elements as ElementoOSM[];
  } else if (obj.type === "FeatureCollection" && Array.isArray(obj.features)) {
    if (obj.features.length > 25000) throw new ErroPesquisaLeads("Muitos elementos. Reduz o raio e exporta novamente.", "TAMANHO");
    elementos = (obj.features as Array<Record<string, unknown>>).map((feature) => {
      if (!feature || typeof feature !== "object") return {};
      const props = feature.properties && typeof feature.properties === "object"
        ? feature.properties as Record<string, unknown> : {};
      const rawId = String(feature.id ?? props["@id"] ?? "");
      const match = rawId.match(/^(node|way|relation)\/(\d+)$/);
      // GeoJSON do Overpass Turbo usa @id = "way/123".
      const osmType = match?.[1];
      const osmId = match ? Number(match[2]) : null;
      const geometry = feature.geometry && typeof feature.geometry === "object"
        ? feature.geometry as { type?: string; coordinates?: unknown } : {};
      let lon: number | undefined;
      let lat: number | undefined;
      if (geometry.type === "Point" && Array.isArray(geometry.coordinates)) {
        const [x, y] = geometry.coordinates;
        if (typeof x === "number" && typeof y === "number") { lon = x; lat = y; }
      }
      const tags = { ...props } as Record<string, unknown>;
      delete tags["@id"];
      return {
        type: osmType as ElementoOSM["type"], id: osmId ?? undefined,
        tags: Object.fromEntries(Object.entries(tags).filter(([, v]) => typeof v === "string")) as Record<string, string>,
        lat, lon,
      };
    });
  } else {
    throw new ErroPesquisaLeads("Formato não suportado. Exporta GeoJSON ou Raw data (JSON) a partir do Overpass Turbo.", "FORMATO");
  }
  const vistos = new Set<string>();
  const resultados = elementos.map(converterElementoOSM)
    .filter((x): x is LeadExterno => Boolean(x))
    .filter((x) => {
      // Duplicados node/way/relation do mesmo estabelecimento.
      const key = `${normalizar(x.nome)}|${x.latitude?.toFixed(4) ?? ""}|${x.longitude?.toFixed(4) ?? ""}`;
      if (vistos.has(key)) return false;
      vistos.add(key);
      return true;
    })
    .sort((a, b) => Number(!b.website) - Number(!a.website) || a.nome.localeCompare(b.nome, "pt-PT"));
  if (!resultados.length) throw new ErroPesquisaLeads("O ficheiro é válido, mas não contém negócios identificáveis com nome e ID OSM. Confirma que executaste a consulta no Overpass Turbo.", "SEM_NEGOCIOS");
  return {
    estado: "ok", resultados,
    pesquisadoEm: new Date().toISOString(),
    fonte: "OpenStreetMap / Overpass",
    servidor: "Ficheiro exportado do Overpass Turbo (importação local)",
    raio: opts.raio,
    localidade: opts.localidade,
    nota: "Dados comunitários importados do ficheiro local. Não incluem classificações Google nem implicam ausência de website quando não registado.",
  };
}
