import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "./types";

/**
 * Cliente público do NWS Restaurantes.
 * Reutiliza o cliente Supabase central do NWS Workspace.
 * Em modo Demo é bloqueado pelo cliente central.
 */

const DEMO_MODE = import.meta.env["VITE_DEMO_MODE"] === "true";
if (DEMO_MODE && import.meta.env["VITE_DEPLOYMENT_ENV"] !== "preview") {
  throw new Error("[NWS] A demonstração só pode ser ativada numa Preview explícita.");
}

export function isRestaurantDatabaseConfigured(): boolean {
  if (DEMO_MODE) return false;
  return true;
}

export const restaurantCloud = supabase as unknown as SupabaseClient<Database>;

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

