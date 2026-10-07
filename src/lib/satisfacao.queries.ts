import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { demoStore, isDemoMode } from "@/lib/demo-mode";
import type { PublicSurveyView, SatisfactionSurvey, SubmitSurveyPayload } from "@/lib/satisfacao";
import {
  alternarEstadoInquerito,
  criarInqueritoSatisfacao,
  listarInqueritosSatisfacao,
  obterInqueritoPublico,
  submeterInqueritoPublico,
} from "@/lib/satisfacao.functions";

const allSurveysKey = ["satisfaction", "dashboard"] as const;
const businessSurveysKey = (businessId: string) => ["satisfaction", "business", businessId] as const;

export function isSatisfactionSchemaUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown; details?: unknown; hint?: unknown };
  const code = String(candidate.code ?? "").toUpperCase();
  const message = [candidate.message, candidate.details, candidate.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    code === "42P01" ||
    code === "PGRST200" ||
    code === "PGRST202" ||
    code === "PGRST204" ||
    code === "PGRST205" ||
    (message.includes("customer_satisfaction_surveys") &&
      (message.includes("does not exist") ||
        message.includes("schema cache") ||
        message.includes("could not find") ||
        message.includes("not found")))
  );
}

export function useSatisfactionSurveys(businessId?: string) {
  const qc = useQueryClient();
  const queryKey = businessId ? businessSurveysKey(businessId) : allSurveysKey;

  useEffect(() => {
    if (isDemoMode()) return;

    const invalidate = () => {
      const key = businessId ? businessSurveysKey(businessId) : allSurveysKey;
      void qc.invalidateQueries({ queryKey: key });
      if (businessId) void qc.invalidateQueries({ queryKey: allSurveysKey });
    };

    const tableChannel = supabase
      .channel(`satisfaction-table-${businessId ?? "dashboard"}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customer_satisfaction_surveys",
          ...(businessId ? { filter: `business_id=eq.${businessId}` } : {}),
        },
        invalidate,
      )
      .subscribe();

    const settingsChannel = supabase
      .channel(`satisfaction-settings-${businessId ?? "dashboard"}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "app_settings",
        },
        (payload) => {
          const nextKey = String((payload.new as { chave?: unknown } | null)?.chave ?? "");
          const previousKey = String((payload.old as { chave?: unknown } | null)?.chave ?? "");
          if (
            nextKey.startsWith("satisfaction:survey:") ||
            previousKey.startsWith("satisfaction:survey:")
          ) {
            invalidate();
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(tableChannel);
      void supabase.removeChannel(settingsChannel);
    };
  }, [businessId, qc]);

  return useQuery({
    queryKey,
    queryFn: async (): Promise<SatisfactionSurvey[]> => {
      if (isDemoMode()) return demoStore.getSatisfactionSurveys(businessId);
      return listarInqueritosSatisfacao({ data: { businessId: businessId ?? null } });
    },
    staleTime: 1_000,
    retry: (failureCount) => failureCount < 2,
    refetchInterval: (query) => (query.state.status === "error" ? false : 4_000),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

export function useCriarInqueritoSatisfacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      businessId: string;
      clientDisplayName: string;
      projectName: string;
    }) => {
      if (isDemoMode()) return demoStore.createSatisfactionSurvey(input);
      return criarInqueritoSatisfacao({ data: input });
    },
    onSuccess: (survey) => {
      const prepend = (current: SatisfactionSurvey[] | undefined) => [
        survey,
        ...(current ?? []).filter((item) => item.id !== survey.id),
      ];

      qc.setQueryData<SatisfactionSurvey[]>(allSurveysKey, prepend);
      qc.setQueryData<SatisfactionSurvey[]>(businessSurveysKey(survey.business_id), prepend);
      void qc.invalidateQueries({ queryKey: allSurveysKey });
      void qc.invalidateQueries({ queryKey: businessSurveysKey(survey.business_id) });
      void qc.invalidateQueries({ queryKey: ["activity", survey.business_id] });
      toast.success("Inquérito criado. A ligação já pode ser enviada ao cliente.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAlternarInquerito() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (isDemoMode()) return demoStore.toggleSatisfactionSurvey(id, active);
      return alternarEstadoInquerito({ data: { id, active } });
    },
    onMutate: async ({ id, active }) => {
      await qc.cancelQueries({ queryKey: ["satisfaction"] });
      const previousDashboard = qc.getQueryData<SatisfactionSurvey[]>(allSurveysKey);
      const survey = previousDashboard?.find((item) => item.id === id);
      const businessKey = survey ? businessSurveysKey(survey.business_id) : null;
      const previousBusiness = businessKey
        ? qc.getQueryData<SatisfactionSurvey[]>(businessKey)
        : undefined;
      const apply = (items?: SatisfactionSurvey[]) =>
        items?.map((item) => (item.id === id ? { ...item, active } : item));

      if (previousDashboard) qc.setQueryData(allSurveysKey, apply(previousDashboard));
      if (businessKey && previousBusiness) qc.setQueryData(businessKey, apply(previousBusiness));

      return { previousDashboard, previousBusiness, businessKey };
    },
    onSuccess: (survey) => {
      toast.success(survey.active ? "Inquérito reativado." : "Inquérito desativado.");
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousDashboard) qc.setQueryData(allSurveysKey, context.previousDashboard);
      if (context?.businessKey && context.previousBusiness) {
        qc.setQueryData(context.businessKey, context.previousBusiness);
      }
      toast.error(error.message);
    },
    onSettled: (survey) => {
      void qc.invalidateQueries({ queryKey: allSurveysKey });
      if (survey) void qc.invalidateQueries({ queryKey: businessSurveysKey(survey.business_id) });
    },
  });
}

export function usePublicSatisfactionSurvey(token: string) {
  return useQuery({
    queryKey: ["public_satisfaction_survey", token],
    enabled: Boolean(token),
    retry: false,
    queryFn: async (): Promise<PublicSurveyView | null> => {
      if (isDemoMode()) return demoStore.getPublicSurvey(token);
      return obterInqueritoPublico({ data: { token } });
    },
  });
}

export function useSubmeterInqueritoPublico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SubmitSurveyPayload) => {
      if (isDemoMode()) return demoStore.submitPublicSurvey(payload);
      return submeterInqueritoPublico({ data: payload });
    },
    onSuccess: (_result, variables) => {
      void qc.invalidateQueries({ queryKey: ["public_satisfaction_survey", variables.token] });
    },
  });
}
