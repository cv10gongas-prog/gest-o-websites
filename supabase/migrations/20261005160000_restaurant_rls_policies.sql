BEGIN;

-- ============================================================
-- NWS RESTAURANTES
-- RLS para o Workspace privado
-- Sem anon. Sem service role necessário no runtime.
-- ============================================================

CREATE OR REPLACE FUNCTION public.can_access_restaurant(
  _restaurant_id text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role = 'administrador'
      )
      OR EXISTS (
        SELECT 1
        FROM public.restaurant_memberships rm
        WHERE rm.user_id = auth.uid()
          AND rm.restaurant_id = _restaurant_id
          AND rm.ativo = true
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_restaurant(
  _restaurant_id text,
  _roles text[]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
          AND ur.role = 'administrador'
      )
      OR EXISTS (
        SELECT 1
        FROM public.restaurant_memberships rm
        WHERE rm.user_id = auth.uid()
          AND rm.restaurant_id = _restaurant_id
          AND rm.ativo = true
          AND rm.role = ANY(_roles)
      )
    );
$$;

REVOKE ALL
ON FUNCTION public.can_access_restaurant(text)
FROM PUBLIC, anon;

REVOKE ALL
ON FUNCTION public.can_manage_restaurant(text, text[])
FROM PUBLIC, anon;

GRANT EXECUTE
ON FUNCTION public.can_access_restaurant(text)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.can_manage_restaurant(text, text[])
TO authenticated;


-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;


-- Remover TODAS as políticas anteriores apenas destas tabelas.
DO $$
DECLARE
  p record;
BEGIN
  FOR p IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'restaurants',
        'restaurant_settings',
        'tables',
        'menu_categories',
        'menu_items',
        'orders',
        'order_items',
        'reservations',
        'service_requests'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      p.policyname,
      p.tablename
    );
  END LOOP;
END $$;


-- ============================================================
-- RESTAURANTS
-- ============================================================

CREATE POLICY restaurants_select
ON public.restaurants
FOR SELECT TO authenticated
USING (
  public.can_access_restaurant(id)
);

CREATE POLICY restaurants_insert
ON public.restaurants
FOR INSERT TO authenticated
WITH CHECK (
  public.can_manage_restaurant(
    id,
    ARRAY['proprietario', 'gerente']
  )
);

CREATE POLICY restaurants_update
ON public.restaurants
FOR UPDATE TO authenticated
USING (
  public.can_manage_restaurant(
    id,
    ARRAY['proprietario', 'gerente']
  )
)
WITH CHECK (
  public.can_manage_restaurant(
    id,
    ARRAY['proprietario', 'gerente']
  )
);


-- ============================================================
-- SETTINGS
-- ============================================================

CREATE POLICY restaurant_settings_select
ON public.restaurant_settings
FOR SELECT TO authenticated
USING (
  public.can_access_restaurant(restaurant_id)
);

CREATE POLICY restaurant_settings_insert
ON public.restaurant_settings
FOR INSERT TO authenticated
WITH CHECK (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente']
  )
);

CREATE POLICY restaurant_settings_update
ON public.restaurant_settings
FOR UPDATE TO authenticated
USING (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente']
  )
)
WITH CHECK (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente']
  )
);


-- ============================================================
-- MESAS
-- admin / proprietário / gerente / sala
-- ============================================================

CREATE POLICY tables_select
ON public.tables
FOR SELECT TO authenticated
USING (
  public.can_access_restaurant(restaurant_id)
);

CREATE POLICY tables_insert
ON public.tables
FOR INSERT TO authenticated
WITH CHECK (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente', 'sala']
  )
);

CREATE POLICY tables_update
ON public.tables
FOR UPDATE TO authenticated
USING (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente', 'sala']
  )
)
WITH CHECK (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente', 'sala']
  )
);

CREATE POLICY tables_delete
ON public.tables
FOR DELETE TO authenticated
USING (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente', 'sala']
  )
);


-- ============================================================
-- CATEGORIAS / MENU
-- admin / proprietário / gerente
-- ============================================================

CREATE POLICY menu_categories_select
ON public.menu_categories
FOR SELECT TO authenticated
USING (
  public.can_access_restaurant(restaurant_id)
);

CREATE POLICY menu_categories_insert
ON public.menu_categories
FOR INSERT TO authenticated
WITH CHECK (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente']
  )
);

CREATE POLICY menu_categories_update
ON public.menu_categories
FOR UPDATE TO authenticated
USING (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente']
  )
)
WITH CHECK (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente']
  )
);

CREATE POLICY menu_categories_delete
ON public.menu_categories
FOR DELETE TO authenticated
USING (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente']
  )
);


CREATE POLICY menu_items_select
ON public.menu_items
FOR SELECT TO authenticated
USING (
  public.can_access_restaurant(restaurant_id)
);

CREATE POLICY menu_items_insert
ON public.menu_items
FOR INSERT TO authenticated
WITH CHECK (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente']
  )
);

CREATE POLICY menu_items_update
ON public.menu_items
FOR UPDATE TO authenticated
USING (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente']
  )
)
WITH CHECK (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente']
  )
);

CREATE POLICY menu_items_delete
ON public.menu_items
FOR DELETE TO authenticated
USING (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente']
  )
);


-- ============================================================
-- PEDIDOS
-- Todos os membros podem consultar.
-- Todos podem gerar pedido dentro do restaurante a que pertencem.
-- ============================================================

CREATE POLICY orders_select
ON public.orders
FOR SELECT TO authenticated
USING (
  public.can_access_restaurant(restaurant_id)
);

CREATE POLICY orders_insert
ON public.orders
FOR INSERT TO authenticated
WITH CHECK (
  public.can_access_restaurant(restaurant_id)
);

CREATE POLICY orders_update
ON public.orders
FOR UPDATE TO authenticated
USING (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente', 'sala', 'cozinha']
  )
)
WITH CHECK (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente', 'sala', 'cozinha']
  )
);


CREATE POLICY order_items_select
ON public.order_items
FOR SELECT TO authenticated
USING (
  public.can_access_restaurant(restaurant_id)
);

CREATE POLICY order_items_insert
ON public.order_items
FOR INSERT TO authenticated
WITH CHECK (
  public.can_access_restaurant(restaurant_id)
);


-- ============================================================
-- RESERVAS
-- cozinha não tem acesso
-- ============================================================

CREATE POLICY reservations_select
ON public.reservations
FOR SELECT TO authenticated
USING (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente', 'sala']
  )
);

CREATE POLICY reservations_insert
ON public.reservations
FOR INSERT TO authenticated
WITH CHECK (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente', 'sala']
  )
);

CREATE POLICY reservations_update
ON public.reservations
FOR UPDATE TO authenticated
USING (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente', 'sala']
  )
)
WITH CHECK (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente', 'sala']
  )
);

CREATE POLICY reservations_delete
ON public.reservations
FOR DELETE TO authenticated
USING (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente', 'sala']
  )
);


-- ============================================================
-- CHAMADAS / CONTA
-- ============================================================

CREATE POLICY service_requests_select
ON public.service_requests
FOR SELECT TO authenticated
USING (
  public.can_access_restaurant(restaurant_id)
);

CREATE POLICY service_requests_insert
ON public.service_requests
FOR INSERT TO authenticated
WITH CHECK (
  public.can_access_restaurant(restaurant_id)
);

CREATE POLICY service_requests_update
ON public.service_requests
FOR UPDATE TO authenticated
USING (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente', 'sala']
  )
)
WITH CHECK (
  public.can_manage_restaurant(
    restaurant_id,
    ARRAY['proprietario', 'gerente', 'sala']
  )
);


-- ============================================================
-- PRIVILÉGIOS
-- ZERO acesso anon às tabelas do Workspace
-- ============================================================

REVOKE ALL ON TABLE
  public.restaurants,
  public.restaurant_settings,
  public.tables,
  public.menu_categories,
  public.menu_items,
  public.orders,
  public.order_items,
  public.reservations,
  public.service_requests
FROM anon, PUBLIC;

GRANT SELECT, INSERT, UPDATE
ON public.restaurants
TO authenticated;

GRANT SELECT, INSERT, UPDATE
ON public.restaurant_settings
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.tables
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.menu_categories
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.menu_items
TO authenticated;

GRANT SELECT, INSERT, UPDATE
ON public.orders
TO authenticated;

GRANT SELECT, INSERT
ON public.order_items
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.reservations
TO authenticated;

GRANT SELECT, INSERT, UPDATE
ON public.service_requests
TO authenticated;


-- ============================================================
-- RPCs
-- Executadas com os direitos do utilizador autenticado.
-- Nunca anon.
-- ============================================================

ALTER FUNCTION public.place_order(text, jsonb, text)
SECURITY INVOKER;

ALTER FUNCTION public.request_service(text, text)
SECURITY INVOKER;

-- free_table também valida explicitamente o papel.
CREATE OR REPLACE FUNCTION public.free_table(
  _restaurant_id text,
  _number integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN

  IF NOT public.can_manage_restaurant(
    _restaurant_id,
    ARRAY['proprietario', 'gerente', 'sala']
  ) THEN
    RAISE EXCEPTION 'Sem permissão para libertar esta mesa.';
  END IF;

  UPDATE public.orders
  SET
    closed = true,
    status = 'entregue'
  WHERE restaurant_id = _restaurant_id
    AND table_number = _number
    AND closed = false;

  UPDATE public.service_requests
  SET resolved = true
  WHERE restaurant_id = _restaurant_id
    AND table_number = _number
    AND resolved = false;

END;
$$;

REVOKE ALL
ON FUNCTION public.place_order(text, jsonb, text)
FROM PUBLIC, anon;

REVOKE ALL
ON FUNCTION public.request_service(text, text)
FROM PUBLIC, anon;

REVOKE ALL
ON FUNCTION public.free_table(text, integer)
FROM PUBLIC, anon;

GRANT EXECUTE
ON FUNCTION public.place_order(text, jsonb, text)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.request_service(text, text)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.free_table(text, integer)
TO authenticated;


-- ============================================================
-- STORAGE PRIVADO
-- ============================================================

INSERT INTO storage.buckets (
  id,
  name,
  public
)
VALUES (
  'restaurant-media',
  'restaurant-media',
  false
)
ON CONFLICT (id)
DO UPDATE SET public = false;

DROP POLICY IF EXISTS restaurant_media_upload_auth
ON storage.objects;

DROP POLICY IF EXISTS restaurant_media_select_auth
ON storage.objects;

DROP POLICY IF EXISTS restaurant_media_update_auth
ON storage.objects;

DROP POLICY IF EXISTS restaurant_media_delete_auth
ON storage.objects;

CREATE POLICY restaurant_media_upload_auth
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'restaurant-media'
  AND public.can_manage_restaurant(
    (storage.foldername(name))[1],
    ARRAY['proprietario', 'gerente']
  )
);

CREATE POLICY restaurant_media_select_auth
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'restaurant-media'
  AND public.can_access_restaurant(
    (storage.foldername(name))[1]
  )
);

CREATE POLICY restaurant_media_update_auth
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'restaurant-media'
  AND public.can_manage_restaurant(
    (storage.foldername(name))[1],
    ARRAY['proprietario', 'gerente']
  )
)
WITH CHECK (
  bucket_id = 'restaurant-media'
  AND public.can_manage_restaurant(
    (storage.foldername(name))[1],
    ARRAY['proprietario', 'gerente']
  )
);

CREATE POLICY restaurant_media_delete_auth
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'restaurant-media'
  AND public.can_manage_restaurant(
    (storage.foldername(name))[1],
    ARRAY['proprietario', 'gerente']
  )
);

COMMIT;