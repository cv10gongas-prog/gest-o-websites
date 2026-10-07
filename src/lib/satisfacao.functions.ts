import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveSupabasePublicConfig } from "@/lib/supabase-public-config";
import type { PublicSurveyView, SatisfactionSurvey } from "@/lib/satisfacao";

function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function publicSupabaseClient() {
  const { url, publishableKey } = resolveSupabasePublicConfig();
  if (!url || !publishableKey) {
    throw new Error("Configuração pública do Supabase indisponível.");
  }
  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function isSatisfactionSchemaUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown; details?: unknown; hint?: unknown };
  const code = String(candidate.code ?? "").toUpperCase();
  const message = [candidate.message, candidate.details, candidate.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const mentionsSatisfactionBackend =
    message.includes("customer_satisfaction_surveys") ||
    message.includes("get_public_satisfaction_survey") ||
    message.includes("submit_public_satisfaction_survey");

  return (
    code === "42P01" ||
    code === "PGRST200" ||
    code === "PGRST202" ||
    code === "PGRST204" ||
    code === "PGRST205" ||
    (mentionsSatisfactionBackend &&
      (message.includes("does not exist") ||
        message.includes("schema cache") ||
        message.includes("could not find") ||
        message.includes("not found")))
  );
}

const createSurveySchema = z.object({
  businessId: z.string().uuid("ID de negócio inválido"),
  clientDisplayName: z.string().trim().min(1).max(120),
  projectName: z.string().trim().min(1).max(160),
});

const listSurveysSchema = z.object({
  businessId: z.string().uuid("ID de negócio inválido").nullable().optional(),
});

export const listarInqueritosSatisfacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => listSurveysSchema.parse(data ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const businessId = data.businessId ?? undefined;

    let query = (supabase as any)
      .from("customer_satisfaction_surveys")
      .select("*, business:businesses(id,nome,categoria,localidade)")
      .order("created_at", { ascending: false });

    if (businessId) query = query.eq("business_id", businessId);
    const { data: dbData, error: dbError } = await query;

    let databaseSurveys: SatisfactionSurvey[] = [];
    if (dbError) {
      if (!isSatisfactionSchemaUnavailable(dbError)) {
        console.error("[Satisfação] Erro ao listar inquéritos da tabela definitiva:", dbError);
        throw new Error("Não foi possível carregar os inquéritos de satisfação.");
      }
    } else {
      databaseSurveys = (dbData ?? []) as SatisfactionSurvey[];
    }

    const { listStoredSatisfactionSurveys } = await import("./satisfacao.server");
    let storedSurveys: SatisfactionSurvey[] = [];
    try {
      storedSurveys = await listStoredSatisfactionSurveys(supabase, businessId);
    } catch (storageError) {
      console.error("[Satisfação] Erro ao ler o storage app_settings:", storageError);
      if (dbError && isSatisfactionSchemaUnavailable(dbError)) {
        throw new Error(
          "Não foi possível carregar os inquéritos na base de dados atual. Confirma que a tua conta do CRM é administradora.",
        );
      }
    }

    // Os registos da futura tabela definitiva têm prioridade em caso de ID repetido.
    const merged = new Map<string, SatisfactionSurvey>();
    for (const survey of storedSurveys) merged.set(survey.id, survey);
    for (const survey of databaseSurveys) merged.set(survey.id, survey);

    return Array.from(merged.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  });

export const criarInqueritoSatisfacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => createSurveySchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: business, error: businessError } = await (supabase as any)
      .from("businesses")
      .select("id,nome,categoria,localidade")
      .eq("id", data.businessId)
      .maybeSingle();

    if (businessError || !business) {
      throw new Error("Negócio / cliente não encontrado.");
    }

    const token = generateSecureToken();
    const { data: dbSurvey, error: dbError } = await (supabase as any)
      .from("customer_satisfaction_surveys")
      .insert({
        business_id: data.businessId,
        token,
        client_display_name: data.clientDisplayName,
        project_name: data.projectName,
        active: true,
        created_by: userId,
      })
      .select("*")
      .single();

    let survey: SatisfactionSurvey;

    if (!dbError && dbSurvey) {
      survey = {
        ...(dbSurvey as SatisfactionSurvey),
        business,
      };
    } else if (isSatisfactionSchemaUnavailable(dbError)) {
      const { createStoredSatisfactionSurvey } = await import("./satisfacao.server");
      survey = await createStoredSatisfactionSurvey(supabase, {
        id: crypto.randomUUID(),
        businessId: data.businessId,
        business,
        token,
        clientDisplayName: data.clientDisplayName,
        projectName: data.projectName,
        userId,
      });
    } else {
      console.error("[Satisfação] Erro ao criar inquérito:", dbError);
      const message = String((dbError as { message?: string } | null)?.message ?? "");
      throw new Error(message || "Não foi possível criar o inquérito de satisfação.");
    }

    try {
      await (supabase as any).from("activity_log").insert({
        business_id: data.businessId,
        entidade: "satisfacao",
        entidade_id: survey.id,
        accao: "criou um inquérito de satisfação",
        detalhe: `${data.projectName} · ${data.clientDisplayName}`,
        autor: userId,
      });
    } catch (logError) {
      console.warn("[Satisfação] Falha não bloqueante no log de atividade:", logError);
    }

    return survey;
  });

const toggleSurveySchema = z.object({
  id: z.string().uuid(),
  active: z.boolean(),
});

export const alternarEstadoInquerito = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => toggleSurveySchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: current, error: readError } = await (supabase as any)
      .from("customer_satisfaction_surveys")
      .select("id,business_id,project_name,responded_at")
      .eq("id", data.id)
      .maybeSingle();

    if (readError && !isSatisfactionSchemaUnavailable(readError)) {
      throw new Error("Não foi possível consultar o inquérito.");
    }

    let survey: SatisfactionSurvey | null = null;

    if (!readError && current) {
      if (current.responded_at) {
        throw new Error(
          "Um inquérito já respondido fica preservado no histórico e não pode ser reaberto.",
        );
      }

      const { data: updated, error: updateError } = await (supabase as any)
        .from("customer_satisfaction_surveys")
        .update({ active: data.active })
        .eq("id", data.id)
        .is("responded_at", null)
        .select("*")
        .single();

      if (updateError || !updated) {
        throw new Error("Não foi possível alterar o estado do inquérito.");
      }
      survey = updated as SatisfactionSurvey;
    } else {
      const { toggleStoredSatisfactionSurvey } = await import("./satisfacao.server");
      survey = await toggleStoredSatisfactionSurvey(supabase, data.id, data.active);
      if (!survey) throw new Error("Inquérito não encontrado.");
    }

    try {
      await (supabase as any).from("activity_log").insert({
        business_id: survey.business_id,
        entidade: "satisfacao",
        entidade_id: survey.id,
        accao: data.active ? "reativou o inquérito de satisfação" : "desativou o inquérito de satisfação",
        detalhe: survey.project_name,
        autor: userId,
      });
    } catch (logError) {
      console.warn("[Satisfação] Falha não bloqueante no log de atividade:", logError);
    }

    return survey;
  });

const tokenSchema = z.object({
  token: z.string().regex(/^[0-9a-f]{64}$/i, "Ligação inválida"),
});

export const obterInqueritoPublico = createServerFn({ method: "POST" })
  .validator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const normalizedToken = data.token.toLowerCase();
    const client = publicSupabaseClient();
    const { data: rows, error } = await client.rpc("get_public_satisfaction_survey", {
      p_token: normalizedToken,
    } as never);

    if (!error) {
      const survey = (Array.isArray(rows) ? rows[0] : null) as PublicSurveyView | undefined;
      if (survey) return survey;
      // Se a tabela definitiva já existir, links antigos em app_settings continuam válidos.
    } else if (!isSatisfactionSchemaUnavailable(error)) {
      console.error("[Satisfação Pública] Erro no lookup definitivo:", error);
      throw new Error("Não foi possível carregar o inquérito.");
    }

    try {
      const { getStoredPublicSatisfactionSurvey, getTechnicalSatisfactionClient } = await import(
        "./satisfacao.server"
      );
      const { client: technicalClient } = await getTechnicalSatisfactionClient();
      return await getStoredPublicSatisfactionSurvey(technicalClient, normalizedToken);
    } catch (fallbackError) {
      console.error("[Satisfação Pública] Erro no lookup app_settings:", fallbackError);
      throw new Error("Não foi possível carregar o inquérito.");
    }
  });

export const submitSurveySchema = z.object({
  token: z.string().regex(/^[0-9a-f]{64}$/i, "Ligação inválida"),
  recommendation_score: z.number().int().min(0).max(20),
  service_score: z.number().int().min(0).max(10),
  result_score: z.number().int().min(0).max(10),
  communication_score: z.number().int().min(0).max(10),
  deadlines_score: z.number().int().min(0).max(10),
  ease_score: z.number().int().min(0).max(10),
  liked_text: z.string().trim().max(3000).optional().nullable(),
  improvement_text: z.string().trim().max(3000).optional().nullable(),
  testimonial: z.string().trim().max(3000).optional().nullable(),
  testimonial_authorized: z.boolean().default(false),
  portfolio_authorized: z.boolean().default(false),
});

export const submeterInqueritoPublico = createServerFn({ method: "POST" })
  .validator((data: unknown) => submitSurveySchema.parse(data))
  .handler(async ({ data }) => {
    const normalizedData = {
      ...data,
      token: data.token.toLowerCase(),
      liked_text: data.liked_text?.trim() || null,
      improvement_text: data.improvement_text?.trim() || null,
      testimonial: data.testimonial?.trim() || null,
      testimonial_authorized: Boolean(data.testimonial_authorized),
      portfolio_authorized: Boolean(data.portfolio_authorized),
    };

    const client = publicSupabaseClient();
    const { data: result, error } = await client.rpc("submit_public_satisfaction_survey", {
      p_token: normalizedData.token,
      p_recommendation_score: normalizedData.recommendation_score,
      p_service_score: normalizedData.service_score,
      p_result_score: normalizedData.result_score,
      p_communication_score: normalizedData.communication_score,
      p_deadlines_score: normalizedData.deadlines_score,
      p_ease_score: normalizedData.ease_score,
      p_liked_text: normalizedData.liked_text,
      p_improvement_text: normalizedData.improvement_text,
      p_testimonial: normalizedData.testimonial,
      p_testimonial_authorized: normalizedData.testimonial_authorized,
      p_portfolio_authorized: normalizedData.portfolio_authorized,
    } as never);

    if (!error) return result as { ok: boolean };

    const rpcMessage = String(error.message ?? "");
    const mayBeLegacyStoredSurvey =
      isSatisfactionSchemaUnavailable(error) || rpcMessage.includes("survey_not_available");

    if (!mayBeLegacyStoredSurvey) {
      console.error("[Satisfação Pública] Erro na submissão definitiva:", error);
      throw new Error("Não foi possível enviar o feedback. Tente novamente.");
    }

    try {
      const { getTechnicalSatisfactionClient, submitStoredSatisfactionSurvey } = await import(
        "./satisfacao.server"
      );
      const { client: technicalClient } = await getTechnicalSatisfactionClient();
      const fallbackResult = await submitStoredSatisfactionSurvey(technicalClient, normalizedData);

      if (fallbackResult.kind === "ok") return { ok: true };
      if (fallbackResult.kind === "conflict") {
        throw new Error("O inquérito foi alterado entretanto. Tente novamente.");
      }
      if (fallbackResult.kind === "unavailable" || fallbackResult.kind === "not_found") {
        throw new Error(
          "Este inquérito já foi respondido, foi desativado ou a ligação deixou de ser válida.",
        );
      }
    } catch (fallbackError) {
      if (fallbackError instanceof Error) throw fallbackError;
      console.error("[Satisfação Pública] Erro na submissão app_settings:", fallbackError);
      throw new Error("Não foi possível enviar o feedback. Tente novamente.");
    }

    throw new Error("Não foi possível enviar o feedback. Tente novamente.");
  });
