import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database as CentralDatabase } from "@/integrations/supabase/types";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type {
  AdminData,
  Category,
  Order,
  OrderStatus,
  Product,
  Reservation,
  ReservationStatus,
  Settings,
  Table,
  TableRequest,
} from "./demo-data";
import { tableSlug } from "./store";
import type { Database as RestaurantDatabase } from "./types";

export type RestaurantStaffRole = "proprietario" | "gerente" | "cozinha" | "sala";

export type RestaurantAction =
  "ver" | "pedidos" | "mesas" | "menu" | "reservas" | "definicoes" | "equipa" | "repor";

export type RestaurantAccessInfo = {
  permitido: boolean;
  role: "administrador" | RestaurantStaffRole;
  isAdminNWS: boolean;
  restaurantId: string;
};

/**
 * Validação rigorosa no servidor do Workspace:
 * 1. Administrador NWS tem acesso total a qualquer restaurante.
 * 2. Funcionários e proprietários têm acesso restrito apenas ao restaurante atribuído
 *    e às ações permitidas pela respetiva função (RBAC).
 */
export async function validarAcessoRestaurante(
  supabase: SupabaseClient<CentralDatabase>,
  userId: string,
  restaurantId: string,
  acao: RestaurantAction = "ver",
): Promise<RestaurantAccessInfo> {
  // 1. Verificar se é Administrador Global da Nova Web Studio
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (roleData?.role === "administrador") {
    return {
      permitido: true,
      role: "administrador",
      isAdminNWS: true,
      restaurantId,
    };
  }

  // 2. Verificar afiliação de funcionário no restaurante
  const { data: memberData } = await supabase
    .from("restaurant_memberships")
    .select("role, ativo")
    .eq("user_id", userId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  if (!memberData || !memberData.ativo) {
    throw new Error(
      `Acesso Negado: O seu utilizador não possui autorização para operar o restaurante "${restaurantId}".`,
    );
  }

  const staffRole = memberData.role as RestaurantStaffRole;

  // 3. Matriz de Permissões por Função de Restaurante
  const permissoesPorFuncao: Record<RestaurantStaffRole, RestaurantAction[]> = {
    proprietario: ["ver", "pedidos", "mesas", "menu", "reservas", "definicoes", "equipa"],
    gerente: ["ver", "pedidos", "mesas", "menu", "reservas", "definicoes", "equipa"],
    sala: ["ver", "pedidos", "mesas", "reservas"],
    cozinha: ["ver", "pedidos"],
  };

  const acoesPermitidas = permissoesPorFuncao[staffRole] ?? [];

  if (acao === "repor" && staffRole !== "proprietario") {
    throw new Error(
      "A reposição de dados de demonstração é restrita exclusivamente a Administradores NWS e Proprietários.",
    );
  }

  if (!acoesPermitidas.includes(acao)) {
    throw new Error(
      `Acesso Negado: A função "${staffRole}" não tem permissão para a operação "${acao}".`,
    );
  }

  return {
    permitido: true,
    role: staffRole,
    isAdminNWS: false,
    restaurantId,
  };
}

const ts = (s: string) => Date.parse(s);
const num = (v: unknown) => Number(v ?? 0);

/**
 * Leitura Administrativa Protegida:
 * Valida a sessão do utilizador no servidor antes de consultar pedidos, reservas, mesas e definições
 */
export const obterDadosAdminRestaurante = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ restaurantId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }): Promise<AdminData> => {
    const rid = data.restaurantId;
    const access = await validarAcessoRestaurante(context.supabase, context.userId, rid, "ver");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const [r, s, c, p, t, o, rq, rs] = await Promise.all([
      restClient.from("restaurants").select("id, slug, name").eq("id", rid).maybeSingle(),
      restClient.from("restaurant_settings").select("*").eq("restaurant_id", rid).maybeSingle(),
      restClient
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", rid)
        .order("sort_order")
        .order("name"),
      restClient
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", rid)
        .order("sort_order")
        .order("created_at"),
      restClient.from("tables").select("*").eq("restaurant_id", rid).order("number"),
      restClient
        .from("orders")
        .select("*, order_items(name, qty, price, product_id)")
        .eq("restaurant_id", rid)
        .gte("created_at", since)
        .order("created_at")
        .limit(500),
      restClient
        .from("service_requests")
        .select("*")
        .eq("restaurant_id", rid)
        .gte("created_at", since)
        .order("created_at"),
      restClient
        .from("reservations")
        .select("*")
        .eq("restaurant_id", rid)
        .order("date")
        .order("time"),
    ]);

    if (r.error || s.error) {
      throw new Error((r.error ?? s.error)!.message);
    }

    const rest = r.data;
    const set = s.data;

    if (!rest || !set) {
      throw new Error(`O restaurante "${rid}" não foi encontrado na base de dados.`);
    }

    const categories: Category[] = (c.data ?? []).map((x) => ({
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

    const products: Product[] = (p.data ?? []).map((x) => ({
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

    const tables: Table[] = (t.data ?? []).map((x) => ({
      id: x.id,
      number: x.number,
      name: `Mesa ${x.number}`,
      slug: tableSlug(x.number),
      seats: x.seats,
      active: x.active,
    }));

    const orders: Order[] = (o.data ?? []).map((x) => ({
      id: x.id,
      code: x.order_number,
      tableId: x.table_id,
      tableNumber: x.table_number,
      note: x.note,
      total: num(x.total),
      status: x.status as OrderStatus,
      closed: x.closed,
      createdAt: ts(x.created_at),
      items: (x.order_items ?? []).map((i) => ({
        productId: i.product_id ?? null,
        name: i.name,
        qty: i.qty,
        price: num(i.price),
      })),
    }));

    const requests: TableRequest[] = (rq.data ?? []).map((x) => ({
      id: x.id,
      tableId: x.table_id,
      tableNumber: x.table_number,
      type: x.type as TableRequest["type"],
      createdAt: ts(x.created_at),
      resolved: x.resolved,
    }));

    // Kitchen staff need orders and tables, never reservation contact details.
    const reservations: Reservation[] = (access.role === "cozinha" ? [] : (rs.data ?? [])).map(
      (x) => ({
        id: x.id,
        name: x.name,
        phone: x.phone,
        email: x.email,
        date: x.date,
        time: x.time,
        guests: x.guests,
        tableNumber: x.table_number ?? undefined,
        notes: x.notes,
        origin: x.origin as Reservation["origin"],
        status: x.status as ReservationStatus,
        createdAt: ts(x.created_at),
      }),
    );

    return {
      restaurantId: rest.id,
      slug: rest.slug,
      settings,
      categories,
      products,
      tables,
      orders,
      requests,
      reservations,
    };
  });

/** Atualizar estado de um pedido no servidor com cliente seguro */
export const serverSetOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        orderId: z.string(),
        status: z.enum(["recebido", "preparacao", "pronto", "entregue"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "pedidos");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const isDelivered = data.status === "entregue";
    const { data: updated, error } = await restClient
      .from("orders")
      .update({ status: data.status, closed: isDelivered })
      .eq("id", data.orderId)
      .eq("restaurant_id", data.restaurantId)
      .select("id");

    if (error) throw new Error(error.message);
    if (!updated || updated.length === 0) {
      throw new Error("Pedido não encontrado ou não pertence a este restaurante.");
    }
    return { ok: true };
  });

/** Resolver chamada de assistência ou pedido de conta no servidor */
export const serverResolveRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        requestId: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "mesas");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const { data: updated, error } = await restClient
      .from("service_requests")
      .update({ resolved: true })
      .eq("id", data.requestId)
      .eq("restaurant_id", data.restaurantId)
      .select("id");

    if (error) throw new Error(error.message);
    if (!updated || updated.length === 0) {
      throw new Error("Chamada não encontrada ou não pertence a este restaurante.");
    }
    return { ok: true };
  });

/** Libertar mesa com RPC atómica e isolamento estrito de restaurante */
export const serverFreeTable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        tableNumber: z.number().int().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "mesas");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    // Chamada exclusiva à RPC atómica com isolamento de restaurante
    const { error } = await restClient.rpc("free_table", {
      _restaurant_id: data.restaurantId,
      _number: data.tableNumber,
    });

    if (error) {
      throw new Error(
        `Erro ao libertar mesa via RPC atómica: ${error.message}. Certifique-se de que a migração da função free_table(_restaurant_id, _number) foi aplicada.`,
      );
    }

    return { ok: true };
  });

/** Criar ou atualizar mesa */
export const serverSaveTable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        id: z.string().optional(),
        number: z.number().int().min(1),
        seats: z.number().int().min(1).max(40),
        active: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "mesas");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const row = { number: data.number, seats: data.seats, active: data.active };
    const res = data.id
      ? await restClient
          .from("tables")
          .update(row)
          .eq("id", data.id)
          .eq("restaurant_id", data.restaurantId)
          .select("id")
      : await restClient
          .from("tables")
          .insert({ ...row, restaurant_id: data.restaurantId })
          .select("id");

    if (res.error) {
      throw new Error(
        res.error.code === "23505" ? `Já existe a mesa ${data.number}.` : res.error.message,
      );
    }
    if (data.id && (!res.data || res.data.length === 0)) {
      throw new Error("Mesa não encontrada ou não pertence a este restaurante.");
    }
    return { ok: true };
  });

/** Ativar/inativar mesa */
export const serverSetTableActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        tableId: z.string(),
        active: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "mesas");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const { data: updated, error } = await restClient
      .from("tables")
      .update({ active: data.active })
      .eq("id", data.tableId)
      .eq("restaurant_id", data.restaurantId)
      .select("id");

    if (error) throw new Error(error.message);
    if (!updated || updated.length === 0) {
      throw new Error("Mesa não encontrada ou não pertence a este restaurante.");
    }
    return { ok: true };
  });

/** Remover mesa */
export const serverRemoveTable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        tableId: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "mesas");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const { error } = await restClient
      .from("tables")
      .delete()
      .eq("id", data.tableId)
      .eq("restaurant_id", data.restaurantId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Guardar categoria da ementa */
export const serverSaveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        id: z.string().optional(),
        name: z.string().min(1).max(40),
        sortOrder: z.number().int().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "menu");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const res = data.id
      ? await restClient
          .from("menu_categories")
          .update({
            name: data.name,
            ...(data.sortOrder !== undefined ? { sort_order: data.sortOrder } : {}),
          })
          .eq("id", data.id)
          .eq("restaurant_id", data.restaurantId)
          .select("id")
      : await restClient
          .from("menu_categories")
          .insert({
            name: data.name,
            sort_order: data.sortOrder ?? 99,
            restaurant_id: data.restaurantId,
          })
          .select("id");

    if (res.error) throw new Error(res.error.message);
    return { ok: true };
  });

/** Remover categoria da ementa */
export const serverRemoveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        categoryId: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "menu");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const { error } = await restClient
      .from("menu_categories")
      .delete()
      .eq("id", data.categoryId)
      .eq("restaurant_id", data.restaurantId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Guardar prato/produto da ementa */
export const serverSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        id: z.string().optional(),
        name: z.string().min(1).max(80),
        description: z.string().max(240).default(""),
        price: z.number().min(0),
        categoryId: z.string().nullable(),
        image: z.string().default(""),
        available: z.boolean(),
        featured: z.boolean().default(false),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "menu");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const row = {
      name: data.name,
      description: data.description,
      price: data.price,
      category_id: data.categoryId,
      image: data.image,
      available: data.available,
      featured: data.featured,
    };

    const res = data.id
      ? await restClient
          .from("menu_items")
          .update(row)
          .eq("id", data.id)
          .eq("restaurant_id", data.restaurantId)
          .select("id")
      : await restClient
          .from("menu_items")
          .insert({ ...row, restaurant_id: data.restaurantId })
          .select("id");

    if (res.error) throw new Error(res.error.message);
    if (data.id && (!res.data || res.data.length === 0)) {
      throw new Error("Produto não encontrado ou não pertence a este restaurante.");
    }
    return { ok: true };
  });

/** Alterar disponibilidade rápida de produto */
export const serverSetProductAvailable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        productId: z.string(),
        available: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "menu");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const { data: updated, error } = await restClient
      .from("menu_items")
      .update({ available: data.available })
      .eq("id", data.productId)
      .eq("restaurant_id", data.restaurantId)
      .select("id");

    if (error) throw new Error(error.message);
    if (!updated || updated.length === 0) {
      throw new Error("Produto não encontrado ou não pertence a este restaurante.");
    }
    return { ok: true };
  });

/** Remover produto da ementa */
export const serverRemoveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        productId: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "menu");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const { error } = await restClient
      .from("menu_items")
      .delete()
      .eq("id", data.productId)
      .eq("restaurant_id", data.restaurantId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Guardar definições e identidade do restaurante */
export const serverSaveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        name: z.string().min(1).max(60),
        tagline: z.string().max(80).default(""),
        introduction: z.string().max(300).default(""),
        logo: z.string().default(""),
        primaryColor: z.string().default("#5b6e4a"),
        phone: z.string().max(30).default(""),
        email: z.string().max(200).default(""),
        address: z.string().max(200).default(""),
        hours: z.array(z.string()).default([]),
        features: z.object({
          qrOrders: z.boolean(),
          callWaiter: z.boolean(),
          requestBill: z.boolean(),
          reservations: z.boolean(),
        }),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(
      context.supabase,
      context.userId,
      data.restaurantId,
      "definicoes",
    );

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();
    const rid = data.restaurantId;

    const r1 = await restClient.from("restaurants").update({ name: data.name }).eq("id", rid);

    if (r1.error) throw new Error(r1.error.message);

    const r2 = await restClient
      .from("restaurant_settings")
      .update({
        tagline: data.tagline,
        introduction: data.introduction,
        logo: data.logo,
        primary_color: data.primaryColor,
        phone: data.phone,
        email: data.email,
        address: data.address,
        hours: data.hours,
        features: data.features,
        updated_at: new Date().toISOString(),
      })
      .eq("restaurant_id", rid);

    if (r2.error) throw new Error(r2.error.message);
    return { ok: true };
  });

/** Upload seguro de imagem através do servidor */
export const serverUploadImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string().min(1),
        fileName: z.string().min(1).max(255),
        base64Data: z
          .string()
          .min(4)
          .max(6_000_000)
          .regex(/^[A-Za-z0-9+/]+={0,2}$/),
        contentType: z.literal("image/jpeg"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "menu");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const buffer = Buffer.from(data.base64Data, "base64");
    if (
      buffer.length > 4 * 1024 * 1024 ||
      buffer.length < 4 ||
      buffer[0] !== 0xff ||
      buffer[1] !== 0xd8 ||
      buffer[2] !== 0xff
    ) {
      throw new Error("Imagem JPEG inválida ou superior a 4 MB.");
    }
    const path = `${data.restaurantId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

    const up = await restClient.storage
      .from("restaurant-media")
      .upload(path, buffer, { contentType: data.contentType, upsert: false });

    if (up.error) {
      throw new Error(`Falha no envio de ficheiro para o Storage: ${up.error.message}`);
    }

    const signed = await restClient.storage
      .from("restaurant-media")
      .createSignedUrl(path, 60 * 60 * 24 * 365);

    if (signed.error || !signed.data) {
      throw new Error("Não foi possível gerar o endereço de acesso à imagem.");
    }

    return { signedUrl: signed.data.signedUrl };
  });

/** Adicionar reserva manual / telefónica */
export const serverAddReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        name: z.string().min(1).max(100),
        phone: z.string().max(30).default(""),
        email: z.string().max(200).default(""),
        date: z.string(),
        time: z.string(),
        guests: z.number().int().min(1).max(40),
        tableNumber: z.number().int().optional(),
        notes: z.string().max(500).default(""),
        status: z
          .enum(["pendente", "confirmada", "chegou", "concluida", "cancelada"])
          .default("confirmada"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "reservas");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const { error } = await restClient.from("reservations").insert({
      restaurant_id: data.restaurantId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      date: data.date,
      time: data.time,
      guests: data.guests,
      table_number: data.tableNumber ?? null,
      notes: data.notes,
      origin: "telefone",
      status: data.status,
    });

    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Atualizar dados de reserva preservando campos existentes sem sobrescrever */
export const serverUpdateReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        phone: z.string().max(30).optional(),
        email: z.string().max(200).optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        guests: z.number().int().min(1).max(40).optional(),
        tableNumber: z.number().int().nullable().optional(),
        notes: z.string().max(500).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "reservas");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const updatePayload: RestaurantDatabase["public"]["Tables"]["reservations"]["Update"] = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.date !== undefined) updatePayload.date = data.date;
    if (data.time !== undefined) updatePayload.time = data.time;
    if (data.guests !== undefined) updatePayload.guests = data.guests;
    if (data.tableNumber !== undefined) updatePayload.table_number = data.tableNumber;
    if (data.notes !== undefined) updatePayload.notes = data.notes;

    if (Object.keys(updatePayload).length === 0) {
      return { ok: true };
    }

    const { data: updated, error } = await restClient
      .from("reservations")
      .update(updatePayload)
      .eq("id", data.id)
      .eq("restaurant_id", data.restaurantId)
      .select("id");

    if (error) throw new Error(error.message);
    if (!updated || updated.length === 0) {
      throw new Error("Reserva não encontrada ou não pertence a este restaurante.");
    }
    return { ok: true };
  });

/** Alterar status de reserva */
export const serverSetReservationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        id: z.string(),
        status: z.enum(["pendente", "confirmada", "chegou", "concluida", "cancelada"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "reservas");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const { data: updated, error } = await restClient
      .from("reservations")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("restaurant_id", data.restaurantId)
      .select("id");

    if (error) throw new Error(error.message);
    if (!updated || updated.length === 0) {
      throw new Error("Reserva não encontrada ou não pertence a este restaurante.");
    }
    return { ok: true };
  });

/** Remover reserva */
export const serverRemoveReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string(),
        id: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "reservas");

    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    const { error } = await restClient
      .from("reservations")
      .delete()
      .eq("id", data.id)
      .eq("restaurant_id", data.restaurantId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Reset de demonstração existe APENAS no estado em memória do frontend isolado.
 * Não executar RPC reset_demo na base de dados dedicada de produção. */
export const serverResetDemo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ restaurantId: z.string() }).parse(data))
  .handler(async () => {
    throw new Error("Reset remoto desativado: utilize a demonstração local isolada.");
  });

/** Obter lista de restaurantes aos quais o utilizador autenticado tem acesso */
export const obterRestaurantesAutorizados = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roleData } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .maybeSingle();

    const isAdmin = roleData?.role === "administrador";

    if (isAdmin) {
      const { data: allRestaurants, error: listError } = await context.supabase
        .from("crm_restaurants")
        .select("*")
        .order("nome");

      if (listError) throw new Error(listError.message);

      return {
        isAdmin: true,
        restaurantes: allRestaurants ?? [],
      };
    }

    const { data: memberships, error: membershipError } = await context.supabase
      .from("restaurant_memberships")
      .select("restaurant_id, role, crm_restaurants(*)")
      .eq("user_id", context.userId)
      .eq("ativo", true);

    if (membershipError) throw new Error(membershipError.message);

    const permitidos = (memberships ?? []).map((m) => ({
      id: m.restaurant_id,
      nome: m.crm_restaurants?.nome ?? m.restaurant_id,
      slug: m.crm_restaurants?.slug ?? m.restaurant_id,
      subdominio: m.crm_restaurants?.subdominio ?? "",
      role: m.role,
      ativo: true,
    }));

    return {
      isAdmin: false,
      restaurantes: permitidos,
    };
  });

/** Obter permissões do utilizador ativo para um restaurante específico */
export const obterPermissoesAtivas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({ restaurantId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    try {
      const access = await validarAcessoRestaurante(
        context.supabase,
        context.userId,
        data.restaurantId,
        "ver",
      );
      return access;
    } catch (e) {
      return {
        permitido: false,
        role: "sala" as RestaurantStaffRole,
        isAdminNWS: false,
        restaurantId: data.restaurantId,
        erro: (e as Error).message,
      };
    }
  });

/** Convidar novo funcionário para um restaurante */
export const convidarFuncionarioRestaurante = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        restaurantId: z.string().min(1),
        email: z.string().email(),
        role: z.enum(["proprietario", "gerente", "cozinha", "sala"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "equipa");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .ilike("email", data.email.trim())
      .maybeSingle();

    if (existingProfile?.id) {
      const { error: insErr } = await supabaseAdmin.from("restaurant_memberships").upsert(
        {
          user_id: existingProfile.id,
          restaurant_id: data.restaurantId,
          role: data.role,
          ativo: true,
          criado_por: context.userId,
        },
        { onConflict: "user_id,restaurant_id" },
      );

      if (insErr) throw new Error(insErr.message);
      return { ok: true, associadoDireto: true };
    }

    const { error: inviteErr } = await supabaseAdmin.from("restaurant_invites").insert({
      email: data.email.trim().toLowerCase(),
      restaurant_id: data.restaurantId,
      role: data.role,
      criado_por: context.userId,
    });

    if (inviteErr) throw new Error(inviteErr.message);
    return { ok: true, convidado: true };
  });

/** Equipa: apenas gestores autorizados recebem dados de outros funcionários. */
export const listarMembrosRestaurante = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ restaurantId: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "equipa");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: members, error } = await supabaseAdmin
      .from("restaurant_memberships")
      .select("id, user_id, role, ativo, criado_em")
      .eq("restaurant_id", data.restaurantId)
      .order("criado_em");
    if (error) throw new Error(error.message);

    const userIds = (members ?? []).map((m) => m.user_id);
    const profiles = userIds.length
      ? await supabaseAdmin.from("profiles").select("id, nome, email, foto_url").in("id", userIds)
      : {
          data: [] as Array<{ id: string; nome: string; email: string; foto_url: string | null }>,
          error: null,
        };
    if (profiles.error) throw new Error(profiles.error.message);
    const byId = new Map((profiles.data ?? []).map((p) => [p.id, p]));
    return (members ?? []).map((m) => ({
      ...m,
      profiles: {
        nome: byId.get(m.user_id)?.nome ?? "Funcionário",
        email: byId.get(m.user_id)?.email ?? "",
        foto_url: byId.get(m.user_id)?.foto_url ?? "",
      },
    }));
  });

/** A revogação faz uma desativação auditável e nunca confia só no botão do browser. */
export const revogarFuncionarioRestaurante = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({ restaurantId: z.string().min(1), memberId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await validarAcessoRestaurante(context.supabase, context.userId, data.restaurantId, "equipa");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: member, error: readError } = await supabaseAdmin
      .from("restaurant_memberships")
      .select("id, role, user_id")
      .eq("id", data.memberId)
      .eq("restaurant_id", data.restaurantId)
      .eq("ativo", true)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!member) throw new Error("Funcionário não encontrado neste restaurante.");

    if (member.role === "proprietario") {
      const { count, error: countError } = await supabaseAdmin
        .from("restaurant_memberships")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", data.restaurantId)
        .eq("role", "proprietario")
        .eq("ativo", true);
      if (countError) throw new Error(countError.message);
      if ((count ?? 0) <= 1) throw new Error("Não é possível remover o último proprietário.");
    }

    const { data: updated, error } = await supabaseAdmin
      .from("restaurant_memberships")
      .update({ ativo: false })
      .eq("id", data.memberId)
      .eq("restaurant_id", data.restaurantId)
      .select("id");
    if (error) throw new Error(error.message);
    if (!updated?.length) throw new Error("Não foi possível revogar o acesso.");
    return { ok: true };
  });

/** Criar novo restaurante cliente (Apenas Administrador NWS) */
export const criarNovoRestaurante = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) =>
    z
      .object({
        id: z
          .string()
          .min(2)
          .regex(/^[a-z0-9-]+$/),
        nome: z.string().min(2).max(80),
        subdominio: z.string().optional().default(""),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: roleData } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (roleData?.role !== "administrador") {
      throw new Error(
        "Apenas administradores da Nova Web Studio podem criar novos restaurantes clientes.",
      );
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getRestaurantServerClient } = await import("./client.server");
    const restClient = getRestaurantServerClient();

    // 1. Criar no catálogo central CRM
    const { error: crmErr } = await supabaseAdmin.from("crm_restaurants").insert({
      id: data.id,
      nome: data.nome,
      slug: data.id,
      subdominio: data.subdominio || `${data.id}.novawebstudio.pt`,
      ativo: true,
    });

    if (crmErr) throw new Error(crmErr.message);

    // 2. Inicializar na base de dados de restaurantes
    const { error: restDbErr } = await restClient.from("restaurants").insert({
      id: data.id,
      slug: data.id,
      name: data.nome,
    });

    if (restDbErr) {
      console.warn(
        "[Restaurante] Aviso ao criar entrada no banco de dados dedicado:",
        restDbErr.message,
      );
    }

    await restClient.from("restaurant_settings").insert({
      restaurant_id: data.id,
      tagline: `Bem-vindo ao ${data.nome}`,
      introduction: "Serviço de restauração de qualidade com pedidos por QR Code.",
    });

    return { ok: true, id: data.id };
  });
