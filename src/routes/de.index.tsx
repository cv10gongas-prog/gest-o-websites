import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/components/site/pages/HomePage";
import { buildHead } from "@/lib/i18n";
import { localBusinessSchema } from "@/lib/schema";

export const Route = createFileRoute("/de/")({
  head: () => ({
    ...buildHead("de", "home"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(localBusinessSchema("de")),
      },
    ],
  }),
  component: () => <HomePage locale="de" />,
});
