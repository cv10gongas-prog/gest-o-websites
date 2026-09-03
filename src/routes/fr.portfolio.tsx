import { createFileRoute } from "@tanstack/react-router";

import { PortfolioPage } from "@/components/site/pages/PortfolioPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/fr/portfolio")({
  head: () => buildHead("fr", "portfolio"),
  component: () => <PortfolioPage locale="fr" />,
});
