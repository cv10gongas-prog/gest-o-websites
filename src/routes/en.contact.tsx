import { createFileRoute } from "@tanstack/react-router";

import { ContactPage } from "@/components/site/pages/ContactPage";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/en/contact")({
  head: () => buildHead("en", "contact"),
  component: () => <ContactPage locale="en" />,
});
