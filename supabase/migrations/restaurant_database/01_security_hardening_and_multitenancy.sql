-- ==============================================================================
-- MIGRAÇÃO DE SEGURANÇA E HARDENING: Base de Dados do Restaurante
-- ==============================================================================
-- DESTINO: Supabase Dedicado de Restaurantes (lehvydmzzdotmhwzqcwf)
-- PROJETO: Projeto onde residem as tabelas de mesas, ementa, pedidos e reservas.
-- OBJETIVO:
--   1. Eliminar completamente privilégios anónimos de escrita/eliminação.
--   2. Restringir leitura anónima apenas à ementa ativa e mesas ativas.
--   3. Proteger privacidade: pedidos e reservas deixam de ter leitura pública direta.
--   4. Eliminar versão antiga de free_table(int) e criar free_table atómica multi-restaurante.
--   5. Revogar privilégios herdados de PUBLIC em todas as funções SECURITY DEFINER.
-- ==============================================================================

-- SALVAGUARDA CONTRA EXECUÇÃO NO PROJETO ERRADO
do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'restaurant_settings') then
    raise exception 'ERRO DE SEGURANÇA: Este script deve ser executado exclusivamente no SUPABASE DEDICADO DE RESTAURANTES (onde existe a tabela restaurant_settings). Operação abortada.';
  end if;
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'user_roles') then
    raise exception 'ERRO DE SEGURANÇA: Detetada a tabela user_roles. Este script NÃO pode ser executado no Supabase Central do Workspace. Operação abortada.';
  end if;
end $$;

-- 1. REVOGAR PRIVILÉGIOS DE ESCRITA ANÓNIMA EM TODAS AS TABELAS
revoke insert, update, delete on public.restaurants from anon, public;
revoke insert, update, delete on public.restaurant_settings from anon, public;
revoke insert, update, delete on public.tables from anon, public;
revoke insert, update, delete on public.menu_categories from anon, public;
revoke insert, update, delete on public.menu_items from anon, public;
revoke insert, update, delete on public.orders from anon, public;
revoke insert, update, delete on public.order_items from anon, public;
revoke insert, update, delete on public.reservations from anon, public;
revoke insert, update, delete on public.service_requests from anon, public;

-- Revogar leitura anónima direta em dados sensíveis de clientes, histórico e operações
revoke select on public.orders, public.order_items, public.reservations, public.service_requests from anon, public;

-- Conceder permissões totais a service_role (usado pelas Server Functions do Workspace)
grant all on all tables in schema public to service_role;
grant select on public.restaurants, public.restaurant_settings, public.tables, public.menu_categories, public.menu_items to anon, authenticated;

-- 2. ELIMINAR POLÍTICAS RLS INSEGURAS
drop policy if exists "read" on public.restaurants;
drop policy if exists "read" on public.restaurant_settings;
drop policy if exists "read" on public.tables;
drop policy if exists "read" on public.menu_categories;
drop policy if exists "read" on public.menu_items;
drop policy if exists "read" on public.orders;
drop policy if exists "read" on public.order_items;
drop policy if exists "read" on public.reservations;
drop policy if exists "read" on public.service_requests;

drop policy if exists "write" on public.restaurant_settings;
drop policy if exists "update" on public.restaurant_settings;
drop policy if exists "delete" on public.restaurant_settings;

drop policy if exists "write" on public.tables;
drop policy if exists "update" on public.tables;
drop policy if exists "delete" on public.tables;

drop policy if exists "write" on public.menu_categories;
drop policy if exists "update" on public.menu_categories;
drop policy if exists "delete" on public.menu_categories;

drop policy if exists "write" on public.menu_items;
drop policy if exists "update" on public.menu_items;
drop policy if exists "delete" on public.menu_items;

drop policy if exists "write" on public.reservations;
drop policy if exists "update" on public.reservations;
drop policy if exists "delete" on public.reservations;

drop policy if exists "write" on public.service_requests;
drop policy if exists "update" on public.service_requests;
drop policy if exists "delete" on public.service_requests;

drop policy if exists "update" on public.restaurants;
drop policy if exists "update" on public.orders;

-- 3. CRIAR POLÍTICAS RLS SEGURAS PARA LEITURA PÚBLICA (Catálogo Aberto)
create policy "public_restaurants_read" on public.restaurants
  for select to anon, authenticated using (true);

create policy "public_settings_read" on public.restaurant_settings
  for select to anon, authenticated using (true);

create policy "public_categories_read" on public.menu_categories
  for select to anon, authenticated using (true);

create policy "public_menu_items_read" on public.menu_items
  for select to anon, authenticated using (available = true);

create policy "public_tables_read" on public.tables
  for select to anon, authenticated using (active = true);

-- 4. ELIMINAR VERSÃO ANTIGA DE free_table(int) E CRIAR VERSÃO ATÓMICA PROTEGIDA
drop function if exists public.free_table(int);

create or replace function public.free_table(_restaurant_id text, _number int)
returns void language plpgsql security definer set search_path = public as $$
begin
  -- Fecho de pedidos em aberto estritamente do restaurante indicado (atómico)
  update public.orders
  set closed = true, status = 'entregue'
  where restaurant_id = _restaurant_id and table_number = _number and not closed;

  -- Resolução de chamadas de assistência estritamente do restaurante indicado (atómico)
  update public.service_requests
  set resolved = true
  where restaurant_id = _restaurant_id and table_number = _number and not resolved;
end;
$$;

-- Revogação explícita de PUBLIC / anon / authenticated em free_table
revoke all on function public.free_table(text, int) from public, anon, authenticated;
grant execute on function public.free_table(text, int) to service_role;

-- 5. PROTEGER RESET_DEMO (Revogação total de PUBLIC e concessão estrita a Service Role)
revoke all on function public.reset_demo() from public, anon, authenticated;
grant execute on function public.reset_demo() to service_role;

-- 6. ASSEGURAR FUNCIONAMENTO SEGURO DAS RPCS DE CLIENTE NOS QR CODES
grant execute on function public.place_order(text, jsonb, text) to anon, authenticated;
grant execute on function public.request_service(text, text) to anon, authenticated;
grant execute on function public.create_reservation(text, text, text, date, text, int, text) to anon, authenticated;

-- 7. STORAGE: Upload apenas via Service Role (Server Function do Workspace)
drop policy if exists "media upload" on storage.objects;
create policy "media upload service role" on storage.objects
  for insert to service_role with check (bucket_id = 'restaurant-media');
