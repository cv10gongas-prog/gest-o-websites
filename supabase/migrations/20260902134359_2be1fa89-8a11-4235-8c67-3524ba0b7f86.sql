CREATE TABLE public.business_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  nome text NOT NULL,
  caminho text NOT NULL,
  tamanho bigint NOT NULL DEFAULT 0,
  versao text,
  notas text,
  carregado_por uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_files TO authenticated;
GRANT ALL ON public.business_files TO service_role;

ALTER TABLE public.business_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipa gere ficheiros de projeto"
ON public.business_files FOR ALL TO authenticated
USING (public.is_team_member(auth.uid()))
WITH CHECK (public.is_team_member(auth.uid()));

CREATE TRIGGER update_business_files_updated_at
BEFORE UPDATE ON public.business_files
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX business_files_business_id_idx ON public.business_files(business_id);

CREATE POLICY "Equipa vê ficheiros no armazenamento"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'projetos' AND public.is_team_member(auth.uid()));

CREATE POLICY "Equipa carrega ficheiros no armazenamento"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'projetos' AND public.is_team_member(auth.uid()));

CREATE POLICY "Equipa atualiza ficheiros no armazenamento"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'projetos' AND public.is_team_member(auth.uid()));

CREATE POLICY "Equipa remove ficheiros no armazenamento"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'projetos' AND public.is_team_member(auth.uid()));