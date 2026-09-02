import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { useState } from "react";

import { Chip, Dot } from "@/components/crm/Bits";
import { estadoInfo, prioridadeInfo, type BusinessStatus } from "@/lib/crm";
import {
  espacamentoCartao,
  fasesVisiveis,
  formatarValor,
  usePreferencias,
} from "@/lib/preferencias";
import { useActualizarNegocio, useBusinesses } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline — Orbit CRM" },
      { name: "description", content: "Quadro visual dos projetos de sites por fase." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pipeline,
});

const GRELHA: Record<number, string> = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 xl:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
};

function Pipeline() {
  const { data: negocios = [] } = useBusinesses();
  const actualizar = useActualizarNegocio();
  const { prefs } = usePreferencias();
  const [aArrastar, setAArrastar] = useState<string | null>(null);

  const COLUNAS = fasesVisiveis(prefs);
  const ver = (chave: string) => prefs.camposCartao.includes(chave);

  function mover(id: string, estado: BusinessStatus) {
    actualizar.mutate({
      id,
      valores: { estado },
      descricao: `moveu para ${estadoInfo(estado).label}`,
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Arrasta um cartão (ou usa as setas) para mudar de fase.
          </p>
        </div>
        <Link
          to="/definicoes"
          className="flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <Settings className="size-3.5" /> Configurar fases
        </Link>
      </div>

      {COLUNAS.length === 0 && (
        <p className="orbit-panel mt-6 p-6 text-center text-sm text-muted-foreground">
          Não há fases activas. Escolhe as fases em Definições.
        </p>
      )}

      <div className={cn("mt-6 grid grid-cols-1 gap-4 pb-4", GRELHA[prefs.colunasPipeline] ?? GRELHA[3])}>
        {COLUNAS.map((coluna, indice) => {
          const cartoes = negocios.filter((n) => n.estado === coluna.value);
          const total = cartoes.reduce((t, n) => t + Number(n.valor_estimado ?? 0), 0);
          return (
            <div
              key={coluna.value}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (aArrastar) mover(aArrastar, coluna.value);
                setAArrastar(null);
              }}
              className="orbit-panel flex min-w-0 flex-col p-3"
            >
              <div className="flex items-center justify-between px-1 pb-3">
                <span className="flex items-center gap-2 text-xs font-medium">
                  <Dot tone={coluna.tone} />
                  {coluna.label}
                </span>
                {prefs.pipelineTotais && (
                  <span className="text-[10px] text-muted-foreground">
                    {cartoes.length} · {formatarValor(prefs, total)}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2.5">
                {cartoes.length === 0 && (
                  <p className="rounded-xl border border-dashed border-border/60 p-4 text-center text-[11px] text-muted-foreground">
                    Sem projetos
                  </p>
                )}
                {cartoes.map((n) => (
                  <article
                    key={n.id}
                    draggable
                    onDragStart={() => setAArrastar(n.id)}
                    className={cn(
                      "cursor-grab rounded-xl border border-border/60 bg-secondary/30 transition hover:border-primary/40 active:cursor-grabbing",
                      espacamentoCartao[prefs.densidade],
                    )}
                  >
                    <Link to="/negocios/$id" params={{ id: n.id }} className="text-xs font-medium">
                      {n.nome}
                    </Link>
                    {ver("categoria") && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {n.categoria ?? "Sem categoria"}
                        {n.localidade ? ` · ${n.localidade}` : ""}
                      </p>
                    )}
                    {ver("responsavel") && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {n.proxima_acao ?? "Sem próxima ação"}
                      </p>
                    )}
                    {(ver("prioridade") || ver("valor")) && (
                      <div className="mt-2 flex items-center justify-between">
                        {ver("prioridade") ? (
                          <Chip tone={prioridadeInfo(n.prioridade).tone}>
                            {prioridadeInfo(n.prioridade).label}
                          </Chip>
                        ) : (
                          <span />
                        )}
                        {ver("valor") && (
                          <span className="text-[10px] text-muted-foreground">
                            {formatarValor(prefs, n.valor_estimado)}
                          </span>
                        )}
                      </div>
                    )}
                    <div className={cn("mt-2 flex justify-between", !ver("setas") && "hidden")}>
                      <button
                        className="rounded-md p-1 text-muted-foreground transition hover:text-foreground disabled:opacity-30"
                        disabled={indice === 0}
                        aria-label="Fase anterior"
                        onClick={() => mover(n.id, COLUNAS[indice - 1]!.value)}
                      >
                        <ChevronLeft className="size-3.5" />
                      </button>
                      <button
                        className="rounded-md p-1 text-muted-foreground transition hover:text-foreground disabled:opacity-30"
                        disabled={indice === COLUNAS.length - 1}
                        aria-label="Fase seguinte"
                        onClick={() => mover(n.id, COLUNAS[indice + 1]!.value)}
                      >
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
