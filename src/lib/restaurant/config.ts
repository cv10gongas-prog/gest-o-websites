/**
 * Configuração do Restaurante no Workspace
 */
export const CURRENT_RESTAURANT_ID: string =
  import.meta.env["VITE_RESTAURANT_ID"] || "demo-restaurante";

/**
 * Endereço público de produção do subdomínio do restaurante.
 * É utilizado para gerar os links dos QR Codes físicos das mesas,
 * garantindo que clientes no restaurante acedem ao menu oficial sem quebras.
 */
export const PUBLIC_RESTAURANT_URL: string =
  import.meta.env["VITE_DEMO_MODE"] === "true"
    ? ""
    : import.meta.env["VITE_PUBLIC_RESTAURANT_URL"] || "https://restaurante.novawebstudio.pt";
