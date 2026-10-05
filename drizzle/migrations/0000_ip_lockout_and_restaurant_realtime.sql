-- 1. Tempo real para o NWS Restaurantes
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['restaurants','restaurant_settings','menu_categories','menu_items','tables','orders','order_items','reservations','service_requests'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename=t) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- 2. Bloqueio de IP após 3 tentativas falhadas
CREATE TABLE public.security_ip_blocks (
  ip text PRIMARY KEY,
  failed_count integer NOT NULL DEFAULT 0,
  blocked boolean NOT NULL DEFAULT false,
  blocked_at timestamptz,
  last_email text,
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  unblocked_by uuid,
  unblocked_at timestamptz
);
GRANT SELECT, UPDATE, DELETE ON public.security_ip_blocks TO authenticated;
GRANT ALL ON public.security_ip_blocks TO service_role;
ALTER TABLE public.security_ip_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipa vê IPs bloqueados" ON public.security_ip_blocks FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));
CREATE POLICY "Administradores desbloqueiam IPs" ON public.security_ip_blocks FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'administrador')) WITH CHECK (public.has_role(auth.uid(), 'administrador'));
CREATE POLICY "Administradores removem IPs" ON public.security_ip_blocks FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'administrador'));

-- IP real do pedido, lido dos cabeçalhos do proxy (o cliente não o escolhe)
CREATE OR REPLACE FUNCTION public.request_client_ip()
RETURNS text LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT NULLIF(btrim(COALESCE(
    current_setting('request.headers', true)::json->>'cf-connecting-ip',
    current_setting('request.headers', true)::json->>'x-real-ip',
    split_part(current_setting('request.headers', true)::json->>'x-forwarded-for', ',', 1)
  )), '');
$$;

CREATE OR REPLACE FUNCTION public.login_ip_blocked()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT blocked FROM public.security_ip_blocks WHERE ip = public.request_client_ip()), false);
$$;

CREATE OR REPLACE FUNCTION public.register_login_failure(p_email text, p_user_agent text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_ip text := COALESCE(public.request_client_ip(), 'desconhecido'); v_blocked boolean;
BEGIN
  INSERT INTO public.security_login_attempts (email, ip, user_agent, motivo)
  VALUES (left(lower(btrim(COALESCE(p_email,''))), 255), v_ip, left(p_user_agent, 500), 'Credenciais rejeitadas');

  INSERT INTO public.security_ip_blocks AS b (ip, failed_count, last_email, last_attempt_at)
  VALUES (v_ip, 1, left(lower(btrim(COALESCE(p_email,''))), 255), now())
  ON CONFLICT (ip) DO UPDATE SET
    failed_count = CASE WHEN b.last_attempt_at < now() - interval '24 hours' AND NOT b.blocked THEN 1 ELSE b.failed_count + 1 END,
    last_email = EXCLUDED.last_email,
    last_attempt_at = now();

  UPDATE public.security_ip_blocks SET blocked = true, blocked_at = COALESCE(blocked_at, now())
  WHERE ip = v_ip AND failed_count >= 3 AND NOT blocked;

  SELECT blocked INTO v_blocked FROM public.security_ip_blocks WHERE ip = v_ip;
  RETURN COALESCE(v_blocked, false);
END $$;

CREATE OR REPLACE FUNCTION public.register_login_success()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.security_ip_blocks SET failed_count = 0
  WHERE ip = public.request_client_ip() AND NOT blocked AND auth.uid() IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.login_ip_blocked() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.register_login_failure(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.register_login_success() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.login_ip_blocked() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_login_failure(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_login_success() TO authenticated;