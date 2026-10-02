import { createFileRoute } from "@tanstack/react-router";

import { RestaurantesDemoPage } from "@/components/site/pages/RestaurantesDemoPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/fr/restaurants_/demo")({
  head: () => buildHead("fr", "restaurantesDemo"),
  component: () => <RestaurantesDemoPage locale="fr" />,
});
