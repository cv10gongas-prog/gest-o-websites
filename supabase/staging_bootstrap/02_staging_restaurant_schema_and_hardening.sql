-- ==============================================================================
-- BOOTSTRAP: Supabase Dedicado de Restaurantes (Ambiente de Staging Vazio)
-- ==============================================================================
-- DESTINO: Novo Projeto Supabase de Staging para o Restaurante
-- OBJETIVO: Inicializar a base de dados de restauração a partir do zero com:
--           - Estrutura completa (mesas, ementa, pedidos, reservas)
--           - Dados Fictícios de Demonstração (SEM dados de clientes reais)
--           - RPCs seguras (place_order, request_service, create_reservation, free_table atómica)
--           - Hardening de segurança RLS (sem privilégios anónimos de escrita/eliminação)
-- ==============================================================================

-- 1. TABELAS DE RESTAURANTE E CONFIGURAÇÕES
create table public.restaurants (
  id text primary key,
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.restaurant_settings (
  restaurant_id text primary key references public.restaurants(id) on delete cascade,
  tagline text not null default '',
  introduction text not null default '',
  logo text not null default '',
  primary_color text not null default '#5b6e4a',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  hours text[] not null default '{}',
  features jsonb not null default '{"qrOrders":true,"callWaiter":true,"requestBill":true,"reservations":true}',
  next_order integer not null default 1001,
  updated_at timestamptz not null default now()
);

-- 2. TABELAS DE SALA E EMENTA
create table public.tables (
  id text primary key default gen_random_uuid()::text,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  number integer not null,
  seats integer not null default 4,
  active boolean not null default true,
  unique (restaurant_id, number)
);

create table public.menu_categories (
  id text primary key default gen_random_uuid()::text,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order integer not null default 99
);

create table public.menu_items (
  id text primary key default gen_random_uuid()::text,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  category_id text references public.menu_categories(id) on delete set null,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null default 0,
  image text not null default '',
  available boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 99,
  created_at timestamptz not null default now()
);

-- 3. TABELAS DE PEDIDOS, RESERVAS E CHAMADAS
create table public.orders (
  id text primary key default gen_random_uuid()::text,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  table_id text references public.tables(id) on delete set null,
  table_number integer not null,
  order_number integer not null,
  status text not null default 'recebido' check (status in ('recebido','preparacao','pronto','entregue')),
  note text not null default '',
  total numeric(10,2) not null default 0,
  closed boolean not null default false,
  client_token text not null default gen_random_uuid()::text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id text primary key default gen_random_uuid()::text,
  order_id text not null references public.orders(id) on delete cascade,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  product_id text,
  name text not null,
  price numeric(10,2) not null,
  qty integer not null check (qty between 1 and 50)
);

create table public.reservations (
  id text primary key default gen_random_uuid()::text,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  name text not null,
  phone text not null default '',
  email text not null default '',
  date date not null,
  time text not null,
  guests integer not null check (guests between 1 and 40),
  table_number integer,
  notes text not null default '',
  origin text not null default 'online' check (origin in ('online','telefone')),
  status text not null default 'pendente' check (status in ('pendente','confirmada','chegou','concluida','cancelada')),
  created_at timestamptz not null default now()
);

create table public.service_requests (
  id text primary key default gen_random_uuid()::text,
  restaurant_id text not null references public.restaurants(id) on delete cascade,
  table_id text references public.tables(id) on delete set null,
  table_number integer not null,
  type text not null check (type in ('empregado','conta')),
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. FUNÇÕES SEGURAS (RPCS)
create or replace function public.place_order(_table_id text, _items jsonb, _note text)
returns table (id text, order_number integer, client_token text, total numeric)
language plpgsql security definer set search_path = public as $$
declare
  t record;
  o_id text := gen_random_uuid()::text;
  tok text := gen_random_uuid()::text;
  n integer;
  tot numeric := 0;
  it jsonb;
  p record;
  q integer;
begin
  select * into t from public.tables where tables.id = _table_id and active;
  if not found then raise exception 'Esta mesa não está disponível.'; end if;
  if jsonb_array_length(coalesce(_items,'[]')) = 0 then raise exception 'O pedido está vazio.'; end if;

  update public.restaurant_settings set next_order = next_order + 1 where restaurant_id = t.restaurant_id returning next_order - 1 into n;

  insert into public.orders(id, restaurant_id, table_id, table_number, order_number, note, client_token)
  values (o_id, t.restaurant_id, t.id, t.number, n, left(coalesce(_note,''),300), tok);

  for it in select * from jsonb_array_elements(_items) loop
    select * into p from public.menu_items m where m.id = it->>'id' and m.restaurant_id = t.restaurant_id;
    if not found or not p.available then raise exception 'Um dos pratos já não está disponível.'; end if;
    q := greatest(1, least(50, coalesce((it->>'qty')::int,1)));
    insert into public.order_items(order_id, restaurant_id, product_id, name, price, qty)
    values (o_id, t.restaurant_id, p.id, p.name, p.price, q);
    tot := tot + p.price * q;
  end loop;

  update public.orders set total = tot where orders.id = o_id;
  return query select o_id, n, tok, tot;
end $$;

create or replace function public.create_reservation(_name text, _phone text, _email text, _date date, _time text, _guests int, _notes text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if length(trim(coalesce(_name,''))) = 0 then raise exception 'Indique o nome.'; end if;
  insert into public.reservations(restaurant_id, name, phone, email, date, time, guests, notes, origin, status)
  values ('casa-do-vale', left(_name,120), left(coalesce(_phone,''),40), left(coalesce(_email,''),160), _date, left(_time,5), greatest(1,least(40,_guests)), left(coalesce(_notes,''),500), 'online', 'pendente');
end $$;

create or replace function public.request_service(_table_id text, _type text)
returns void language plpgsql security definer set search_path = public as $$
declare t record;
begin
  select * into t from public.tables where id = _table_id and active;
  if not found then raise exception 'Esta mesa não está disponível.'; end if;
  if _type not in ('empregado','conta') then raise exception 'Pedido inválido.'; end if;
  if exists (select 1 from public.service_requests where table_id = t.id and type = _type and not resolved) then return; end if;
  insert into public.service_requests(restaurant_id, table_id, table_number, type) values (t.restaurant_id, t.id, t.number, _type);
end $$;

create or replace function public.free_table(_restaurant_id text, _number int)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.orders set closed = true, status = 'entregue'
  where restaurant_id = _restaurant_id and table_number = _number and not closed;

  update public.service_requests set resolved = true
  where restaurant_id = _restaurant_id and table_number = _number and not resolved;
end $$;

create or replace function public.reset_demo()
returns void language plpgsql security definer set search_path = public as $$
begin
  raise exception 'A reposição de demonstração só é permitida em ambiente sandbox isolado.';
end $$;

-- 5. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) E HARDENING DE SEGURANÇA
do $$ declare t text; begin
  foreach t in array array['restaurants','restaurant_settings','tables','menu_categories','menu_items','orders','order_items','reservations','service_requests'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Revogar qualquer escrita/delete anónima
revoke all on all tables in schema public from anon, public;
revoke all on function public.free_table(text, int) from public, anon, authenticated;
revoke all on function public.reset_demo() from public, anon, authenticated;

-- Conceder permissões a service_role e leitura de catálogo a anon
grant all on all tables in schema public to service_role;
grant select on public.restaurants, public.restaurant_settings, public.tables, public.menu_categories, public.menu_items to anon, authenticated;

-- Políticas de Leitura Pública
create policy "public_restaurants_read" on public.restaurants for select to anon, authenticated using (true);
create policy "public_settings_read" on public.restaurant_settings for select to anon, authenticated using (true);
create policy "public_categories_read" on public.menu_categories for select to anon, authenticated using (true);
create policy "public_menu_items_read" on public.menu_items for select to anon, authenticated using (available = true);
create policy "public_tables_read" on public.tables for select to anon, authenticated using (active = true);

-- Permissões de Execução nas RPCs de Cliente
grant execute on function public.place_order(text, jsonb, text) to anon, authenticated;
grant execute on function public.request_service(text, text) to anon, authenticated;
grant execute on function public.create_reservation(text, text, text, date, text, int, text) to anon, authenticated;
grant execute on function public.free_table(text, int) to service_role;
grant execute on function public.reset_demo() to service_role;

-- 6. DADOS FICTÍCIOS DE DEMONSTRAÇÃO PARA STAGING
insert into public.restaurants (id, slug, name) values ('casa-do-vale', 'casa-do-vale', 'Casa do Vale (Staging)');

insert into public.restaurant_settings (restaurant_id, tagline, introduction, primary_color, phone, email, address, hours, next_order)
values (
  'casa-do-vale',
  'Cozinha de produto servida sem pressa (Staging)',
  'Ambiente de testes dedicado com pedidos e reservas fictícias.',
  '#5b6e4a', '912 000 000', 'staging@casadovale.pt', 'Rua de Testes 123, Lisboa',
  array['Segunda a Sexta: 12:00 - 15:00 e 19:00 - 23:00', 'Sábado e Domingo: 12:30 - 23:30'],
  1001
);

insert into public.tables (id, restaurant_id, number, seats, active)
select 't'||n, 'casa-do-vale', n, case when n in (3,5,9) then 2 when n >= 10 then 6 else 4 end, true
from unnest(array[1,2,3,4,5,6,7,8,9,10,11,12]) n;

insert into public.menu_categories (id, restaurant_id, name, sort_order) values
  ('entradas', 'casa-do-vale', 'Entradas', 1),
  ('principais', 'casa-do-vale', 'Pratos Principais', 2),
  ('sobremesas', 'casa-do-vale', 'Sobremesas', 3),
  ('bebidas', 'casa-do-vale', 'Bebidas', 4);

insert into public.menu_items (id, restaurant_id, category_id, name, description, price, image, featured, available, sort_order) values
  ('pao', 'casa-do-vale', 'entradas', 'Pão e Azeitonas Fictício', 'Pão rústico de fermentação lenta.', 3.50, 'demo:pao', false, true, 1),
  ('cogumelos', 'casa-do-vale', 'entradas', 'Cogumelos Salteados', 'Com alho e ervas aromáticas.', 7.50, 'demo:cogumelos', false, true, 2),
  ('bife', 'casa-do-vale', 'principais', 'Bife da Casa Grelhado', 'Com batata rústica e salada da época.', 18.50, 'demo:bife', true, true, 3),
  ('polvo', 'casa-do-vale', 'principais', 'Polvo à Lagareiro Teste', 'Polvo assado com batata a murro e azeite.', 21.00, 'demo:polvo', true, true, 4),
  ('risotto', 'casa-do-vale', 'principais', 'Risotto de Cogumelos', 'Arroz cremoso vegetariano.', 16.00, 'demo:risotto', true, true, 5),
  ('mousse', 'casa-do-vale', 'sobremesas', 'Mousse de Chocolate Negro', 'Com flor de sal.', 5.50, 'demo:mousse', false, true, 6),
  ('limonada', 'casa-do-vale', 'bebidas', 'Limonada Caseira', 'Feita na hora com hortelã.', 3.00, 'demo:limonada', false, true, 7);
