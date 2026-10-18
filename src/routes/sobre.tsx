import { createFileRoute } from "@tanstack/react-router";
import { NwsHtmlAprovado } from "@/components/site/nws-html-aprovado/NwsHtmlAprovado";
import { buildStandaloneSeoHead } from "@/lib/nws-seo";

export const Route = createFileRoute("/sobre")({
  head: () => buildStandaloneSeoHead({ path: "/sobre", title: "Sobre a Nova Web Studio | Estúdio de Desenvolvimento Web", description: "Conhece a Nova Web Studio, o estúdio português que cria websites, lojas online e soluções digitais pensadas para cada negócio." }),
  component: () => <NwsHtmlAprovado ficheiro="sobre.html" />,
});
