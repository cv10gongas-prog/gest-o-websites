import { ZONAS_LEADS, type CategoriaLead, type LeadExterno, type LocalidadeLead, type PesquisaLeadsResultado } from "@/lib/lead-finder.functions";

export type CatalogoOverture = {
  fonte: "Overture Maps Places";
  geradoEm: string;
  quantidade: number;
  resultados: LeadExterno[];
};

export function distanciaMetros(aLat:number,aLon:number,bLat:number,bLon:number) {
  const rad = Math.PI / 180, r = 6371000;
  const dLat = (bLat-aLat)*rad, dLon=(bLon-aLon)*rad;
  const x = Math.sin(dLat/2)**2 + Math.cos(aLat*rad)*Math.cos(bLat*rad)*Math.sin(dLon/2)**2;
  return r * 2 * Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}

export function filtrarCatalogo(
  catalogo: CatalogoOverture, categoria: CategoriaLead, localidade: LocalidadeLead, raio: number,
): PesquisaLeadsResultado {
  const z = ZONAS_LEADS[localidade];
  if (!z || !Number.isFinite(raio) || raio < 500 || raio > 10000) throw new Error("Filtros inválidos.");
  const resultados = catalogo.resultados.filter((lead) =>
    lead.tipoNws === categoria &&
    typeof lead.latitude === "number" && typeof lead.longitude === "number" &&
    distanciaMetros(z.lat,z.lon,lead.latitude,lead.longitude) <= raio
  );
  return {
    estado:"ok", resultados, pesquisadoEm:catalogo.geradoEm,
    fonte:"Overture Maps Places",servidor:"Catálogo local da NWS, sem Overpass",
    raio,localidade,
    nota:"Dados abertos Overture Maps; cobertura parcial. A ausência de website/email não prova que não existam. Sem avaliações ou esplanada verificadas.",
  };
}

export function validarCatalogo(valor: unknown): CatalogoOverture {
  if (!valor || typeof valor !== "object") throw new Error("O ficheiro de dados não é válido.");
  const v = valor as Record<string,unknown>;
  if (v.fonte !== "Overture Maps Places" || !Array.isArray(v.resultados) ||
    typeof v.geradoEm !== "string" || v.resultados.length > 100000 ||
    (v.resultados.length && !v.resultados.every((x:unknown) =>
      typeof x === "object" && x !== null && typeof (x as Record<string,unknown>).nome === "string" &&
      typeof (x as Record<string,unknown>).latitude === "number" && typeof (x as Record<string,unknown>).longitude === "number"
    ))) throw new Error("Catálogo Overture incompleto ou inválido. Atualiza os dados.");
  return valor as CatalogoOverture;
}
