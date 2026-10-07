-- Inquéritos de satisfação do cliente — Nova Web Studio
-- Migration aditiva. O público nunca lê/escreve diretamente na tabela: apenas usa RPCs por token.

CREATE TABLE IF NOT EXISTS public.customer_satisfaction_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  client_display_name text NOT NULL,
  project_name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  responded_at timestamptz,

  recommendation_score integer,
  service_score integer,
  result_score integer,
  communication_score integer,
  deadlines_score integer,
  ease_score integer,

  liked_text text,
  improvement_text text,
  testimonial text,
  testimonial_authorized boolean NOT NULL DEFAULT false,

  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT customer_satisfaction_token_format CHECK (token ~ '^[0-9a-f]{64}$'),
  CONSTRAINT customer_satisfaction_client_name_length CHECK (char_length(client_display_name) BETWEEN 1 AND 120),
  CONSTRAINT customer_satisfaction_project_name_length CHECK (char_length(project_name) BETWEEN 1 AND 160),
  CONSTRAINT customer_satisfaction_recommendation_range CHECK (recommendation_score IS NULL OR recommendation_score BETWEEN 0 AND 20),
  CONSTRAINT customer_satisfaction_service_range CHECK (service_score IS NULL OR service_score BETWEEN 0 AND 10),
  CONSTRAINT customer_satisfaction_result_range CHECK (result_score IS NULL OR result_score BETWEEN 0 AND 10),
  CONSTRAINT customer_satisfaction_communication_range CHECK (communication_score IS NULL OR communication_score BETWEEN 0 AND 10),
  CONSTRAINT customer_satisfaction_deadlines_range CHECK (deadlines_score IS NULL OR deadlines_score BETWEEN 0 AND 10),
  CONSTRAINT customer_satisfaction_ease_range CHECK (ease_score IS NULL OR ease_score BETWEEN 0 AND 10),
  CONSTRAINT customer_satisfaction_liked_length CHECK (liked_text IS NULL OR char_length(liked_text) <= 3000),
  CONSTRAINT customer_satisfaction_improvement_length CHECK (improvement_text IS NULL OR char_length(improvement_text) <= 3000),
  CONSTRAINT customer_satisfaction_testimonial_length CHECK (testimonial IS NULL OR char_length(testimonial) <= 3000),
  CONSTRAINT customer_satisfaction_response_consistency CHECK (
    (responded_at IS NULL AND recommendation_score IS NULL AND service_score IS NULL AND result_score IS NULL AND communication_score IS NULL AND deadlines_score IS NULL AND ease_score IS NULL)
    OR
    (responded_at IS NOT NULL AND recommendation_score IS NOT NULL AND service_score IS NOT NULL AND result_score IS NOT NULL AND communication_score IS NOT NULL AND deadlines_score IS NOT NULL AND ease_score IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_customer_satisfaction_business
  ON public.customer_satisfaction_surveys(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_satisfaction_status
  ON public.customer_satisfaction_surveys(active, responded_at, created_at DESC);

DROP TRIGGER IF EXISTS trg_customer_satisfaction_updated ON public.customer_satisfaction_surveys;
CREATE TRIGGER trg_customer_satisfaction_updated
  BEFORE UPDATE ON public.customer_satisfaction_surveys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.customer_satisfaction_surveys ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.customer_satisfaction_surveys FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.customer_satisfaction_surveys TO authenticated;
GRANT ALL ON public.customer_satisfaction_surveys TO service_role;

DROP POLICY IF EXISTS "Equipa vê inquéritos de satisfação" ON public.customer_satisfaction_surveys;
CREATE POLICY "Equipa vê inquéritos de satisfação"
  ON public.customer_satisfaction_surveys
  FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Equipa cria inquéritos de satisfação" ON public.customer_satisfaction_surveys;
CREATE POLICY "Equipa cria inquéritos de satisfação"
  ON public.customer_satisfaction_surveys
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Equipa atualiza inquéritos de satisfação" ON public.customer_satisfaction_surveys;
CREATE POLICY "Equipa atualiza inquéritos de satisfação"
  ON public.customer_satisfaction_surveys
  FOR UPDATE TO authenticated
  USING (public.is_team_member(auth.uid()))
  WITH CHECK (public.is_team_member(auth.uid()));

-- Contexto público mínimo. Não devolve business_id, token, IDs internos ou dados do CRM.
CREATE OR REPLACE FUNCTION public.get_public_satisfaction_survey(p_token text)
RETURNS TABLE (
  client_display_name text,
  project_name text,
  active boolean,
  responded boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    s.client_display_name,
    s.project_name,
    s.active,
    (s.responded_at IS NOT NULL) AS responded
  FROM public.customer_satisfaction_surveys AS s
  WHERE s.token = p_token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_satisfaction_survey(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_satisfaction_survey(text) TO anon, authenticated, service_role;

-- Submissão pública atómica: um token ativo e ainda não respondido só pode ser consumido uma vez.
CREATE OR REPLACE FUNCTION public.submit_public_satisfaction_survey(
  p_token text,
  p_recommendation_score integer,
  p_service_score integer,
  p_result_score integer,
  p_communication_score integer,
  p_deadlines_score integer,
  p_ease_score integer,
  p_liked_text text DEFAULT NULL,
  p_improvement_text text DEFAULT NULL,
  p_testimonial text DEFAULT NULL,
  p_testimonial_authorized boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_survey_id uuid;
  v_business_id uuid;
BEGIN
  IF p_token IS NULL OR p_token !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'survey_not_available';
  END IF;

  IF p_recommendation_score NOT BETWEEN 0 AND 20 THEN
    RAISE EXCEPTION 'invalid_recommendation_score';
  END IF;
  IF p_service_score NOT BETWEEN 0 AND 10
     OR p_result_score NOT BETWEEN 0 AND 10
     OR p_communication_score NOT BETWEEN 0 AND 10
     OR p_deadlines_score NOT BETWEEN 0 AND 10
     OR p_ease_score NOT BETWEEN 0 AND 10 THEN
    RAISE EXCEPTION 'invalid_score';
  END IF;

  IF p_liked_text IS NOT NULL AND char_length(p_liked_text) > 3000 THEN
    RAISE EXCEPTION 'text_too_long';
  END IF;
  IF p_improvement_text IS NOT NULL AND char_length(p_improvement_text) > 3000 THEN
    RAISE EXCEPTION 'text_too_long';
  END IF;
  IF p_testimonial IS NOT NULL AND char_length(p_testimonial) > 3000 THEN
    RAISE EXCEPTION 'text_too_long';
  END IF;

  UPDATE public.customer_satisfaction_surveys
  SET
    responded_at = now(),
    recommendation_score = p_recommendation_score,
    service_score = p_service_score,
    result_score = p_result_score,
    communication_score = p_communication_score,
    deadlines_score = p_deadlines_score,
    ease_score = p_ease_score,
    liked_text = NULLIF(btrim(p_liked_text), ''),
    improvement_text = NULLIF(btrim(p_improvement_text), ''),
    testimonial = NULLIF(btrim(p_testimonial), ''),
    testimonial_authorized = COALESCE(p_testimonial_authorized, false)
      AND NULLIF(btrim(p_testimonial), '') IS NOT NULL
  WHERE token = p_token
    AND active = true
    AND responded_at IS NULL
  RETURNING id, business_id INTO v_survey_id, v_business_id;

  IF v_survey_id IS NULL THEN
    RAISE EXCEPTION 'survey_not_available';
  END IF;

  INSERT INTO public.activity_log (
    business_id,
    entidade,
    entidade_id,
    accao,
    detalhe
  ) VALUES (
    v_business_id,
    'satisfacao',
    v_survey_id,
    'inquérito de satisfação respondido',
    'Índice de Recomendação: ' || p_recommendation_score || '/20 · Serviço: ' || p_service_score || '/10'
  );

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_public_satisfaction_survey(
  text, integer, integer, integer, integer, integer, integer, text, text, text, boolean
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_public_satisfaction_survey(
  text, integer, integer, integer, integer, integer, integer, text, text, text, boolean
) TO anon, authenticated, service_role;
