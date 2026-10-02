import { createFileRoute } from "@tanstack/react-router";

import { RestaurantesPage } from "@/components/site/pages/RestaurantesPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/de/restaurants")({
  head: () => buildHead("de", "restaurantes"),
  component: () => <RestaurantesPage locale="de" />,
});
