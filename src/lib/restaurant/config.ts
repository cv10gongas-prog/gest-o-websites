import { isDemoMode } from "@/lib/demo-mode";

/**
 * Configuração do Restaurante no Workspace
 * Em produção: "nws-restaurantes"
 * Em modo DEMO explícito: "demo-restaurante"
 */
export const CURRENT_RESTAURANT_ID: string = isDemoMode()
  ? "demo-restaurante"
  : "nws-restaurantes";

/** Antiga configuracao de site publico, desativada. Os QRs sao privados no Workspace. */
export const PUBLIC_RESTAURANT_URL: string = "";


