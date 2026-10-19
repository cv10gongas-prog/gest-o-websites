/**
 * Passagem temporária e explícita de um negócio do Lead Finder / Analyzer
 * para o Email Studio. Não cria clientes, nem envia emails.
 * A ficha é consumida uma vez no mesmo separador, sem dados pessoais na URL.
 */
export const CONTEXTO_EMAIL_KEY = "nws.intelligence.email.handoff.v1";
export type TipoPropostaNWS = "website" | "restaurante" | "modernizacao";
export type OrigemPropostaNWS = "lead" | "auditoria";

export type ContextoPropostaNWS = {
  versao: 1;
  origem: OrigemPropostaNWS;
  nome: string;
  email: string | null;
  telefone?: string | null;
  localidade?: string | null;
  website: string | null;
  tipo: TipoPropostaNWS;
  detalhe: string;
  expiraEm: number;
};
const TEMPO_VIDA = 15 * 60 * 1000;
function limitado(texto: string | null | undefined, max: number): string {
  return (texto || "").trim().slice(0, max);
}
function websitePublico(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return (["http:", "https:"].includes(u.protocol) && !u.username && !u.password) ? u.href : null;
  } catch {return null;}
}
function emailPublico(email: string | null | undefined): string | null {
  const value = limitado(email, 250);
  // Verificação de formato, não valida a existência da caixa.
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) ? value : null;
}

export function guardarContextoProposta(contexto: {
  origem: OrigemPropostaNWS; nome: string; email?: string | null; telefone?: string | null; localidade?: string | null;
  website?: string | null; tipo: TipoPropostaNWS; detalhe?: string;
}): boolean {
  if (typeof window === "undefined" || !contexto.nome.trim()) return false;
  const dados: ContextoPropostaNWS = {
    versao: 1, origem: contexto.origem, nome: limitado(contexto.nome, 160),
    email: emailPublico(contexto.email),
    telefone: limitado(contexto.telefone, 45) || null, localidade: limitado(contexto.localidade, 120) || null,
    website: websitePublico(contexto.website), tipo: contexto.tipo,
    detalhe: limitado(contexto.detalhe, 450), expiraEm: Date.now() + TEMPO_VIDA,
  };
  try { sessionStorage.setItem(CONTEXTO_EMAIL_KEY, JSON.stringify(dados)); return true; }
  catch { return false; }
}

export function lerContextoProposta(origem: OrigemPropostaNWS): ContextoPropostaNWS | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CONTEXTO_EMAIL_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    if (d.versao !== 1 || d.origem !== origem || typeof d.nome !== "string"
      || !d.nome.trim() || typeof d.expiraEm !== "number" || Date.now() > d.expiraEm
      || !["website", "restaurante", "modernizacao"].includes(String(d.tipo))) return null;
    return {versao: 1, origem, nome: limitado(d.nome, 160),
      email: emailPublico(typeof d.email === "string" ? d.email : null),
      telefone: limitado(typeof d.telefone === "string" ? d.telefone : "", 45) || null,
      localidade: limitado(typeof d.localidade === "string" ? d.localidade : "", 120) || null,
      website: websitePublico(typeof d.website === "string" ? d.website : null),
      tipo: d.tipo as TipoPropostaNWS,
      detalhe: limitado(typeof d.detalhe === "string" ? d.detalhe : "", 450),
      expiraEm: d.expiraEm};
  } catch {return null;}
}

/** Limpa a ficha apos a pagina confirmar que a recebeu. */
export function limparContextoProposta() {
  if (typeof window === "undefined") return;
  try { sessionStorage.removeItem(CONTEXTO_EMAIL_KEY); } catch { /* opcional */ }
}
