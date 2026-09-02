import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, Github, Loader2, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Chip, Panel, Vazio } from "@/components/crm/Bits";
import { btnPequeno, btnPrimario, inputClass } from "@/components/crm/Modal";
import { supabase } from "@/integrations/supabase/client";
import { useActualizarProjeto, useProjects } from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/projetos")({
  head: () => ({
    meta: [
      { title: "Portefólio — Nova Web CRM" },
      { name: "description", content: "Projetos importados do GitHub e mostrados no site público." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Projetos,
});

type RepoGitHub = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  pushed_at: string;
  fork: boolean;
};

function Projetos() {
  const { data: projetos = [] } = useProjects();
  const actualizar = useActualizarProjeto();
  const qc = useQueryClient();
  const [utilizador, setUtilizador] = useState("");
  const [aImportar, setAImportar] = useState(false);

  async function importar() {
    if (!utilizador.trim()) return;
    setAImportar(true);
    try {
      const resposta = await fetch(
        `https://api.github.com/users/${encodeURIComponent(utilizador.trim())}/repos?per_page=100&sort=pushed`,
      );
      if (!resposta.ok) throw new Error("Utilizador do GitHub não encontrado.");
      const repos = ((await resposta.json()) as RepoGitHub[]).filter((r) => !r.fork);
      const linhas = repos.map((r) => ({
        repo_id: r.id,
        nome: r.name,
        descricao: r.description,
        repo_url: r.html_url,
        site_url: r.homepage || null,
        categoria: r.language,
        tecnologias: r.topics ?? [],
        atualizado_em: r.pushed_at,
        is_demo: false,
      }));
      const { error } = await supabase.from("projects").upsert(linhas, { onConflict: "repo_id" });
      if (error) throw error;
      await supabase
        .from("app_settings")
        .upsert({ chave: "github_user", valor: utilizador.trim() }, { onConflict: "chave" });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success(`${linhas.length} projetos importados do GitHub.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falhou a importação.");
    } finally {
      setAImportar(false);
    }
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Portefólio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Importa repositórios do GitHub e escolhe quais aparecem no site público.
        </p>
      </div>

      <Panel className="mt-6" title="Importar do GitHub">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className={inputClass}
            placeholder="Nome de utilizador do GitHub"
            value={utilizador}
            onChange={(e) => setUtilizador(e.target.value)}
          />
          <button className={btnPrimario} onClick={importar} disabled={aImportar || !utilizador.trim()}>
            {aImportar ? <Loader2 className="size-4 animate-spin" /> : <Github className="size-4" />}
            Importar
          </button>
        </div>
      </Panel>

      <Panel className="mt-5" title="Projetos" subtitle={`${projetos.length} no total`}>
        {projetos.length === 0 ? (
          <Vazio texto="Sem projetos. Importa do GitHub para começar." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {projetos.map((p) => (
              <article key={p.id} className="rounded-xl border border-border/60 bg-secondary/25 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium">{p.nome}</h3>
                  {p.destaque && <Chip tone="primary">destaque</Chip>}
                </div>
                <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {p.descricao ?? "Sem descrição."}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.categoria && <Chip tone="info">{p.categoria}</Chip>}
                  {p.tecnologias.slice(0, 3).map((t) => (
                    <Chip key={t} tone="muted">
                      {t}
                    </Chip>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className={btnPequeno}
                    onClick={() =>
                      actualizar.mutate({ id: p.id, valores: { visivel: !p.visivel } })
                    }
                  >
                    {p.visivel ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    {p.visivel ? "Visível" : "Oculto"}
                  </button>
                  <button
                    className={btnPequeno}
                    onClick={() =>
                      actualizar.mutate({ id: p.id, valores: { destaque: !p.destaque } })
                    }
                  >
                    <Star className="size-3.5" /> Destaque
                  </button>
                  {p.repo_url && (
                    <a className={btnPequeno} href={p.repo_url} target="_blank" rel="noreferrer">
                      <Github className="size-3.5" /> Repo
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
