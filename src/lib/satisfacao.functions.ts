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

const createSurveySchema = z.object({
  businessId: z.string().uuid("ID de negócio inválido"),
  clientDisplayName: z.string().trim().min(1).max(120),
  projectName: z.string().trim().min(1).max(160),
});

export const criarInqueritoSatisfacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => createSurveySchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: business, error: businessError } = await (supabase as any)
      .from("businesses")
      .select("id, nome")
      .eq("id", data.businessId)
      .maybeSingle();

    if (businessError || !business) {
      throw new Error("Negócio / cliente não encontrado.");
    }

    const token = generateSecureToken();
    const { data: survey, error } = await (supabase as any)
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

    if (error || !survey) {
      console.error("[Satisfação] Erro ao criar inquérito:", error);
      throw new Error("Não foi possível criar o inquérito de satisfação.");
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

    return survey as SatisfactionSurvey;
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
      .select("id, business_id, project_name, responded_at")
      .eq("id", data.id)
      .maybeSingle();

    if (readError || !current) throw new Error("Inquérito não encontrado.");
    if (current.responded_at) {
      throw new Error("Um inquérito já respondido fica preservado no histórico e não pode ser reaberto.");
    }

    const { data: survey, error } = await (supabase as any)
      .from("customer_satisfaction_surveys")
      .update({ active: data.active })
      .eq("id", data.id)
      .is("responded_at", null)
      .select("*")
      .single();

    if (error || !survey) {
      throw new Error("Não foi possível alterar o estado do inquérito.");
    }

    try {
      await (supabase as any).from("activity_log").insert({
        business_id: current.business_id,
        entidade: "satisfacao",
        entidade_id: current.id,
        accao: data.active ? "reativou o inquérito de satisfação" : "desativou o inquérito de satisfação",
        detalhe: current.project_name,
        autor: userId,
      });
    } catch (logError) {
      console.warn("[Satisfação] Falha não bloqueante no log de atividade:", logError);
    }

    return survey as SatisfactionSurvey;
  });

const tokenSchema = z.object({
  token: z.string().regex(/^[0-9a-f]{64}$/i, "Ligação inválida"),
});

export const obterInqueritoPublico = createServerFn({ method: "POST" })
  .validator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const client = publicSupabaseClient();
    const { data: rows, error } = await client.rpc("get_public_satisfaction_survey", {
      p_token: data.token.toLowerCase(),
    } as never);

    if (error) {
      console.error("[Satisfação Pública] Erro no lookup:", error);
      throw new Error("Não foi possível carregar o inquérito.");
    }

    const survey = (Array.isArray(rows) ? rows[0] : null) as PublicSurveyView | undefined;
    return survey ?? null;
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
});

export const submeterInqueritoPublico = createServerFn({ method: "POST" })
  .validator((data: unknown) => submitSurveySchema.parse(data))
  .handler(async ({ data }) => {
    const client = publicSupabaseClient();
    const { data: result, error } = await client.rpc("submit_public_satisfaction_survey", {
      p_token: data.token.toLowerCase(),
      p_recommendation_score: data.recommendation_score,
      p_service_score: data.service_score,
      p_result_score: data.result_score,
      p_communication_score: data.communication_score,
      p_deadlines_score: data.deadlines_score,
      p_ease_score: data.ease_score,
      p_liked_text: data.liked_text?.trim() || null,
      p_improvement_text: data.improvement_text?.trim() || null,
      p_testimonial: data.testimonial?.trim() || null,
      p_testimonial_authorized: Boolean(data.testimonial_authorized),
    } as never);

    if (error) {
      const message = String(error.message ?? "");
      if (message.includes("survey_not_available")) {
        throw new Error("Este inquérito já foi respondido, foi desativado ou a ligação deixou de ser válida.");
      }
      console.error("[Satisfação Pública] Erro na submissão:", error);
      throw new Error("Não foi possível enviar o feedback. Tente novamente.");
    }

    return result as { ok: boolean };
  });
