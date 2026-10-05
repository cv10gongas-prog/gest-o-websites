// Server-side Supabase client for NWS Restaurantes
// Utilizado exclusivamente nas Server Functions protegidas e rotas de servidor.
// NUNCA importar este ficheiro em componentes de frontend ou bundles de cliente.
// Reutiliza o cliente administrativo central do Supabase com service role.

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "./types";

export function isRestaurantServerConfigured(): boolean {
  if (process.env["DEMO_MODE"] === "true" || process.env["VITE_DEMO_MODE"] === "true") return false;
  return true;
}

/** Obter cliente Supabase do Restaurante com credenciais de servidor (Supabase Central) */
export function getRestaurantServerClient(): SupabaseClient<Database> {
  if (process.env["DEMO_MODE"] === "true" || process.env["VITE_DEMO_MODE"] === "true") {
    throw new Error("[DEMO ISOLADO] O acesso administrativo à base de dados está desativado.");
  }
  return supabaseAdmin as unknown as SupabaseClient<Database>;
}

