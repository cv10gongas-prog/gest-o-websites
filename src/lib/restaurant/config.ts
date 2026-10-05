import { isDemoMode } from "@/lib/demo-mode";

/**
 * Configuração do Restaurante no Workspace
 * Em produção não existe restaurante predefinido.
 * demo-restaurante só existe explicitamente em modo DEMO/local de testes.
 */
export const CURRENT_RESTAURANT_ID: string =
  import.meta.env["VITE_RESTAURANT_ID"] || (isDemoMode() ? "demo-restaurante" : "");

/** Antiga configuracao de site publico, desativada. Os QRs sao privados no Workspace. */
export const PUBLIC_RESTAURANT_URL: string = "";

