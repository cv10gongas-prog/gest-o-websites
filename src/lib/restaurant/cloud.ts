import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cliente público da base de dados dedicada do NWS Restaurantes.
 * Em modo Demo é substituído por um cliente totalmente bloqueado e nunca lê chaves/URLs reais.
 * O restaurante possui base de dados e projeto Supabase autónomos e NUNCA utiliza as credenciais do CRM/Workspace.
 */

const DEMO_MODE = import.meta.env["VITE_DEMO_MODE"] === "true";
if (DEMO_MODE && import.meta.env["VITE_DEPLOYMENT_ENV"] !== "preview") {
  throw new Error("[NWS] A demonstração só pode ser ativada numa Preview explícita.");
}

export const RESTAURANT_SUPABASE_URL: string = DEMO_MODE
  ? "https://demo-blocked.invalid"
  : import.meta.env["VITE_RESTAURANT_SUPABASE_URL"] || "";

export const RESTAURANT_SUPABASE_KEY: string = DEMO_MODE
  ? "demo-blocked"
  : import.meta.env["VITE_RESTAURANT_SUPABASE_PUBLISHABLE_KEY"] ||
    import.meta.env["VITE_RESTAURANT_SUPABASE_KEY"] ||
    "";

export function isRestaurantDatabaseConfigured(): boolean {
  if (DEMO_MODE) return true;
  return Boolean(RESTAURANT_SUPABASE_URL && RESTAURANT_SUPABASE_KEY);
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

function createDemoBlockedRestaurantClient(): ReturnType<typeof createClient<Database>> {
  const blocked = () => {
    throw new Error("[DEMO ISOLADO] Operação na base de dados do restaurante bloqueada.");
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryProxy: any = new Proxy(function () {}, {
    get: (_t, prop) => {
      if (prop === "then") {
        return (resolve: (value: unknown) => void) =>
          resolve({ data: null, error: { message: "[DEMO] Supabase bloqueado" } });
      }
      return queryProxy;
    },
    apply: () => queryProxy,
  });
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === "from" || prop === "rpc") return () => queryProxy;
        if (prop === "channel")
          return () => ({
            on() {
              return this;
            },
            subscribe() {
              return this;
            },
          });
        if (prop === "removeChannel") return async () => ({ error: null });
        if (prop === "storage")
          return { from: () => ({ upload: blocked, createSignedUrl: blocked }) };
        return blocked;
      },
    },
  ) as ReturnType<typeof createClient<Database>>;
}

function createUnconfiguredRestaurantClient(): ReturnType<typeof createClient<Database>> {
  const unconfigured = () => {
    throw new Error(
      "[NWS Restaurantes] Base de dados do restaurante não configurada (variáveis VITE_RESTAURANT_SUPABASE_* em falta).",
    );
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryProxy: any = new Proxy(function () {}, {
    get: (_t, prop) => {
      if (prop === "then") {
        return (resolve: (value: unknown) => void) =>
          resolve({
            data: null,
            error: { message: "[NWS Restaurantes] Base de dados não configurada." },
          });
      }
      return queryProxy;
    },
    apply: () => queryProxy,
  });
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === "from" || prop === "rpc") return () => queryProxy;
        if (prop === "channel")
          return () => ({
            on() {
              return this;
            },
            subscribe() {
              return this;
            },
          });
        if (prop === "removeChannel") return async () => ({ error: null });
        if (prop === "storage")
          return { from: () => ({ upload: unconfigured, createSignedUrl: unconfigured }) };
        return unconfigured;
      },
    },
  ) as ReturnType<typeof createClient<Database>>;
}

function createRestaurantClient(): ReturnType<typeof createClient<Database>> {
  if (DEMO_MODE) {
    return createDemoBlockedRestaurantClient();
  }

  if (!isRestaurantDatabaseConfigured()) {
    return createUnconfiguredRestaurantClient();
  }

  return createClient<Database>(RESTAURANT_SUPABASE_URL, RESTAURANT_SUPABASE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: { fetch: cloudFetch },
  });
}

let _restaurantCloud: ReturnType<typeof createRestaurantClient> | undefined;

export const restaurantCloud = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_, prop, receiver) {
    if (!_restaurantCloud) _restaurantCloud = createRestaurantClient();
    return Reflect.get(_restaurantCloud, prop, receiver);
  },
});

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
