import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  CalendarCheck,
  CalendarClock,
  Check,
  ExternalLink,
  Globe,
  Globe2,
  Mail,
  MessageSquareText,
  Phone,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Chip, Panel, Vazio } from "@/components/crm/Bits";
import { btnPequeno, selectClass } from "@/components/crm/Modal";
import { formatarData } from "@/lib/crm";
import {
  useActualizarPedido,
  useApagarPedido,
  useWebsiteRequests,
} from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos do site — Nova Web CRM" },
      {
        name: "description",
        content:
          "Pedidos de orçamento recebidos pelo website público.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pedidos,
});

type Filtro = "pendentes" | "tratados" | "todos";

type MensagemParsed = {
  mensagem: string | null;
  website: string | null;
  prazo: string | null;
  origem: string | null;
};

function parseMensagem(mensagem?: string | null): MensagemParsed {
  if (!mensagem) {
    return {
      mensagem: null,
      website: null,
      prazo: null,
      origem: null,
    };
  }

  const linhas = mensagem
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);

  let website: string | null = null;
  let prazo: string | null = null;
  let origem: string | null = null;

  const mensagemNormal: string[] = [];

  for (const linha of linhas) {
    const linhaLower = linha.toLowerCase();

    if (linhaLower.startsWith("website atual:")) {
      website = linha.slice("website atual:".length).trim();
      continue;
    }

    if (linhaLower.startsWith("current website:")) {
      website = linha.slice("current website:".length).trim();
      continue;
    }

    if (linhaLower.startsWith("aktuelle website:")) {
      website = linha.slice("aktuelle website:".length).trim();
      continue;
    }

    if (linhaLower.startsWith("site actuel:")) {
      website = linha.slice("site actuel:".length).trim();
      continue;
    }

    if (linhaLower.startsWith("web actual:")) {
      website = linha.slice("web actual:".length).trim();
      continue;
    }

    if (linhaLower.startsWith("prazo desejado:")) {
      prazo = linha.slice("prazo desejado:".length).trim();
      continue;
    }

    if (linhaLower.startsWith("preferred deadline:")) {
      prazo = linha.slice("preferred deadline:".length).trim();
      continue;
    }

    if (linhaLower.startsWith("gewünschter zeitraum:")) {
      prazo = linha
        .slice("gewünschter zeitraum:".length)
        .trim();
      continue;
    }

    if (linhaLower.startsWith("délai souhaité:")) {
      prazo = linha.slice("délai souhaité:".length).trim();
      continue;
    }

    if (linhaLower.startsWith("plazo deseado:")) {
      prazo = linha.slice("plazo deseado:".length).trim();
      continue;
    }

    if (linhaLower.startsWith("origem:")) {
      origem = linha.slice("origem:".length).trim();
      continue;
    }

    if (linhaLower.startsWith("source:")) {
      origem = linha.slice("source:".length).trim();
      continue;
    }

    mensagemNormal.push(linha);
  }

  return {
    mensagem:
      mensagemNormal.length > 0
        ? mensagemNormal.join("\n")
        : null,

    website,
    prazo,
    origem,
  };
}

function Pedidos() {
  const { data: pedidos = [], isLoading } =
    useWebsiteRequests();

  const actualizar = useActualizarPedido();
  const apagar = useApagarPedido();

  const [filtro, setFiltro] =
    useState<Filtro>("pendentes");

  const lista = useMemo(() => {
    if (filtro === "pendentes") {
      return pedidos.filter((p) => !p.tratado);
    }

    if (filtro === "tratados") {
      return pedidos.filter((p) => p.tratado);
    }

    return pedidos;
  }, [pedidos, filtro]);

  const porTratar = pedidos.filter(
    (p) => !p.tratado,
  ).length;

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Pedidos do site
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            {porTratar}{" "}
            {porTratar === 1
              ? "pedido por tratar"
              : "pedidos por tratar"}{" "}
            · origem: Website público
          </p>
        </div>

        <select
          className={`${selectClass} w-auto`}
          value={filtro}
          onChange={(e) =>
            setFiltro(
              e.target.value as Filtro,
            )
          }
        >
          <option value="pendentes">
            Por tratar
          </option>

          <option value="tratados">
            Tratados
          </option>

          <option value="todos">
            Todos
          </option>
        </select>
      </header>

      <Panel bodyClassName="p-0">
        {isLoading ? (
          <Vazio
            texto="A carregar pedidos…"
            icon={Globe}
          />
        ) : lista.length === 0 ? (
          <Vazio
            texto="Sem pedidos nesta vista."
            icon={Globe}
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {lista.map((p) => {
              const detalhes =
                parseMensagem(p.mensagem);

              return (
                <li
                  key={p.id}
                  className="p-4 sm:p-5"
                >
                  {/* TOPO */}
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">
                          {p.nome}
                        </span>

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

                        <Chip
                          tone={
                            p.tratado
                              ? "success"
                              : "primary"
                          }
                        >
                          {p.tratado
                            ? "Tratado"
                            : "Por tratar"}
                        </Chip>
                      </div>

                      {/* CONTACTOS */}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
                        <a
                          className="inline-flex items-center gap-1 transition hover:text-foreground"
                          href={`mailto:${p.email}`}
                        >
                          <Mail className="size-3" />

                          <span className="break-all">
                            {p.email}
                          </span>
                        </a>

                        {p.telefone && (
                          <a
                            className="inline-flex items-center gap-1 transition hover:text-foreground"
                            href={`tel:${p.telefone}`}
                          >
                            <Phone className="size-3" />

                            {p.telefone}
                          </a>
                        )}

                        <span>
                          {formatarData(
                            p.created_at,
                            true,
                          )}
                        </span>
                      </div>
                    </div>

                    {/* AÇÕES */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        className={btnPequeno}
                        onClick={() =>
                          actualizar.mutate({
                            id: p.id,
                            valores: {
                              tratado:
                                !p.tratado,
                            },
                          })
                        }
                      >
                        <Check className="size-3.5" />

                        {p.tratado
                          ? "Reabrir"
                          : "Marcar tratado"}
                      </button>

                      <button
                        className={btnPequeno}
                        onClick={() =>
                          apagar.mutate(p.id)
                        }
                      >
                        <Trash2 className="size-3.5" />

                        Apagar
                      </button>
                    </div>
                  </div>

                  {/* CHIPS */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tipo_projeto && (
                      <Chip tone="info">
                        {p.tipo_projeto}
                      </Chip>
                    )}

                    {p.orcamento && (
                      <Chip tone="muted">
                        Orçamento: {p.orcamento}
                      </Chip>
                    )}

                    {detalhes.prazo && (
                      <Chip tone="muted">
                        <CalendarClock className="mr-1 inline size-3" />

                        {detalhes.prazo}
                      </Chip>
                    )}
                  </div>

                  {/* DETALHES */}
                  {(detalhes.mensagem ||
                    detalhes.website ||
                    detalhes.prazo ||
                    detalhes.origem) && (
                    <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_.6fr]">
                      {/* MENSAGEM */}
                      {detalhes.mensagem && (
                        <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
                          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.15em] text-muted-foreground">
                            <MessageSquareText className="size-3.5 text-primary" />

                            Mensagem
                          </div>

                          <p className="mt-3 whitespace-pre-line text-xs leading-6 text-foreground/90">
                            {detalhes.mensagem}
                          </p>
                        </div>
                      )}

                      {/* INFO LATERAL */}
                      {(detalhes.website ||
                        detalhes.prazo ||
                        detalhes.origem) && (
                        <div className="grid gap-3">
                          {/* WEBSITE */}
                          {detalhes.website && (
                            <div className="rounded-2xl border border-border/60 bg-background/35 p-4">
                              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.15em] text-muted-foreground">
                                <Globe2 className="size-3.5 text-primary" />

                                Website atual
                              </div>

                              <a
                                href={
                                  detalhes.website
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 flex items-start gap-1.5 break-all text-xs font-medium text-foreground transition hover:text-primary"
                              >
                                <span>
                                  {
                                    detalhes.website
                                  }
                                </span>

                                <ExternalLink className="mt-0.5 size-3 shrink-0" />
                              </a>
                            </div>
                          )}

                          {/* PRAZO */}
                          {detalhes.prazo && (
                            <div className="rounded-2xl border border-border/60 bg-background/35 p-4">
                              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.15em] text-muted-foreground">
                                <CalendarClock className="size-3.5 text-primary" />

                                Prazo desejado
                              </div>

                              <p className="mt-2 text-xs font-medium">
                                {detalhes.prazo}
                              </p>
                            </div>
                          )}

                          {/* ORIGEM */}
                          {detalhes.origem && (
                            <div className="rounded-2xl border border-border/60 bg-background/35 p-4">
                              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.15em] text-muted-foreground">
                                <Globe className="size-3.5 text-primary" />

                                Origem
                              </div>

                              <p className="mt-2 text-xs font-medium">
                                {detalhes.origem}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
