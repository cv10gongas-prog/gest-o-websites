import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminData,
  Category,
  Order,
  OrderStatus,
  Product,
  PublicData,
  Reservation,
  ReservationStatus,
  Settings,
  Table,
  TableRequest,
} from "./demo-data";
import { todayISO } from "./demo-data";
import { CURRENT_RESTAURANT_ID } from "./config";
import { checkRestaurant, isRestaurantDatabaseConfigured, restaurantCloud } from "./cloud";
import {
  isDemoMode,
  demoStore,
  hydrateLocalRestaurantDemo,
  persistLocalRestaurantDemo,
} from "@/lib/demo-mode";
import {
  obterDadosAdminRestaurante,
  serverAddReservation,
  serverFreeTable,
  serverRemoveCategory,
  serverRemoveProduct,
  serverRemoveReservation,
  serverRemoveTable,
  serverResetDemo,
  serverResolveRequest,
  serverSaveCategory,
  serverSaveProduct,
  serverSaveSettings,
  serverSaveTable,
  serverSetOrderStatus,
  serverSetProductAvailable,
  serverSetReservationStatus,
  serverSetTableActive,
  serverUpdateReservation,
  serverUploadImage,
} from "./auth.functions";

const RID = CURRENT_RESTAURANT_ID;

// ============ Contexto do restaurante ============
export const RestaurantContext = createContext<PublicData | null>(null);

/** Dados do restaurante em uso */
export function useApp(): PublicData {
  const v = useContext(RestaurantContext);
  if (!v) throw new Error("useApp fora de um RestaurantContext");
  return v;
}

const noop = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

// ============ Leitura pública / base ============
const num = (v: unknown) => Number(v ?? 0);

async function loadPublic(restaurantId: string = RID): Promise<PublicData> {
  if (isLocalOperation(restaurantId)) {
    const d = demoStore.getAdminData(restaurantId);
    return {
      restaurantId: d.restaurantId,
      slug: d.slug,
      settings: d.settings,
      categories: d.categories,
      products: d.products,
      tables: d.tables,
    };
  }

  const [r, s, c, p, t] = await Promise.all([
    restaurantCloud
      .from("restaurants")
      .select("id, slug, name")
      .eq("id", restaurantId)
      .maybeSingle(),
    restaurantCloud
      .from("restaurant_settings")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .maybeSingle(),
    restaurantCloud
      .from("menu_categories")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("sort_order")
      .order("name"),
    restaurantCloud
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("sort_order")
      .order("created_at"),
    restaurantCloud.from("tables").select("*").eq("restaurant_id", restaurantId).order("number"),
  ]);

  if (r.error || s.error) {
    throw new Error((r.error ?? s.error)!.message);
  }

  const rest = r.data;
  const set = s.data;

  if (!rest || !set) {
    throw new Error(`O restaurante configurado ("${restaurantId}") não existe na base de dados.`);
  }

  const categories: Category[] = checkRestaurant(c).map((x) => ({
    id: x.id,
    name: x.name,
    sortOrder: x.sort_order,
  }));

  const f = (set.features ?? {}) as Partial<Settings["features"]>;
  const settings: Settings = {
    name: rest.name,
    tagline: set.tagline,
    introduction: set.introduction,
    logo: set.logo,
    primaryColor: set.primary_color,
    phone: set.phone,
    email: set.email,
    address: set.address,
    hours: set.hours ?? [],
    features: {
      qrOrders: f.qrOrders ?? true,
      callWaiter: f.callWaiter ?? true,
      requestBill: f.requestBill ?? true,
      reservations: f.reservations ?? true,
    },
  };

  const products: Product[] = checkRestaurant(p).map((x) => ({
    id: x.id,
    name: x.name,
    description: x.description,
    price: num(x.price),
    categoryId: x.category_id,
    category: categories.find((k) => k.id === x.category_id)?.name ?? "Outros",
    image: x.image,
    available: x.available,
    featured: x.featured,
  }));

  const tables: Table[] = checkRestaurant(t).map((x) => ({
    id: x.id,
    number: x.number,
    name: `Mesa ${x.number}`,
    slug: tableSlug(x.number),
    seats: x.seats,
    active: x.active,
  }));

  return {
    restaurantId: rest.id,
    slug: rest.slug,
    settings,
    categories,
    products,
    tables,
  };
}

export const publicQuery = (restaurantId: string = RID) =>
  queryOptions({
    queryKey: ["restaurant_public", restaurantId],
    queryFn: () => loadPublic(restaurantId),
  });

type TableName =
  | "restaurants"
  | "restaurant_settings"
  | "tables"
  | "menu_categories"
  | "menu_items"
  | "orders"
  | "order_items"
  | "reservations"
  | "service_requests";

let chan = 0;

/** Atualiza as queries indicadas sempre que a base de dados do restaurante muda */
export function useRealtime(
  _restaurantId: string | undefined,
  tables: TableName[],
  keys: unknown[][],
) {
  const qc = useQueryClient();
  const k = JSON.stringify(keys);
  const tk = tables.join(",");

  useEffect(() => {
    if (isDemoMode() || _restaurantId === "demo-restaurante" || !isRestaurantDatabaseConfigured())
      return;
    if (!tk) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        (JSON.parse(k) as unknown[][]).forEach((key) => {
          qc.invalidateQueries({ queryKey: key });
        });
      }, 50);
    };

    let ch = restaurantCloud.channel(`rt-rest-${++chan}`);
    for (const table of tk.split(",")) {
      ch = ch.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
    }
    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") refresh();
    });

    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      void restaurantCloud.removeChannel(ch);
    };
  }, [k, tk, qc, _restaurantId]);
}

export const ADMIN_TABLES: TableName[] = [
  "restaurants",
  "restaurant_settings",
  "menu_categories",
  "menu_items",
  "tables",
  "orders",
  "order_items",
  "reservations",
  "service_requests",
];

/**
 * Consulta Administrativa Protegida:
 * Todas as leituras administrativas passam pela Server Function protegida (ou demoStore em staging visual)
 */
export const adminQuery = (restaurantId: string = RID) =>
  queryOptions({
    queryKey: ["restaurant_admin", restaurantId],
    queryFn: async (): Promise<AdminData> => {
      // Apenas o espaço de testes explícito (demo-restaurante) ou o modo DEMO usam o demoStore local
      if (restaurantId === "demo-restaurante" || isDemoMode()) {
        hydrateLocalRestaurantDemo();
        return demoStore.getAdminData(restaurantId);
      }
      // Para qualquer restaurante real, invoca a Server Function protegida e não mascara erros reais
      return await obterDadosAdminRestaurante({
        data: { restaurantId },
      });
    },
    retry: 1,
    staleTime: 30_000,
  });

export const AdminContext = createContext<{
  data: AdminData;
  restaurantId: string;
} | null>(null);

export function useAdmin() {
  const v = useContext(AdminContext);
  if (!v) throw new Error("useAdmin fora do painel de gestão do restaurante");
  return v;
}

function isLocalOperation(restaurantId: string): boolean {
  // A ausência de BD real nunca converte restaurantes reais em dados fictícios.
  return isDemoMode() || restaurantId === "demo-restaurante";
}

/**
 * Ações Administrativas Protegidas:
 * Em modo de demonstração/testes operam exclusivamente sobre o demoStore local seguro;
 * Em produção com restaurante dedicado configurado passam por Server Functions validadas no servidor.
 */
const rawAdminActions = {
  setOrderStatus: async (id: string, status: OrderStatus, restaurantId = RID) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.setOrderStatus(id, status);
      persistLocalRestaurantDemo();
      return;
    }
    await serverSetOrderStatus({
      data: { restaurantId, orderId: id, status },
    });
  },

  resolveRequest: async (id: string, restaurantId = RID) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.resolveRequest(id);
      persistLocalRestaurantDemo();
      return;
    }
    await serverResolveRequest({
      data: { restaurantId, requestId: id },
    });
  },

  freeTable: async (restaurantId = RID, tableNumber: number) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.freeTable(tableNumber);
      persistLocalRestaurantDemo();
      return;
    }
    await serverFreeTable({
      data: { restaurantId, tableNumber },
    });
  },

  addReservation: async (
    restaurantId = RID,
    r: Omit<Reservation, "id" | "createdAt" | "status"> & {
      status?: ReservationStatus;
    },
  ) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.addReservation(r);
      persistLocalRestaurantDemo();
      return;
    }
    await serverAddReservation({
      data: {
        restaurantId,
        name: r.name,
        phone: r.phone,
        email: r.email,
        date: r.date,
        time: r.time,
        guests: r.guests,
        tableNumber: r.tableNumber,
        notes: r.notes,
        status: r.status ?? "confirmada",
      },
    });
  },

  updateReservation: async (
    id: string,
    r: Partial<Omit<Reservation, "id" | "createdAt">>,
    restaurantId = RID,
  ) => {
    if (isLocalOperation(restaurantId)) {
      if (r.status) demoStore.setReservationStatus(id, r.status);
      persistLocalRestaurantDemo();
      return;
    }
    await serverUpdateReservation({
      data: {
        restaurantId,
        id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        date: r.date,
        time: r.time,
        guests: r.guests,
        tableNumber: r.tableNumber,
        notes: r.notes,
      },
    });
  },

  setReservationStatus: async (id: string, status: ReservationStatus, restaurantId = RID) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.setReservationStatus(id, status);
      persistLocalRestaurantDemo();
      return;
    }
    await serverSetReservationStatus({
      data: { restaurantId, id, status },
    });
  },

  removeReservation: async (id: string, restaurantId = RID) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.removeReservation(id);
      persistLocalRestaurantDemo();
      return;
    }
    await serverRemoveReservation({
      data: { restaurantId, id },
    });
  },

  saveTable: async (
    restaurantId = RID,
    t: Omit<Table, "id" | "slug" | "name"> & { id?: string | undefined },
  ) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.saveTable(t);
      persistLocalRestaurantDemo();
      return;
    }
    await serverSaveTable({
      data: {
        restaurantId,
        id: t.id,
        number: t.number,
        seats: t.seats,
        active: t.active,
      },
    });
  },

  setTableActive: async (id: string, active: boolean, restaurantId = RID) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.setTableActive(id, active);
      persistLocalRestaurantDemo();
      return;
    }
    await serverSetTableActive({
      data: { restaurantId, tableId: id, active },
    });
  },

  removeTable: async (id: string, restaurantId = RID) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.removeTable(id);
      persistLocalRestaurantDemo();
      return;
    }
    await serverRemoveTable({
      data: { restaurantId, tableId: id },
    });
  },

  saveCategory: async (
    restaurantId = RID,
    c: { id?: string | undefined; name: string; sortOrder?: number },
  ) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.saveCategory(c);
      persistLocalRestaurantDemo();
      return;
    }
    await serverSaveCategory({
      data: {
        restaurantId,
        id: c.id,
        name: c.name,
        sortOrder: c.sortOrder,
      },
    });
  },

  removeCategory: async (id: string, restaurantId = RID) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.removeCategory(id);
      persistLocalRestaurantDemo();
      return;
    }
    await serverRemoveCategory({
      data: { restaurantId, categoryId: id },
    });
  },

  saveProduct: async (
    restaurantId = RID,
    p: {
      id?: string | undefined;
      name: string;
      description: string;
      price: number;
      categoryId: string | null;
      image: string;
      available: boolean;
      featured?: boolean;
    },
  ) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.saveProduct(p);
      persistLocalRestaurantDemo();
      return;
    }
    await serverSaveProduct({
      data: {
        restaurantId,
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        categoryId: p.categoryId,
        image: p.image,
        available: p.available,
        featured: p.featured ?? false,
      },
    });
  },

  setAvailable: async (id: string, available: boolean, restaurantId = RID) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.setProductAvailable(id, available);
      persistLocalRestaurantDemo();
      return;
    }
    await serverSetProductAvailable({
      data: { restaurantId, productId: id, available },
    });
  },

  removeProduct: async (id: string, restaurantId = RID) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.removeProduct(id);
      persistLocalRestaurantDemo();
      return;
    }
    await serverRemoveProduct({
      data: { restaurantId, productId: id },
    });
  },

  saveSettings: async (restaurantId = RID, s: AdminData["settings"]) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.saveSettings(s);
      persistLocalRestaurantDemo();
      return;
    }
    await serverSaveSettings({
      data: {
        restaurantId,
        name: s.name,
        tagline: s.tagline,
        introduction: s.introduction,
        logo: s.logo,
        primaryColor: s.primaryColor,
        phone: s.phone,
        email: s.email,
        address: s.address,
        hours: s.hours,
        features: s.features,
      },
    });
  },

  reset: async (restaurantId = RID) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.resetDemo();
      persistLocalRestaurantDemo();
      return;
    }
    await serverResetDemo({
      data: { restaurantId },
    });
  },
};

/**
 * Após cada alteração (mesa, ementa, pedido, reserva…) avisa o painel para recarregar
 * os dados de imediato, sem ser preciso atualizar a página.
 */
export const adminActions = new Proxy(rawAdminActions, {
  get(target, prop, receiver) {
    const fn = Reflect.get(target, prop, receiver);
    if (typeof fn !== "function") return fn;
    return async (...args: unknown[]) => {
      try {
        return await (fn as (...a: unknown[]) => unknown).apply(target, args);
      } finally {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("nws:restaurant-changed"));
        }
      }
    };
  },
}) as typeof rawAdminActions;

/** Redimensiona no browser, mas o upload só pode ocorrer no servidor autorizado. */
export async function uploadImage(
  restaurantId: string = RID,
  file: File,
  max = 900,
): Promise<string> {
  const blob = await resizeImage(file, max);
  if (isLocalOperation(restaurantId)) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Não foi possível guardar a imagem de testes."));
      reader.readAsDataURL(blob);
    });
  }

  if (blob.size > 4 * 1024 * 1024) {
    throw new Error("A fotografia é demasiado grande. Limite: 4 MB.");
  }
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Não foi possível ler a fotografia."));
    reader.readAsDataURL(blob);
  });
  const result = await serverUploadImage({
    data: { restaurantId, fileName: file.name, base64Data, contentType: "image/jpeg" },
  });
  return result.signedUrl;
}

function resizeImage(file: File, max: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Ficheiro de imagem inválido."));
    };
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      const ctx = c.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Erro ao processar imagem no browser."));
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Não foi possível comprimir a imagem."))),
        "image/jpeg",
        0.75,
      );
    };
    img.src = url;
  });
}

// ============ Utilitários ============
export const tableSlug = (n: number) => `mesa-${n}`;
export const formatPrice = (v: number) =>
  new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(v);

export const statusLabel: Record<OrderStatus, string> = {
  recebido: "Recebido",
  preparacao: "Em preparação",
  pronto: "Pronto",
  entregue: "Entregue",
};

export const reservationStatusLabel: Record<ReservationStatus, string> = {
  pendente: "Pendente",
  confirmada: "Confirmada",
  chegou: "Chegou",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export type TableState = "inativa" | "conta" | "assistencia" | "ocupada" | "reservada" | "livre";

export const tableStateLabel: Record<TableState, string> = {
  inativa: "Inativa",
  conta: "Conta pedida",
  assistencia: "Assistência pedida",
  ocupada: "Ocupada",
  reservada: "Reservada",
  livre: "Livre",
};

export function getTableState(
  s: {
    requests: TableRequest[];
    orders: Order[];
    reservations: Reservation[];
  },
  t: Table,
): TableState {
  if (!t.active) return "inativa";
  const open = s.requests.filter((r) => r.tableNumber === t.number && !r.resolved);
  if (open.some((r) => r.type === "conta")) return "conta";
  if (open.some((r) => r.type === "empregado")) return "assistencia";
  if (s.orders.some((o) => o.tableNumber === t.number && !o.closed && o.status !== "entregue"))
    return "ocupada";
  if (
    s.reservations.some(
      (r) =>
        r.tableNumber === t.number &&
        r.date === todayISO() &&
        r.status !== "cancelada" &&
        r.status !== "concluida",
    )
  )
    return "reservada";
  return "livre";
}
