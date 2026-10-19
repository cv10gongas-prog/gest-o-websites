import { createFileRoute } from "@tanstack/react-router";
import { NwsRestaurantInteractive } from "@/components/site/NwsRestaurantInteractive";

// Só o simulador, sem cabeçalho antigo. Integrado na nova página NWS Restaurantes.
export const Route = createFileRoute("/nws-restaurantes-interativo")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: () => <NwsRestaurantInteractive locale="pt" />,
});
