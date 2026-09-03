import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/components/site/pages/HomePage";
import { buildHead } from "@/lib/i18n";
import { localBusinessSchema } from "@/lib/schema";

export const Route = createFileRoute("/")({
  head: () => ({
    ...buildHead("pt", "home"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(localBusinessSchema("pt")),
      },
    ],
  }),
  component: () => <HomePage locale="pt" />,
});
