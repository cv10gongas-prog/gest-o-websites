import { createClient } from "@supabase/supabase-js";

import { resolveSupabasePublicConfig } from "@/lib/supabase-public-config";
import type { SatisfactionSurvey, SubmitSurveyPayload } from "@/lib/satisfacao";

const SURVEY_PREFIX = "satisfaction:survey:";
const TOKEN_PREFIX = "satisfaction:token:";
const PAGE_SIZE = 500;

type SupabaseLike = any;

type StoredSurveyEnvelope = SatisfactionSurvey & {
  storage?: "app_settings";
  version?: 1;
};

type StoredSurveyRow = {
  survey: SatisfactionSurvey;
  rowUpdatedAt: string;
};

type TechnicalClient = {
  client: SupabaseLike;
  userId: string;
  expiresAtMs: number;
};

let cachedTechnicalClient: TechnicalClient | null = null;

function surveyKey(id: string): string {
  return `${SURVEY_PREFIX}${id}`;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function tokenKey(token: string): Promise<string> {
  return `${TOKEN_PREFIX}${await sha256Hex(token.toLowerCase())}`;
}

function parseStoredSurvey(value: string | null, rowUpdatedAt?: string): SatisfactionSurvey | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<StoredSurveyEnvelope> | null;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.id !== "string" || typeof parsed.business_id !== "string") return null;
    if (typeof parsed.token !== "string" || !/^[0-9a-f]{64}$/i.test(parsed.token)) return null;
    if (typeof parsed.client_display_name !== "string" || typeof parsed.project_name !== "string") {
      return null;
    }
    if (typeof parsed.active !== "boolean") return null;
    if (typeof parsed.created_at !== "string" || typeof parsed.updated_at !== "string") return null;

    return {
      ...(parsed as SatisfactionSurvey),
      updated_at: rowUpdatedAt ?? parsed.updated_at,
    };
  } catch {
    return null;
  }
}

function serializeStoredSurvey(survey: SatisfactionSurvey): string {
  const payload: StoredSurveyEnvelope = {
    ...survey,
    storage: "app_settings",
    version: 1,
  };
  return JSON.stringify(payload);
}

async function readStoredSurveyById(
  client: SupabaseLike,
  id: string,
): Promise<StoredSurveyRow | null> {
  const { data, error } = await client
    .from("app_settings")
    .select("valor,updated_at")
    .eq("chave", surveyKey(id))
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const survey = parseStoredSurvey(data.valor, data.updated_at);
  if (!survey) {
    throw new Error("O registo do inquérito está inválido.");
  }

  return { survey, rowUpdatedAt: data.updated_at };
}

async function readStoredSurveyByToken(
  client: SupabaseLike,
  token: string,
): Promise<StoredSurveyRow | null> {
  const key = await tokenKey(token);
  const { data: indexRow, error: indexError } = await client
    .from("app_settings")
    .select("valor")
    .eq("chave", key)
    .maybeSingle();

  if (indexError) throw indexError;
  if (!indexRow?.valor) return null;

  let surveyId = "";
  try {
    const parsed = JSON.parse(indexRow.valor) as { survey_id?: unknown };
    if (typeof parsed.survey_id === "string") surveyId = parsed.survey_id;
  } catch {
    surveyId = "";
  }

  if (!surveyId) return null;
  const stored = await readStoredSurveyById(client, surveyId);
  if (!stored) return null;

  // O índice usa SHA-256; esta verificação adicional evita aceitar um registo inconsistente.
  if (stored.survey.token.toLowerCase() !== token.toLowerCase()) return null;
  return stored;
}

export async function listStoredSatisfactionSurveys(
  client: SupabaseLike,
  businessId?: string | null,
): Promise<SatisfactionSurvey[]> {
  const surveys: SatisfactionSurvey[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await client
      .from("app_settings")
      .select("chave,valor,updated_at")
      .like("chave", `${SURVEY_PREFIX}%`)
      .order("updated_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    const rows = data ?? [];

    for (const row of rows) {
      const survey = parseStoredSurvey(row.valor, row.updated_at);
      if (!survey) continue;
      if (businessId && survey.business_id !== businessId) continue;
      surveys.push(survey);
    }

    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  surveys.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  return surveys;
}

export async function createStoredSatisfactionSurvey(
  client: SupabaseLike,
  input: {
    id: string;
    businessId: string;
    business: { id: string; nome: string; categoria?: string | null; localidade?: string | null };
    token: string;
    clientDisplayName: string;
    projectName: string;
    userId: string;
  },
): Promise<SatisfactionSurvey> {
  const now = new Date().toISOString();
  const survey: SatisfactionSurvey = {
    id: input.id,
    business_id: input.businessId,
    token: input.token.toLowerCase(),
    client_display_name: input.clientDisplayName,
    project_name: input.projectName,
    active: true,
    responded_at: null,
    recommendation_score: null,
    service_score: null,
    result_score: null,
    communication_score: null,
    deadlines_score: null,
    ease_score: null,
    liked_text: null,
    improvement_text: null,
    testimonial: null,
    testimonial_authorized: false,
    portfolio_authorized: false,
    created_by: input.userId,
    created_at: now,
    updated_at: now,
    business: input.business,
  };

  const hashedTokenKey = await tokenKey(input.token);
  const { error } = await client.from("app_settings").insert([
    {
      chave: surveyKey(input.id),
      valor: serializeStoredSurvey(survey),
      updated_at: now,
    },
    {
      chave: hashedTokenKey,
      valor: JSON.stringify({ survey_id: input.id, version: 1 }),
      updated_at: now,
    },
  ]);

  if (error) {
    console.error("[Satisfação] Falha ao persistir inquérito em app_settings:", error);
    throw new Error(
      "Não foi possível guardar o inquérito na base de dados. Confirma que a conta do CRM é administradora.",
    );
  }

  return survey;
}

export async function toggleStoredSatisfactionSurvey(
  client: SupabaseLike,
  id: string,
  active: boolean,
): Promise<SatisfactionSurvey | null> {
  const stored = await readStoredSurveyById(client, id);
  if (!stored) return null;
  if (stored.survey.responded_at) {
    throw new Error("Um inquérito já respondido fica preservado no histórico e não pode ser reaberto.");
  }

  const nextUpdatedAt = new Date().toISOString();
  const nextSurvey: SatisfactionSurvey = {
    ...stored.survey,
    active,
    updated_at: nextUpdatedAt,
  };

  const { data, error } = await client
    .from("app_settings")
    .update({
      valor: serializeStoredSurvey(nextSurvey),
      updated_at: nextUpdatedAt,
    })
    .eq("chave", surveyKey(id))
    .eq("updated_at", stored.rowUpdatedAt)
    .select("updated_at");

  if (error) throw error;
  if ((data ?? []).length === 0) {
    const latest = await readStoredSurveyById(client, id);
    if (latest?.survey.responded_at) {
      throw new Error("Este inquérito já foi respondido e já não pode ser alterado.");
    }
    throw new Error("O inquérito foi alterado entretanto. Tenta novamente.");
  }

  return nextSurvey;
}

export async function getStoredPublicSatisfactionSurvey(
  client: SupabaseLike,
  token: string,
): Promise<{
  client_display_name: string;
  project_name: string;
  active: boolean;
  responded: boolean;
} | null> {
  const stored = await readStoredSurveyByToken(client, token);
  if (!stored) return null;

  return {
    client_display_name: stored.survey.client_display_name,
    project_name: stored.survey.project_name,
    active: stored.survey.active,
    responded: stored.survey.responded_at !== null,
  };
}

export type StoredSubmitResult =
  | { kind: "ok" }
  | { kind: "not_found" }
  | { kind: "unavailable" }
  | { kind: "conflict" };

export async function submitStoredSatisfactionSurvey(
  client: SupabaseLike,
  payload: SubmitSurveyPayload,
): Promise<StoredSubmitResult> {
  const stored = await readStoredSurveyByToken(client, payload.token);
  if (!stored) return { kind: "not_found" };
  if (!stored.survey.active || stored.survey.responded_at) return { kind: "unavailable" };

  const now = new Date().toISOString();
  const testimonial = payload.testimonial?.trim() || null;
  const nextSurvey: SatisfactionSurvey = {
    ...stored.survey,
    responded_at: now,
    recommendation_score: payload.recommendation_score,
    service_score: payload.service_score,
    result_score: payload.result_score,
    communication_score: payload.communication_score,
    deadlines_score: payload.deadlines_score,
    ease_score: payload.ease_score,
    liked_text: payload.liked_text?.trim() || null,
    improvement_text: payload.improvement_text?.trim() || null,
    testimonial,
    testimonial_authorized: Boolean(payload.testimonial_authorized) && testimonial !== null,
    portfolio_authorized: Boolean(payload.portfolio_authorized),
    updated_at: now,
  };

  const { data, error } = await client
    .from("app_settings")
    .update({
      valor: serializeStoredSurvey(nextSurvey),
      updated_at: now,
    })
    .eq("chave", surveyKey(stored.survey.id))
    .eq("updated_at", stored.rowUpdatedAt)
    .select("updated_at");

  if (error) throw error;
  if ((data ?? []).length === 0) {
    const latest = await readStoredSurveyById(client, stored.survey.id);
    if (!latest || latest.survey.responded_at || !latest.survey.active) {
      return { kind: "unavailable" };
    }
    return { kind: "conflict" };
  }

  // Histórico é secundário: a resposta já está persistida antes desta tentativa.
  try {
    await client.from("activity_log").insert({
      business_id: nextSurvey.business_id,
      entidade: "satisfacao",
      entidade_id: nextSurvey.id,
      accao: "inquérito de satisfação respondido",
      detalhe: `Índice de Recomendação: ${nextSurvey.recommendation_score}/20 · Serviço: ${nextSurvey.service_score}/10`,
      autor: null,
    });
  } catch (logError) {
    console.warn("[Satisfação] Falha não bloqueante no histórico:", logError);
  }

  return { kind: "ok" };
}

export async function getTechnicalSatisfactionClient(): Promise<{
  client: SupabaseLike;
  userId: string;
}> {
  const now = Date.now();
  if (cachedTechnicalClient && cachedTechnicalClient.expiresAtMs > now + 60_000) {
    return {
      client: cachedTechnicalClient.client,
      userId: cachedTechnicalClient.userId,
    };
  }

  if (process.env["DEMO_MODE"] === "true" || process.env["VITE_DEMO_MODE"] === "true") {
    throw new Error("Serviço de Satisfação indisponível no modo de demonstração.");
  }

  const { url, publishableKey } = resolveSupabasePublicConfig();
  const email = process.env["NWS_BACKEND_USER_EMAIL"];
  const password = process.env["NWS_BACKEND_USER_PASSWORD"];

  if (!url || !publishableKey || !email || !password) {
    const missing = [
      ...(!url ? ["SUPABASE_URL"] : []),
      ...(!publishableKey ? ["SUPABASE_PUBLISHABLE_KEY"] : []),
      ...(!email ? ["NWS_BACKEND_USER_EMAIL"] : []),
      ...(!password ? ["NWS_BACKEND_USER_PASSWORD"] : []),
    ];
    console.error(`[Satisfação] Configuração server-side em falta: ${missing.join(", ")}`);
    throw new Error("Serviço de Satisfação ainda não está configurado no servidor.");
  }

  const client = createClient(url, publishableKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data: authData, error: authError } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user || !authData.session) {
    console.error("[Satisfação] A autenticação técnica falhou:", authError?.message ?? "sem sessão");
    throw new Error("Serviço de Satisfação indisponível. A autenticação interna falhou.");
  }

  const { data: adminRole, error: roleError } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", authData.user.id)
    .eq("role", "administrador")
    .maybeSingle();

  if (roleError || !adminRole) {
    console.error(
      "[Satisfação] A conta técnica não tem função de administrador:",
      roleError?.message ?? "role ausente",
    );
    throw new Error("Serviço de Satisfação indisponível. A conta interna não é administradora.");
  }

  const expiresAtMs = authData.session.expires_at
    ? authData.session.expires_at * 1000
    : Date.now() + 5 * 60_000;

  cachedTechnicalClient = {
    client,
    userId: authData.user.id,
    expiresAtMs,
  };

  return { client, userId: authData.user.id };
}
