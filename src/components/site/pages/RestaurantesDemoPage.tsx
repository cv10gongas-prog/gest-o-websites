import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BellRing,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  Columns,
  LayoutDashboard,
  LayoutGrid,
  MenuSquare,
  Minus,
  Phone,
  Plus,
  Receipt,
  RotateCcw,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Chip } from "@/components/crm/Bits";
import { NovaRestauranteLogo } from "@/components/site/NovaRestauranteLogo";
import { SiteChrome } from "@/components/site/SiteChrome";
import { dict, PATHS, type Locale } from "@/lib/i18n";

export type OrderStatus = "new" | "prep" | "ready" | "delivered";
export type ModuleKey = "overview" | "bookings" | "tables" | "kitchen" | "menu" | "guest";

export interface DemoMenuItem {
  id: string;
  name: string;
  price: number;
  category: "starters" | "mains" | "drinks" | "desserts";
  description: string;
  available: boolean;
}

export interface DemoOrderItem extends DemoMenuItem {
  quantity: number;
  notes?: string;
}

export interface DemoOrder {
  id: string;
  table: string;
  time: string;
  items: DemoOrderItem[];
  status: OrderStatus;
  notes?: string;
  total: number;
}

export interface DemoBooking {
  id: string;
  name: string;
  time: string;
  guests: number;
  type: "online" | "phone";
  table?: string;
  status: "confirmed";
}

export interface DemoAlert {
  id: string;
  table: string;
  type: "waiter" | "bill";
  time: string;
}

export interface DemoTable {
  id: string;
  name: string;
  zone: "main" | "terrace";
  pax: number;
  reservedBookingId?: string;
}

const INITIAL_MENU_ITEMS: DemoMenuItem[] = [
  {
    id: "item-1",
    name: "Pão & Azeitonas Marinadas",
    price: 3.5,
    category: "starters",
    description: "Pão de fermentação lenta com azeitonas temperadas e azeite virgem extra.",
    available: true,
  },
  {
    id: "item-2",
    name: "Bacalhau com Broa da Casa",
    price: 16.5,
    category: "mains",
    description:
      "Lombo de bacalhau assado no forno com crosta de broa de milho e grelos salteados.",
    available: true,
  },
  {
    id: "item-3",
    name: "Bife da Vazia com Batata Rústica",
    price: 18.0,
    category: "mains",
    description: "Bife da vazia grelhado com molho de mostarda antiga e batata rústica.",
    available: true,
  },
  {
    id: "item-4",
    name: "Vinho Tinto Reserva Douro",
    price: 15.0,
    category: "drinks",
    description: "Garrafa 750ml, colheita selecionada, aromas de frutos vermelhos e especiarias.",
    available: true,
  },
  {
    id: "item-5",
    name: "Água Mineral das Pedras 0.5L",
    price: 2.0,
    category: "drinks",
    description: "Água mineral natural gaseificada.",
    available: true,
  },
  {
    id: "item-6",
    name: "Mousse de Chocolate Artesanal",
    price: 4.5,
    category: "desserts",
    description: "Chocolate negro 70% com flor de sal e raspas de laranja.",
    available: true,
  },
];

const INITIAL_ORDERS: DemoOrder[] = [
  {
    id: "PED-101",
    table: "Mesa 02",
    time: "Há 12 min",
    status: "prep",
    total: 34.5,
    items: [
      {
        id: "item-2",
        name: "Bacalhau com Broa da Casa",
        price: 16.5,
        quantity: 2,
        category: "mains",
        description: "",
        available: true,
      },
      {
        id: "item-5",
        name: "Água Mineral das Pedras 0.5L",
        price: 2.0,
        quantity: 1,
        category: "drinks",
        description: "",
        available: true,
      },
    ],
  },
  {
    id: "PED-102",
    table: "Mesa 07",
    time: "Há 25 min",
    status: "ready",
    total: 18.0,
    items: [
      {
        id: "item-3",
        name: "Bife da Vazia com Batata Rústica",
        price: 18.0,
        quantity: 1,
        category: "mains",
        description: "",
        available: true,
        notes: "Ponto da carne: médio",
      },
    ],
  },
];

const INITIAL_BOOKINGS: DemoBooking[] = [
  {
    id: "RES-01",
    name: "Gonçalo Ferreira",
    time: "19:30",
    guests: 2,
    type: "online",
    table: "Mesa 08",
    status: "confirmed",
  },
  {
    id: "RES-02",
    name: "Dra. Beatriz Santos",
    time: "20:00",
    guests: 4,
    type: "phone",
    table: "Mesa 06",
    status: "confirmed",
  },
  {
    id: "RES-03",
    name: "Pedro Alvares",
    time: "21:15",
    guests: 6,
    type: "online",
    table: "Mesa 12",
    status: "confirmed",
  },
];

const TABLES_BASE: DemoTable[] = [
  { id: "1", name: "Mesa 01", zone: "main", pax: 2 },
  { id: "2", name: "Mesa 02", zone: "main", pax: 4 },
  { id: "3", name: "Mesa 03", zone: "main", pax: 2 },
  { id: "4", name: "Mesa 04", zone: "main", pax: 4 },
  { id: "5", name: "Mesa 05", zone: "main", pax: 6 },
  { id: "6", name: "Mesa 06", zone: "main", pax: 4, reservedBookingId: "RES-02" },
  { id: "7", name: "Mesa 07", zone: "terrace", pax: 2 },
  { id: "8", name: "Mesa 08", zone: "terrace", pax: 4, reservedBookingId: "RES-01" },
  { id: "9", name: "Mesa 09", zone: "terrace", pax: 2 },
  { id: "10", name: "Mesa 10", zone: "terrace", pax: 4 },
  { id: "11", name: "Mesa 11", zone: "terrace", pax: 6 },
  { id: "12", name: "Mesa 12", zone: "terrace", pax: 8, reservedBookingId: "RES-03" },
];

export function RestaurantesDemoPage({ locale }: { locale: Locale }) {
  const t = dict[locale].restaurantesDemo;
  const paths = PATHS[locale];

  // Demo Shared State
  const [activeTab, setActiveTab] = useState<ModuleKey>("guest");
  const [splitView, setSplitView] = useState(false);

  // Kitchen/Panel/Bookings Sub-tab logic when in splitView
  const [rightPanelTab, setRightPanelTab] = useState<ModuleKey>("overview");

  // State Stores
  const [menuItems, setMenuItems] = useState<DemoMenuItem[]>(INITIAL_MENU_ITEMS);
  const [orders, setOrders] = useState<DemoOrder[]>(INITIAL_ORDERS);
  const [alerts, setAlerts] = useState<DemoAlert[]>([]);
  const [bookings, setBookings] = useState<DemoBooking[]>(INITIAL_BOOKINGS);

  // Guest Mobile State
  const [cart, setCart] = useState<DemoOrderItem[]>([]);
  const [notes, setNotes] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [guestActiveOrderId, setGuestActiveOrderId] = useState<string | null>(null);

  // Menu Settings State
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>("all");

  // Tables State
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // New Booking Form State
  const [bookingForm, setBookingForm] = useState({
    name: "Mariana Silva",
    date: new Date().toISOString().split("T")[0],
    time: "20:30",
    guests: 2,
    type: "online" as "online" | "phone",
  });

  // Calculate cart total
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Guest order status
  const currentGuestOrder = orders.find((o) => o.id === guestActiveOrderId) ?? null;

  // Actions
  function handleAddToCart(item: DemoMenuItem) {
    if (!item.available) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} ${t.toasts.addedToCart}`);
  }

  function handleUpdateQuantity(itemId: string, delta: number) {
    setCart(
      (prev) =>
        prev
          .map((item) => {
            if (item.id === itemId) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as DemoOrderItem[],
    );
  }

  function handleSendOrder() {
    if (cart.length === 0) return;

    const newOrderId = `PED-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: DemoOrder = {
      id: newOrderId,
      table: "Mesa 04",
      time: "Agora mesmo",
      items: [...cart],
      status: "new",
      notes: notes.trim() || undefined,
      total: cartSubtotal,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setGuestActiveOrderId(newOrderId);
    setCart([]);
    setNotes("");

    toast.success(t.guest.orderSentTitle);
  }

  function handleCallWaiter() {
    const newAlert: DemoAlert = {
      id: `alt-waiter-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      table: "Mesa 04",
      type: "waiter",
      time: "Agora",
    };
    setAlerts((prev) => [newAlert, ...prev]);
    toast.success(t.guest.callWaiterSuccess);
  }

  function handleRequestBill() {
    const newAlert: DemoAlert = {
      id: `alt-bill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      table: "Mesa 04",
      type: "bill",
      time: "Agora",
    };
    setAlerts((prev) => [newAlert, ...prev]);
    toast.success(t.guest.requestBillSuccess);
  }

  function handleDismissAlert(alertId: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    toast.success(t.panel.dismissAlert);
  }

  function handleUpdateOrderStatus(orderId: string, nextStatus: OrderStatus) {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)),
    );
    toast.success(t.toasts.statusUpdated);
  }

  function handleToggleAvailability(itemId: string) {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, available: !item.available } : item)),
    );
    toast.success(t.toasts.availabilityUpdated);
  }

  function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingForm.name.trim()) return;

    const newBookingId = `RES-${Math.floor(10 + Math.random() * 90)}`;
    const newBooking: DemoBooking = {
      id: newBookingId,
      name: bookingForm.name.trim(),
      time: bookingForm.time,
      guests: Number(bookingForm.guests),
      type: bookingForm.type,
      table: `Mesa ${Math.floor(1 + Math.random() * 12)
        .toString()
        .padStart(2, "0")}`,
      status: "confirmed",
    };

    setBookings((prev) => [...prev, newBooking].sort((a, b) => a.time.localeCompare(b.time)));
    setBookingForm((prev) => ({ ...prev, name: "" }));
    toast.success(t.toasts.bookingSuccess);
  }

  function handleAddQuickPhoneBooking() {
    const phoneBooking: DemoBooking = {
      id: `RES-${Math.floor(10 + Math.random() * 90)}`,
      name: "Carlos Mendes (Telefone)",
      time: "21:00",
      guests: 4,
      type: "phone",
      table: "Mesa 06",
      status: "confirmed",
    };
    setBookings((prev) => [...prev, phoneBooking].sort((a, b) => a.time.localeCompare(b.time)));
    toast.success(t.toasts.quickPhoneSuccess);
  }

  function handleResetDemo() {
    setOrders(INITIAL_ORDERS);
    setCart([]);
    setNotes("");
    setGuestActiveOrderId(null);
    setAlerts([]);
    setBookings(INITIAL_BOOKINGS);
    setMenuItems(INITIAL_MENU_ITEMS);
    toast.success(t.toasts.resetSuccess);
  }

  // Current view resolution
  const leftTab = splitView ? "guest" : activeTab;
  const rightTab = splitView ? rightPanelTab : activeTab;

  function handleTabChange(key: ModuleKey) {
    if (splitView) {
      if (key === "guest") return;
      setRightPanelTab(key);
    } else {
      setActiveTab(key);
    }
  }

  // Derive Table Status
  const computedTables = TABLES_BASE.map((table) => {
    const hasBillAlert = alerts.some((a) => a.table === table.name && a.type === "bill");
    if (hasBillAlert) return { ...table, computedStatus: "bill", activeOrder: null };

    const activeOrder = orders.find((o) => o.table === table.name && o.status !== "delivered");
    if (activeOrder) return { ...table, computedStatus: "occupied", activeOrder };

    const isReserved = bookings.some((b) => b.table === table.name);
    if (table.reservedBookingId || isReserved)
      return { ...table, computedStatus: "reserved", activeOrder: null };

    return { ...table, computedStatus: "free", activeOrder: null };
  });

  const shiftRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== "delivered").length;
  const activeTablesCount = computedTables.filter(
    (t) => t.computedStatus === "occupied" || t.computedStatus === "bill",
  ).length;

  return (
    <SiteChrome locale={locale} page="restaurantesDemo">
      {/* HEADER DA DEMONSTRAÇÃO */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link
                to={paths.restaurantes}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                {t.back}
              </Link>
              <Chip tone="primary">{t.chip}</Chip>
            </div>

            <h1 className="orbit-gradient-text mt-3 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              {t.title}
            </h1>

            <p className="mt-2 max-w-2xl text-xs text-muted-foreground sm:text-sm">{t.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleResetDemo}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background/60 px-3.5 text-xs font-medium text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              {t.reset}
            </button>

            <Link
              to={paths.contact}
              search={{ tipo: "restaurantes" }}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/10 transition hover:opacity-90"
            >
              <CalendarCheck className="size-3.5" />
              {t.ctaProposal}
            </Link>
          </div>
        </div>

        {/* Informative commercial notice */}
        <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-2.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-primary shrink-0" />
            <span>{t.notice}</span>
          </div>

          {/* Large desktop split-view toggle */}
          <div className="hidden xl:flex items-center gap-2">
            <button
              onClick={() => {
                setSplitView(!splitView);
                if (!splitView) {
                  setActiveTab("guest");
                  if (activeTab === "guest") setRightPanelTab("overview");
                  else setRightPanelTab(activeTab);
                } else {
                  setActiveTab(rightPanelTab);
                }
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                splitView
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Columns className="size-3.5" />
              {splitView ? t.singleView : t.splitView}
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS BAR (MOBILE & DESKTOP SINGLE VIEW) */}
        {!splitView && (
          <div className="mt-6 flex gap-2 overflow-x-auto pb-3 scrollbar-none border-b border-border/60">
            {(["overview", "bookings", "tables", "kitchen", "menu", "guest"] as ModuleKey[]).map(
              (key) => {
                const icons: Record<ModuleKey, LucideIcon> = {
                  overview: LayoutDashboard,
                  bookings: CalendarDays,
                  tables: LayoutGrid,
                  kitchen: ChefHat,
                  menu: MenuSquare,
                  guest: Smartphone,
                };
                const Icon = icons[key];
                const isSelected = activeTab === key;
                const titleMap: Record<ModuleKey, string> = {
                  overview: t.tabOverview,
                  bookings: t.tabBookings,
                  tables: t.tabTables,
                  kitchen: t.tabKitchen,
                  menu: t.tabMenu,
                  guest: t.tabGuest,
                };

                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center shrink-0 gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "border border-border/70 bg-card/40 text-muted-foreground hover:bg-card hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                    {titleMap[key]}
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>

      {/* DEMO CONTENT AREA */}
      <div className={splitView ? "grid grid-cols-[380px_1fr] gap-8" : "w-full"}>
        {/* ========================================================================= */}
        {/* LEFT PANE (GUEST) OR CENTER PANE                                          */}
        {/* ========================================================================= */}
        {(activeTab === "guest" || splitView) && (
          <div className="flex flex-col items-center">
            {splitView && (
              <div className="mb-4 flex items-center gap-2 self-start text-xs font-semibold text-primary">
                <Smartphone className="size-4" />
                {t.tabGuest} ({t.guest.table})
              </div>
            )}

            {/* Smartphone Frame */}
            <div className="w-full max-w-[420px] rounded-[2.8rem] border-[6px] border-[#101b2b] bg-[#050b14] p-3 shadow-2xl shadow-black/80">
              <div className="relative min-h-[640px] overflow-hidden rounded-[2.2rem] border border-border/60 bg-background flex flex-col justify-between">
                {/* Top Status Bar & Header */}
                <div className="sticky top-0 z-10 border-b border-border/60 bg-card/90 px-4 py-3 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <NovaRestauranteLogo size="md" showTagline={false} tagline={t.logoTagline} />
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                      {t.guest.table}
                    </span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handleCallWaiter}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-secondary/60 py-1.5 text-[10px] font-medium text-foreground transition hover:border-primary/40 hover:bg-secondary"
                    >
                      <BellRing className="size-3 text-amber-400" />
                      {t.guest.callWaiter}
                    </button>
                    <button
                      onClick={handleRequestBill}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-secondary/60 py-1.5 text-[10px] font-medium text-foreground transition hover:border-primary/40 hover:bg-secondary"
                    >
                      <Receipt className="size-3 text-primary" />
                      {t.guest.requestBill}
                    </button>
                  </div>
                </div>

                {/* Main Phone Screen View */}
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  {currentGuestOrder ? (
                    /* Active Order Status Tracking View */
                    <div className="rounded-2xl border border-primary/25 bg-card/60 p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-border/40 pb-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                            {currentGuestOrder.id}
                          </span>
                          <h4 className="text-sm font-semibold">{t.guest.orderSentTitle}</h4>
                        </div>
                        <span className="rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {t.guest.table}
                        </span>
                      </div>

                      {/* Progress Steps */}
                      <div className="space-y-3 py-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid size-7 place-items-center rounded-full text-xs font-bold ${
                              ["new", "prep", "ready", "delivered"].includes(
                                currentGuestOrder.status,
                              )
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            <Check className="size-4" />
                          </span>
                          <div>
                            <p className="text-xs font-medium">{t.guest.prepStep1}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {t.guest.orderSentSubtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`grid size-7 place-items-center rounded-full text-xs font-bold ${
                              ["prep", "ready", "delivered"].includes(currentGuestOrder.status)
                                ? "bg-primary text-primary-foreground animate-pulse"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {["ready", "delivered"].includes(currentGuestOrder.status) ? (
                              <Check className="size-4" />
                            ) : (
                              "2"
                            )}
                          </span>
                          <div>
                            <p className="text-xs font-medium">{t.guest.prepStep2}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {t.guest.prepStep2Desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`grid size-7 place-items-center rounded-full text-xs font-bold ${
                              ["ready", "delivered"].includes(currentGuestOrder.status)
                                ? "bg-emerald-400 text-black font-bold"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {currentGuestOrder.status === "delivered" ? (
                              <Check className="size-4" />
                            ) : (
                              "3"
                            )}
                          </span>
                          <div>
                            <p className="text-xs font-medium">{t.guest.prepStep3}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {t.guest.prepStep3Desc}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order items summary */}
                      <div className="rounded-xl border border-border/50 bg-background/50 p-3 text-xs space-y-1.5">
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                          {t.guest.summaryTitle}
                        </p>
                        {currentGuestOrder.items.map((i) => (
                          <div key={i.id} className="flex justify-between">
                            <span>
                              {i.quantity}x {i.name}
                            </span>
                            <span className="font-semibold">
                              {(i.price * i.quantity).toFixed(2)} €
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-border/40 pt-1.5 flex justify-between font-bold text-foreground">
                          <span>{t.guest.total}:</span>
                          <span className="text-primary">
                            {currentGuestOrder.total.toFixed(2)} €
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setGuestActiveOrderId(null)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-secondary/70 py-2.5 text-xs font-medium transition hover:bg-secondary hover:text-foreground"
                      >
                        <Plus className="size-3.5" />
                        {t.guest.newOrder}
                      </button>
                    </div>
                  ) : (
                    /* Menu Browsing & Cart View */
                    <>
                      {/* Category Pills */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                        {(["all", "starters", "mains", "drinks", "desserts"] as const).map(
                          (cat) => (
                            <button
                              key={cat}
                              onClick={() => setCategoryFilter(cat)}
                              className={`rounded-lg px-2.5 py-1 font-medium transition whitespace-nowrap ${
                                categoryFilter === cat
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary/70 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {t.guest.categories[cat]}
                            </button>
                          ),
                        )}
                      </div>

                      {/* Dishes List */}
                      <div className="space-y-2.5">
                        {menuItems
                          .filter(
                            (item) => categoryFilter === "all" || item.category === categoryFilter,
                          )
                          .map((item) => {
                            const inCart = cart.find((i) => i.id === item.id);

                            return (
                              <div
                                key={item.id}
                                className={`rounded-xl border border-border/60 bg-card/40 p-3 transition ${
                                  !item.available
                                    ? "opacity-60 grayscale-[0.5]"
                                    : "hover:border-primary/30"
                                }`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h5 className="text-xs font-semibold">{item.name}</h5>
                                    <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                                      {item.description}
                                    </p>
                                  </div>
                                  <span className="text-xs font-bold text-primary shrink-0">
                                    {item.price.toFixed(2)} €
                                  </span>
                                </div>

                                <div className="mt-3 flex items-center justify-between pt-1 border-t border-border/40">
                                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                                    {t.guest.categories[item.category]}
                                  </span>

                                  {!item.available ? (
                                    <span className="text-[10px] font-bold text-red-500">
                                      {t.guest.soldOut}
                                    </span>
                                  ) : inCart ? (
                                    <div className="flex items-center gap-2 bg-secondary/80 rounded-lg p-1">
                                      <button
                                        onClick={() => handleUpdateQuantity(item.id, -1)}
                                        className="grid size-5 place-items-center rounded bg-background text-muted-foreground hover:text-foreground"
                                      >
                                        <Minus className="size-3" />
                                      </button>
                                      <span className="text-xs font-bold px-1">
                                        {inCart.quantity}
                                      </span>
                                      <button
                                        onClick={() => handleUpdateQuantity(item.id, 1)}
                                        className="grid size-5 place-items-center rounded bg-background text-muted-foreground hover:text-foreground"
                                      >
                                        <Plus className="size-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleAddToCart(item)}
                                      className="inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
                                    >
                                      <Plus className="size-3" />
                                      {t.guest.addToCart}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Observations / Notes Input */}
                      {cart.length > 0 && (
                        <div className="pt-2">
                          <label className="text-[10px] font-medium text-muted-foreground block mb-1">
                            {t.guest.notesPlaceholder}
                          </label>
                          <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="..."
                            className="w-full rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-xs outline-none focus:border-primary/50"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Sticky Bottom Cart Bar */}
                {!currentGuestOrder && (
                  <div className="border-t border-border/60 bg-card/95 p-3.5 backdrop-blur">
                    {cart.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {cartCount}{" "}
                            {cartCount === 1
                              ? t.guest.itemSelectedSingular
                              : t.guest.itemSelectedPlural}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {t.guest.total}: {cartSubtotal.toFixed(2)} €
                          </span>
                        </div>

                        <button
                          onClick={handleSendOrder}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90"
                        >
                          <ShoppingBag className="size-4" />
                          {t.guest.sendOrder}
                        </button>
                      </div>
                    ) : (
                      <p className="text-center text-[11px] text-muted-foreground py-1">
                        {t.guest.cartEmpty}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RIGHT PANE (MODULAR PRESENTATION OF THE OTHER 5 TABS)                     */}
        {/* ========================================================================= */}
        <div className="w-full space-y-6">
          {/* Sub-navigation inside right pane for Desktop Split View */}
          {splitView && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-border/60 scrollbar-none">
              {(["overview", "bookings", "tables", "kitchen", "menu"] as ModuleKey[]).map((key) => {
                const icons: Record<ModuleKey, LucideIcon> = {
                  overview: LayoutDashboard,
                  bookings: CalendarDays,
                  tables: LayoutGrid,
                  kitchen: ChefHat,
                  menu: MenuSquare,
                  guest: Smartphone,
                };
                const Icon = icons[key];
                const isSelected = rightPanelTab === key;
                const titleMap: Record<ModuleKey, string> = {
                  overview: t.tabOverview,
                  bookings: t.tabBookings,
                  tables: t.tabTables,
                  kitchen: t.tabKitchen,
                  menu: t.tabMenu,
                  guest: t.tabGuest,
                };

                return (
                  <button
                    key={key}
                    onClick={() => handleTabChange(key)}
                    className={`flex items-center shrink-0 gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? "bg-secondary text-foreground border border-border"
                        : "text-muted-foreground hover:bg-card hover:text-foreground border border-transparent"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {titleMap[key]}
                  </button>
                );
              })}
            </div>
          )}

          {/* 1. VISÃO GERAL (OVERVIEW PANEL) */}
          {(leftTab === "overview" || rightTab === "overview") && (
            <div className="space-y-6 animate-fade-in animation-duration-300">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <LayoutDashboard className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{t.overview.title}</h3>
                  <p className="text-xs text-muted-foreground">{t.overview.subtitle}</p>
                </div>
              </div>

              {/* Panel Top Stats Header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-border/70 bg-card/40 p-4 transition hover:bg-card">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    {t.overview.shiftRevenue}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-400">
                    {shiftRevenue.toFixed(2)} €
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/40 p-4 transition hover:bg-card">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    {t.overview.activeTables}
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {activeTablesCount}{" "}
                    <span className="text-sm font-medium text-muted-foreground">
                      / {computedTables.length}
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/40 p-4 transition hover:bg-card">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    {t.overview.activeOrders}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-primary">{activeOrdersCount}</p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/40 p-4 transition hover:bg-card">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    {t.overview.todayBookings}
                  </p>
                  <p className="mt-2 text-2xl font-bold">{bookings.length}</p>
                </div>
              </div>

              {/* Live Activity Feed in Overview */}
              <div className="rounded-3xl border border-border/70 bg-card/40 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <ActivityDot />
                    <h4 className="text-sm font-semibold">{t.overview.recentActivity}</h4>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {t.overview.realtimeBadge}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {orders.slice(0, 3).map((ord) => (
                    <div
                      key={ord.id}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {ord.table}
                        </span>
                        <span>
                          {t.overview.orderPrefix}{" "}
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                        </span>
                      </div>
                      <span className="font-bold text-primary">{ord.total.toFixed(2)} €</span>
                    </div>
                  ))}
                  {bookings.slice(0, 2).map((bk) => (
                    <div
                      key={bk.id}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          {bk.time}
                        </span>
                        <span>
                          {t.overview.bookingPrefix} {bk.name} ({bk.guests} {t.overview.paxLabel})
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {bk.table}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Alert Notifications */}
              {alerts.length > 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                    <BellRing className="size-4 animate-bounce" />
                    {t.panel.alertsTitle} ({alerts.length})
                  </div>

                  <div className="space-y-2">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-background/80 p-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-primary">{alert.table}</span>
                          <span>
                            {alert.type === "waiter"
                              ? t.guest.callWaiterSuccess
                              : t.guest.requestBillSuccess}
                          </span>
                          <span className="hidden sm:inline text-[10px] text-muted-foreground">
                            ({alert.time})
                          </span>
                        </div>

                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="rounded-lg bg-amber-500/20 px-3 py-1 text-[11px] font-semibold text-amber-400 hover:bg-amber-500/30 transition shadow-sm"
                        >
                          {t.panel.dismissAlert}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. RESERVAS E AGENDA (BOOKINGS) */}
          {(leftTab === "bookings" || rightTab === "bookings") && (
            <div className="space-y-6 animate-fade-in animation-duration-300">
              <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <CalendarDays className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{t.bookings.title}</h3>
                  <p className="text-xs text-muted-foreground">{t.bookings.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-6">
                {/* Left: New Reservation Form */}
                <div className="rounded-3xl border border-border/70 bg-card/40 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold">{t.bookings.formTitle}</h3>
                  </div>

                  <form onSubmit={handleCreateBooking} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-muted-foreground mb-1 font-medium">
                        {t.bookings.name} *
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingForm.name}
                        onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                        placeholder="..."
                        className="w-full rounded-xl border border-border/70 bg-background/50 px-3 py-2 outline-none focus:border-primary/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-muted-foreground mb-1 font-medium">
                          {t.bookings.date}
                        </label>
                        <input
                          type="date"
                          value={bookingForm.date}
                          onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                          className="w-full rounded-xl border border-border/70 bg-background/50 px-3 py-2 outline-none focus:border-primary/50"
                        />
                      </div>

                      <div>
                        <label className="block text-muted-foreground mb-1 font-medium">
                          {t.bookings.time}
                        </label>
                        <input
                          type="time"
                          value={bookingForm.time}
                          onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                          className="w-full rounded-xl border border-border/70 bg-background/50 px-3 py-2 outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-muted-foreground mb-1 font-medium">
                          {t.bookings.guests}
                        </label>
                        <select
                          value={bookingForm.guests}
                          onChange={(e) =>
                            setBookingForm({ ...bookingForm, guests: Number(e.target.value) })
                          }
                          className="w-full rounded-xl border border-border/70 bg-background/50 px-3 py-2 outline-none focus:border-primary/50"
                        >
                          {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                            <option key={num} value={num}>
                              {num} {t.bookings.paxSuffix}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-muted-foreground mb-1 font-medium">
                          {t.bookings.type}
                        </label>
                        <select
                          value={bookingForm.type}
                          onChange={(e) =>
                            setBookingForm({
                              ...bookingForm,
                              type: e.target.value as "online" | "phone",
                            })
                          }
                          className="w-full rounded-xl border border-border/70 bg-background/50 px-3 py-2 outline-none focus:border-primary/50"
                        >
                          <option value="online">{t.bookings.typeOnline}</option>
                          <option value="phone">{t.bookings.typePhone}</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 pt-[10px] text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:opacity-90"
                    >
                      <CalendarCheck className="size-3.5" />
                      {t.bookings.submit}
                    </button>

                    <button
                      type="button"
                      onClick={handleAddQuickPhoneBooking}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/30 py-2 pt-[10px] text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground mt-2"
                    >
                      <Phone className="size-3 text-amber-400" />
                      {t.bookings.quickPhone}
                    </button>
                  </form>
                </div>

                {/* Right: Real-time Schedule Calendar Timeline */}
                <div className="rounded-3xl border border-border/70 bg-card/40 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-primary" />
                      <h3 className="text-sm font-semibold">{t.bookings.scheduleTitle}</h3>
                    </div>
                    <span className="text-[10px] text-muted-foreground rounded-full bg-secondary px-2 py-0.5 font-bold">
                      {bookings.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 p-3 shadow-sm transition hover:border-primary/30 hover:bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 place-items-center rounded-xl bg-secondary text-xs font-bold text-primary">
                            {booking.time}
                          </span>
                          <div>
                            <p className="font-semibold text-sm">{booking.name}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Users className="size-3 text-muted-foreground" />
                                {booking.guests} {t.bookings.paxSuffix}
                              </span>
                              <span>·</span>
                              <span className="font-medium">{booking.table}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold border whitespace-nowrap ${
                              booking.type === "online"
                                ? "bg-primary/10 text-primary border-primary/25"
                                : "bg-amber-400/10 text-amber-400 border-amber-400/25"
                            }`}
                          >
                            {booking.type === "online"
                              ? t.bookings.typeOnline
                              : t.bookings.typePhone}
                          </span>
                        </div>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <p className="text-xs text-muted-foreground pt-4 text-center">
                        {t.bookings.noBookings}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. SALA E MESAS (TABLES & FLOOR) */}
          {(leftTab === "tables" || rightTab === "tables") && (
            <div className="space-y-6 animate-fade-in animation-duration-300">
              <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <LayoutGrid className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{t.tables.title}</h3>
                  <p className="text-xs text-muted-foreground">{t.tables.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px] font-semibold tracking-wider uppercase mb-2">
                <span className="rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 px-2 py-1 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400" /> {t.tables.statusFree}
                </span>
                <span className="rounded border border-primary/20 bg-primary/10 text-primary px-2 py-1 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-primary" /> {t.tables.statusOccupied}
                </span>
                <span className="rounded border border-amber-500/20 bg-amber-500/10 text-amber-400 px-2 py-1 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-amber-400" /> {t.tables.statusBill}
                </span>
                <span className="rounded border border-purple-500/20 bg-purple-500/10 text-purple-400 px-2 py-1 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-purple-400" /> {t.tables.statusReserved}
                </span>
              </div>

              {/* Table grid group by zone */}
              {["main", "terrace"].map((zone) => (
                <div key={zone} className="space-y-3">
                  <h4 className="text-xs text-muted-foreground font-semibold uppercase tracking-wider pl-1">
                    {zone === "main" ? t.tables.zoneMain : t.tables.zoneTerrace}
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {computedTables
                      .filter((tbl) => tbl.zone === zone)
                      .map((tbl) => {
                        const isSelected = selectedTableId === tbl.id;
                        return (
                          <button
                            key={tbl.id}
                            onClick={() => setSelectedTableId(tbl.id)}
                            className={`rounded-2xl border p-3 flex flex-col justify-between h-[84px] transition ${
                              isSelected
                                ? "ring-2 ring-primary border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-105 z-10"
                                : tbl.computedStatus === "occupied"
                                  ? "border-primary/40 bg-primary/[0.06] hover:bg-primary/10 hover:border-primary/60"
                                  : tbl.computedStatus === "bill"
                                    ? "border-amber-400/40 bg-amber-400/[0.06] hover:bg-amber-400/10 hover:border-amber-400/60"
                                    : tbl.computedStatus === "reserved"
                                      ? "border-purple-400/30 bg-purple-400/[0.04] hover:bg-purple-400/10"
                                      : "border-border/60 bg-card/40 hover:border-primary/30"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-bold text-sm">{tbl.name.split(" ")[1]}</span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Users className="size-2.5" />
                                {tbl.pax}
                                {t.tables.paxSuffix}
                              </span>
                            </div>

                            <div className="w-full text-left">
                              <span
                                className={`text-[10px] font-bold block truncate ${
                                  tbl.computedStatus === "occupied"
                                    ? "text-primary"
                                    : tbl.computedStatus === "bill"
                                      ? "text-amber-400"
                                      : tbl.computedStatus === "reserved"
                                        ? "text-purple-400"
                                        : "text-emerald-400"
                                }`}
                              >
                                {tbl.computedStatus === "occupied"
                                  ? `${tbl.activeOrder?.total.toFixed(2)} €`
                                  : tbl.computedStatus === "bill"
                                    ? t.tables.statusBill
                                    : tbl.computedStatus === "reserved"
                                      ? t.tables.statusReserved
                                      : t.tables.statusFree}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}

              {/* Selected table details preview box */}
              {selectedTableId && (
                <div className="rounded-2xl border border-primary/20 bg-card/60 p-4 mt-6 flex items-start gap-4">
                  {(() => {
                    const sel = computedTables.find((t) => t.id === selectedTableId);
                    if (!sel) return null;

                    return (
                      <>
                        <div
                          className={`grid size-14 place-items-center rounded-2xl shrink-0 font-bold text-xl ${
                            sel.computedStatus === "occupied"
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : sel.computedStatus === "bill"
                                ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                                : sel.computedStatus === "reserved"
                                  ? "bg-purple-400/20 text-purple-400 border border-purple-400/30"
                                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {sel.name.split(" ")[1]}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {t.tables.tableLabel} {sel.name.split(" ")[1]}
                          </h4>

                          {sel.activeOrder ? (
                            <div className="text-xs pt-1.5 space-y-1">
                              <p className="text-muted-foreground tracking-wide font-medium">
                                #{sel.activeOrder.id} · {t.tables.orderTotal}:{" "}
                                <strong className="text-primary">
                                  {sel.activeOrder.total.toFixed(2)} €
                                </strong>
                              </p>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                                {sel.activeOrder.items.map((it) => (
                                  <span key={it.id} className="text-[11px] text-muted-foreground">
                                    {it.quantity}x {it.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : sel.reservedBookingId ? (
                            <div className="text-xs pt-1.5">
                              <p className="text-purple-400 font-medium">
                                {t.tables.scheduledBookingLabel}{" "}
                                {bookings.find((b) => b.id === sel.reservedBookingId)?.time}
                              </p>
                              <p className="text-muted-foreground mt-0.5">
                                {bookings.find((b) => b.id === sel.reservedBookingId)?.name} (
                                {bookings.find((b) => b.id === sel.reservedBookingId)?.guests}{" "}
                                {t.tables.paxSuffix})
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground pt-1">
                              {t.tables.noActiveOrder}
                            </p>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* 4. PEDIDOS E COZINHA (KITCHEN & PANEL) */}
          {(leftTab === "kitchen" || rightTab === "kitchen") && (
            <div className="space-y-6 animate-fade-in animation-duration-300">
              <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <ChefHat className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{t.panel.title}</h3>
                  <p className="text-xs text-muted-foreground">{t.panel.subtitleKds}</p>
                </div>
              </div>

              {/* Orders Workflow Columns (Kanban) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Column 1: Novos / Recebidos */}
                <div className="rounded-2xl border border-border/70 bg-card/30 p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-primary animate-pulse" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider">
                        {t.panel.statusNew}
                      </h4>
                    </div>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {orders.filter((o) => o.status === "new").length}
                    </span>
                  </div>

                  <div className="mt-3 space-y-3 flex-1">
                    {orders.filter((o) => o.status === "new").length === 0 ? (
                      <p className="text-xs text-muted-foreground py-6 text-center">
                        {t.panel.noOrders}
                      </p>
                    ) : (
                      orders
                        .filter((o) => o.status === "new")
                        .map((order) => (
                          <div
                            key={order.id}
                            className="rounded-xl border border-primary/30 bg-primary/[0.04] p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-foreground">
                                {order.table}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {order.time}
                              </span>
                            </div>

                            <div className="text-xs space-y-1">
                              {order.items.map((i) => (
                                <div
                                  key={i.id}
                                  className="flex justify-between text-muted-foreground"
                                >
                                  <span>
                                    {i.quantity}x {i.name}
                                  </span>
                                  <span className="font-medium">
                                    {(i.price * i.quantity).toFixed(2)} €
                                  </span>
                                </div>
                              ))}
                              {order.notes && (
                                <p className="text-[10px] italic text-amber-400 pt-1">
                                  Obs: &ldquo;{order.notes}&rdquo;
                                </p>
                              )}
                            </div>

                            <div className="border-t border-border/40 pt-2 flex items-center justify-between">
                              <span className="text-xs font-bold text-primary">
                                {order.total.toFixed(2)} €
                              </span>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "prep")}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground hover:opacity-90 transition shadow-md shadow-primary/20"
                              >
                                <ChefHat className="size-3" />
                                {t.panel.startPrep}
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Column 2: Em Preparação */}
                <div className="rounded-2xl border border-border/70 bg-card/30 p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-amber-400" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider">
                        {t.panel.statusPrep}
                      </h4>
                    </div>
                    <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                      {orders.filter((o) => o.status === "prep").length}
                    </span>
                  </div>

                  <div className="mt-3 space-y-3 flex-1">
                    {orders.filter((o) => o.status === "prep").length === 0 ? (
                      <p className="text-xs text-muted-foreground py-6 text-center">
                        {t.panel.noOrders}
                      </p>
                    ) : (
                      orders
                        .filter((o) => o.status === "prep")
                        .map((order) => (
                          <div
                            key={order.id}
                            className="rounded-xl border border-amber-400/30 bg-card/60 p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-foreground">
                                {order.table}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {order.time}
                              </span>
                            </div>

                            <div className="text-[11px] space-y-1 text-muted-foreground">
                              {order.items.map((i) => (
                                <div key={i.id} className="flex justify-between">
                                  <span>
                                    {i.quantity}x {i.name}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="border-t border-border/40 pt-2 flex justify-end">
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "ready")}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-semibold text-white hover:opacity-90 transition shadow-md"
                              >
                                <Check className="size-3" />
                                {t.panel.markReady}
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Column 3: Prontos a Servir */}
                <div className="rounded-2xl border border-border/70 bg-card/30 p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-emerald-400" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider">
                        {t.panel.statusReady}
                      </h4>
                    </div>
                    <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      {orders.filter((o) => o.status === "ready").length}
                    </span>
                  </div>

                  <div className="mt-3 space-y-3 flex-1">
                    {orders.filter((o) => o.status === "ready").length === 0 ? (
                      <p className="text-xs text-muted-foreground py-6 text-center">
                        {t.panel.noOrders}
                      </p>
                    ) : (
                      orders
                        .filter((o) => o.status === "ready")
                        .map((order) => (
                          <div
                            key={order.id}
                            className="rounded-xl border border-emerald-500/30 bg-card/60 p-3 space-y-2 relative overflow-hidden"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400" />
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-foreground pl-1.5">
                                {order.table}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {order.time}
                              </span>
                            </div>

                            <div className="border-t border-border/40 pt-2 flex justify-end">
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "delivered")}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary border border-border px-3 py-1.5 text-[10px] font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition"
                              >
                                <CheckCircle2 className="size-3" />
                                {t.panel.markDelivered}
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. MENU DIGITAL (CATALOG & AVAILABILITY) */}
          {(leftTab === "menu" || rightTab === "menu") && (
            <div className="space-y-6 animate-fade-in animation-duration-300">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <MenuSquare className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{t.menu.title}</h3>
                    <p className="text-xs text-muted-foreground">{t.menu.subtitle}</p>
                  </div>
                </div>

                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground border border-border/60">
                  {menuItems.length} {t.menu.itemsCount}
                </span>
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
                <button
                  onClick={() => setCatalogCategoryFilter("all")}
                  className={`rounded-lg px-3 py-1.5 font-medium transition whitespace-nowrap ${
                    catalogCategoryFilter === "all"
                      ? "bg-secondary text-foreground border border-border/60"
                      : "bg-card/40 text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  {t.menu.filterAll}
                </button>
                {(["starters", "mains", "drinks", "desserts"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCatalogCategoryFilter(cat)}
                    className={`rounded-lg px-3 py-1.5 font-medium transition whitespace-nowrap ${
                      catalogCategoryFilter === cat
                        ? "bg-secondary text-foreground border border-border/60"
                        : "bg-card/40 text-muted-foreground hover:text-foreground border border-transparent"
                    }`}
                  >
                    {t.guest.categories[cat]}
                  </button>
                ))}
              </div>

              {/* Dishes Catalog List */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {menuItems
                  .filter(
                    (item) =>
                      catalogCategoryFilter === "all" || item.category === catalogCategoryFilter,
                  )
                  .map((item) => {
                    return (
                      <div
                        key={item.id}
                        className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                          !item.available
                            ? "border-red-500/30 bg-red-500/[0.03] opacity-80"
                            : "border-border/60 bg-card/60 hover:border-primary/30"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h5 className="font-semibold text-sm leading-tight text-foreground">
                              {item.name}
                            </h5>
                            <span className="font-bold text-primary shrink-0">
                              {item.price.toFixed(2)} €
                            </span>
                          </div>

                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40">
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                            {t.guest.categories[item.category]}
                          </span>

                          <button
                            onClick={() => handleToggleAvailability(item.id)}
                            className={`rounded-lg px-3 py-1.5 text-[10px] font-bold transition shadow-sm ${
                              !item.available
                                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30"
                                : "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/30"
                            }`}
                          >
                            {!item.available ? t.menu.toggleAvailable : t.menu.toggleSoldOut}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </SiteChrome>
  );
}

function ActivityDot() {
  return <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />;
}
