import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  ChevronRight,
  Filter,
  Flame,
  PackageCheck,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  PanelHeader,
  RestaurantCard,
  orderTimeInfo,
  timeAgo,
} from "@/components/restaurant/RestaurantBits";
import type { Order, OrderStatus } from "@/lib/restaurant/demo-data";
import { formatPrice, useAdmin, useRestaurantActions } from "@/lib/restaurant/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/produtos/restaurantes/pedidos")({
  component: RestaurantOrdersBoard,
});

const columns: {
  status: OrderStatus;
  title: string;
  action: string;
  next: OrderStatus;
  icon: typeof ChefHat;
  color: string;
}[] = [
  {
    status: "recebido",
    title: "Novos Pedidos",
    action: "Iniciar Preparação",
    next: "preparacao",
    icon: Flame,
    color: "text-warning border-warning/40 bg-warning/10",
  },
  {
    status: "preparacao",
    title: "Em Preparação",
    action: "Marcar como Pronto",
    next: "pronto",
    icon: ChefHat,
    color: "text-primary border-primary/40 bg-primary/10",
  },
  {
    status: "pronto",
    title: "Prontos para Servir",
    action: "Marcar Entregue",
    next: "entregue",
    icon: PackageCheck,
    color: "text-success border-success/40 bg-success/10",
  },
];

function RestaurantOrdersBoard() {
  const {
    data: { orders },
    restaurantId,
  } = useAdmin();

  const [pesquisa, setPesquisa] = useState("");
  const [apenasAtrasados, setApenasAtrasados] = useState(false);
  const [apenasComNotas, setApenasComNotas] = useState(false);

  const openOrders = useMemo(() => {
    return orders
      .filter((o) => !o.closed && o.status !== "entregue")
      .filter((o) => {
        if (pesquisa.trim()) {
          const q = pesquisa.toLowerCase();
          const matchTable = `mesa ${o.tableNumber}`.includes(q) || String(o.tableNumber) === q;
          const matchCode = String(o.code).includes(q);
          const matchItem = o.items.some((i) => i.name.toLowerCase().includes(q));
          const matchNote = o.note.toLowerCase().includes(q);
          if (!matchTable && !matchCode && !matchItem && !matchNote) return false;
        }
        if (apenasAtrasados && !orderTimeInfo(o.createdAt).isDelayed) return false;
        if (apenasComNotas && !o.note) return false;
        return true;
      })
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [orders, pesquisa, apenasAtrasados, apenasComNotas]);

  const deliveredRecently = useMemo(() => {
    return orders
      .filter((o) => o.status === "entregue")
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
  }, [orders]);

  return (
    <div className="space-y-6 max-w-[1550px]">
      {/* CABEÇALHO */}
      <PanelHeader
        title="Quadro de Pedidos & Cozinha"
        subtitle="Os pedidos efetuados pelos clientes nas mesas via QR Code aparecem aqui em tempo real com avisos sonoros e controlo de tempos."
        action={
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="size-2 rounded-full bg-success animate-pulse" />
            <span>
              {restaurantId === "demo-restaurante"
                ? "Dados só neste browser"
                : "Ligação ao restaurante"}
            </span>
          </div>
        }
      />

      {/* BARRA DE FILTROS & PESQUISA RÁPIDA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface/50 p-3 rounded-2xl border border-border/70 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar por mesa, número de pedido (#1001), prato ou nota..."
            className="w-full h-9 rounded-xl border border-border/80 bg-surface pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setApenasAtrasados(!apenasAtrasados)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
              apenasAtrasados
                ? "bg-warning/20 border-warning text-warning"
                : "bg-surface border-border/70 text-muted-foreground hover:text-foreground",
            )}
          >
            <AlertTriangle className="size-3.5" />
            <span>Apenas Atrasados</span>
          </button>

          <button
            type="button"
            onClick={() => setApenasComNotas(!apenasComNotas)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
              apenasComNotas
                ? "bg-primary/20 border-primary text-primary"
                : "bg-surface border-border/70 text-muted-foreground hover:text-foreground",
            )}
          >
            <Filter className="size-3.5" />
            <span>Com Notas Especiais</span>
          </button>
        </div>
      </div>

      {/* QUADRO KANBAN DE 3 COLUNAS OPERACIONAIS */}
      <div className="grid min-w-0 gap-4 xl:grid-cols-3 xl:gap-5">
        {columns.map((col) => {
          const list = openOrders.filter((o) => o.status === col.status);
          const Icon = col.icon;

          return (
            <div
              key={col.status}
              className="flex min-w-0 flex-col rounded-2xl border border-border/70 bg-surface/40 p-3 backdrop-blur-xl min-h-[220px] sm:min-h-[320px] sm:p-4 xl:min-h-[520px] xl:rounded-3xl"
            >
              {/* Título da Coluna */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40 px-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn("grid size-7 place-items-center rounded-lg border", col.color)}
                  >
                    <Icon className="size-4" />
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {col.title}
                  </h2>
                </div>

                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-extrabold font-mono",
                    list.length > 0
                      ? "bg-foreground text-background"
                      : "bg-surface-strong text-muted-foreground",
                  )}
                >
                  {list.length}
                </span>
              </div>

              {/* Lista de Pedidos */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {list.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground/60 border border-dashed border-border/60 rounded-2xl p-4">
                    <Icon className="size-6 mb-1 opacity-40" />
                    <p className="text-xs font-medium">Sem pedidos nesta fase</p>
                  </div>
                ) : (
                  list.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      action={col.action}
                      next={col.next}
                      restaurantId={restaurantId}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PEDIDOS ENTREGUES RECENTEMENTE */}
      {deliveredRecently.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-border/40">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <CheckCircle2 className="size-4 text-success" />
            <span>Entregues Recentemente</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {deliveredRecently.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-surface/50 p-3 text-xs"
              >
                <div>
                  <span className="font-bold text-foreground">Mesa {o.tableNumber}</span>
                  <span className="text-muted-foreground font-mono ml-1.5">#{o.code}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(o.createdAt)}</p>
                </div>
                <span className="font-mono font-bold text-success">{formatPrice(o.total)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OrderCard({
  order,
  action,
  next,
  restaurantId,
}: {
  order: Order;
  action: string;
  next: OrderStatus;
  restaurantId: string;
}) {
  const [busy, setBusy] = useState(false);
  const actions = useRestaurantActions(restaurantId);
  const timeInfo = orderTimeInfo(order.createdAt);

  async function avancar() {
    setBusy(true);
    try {
      await actions.setOrderStatus(order.id, next, restaurantId);
      toast.success(`Pedido #${order.code} (Mesa ${order.tableNumber}) atualizado.`);
    } catch (e) {
      toast.error(`Não foi possível atualizar o pedido: ${(e as Error).message}`);
    }
    setBusy(false);
  }

  return (
    <RestaurantCard
      className={cn(
        "p-4 space-y-3 hover:border-primary/50 transition",
        timeInfo.isDelayed && "border-warning/50 bg-warning/5",
      )}
    >
      {/* Topo do Card */}
      <div className="flex items-baseline justify-between gap-2 border-b border-border/30 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-foreground">Mesa {order.tableNumber}</span>
          <span className="rounded-md bg-surface-strong px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground">
            #{order.code}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {timeInfo.isDelayed && (
            <span className="rounded bg-warning/20 px-1.5 py-0.2 text-[9px] font-bold text-warning uppercase">
              Atrasado
            </span>
          )}
          <span
            className={cn(
              "text-[10px] font-medium font-mono",
              timeInfo.isDelayed ? "text-warning font-bold" : "text-muted-foreground",
            )}
          >
            {timeInfo.text}
          </span>
        </div>
      </div>

      {/* Lista de Itens do Pedido */}
      <ul className="space-y-1.5 text-xs">
        {order.items.map((item, idx) => (
          <li key={idx} className="flex items-start justify-between gap-2">
            <span className="text-foreground">
              <strong className="text-primary font-mono font-bold">{item.qty}×</strong> {item.name}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground shrink-0">
              {formatPrice(item.price * item.qty)}
            </span>
          </li>
        ))}
      </ul>

      {/* Nota Especial do Cliente */}
      {order.note && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-2.5 text-xs text-warning">
          <strong className="block font-bold mb-0.5">Nota do Cliente:</strong>
          <p className="text-[11px] leading-relaxed">{order.note}</p>
        </div>
      )}

      {/* Rodapé com Preço Total e Botão de Ação */}
      <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
        <div>
          <span className="text-[9px] uppercase font-bold text-muted-foreground block">Total</span>
          <span className="font-mono text-sm font-extrabold text-foreground">
            {formatPrice(order.total)}
          </span>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={avancar}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
        >
          <span>{busy ? "A guardar..." : action}</span>
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </RestaurantCard>
  );
}
