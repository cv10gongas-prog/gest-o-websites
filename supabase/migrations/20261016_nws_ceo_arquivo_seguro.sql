-- NWS V3.3: arquivo em massa reversível EXCLUSIVO de um proprietário designado.
-- PRÉ-REQUISITO: 20261016_nws_pin_protecao.sql, aplicado e testado previamente.
-- INSTALAÇÃO: na Lovable Cloud, identificar o user_id do CEO real com segurança e inserir:
--   INSERT INTO public.nws_ceo_owner(user_id) VALUES ('<UUID REAL DO CEO>');
-- Não se atribui automaticamente o cargo a qualquer administrador ou ao primeiro a abrir a página.
-- Não remove negócios definitivamente: altera apenas estado e guarda os estados anteriores.

CREATE TABLE IF NOT EXISTS public.nws_ceo_owner (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  defined_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.nws_ceo_owner FROM public, anon, authenticated;
ALTER TABLE public.nws_ceo_owner ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.nws_ceo_archives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  restored_at timestamptz,
  records jsonb NOT NULL,
  total integer NOT NULL
);
REVOKE ALL ON public.nws_ceo_archives FROM public, anon, authenticated;
ALTER TABLE public.nws_ceo_archives ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.nws_ceo_status()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, extensions, public, pg_temp AS $$
DECLARE v_user uuid := auth.uid(); v_enabled boolean;
BEGIN
  IF v_user IS NULL OR NOT public.has_role(v_user,'administrador') THEN
    RETURN jsonb_build_object('owner', false, 'pinReady', false);
  END IF;
  SELECT enabled INTO v_enabled FROM public.nws_pin_settings WHERE user_id = v_user;
  RETURN jsonb_build_object(
    'owner', EXISTS(SELECT 1 FROM public.nws_ceo_owner WHERE user_id = v_user),
    'pinReady', coalesce(v_enabled,false),
    'archives', (SELECT count(*) FROM public.nws_ceo_archives WHERE actor_id=v_user AND restored_at IS NULL)
  );
END; $$;

-- A validação de PIN ocorre na mesma transação que a alteração e não depende do frontend.
CREATE OR REPLACE FUNCTION public.nws_ceo_verify_pin(p_pin text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, extensions, public, pg_temp AS $$
DECLARE v_user uuid := auth.uid(); v_row public.nws_pin_settings%rowtype;
BEGIN
  IF v_user IS NULL OR NOT public.has_role(v_user,'administrador') OR
     NOT EXISTS(SELECT 1 FROM public.nws_ceo_owner WHERE user_id=v_user) THEN
    RETURN false;
  END IF;
  SELECT * INTO v_row FROM public.nws_pin_settings WHERE user_id=v_user FOR UPDATE;
  IF NOT FOUND OR NOT v_row.enabled OR (v_row.blocked_until IS NOT NULL AND v_row.blocked_until > now()) THEN
    RETURN false;
  END IF;
  IF p_pin IS NULL OR extensions.crypt(p_pin,v_row.pin_hash) IS DISTINCT FROM v_row.pin_hash THEN
    UPDATE public.nws_pin_settings SET fail_count=fail_count+1,
      blocked_until=CASE WHEN fail_count+1 >= 5 THEN now()+interval '15 minutes' ELSE blocked_until END
      WHERE user_id=v_user;
    RETURN false;
  END IF;
  UPDATE public.nws_pin_settings SET fail_count=0,blocked_until=NULL WHERE user_id=v_user;
  RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.nws_ceo_verify_pin(text) FROM public,anon,authenticated;

CREATE OR REPLACE FUNCTION public.nws_ceo_archive_all(p_pin text, p_confirmation text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, extensions, public, pg_temp AS $$
DECLARE v_user uuid := auth.uid(); v_snapshot jsonb; v_total integer; v_id uuid;
BEGIN
  IF p_confirmation IS DISTINCT FROM 'ARQUIVAR TODOS' THEN
    RETURN jsonb_build_object('ok',false,'reason','confirmation');
  END IF;
  IF NOT public.nws_ceo_verify_pin(p_pin) THEN
    RETURN jsonb_build_object('ok',false,'reason','pin_or_permissions');
  END IF;
  -- Evita executar esta operação em concorrência para o mesmo proprietário.
  PERFORM pg_advisory_xact_lock(hashtext('nws_ceo_archive_all'));
  SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'estado',estado)), '[]'::jsonb),count(*)
    INTO v_snapshot,v_total FROM public.businesses WHERE estado <> 'arquivado';
  IF v_total=0 THEN RETURN jsonb_build_object('ok',true,'count',0); END IF;
  INSERT INTO public.nws_ceo_archives(actor_id,records,total)
    VALUES (v_user,v_snapshot,v_total) RETURNING id INTO v_id;
  -- O PIN existente exige um permit por cada linha atualizada.
  -- Criam-se apenas para as linhas desta operação, dentro da mesma transação.
  INSERT INTO public.nws_pin_permits(user_id,session_id,table_name,operation,expires_at)
    SELECT v_user,coalesce(auth.jwt()->>'session_id','legacy'),'businesses','UPDATE',now()+interval '120 seconds'
    FROM public.businesses WHERE estado <> 'arquivado';
  UPDATE public.businesses SET estado='arquivado' WHERE estado <> 'arquivado';
  RETURN jsonb_build_object('ok',true,'count',v_total,'archiveId',v_id);
END; $$;

CREATE OR REPLACE FUNCTION public.nws_ceo_restore_latest(p_pin text, p_confirmation text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, extensions, public, pg_temp AS $$
DECLARE v_user uuid := auth.uid(); v_archive public.nws_ceo_archives%rowtype; v_count integer;
BEGIN
  IF p_confirmation IS DISTINCT FROM 'REPOR ARQUIVO' THEN
    RETURN jsonb_build_object('ok',false,'reason','confirmation');
  END IF;
  IF NOT public.nws_ceo_verify_pin(p_pin) THEN
    RETURN jsonb_build_object('ok',false,'reason','pin_or_permissions');
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('nws_ceo_archive_all'));
  SELECT * INTO v_archive FROM public.nws_ceo_archives
    WHERE actor_id=v_user AND restored_at IS NULL ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'reason','no_archive'); END IF;
  INSERT INTO public.nws_pin_permits(user_id,session_id,table_name,operation,expires_at)
    SELECT v_user,coalesce(auth.jwt()->>'session_id','legacy'),'businesses','UPDATE',now()+interval '120 seconds'
    FROM public.businesses b JOIN jsonb_to_recordset(v_archive.records) AS r(id uuid,estado text) ON b.id=r.id
    WHERE b.estado='arquivado';
  WITH restored AS (
    UPDATE public.businesses b SET estado=(r.estado::public.business_status)
    FROM jsonb_to_recordset(v_archive.records) AS r(id uuid,estado text)
    WHERE b.id=r.id AND b.estado='arquivado' RETURNING b.id
  ) SELECT count(*) INTO v_count FROM restored;
  UPDATE public.nws_ceo_archives SET restored_at=now() WHERE id=v_archive.id;
  RETURN jsonb_build_object('ok',true,'restored',v_count,'original',v_archive.total);
END; $$;

REVOKE ALL ON FUNCTION public.nws_ceo_status() FROM public,anon;
REVOKE ALL ON FUNCTION public.nws_ceo_archive_all(text,text) FROM public,anon;
REVOKE ALL ON FUNCTION public.nws_ceo_restore_latest(text,text) FROM public,anon;
GRANT EXECUTE ON FUNCTION public.nws_ceo_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.nws_ceo_archive_all(text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.nws_ceo_restore_latest(text,text) TO authenticated;
