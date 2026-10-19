import { createFileRoute } from "@tanstack/react-router";
import { NwsHtmlAprovado } from "@/components/site/nws-html-aprovado/NwsHtmlAprovado";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/restaurantes")({
  head: () => buildHead("pt", "restaurantes"),
  component: () => <NwsHtmlAprovado ficheiro="restaurantes.html" />,
});
