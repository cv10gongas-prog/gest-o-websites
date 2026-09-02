-- ENUMS
CREATE TYPE public.app_role AS ENUM ('administrador','colaborador');
CREATE TYPE public.business_status AS ENUM ('por_contactar','tentativa_contacto','aguardar_resposta','email_por_enviar','email_enviado','seguimento','interessado','reuniao','proposta_enviada','em_negociacao','aceite','concluido','nao_interessado','arquivado');
CREATE TYPE public.prioridade AS ENUM ('alta','media','baixa');
CREATE TYPE public.call_outcome AS ENUM ('nao_atendeu','numero_nao_atribuido','numero_errado','nao_quis','interessado','pediu_email','pediu_portefolio','pediu_orcamento','pediu_reuniao','voltar_a_ligar','ferias','falar_superiores','ja_contactado','email_enviado','negocio_fechado','arquivado');
CREATE TYPE public.task_type AS ENUM ('ligar','enviar_email','enviar_portefolio','preparar_orcamento','seguimento','marcar_reuniao','entregar_projeto','outro');
CREATE TYPE public.task_status AS ENUM ('pendente','concluida','cancelada');

-- UPDATED AT
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  nome text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  foto_url text,
  telefone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE POLICY "Equipa vê perfis" ON public.profiles FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));
CREATE POLICY "Utilizador edita o próprio perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Utilizador cria o próprio perfil" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin remove perfis" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'administrador'));

CREATE POLICY "Equipa vê funções" ON public.user_roles FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()) OR user_id = auth.uid());

-- CONVITES
CREATE TABLE public.team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  role public.app_role NOT NULL DEFAULT 'colaborador',
  convidado_por uuid,
  aceite_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_invites TO authenticated;
GRANT ALL ON public.team_invites TO service_role;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipa vê convites" ON public.team_invites FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));
CREATE POLICY "Admin gere convites" ON public.team_invites FOR ALL TO authenticated USING (public.has_role(auth.uid(),'administrador')) WITH CHECK (public.has_role(auth.uid(),'administrador'));

-- NOVO UTILIZADOR
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, nome, email, foto_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), COALESCE(NEW.email,''), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    v_role := 'administrador';
  ELSE
    SELECT role INTO v_role FROM public.team_invites WHERE lower(email) = lower(NEW.email);
    IF v_role IS NULL THEN v_role := 'colaborador'; END IF;
    UPDATE public.team_invites SET aceite_em = now() WHERE lower(email) = lower(NEW.email);
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role) ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- NEGÓCIOS
CREATE TABLE public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text,
  telefone text,
  email text,
  website text,
  website_dominio text,
  google_maps text,
  localidade text,
  responsavel_nome text,
  encontrado_por uuid,
  contactado_por uuid,
  estado public.business_status NOT NULL DEFAULT 'por_contactar',
  prioridade public.prioridade NOT NULL DEFAULT 'media',
  notas text,
  valor_estimado numeric(12,2),
  ultima_interacao timestamptz,
  proxima_acao text,
  data_seguimento timestamptz,
  origem text NOT NULL DEFAULT 'manual',
  is_demo boolean NOT NULL DEFAULT false,
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipa gere negócios" ON public.businesses FOR ALL TO authenticated USING (public.is_team_member(auth.uid())) WITH CHECK (public.is_team_member(auth.uid()));
CREATE TRIGGER trg_businesses_updated BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_businesses_estado ON public.businesses(estado);
CREATE INDEX idx_businesses_nome ON public.businesses(lower(nome));

-- INTERAÇÕES / CHAMADAS
CREATE TABLE public.interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'chamada',
  resultado public.call_outcome,
  notas text,
  proximo_passo text,
  data_proximo_contacto timestamptz,
  realizada_por uuid,
  ocorreu_em timestamptz NOT NULL DEFAULT now(),
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interactions TO authenticated;
GRANT ALL ON public.interactions TO service_role;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipa gere interações" ON public.interactions FOR ALL TO authenticated USING (public.is_team_member(auth.uid())) WITH CHECK (public.is_team_member(auth.uid()));
CREATE INDEX idx_interactions_business ON public.interactions(business_id);

-- OPORTUNIDADES
CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  interaction_id uuid REFERENCES public.interactions(id) ON DELETE SET NULL,
  pretende text,
  tipo_projeto text,
  preco_indicado numeric(12,2),
  orcamento_previsto numeric(12,2),
  email_decisor text,
  portefolio_solicitado boolean NOT NULL DEFAULT false,
  proposta_solicitada boolean NOT NULL DEFAULT false,
  reuniao_online boolean NOT NULL DEFAULT false,
  data_proxima_conversa timestamptz,
  probabilidade integer NOT NULL DEFAULT 50,
  criado_por uuid,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipa gere oportunidades" ON public.opportunities FOR ALL TO authenticated USING (public.is_team_member(auth.uid())) WITH CHECK (public.is_team_member(auth.uid()));
CREATE TRIGGER trg_opportunities_updated BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TAREFAS
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  tipo public.task_type NOT NULL DEFAULT 'outro',
  titulo text NOT NULL,
  notas text,
  responsavel uuid,
  prioridade public.prioridade NOT NULL DEFAULT 'media',
  data_hora timestamptz,
  estado public.task_status NOT NULL DEFAULT 'pendente',
  concluida_em timestamptz,
  criado_por uuid,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipa gere tarefas" ON public.tasks FOR ALL TO authenticated USING (public.is_team_member(auth.uid())) WITH CHECK (public.is_team_member(auth.uid()));
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MODELOS DE EMAIL
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave text NOT NULL UNIQUE,
  nome text NOT NULL,
  assunto text NOT NULL DEFAULT '',
  corpo text NOT NULL DEFAULT '',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipa gere modelos" ON public.email_templates FOR ALL TO authenticated USING (public.is_team_member(auth.uid())) WITH CHECK (public.is_team_member(auth.uid()));
CREATE TRIGGER trg_templates_updated BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PROJETOS (PORTEFÓLIO)
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id bigint UNIQUE,
  nome text NOT NULL,
  descricao text,
  imagem_url text,
  tecnologias text[] NOT NULL DEFAULT '{}',
  repo_url text,
  site_url text,
  categoria text,
  destaque boolean NOT NULL DEFAULT false,
  visivel boolean NOT NULL DEFAULT false,
  atualizado_em timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projetos visíveis são públicos" ON public.projects FOR SELECT TO anon, authenticated USING (visivel = true);
CREATE POLICY "Equipa gere projetos" ON public.projects FOR ALL TO authenticated USING (public.is_team_member(auth.uid())) WITH CHECK (public.is_team_member(auth.uid()));
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PEDIDOS DO WEBSITE
CREATE TABLE public.website_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  empresa text,
  email text NOT NULL,
  telefone text,
  tipo_projeto text,
  orcamento text,
  mensagem text,
  quer_reuniao boolean NOT NULL DEFAULT false,
  tratado boolean NOT NULL DEFAULT false,
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.website_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.website_requests TO authenticated;
GRANT ALL ON public.website_requests TO service_role;
ALTER TABLE public.website_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Qualquer pessoa envia pedido" ON public.website_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Equipa vê pedidos" ON public.website_requests FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));
CREATE POLICY "Equipa atualiza pedidos" ON public.website_requests FOR UPDATE TO authenticated USING (public.is_team_member(auth.uid())) WITH CHECK (public.is_team_member(auth.uid()));
CREATE POLICY "Equipa apaga pedidos" ON public.website_requests FOR DELETE TO authenticated USING (public.is_team_member(auth.uid()));

-- HISTÓRICO
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  entidade text NOT NULL,
  entidade_id uuid,
  accao text NOT NULL,
  detalhe text,
  autor uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipa vê histórico" ON public.activity_log FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));
CREATE POLICY "Equipa regista histórico" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (public.is_team_member(auth.uid()));
CREATE INDEX idx_activity_business ON public.activity_log(business_id);

-- DEFINIÇÕES
CREATE TABLE public.app_settings (
  chave text PRIMARY KEY,
  valor text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipa vê definições" ON public.app_settings FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));
CREATE POLICY "Equipa gere definições" ON public.app_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'administrador')) WITH CHECK (public.has_role(auth.uid(),'administrador'));

-- MODELOS DE EMAIL BASE
INSERT INTO public.email_templates (chave, nome, assunto, corpo) VALUES
('nao_atendeu','Não atendeu','Tentativa de contacto — {{negocio}}','Bom dia,

Tentei contactá-los por telefone hoje mas não consegui falar convosco.
Chamo-me {{utilizador}} e desenvolvo websites para negócios locais em {{localidade}}.

Fico disponível para uma conversa rápida quando for mais conveniente.

Cumprimentos,
{{utilizador}}'),
('apresentacao','Apresentação inicial','Website para a {{negocio}}','Bom dia {{responsavel}},

Chamo-me {{utilizador}} e desenvolvo websites modernos para negócios locais.
Reparei que a {{negocio}} podia beneficiar de uma presença online mais forte.

Posso mostrar-lhe alguns exemplos do meu trabalho sem qualquer compromisso.

Cumprimentos,
{{utilizador}}'),
('portefolio','Envio de portefólio','Portefólio — alguns trabalhos recentes','Bom dia {{responsavel}},

Conforme combinado, envio alguns exemplos de trabalhos recentes:

{{projetos}}

Fico à espera do seu feedback.

Cumprimentos,
{{utilizador}}'),
('orcamento','Envio de orçamento','Proposta para a {{negocio}}','Bom dia {{responsavel}},

Segue a proposta para o website da {{negocio}}:

- Desenvolvimento completo do website
- Versão para telemóvel
- Otimização para o Google

Valor: {{valor}}

Cumprimentos,
{{utilizador}}'),
('seguimento','Seguimento','Seguimento — {{negocio}}','Bom dia {{responsavel}},

Venho apenas saber se teve oportunidade de analisar a informação que enviei sobre o website da {{negocio}}.

Cumprimentos,
{{utilizador}}'),
('reuniao','Confirmação de reunião online','Reunião online — {{negocio}}','Bom dia {{responsavel}},

Confirmo a nossa reunião online. Envio o link de acesso mais perto da data.

Cumprimentos,
{{utilizador}}');

-- PERMISSÕES DE FUNÇÕES
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_team_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_team_member(uuid) TO authenticated, service_role;

-- CAMPOS ADICIONAIS
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS pessoa_contacto text;
ALTER TABLE public.interactions ADD COLUMN IF NOT EXISTS duracao_min integer;
ALTER TABLE public.interactions ADD COLUMN IF NOT EXISTS pessoa_contactada text;
ALTER TABLE public.interactions ADD COLUMN IF NOT EXISTS funcao text;