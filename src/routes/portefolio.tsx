import { createFileRoute } from "@tanstack/react-router";
import { NwsHtmlAprovado } from "@/components/site/nws-html-aprovado/NwsHtmlAprovado";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/portefolio")({
  head: () => buildHead("pt", "portfolio"),
  component: () => <NwsHtmlAprovado ficheiro="trabalhos.html" />,
});
