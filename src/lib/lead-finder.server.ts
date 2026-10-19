/**
 * NWS Lead Finder: consulta pontual e autenticada a dados comunitários OSM.
 * O navegador fala apenas com o backend NWS (sem CORS de terceiros).
 * Instâncias públicas não garantem disponibilidade. Nunca contornar 429/403.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CATEGORIAS_LEADS,
  ZONAS_LEADS,
  converterElementoOSM,
  prepararConsultaLeads,
  type CategoriaLead,
  type LeadExterno,
  type LocalidadeLead,
  type PesquisaLeadsResultado,
} from "@/lib/lead-finder.functions";

const schemaPesquisa = z.object({
  categoria: z.string().refine((c) => Object.hasOwn(CATEGORIAS_LEADS, c)),
  localidade: z.string().refine((c) => Object.hasOwn(ZONAS_LEADS, c)),
  raio: z.union([z.literal(1000), z.literal(3000), z.literal(5000)]),
}).strict();

// Fontes distintas e públicas. A segunda só é usada se a primeira não responder
// por falha de rede/erro transitório, NÃO por limites nem bloqueios.
const FONTES = [
  { nome: "OSM Overpass principal", url: "https://overpass-api.de/api/interpreter" },
  { nome: "OSM Overpass comunidade", url: "https://overpass.private.coffee/api/interpreter" },
] as const;

// Cache em memória da instância, para evitar consultas repetidas ao servidor comunitário.
// Em serverless a cache e o limite são por instância, não globais.
const cache = new Map<string, { vence: number; dados: PesquisaLeadsResultado }>();
const emCurso = new Map<string, Promise<PesquisaLeadsResultado>>();
const ultimaConsulta = new Map<string, number>();
const CACHE_MS = 15 * 60 * 1000;
const ESPERA_MS = 15 * 1000;
const MAX_BYTES = 3_000_000;

function deduplicar(elementos: unknown[]): LeadExterno[] {
  const vistos = new Set<string>();
  return elementos
    .map((item) => converterElementoOSM(item as Parameters<typeof converterElementoOSM>[0]))
    .filter((lead): lead is LeadExterno => lead !== null)
    .filter((lead) => {
      const chave = [lead.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
        lead.latitude?.toFixed(4) ?? lead.morada ?? lead.id,
        lead.longitude?.toFixed(4) ?? ""].join("|");
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    })
    .sort((a, b) => Number(!b.website) - Number(!a.website) || a.nome.localeCompare(b.nome, "pt-PT"));
}

class FalhaFonte extends Error {
  constructor(message: string, readonly codigo: "LIMITE" | "BLOQUEADO" | "INDISPONIVEL" | "REDE" | "RESPOSTA") {
    super(message);
  }
}

async function consultarFonte(
  fonte: (typeof FONTES)[number],
  consulta: string,
): Promise<LeadExterno[]> {
  const timeout = AbortSignal.timeout(12000);
  let resposta: Response;
  try {
    resposta = await fetch(fonte.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Accept": "application/json",
        "User-Agent": "NovaWebStudio-LeadFinder/1.0 (+https://novawebstudio.pt)",
      },
      body: new URLSearchParams({ data: consulta }).toString(),
      signal: timeout,
      cache: "no-store",
    });
  } catch {
    throw new FalhaFonte(`${fonte.nome}: não foi possível estabelecer ligação a partir do servidor NWS.`, "REDE");
  }

  if (resposta.status === 429) {
    throw new FalhaFonte(`${fonte.nome}: limite de utilização atingido (429). Aguarda antes de repetir.`, "LIMITE");
  }
  if (resposta.status === 403 || resposta.status === 406) {
    throw new FalhaFonte(`${fonte.nome}: consulta recusada (HTTP ${resposta.status}).`, "BLOQUEADO");
  }
  if (!resposta.ok) {
    throw new FalhaFonte(`${fonte.nome}: indisponível (HTTP ${resposta.status}).`, "INDISPONIVEL");
  }
  const tipo = resposta.headers.get("content-type") ?? "";
  if (!tipo.includes("json") && !tipo.includes("text/plain")) {
    throw new FalhaFonte(`${fonte.nome}: resposta inesperada do serviço.`, "RESPOSTA");
  }
  const tamanhoDeclarado = Number(resposta.headers.get("content-length") ?? 0);
  if (tamanhoDeclarado > MAX_BYTES) {
    throw new FalhaFonte("Resposta demasiado grande. Reduz o raio de pesquisa.", "RESPOSTA");
  }
  // Limitar leitura para evitar trazer grandes respostas para a memória do servidor.
  const reader = resposta.body?.getReader();
  if (!reader) throw new FalhaFonte("A fonte não devolveu dados utilizáveis.", "RESPOSTA");
  const blocos: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        throw new FalhaFonte("Resposta demasiado grande. Reduz o raio de pesquisa.", "RESPOSTA");
      }
      blocos.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const bloco of blocos) { bytes.set(bloco, offset); offset += bloco.byteLength; }
  try {
    const obj: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!obj || typeof obj !== "object" || !("elements" in obj) || !Array.isArray(obj.elements)) {
      throw new Error("bad format");
    }
    return deduplicar(obj.elements);
  } catch {
    throw new FalhaFonte(`${fonte.nome}: JSON inesperado.`, "RESPOSTA");
  }
}

async function executarPesquisa(
  categoria: CategoriaLead,
  localidade: LocalidadeLead,
  raio: number,
): Promise<PesquisaLeadsResultado> {
  const consulta = prepararConsultaLeads({ categoria, localidade, raio });
  let ultimoErro: FalhaFonte | null = null;
  for (const fonte of FONTES) {
    try {
      const resultados = await consultarFonte(fonte, consulta);
      return {
        estado: "ok",
        resultados,
        pesquisadoEm: new Date().toISOString(),
        fonte: "OpenStreetMap / Overpass",
        servidor: `${fonte.nome} (via backend NWS)`,
        localidade,
        raio,
        nota: "Dados comunitários, possivelmente incompletos. A ausência de website/email registado não prova que não exista. Sem reviews Google.",
      };
    } catch (err) {
      const falha = err instanceof FalhaFonte ? err : new FalhaFonte("Falha inesperada na pesquisa.", "REDE");
      ultimoErro = falha;
      if (falha.codigo === "LIMITE" || falha.codigo === "BLOQUEADO" || falha.codigo === "RESPOSTA") break;
      // Alternativa SOMENTE para falha de rede ou indisponibilidade temporária.
    }
  }
  throw new Error(`[${ultimoErro?.codigo ?? "REDE"}] ${ultimoErro?.message ?? "Pesquisa indisponível."} Testa mais tarde ou utiliza a importação OSM.`);
}

export const pesquisarLeadsNoServidor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw: unknown) => schemaPesquisa.parse(raw))
  .handler(async ({ data, context }): Promise<PesquisaLeadsResultado> => {
    const { data: role, error } = await context.supabase.from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error || role?.role !== "administrador") {
      throw new Error("Não autorizado. Só administradores podem executar pesquisas externas.");
    }
    const categoria = data.categoria as CategoriaLead;
    const localidade = data.localidade as LocalidadeLead;
    const chave = `${categoria}|${localidade}|${data.raio}`;
    const guardado = cache.get(chave);
    if (guardado && guardado.vence > Date.now()) return guardado.dados;
    const pendente = emCurso.get(chave);
    if (pendente) return pendente;
    const anterior = ultimaConsulta.get(context.userId) ?? 0;
    if (Date.now() - anterior < ESPERA_MS) {
      throw new Error("[LIMITE] Aguarda 15 segundos entre pesquisas para proteger o serviço público.");
    }
    ultimaConsulta.set(context.userId, Date.now());
    const promessa = executarPesquisa(categoria, localidade, data.raio);
    emCurso.set(chave, promessa);
    try {
      const resultado = await promessa;
      cache.set(chave, { vence: Date.now() + CACHE_MS, dados: resultado });
      if (cache.size > 100) {
        for (const [k, v] of cache) if (v.vence < Date.now()) cache.delete(k);
      }
      return resultado;
    } finally {
      emCurso.delete(chave);
    }
  });
