-- Nova Web Studio: primeira migracao, apenas ADITIVA.
-- Nao altera as politicas publicas atuais nem interrompe o formulario publicado.
-- Aplicar esta migracao ANTES do novo deploy; hardening numa segunda etapa.
-- O segredo privado NAO deve constar deste ficheiro. Guardar apenas o seu SHA-256
-- em contact_form_config, numa operacao separada e manual.

BEGIN;

-- 1. Tabela privada: apenas o hash do segredo partilhado com a Vercel.
CREATE TABLE IF NOT EXISTS public.contact_form_config (
  key text PRIMARY KEY,
  value_hash text NOT NULL CHECK (value_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.contact_form_config FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.contact_form_config TO service_role;
ALTER TABLE public.contact_form_config ENABLE ROW LEVEL SECURITY;

-- 2. Reservas de rate limiting e deduplicacao. Sem IP/email em claro.
-- dedupe_key NAO e UNIQUE: o mesmo pedido pode voltar a ser aceite apos 15 min.
CREATE TABLE IF NOT EXISTS public.contact_submission_guards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dedupe_key text NOT NULL CHECK (dedupe_key ~ '^[0-9a-f]{64}$'),
  ip_hash text NOT NULL CHECK (ip_hash ~ '^[0-9a-f]{64}$'),
  email_hash text NOT NULL CHECK (email_hash ~ '^[0-9a-f]{64}$'),
  confirmation_allowed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.contact_submission_guards FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.contact_submission_guards TO service_role;
ALTER TABLE public.contact_submission_guards ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_contact_guards_dedupe_created
  ON public.contact_submission_guards (dedupe_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_guards_ip_created
  ON public.contact_submission_guards (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_guards_email_created
  ON public.contact_submission_guards (email_hash, confirmation_allowed, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_guards_created
  ON public.contact_submission_guards (created_at);

-- 3. RPC: mantem EXATAMENTE os argumentos e o retorno esperados pelo
-- src/lib/contact.functions.ts preparado pelo Claude.
-- A tabela website_requests ja existe; nao se altera o seu schema.
CREATE OR REPLACE FUNCTION public.submit_guarded_contact_request(
  p_secret text,
  p_request_id uuid,
  p_dedupe_key text,
  p_ip_hash text,
  p_email_hash text,
  p_nome text,
  p_empresa text,
  p_email text,
  p_telefone text,
  p_tipo_projeto text,
  p_orcamento text,
  p_mensagem text,
  p_quer_reuniao boolean,
  p_created_at timestamptz
)
RETURNS TABLE (
  allowed boolean,
  duplicate boolean,
  ip_limited boolean,
  email_limited boolean,
  request_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ip_count integer;
  v_email_count integer;
  v_stored_hash text;
  v_is_service_role boolean;
BEGIN
  -- auth.role() vem das claims verificadas pelo Supabase/PostgREST.
  -- COALESCE e obrigatorio: NULL NUNCA pode dispensar a verificacao.
  -- Nao usar current_setting('role'): SECURITY DEFINER altera o contexto SQL.
  v_is_service_role := COALESCE(auth.role() = 'service_role', false);

  IF NOT v_is_service_role THEN
    IF p_secret IS NULL OR char_length(p_secret) < 32 THEN
      RAISE EXCEPTION 'Unauthorized: Invalid contact submission secret';
    END IF;

    SELECT cfg.value_hash INTO v_stored_hash
    FROM public.contact_form_config AS cfg
    WHERE cfg.key = 'submission_secret';

    IF v_stored_hash IS NULL OR
       pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_secret, 'UTF8')), 'hex')
         IS DISTINCT FROM v_stored_hash THEN
      RAISE EXCEPTION 'Unauthorized: Invalid contact submission secret';
    END IF;
  END IF;

  -- Validacoes defensivas: nao depender exclusivamente da validacao no browser.
  IF p_request_id IS NULL
     OR p_dedupe_key IS NULL OR p_dedupe_key !~ '^[0-9a-f]{64}$'
     OR p_ip_hash IS NULL OR p_ip_hash !~ '^[0-9a-f]{64}$'
     OR p_email_hash IS NULL OR p_email_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid contact submission guard input';
  END IF;

  IF p_nome IS NULL OR length(btrim(p_nome)) < 1 OR length(p_nome) > 120
     OR p_email IS NULL OR length(btrim(p_email)) < 3 OR length(p_email) > 255
     OR length(COALESCE(p_empresa, '')) > 120
     OR length(COALESCE(p_telefone, '')) > 50
     OR length(COALESCE(p_tipo_projeto, '')) > 100
     OR length(COALESCE(p_orcamento, '')) > 100
     OR length(COALESCE(p_mensagem, '')) > 5600 THEN
    RAISE EXCEPTION 'Invalid contact submission field length';
  END IF;

  -- Ordem fixa de locks: concorrencia entre instancias Vercel.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('contact-ip:' || p_ip_hash, 0));
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('contact-email:' || p_email_hash, 0));
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('contact-payload:' || p_dedupe_key, 0));

  -- Limpeza progressiva (em vez de bloquear a tabela inteira em cada pedido).
  DELETE FROM public.contact_submission_guards AS g
  WHERE g.id IN (
    SELECT old.id
    FROM public.contact_submission_guards AS old
    WHERE old.created_at < now() - interval '24 hours'
    ORDER BY old.created_at
    LIMIT 100
    FOR UPDATE SKIP LOCKED
  );

  -- Pedidos exatamente iguais nao criam outra lead nem disparam novos emails.
  IF EXISTS (
    SELECT 1
    FROM public.contact_submission_guards AS g
    WHERE g.dedupe_key = p_dedupe_key
      AND g.created_at >= now() - interval '15 minutes'
  ) THEN
    RETURN QUERY SELECT false, true, false, false, NULL::uuid;
    RETURN;
  END IF;

  SELECT count(*)::integer INTO v_ip_count
  FROM public.contact_submission_guards AS g
  WHERE g.ip_hash = p_ip_hash
    AND g.created_at >= now() - interval '10 minutes';

  IF v_ip_count >= 5 THEN
    RETURN QUERY SELECT false, false, true, false, NULL::uuid;
    RETURN;
  END IF;

  SELECT count(*)::integer INTO v_email_count
  FROM public.contact_submission_guards AS g
  WHERE g.email_hash = p_email_hash
    AND g.confirmation_allowed = true
    AND g.created_at >= now() - interval '15 minutes';

  -- Pedido e reserva gravados na MESMA transacao: se um falhar, nenhum fica.
  INSERT INTO public.website_requests (
    id, nome, empresa, email, telefone, tipo_projeto,
    orcamento, mensagem, quer_reuniao, created_at
  ) VALUES (
    p_request_id,
    btrim(p_nome),
    NULLIF(btrim(COALESCE(p_empresa, '')), ''),
    lower(btrim(p_email)),
    NULLIF(btrim(COALESCE(p_telefone, '')), ''),
    p_tipo_projeto,
    p_orcamento,
    p_mensagem,
    COALESCE(p_quer_reuniao, false),
    now()
  );

  INSERT INTO public.contact_submission_guards (
    dedupe_key, ip_hash, email_hash, confirmation_allowed, created_at
  ) VALUES (
    p_dedupe_key, p_ip_hash, p_email_hash, v_email_count < 2, now()
  );

  RETURN QUERY SELECT true, false, false, v_email_count >= 2, p_request_id;
END;
$$;

-- O anon so pode chamar a RPC apresentando o segredo correto; as tabelas
-- de controlo continuam inacessiveis. O canal INSERT publico antigo sera
-- fechado APENAS na segunda migracao, apos testar a nova versao do site.
REVOKE ALL ON FUNCTION public.submit_guarded_contact_request(
  text, uuid, text, text, text, text, text, text, text, text, text, text, boolean, timestamptz
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.submit_guarded_contact_request(
  text, uuid, text, text, text, text, text, text, text, text, text, text, boolean, timestamptz
) TO anon, authenticated, service_role;

COMMIT;
