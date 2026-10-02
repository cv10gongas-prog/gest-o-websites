import { createFileRoute } from "@tanstack/react-router";

import { RestaurantesPage } from "@/components/site/pages/RestaurantesPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/en/restaurants")({
  head: () => buildHead("en", "restaurantes"),
  component: () => <RestaurantesPage locale="en" />,
});
