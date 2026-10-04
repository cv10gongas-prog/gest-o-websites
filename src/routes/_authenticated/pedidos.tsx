import { createFileRoute } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  ExternalLink,
  Globe,
  Globe2,
  Mail,
  MessageSquareText,
  Phone,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Chip, Dot, Vazio } from "@/components/crm/Bits";
import { DialogNegocio } from "@/components/crm/DialogNegocio";
import { formatarData, type Business } from "@/lib/crm";
import {
  useActualizarPedido,
  useApagarPedido,
  useWebsiteRequests,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pedidos")({
  head: () => ({
    meta: [
      {
        title: "Pedidos do Site — Nova Web Studio",
      },
      {
        name: "description",
        content:
          "Central de triagem de contactos e orçamentos submetidos pelo website público.",
      },
      {
        name: "robots",
        content: "noindex",
      },
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

    if (
      linhaLower.startsWith("website atual:") ||
      linhaLower.startsWith("current website:") ||
      linhaLower.startsWith("aktuelle website:") ||
      linhaLower.startsWith("site actuel:") ||
      linhaLower.startsWith("web actual:")
    ) {
      website = linha.substring(linha.indexOf(":") + 1).trim();
      continue;
    }

    if (
      linhaLower.startsWith("prazo desejado:") ||
      linhaLower.startsWith("preferred deadline:") ||
      linhaLower.startsWith("gewünschter zeitraum:") ||
      linhaLower.startsWith("délai souhaité:") ||
      linhaLower.startsWith("plazo deseado:")
    ) {
      prazo = linha.substring(linha.indexOf(":") + 1).trim();
      continue;
    }

    if (linhaLower.startsWith("origem:") || linhaLower.startsWith("source:")) {
      origem = linha.substring(linha.indexOf(":") + 1).trim();
      continue;
    }

    mensagemNormal.push(linha);
  }

  return {
    mensagem: mensagemNormal.length > 0 ? mensagemNormal.join("\n") : null,
    website,
    prazo,
    origem,
  };
}

function Pedidos() {
  const { data: pedidos = [], isLoading } = useWebsiteRequests();
  const actualizar = useActualizarPedido();
  const apagar = useApagarPedido();

  const [filtro, setFiltro] = useState<Filtro>("pendentes");
  const [negocioParaCriar, setNegocioParaCriar] = useState<Partial<Business> | null>(null);

  const lista = useMemo(() => {
    if (filtro === "pendentes") {
      return pedidos.filter((p) => !p.tratado);
    }
    if (filtro === "tratados") {
      return pedidos.filter((p) => p.tratado);
    }
    return pedidos;
  }, [pedidos, filtro]);

  const porTratar = pedidos.filter((p) => !p.tratado).length;
  const tratados = pedidos.filter((p) => p.tratado).length;

  function converterEmNegocio(p: (typeof pedidos)[number]) {
    const parsed = parseMensagem(p.mensagem);
    setNegocioParaCriar({
      nome: p.empresa || p.nome,
      categoria: p.tipo_projeto || "Website Profissional",
      telefone: p.telefone || "",
      email: p.email || "",
      website: parsed.website || "",
      origem: `Website Público (${parsed.origem || "Formulário"})`,
      notas: `Contacto original: ${p.nome}\nMensagem: ${p.mensagem || ""}`,
      estado: "por_contactar",
      prioridade: p.quer_reuniao ? "alta" : "media",
    });
  }

  return (
    <div className="space-y-6">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Globe className="size-3.5" />
            <span>Website Público • Leads Recebidas</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Pedidos do Website
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {porTratar} pedido(s) por responder • {tratados} pedido(s) tratados
          </p>
        </div>
      </div>

      {/* FILTROS RÁPIDOS */}
      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border/70 bg-surface/50 p-1.5 backdrop-blur-md">
        {[
          { chave: "pendentes", label: `Por Tratar (${porTratar})` },
          { chave: "tratados", label: `Tratados (${tratados})` },
          { chave: "todos", label: `Todos (${pedidos.length})` },
        ].map((f) => (
          <button
            key={f.chave}
            type="button"
            onClick={() => setFiltro(f.chave as Filtro)}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition",
              filtro === f.chave
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LISTA DE PEDIDOS */}
      <div className="rounded-3xl border border-border/70 bg-surface/40 backdrop-blur-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            A carregar pedidos do website...
          </div>
        ) : lista.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="size-8 mx-auto mb-2 text-success" />
            <p className="text-sm font-semibold text-foreground">Sem pedidos nesta vista</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Todos os pedidos recebidos foram respondidos e tratados.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/30">
            {lista.map((p) => {
              const detalhes = parseMensagem(p.mensagem);

              return (
                <li key={p.id} className="p-5 sm:p-6 transition hover:bg-surface-strong/40 space-y-4">
                  {/* Topo do Pedido */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-foreground">{p.nome}</span>
                        {p.empresa && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface/80 px-2 py-0.5 text-xs text-muted-foreground">
                            <Building2 className="size-3 text-primary" />
                            {p.empresa}
                          </span>
                        )}
                        {p.quer_reuniao && (
                          <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold text-warning flex items-center gap-1">
                            <CalendarCheck className="size-3" />
                            Pretende Reunião
                          </span>
                        )}
                        <Chip tone={p.tratado ? "success" : "primary"}>
                          {p.tratado ? "Tratado" : "Por Tratar"}
                        </Chip>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <a
                          href={`mailto:${p.email}`}
                          className="flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                          <Mail className="size-3.5" />
                          {p.email}
                        </a>
                        {p.telefone && (
                          <a
                            href={`tel:${p.telefone}`}
                            className="flex items-center gap-1 text-foreground hover:underline font-medium"
                          >
                            <Phone className="size-3.5" />
                            {p.telefone}
                          </a>
                        )}
                        <span className="font-mono text-[11px]">
                          Recebido em {formatarData(p.created_at, true)}
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => converterEmNegocio(p)}
                        className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
                      >
                        <BriefcaseBusiness className="size-3.5" />
                        <span>Converter em Negócio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          actualizar.mutate({
                            id: p.id,
                            valores: { tratado: !p.tratado },
                          })
                        }
                        className="flex items-center gap-1 rounded-xl border border-border/70 bg-surface/80 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-strong transition"
                      >
                        <Check className="size-3.5" />
                        <span>{p.tratado ? "Reabrir" : "Marcar Tratado"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Eliminar o pedido de ${p.nome}?`)) {
                            apagar.mutate(p.id);
                          }
                        }}
                        className="grid size-8 place-items-center rounded-xl border border-border/70 bg-surface/80 text-muted-foreground hover:text-danger hover:border-danger/40 transition"
                        aria-label="Apagar pedido"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Chips de Informação */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {p.tipo_projeto && (
                      <span className="rounded-xl border border-info/30 bg-info/10 px-2.5 py-1 text-info font-medium">
                        Tipo: {p.tipo_projeto}
                      </span>
                    )}

                    {p.orcamento && (
                      <span className="rounded-xl border border-border/60 bg-surface/80 px-2.5 py-1 text-muted-foreground font-mono">
                        Orçamento: {p.orcamento}
                      </span>
                    )}

                    {detalhes.prazo && (
                      <span className="rounded-xl border border-warning/30 bg-warning/10 px-2.5 py-1 text-warning font-medium flex items-center gap-1">
                        <CalendarClock className="size-3" />
                        Prazo: {detalhes.prazo}
                      </span>
                    )}
                  </div>

                  {/* Detalhes & Mensagem */}
                  {(detalhes.mensagem || detalhes.website || detalhes.origem) && (
                    <div className="grid gap-3 lg:grid-cols-[1.4fr_.6fr] pt-2">
                      {detalhes.mensagem && (
                        <div className="rounded-2xl border border-border/50 bg-surface/60 p-4 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <MessageSquareText className="size-3.5 text-primary" />
                            Mensagem do Cliente
                          </span>
                          <p className="whitespace-pre-line text-xs leading-relaxed text-foreground/90">
                            {detalhes.mensagem}
                          </p>
                        </div>
                      )}

                      {(detalhes.website || detalhes.origem) && (
                        <div className="space-y-2">
                          {detalhes.website && (
                            <div className="rounded-2xl border border-border/50 bg-surface/60 p-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                <Globe2 className="size-3 text-primary" />
                                Website Atual
                              </span>
                              <a
                                href={detalhes.website}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 flex items-center gap-1 text-xs text-primary font-medium hover:underline truncate"
                              >
                                <span>{detalhes.website}</span>
                                <ExternalLink className="size-3" />
                              </a>
                            </div>
                          )}

                          {detalhes.origem && (
                            <div className="rounded-2xl border border-border/50 bg-surface/60 p-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Origem / Canal
                              </span>
                              <p className="mt-1 text-xs text-foreground font-medium">
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
      </div>

      {/* Modal de Criação de Negócio Pré-Preenchido */}
      {negocioParaCriar && (
        <DialogNegocio
          aberto={!!negocioParaCriar}
          onFechar={() => setNegocioParaCriar(null)}
          negocio={negocioParaCriar as Business}
        />
      )}
    </div>
  );
}
