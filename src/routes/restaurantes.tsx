import { createFileRoute } from "@tanstack/react-router";

import { RestaurantesPage } from "@/components/site/pages/RestaurantesPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/restaurantes")({
  head: () => buildHead("pt", "restaurantes"),
  component: () => <RestaurantesPage locale="pt" />,
});
