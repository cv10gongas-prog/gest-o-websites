import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cliente público da base de dados do NWS Restaurantes.
 * Em modo Demo é substituído por um cliente totalmente bloqueado e nunca lê chaves/URLs reais.
 */

const DEMO_MODE = import.meta.env["VITE_DEMO_MODE"] === "true";

// Valores de fallback apenas para produção atual; ignorados integralmente em modo Demo.
const FALLBACK_URL = "https://lehvydmzzdotmhwzqcwf.supabase.co";
const FALLBACK_KEY = "sb_publishable_-OX-MN1sNEoVihi-b9YKaA_mFGwE6_P";

export const RESTAURANT_SUPABASE_URL: string = DEMO_MODE
  ? "https://demo-blocked.invalid"
  : import.meta.env["VITE_RESTAURANT_SUPABASE_URL"] || FALLBACK_URL;

const RESTAURANT_SUPABASE_KEY: string = DEMO_MODE
  ? "demo-blocked"
  : import.meta.env["VITE_RESTAURANT_SUPABASE_PUBLISHABLE_KEY"] ||
    import.meta.env["VITE_RESTAURANT_SUPABASE_KEY"] ||
    FALLBACK_KEY;

const cloudFetch: typeof fetch = (input, init) => {
  if (DEMO_MODE) {
    throw new Error(
      "[DEMO ISOLADO] Ligações ao Supabase de restaurantes estão bloqueadas nesta Preview.",
    );
  }

  const h = new Headers(
    typeof Request !== "undefined" && input instanceof Request
      ? input.headers
      : undefined,
  );
  if (init?.headers) new Headers(init.headers).forEach((v, k) => h.set(k, v));
  if (
    RESTAURANT_SUPABASE_KEY.startsWith("sb_") &&
    h.get("Authorization") === `Bearer ${RESTAURANT_SUPABASE_KEY}`
  ) {
    h.delete("Authorization");
  }
  h.set("apikey", RESTAURANT_SUPABASE_KEY);
  return fetch(input, { ...init, headers: h });
};

export const restaurantCloud = createClient<Database>(
  RESTAURANT_SUPABASE_URL,
  RESTAURANT_SUPABASE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: { fetch: cloudFetch },
  },
);

/** Lança um erro legível quando a base de dados do restaurante responde com erro */
export function checkRestaurant<T>(res: {
  data: T;
  error: { message: string } | null;
}): NonNullable<T> {
  if (res.error) {
    throw new Error(
      res.error.message || "Não foi possível comunicar com o servidor de restaurantes.",
    );
  }
  return (res.data ?? []) as NonNullable<T>;
}
