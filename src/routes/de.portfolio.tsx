import { createFileRoute } from "@tanstack/react-router";

import { PortfolioPage } from "@/components/site/pages/PortfolioPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/de/portfolio")({
  head: () => buildHead("de", "portfolio"),
  component: () => <PortfolioPage locale="de" />,
});
