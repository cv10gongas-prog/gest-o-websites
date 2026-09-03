import { createFileRoute } from "@tanstack/react-router";

import { ContactPage } from "@/components/site/pages/ContactPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/contacto")({
  head: () => buildHead("pt", "contact"),
  component: () => <ContactPage locale="pt" />,
});
