import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/components/site/pages/HomePage";
import { buildHead } from "@/lib/i18n";
import { localBusinessSchema } from "@/lib/schema";

export const Route = createFileRoute("/en/")({
  head: () => ({
    ...buildHead("en", "home"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(localBusinessSchema("en")),
      },
    ],
  }),
  component: () => <HomePage locale="en" />,
});
