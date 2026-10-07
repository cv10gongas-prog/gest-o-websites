import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { queryOptions, useQueryClient } from "@tanstack/react-query";
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
export const rawAdminActions = {
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
  ): Promise<string | null> => {
    if (isLocalOperation(restaurantId)) {
      const id = demoStore.addReservation(r);
      persistLocalRestaurantDemo();
      return id;
    }
    const res = await serverAddReservation({
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
    return res.id ?? null;
  },

  updateReservation: async (
    id: string,
    r: Partial<Omit<Reservation, "id" | "createdAt">>,
    restaurantId = RID,
  ) => {
    if (isLocalOperation(restaurantId)) {
      demoStore.updateReservation(id, r);
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
    if (r.status) {
      await serverSetReservationStatus({
        data: { restaurantId, id, status: r.status },
      });
    }
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
  ): Promise<string | null> => {
    if (isLocalOperation(restaurantId)) {
      const id = demoStore.saveTable(t);
      persistLocalRestaurantDemo();
      return id;
    }
    const res = await serverSaveTable({
      data: {
        restaurantId,
        id: t.id,
        number: t.number,
        seats: t.seats,
        active: t.active,
      },
    });
    return res.id ?? t.id ?? null;
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
  ): Promise<string | null> => {
    if (isLocalOperation(restaurantId)) {
      const id = demoStore.saveCategory(c);
      persistLocalRestaurantDemo();
      return id;
    }
    const res = await serverSaveCategory({
      data: {
        restaurantId,
        id: c.id,
        name: c.name,
        sortOrder: c.sortOrder,
      },
    });
    return res.id ?? c.id ?? null;
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
  ): Promise<string | null> => {
    if (isLocalOperation(restaurantId)) {
      const id = demoStore.saveProduct(p);
      persistLocalRestaurantDemo();
      return id;
    }
    const res = await serverSaveProduct({
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
    return res.id ?? p.id ?? null;
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
    if (!isLocalOperation(restaurantId)) {
      throw new Error("A reposição de demonstração só está disponível no modo de testes.");
    }
    demoStore.resetDemo();
    persistLocalRestaurantDemo();
  },
};

/** Ações diretas sem proxy/evento global normal */
export const adminActions = rawAdminActions;

/**
 * Hook de ações administrativas de restaurante com atualizações otimistas imediatas,
 * reversão em caso de erro e reconciliação via invalidação de queries do TanStack Query.
 */
export function useRestaurantActions(explicitRestaurantId?: string) {
  const qc = useQueryClient();
  const adminCtx = useContext(AdminContext);
  const boundRid = explicitRestaurantId ?? adminCtx?.restaurantId ?? RID;

  return useMemo(() => {
    const getRid = (customRid?: string) => customRid ?? boundRid;

    return {
      setOrderStatus: async (id: string, status: OrderStatus, customRid?: string) => {
        const rid = getRid(customRid);
        await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
        const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

        if (previousData) {
          qc.setQueryData<AdminData>(["restaurant_admin", rid], {
            ...previousData,
            orders: previousData.orders.map((o) =>
              o.id === id ? { ...o, status, closed: status === "entregue" } : o,
            ),
          });
        }

        try {
          if (isLocalOperation(rid)) {
            demoStore.setOrderStatus(id, status);
            persistLocalRestaurantDemo();
          } else {
            await serverSetOrderStatus({
              data: { restaurantId: rid, orderId: id, status },
            });
          }
        } catch (err) {
          if (previousData) {
            qc.setQueryData(["restaurant_admin", rid], previousData);
          }
          throw err;
        }

        void qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] });
      },

      resolveRequest: async (id: string, customRid?: string) => {
        const rid = getRid(customRid);
        await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
        const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

        if (previousData) {
          qc.setQueryData<AdminData>(["restaurant_admin", rid], {
            ...previousData,
            requests: previousData.requests.map((r) =>
              r.id === id ? { ...r, resolved: true } : r,
            ),
          });
        }

        try {
          if (isLocalOperation(rid)) {
            demoStore.resolveRequest(id);
            persistLocalRestaurantDemo();
          } else {
            await serverResolveRequest({
              data: { restaurantId: rid, requestId: id },
            });
          }
        } catch (err) {
          if (previousData) {
            qc.setQueryData(["restaurant_admin", rid], previousData);
          }
          throw err;
        }

        void qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] });
      },

      freeTable: async (
        arg1: number | string,
        arg2?: number | string,
      ) => {
        const rid = typeof arg1 === "string" ? arg1 : getRid(typeof arg2 === "string" ? arg2 : undefined);
        const tableNumber = typeof arg1 === "number" ? arg1 : Number(arg2);

        await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
        const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

        if (previousData) {
          qc.setQueryData<AdminData>(["restaurant_admin", rid], {
            ...previousData,
            orders: previousData.orders.map((o) =>
              o.tableNumber === tableNumber ? { ...o, closed: true, status: "entregue" as const } : o,
            ),
            requests: previousData.requests.map((r) =>
              r.tableNumber === tableNumber ? { ...r, resolved: true } : r,
            ),
          });
        }

        try {
          if (isLocalOperation(rid)) {
            demoStore.freeTable(tableNumber);
            persistLocalRestaurantDemo();
          } else {
            await serverFreeTable({
              data: { restaurantId: rid, tableNumber },
            });
          }
        } catch (err) {
          if (previousData) {
            qc.setQueryData(["restaurant_admin", rid], previousData);
          }
          throw err;
        }

        void qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] });
      },

      saveTable: async (
        arg1: string | (Omit<Table, "id" | "slug" | "name"> & { id?: string }),
        arg2?: (Omit<Table, "id" | "slug" | "name"> & { id?: string }) | string,
      ): Promise<string | null> => {
        const rid = typeof arg1 === "string" ? arg1 : getRid(typeof arg2 === "string" ? arg2 : undefined);
        const table = (typeof arg1 === "object" ? arg1 : arg2) as Omit<Table, "id" | "slug" | "name"> & { id?: string };

        if (table.id) {
          await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
          const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

          if (previousData) {
            qc.setQueryData<AdminData>(["restaurant_admin", rid], {
              ...previousData,
              tables: previousData.tables.map((t) =>
                t.id === table.id
                  ? {
                      ...t,
                      number: table.number,
                      seats: table.seats,
                      active: table.active,
                      name: `Mesa ${table.number}`,
                      slug: tableSlug(table.number),
                    }
                  : t,
              ),
            });
          }

          let updatedId: string | null = table.id;
          try {
            if (isLocalOperation(rid)) {
              updatedId = demoStore.saveTable(table);
              persistLocalRestaurantDemo();
            } else {
              const res = await serverSaveTable({
                data: {
                  restaurantId: rid,
                  id: table.id,
                  number: table.number,
                  seats: table.seats,
                  active: table.active,
                },
              });
              updatedId = res.id ?? table.id;
            }
          } catch (err) {
            if (previousData) {
              qc.setQueryData(["restaurant_admin", rid], previousData);
            }
            throw err;
          }

          void Promise.all([
            qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] }),
            qc.invalidateQueries({ queryKey: ["restaurant_public", rid] }),
          ]);
          return updatedId;
        } else {
          let createdId: string | null = null;
          if (isLocalOperation(rid)) {
            createdId = demoStore.saveTable(table);
            persistLocalRestaurantDemo();
          } else {
            const res = await serverSaveTable({
              data: {
                restaurantId: rid,
                number: table.number,
                seats: table.seats,
                active: table.active,
              },
            });
            createdId = res.id ?? null;
          }

          if (createdId) {
            qc.setQueryData<AdminData>(["restaurant_admin", rid], (current) => {
              if (!current || current.tables.some((item) => item.id === createdId)) return current;
              const created: Table = {
                id: createdId,
                number: table.number,
                seats: table.seats,
                active: table.active,
                name: `Mesa ${table.number}`,
                slug: tableSlug(table.number),
              };
              return { ...current, tables: [...current.tables, created].sort((a, b) => a.number - b.number) };
            });
          }

          void Promise.all([
            qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] }),
            qc.invalidateQueries({ queryKey: ["restaurant_public", rid] }),
          ]);
          return createdId;
        }
      },

      setTableActive: async (tableId: string, active: boolean, customRid?: string) => {
        const rid = getRid(customRid);
        await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
        const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

        if (previousData) {
          qc.setQueryData<AdminData>(["restaurant_admin", rid], {
            ...previousData,
            tables: previousData.tables.map((t) =>
              t.id === tableId ? { ...t, active } : t,
            ),
          });
        }

        try {
          if (isLocalOperation(rid)) {
            demoStore.setTableActive(tableId, active);
            persistLocalRestaurantDemo();
          } else {
            await serverSetTableActive({
              data: { restaurantId: rid, tableId, active },
            });
          }
        } catch (err) {
          if (previousData) {
            qc.setQueryData(["restaurant_admin", rid], previousData);
          }
          throw err;
        }

        void Promise.all([
          qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] }),
          qc.invalidateQueries({ queryKey: ["restaurant_public", rid] }),
        ]);
      },

      removeTable: async (tableId: string, customRid?: string) => {
        const rid = getRid(customRid);
        await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
        const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

        if (previousData) {
          qc.setQueryData<AdminData>(["restaurant_admin", rid], {
            ...previousData,
            tables: previousData.tables.filter((t) => t.id !== tableId),
          });
        }

        try {
          if (isLocalOperation(rid)) {
            demoStore.removeTable(tableId);
            persistLocalRestaurantDemo();
          } else {
            await serverRemoveTable({
              data: { restaurantId: rid, tableId },
            });
          }
        } catch (err) {
          if (previousData) {
            qc.setQueryData(["restaurant_admin", rid], previousData);
          }
          throw err;
        }

        void Promise.all([
          qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] }),
          qc.invalidateQueries({ queryKey: ["restaurant_public", rid] }),
        ]);
      },

      saveCategory: async (
        arg1: string | { id?: string; name: string; sortOrder?: number },
        arg2?: { id?: string; name: string; sortOrder?: number } | string,
      ): Promise<string | null> => {
        const rid = typeof arg1 === "string" ? arg1 : getRid(typeof arg2 === "string" ? arg2 : undefined);
        const category = (typeof arg1 === "object" ? arg1 : arg2) as { id?: string; name: string; sortOrder?: number };

        if (category.id) {
          await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
          const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

          if (previousData) {
            qc.setQueryData<AdminData>(["restaurant_admin", rid], {
              ...previousData,
              categories: previousData.categories.map((c) =>
                c.id === category.id
                  ? {
                      ...c,
                      name: category.name,
                      ...(category.sortOrder !== undefined ? { sortOrder: category.sortOrder } : {}),
                    }
                  : c,
              ),
              products: previousData.products.map((p) =>
                p.categoryId === category.id ? { ...p, category: category.name } : p,
              ),
            });
          }

          let updatedId: string | null = category.id;
          try {
            if (isLocalOperation(rid)) {
              updatedId = demoStore.saveCategory(category);
              persistLocalRestaurantDemo();
            } else {
              const res = await serverSaveCategory({
                data: {
                  restaurantId: rid,
                  id: category.id,
                  name: category.name,
                  sortOrder: category.sortOrder,
                },
              });
              updatedId = res.id ?? category.id;
            }
          } catch (err) {
            if (previousData) {
              qc.setQueryData(["restaurant_admin", rid], previousData);
            }
            throw err;
          }

          void Promise.all([
            qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] }),
            qc.invalidateQueries({ queryKey: ["restaurant_public", rid] }),
          ]);
          return updatedId;
        } else {
          let createdId: string | null = null;
          if (isLocalOperation(rid)) {
            createdId = demoStore.saveCategory(category);
            persistLocalRestaurantDemo();
          } else {
            const res = await serverSaveCategory({
              data: {
                restaurantId: rid,
                name: category.name,
                sortOrder: category.sortOrder,
              },
            });
            createdId = res.id ?? null;
          }

          if (createdId) {
            qc.setQueryData<AdminData>(["restaurant_admin", rid], (current) => {
              if (!current || current.categories.some((item) => item.id === createdId)) return current;
              const created: Category = {
                id: createdId,
                name: category.name,
                sortOrder: category.sortOrder ?? current.categories.length + 1,
              };
              return {
                ...current,
                categories: [...current.categories, created].sort((a, b) => a.sortOrder - b.sortOrder),
              };
            });
          }

          void Promise.all([
            qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] }),
            qc.invalidateQueries({ queryKey: ["restaurant_public", rid] }),
          ]);
          return createdId;
        }
      },

      removeCategory: async (categoryId: string, customRid?: string) => {
        const rid = getRid(customRid);
        await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
        const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

        if (previousData) {
          qc.setQueryData<AdminData>(["restaurant_admin", rid], {
            ...previousData,
            categories: previousData.categories.filter((c) => c.id !== categoryId),
            products: previousData.products.map((p) =>
              p.categoryId === categoryId ? { ...p, categoryId: null, category: "Outros" } : p,
            ),
          });
        }

        try {
          if (isLocalOperation(rid)) {
            demoStore.removeCategory(categoryId);
            persistLocalRestaurantDemo();
          } else {
            await serverRemoveCategory({
              data: { restaurantId: rid, categoryId },
            });
          }
        } catch (err) {
          if (previousData) {
            qc.setQueryData(["restaurant_admin", rid], previousData);
          }
          throw err;
        }

        void Promise.all([
          qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] }),
          qc.invalidateQueries({ queryKey: ["restaurant_public", rid] }),
        ]);
      },

      saveProduct: async (
        arg1: string | {
          id?: string;
          name: string;
          description: string;
          price: number;
          categoryId: string | null;
          image: string;
          available: boolean;
          featured?: boolean;
        },
        arg2?: {
          id?: string;
          name: string;
          description: string;
          price: number;
          categoryId: string | null;
          image: string;
          available: boolean;
          featured?: boolean;
        } | string,
      ): Promise<string | null> => {
        const rid = typeof arg1 === "string" ? arg1 : getRid(typeof arg2 === "string" ? arg2 : undefined);
        const product = (typeof arg1 === "object" ? arg1 : arg2) as {
          id?: string;
          name: string;
          description: string;
          price: number;
          categoryId: string | null;
          image: string;
          available: boolean;
          featured?: boolean;
        };

        if (product.id) {
          await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
          const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

          if (previousData) {
            const catName =
              previousData.categories.find((c) => c.id === product.categoryId)?.name ?? "Outros";
            qc.setQueryData<AdminData>(["restaurant_admin", rid], {
              ...previousData,
              products: previousData.products.map((p) =>
                p.id === product.id
                  ? {
                      ...p,
                      ...product,
                      category: catName,
                      featured: product.featured ?? false,
                    }
                  : p,
              ),
            });
          }

          let updatedId: string | null = product.id;
          try {
            if (isLocalOperation(rid)) {
              updatedId = demoStore.saveProduct(product);
              persistLocalRestaurantDemo();
            } else {
              const res = await serverSaveProduct({
                data: {
                  restaurantId: rid,
                  ...product,
                },
              });
              updatedId = res.id ?? product.id;
            }
          } catch (err) {
            if (previousData) {
              qc.setQueryData(["restaurant_admin", rid], previousData);
            }
            throw err;
          }

          void Promise.all([
            qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] }),
            qc.invalidateQueries({ queryKey: ["restaurant_public", rid] }),
          ]);
          return updatedId;
        } else {
          let createdId: string | null = null;
          if (isLocalOperation(rid)) {
            createdId = demoStore.saveProduct(product);
            persistLocalRestaurantDemo();
          } else {
            const res = await serverSaveProduct({
              data: {
                restaurantId: rid,
                ...product,
              },
            });
            createdId = res.id ?? null;
          }

          if (createdId) {
            qc.setQueryData<AdminData>(["restaurant_admin", rid], (current) => {
              if (!current || current.products.some((item) => item.id === createdId)) return current;
              const created: Product = {
                id: createdId,
                name: product.name,
                description: product.description,
                price: product.price,
                categoryId: product.categoryId,
                category:
                  current.categories.find((item) => item.id === product.categoryId)?.name ?? "Outros",
                image: product.image,
                available: product.available,
                featured: product.featured ?? false,
              };
              return { ...current, products: [...current.products, created] };
            });
          }

          void Promise.all([
            qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] }),
            qc.invalidateQueries({ queryKey: ["restaurant_public", rid] }),
          ]);
          return createdId;
        }
      },

      setProductAvailable: async (productId: string, available: boolean, customRid?: string) => {
        const rid = getRid(customRid);
        await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
        const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

        if (previousData) {
          qc.setQueryData<AdminData>(["restaurant_admin", rid], {
            ...previousData,
            products: previousData.products.map((p) =>
              p.id === productId ? { ...p, available } : p,
            ),
          });
        }

        try {
          if (isLocalOperation(rid)) {
            demoStore.setProductAvailable(productId, available);
            persistLocalRestaurantDemo();
          } else {
            await serverSetProductAvailable({
              data: { restaurantId: rid, productId, available },
            });
          }
        } catch (err) {
          if (previousData) {
            qc.setQueryData(["restaurant_admin", rid], previousData);
          }
          throw err;
        }

        void Promise.all([
          qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] }),
          qc.invalidateQueries({ queryKey: ["restaurant_public", rid] }),
        ]);
      },

      setAvailable: async (productId: string, available: boolean, customRid?: string) => {
        const rid = getRid(customRid);
        await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
        const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

        if (previousData) {
          qc.setQueryData<AdminData>(["restaurant_admin", rid], {
            ...previousData,
            products: previousData.products.map((p) =>
              p.id === productId ? { ...p, available } : p,
            ),
          });
        }

        try {
          if (isLocalOperation(rid)) {
            demoStore.setProductAvailable(productId, available);
            persistLocalRestaurantDemo();
          } else {
            await serverSetProductAvailable({
              data: { restaurantId: rid, productId, available },
            });
          }
        } catch (err) {
          if (previousData) {
            qc.setQueryData(["restaurant_admin", rid], previousData);
          }
          throw err;
        }

        void Promise.all([
          qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] }),
          qc.invalidateQueries({ queryKey: ["restaurant_public", rid] }),
        ]);
      },

      removeProduct: async (productId: string, customRid?: string) => {
        const rid = getRid(customRid);
        await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
        const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

        if (previousData) {
          qc.setQueryData<AdminData>(["restaurant_admin", rid], {
            ...previousData,
            products: previousData.products.filter((p) => p.id !== productId),
          });
        }

        try {
          if (isLocalOperation(rid)) {
            demoStore.removeProduct(productId);
            persistLocalRestaurantDemo();
          } else {
            await serverRemoveProduct({
              data: { restaurantId: rid, productId },
            });
          }
        } catch (err) {
          if (previousData) {
            qc.setQueryData(["restaurant_admin", rid], previousData);
          }
          throw err;
        }

        void Promise.all([
          qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] }),
          qc.invalidateQueries({ queryKey: ["restaurant_public", rid] }),
        ]);
      },

      addReservation: async (
        arg1: string | (Omit<Reservation, "id" | "createdAt" | "status"> & { status?: ReservationStatus }),
        arg2?: (Omit<Reservation, "id" | "createdAt" | "status"> & { status?: ReservationStatus }) | string,
      ): Promise<string | null> => {
        const rid = typeof arg1 === "string" ? arg1 : getRid(typeof arg2 === "string" ? arg2 : undefined);
        const reservation = (typeof arg1 === "object" ? arg1 : arg2) as Omit<Reservation, "id" | "createdAt" | "status"> & { status?: ReservationStatus };

        let createdId: string | null = null;
        if (isLocalOperation(rid)) {
          createdId = demoStore.addReservation(reservation);
          persistLocalRestaurantDemo();
        } else {
          const res = await serverAddReservation({
            data: {
              restaurantId: rid,
              name: reservation.name,
              phone: reservation.phone,
              email: reservation.email,
              date: reservation.date,
              time: reservation.time,
              guests: reservation.guests,
              tableNumber: reservation.tableNumber,
              notes: reservation.notes,
              status: reservation.status ?? "confirmada",
            },
          });
          createdId = res.id ?? null;
        }

        if (createdId) {
          qc.setQueryData<AdminData>(["restaurant_admin", rid], (current) => {
            if (!current || current.reservations.some((item) => item.id === createdId)) return current;
            const created: Reservation = {
              id: createdId,
              name: reservation.name,
              phone: reservation.phone,
              email: reservation.email,
              date: reservation.date,
              time: reservation.time,
              guests: reservation.guests,
              tableNumber: reservation.tableNumber,
              notes: reservation.notes,
              origin: "telefone",
              status: reservation.status ?? "confirmada",
              createdAt: Date.now(),
            };
            return { ...current, reservations: [...current.reservations, created] };
          });
        }

        void qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] });
        return createdId;
      },

      updateReservation: async (
        id: string,
        patch: Partial<Omit<Reservation, "id" | "createdAt">>,
        customRid?: string,
      ) => {
        const rid = getRid(customRid);
        await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
        const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

        if (previousData) {
          qc.setQueryData<AdminData>(["restaurant_admin", rid], {
            ...previousData,
            reservations: previousData.reservations.map((r) =>
              r.id === id ? { ...r, ...patch } : r,
            ),
          });
        }

        try {
          if (isLocalOperation(rid)) {
            demoStore.updateReservation(id, patch);
            if (patch.status) demoStore.setReservationStatus(id, patch.status);
            persistLocalRestaurantDemo();
          } else {
            await serverUpdateReservation({
              data: {
                restaurantId: rid,
                id,
                name: patch.name,
                phone: patch.phone,
                email: patch.email,
                date: patch.date,
                time: patch.time,
                guests: patch.guests,
                tableNumber: patch.tableNumber,
                notes: patch.notes,
              },
            });
            if (patch.status) {
              await serverSetReservationStatus({
                data: { restaurantId: rid, id, status: patch.status },
              });
            }
          }
        } catch (err) {
          if (previousData) {
            qc.setQueryData(["restaurant_admin", rid], previousData);
          }
          throw err;
        }

        void qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] });
      },

      setReservationStatus: async (id: string, status: ReservationStatus, customRid?: string) => {
        const rid = getRid(customRid);
        await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
        const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

        if (previousData) {
          qc.setQueryData<AdminData>(["restaurant_admin", rid], {
            ...previousData,
            reservations: previousData.reservations.map((r) =>
              r.id === id ? { ...r, status } : r,
            ),
          });
        }

        try {
          if (isLocalOperation(rid)) {
            demoStore.setReservationStatus(id, status);
            persistLocalRestaurantDemo();
          } else {
            await serverSetReservationStatus({
              data: { restaurantId: rid, id, status },
            });
          }
        } catch (err) {
          if (previousData) {
            qc.setQueryData(["restaurant_admin", rid], previousData);
          }
          throw err;
        }

        void qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] });
      },

      removeReservation: async (id: string, customRid?: string) => {
        const rid = getRid(customRid);
        await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
        const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

        if (previousData) {
          qc.setQueryData<AdminData>(["restaurant_admin", rid], {
            ...previousData,
            reservations: previousData.reservations.filter((r) => r.id !== id),
          });
        }

        try {
          if (isLocalOperation(rid)) {
            demoStore.removeReservation(id);
            persistLocalRestaurantDemo();
          } else {
            await serverRemoveReservation({
              data: { restaurantId: rid, id },
            });
          }
        } catch (err) {
          if (previousData) {
            qc.setQueryData(["restaurant_admin", rid], previousData);
          }
          throw err;
        }

        void qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] });
      },

      saveSettings: async (
        arg1: string | AdminData["settings"],
        arg2?: AdminData["settings"] | string,
      ) => {
        const rid = typeof arg1 === "string" ? arg1 : getRid(typeof arg2 === "string" ? arg2 : undefined);
        const settings = (typeof arg1 === "object" ? arg1 : arg2) as AdminData["settings"];

        await qc.cancelQueries({ queryKey: ["restaurant_admin", rid] });
        const previousData = qc.getQueryData<AdminData>(["restaurant_admin", rid]);

        if (previousData) {
          qc.setQueryData<AdminData>(["restaurant_admin", rid], {
            ...previousData,
            settings: { ...settings },
          });
        }

        try {
          if (isLocalOperation(rid)) {
            demoStore.saveSettings(settings);
            persistLocalRestaurantDemo();
          } else {
            await serverSaveSettings({
              data: {
                restaurantId: rid,
                name: settings.name,
                tagline: settings.tagline,
                introduction: settings.introduction,
                logo: settings.logo,
                primaryColor: settings.primaryColor,
                phone: settings.phone,
                email: settings.email,
                address: settings.address,
                hours: settings.hours,
                features: settings.features,
              },
            });
          }
        } catch (err) {
          if (previousData) {
            qc.setQueryData(["restaurant_admin", rid], previousData);
          }
          throw err;
        }

        void Promise.all([
          qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] }),
          qc.invalidateQueries({ queryKey: ["restaurant_public", rid] }),
        ]);
      },

      reset: async (customRid?: string) => {
        const rid = getRid(customRid);
        if (!isLocalOperation(rid)) {
          throw new Error("A reposição de demonstração só está disponível no modo de testes.");
        }
        demoStore.resetDemo();
        persistLocalRestaurantDemo();
        void Promise.all([
          qc.invalidateQueries({ queryKey: ["restaurant_admin", rid] }),
          qc.invalidateQueries({ queryKey: ["restaurant_public", rid] }),
        ]);
      },
    };
  }, [boundRid, qc]);
}

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
