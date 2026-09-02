import { createFileRoute } from "@tanstack/react-router";
import { Building2, CalendarCheck, Check, Globe, Mail, Phone, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Chip, Panel, Vazio } from "@/components/crm/Bits";
import { btnPequeno, selectClass } from "@/components/crm/Modal";
import { formatarData } from "@/lib/crm";
import { useActualizarPedido, useApagarPedido, useWebsiteRequests } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos do site — Orbit CRM" },
      { name: "description", content: "Pedidos de orçamento recebidos pelo website público." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pedidos,
});

type Filtro = "pendentes" | "tratados" | "todos";

function Pedidos() {
  const { data: pedidos = [], isLoading } = useWebsiteRequests();
  const actualizar = useActualizarPedido();
  const apagar = useApagarPedido();
  const [filtro, setFiltro] = useState<Filtro>("pendentes");

  const lista = useMemo(() => {
    if (filtro === "pendentes") return pedidos.filter((p) => !p.tratado);
    if (filtro === "tratados") return pedidos.filter((p) => p.tratado);
    return pedidos;
  }, [pedidos, filtro]);

  const porTratar = pedidos.filter((p) => !p.tratado).length;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Pedidos do site</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {porTratar} {porTratar === 1 ? "pedido por tratar" : "pedidos por tratar"} · origem:
            Website público
          </p>
        </div>
        <select
          className={`${selectClass} w-auto`}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as Filtro)}
        >
          <option value="pendentes">Por tratar</option>
          <option value="tratados">Tratados</option>
          <option value="todos">Todos</option>
        </select>
      </header>

      <Panel bodyClassName="p-0">
        {isLoading ? (
          <Vazio texto="A carregar pedidos…" icon={Globe} />
        ) : lista.length === 0 ? (
          <Vazio texto="Sem pedidos nesta vista." icon={Globe} />
        ) : (
          <ul className="divide-y divide-border/60">
            {lista.map((p) => (
              <li key={p.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{p.nome}</span>
                      {p.empresa && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Building2 className="size-3" />
                          {p.empresa}
                        </span>
                      )}
                      {p.quer_reuniao && (
                        <Chip tone="warning">
                          <CalendarCheck className="mr-1 inline size-3" />
                          Quer reunião
                        </Chip>
                      )}
                      <Chip tone={p.tratado ? "success" : "primary"}>
                        {p.tratado ? "Tratado" : "Por tratar"}
                      </Chip>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                      <a className="inline-flex items-center gap-1" href={`mailto:${p.email}`}>
                        <Mail className="size-3" />
                        {p.email}
                      </a>
                      {p.telefone && (
                        <a className="inline-flex items-center gap-1" href={`tel:${p.telefone}`}>
                          <Phone className="size-3" />
                          {p.telefone}
                        </a>
                      )}
                      <span>{formatarData(p.created_at, true)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className={btnPequeno}
                      onClick={() =>
                        actualizar.mutate({ id: p.id, valores: { tratado: !p.tratado } })
                      }
                    >
                      <Check className="size-3.5" />
                      {p.tratado ? "Reabrir" : "Marcar tratado"}
                    </button>
                    <button className={btnPequeno} onClick={() => apagar.mutate(p.id)}>
                      <Trash2 className="size-3.5" />
                      Apagar
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tipo_projeto && <Chip tone="info">{p.tipo_projeto}</Chip>}
                  {p.orcamento && <Chip tone="muted">Orçamento: {p.orcamento}</Chip>}
                </div>

                {p.mensagem && (
                  <p className="mt-3 rounded-xl border border-border/60 bg-secondary/25 p-3 text-xs leading-relaxed">
                    {p.mensagem}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
