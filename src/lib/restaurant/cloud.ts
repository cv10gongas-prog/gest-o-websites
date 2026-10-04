import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cliente público da base de dados do NWS Restaurantes.
 * Em modo Demo é substituído por um cliente totalmente bloqueado e nunca lê chaves/URLs reais.
 */

const DEMO_MODE = import.meta.env["VITE_DEMO_MODE"] === "true";
if (DEMO_MODE && import.meta.env["VITE_DEPLOYMENT_ENV"] !== "preview") {
  throw new Error("[NWS] A demonstração só pode ser ativada numa Preview explícita.");
}

export const RESTAURANT_SUPABASE_URL: string = DEMO_MODE
  ? "https://demo-blocked.invalid"
  : import.meta.env["VITE_RESTAURANT_SUPABASE_URL"] || "";

const RESTAURANT_SUPABASE_KEY: string = DEMO_MODE
  ? "demo-blocked"
  : import.meta.env["VITE_RESTAURANT_SUPABASE_PUBLISHABLE_KEY"] ||
    import.meta.env["VITE_RESTAURANT_SUPABASE_KEY"] ||
    "";

if (!RESTAURANT_SUPABASE_URL || !RESTAURANT_SUPABASE_KEY) {
  throw new Error(
    "[NWS] Faltam as variáveis públicas do restaurante. Nenhuma ligação automática à produção é permitida.",
  );
}

const cloudFetch: typeof fetch = (input, init) => {
  if (DEMO_MODE) {
    throw new Error(
      "[DEMO ISOLADO] Ligações ao Supabase de restaurantes estão bloqueadas nesta Preview.",
    );
  }

  const h = new Headers(
    typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
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
