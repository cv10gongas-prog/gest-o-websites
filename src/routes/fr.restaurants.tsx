import { createFileRoute } from "@tanstack/react-router";

import { RestaurantesPage } from "@/components/site/pages/RestaurantesPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/fr/restaurants")({
  head: () => buildHead("fr", "restaurantes"),
  component: () => <RestaurantesPage locale="fr" />,
});
