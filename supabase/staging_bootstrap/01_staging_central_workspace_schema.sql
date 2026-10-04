-- ==============================================================================
-- BOOTSTRAP COMPLETO: Supabase Central do Workspace (Ambiente de Staging Vazio)
-- ==============================================================================
-- DESTINO: Projeto Supabase de Staging para o Workspace Central
-- OBJETIVO: Inicializar a base de dados central a partir do zero com o esquema
--           integral do CRM, Auditoria de Segurança, Catálogo de Restaurantes
--           e Afiliações RBAC.
-- NOTA: O administrador de teste é atribuído EXPLICITAMENTE na Seção 10.
--       Nenhum utilizador anónimo se torna administrador automaticamente.
-- ==============================================================================

-- 1. TIPOS ENUMERADOS
create type public.app_role as enum ('administrador', 'colaborador');
create type public.business_status as enum (
  'por_contactar', 'tentativa_contacto', 'aguardar_resposta',
  'email_por_enviar', 'email_enviado', 'seguimento',
  'interessado', 'reuniao', 'proposta_enviada',
  'em_negociacao', 'aceite', 'concluido',
  'nao_interessado', 'arquivado'
);
create type public.prioridade as enum ('alta', 'media', 'baixa');
create type public.call_outcome as enum (
  'nao_atendeu', 'numero_nao_atribuido', 'numero_errado', 'nao_quis',
  'interessado', 'pediu_email', 'pediu_portefolio', 'pediu_orcamento',
  'pediu_reuniao', 'voltar_a_ligar', 'ferias', 'falar_superiores',
  'ja_contactado', 'email_enviado', 'negocio_fechado', 'arquivado'
);
create type public.task_type as enum (
  'ligar', 'enviar_email', 'enviar_portefolio', 'preparar_orcamento',
  'seguimento', 'marcar_reuniao', 'entregar_projeto', 'outro'
);
create type public.task_status as enum ('pendente', 'concluida', 'cancelada');

-- 2. FUNÇÃO UTILITÁRIA UPDATED_AT
create or replace function public.update_updated_at_column() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- 3. TABELA PROFILES (Perfis de Utilizador)
create table public.profiles (
  id uuid primary key,
  nome text not null default '',
  email text not null default '',
  foto_url text,
  telefone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- 4. TABELA USER_ROLES (Funções Centrais do Workspace)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

-- 5. FUNÇÕES DE VERIFICAÇÃO RBAC
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create or replace function public.is_team_member(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id);
$$;

create policy "Equipa vê perfis" on public.profiles for select to authenticated using (public.is_team_member(auth.uid()));
create policy "Utilizador edita o próprio perfil" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Utilizador cria o próprio perfil" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Admin remove perfis" on public.profiles for delete to authenticated using (public.has_role(auth.uid(), 'administrador'));
create policy "Equipa vê funções" on public.user_roles for select to authenticated using (public.is_team_member(auth.uid()) or user_id = auth.uid());

-- 6. CONVITES DE EQUIPA CENTRAL
create table public.team_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role public.app_role not null default 'colaborador',
  convidado_por uuid,
  aceite_em timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.team_invites to authenticated;
grant all on public.team_invites to service_role;
alter table public.team_invites enable row level security;
create policy "Equipa vê convites" on public.team_invites for select to authenticated using (public.is_team_member(auth.uid()));
create policy "Admin gere convites" on public.team_invites for all to authenticated using (public.has_role(auth.uid(), 'administrador')) with check (public.has_role(auth.uid(), 'administrador'));

-- 7. TRIGGER DE NOVO UTILIZADOR (NUNCA atribui administrador automaticamente)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_role public.app_role;
begin
  insert into public.profiles (id, nome, email, foto_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  -- Se o email estiver em team_invites, atribui a role convidada
  select role into v_role from public.team_invites where lower(email) = lower(new.email);
  if v_role is not null then
    update public.team_invites set aceite_em = now() where lower(email) = lower(new.email);
  end if;

  -- Se não tiver convite nem função, fica sem função central (apenas perfil base)
  if v_role is not null then
    insert into public.user_roles (user_id, role) values (new.id, v_role) on conflict do nothing;
  end if;

  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- 8. TABELAS DO CRM
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text,
  telefone text,
  email text,
  website text,
  website_dominio text,
  google_maps text,
  localidade text,
  responsavel_nome text,
  encontrado_por uuid references public.profiles(id) on delete set null,
  contactado_por uuid references public.profiles(id) on delete set null,
  estado public.business_status not null default 'por_contactar',
  prioridade public.prioridade not null default 'media',
  notas text,
  valor_estimado numeric(12,2),
  ultima_interacao timestamptz,
  proxima_acao text,
  data_seguimento timestamptz,
  origem text not null default 'manual',
  is_demo boolean not null default false,
  criado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.businesses to authenticated;
grant all on public.businesses to service_role;
alter table public.businesses enable row level security;
create policy "Equipa gere negócios" on public.businesses for all to authenticated using (public.is_team_member(auth.uid())) with check (public.is_team_member(auth.uid()));
create trigger trg_businesses_updated before update on public.businesses for each row execute function public.update_updated_at_column();
create index idx_businesses_estado on public.businesses(estado);
create index idx_businesses_nome on public.businesses(lower(nome));

create table public.interactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  tipo text not null default 'chamada',
  resultado public.call_outcome,
  notas text,
  proximo_passo text,
  data_proximo_contacto timestamptz,
  realizada_por uuid references public.profiles(id) on delete set null,
  ocorreu_em timestamptz not null default now(),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.interactions to authenticated;
grant all on public.interactions to service_role;
alter table public.interactions enable row level security;
create policy "Equipa gere interações" on public.interactions for all to authenticated using (public.is_team_member(auth.uid())) with check (public.is_team_member(auth.uid()));
create index idx_interactions_business on public.interactions(business_id);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  interaction_id uuid references public.interactions(id) on delete set null,
  pretende text,
  tipo_projeto text,
  preco_indicado numeric(12,2),
  orcamento_previsto numeric(12,2),
  email_decisor text,
  portefolio_solicitado boolean not null default false,
  proposta_solicitada boolean not null default false,
  reuniao_online boolean not null default false,
  data_proxima_conversa timestamptz,
  probabilidade integer not null default 50,
  criado_por uuid references public.profiles(id) on delete set null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.opportunities to authenticated;
grant all on public.opportunities to service_role;
alter table public.opportunities enable row level security;
create policy "Equipa gere oportunidades" on public.opportunities for all to authenticated using (public.is_team_member(auth.uid())) with check (public.is_team_member(auth.uid()));
create trigger trg_opportunities_updated before update on public.opportunities for each row execute function public.update_updated_at_column();

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  tipo public.task_type not null default 'outro',
  titulo text not null,
  notas text,
  responsavel uuid references public.profiles(id) on delete set null,
  prioridade public.prioridade not null default 'media',
  data_hora timestamptz,
  estado public.task_status not null default 'pendente',
  concluida_em timestamptz,
  criado_por uuid references public.profiles(id) on delete set null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;
alter table public.tasks enable row level security;
create policy "Equipa gere tarefas" on public.tasks for all to authenticated using (public.is_team_member(auth.uid())) with check (public.is_team_member(auth.uid()));
create trigger trg_tasks_updated before update on public.tasks for each row execute function public.update_updated_at_column();

create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  chave text not null unique,
  nome text not null,
  assunto text not null default '',
  corpo text not null default '',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.email_templates to authenticated;
grant all on public.email_templates to service_role;
alter table public.email_templates enable row level security;
create policy "Equipa gere modelos" on public.email_templates for all to authenticated using (public.is_team_member(auth.uid())) with check (public.is_team_member(auth.uid()));
create trigger trg_templates_updated before update on public.email_templates for each row execute function public.update_updated_at_column();

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  repo_id bigint unique,
  nome text not null,
  descricao text,
  imagem_url text,
  tecnologias text[] not null default '{}',
  repo_url text,
  site_url text,
  categoria text,
  destaque boolean not null default false,
  visivel boolean not null default false,
  atualizado_em timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;
create policy "Projetos visíveis são públicos" on public.projects for select to anon, authenticated using (visivel = true);
create policy "Equipa gere projetos" on public.projects for all to authenticated using (public.is_team_member(auth.uid())) with check (public.is_team_member(auth.uid()));
create trigger trg_projects_updated before update on public.projects for each row execute function public.update_updated_at_column();

create table public.website_requests (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  empresa text,
  email text not null,
  telefone text,
  tipo_projeto text,
  orcamento text,
  mensagem text,
  origem text default 'formulario_site',
  ip_address text,
  user_agent text,
  tratado boolean not null default false,
  tratado_por uuid references public.profiles(id) on delete set null,
  tratado_em timestamptz,
  business_id uuid references public.businesses(id) on delete set null,
  notas text,
  criado_em timestamptz not null default now()
);
grant select, insert, update, delete on public.website_requests to authenticated;
grant insert on public.website_requests to anon;
grant all on public.website_requests to service_role;
alter table public.website_requests enable row level security;
create policy "Equipa vê pedidos site" on public.website_requests for all to authenticated using (public.is_team_member(auth.uid()));
create policy "Público cria pedidos de contacto" on public.website_requests for insert to anon, authenticated with check (true);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  entidade text not null default 'negocio',
  entidade_id text,
  accao text not null,
  detalhe text,
  autor uuid references public.profiles(id) on delete set null,
  criado_em timestamptz not null default now()
);
grant select, insert on public.activity_log to authenticated, anon;
grant all on public.activity_log to service_role;
alter table public.activity_log enable row level security;
create policy "Equipa vê logs" on public.activity_log for select to authenticated using (public.is_team_member(auth.uid()));
create policy "Sistema insere logs" on public.activity_log for insert to authenticated, anon with check (true);

create table public.security_login_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  ip text,
  pais text,
  cidade text,
  user_agent text,
  sucesso boolean not null default false,
  motivo text,
  created_at timestamptz not null default now()
);
grant select, insert on public.security_login_attempts to authenticated, anon;
grant all on public.security_login_attempts to service_role;
alter table public.security_login_attempts enable row level security;
create policy "Admin vê auditoria segurança" on public.security_login_attempts for select to authenticated using (public.has_role(auth.uid(), 'administrador'));
create policy "Sistema regista tentativas" on public.security_login_attempts for insert to authenticated, anon with check (true);

-- 9. CATÁLOGO CENTRAL DE RESTAURANTES & AFILIAÇÕES (RBAC)
create table public.crm_restaurants (
  id text primary key,
  nome text not null,
  slug text not null unique,
  subdominio text not null default '',
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
alter table public.crm_restaurants enable row level security;
grant select on public.crm_restaurants to authenticated;
grant all on public.crm_restaurants to service_role;

create table public.restaurant_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_id text not null references public.crm_restaurants(id) on delete cascade,
  role text not null check (role in ('proprietario', 'gerente', 'cozinha', 'sala')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  criado_por uuid references auth.users(id) on delete set null,
  unique(user_id, restaurant_id)
);
alter table public.restaurant_memberships enable row level security;
grant select on public.restaurant_memberships to authenticated;
grant all on public.restaurant_memberships to service_role;

create table public.restaurant_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  restaurant_id text not null references public.crm_restaurants(id) on delete cascade,
  role text not null check (role in ('proprietario', 'gerente', 'cozinha', 'sala')),
  token text not null unique default gen_random_uuid()::text,
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null default (now() + interval '7 days'),
  aceite boolean not null default false,
  criado_por uuid references auth.users(id) on delete set null
);
alter table public.restaurant_invites enable row level security;
grant select on public.restaurant_invites to authenticated;
grant all on public.restaurant_invites to service_role;

create policy "crm_restaurants_admin_all" on public.crm_restaurants for all to authenticated using (public.has_role(auth.uid(), 'administrador'));
create policy "crm_restaurants_staff_read" on public.crm_restaurants for select to authenticated using (
  exists (select 1 from public.restaurant_memberships where user_id = auth.uid() and restaurant_id = crm_restaurants.id and ativo)
);
create policy "restaurant_memberships_admin_all" on public.restaurant_memberships for all to authenticated using (public.has_role(auth.uid(), 'administrador'));
create policy "restaurant_memberships_self_read" on public.restaurant_memberships for select to authenticated using (user_id = auth.uid());
create policy "restaurant_invites_admin_all" on public.restaurant_invites for all to authenticated using (public.has_role(auth.uid(), 'administrador'));

-- 10. DADOS FICTÍCIOS DE INICIALIZAÇÃO DE STAGING (SEM DADOS REAIS)
insert into public.crm_restaurants (id, nome, slug, subdominio, ativo)
values
  ('casa-do-vale', 'Casa do Vale (Staging Demo)', 'casa-do-vale', 'restaurante.novawebstudio.pt', true),
  ('tasca-do-rio', 'Tasca do Rio (Staging Demo 2)', 'tasca-do-rio', 'tasca-do-rio.novawebstudio.pt', true)
on conflict (id) do nothing;

insert into public.businesses (nome, categoria, localidade, estado, prioridade, valor_estimado, notas, is_demo)
values
  ('Restaurante Fictício Staging Alpha', 'Restauração', 'Lisboa', 'em_negociacao', 'alta', 2400.00, 'Cliente de teste para o ambiente de staging.', true),
  ('Clube Desportivo Teste Staging', 'Desporto', 'Porto', 'interessado', 'media', 1800.00, 'Clube para teste de modelação do NWS Match.', true),
  ('Café & Snack Staging Beta', 'Cafetaria', 'Coimbra', 'por_contactar', 'baixa', 950.00, 'Lead fictícia para demonstração.', true)
on conflict do nothing;

-- 11. INSTRUÇÃO PARA ATRIBUIR ADMINISTRADOR EXPLÍCITO (Substituir pelo ID do utilizador criado)
-- insert into public.user_roles (user_id, role) values ('<ID_DO_UTILIZADOR_ADMINISTRADOR>', 'administrador');
