import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Minus,
  Plus,
  Receipt,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAdmin } from "@/lib/restaurant/store";
import { useRestaurantTenant } from "@/lib/restaurant/tenant";
import { customerActions, loadLocalSampleMenu } from "@/lib/restaurant/customer.actions";
import { resolveImage, type OrderStatus } from "@/lib/restaurant/demo-data";
import { formatPrice, statusLabel } from "@/lib/restaurant/store";

/** O QR abre esta página dentro do layout autenticado; não existe rota pública /pedir. */
export const Route = createFileRoute("/_authenticated/produtos/restaurantes/pedir/$mesa")({
  validateSearch: (search: Record<string, unknown>) => ({
    restaurante: typeof search.restaurante === "string" ? search.restaurante : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pedir na Mesa — NWS Workspace" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PrivateTableOrderPage,
});

const steps: OrderStatus[] = ["recebido", "preparacao", "pronto", "entregue"];

function PrivateTableOrderPage() {
  const { mesa } = Route.useParams();
  const { restaurante: requestedRestaurant } = Route.useSearch();
  const { data, restaurantId } = useAdmin();
  const { restaurantes, setActiveRestaurantId, isAdminNWS } = useRestaurantTenant();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [justSent, setJustSent] = useState<number | null>(null);
  const [activeCat, setActiveCat] = useState<string>("Todos");

  // Evita mostrar a mesa homónima de outro restaurante num dispositivo novo.
  useEffect(() => {
    if (
      requestedRestaurant &&
      requestedRestaurant !== restaurantId &&
      restaurantes.some((r) => r.id === requestedRestaurant)
    ) {
      setActiveRestaurantId(requestedRestaurant);
    }
  }, [requestedRestaurant, restaurantId, restaurantes, setActiveRestaurantId]);

  const wrongRestaurant = Boolean(requestedRestaurant && requestedRestaurant !== restaurantId);
  const table = !wrongRestaurant ? data.tables.find((t) => t.slug === mesa) : undefined;
  const availableProducts = data.products.filter((p) => p.available);
  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ product: data.products.find((p) => p.id === id), qty }))
        .filter((i): i is { product: (typeof data.products)[number]; qty: number } =>
          Boolean(i.product),
        ),
    [cart, data.products],
  );
  const count = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const total = cartItems.reduce((sum, item) => sum + item.qty * item.product.price, 0);
  const tableOrders = table
    ? data.orders
        .filter((o) => o.tableId === table.id || o.tableNumber === table.number)
        .filter((o) => !o.closed)
    : [];
  const openRequests = table
    ? data.requests.filter(
        (r) => (r.tableId === table.id || r.tableNumber === table.number) && !r.resolved,
      )
    : [];
  const categories = data.categories.filter((c) =>
    data.products.some((p) => p.categoryId === c.id),
  );
  const visible = data.products.filter((p) => activeCat === "Todos" || p.categoryId === activeCat);

  function setQty(id: string, qty: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(50, qty);
      return next;
    });
  }

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["restaurant_admin", restaurantId] });
  }

  async function submit() {
    if (!table || !data.settings.features.qrOrders || sending) return;
    const unavailable = cartItems.filter((i) => !i.product.available);
    if (unavailable.length) {
      toast.error(`${unavailable.map((i) => i.product.name).join(", ")} já não está disponível.`);
      unavailable.forEach((i) => setQty(i.product.id, 0));
      return;
    }
    if (!cartItems.length) return;
    setSending(true);
    try {
      const result = await customerActions.placeOrder(
        restaurantId,
        table.id,
        cartItems.map((i) => ({ id: i.product.id, qty: i.qty })),
        note.trim().slice(0, 300),
      );
      setCart({});
      setNote("");
      setCartOpen(false);
      setJustSent(result.code);
      await refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success(`Pedido #${result.code} enviado à Cozinha · Mesa ${table.number}`);
    } catch (error) {
      toast.error(`Pedido não enviado: ${(error as Error).message}`);
    } finally {
      setSending(false);
    }
  }

  async function request(type: "empregado" | "conta") {
    if (!table) return;
    try {
      await customerActions.request(restaurantId, table.id, type);
      await refresh();
      toast.success(type === "empregado" ? "Empregado chamado." : "Pedido de conta enviado.");
    } catch (error) {
      toast.error(`Não foi possível enviar: ${(error as Error).message}`);
    }
  }

  if (wrongRestaurant) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-8 text-center">
        <h1 className="text-xl font-bold">Restaurante não selecionado</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {restaurantes.some((r) => r.id === requestedRestaurant)
            ? "A selecionar o restaurante indicado no QR Code…"
            : "A tua conta não tem acesso ao restaurante deste QR Code."}
        </p>
        <Link
          to="/produtos/restaurantes/mesas"
          className="mt-5 inline-block text-sm text-primary underline"
        >
          Voltar às mesas
        </Link>
      </div>
    );
  }

  if (!table || !table.active) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-8 text-center">
        <UtensilsCrossed className="mx-auto size-9 text-primary" />
        <h1 className="mt-4 text-xl font-bold">Mesa indisponível</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O QR Code não corresponde a uma mesa ativa deste restaurante. No espaço de testes, as
          mesas só são partilhadas entre separadores do mesmo browser.
        </p>
        <Link
          to="/produtos/restaurantes/mesas"
          className="mt-5 inline-block text-sm text-primary underline"
        >
          Voltar às mesas
        </Link>
      </div>
    );
  }

  return (
    <div className="-mx-1 min-h-[78vh] min-w-0 rounded-2xl bg-surface pb-28 sm:mx-0 sm:rounded-3xl">
      <header className="border-b border-border bg-background/85">
        <div className="mx-auto max-w-[720px] min-w-0 px-3 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
          <Link
            to="/produtos/restaurantes/mesas"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={15} /> NWS Restaurantes · Mesas
          </Link>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Mesa {table.number} · Área privada
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Pronto para pedir?
          </h1>
          {restaurantId === "demo-restaurante" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Espaço de testes local — os pedidos aparecem na Cozinha deste browser.
            </p>
          )}
          {(data.settings.features.callWaiter || data.settings.features.requestBill) && (
            <div className="mt-5 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:gap-3">
              {data.settings.features.callWaiter && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
                  disabled={openRequests.some((r) => r.type === "empregado")}
                  onClick={() => request("empregado")}
                >
                  <Bell />
                  {openRequests.some((r) => r.type === "empregado")
                    ? "Empregado a caminho"
                    : "Chamar empregado"}
                </Button>
              )}
              {data.settings.features.requestBill && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
                  disabled={openRequests.some((r) => r.type === "conta")}
                  onClick={() => request("conta")}
                >
                  <Receipt />
                  {openRequests.some((r) => r.type === "conta") ? "Conta pedida" : "Pedir conta"}
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[720px] min-w-0 px-3 sm:px-5">
        {justSent && (
          <div
            role="status"
            className="mt-5 flex items-center gap-3 rounded-xl bg-primary p-4 text-primary-foreground"
          >
            <Check className="shrink-0" />
            <div>
              <p className="font-semibold">Pedido recebido</p>
              <p className="text-sm opacity-90">
                Pedido #{justSent} · Mesa {table.number}. Acompanha o estado abaixo.
              </p>
            </div>
          </div>
        )}
        {tableOrders.length > 0 && (
          <section className="mt-5 space-y-3" aria-label="Pedidos desta mesa">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Pedidos da Mesa {table.number}
            </h2>
            {tableOrders.map((order) => {
              const index = steps.indexOf(order.status);
              return (
                <div key={order.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">Pedido #{order.code}</span>
                    <span className="font-semibold">{formatPrice(order.total)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.items.map((item) => `${item.qty}× ${item.name}`).join(" · ")}
                  </p>
                  <ol className="mt-4 grid grid-cols-4 gap-1.5">
                    {steps.map((step, i) => (
                      <li key={step} className="min-w-0">
                        <div
                          className={`h-1.5 rounded-full ${i <= index ? "bg-primary" : "bg-border"}`}
                        />
                        <p
                          className={`mt-1.5 truncate text-[11px] ${i === index ? "font-bold text-primary" : i < index ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {statusLabel[step]}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </section>
        )}
        <div className="sticky top-0 z-20 -mx-3 mt-5 overflow-x-auto border-b border-border bg-surface/95 px-3 py-3 backdrop-blur sm:-mx-5 sm:px-5">
          <div className="flex gap-2">
            {[{ id: "Todos", name: "Todos" }, ...categories].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCat(cat.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${activeCat === cat.id ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        {!data.settings.features.qrOrders && (
          <p className="mt-4 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
            Os pedidos por QR estão desativados. Consulta o menu e fala com o responsável.
          </p>
        )}
        {!availableProducts.length && (
          <div className="mt-5 rounded-xl border border-border bg-background p-6 text-center">
            <p className="font-semibold">A ementa ainda não tem pratos disponíveis.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Cria produtos no Menu & Ementa para poderes testar os pedidos.
            </p>
            {restaurantId === "demo-restaurante" && isAdminNWS && (
              <Button
                className="mt-4"
                type="button"
                variant="outline"
                onClick={async () => {
                  if (loadLocalSampleMenu()) {
                    await refresh();
                    toast.success("Ementa de exemplo carregada sem apagar as tuas mesas.");
                  } else toast.info("Já tens produtos na ementa.");
                }}
              >
                Carregar ementa de exemplo
              </Button>
            )}
            <Link
              to="/produtos/restaurantes/menu"
              className="mt-3 block text-sm text-primary underline"
            >
              Abrir Menu & Ementa
            </Link>
          </div>
        )}
        <ul className="mt-4 space-y-3">
          {visible.map((product) => {
            const qty = cart[product.id] ?? 0;
            const image = resolveImage(product.image);
            return (
              <li
                key={product.id}
                className={`flex gap-3 rounded-xl border border-border bg-background p-3 ${product.available ? "" : "opacity-60"}`}
              >
                {image ? (
                  <img
                    src={image}
                    alt=""
                    width={88}
                    height={88}
                    loading="lazy"
                    className="size-[88px] shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex size-[88px] shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <UtensilsCrossed size={22} />
                  </span>
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="font-semibold leading-snug">{product.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="font-semibold">{formatPrice(product.price)}</span>
                    {!product.available ? (
                      <span className="rounded-lg bg-danger/10 px-2 py-1 text-xs font-bold uppercase text-danger">
                        Esgotado
                      </span>
                    ) : !data.settings.features.qrOrders ? null : qty === 0 ? (
                      <Button
                        type="button"
                        size="sm"
                        className="h-9 rounded-full px-4"
                        onClick={() => setQty(product.id, 1)}
                        aria-label={`Adicionar ${product.name}`}
                      >
                        <Plus />
                        Adicionar
                      </Button>
                    ) : (
                      <Stepper
                        qty={qty}
                        name={product.name}
                        onChange={(n) => setQty(product.id, n)}
                      />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </main>

      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur">
          <Button
            type="button"
            className="mx-auto flex h-14 w-full max-w-[680px] justify-between rounded-xl px-5 text-base"
            onClick={() => setCartOpen(true)}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag />
              Ver pedido · {count} {count === 1 ? "artigo" : "artigos"}
            </span>
            <span className="flex items-center gap-1">
              {formatPrice(total)}
              <ChevronRight />
            </span>
          </Button>
        </div>
      )}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[90vh] max-w-[720px] overflow-y-auto rounded-t-2xl"
        >
          <SheetHeader>
            <SheetTitle className="text-2xl">O teu pedido · Mesa {table.number}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            {!cartItems.length ? (
              <p className="py-6 text-center text-sm text-muted-foreground">O pedido está vazio.</p>
            ) : (
              <ul className="divide-y divide-border">
                {cartItems.map(({ product, qty }) => (
                  <li key={product.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(product.price * qty)}
                      </p>
                    </div>
                    <Stepper
                      qty={qty}
                      name={product.name}
                      onChange={(n) => setQty(product.id, n)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover ${product.name}`}
                      onClick={() => setQty(product.id, 0)}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <label htmlFor="private-order-note" className="mt-4 block text-sm font-semibold">
              Notas para a cozinha
            </label>
            <textarea
              id="private-order-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="Ex.: sem cebola, bife mal passado…"
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-base"
            />
            <div className="mt-4 flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Button
              type="button"
              className="mt-4 h-14 w-full rounded-xl text-base"
              disabled={!cartItems.length || sending}
              onClick={submit}
            >
              {sending ? "A enviar…" : "Enviar pedido"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Stepper({
  qty,
  name,
  onChange,
}: {
  qty: number;
  name: string;
  onChange: (qty: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 rounded-full"
        aria-label={`Diminuir ${name}`}
        onClick={() => onChange(qty - 1)}
      >
        <Minus />
      </Button>
      <span className="w-5 text-center text-sm font-semibold" aria-live="polite">
        {qty}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 rounded-full"
        aria-label={`Aumentar ${name}`}
        onClick={() => onChange(qty + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}
