// Server-side helper for NWS Restaurantes
// Utilizado exclusivamente nas Server Functions protegidas e rotas de servidor.
// NUNCA importar este ficheiro em componentes de frontend ou bundles de cliente.

export function isRestaurantServerConfigured(): boolean {
  if (process.env["DEMO_MODE"] === "true" || process.env["VITE_DEMO_MODE"] === "true") return false;
  return true;
}
