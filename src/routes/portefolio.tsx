import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Github, Sparkles, Star } from "lucide-react";

import { Chip, Panel, Vazio } from "@/components/crm/Bits";
import { SiteChrome } from "@/components/site/SiteChrome";
import { useProjects } from "@/lib/queries";

export const Route = createFileRoute("/portefolio")({
  head: () => ({
    meta: [
      { title: "Portefólio de projetos web — Nova Web Studio" },
      {
        name: "description",
        content:
          "Sites institucionais, lojas online e aplicações web desenvolvidos pela Nova Web Studio.",
      },
      { property: "og:title", content: "Portefólio de projetos web — Nova Web Studio" },
      {
        property: "og:description",
        content: "Trabalhos recentes: sites institucionais, lojas online e aplicações à medida.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portefolio,
});

function Portefolio() {
  const { data: projetos = [], isLoading } = useProjects(true);
  const destaques = projetos.filter((p) => p.destaque);
  const restantes = projetos.filter((p) => !p.destaque);
  const ordenados = [...destaques, ...restantes];

  return (
    <SiteChrome>
      <section className="max-w-2xl">
        <Chip tone="primary">Portefólio</Chip>
        <h1 className="orbit-gradient-text mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Projetos que já colocámos no ar
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Uma seleção de trabalhos reais, com as tecnologias usadas em cada um. Se procura algo
          semelhante, falamos consigo em 24 horas.
        </p>
      </section>

      <div className="mt-10">
        {isLoading ? (
          <Vazio texto="A carregar projetos…" icon={Sparkles} />
        ) : ordenados.length === 0 ? (
          <Vazio texto="Portefólio a ser atualizado. Volte em breve." icon={Sparkles} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ordenados.map((p) => (
              <article key={p.id} className="orbit-panel orbit-panel-hover flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold">{p.nome}</h2>
                  {p.destaque && (
                    <Chip tone="warning">
                      <Star className="mr-1 inline size-3" />
                      Destaque
                    </Chip>
                  )}
                </div>
                {p.descricao && (
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {p.descricao}
                  </p>
                )}
                {p.tecnologias && p.tecnologias.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tecnologias.slice(0, 5).map((t) => (
                      <Chip key={t} tone="info">
                        {t}
                      </Chip>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-3 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                  {p.site_url && (
                    <a
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      href={p.site_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver site <ArrowUpRight className="size-3" />
                    </a>
                  )}
                  {p.repo_url && (
                    <a
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      href={p.repo_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Github className="size-3" /> Código
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Panel className="mt-12" bodyClassName="p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Tem um projeto em mente?</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Conte-nos o que precisa e receba uma proposta sem compromisso.
            </p>
          </div>
          <Link
            to="/contacto"
            className="inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Pedir orçamento
          </Link>
        </div>
      </Panel>
    </SiteChrome>
  );
}
