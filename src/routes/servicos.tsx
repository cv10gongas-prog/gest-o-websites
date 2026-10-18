import { createFileRoute } from "@tanstack/react-router";
import { NwsHtmlAprovado } from "@/components/site/nws-html-aprovado/NwsHtmlAprovado";
import { buildStandaloneSeoHead } from "@/lib/nws-seo";

export const Route = createFileRoute("/servicos")({
  head: () => buildStandaloneSeoHead({ path: "/servicos", title: "Criação de Websites, Lojas Online e SEO | Nova Web Studio", description: "Criamos websites profissionais, lojas online e soluções web à medida. Serviços de design, modernização e SEO para empresas em Portugal." }),
  component: () => <NwsHtmlAprovado ficheiro="servicos.html" />,
});
