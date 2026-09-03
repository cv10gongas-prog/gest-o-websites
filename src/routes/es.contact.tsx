import { createFileRoute } from "@tanstack/react-router";

import { ContactPage } from "@/components/site/pages/ContactPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/es/contact")({
  head: () => buildHead("es", "contact"),
  component: () => <ContactPage locale="es" />,
});
