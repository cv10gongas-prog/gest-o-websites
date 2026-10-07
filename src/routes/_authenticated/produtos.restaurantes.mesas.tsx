import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ExternalLink, Pencil, Plus, Printer, QrCode, Table2, Trash2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Field,
  OrderBadge,
  PanelHeader,
  RestaurantCard,
  TableBadge,
  fieldClass,
} from "@/components/restaurant/RestaurantBits";
import type { Table } from "@/lib/restaurant/demo-data";
import { isDemoMode } from "@/lib/demo-mode";
import {
  formatPrice,
  getTableState,
  tableStateLabel,
  useAdmin,
  useRestaurantActions,
} from "@/lib/restaurant/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/produtos/restaurantes/mesas")({
  component: RestaurantTablesAdmin,
});

function RestaurantTablesAdmin() {
  const { data: app, restaurantId } = useAdmin();
  const actions = useRestaurantActions(restaurantId);
  const [editing, setEditing] = useState<Partial<Table> | null>(null);
  const [qr, setQr] = useState<{ table: Table; print: boolean } | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const qrMesaParam =
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("mesa");
  const qrMesa = qrMesaParam && /^[1-9]\d*$/.test(qrMesaParam) ? Number(qrMesaParam) : null;
  const qrMesaProcessed = useRef<number | null>(null);

  useEffect(() => {
    if (qrMesa === null || !Number.isSafeInteger(qrMesa) || qrMesaProcessed.current === qrMesa)
      return;
    const target = app.tables.find((table) => table.number === qrMesa);
    if (target) {
      qrMesaProcessed.current = qrMesa;
      setSelectedTable(target);
    }
  }, [qrMesa, app.tables]);

  // Mantém o painel lateral ligado à versão mais recente da mesa no cache otimista.
  // Se a mesa for apagada, fecha o painel imediatamente em vez de deixar dados antigos visíveis.
  useEffect(() => {
    if (!selectedTable) return;
    const latest = app.tables.find((table) => table.id === selectedTable.id);
    if (!latest) {
      setSelectedTable(null);
      return;
    }
    if (
      latest.number !== selectedTable.number ||
      latest.seats !== selectedTable.seats ||
      latest.active !== selectedTable.active
    ) {
      setSelectedTable(latest);
    }
  }, [app.tables, selectedTable]);

  async function saveTable(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const number = Number(f.get("number"));
    const seats = Number(f.get("seats")) || 4;

    if (!Number.isInteger(number) || number < 1) {
      toast.error("Número de mesa inválido.");
      return;
    }
    if (app.tables.some((t) => t.number === number && t.id !== editing?.id)) {
      toast.error(`A Mesa ${number} já se encontra registada.`);
      return;
    }

    try {
      await actions.saveTable({
        id: editing?.id,
        number,
        seats,
        active: editing?.active ?? true,
      }, restaurantId);
      toast.success(
        editing?.id
          ? "Mesa atualizada com sucesso."
          : `Mesa ${number} criada com sucesso. O QR privado ja esta disponivel.`,
      );
      setEditing(null);
    } catch (err) {
      toast.error(`Não foi possível guardar a mesa: ${(err as Error).message}`);
    }
  }

  const nextNumber = Math.max(0, ...app.tables.map((t) => t.number)) + 1;

  // Obter pedidos e chamadas da mesa selecionada
  const selectedTableOrders = selectedTable
    ? app.orders.filter((o) => o.tableNumber === selectedTable.number && !o.closed)
    : [];

  const selectedTableRequests = selectedTable
    ? app.requests.filter((r) => r.tableNumber === selectedTable.number && !r.resolved)
    : [];

  const selectedTableState = selectedTable ? getTableState(app, selectedTable) : "livre";

  return (
    <div className="min-w-0 max-w-[1450px] space-y-5 sm:space-y-6">
      {/* CABEÇALHO */}
      <PanelHeader
        title="Gestão de Mesas & QR Codes"
        subtitle={
          isDemoMode()
            ? "Cada mesa tem um QR privado que abre a ementa e o carrinho. No modo de testes, os dados ficam apenas neste browser."
            : "Cada mesa tem um QR privado que abre a ementa e o carrinho. Alterações e pedidos sincronizam em tempo real entre dispositivos."
        }
        action={
          <button
            type="button"
            onClick={() => setEditing({ number: nextNumber, seats: 4 })}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
          >
            <Plus className="size-4" />
            <span>Adicionar Mesa</span>
          </button>
        }
      />

      {isDemoMode() &&
        qrMesa !== null &&
        Number.isSafeInteger(qrMesa) &&
        !app.tables.some((t) => t.number === qrMesa) && (
          <div
            role="alert"
            className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning"
          >
            A Mesa {qrMesa} ainda nao existe neste browser. O espaco de testes e local: uma mesa
            criada no computador nao aparece automaticamente noutro telemovel, mesmo com login. Para
            sincronizar dispositivos diferentes sera necessario armazenamento partilhado e
            autenticado.
          </div>
        )}

      {/* GRELHA DE MESAS */}
      {app.tables.length === 0 ? (
        <RestaurantCard className="p-12 text-center text-muted-foreground space-y-3">
          <Table2 className="size-10 mx-auto opacity-40" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Ainda não existem mesas criadas.
            </p>
            <p className="text-xs mt-1">
              Clique no botão acima para adicionar a primeira mesa ao restaurante.
            </p>
          </div>
        </RestaurantCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {app.tables.map((t) => {
            const st = getTableState(app, t);
            const isBusy = ["ocupada", "assistencia", "conta"].includes(st);
            const openRequests = app.requests.filter(
              (r) => r.tableNumber === t.number && !r.resolved,
            );
            const tableOrders = app.orders.filter((o) => o.tableNumber === t.number && !o.closed);

            return (
              <RestaurantCard
                key={t.id}
                className={cn(
                  "p-5 flex flex-col justify-between space-y-4 hover:border-primary/50 transition cursor-pointer group",
                  !t.active && "opacity-60 bg-surface-strong/40",
                  selectedTable?.id === t.id && "ring-2 ring-primary border-primary",
                )}
              >
                <div onClick={() => setSelectedTable(t)}>
                  {/* Topo da Mesa */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/40 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-extrabold text-foreground group-hover:text-primary transition">
                          Mesa {t.number}
                        </span>
                        <span className="text-xs text-muted-foreground">({t.seats} lugares)</span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        Acesso privado · Mesa {t.number}
                      </p>
                    </div>

                    <TableBadge state={st} label={tableStateLabel[st]} />
                  </div>

                  {/* Chamadas Ativas da Mesa */}
                  {openRequests.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {openRequests.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between rounded-xl bg-rose-500/15 border border-rose-500/30 px-2.5 py-1.5 text-xs text-rose-300"
                        >
                          <span className="font-semibold">
                            {r.type === "conta" ? "Pediu a Conta" : "Pediu Assistência"}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void actions
                                .resolveRequest(r.id, restaurantId)
                                .catch((error: Error) => toast.error(error.message));
                            }}
                            className="rounded-lg bg-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-rose-500 transition"
                          >
                            Resolver
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resumo de Pedidos Abertos */}
                  {tableOrders.length > 0 && (
                    <div className="mt-3 rounded-xl bg-surface-strong p-2.5 text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between font-bold text-foreground">
                        <span>
                          {tableOrders.length}{" "}
                          {tableOrders.length === 1 ? "pedido aberto" : "pedidos abertos"}
                        </span>
                        <span className="font-mono text-primary">
                          {formatPrice(tableOrders.reduce((a, b) => a + b.total, 0))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ações da Mesa */}
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQr({ table: t, print: false })}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-surface-strong/70 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-strong transition"
                    >
                      <QrCode className="size-3.5 text-primary" />
                      <span>Ver QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQr({ table: t, print: true })}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-surface-strong/70 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-strong transition"
                    >
                      <Printer className="size-3.5" />
                      <span>Imprimir</span>
                    </button>
                  </div>

                  {isBusy && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (
                          confirm(
                            `Libertar a Mesa ${t.number}? Os pedidos abertos serão finalizados e as chamadas resolvidas.`,
                          )
                        ) {
                          try {
                            await actions.freeTable(restaurantId, t.number);
                            toast.success(`Mesa ${t.number} libertada.`);
                            if (selectedTable?.id === t.id) {
                              setSelectedTable(null);
                            }
                          } catch (e) {
                            toast.error((e as Error).message);
                          }
                        }
                      }}
                      className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition"
                    >
                      Libertar Mesa
                    </button>
                  )}

                  {/* Interruptor Ativo & Botões de Editar/Apagar */}
                  <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                      <Switch
                        checked={t.active}
                        onCheckedChange={(v) =>
                          actions
                            .setTableActive(t.id, v, restaurantId)
                            .then(() =>
                              toast.success(
                                `Mesa ${t.number} marcada como ${v ? "Ativa" : "Inativa"}.`,
                              ),
                            )
                            .catch((e: Error) => toast.error(e.message))
                        }
                      />
                      <span>{t.active ? "Ativa" : "Inativa"}</span>
                    </label>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(t)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-strong hover:text-foreground transition"
                        title={`Editar Mesa ${t.number}`}
                      >
                        <Pencil className="size-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `Remover a Mesa ${t.number}? Os registos associados serão apagados.`,
                            )
                          ) {
                            actions
                              .removeTable(t.id, restaurantId)
                              .then(() => toast.success(`Mesa ${t.number} removida.`))
                              .catch((e: Error) => toast.error(e.message));
                          }
                        }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger transition"
                        title={`Remover Mesa ${t.number}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </RestaurantCard>
            );
          })}
        </div>
      )}

      {/* PAINEL LATERAL DE DETALHES DA MESA SELECIONADA */}
      {selectedTable && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col justify-between overflow-y-auto border-l border-border/80 bg-surface/95 p-4 pb-8 shadow-2xl backdrop-blur-2xl sm:p-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-foreground">Mesa {selectedTable.number}</h2>
                  <TableBadge
                    state={selectedTableState}
                    label={tableStateLabel[selectedTableState]}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Capacidade: {selectedTable.seats} lugares · Acesso privado no Workspace
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTable(null)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-surface-strong hover:text-foreground transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chamadas Pendentes */}
            {selectedTableRequests.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block">
                  Chamadas de Assistência
                </span>
                {selectedTableRequests.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl bg-rose-500/15 border border-rose-500/40 p-3 text-xs"
                  >
                    <span>{r.type === "conta" ? "Pediu a Conta" : "Chamou Empregado"}</span>
                    <button
                      type="button"
                      onClick={() => {
                        void actions
                          .resolveRequest(r.id, restaurantId)
                          .catch((error: Error) => toast.error(error.message));
                      }}
                      className="rounded-lg bg-rose-500 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-600 transition"
                    >
                      Resolver
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pedidos em Aberto */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Pedidos Abertos ({selectedTableOrders.length})
              </span>

              {selectedTableOrders.length === 0 ? (
                <p className="text-xs text-muted-foreground bg-surface-strong/50 p-4 rounded-xl text-center">
                  Sem pedidos em aberto nesta mesa.
                </p>
              ) : (
                selectedTableOrders.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-xl border border-border/70 bg-surface-strong p-3.5 space-y-2 text-xs"
                  >
                    <div className="flex justify-between font-bold">
                      <span>Pedido #{o.code}</span>
                      <OrderBadge status={o.status} />
                    </div>
                    <ul className="space-y-1 text-muted-foreground">
                      {o.items.map((i, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>
                            {i.qty}× {i.name}
                          </span>
                          <span className="font-mono">{formatPrice(i.price * i.qty)}</span>
                        </li>
                      ))}
                    </ul>
                    {o.note && (
                      <p className="text-[11px] text-warning bg-warning/10 p-1.5 rounded">
                        Nota: {o.note}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-border/60 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQr({ table: selectedTable, print: false })}
                className="w-full rounded-xl border border-border bg-surface-strong px-3 py-2 text-xs font-bold text-foreground hover:bg-surface transition flex items-center justify-center gap-1.5"
              >
                <QrCode size={14} />
                <span>Ver QR</span>
              </button>
              <button
                type="button"
                onClick={() => setQr({ table: selectedTable, print: true })}
                className="w-full rounded-xl border border-border bg-surface-strong px-3 py-2 text-xs font-bold text-foreground hover:bg-surface transition flex items-center justify-center gap-1.5"
              >
                <Printer size={14} />
                <span>Imprimir</span>
              </button>
            </div>

            {["ocupada", "assistencia", "conta"].includes(selectedTableState) && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm(`Libertar a Mesa ${selectedTable.number}?`)) {
                    await actions.freeTable(restaurantId, selectedTable.number);
                    toast.success(`Mesa ${selectedTable.number} libertada.`);
                    setSelectedTable(null);
                  }
                }}
                className="w-full rounded-xl bg-amber-500 text-black font-bold text-xs py-2 hover:bg-amber-400 transition"
              >
                Libertar Mesa Agora
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE MESA */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md bg-surface border-border/80 text-foreground">
          <DialogHeader>
            <DialogTitle>{editing?.id ? `Editar Mesa ${editing.number}` : "Nova Mesa"}</DialogTitle>
          </DialogHeader>

          {editing && (
            <form onSubmit={saveTable} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Número da Mesa">
                  <input
                    name="number"
                    type="number"
                    min={1}
                    required
                    defaultValue={editing.number}
                    className={fieldClass}
                  />
                </Field>

                <Field label="Lugares / Capacidade">
                  <input
                    name="seats"
                    type="number"
                    min={1}
                    max={40}
                    required
                    defaultValue={editing.seats ?? 4}
                    className={fieldClass}
                  />
                </Field>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-xl border border-border/80 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-surface-strong hover:text-foreground transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:bg-primary/90"
                >
                  Guardar Mesa
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL DE QR CODE & IMPRESSÃO */}
      <Dialog open={!!qr} onOpenChange={(o) => !o && setQr(null)}>
        <DialogContent className="max-w-sm bg-surface border-border/80 text-foreground">
          <DialogHeader>
            <DialogTitle>QR Code · Mesa {qr?.table.number}</DialogTitle>
          </DialogHeader>

          {qr && (
            <QrView
              table={qr.table}
              autoPrint={qr.print}
              name={app.settings.name}
              restaurantId={restaurantId}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QrView({
  table,
  autoPrint,
  name,
  restaurantId,
}: {
  table: Table;
  autoPrint: boolean;
  name: string;
  restaurantId: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isDemo = isDemoMode();
  const appOrigin =
    typeof window === "undefined" ? "https://www.novawebstudio.pt" : window.location.origin;
  const targetUrl = isDemo
    ? ""
    : `${appOrigin}/produtos/restaurantes/pedir/${encodeURIComponent(table.slug)}?restaurante=${encodeURIComponent(restaurantId)}`;

  const print = () => {
    if (isDemo || !targetUrl) {
      toast.error("Os QR Codes de produção estão indisponíveis no modo DEMO.");
      return;
    }
    const svg = ref.current?.querySelector("svg")?.outerHTML ?? "";
    const w = window.open("", "_blank", "width=520,height=680");
    if (!w) {
      toast.error("Permita janelas pop-up no navegador para imprimir o QR Code.");
      return;
    }
    const esc = (s: string) =>
      s.replace(
        /[&<>"]/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
          })[c]!,
      );

    w.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mesa ${table.number} — ${esc(name)}</title>
  <style>
    @page { size: auto; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      text-align: center;
      padding: 30px;
      color: #111;
      background: #fff;
    }
    .card {
      border: 2px solid #222;
      border-radius: 20px;
      padding: 30px 20px;
      max-width: 360px;
      margin: 0 auto;
    }
    h1 {
      margin: 0;
      font-size: 20px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #555;
    }
    h2 {
      font-size: 42px;
      margin: 10px 0 20px;
      font-weight: 800;
    }
    svg {
      width: 220px;
      height: 220px;
      margin: 10px auto;
    }
    p.instrucao {
      font-size: 13px;
      color: #333;
      margin: 18px 0 6px;
      font-weight: 600;
    }
    p.url {
      font-size: 10px;
      color: #777;
      word-break: break-all;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>${esc(name)}</h1>
    <h2>Mesa ${table.number}</h2>
    ${svg}
    <p class="instrucao">Lê o QR, inicia sessão no NWS Workspace e faz o pedido nesta mesa.</p>
    <p class="url">${esc(targetUrl)}</p>
  </div>
</body>
</html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  useEffect(() => {
    if (autoPrint && !isDemo) print();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {isDemo ? (
        <div className="w-full rounded-xl border border-warning/40 bg-warning/10 p-6 text-center text-sm text-warning">
          QR desativado nesta pré-visualização sem login real. Utiliza a versão de produção com
          autenticação.
        </div>
      ) : (
        <>
          <div ref={ref} className="rounded-2xl border border-border bg-white p-5 shadow-inner">
            <QRCodeSVG value={targetUrl} size={220} level="M" />
          </div>

          <p className="break-all text-center text-xs font-mono text-muted-foreground px-2">
            {targetUrl}
          </p>

          <div className="flex gap-2 w-full pt-2">
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-surface-strong px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface transition"
            >
              <ExternalLink className="size-3.5" />
              <span>Testar Link</span>
            </a>

            <button
              type="button"
              onClick={print}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:bg-primary/90"
            >
              <Printer className="size-3.5" />
              <span>Imprimir QR</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
