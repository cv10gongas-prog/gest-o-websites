import { createFileRoute } from "@tanstack/react-router";
import { NwsHtmlAprovado } from "@/components/site/nws-html-aprovado/NwsHtmlAprovado";
import { buildHead } from "@/lib/i18n";
import { localBusinessSchema } from "@/lib/schema";

export const Route = createFileRoute("/")({
  head: () => ({
    ...buildHead("pt", "home"),
    scripts: [{ type: "application/ld+json", children: JSON.stringify(localBusinessSchema("pt")) }],
  }),
  component: () => <NwsHtmlAprovado ficheiro="index.html" />,
});
