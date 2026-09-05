CREATE TABLE IF NOT EXISTS public.security_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  email text NOT NULL
    CHECK (char_length(email) <= 320),

  ip text
    CHECK (ip IS NULL OR char_length(ip) <= 100),

  pais text
    CHECK (pais IS NULL OR char_length(pais) <= 10),

  cidade text
    CHECK (cidade IS NULL OR char_length(cidade) <= 200),

  user_agent text
    CHECK (user_agent IS NULL OR char_length(user_agent) <= 500),

  motivo text NOT NULL DEFAULT 'Credenciais rejeitadas'
    CHECK (char_length(motivo) <= 200),

  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT
ON public.security_login_attempts
TO anon, authenticated;

GRANT SELECT
ON public.security_login_attempts
TO authenticated;

GRANT ALL
ON public.security_login_attempts
TO service_role;

ALTER TABLE public.security_login_attempts
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registar tentativas de login"
ON public.security_login_attempts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Equipa vê tentativas de login"
ON public.security_login_attempts
FOR SELECT
TO authenticated
USING (
  public.is_team_member(auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_security_attempts_created
ON public.security_login_attempts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_attempts_ip
ON public.security_login_attempts(ip);
