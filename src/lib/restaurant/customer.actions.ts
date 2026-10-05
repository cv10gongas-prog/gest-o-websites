import {
  demoStore,
  isDemoMode,
  persistLocalRestaurantDemo,
  hydrateLocalRestaurantDemo,
} from "@/lib/demo-mode";
import { serverPlaceOrderFromWorkspace, serverRequestServiceFromWorkspace } from "./auth.functions";

/** Apenas o restaurante de testes explícito usa dados do browser. Nunca há fallback de um restaurante real. */
function isLocal(restaurantId: string) {
  return restaurantId === "demo-restaurante" || isDemoMode();
}

export const customerActions = {
  async placeOrder(
    restaurantId: string,
    tableId: string,
    items: { id: string; qty: number }[],
    note: string,
  ): Promise<{ code: number }> {
    if (!isLocal(restaurantId)) {
      return await serverPlaceOrderFromWorkspace({ data: { restaurantId, tableId, items, note } });
    }
    hydrateLocalRestaurantDemo();
    const table = demoStore.tables.find((t) => t.id === tableId && t.active);
    if (!table) throw new Error("Esta mesa não está ativa ou não existe neste browser.");
    if (!demoStore.settings.features.qrOrders) throw new Error("Os pedidos QR estão desativados.");
    if (!items.length || items.length > 50)
      throw new Error("O pedido está vazio ou tem artigos a mais.");
    const products = items.map(({ id, qty }) => {
      const product = demoStore.products.find((p) => p.id === id && p.available);
      if (!product || !Number.isInteger(qty) || qty < 1 || qty > 50)
        throw new Error("Um dos artigos está indisponível ou tem uma quantidade inválida.");
      return { productId: product.id, name: product.name, price: product.price, qty };
    });
    const code = Math.max(1000, ...demoStore.orders.map((o) => o.code)) + 1;
    demoStore.orders = [
      {
        id: `nws-local-o-${crypto.randomUUID()}`,
        code,
        tableId: table.id,
        tableNumber: table.number,
        items: products,
        note: note.slice(0, 300),
        total: products.reduce((sum, item) => sum + item.price * item.qty, 0),
        status: "recebido",
        createdAt: Date.now(),
        closed: false,
      },
      ...demoStore.orders,
    ];
    persistLocalRestaurantDemo();
    return { code };
  },

  async request(restaurantId: string, tableId: string, type: "empregado" | "conta") {
    if (!isLocal(restaurantId)) {
      await serverRequestServiceFromWorkspace({ data: { restaurantId, tableId, type } });
      return;
    }
    hydrateLocalRestaurantDemo();
    const table = demoStore.tables.find((t) => t.id === tableId && t.active);
    if (!table) throw new Error("Esta mesa não está ativa ou não existe neste browser.");
    if (type === "empregado" && !demoStore.settings.features.callWaiter)
      throw new Error("Chamadas de empregado desativadas.");
    if (type === "conta" && !demoStore.settings.features.requestBill)
      throw new Error("Pedidos de conta desativados.");
    if (demoStore.requests.some((r) => r.tableId === tableId && r.type === type && !r.resolved))
      return;
    demoStore.requests = [
      {
        id: `nws-local-r-${crypto.randomUUID()}`,
        tableId: table.id,
        tableNumber: table.number,
        type,
        createdAt: Date.now(),
        resolved: false,
      },
      ...demoStore.requests,
    ];
    persistLocalRestaurantDemo();
  },
};

/** Carrega só categorias/pratos de exemplo. Nunca substitui as mesas criadas pelo utilizador. */
export function loadLocalSampleMenu() {
  hydrateLocalRestaurantDemo();
  if (demoStore.products.length || demoStore.categories.length) return false;
  demoStore.loadSampleMenu();
  persistLocalRestaurantDemo();
  return true;
}
