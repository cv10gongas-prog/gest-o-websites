import { createFileRoute } from "@tanstack/react-router";
import { NwsHtmlAprovado } from "@/components/site/nws-html-aprovado/NwsHtmlAprovado";

const slugs = new Set(["vinilart", "vinilart-sport", "gespool", "31-janeiro", "radio-alcabideche"]);
export const Route = createFileRoute("/projetos/$slug")({
  component: () => {
    const { slug } = Route.useParams();
    if (!slugs.has(slug)) return <p style={{padding:32}}>Projeto não encontrado.</p>;
    return <NwsHtmlAprovado ficheiro={`projetos/${slug}.html`} />;
  },
});
