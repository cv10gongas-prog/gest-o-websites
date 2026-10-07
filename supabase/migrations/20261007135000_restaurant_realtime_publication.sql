-- Garantir Realtime no NWS Restaurantes e nos inquéritos de satisfação.
-- Idempotente: adiciona apenas tabelas ainda ausentes da publication do Supabase Realtime.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'restaurants',
    'restaurant_settings',
    'menu_categories',
    'menu_items',
    'tables',
    'orders',
    'order_items',
    'reservations',
    'service_requests',
    'customer_satisfaction_surveys'
  ] LOOP
    IF to_regclass(format('public.%I', t)) IS NOT NULL
       AND NOT EXISTS (
         SELECT 1
         FROM pg_publication_tables
         WHERE pubname = 'supabase_realtime'
           AND schemaname = 'public'
           AND tablename = t
       ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
