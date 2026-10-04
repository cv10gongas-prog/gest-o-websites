// Server-side Supabase client for NWS Restaurantes
// Utilizado exclusivamente nas Server Functions protegidas e rotas de servidor.
// NUNCA importar este ficheiro em componentes de frontend ou bundles de cliente.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request
        ? input.headers
        : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

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

let _restaurantAdminClient:
  | ReturnType<typeof createRestaurantServerClient>
  | undefined;

function createRestaurantServerClient() {
  const FALLBACK_URL = "https://lehvydmzzdotmhwzqcwf.supabase.co";
  const FALLBACK_PUB_KEY = "sb_publishable_-OX-MN1sNEoVihi-b9YKaA_mFGwE6_P";

  const RESTAURANT_URL =
    process.env["RESTAURANT_SUPABASE_URL"] ||
    process.env["VITE_RESTAURANT_SUPABASE_URL"] ||
    FALLBACK_URL;

  // Chave de serviço privada (exclusiva de servidor, NUNCA com prefixo VITE_)
  const RESTAURANT_SERVICE_KEY =
    process.env["RESTAURANT_SUPABASE_SERVICE_ROLE_KEY"] ||
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    process.env["VITE_RESTAURANT_SUPABASE_PUBLISHABLE_KEY"] ||
    FALLBACK_PUB_KEY;

  if (
    process.env.NODE_ENV === "production" &&
    !process.env["RESTAURANT_SUPABASE_SERVICE_ROLE_KEY"]
  ) {
    console.warn(
      "[NWS Restaurantes] Aviso: RESTAURANT_SUPABASE_SERVICE_ROLE_KEY não definida no ambiente. A utilizar chave configurada.",
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
