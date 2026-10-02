import { createFileRoute } from "@tanstack/react-router";

import { RestaurantesDemoPage } from "@/components/site/pages/RestaurantesDemoPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/restaurantes_/demonstracao")({
  head: () => buildHead("pt", "restaurantesDemo"),
  component: () => <RestaurantesDemoPage locale="pt" />,
});
