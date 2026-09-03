import { createFileRoute } from "@tanstack/react-router";

import { ContactPage } from "@/components/site/pages/ContactPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/de/contact")({
  head: () => buildHead("de", "contact"),
  component: () => <ContactPage locale="de" />,
});
