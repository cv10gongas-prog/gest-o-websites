import { createFileRoute } from "@tanstack/react-router";
import { NwsHtmlAprovado } from "@/components/site/nws-html-aprovado/NwsHtmlAprovado";
import { buildStandaloneSeoHead, NWS_PROJECT_META } from "@/lib/nws-seo";

const slugs = new Set(["vinilart", "vinilart-sport", "gespool", "31-janeiro", "radio-alcabideche"]);
export const Route = createFileRoute("/projetos/$slug")({
  head: ({ params }) => {
    const info = NWS_PROJECT_META[params.slug as keyof typeof NWS_PROJECT_META];
    if (!info) return { meta: [{ name: "robots", content: "noindex, follow" }] };
    return buildStandaloneSeoHead({ path: `/projetos/${params.slug}`, ...info });
  },
  component: () => {
    const { slug } = Route.useParams();
    if (!slugs.has(slug)) return <p style={{padding:32}}>Projeto não encontrado.</p>;
    return <NwsHtmlAprovado ficheiro={`projetos/${slug}.html`} />;
  },
});
