CREATE TABLE public.security_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip text,
  pais text,
  cidade text,
  user_agent text,
  motivo text DEFAULT 'Credenciais rejeitadas',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.security_login_attempts TO anon;
GRANT SELECT, INSERT ON public.security_login_attempts TO authenticated;
GRANT ALL ON public.security_login_attempts TO service_role;

ALTER TABLE public.security_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa regista tentativa falhada"
ON public.security_login_attempts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Equipa vê tentativas falhadas"
ON public.security_login_attempts
FOR SELECT
TO authenticated
USING (public.is_team_member(auth.uid()));