import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/components/site/pages/HomePage";
import { buildHead } from "@/lib/i18n";
import { localBusinessSchema } from "@/lib/schema";

export const Route = createFileRoute("/es/")({
  head: () => ({
    ...buildHead("es", "home"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(localBusinessSchema("es")),
      },
    ],
  }),
  component: () => <HomePage locale="es" />,
});
