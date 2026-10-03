-- Hardening migration for public contact submissions.
-- Revokes direct insert privileges from anonymous/unauthenticated callers on website_requests
-- and removes the open public INSERT policy, ensuring all public submissions must flow
-- through the server-side function and the rate-limited submit_guarded_contact_request RPC.

-- 1. Revoke direct INSERT on website_requests from anon
REVOKE INSERT ON public.website_requests FROM anon;

-- 2. Drop the open public INSERT policy that permitted direct unthrottled inserts
DROP POLICY IF EXISTS "Qualquer pessoa envia pedido" ON public.website_requests;

-- 3. Ensure authenticated team members can still insert leads if necessary via the dashboard/CRM
DROP POLICY IF EXISTS "Equipa insere pedidos" ON public.website_requests;
CREATE POLICY "Equipa insere pedidos" ON public.website_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(auth.uid()));

-- 4. Reaffirm service_role full privileges on website_requests
GRANT ALL ON public.website_requests TO service_role;
