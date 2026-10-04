// Server-side Supabase client for NWS Restaurantes
// Utilizado exclusivamente nas Server Functions protegidas e rotas de servidor.
// NUNCA importar este ficheiro em componentes de frontend ou bundles de cliente.
// O restaurante possui base de dados dedicada e autónoma, sem fallbacks para o Supabase Central do Workspace.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    // New Supabase API keys are opaque strings, not bearer JWTs.
    if (
      isNewSupabaseApiKey(supabaseKey) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

let _restaurantAdminClient: ReturnType<typeof createRestaurantServerClient> | undefined;

export function isRestaurantServerConfigured(): boolean {
  if (process.env["DEMO_MODE"] === "true" || process.env["VITE_DEMO_MODE"] === "true") return false;
  return Boolean(
    process.env["RESTAURANT_SUPABASE_URL"] && process.env["RESTAURANT_SUPABASE_SERVICE_ROLE_KEY"],
  );
}

function createRestaurantServerClient() {
  if (process.env["DEMO_MODE"] === "true" || process.env["VITE_DEMO_MODE"] === "true") {
    throw new Error("[DEMO ISOLADO] O acesso administrativo à base de dados está desativado.");
  }

  const RESTAURANT_URL = process.env["RESTAURANT_SUPABASE_URL"];

  // Chave de serviço privada dedicada do Restaurante (exclusiva de servidor, NUNCA com prefixo VITE_)
  const RESTAURANT_SERVICE_KEY = process.env["RESTAURANT_SUPABASE_SERVICE_ROLE_KEY"];

  if (!RESTAURANT_URL || !RESTAURANT_SERVICE_KEY) {
    throw new Error(
      "[NWS Restaurantes] A base de dados dedicada do restaurante não está configurada (RESTAURANT_SUPABASE_URL e RESTAURANT_SUPABASE_SERVICE_ROLE_KEY em falta no servidor).",
    );
  }

  return createClient<Database>(RESTAURANT_URL, RESTAURANT_SERVICE_KEY, {
    global: {
      fetch: createSupabaseFetch(RESTAURANT_SERVICE_KEY),
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/** Obter cliente Supabase do Restaurante com credenciais de servidor */
export function getRestaurantServerClient() {
  if (!_restaurantAdminClient) {
    _restaurantAdminClient = createRestaurantServerClient();
  }
  return _restaurantAdminClient;
}
