import { createFileRoute } from "@tanstack/react-router";

import { RestaurantesDemoPage } from "@/components/site/pages/RestaurantesDemoPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/es/restaurantes_/demo")({
  head: () => buildHead("es", "restaurantesDemo"),
  component: () => <RestaurantesDemoPage locale="es" />,
});
