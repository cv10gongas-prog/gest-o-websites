import { createFileRoute } from "@tanstack/react-router";

import { RestaurantesPage } from "@/components/site/pages/RestaurantesPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/es/restaurantes")({
  head: () => buildHead("es", "restaurantes"),
  component: () => <RestaurantesPage locale="es" />,
});
