import { createFileRoute } from "@tanstack/react-router";

import { RestaurantesDemoPage } from "@/components/site/pages/RestaurantesDemoPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/de/restaurants_/demo")({
  head: () => buildHead("de", "restaurantesDemo"),
  component: () => <RestaurantesDemoPage locale="de" />,
});
