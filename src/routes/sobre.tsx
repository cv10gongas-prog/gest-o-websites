import { createFileRoute } from "@tanstack/react-router";
import { NwsHtmlAprovado } from "@/components/site/nws-html-aprovado/NwsHtmlAprovado";
import { buildHead } from "@/lib/i18n";

export const Route = createFileRoute("/sobre")({
  head: () => buildHead("pt", "home"),
  component: () => <NwsHtmlAprovado ficheiro="sobre.html" />,
});
