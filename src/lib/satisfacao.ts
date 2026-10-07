import type { Business } from "@/lib/crm";

export type SatisfactionSurvey = {
  id: string;
  business_id: string;
  token: string;
  client_display_name: string;
  project_name: string;
  active: boolean;
  responded_at: string | null;
  recommendation_score: number | null; // 0-20
  service_score: number | null; // 0-10
  result_score: number | null; // 0-10
  communication_score: number | null; // 0-10
  deadlines_score: number | null; // 0-10
  ease_score: number | null; // 0-10
  liked_text: string | null;
  improvement_text: string | null;
  testimonial: string | null;
  testimonial_authorized: boolean;
  portfolio_authorized: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  business?:
    | Business
    | { id: string; nome: string; categoria?: string | null; localidade?: string | null }
    | null;
};

export type PublicSurveyView = {
  client_display_name: string;
  project_name: string;
  active: boolean;
  responded: boolean;
};

export type SubmitSurveyPayload = {
  token: string;
  recommendation_score: number;
  service_score: number;
  result_score: number;
  communication_score: number;
  deadlines_score: number;
  ease_score: number;
  liked_text?: string | null;
  improvement_text?: string | null;
  testimonial?: string | null;
  testimonial_authorized?: boolean;
  portfolio_authorized?: boolean;
};

export type SatisfactionStats = {
  totalCreated: number;
  totalResponses: number;
  responseRate: number;
  averageRecommendation: number;
  averageService: number;
  averageResult: number;
  averageCommunication: number;
  averageDeadlines: number;
  averageEase: number;
  authorizedTestimonials: number;
};

export function calcularEstatisticasSatisfacao(
  surveys: SatisfactionSurvey[],
): SatisfactionStats {
  const answered = surveys.filter((survey) => survey.responded_at !== null);
  const totalCreated = surveys.length;
  const totalResponses = answered.length;

  const average = (selector: (survey: SatisfactionSurvey) => number | null) => {
    const values = answered
      .map(selector)
      .filter((value): value is number => typeof value === "number");
    if (values.length === 0) return 0;
    return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
  };

  return {
    totalCreated,
    totalResponses,
    responseRate: totalCreated > 0 ? Math.round((totalResponses / totalCreated) * 100) : 0,
    averageRecommendation: average((survey) => survey.recommendation_score),
    averageService: average((survey) => survey.service_score),
    averageResult: average((survey) => survey.result_score),
    averageCommunication: average((survey) => survey.communication_score),
    averageDeadlines: average((survey) => survey.deadlines_score),
    averageEase: average((survey) => survey.ease_score),
    authorizedTestimonials: answered.filter(
      (survey) => survey.testimonial_authorized && Boolean(survey.testimonial?.trim()),
    ).length,
  };
}

export function gerarUrlInquerito(token: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/satisfacao/${token}`;
  }
  return `https://www.novawebstudio.pt/satisfacao/${token}`;
}

export function obterTomPontuacao(
  value: number | null,
  max: number,
): "success" | "warning" | "danger" | "muted" {
  if (value === null) return "muted";
  const ratio = value / max;
  if (ratio >= 0.8) return "success";
  if (ratio >= 0.6) return "warning";
  return "danger";
}
