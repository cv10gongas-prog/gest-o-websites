-- NWS Hub V3: PIN opcional por utilizador, validado no PostgreSQL.
-- EXECUTAR na Lovable Cloud/Supabase APENAS depois de testar em staging.
-- O trigger não exige PIN se o utilizador ainda não ativou esta funcionalidade.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.nws_pin_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pin_hash text not null,
  enabled boolean not null default true,
  fail_count integer not null default 0,
  blocked_until timestamptz,
  changed_at timestamptz not null default now()
);
create table if not exists public.nws_pin_permits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  table_name text not null,
  operation text not null,
  expires_at timestamptz not null default (now() + interval '60 seconds')
);
create index if not exists nws_pin_permits_lookup on public.nws_pin_permits(user_id,session_id,table_name,operation,expires_at);
-- Nenhuma linha/hashes/permissões são consultáveis pelos clientes.
revoke all on public.nws_pin_settings from public, anon, authenticated;
revoke all on public.nws_pin_permits from public, anon, authenticated;
alter table public.nws_pin_settings enable row level security;
alter table public.nws_pin_permits enable row level security;

create or replace function public.nws_pin_status() returns jsonb
language plpgsql security definer set search_path = pg_catalog, extensions, public, pg_temp as $$
declare v_user uuid := auth.uid(); v_row public.nws_pin_settings%rowtype;
begin
  if v_user is null then raise exception 'Sessão necessária' using errcode = '42501'; end if;
  select * into v_row from public.nws_pin_settings where user_id=v_user;
  return jsonb_build_object('available',true,'enabled',coalesce(v_row.enabled,false),
    'blockedUntil',v_row.blocked_until,'configured',found);
end; $$;

create or replace function public.nws_pin_set(p_pin text, p_previous text default null) returns boolean
language plpgsql security definer set search_path = pg_catalog, extensions, public, pg_temp as $$
declare v_user uuid := auth.uid(); v_row public.nws_pin_settings%rowtype;
begin
  if v_user is null then raise exception 'Sessão necessária' using errcode = '42501'; end if;
  if p_pin is null or p_pin !~ '^[0-9]{6,8}$' then raise exception 'O PIN deve ter 6 a 8 algarismos'; end if;
  select * into v_row from public.nws_pin_settings where user_id=v_user for update;
  if found and (v_row.blocked_until is not null and v_row.blocked_until > now()) then
    return false;
  end if;
  if found then
    if p_previous is null or crypt(p_previous,v_row.pin_hash) <> v_row.pin_hash then
      update public.nws_pin_settings set fail_count=fail_count+1,
        blocked_until=case when fail_count+1 >= 5 then now()+interval '15 minutes' else blocked_until end
      where user_id=v_user;
      return false;
    end if;
    update public.nws_pin_settings set pin_hash=crypt(p_pin,gen_salt('bf',10)),
      enabled=true, fail_count=0, blocked_until=null, changed_at=now()
    where user_id=v_user;
  else
    insert into public.nws_pin_settings(user_id,pin_hash)
    values(v_user,crypt(p_pin,gen_salt('bf',10)));
  end if;
  delete from public.nws_pin_permits where user_id=v_user;
  return true;
end; $$;

create or replace function public.nws_pin_disable(p_pin text) returns boolean
language plpgsql security definer set search_path = pg_catalog, extensions, public, pg_temp as $$
declare v_user uuid := auth.uid(); v_row public.nws_pin_settings%rowtype;
begin
  if v_user is null then raise exception 'Sessão necessária' using errcode = '42501'; end if;
  select * into v_row from public.nws_pin_settings where user_id=v_user for update;
  if not found or not v_row.enabled then return false; end if;
  if v_row.blocked_until > now() then return false; end if;
  if p_pin is null or crypt(p_pin,v_row.pin_hash) <> v_row.pin_hash then
    update public.nws_pin_settings set fail_count=fail_count+1,
      blocked_until=case when fail_count+1 >= 5 then now()+interval '15 minutes' else blocked_until end where user_id=v_user;
    return false;
  end if;
  update public.nws_pin_settings set enabled=false,fail_count=0,blocked_until=null,changed_at=now() where user_id=v_user;
  delete from public.nws_pin_permits where user_id=v_user;
  return true;
end; $$;

create or replace function public.nws_pin_authorize(p_pin text,p_table text,p_operation text) returns boolean
language plpgsql security definer set search_path = pg_catalog, extensions, public, pg_temp as $$
declare v_user uuid := auth.uid(); v_row public.nws_pin_settings%rowtype;
begin
  if v_user is null then raise exception 'Sessão necessária' using errcode = '42501'; end if;
  if not (
    (p_table='businesses' and p_operation in ('INSERT','UPDATE','DELETE')) or
    (p_table='tasks' and p_operation in ('UPDATE','DELETE')) or
    (p_table='email_templates' and p_operation='UPDATE') or
    (p_table='projects' and p_operation='UPDATE')
  ) then raise exception 'Operação não autorizada' using errcode='42501'; end if;
  select * into v_row from public.nws_pin_settings where user_id=v_user for update;
  if not found or not v_row.enabled then return true; end if;
  if v_row.blocked_until > now() then return false; end if;
  if p_pin is null or crypt(p_pin,v_row.pin_hash) <> v_row.pin_hash then
    update public.nws_pin_settings set fail_count=fail_count+1,
      blocked_until=case when fail_count+1 >= 5 then now()+interval '15 minutes' else blocked_until end where user_id=v_user;
    return false;
  end if;
  update public.nws_pin_settings set fail_count=0,blocked_until=null where user_id=v_user;
  delete from public.nws_pin_permits where user_id=v_user and expires_at<now();
  insert into public.nws_pin_permits(user_id,session_id,table_name,operation)
  values(v_user,coalesce(auth.jwt()->>'session_id','legacy'),p_table,p_operation);
  return true;
end; $$;

create or replace function public.nws_pin_guard() returns trigger
language plpgsql security definer set search_path = pg_catalog, extensions, public, pg_temp as $$
declare v_user uuid := auth.uid(); v_id uuid; v_enabled boolean;
begin
  -- Serviços administrativos internos sem utilizador JWT continuam a funcionar.
  if v_user is null or pg_trigger_depth() > 1 then
    if TG_OP='DELETE' then return OLD; else return NEW; end if;
  end if;
  select enabled into v_enabled from public.nws_pin_settings where user_id=v_user;
  if not coalesce(v_enabled,false) then
    if TG_OP='DELETE' then return OLD; else return NEW; end if;
  end if;
  select id into v_id from public.nws_pin_permits
  where user_id=v_user and session_id=coalesce(auth.jwt()->>'session_id','legacy') and table_name=TG_TABLE_NAME and operation=TG_OP and expires_at > now()
  order by expires_at limit 1 for update skip locked;
  if v_id is null then raise exception 'NWS_PIN_REQUIRED: confirma esta alteração com o teu PIN' using errcode='42501'; end if;
  delete from public.nws_pin_permits where id=v_id;
  if TG_OP='DELETE' then return OLD; else return NEW; end if;
end; $$;

-- Defesas no backend para operações sensíveis do CRM (não substituem a RLS existente).
drop trigger if exists nws_pin_businesses on public.businesses;
create trigger nws_pin_businesses before insert or update or delete on public.businesses
  for each row execute function public.nws_pin_guard();
drop trigger if exists nws_pin_tasks on public.tasks;
create trigger nws_pin_tasks before update or delete on public.tasks
  for each row execute function public.nws_pin_guard();
drop trigger if exists nws_pin_email_templates on public.email_templates;
create trigger nws_pin_email_templates before update on public.email_templates
  for each row execute function public.nws_pin_guard();
drop trigger if exists nws_pin_projects on public.projects;
create trigger nws_pin_projects before update on public.projects
  for each row execute function public.nws_pin_guard();

revoke execute on function public.nws_pin_status() from public,anon;
revoke execute on function public.nws_pin_set(text,text) from public,anon;
revoke execute on function public.nws_pin_disable(text) from public,anon;
revoke execute on function public.nws_pin_authorize(text,text,text) from public,anon;
revoke execute on function public.nws_pin_guard() from public,anon,authenticated;
grant execute on function public.nws_pin_status() to authenticated;
grant execute on function public.nws_pin_set(text,text) to authenticated;
grant execute on function public.nws_pin_disable(text) to authenticated;
grant execute on function public.nws_pin_authorize(text,text,text) to authenticated;
