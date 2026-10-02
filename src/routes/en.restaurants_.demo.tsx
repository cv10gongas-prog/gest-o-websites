import { createFileRoute } from "@tanstack/react-router";

import { RestaurantesDemoPage } from "@/components/site/pages/RestaurantesDemoPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/en/restaurants_/demo")({
  head: () => buildHead("en", "restaurantesDemo"),
  component: () => <RestaurantesDemoPage locale="en" />,
});
