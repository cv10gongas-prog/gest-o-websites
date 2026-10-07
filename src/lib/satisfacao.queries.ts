import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { demoStore, isDemoMode } from "@/lib/demo-mode";
import type { PublicSurveyView, SatisfactionSurvey, SubmitSurveyPayload } from "@/lib/satisfacao";
import {
  alternarEstadoInquerito,
  criarInqueritoSatisfacao,
  obterInqueritoPublico,
  submeterInqueritoPublico,
} from "@/lib/satisfacao.functions";

const allSurveysKey = ["satisfaction", "dashboard"] as const;
const businessSurveysKey = (businessId: string) => ["satisfaction", "business", businessId] as const;

export function useSatisfactionSurveys(businessId?: string) {
  const qc = useQueryClient();
  const queryKey = businessId ? businessSurveysKey(businessId) : allSurveysKey;

  useEffect(() => {
    if (isDemoMode()) return;

    const channel = supabase
      .channel(`satisfaction-${businessId ?? "dashboard"}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customer_satisfaction_surveys",
          ...(businessId ? { filter: `business_id=eq.${businessId}` } : {}),
        },
        () => {
          const key = businessId ? businessSurveysKey(businessId) : allSurveysKey;
          void qc.invalidateQueries({ queryKey: key });
          if (businessId) void qc.invalidateQueries({ queryKey: allSurveysKey });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [businessId, qc]);

  return useQuery({
    queryKey,
    queryFn: async (): Promise<SatisfactionSurvey[]> => {
      if (isDemoMode()) return demoStore.getSatisfactionSurveys(businessId);

      let query = (supabase as any)
        .from("customer_satisfaction_surveys")
        .select("*, business:businesses(id,nome,categoria,localidade)")
        .order("created_at", { ascending: false });

      if (businessId) query = query.eq("business_id", businessId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SatisfactionSurvey[];
    },
    staleTime: 1_000,
    refetchInterval: 4_000,
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
      qc.invalidateQueries({ queryKey: allSurveysKey });
      qc.invalidateQueries({ queryKey: businessSurveysKey(survey.business_id) });
      qc.invalidateQueries({ queryKey: ["activity", survey.business_id] });
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
      qc.invalidateQueries({ queryKey: ["public_satisfaction_survey", variables.token] });
    },
  });
}
