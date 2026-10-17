/**
 * Marca possíveis redes/franquias por correspondência conservadora do nome comercial.
 * Não demonstra propriedade jurídica e NUNCA apaga leads ou auditorias.
 */
export const MARCAS_COM_REDE = [
  { nome: "Burger King", padrao: /\bburger\s*king\b/ },
  { nome: "McDonald’s", padrao: /\bmcdonald'?s?\b/ },
  { nome: "KFC", padrao: /\bkfc\b/ },
  { nome: "Pizza Hut", padrao: /\bpizza\s*hut\b/ },
  { nome: "Domino’s", padrao: /\bdomino'?s\b/ },
  { nome: "Telepizza", padrao: /\btelepizza\b/ },
  { nome: "Taco Bell", padrao: /\btaco\s*bell\b/ },
  { nome: "Subway", padrao: /\bsubway\b/ },
  { nome: "Starbucks", padrao: /\bstarbucks\b/ },
  { nome: "Pans & Company", padrao: /\bpans\s*(?:&|and|e)\s*company\b/ },
  { nome: "100 Montaditos", padrao: /\b100\s*montaditos\b/ },
  { nome: "H3", padrao: /(?:^|\s)h3(?:\s|$)/ },
  { nome: "Jeronymo", padrao: /\bjeronymo\b/ },
  { nome: "A Padaria Portuguesa", padrao: /\b(?:a\s+)?padaria\s+portuguesa\b/ },
  { nome: "The Good Burger", padrao: /\bthe\s+good\s+burger\b/ },
  { nome: "Worten", padrao: /\bworten\b/ },
  { nome: "FNAC", padrao: /\bfnac\b/ },
  { nome: "Continente", padrao: /\bcontinente\b/ },
  { nome: "Pingo Doce", padrao: /\bpingo\s+doce\b/ },
  { nome: "Lidl", padrao: /\blidl\b/ },
  { nome: "Aldi", padrao: /\baldi\b/ },
  { nome: "Auchan", padrao: /\bauchan\b/ },
] as const;

export type FiltroRede = "independentes" | "todos" | "cadeias";

export function normalizarNomeComercial(valor: string): string {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT").trim();
}

export function identificarPossivelCadeia(nome: string): string | null {
  const texto = normalizarNomeComercial(nome);
  return MARCAS_COM_REDE.find(m => m.padrao.test(texto))?.nome ?? null;
}

export function passaFiltroRede(nome: string, filtro: FiltroRede): boolean {
  if (filtro === "todos") return true;
  const cadeia = identificarPossivelCadeia(nome) !== null;
  return filtro === "cadeias" ? cadeia : !cadeia;
}
