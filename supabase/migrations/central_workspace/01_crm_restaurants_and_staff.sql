-- ==============================================================================
-- MIGRAÇÃO CENTRAL DO WORKSPACE: Gestão de Restaurantes e Membros
-- ==============================================================================
-- DESTINO: Supabase Central do Workspace (Nova Web Studio)
-- PROJETO: Projeto principal onde residem auth.users, profiles e user_roles.
-- OBJETIVO: Criar catálogo central de restaurantes, afiliações de funcionários
--           e convites por email.
-- ==============================================================================

-- SALVAGUARDA CONTRA EXECUÇÃO NO PROJETO ERRADO
do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'profiles') then
    raise exception 'ERRO DE SEGURANÇA: Este script deve ser executado exclusivamente no SUPABASE CENTRAL DO WORKSPACE (onde existe a tabela profiles). Operação abortada.';
  end if;
end $$;

-- 1. Catálogo de restaurantes geridos pela Nova Web Studio
create table if not exists public.crm_restaurants (
  id text primary key, -- ex: 'casa-do-vale'
  nome text not null,
  slug text not null unique,
  subdominio text not null default '', -- ex: 'restaurante.novawebstudio.pt'
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Inserir restaurante predefinido
insert into public.crm_restaurants (id, nome, slug, subdominio, ativo)
values ('casa-do-vale', 'Casa do Vale', 'casa-do-vale', 'restaurante.novawebstudio.pt', true)
on conflict (id) do update set
  nome = excluded.nome,
  slug = excluded.slug,
  subdominio = excluded.subdominio;

-- 2. Afiliação de funcionários e níveis de acesso (RBAC)
create table if not exists public.restaurant_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_id text not null references public.crm_restaurants(id) on delete cascade,
  role text not null check (role in ('proprietario', 'gerente', 'cozinha', 'sala')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  criado_por uuid references auth.users(id) on delete set null,
  unique(user_id, restaurant_id)
);

-- 3. Convites pendentes por email
create table if not exists public.restaurant_invites (
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

-- 4. Índices
create index if not exists idx_restaurant_memberships_user on public.restaurant_memberships(user_id);
create index if not exists idx_restaurant_memberships_rest on public.restaurant_memberships(restaurant_id);
create index if not exists idx_restaurant_invites_email on public.restaurant_invites(email);

-- 5. Row Level Security (RLS)
alter table public.crm_restaurants enable row level security;
alter table public.restaurant_memberships enable row level security;
alter table public.restaurant_invites enable row level security;

-- Políticas: Apenas administradores NWS têm acesso total; funcionários lêem os seus registos
create policy "crm_restaurants_admin_all" on public.crm_restaurants
  for all to authenticated
  using (
    exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'administrador')
  );

create policy "crm_restaurants_staff_read" on public.crm_restaurants
  for select to authenticated
  using (
    exists (
      select 1 from public.restaurant_memberships
      where user_id = auth.uid() and restaurant_id = crm_restaurants.id and ativo
    )
  );

create policy "restaurant_memberships_admin_all" on public.restaurant_memberships
  for all to authenticated
  using (
    exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'administrador')
  );

create policy "restaurant_memberships_self_read" on public.restaurant_memberships
  for select to authenticated
  using (user_id = auth.uid());

create policy "restaurant_invites_admin_all" on public.restaurant_invites
  for all to authenticated
  using (
    exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'administrador')
  );
