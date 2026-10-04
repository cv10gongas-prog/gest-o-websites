import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  BookOpenCheck,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  ExternalLink,
  Laptop,
  LayoutDashboard,
  LayoutGrid,
  MenuSquare,
  Minus,
  MonitorCheck,
  Plus,
  QrCode,
  Receipt,
  RotateCcw,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Users,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Chip } from "@/components/crm/Bits";
import { NovaRestauranteLogo } from "@/components/site/NovaRestauranteLogo";
import { SiteChrome } from "@/components/site/SiteChrome";
import { dict, PATHS, type Locale } from "@/lib/i18n";

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.unobserve(node);
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

type ModuleKey = "overview" | "bookings" | "tables" | "kitchen" | "menu" | "guest";

export function RestaurantesPage({ locale }: { locale: Locale }) {
  const t = dict[locale].restaurantes;
  const paths = PATHS[locale];

  // Interactive Product Showcase State
  const [activeModule, setActiveModule] = useState<ModuleKey>("overview");
  const [mockSoldOutIds, setMockSoldOutIds] = useState<string[]>(["item-3"]);
  const [mockSelectedTable, setMockSelectedTable] = useState<number>(4);
  const [mockGuestCartCount, setMockGuestCartCount] = useState<number>(2);

  function toggleMockSoldOut(itemId: string) {
    setMockSoldOutIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  }

  const MODULE_ICONS: Record<ModuleKey, typeof LayoutDashboard> = {
    overview: LayoutDashboard,
    bookings: CalendarDays,
    tables: LayoutGrid,
    kitchen: ChefHat,
    menu: MenuSquare,
    guest: Smartphone,
  };

  return (
    <SiteChrome locale={locale} page="restaurantes">
      <style>{`
        @keyframes nws-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes nws-pulse {
          0%, 100% { opacity: .5; transform: scale(1); }
          50% { opacity: .85; transform: scale(1.04); }
        }

        .nws-float {
          animation: nws-float 6s ease-in-out infinite;
        }

        .nws-pulse {
          animation: nws-pulse 5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .nws-float,
          .nws-pulse {
            animation: none !important;
          }
        }
      `}</style>

      {/* 1. HERO */}
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/20 px-5 py-9 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="nws-pulse absolute -right-24 -top-24 size-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 size-72 rounded-full bg-primary/5 blur-3xl" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div className="min-w-0">
            <Reveal>
              <Chip tone="primary">
                <span className="flex items-center gap-1.5">
                  <UtensilsCrossed className="size-3.5" />
                  {t.heroChip}
                </span>
              </Chip>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">
                <Sparkles className="size-3.5 shrink-0 text-primary" />
                {t.heroTagline}
              </div>
            </Reveal>

            <Reveal delay={150}>
              <h1 className="orbit-gradient-text mt-4 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.75rem]">
                {t.heroTitle}
              </h1>
            </Reveal>

            <Reveal delay={220}>
              <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                {t.heroSubtitle}
              </p>
            </Reveal>

            <Reveal delay={290}>
              <div className="mt-8 flex flex-wrap gap-3">

                <Link
                  to={paths.contact}
                  search={{ tipo: "restaurantes" }}
                  className="group inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-background/60 px-6 text-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-accent"
                >
                  <CalendarCheck className="size-4" />
                  {t.heroCtaProposal}
                </Link>
              </div>
            </Reveal>

            <Reveal delay={360}>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                {t.heroBadges.map((badge, bIdx) => (
                  <span key={bIdx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-primary" />
                    {badge}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* HERO VISUAL MOCKUPS (MOBILE + DESKTOP) */}
          <Reveal delay={180}>
            <div className="nws-float relative min-w-0">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/10 blur-3xl" />

              {/* Composition: Tablet/Desktop Manager Screen + Floating Mobile Phone */}
              <div className="relative">
                {/* 1. Desktop Management Screen Preview */}
                <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-background shadow-2xl shadow-black/40">
                  <div className="flex h-9 items-center justify-between border-b border-border/60 bg-card/80 px-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-red-400/60" />
                      <span className="size-2 rounded-full bg-amber-400/60" />
                      <span className="size-2 rounded-full bg-emerald-400/60" />
                    </div>
                    <div className="flex items-center gap-2">
                      <NovaRestauranteLogo size="sm" showTagline={false} />
                    </div>
                    <div className="text-[9px] font-medium text-emerald-400 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {t.heroMockup.live}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 bg-gradient-to-b from-card/30 to-background">
                    {/* Top Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl border border-border/60 bg-background/70 p-2.5">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                          {t.heroMockup.activeTables}
                        </p>
                        <p className="mt-1 text-base font-semibold">8 / 12</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-background/70 p-2.5">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                          {t.heroMockup.todayOrders}
                        </p>
                        <p className="mt-1 text-base font-semibold text-primary">34</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-background/70 p-2.5">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                          {t.heroMockup.bookings}
                        </p>
                        <p className="mt-1 text-base font-semibold">{t.heroMockup.bookingsValue}</p>
                      </div>
                    </div>

                    {/* Active Orders List */}
                    <div className="mt-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground px-1">
                        <span>{t.heroMockup.recentOrdersTitle}</span>
                        <span>{t.heroMockup.timeTitle}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-primary/25 bg-primary/[0.04] p-2.5 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-7 place-items-center rounded-lg bg-primary/15 font-semibold text-primary text-[11px]">
                            M4
                          </span>
                          <div>
                            <p className="font-medium text-[11px]">{t.heroMockup.item1Name}</p>
                            <p className="text-[9px] text-muted-foreground">
                              {t.heroMockup.item1Desc}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[9px] font-medium text-amber-400">
                          {t.heroMockup.item1Status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-2.5 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-7 place-items-center rounded-lg bg-secondary font-semibold text-[11px]">
                            M2
                          </span>
                          <div>
                            <p className="font-medium text-[11px]">{t.heroMockup.item2Name}</p>
                            <p className="text-[9px] text-muted-foreground">
                              {t.heroMockup.item2Desc}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[9px] font-medium text-primary">
                          {t.heroMockup.item2Status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Floating Mobile Smartphone Mockup */}
                <div className="absolute -bottom-8 -right-3 sm:-right-6 w-[200px] sm:w-[230px] rounded-[2rem] border-2 border-primary/30 bg-[#07111c] p-2.5 shadow-2xl shadow-black/80 backdrop-blur-xl">
                  <div className="relative overflow-hidden rounded-[1.4rem] border border-border/60 bg-background p-3">
                    {/* Phone Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/40">
                      <NovaRestauranteLogo size="sm" showTagline={false} />
                      <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[8px] font-bold text-primary">
                        M04
                      </span>
                    </div>

                    {/* Mini Menu Category & Dish */}
                    <div className="mt-2.5 space-y-2">
                      <div className="flex gap-1 overflow-x-hidden text-[8px]">
                        <span className="rounded-md bg-primary px-2 py-0.5 font-medium text-primary-foreground">
                          {t.heroMockup.menuDishes}
                        </span>
                        <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-muted-foreground">
                          {t.heroMockup.menuDrinks}
                        </span>
                        <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-muted-foreground">
                          {t.heroMockup.menuDesserts}
                        </span>
                      </div>

                      <div className="rounded-lg border border-border/50 bg-card/60 p-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[10px] font-medium leading-tight">
                              {t.heroMockup.dishName}
                            </p>
                            <p className="text-[8px] text-muted-foreground">
                              {t.heroMockup.dishDesc}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold text-primary">
                            {t.heroMockup.dishPrice}
                          </span>
                        </div>
                        <div className="mt-1.5 flex justify-end">
                          <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[8px] font-medium text-primary">
                            {t.heroMockup.addBtn}
                          </span>
                        </div>
                      </div>

                      {/* Quick Action Button */}
                      <div className="flex gap-1.5 pt-1">
                        <button className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-border/60 bg-secondary/50 py-1 text-[8px] text-muted-foreground">
                          <BellRing className="size-2.5 text-amber-400" />
                          {t.heroMockup.callBtn}
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-border/60 bg-secondary/50 py-1 text-[8px] text-muted-foreground">
                          <Receipt className="size-2.5 text-primary" />
                          {t.heroMockup.billBtn}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. APRESENTAÇÃO MODULAR INTERATIVA DO PRODUTO                             */}
      {/* ========================================================================= */}
      <section className="mt-28">
        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <Chip tone="primary">{t.modulesChip}</Chip>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                {t.modulesTitle}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{t.modulesLead}</p>
            </div>
          </div>
        </Reveal>

        {/* 6 Tabs Navigation Bar */}
        <Reveal delay={80}>
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {(["overview", "bookings", "tables", "kitchen", "menu", "guest"] as ModuleKey[]).map(
              (key) => {
                const Icon = MODULE_ICONS[key];
                const isSelected = activeModule === key;

                return (
                  <button
                    key={key}
                    onClick={() => setActiveModule(key)}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-xs font-medium transition ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "border border-border/70 bg-card/40 text-muted-foreground hover:border-primary/30 hover:bg-card hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{t.moduleTabs[key]}</span>
                  </button>
                );
              },
            )}
          </div>
        </Reveal>

        {/* Central Product Showcase Display Window */}
        <Reveal delay={140}>
          <div className="mt-4 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card/80 via-card/40 to-primary/[0.03] shadow-2xl shadow-black/20">
            {/* Top Chrome Bar */}
            <div className="flex h-11 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-400/70" />
                  <span className="size-2.5 rounded-full bg-amber-400/70" />
                  <span className="size-2.5 rounded-full bg-emerald-400/70" />
                </div>
                <span className="hidden text-xs text-muted-foreground/60 sm:inline">|</span>
                <NovaRestauranteLogo size="sm" showTagline={false} />
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {t.moduleTabs[activeModule]}
                </span>
                <span className="hidden text-[10px] text-muted-foreground md:inline">
                  {t.modulesDemoLabel}
                </span>
              </div>
            </div>

            {/* Showcase Grid: Left Interface View, Right Explanation & Actions */}
            <div className="grid lg:grid-cols-[1.3fr_1fr] gap-0">
              {/* LEFT: Illustrative Interactive Interface Simulator */}
              <div className="border-b border-border/60 p-5 sm:p-7 lg:border-b-0 lg:border-r bg-background/50">
                {/* 1. VISÃO GERAL (OVERVIEW) */}
                {activeModule === "overview" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-primary">
                          {t.modulesShowcase.overview.shiftTitle}
                        </p>
                        <h4 className="text-sm font-semibold">
                          {t.modulesShowcase.overview.shiftStatus}
                        </h4>
                      </div>
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {t.modulesShowcase.overview.shiftStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="rounded-xl border border-border/60 bg-card/60 p-3">
                        <p className="text-[9px] uppercase font-semibold text-muted-foreground">
                          {t.modulesShowcase.overview.revenueLabel}
                        </p>
                        <p className="mt-1 text-base font-bold text-emerald-400">432,50 €</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-card/60 p-3">
                        <p className="text-[9px] uppercase font-semibold text-muted-foreground">
                          {t.modulesShowcase.overview.tablesLabel}
                        </p>
                        <p className="mt-1 text-base font-bold text-foreground">7 / 12</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-card/60 p-3">
                        <p className="text-[9px] uppercase font-semibold text-muted-foreground">
                          {t.modulesShowcase.overview.ordersLabel}
                        </p>
                        <p className="mt-1 text-base font-bold text-primary">4</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-card/60 p-3">
                        <p className="text-[9px] uppercase font-semibold text-muted-foreground">
                          {t.modulesShowcase.overview.bookingsLabel}
                        </p>
                        <p className="mt-1 text-base font-bold text-foreground">6</p>
                      </div>
                    </div>

                    {/* Live Stream Events */}
                    <div className="rounded-2xl border border-border/60 bg-card/40 p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="flex items-center gap-1.5">
                          <ActivityDot />
                          {t.modulesShowcase.overview.liveFeedTitle}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {t.modulesShowcase.overview.liveFeedTime}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/[0.04] p-2.5">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                              M04
                            </span>
                            <span className="text-[11px]">{t.modulesShowcase.overview.event1}</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground">
                            {t.modulesShowcase.overview.event1Time}
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-2.5">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                              M02
                            </span>
                            <span className="text-[11px]">{t.modulesShowcase.overview.event2}</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground">
                            {t.modulesShowcase.overview.event2Time}
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-2.5">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
                              RES
                            </span>
                            <span className="text-[11px]">{t.modulesShowcase.overview.event3}</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground">
                            {t.modulesShowcase.overview.event3Time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. RESERVAS (BOOKINGS) */}
                {activeModule === "bookings" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-primary">
                          {t.modulesShowcase.bookings.scheduleTitle}
                        </p>
                        <h4 className="text-sm font-semibold">
                          {t.modulesShowcase.bookings.scheduleDate}
                        </h4>
                      </div>
                      <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        {t.modulesShowcase.bookings.confirmedBadge}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {t.modulesShowcase.bookings.list.map((b, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-border/60 bg-card/60 p-3 transition hover:border-primary/30"
                        >
                          <div className="flex items-center gap-3">
                            <span className="grid size-8 place-items-center rounded-lg bg-primary/15 font-bold text-primary text-xs">
                              {b.time}
                            </span>
                            <div>
                              <p className="font-semibold text-foreground text-xs">{b.name}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                  <Users className="size-3" /> {b.pax}{" "}
                                  {t.modulesShowcase.bookings.paxLabel}
                                </span>
                                <span>·</span>
                                <span className="text-primary font-medium">{b.table}</span>
                              </p>
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                              b.type === "online"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-amber-400/10 text-amber-400 border-amber-400/20"
                            }`}
                          >
                            {b.type === "online"
                              ? t.modulesShowcase.bookings.onlineBadge
                              : t.modulesShowcase.bookings.phoneBadge}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. SALA E MESAS (TABLES & FLOOR) */}
                {activeModule === "tables" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-primary">
                          {t.modulesShowcase.tables.floorTitle}
                        </p>
                        <h4 className="text-sm font-semibold">
                          {t.modulesShowcase.tables.monitoredBadge}
                        </h4>
                      </div>
                      <div className="flex gap-1.5 text-[9px]">
                        <span className="rounded bg-emerald-500/15 text-emerald-400 px-2 py-0.5 font-semibold">
                          {t.modulesShowcase.tables.legendFree}
                        </span>
                        <span className="rounded bg-primary/20 text-primary px-2 py-0.5 font-semibold">
                          {t.modulesShowcase.tables.legendOccupied}
                        </span>
                        <span className="rounded bg-amber-500/20 text-amber-400 px-2 py-0.5 font-semibold">
                          {t.modulesShowcase.tables.legendBill}
                        </span>
                      </div>
                    </div>

                    {/* Table grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {[
                        { id: 1, name: "M01", pax: 2, status: "free", total: 0 },
                        { id: 2, name: "M02", pax: 4, status: "bill", total: 34.5 },
                        { id: 3, name: "M03", pax: 2, status: "free", total: 0 },
                        { id: 4, name: "M04", pax: 4, status: "occupied", total: 20.0 },
                        { id: 5, name: "M05", pax: 6, status: "free", total: 0 },
                        { id: 6, name: "M06", pax: 4, status: "reserved", total: 0 },
                        { id: 7, name: "M07", pax: 2, status: "occupied", total: 18.0 },
                        { id: 8, name: "M08", pax: 4, status: "reserved", total: 0 },
                        { id: 9, name: "M09", pax: 2, status: "free", total: 0 },
                        { id: 10, name: "M10", pax: 4, status: "free", total: 0 },
                        { id: 11, name: "M11", pax: 6, status: "free", total: 0 },
                        { id: 12, name: "M12", pax: 8, status: "reserved", total: 0 },
                      ].map((tbl) => (
                        <button
                          key={tbl.id}
                          onClick={() => setMockSelectedTable(tbl.id)}
                          className={`rounded-xl border p-2.5 text-left transition flex flex-col justify-between h-20 ${
                            mockSelectedTable === tbl.id
                              ? "ring-2 ring-primary border-primary bg-primary/10"
                              : tbl.status === "occupied"
                                ? "border-primary/40 bg-primary/[0.06]"
                                : tbl.status === "bill"
                                  ? "border-amber-400/40 bg-amber-400/[0.06]"
                                  : tbl.status === "reserved"
                                    ? "border-purple-400/30 bg-purple-400/[0.04]"
                                    : "border-border/60 bg-card/40 hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-xs">{tbl.name}</span>
                            <span className="text-[9px] text-muted-foreground">{tbl.pax}p</span>
                          </div>

                          <div className="w-full">
                            <span
                              className={`text-[8.5px] font-bold block truncate ${
                                tbl.status === "occupied"
                                  ? "text-primary"
                                  : tbl.status === "bill"
                                    ? "text-amber-400"
                                    : tbl.status === "reserved"
                                      ? "text-purple-400"
                                      : "text-emerald-400"
                              }`}
                            >
                              {tbl.status === "occupied"
                                ? `${tbl.total.toFixed(2)} €`
                                : tbl.status === "bill"
                                  ? t.modulesShowcase.tables.statusBill
                                  : tbl.status === "reserved"
                                    ? t.modulesShowcase.tables.statusReserved
                                    : t.modulesShowcase.tables.statusFree}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. PEDIDOS E COZINHA (KITCHEN & ORDERS) */}
                {activeModule === "kitchen" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-primary">
                          {t.modulesShowcase.kitchen.kdsTitle}
                        </p>
                        <h4 className="text-sm font-semibold">
                          {t.modulesShowcase.kitchen.kdsSubtitle}
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-primary">
                        {t.modulesShowcase.kitchen.activeCountBadge}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Ticket 1: New */}
                      <div className="rounded-xl border border-primary/30 bg-primary/[0.04] p-3 space-y-2">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                          <span className="font-bold text-xs text-foreground">
                            {t.modulesShowcase.kitchen.ticket1Table}
                          </span>
                          <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                            {t.modulesShowcase.kitchen.colNew}
                          </span>
                        </div>
                        <div className="text-[11px] space-y-1">
                          {t.modulesShowcase.kitchen.ticket1Items.map((it, idx) => (
                            <p key={idx}>{it}</p>
                          ))}
                          <p className="text-[9.5px] italic text-amber-400">
                            {t.modulesShowcase.kitchen.ticket1Obs}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-border/40 flex justify-between items-center text-xs">
                          <span className="font-bold text-primary">20,00 €</span>
                          <span className="rounded-lg bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
                            {t.modulesShowcase.kitchen.ticket1Action}
                          </span>
                        </div>
                      </div>

                      {/* Ticket 2: In Prep */}
                      <div className="rounded-xl border border-amber-400/30 bg-card/60 p-3 space-y-2">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                          <span className="font-bold text-xs text-foreground">
                            {t.modulesShowcase.kitchen.ticket2Table}
                          </span>
                          <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                            {t.modulesShowcase.kitchen.ticket2Status}
                          </span>
                        </div>
                        <div className="text-[11px] space-y-1 text-muted-foreground">
                          {t.modulesShowcase.kitchen.ticket2Items.map((it, idx) => (
                            <p key={idx}>{it}</p>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-border/40 flex justify-between items-center text-xs">
                          <span className="font-bold text-primary">33,00 €</span>
                          <span className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold text-white">
                            {t.modulesShowcase.kitchen.ticket2Action}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. MENU DIGITAL (CATALOG & AVAILABILITY) */}
                {activeModule === "menu" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-primary">
                          {t.modulesShowcase.menu.menuTitle}
                        </p>
                        <h4 className="text-sm font-semibold">
                          {t.modulesShowcase.menu.menuSubtitle}
                        </h4>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {t.modulesShowcase.menu.testHint}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {[
                        {
                          id: "item-1",
                          name: "Pão & Azeitonas Marinadas",
                          cat: t.modulesShowcase.menu.catStarters,
                          price: 3.5,
                        },
                        {
                          id: "item-2",
                          name: "Bacalhau com Broa da Casa",
                          cat: t.modulesShowcase.menu.catMains,
                          price: 16.5,
                        },
                        {
                          id: "item-3",
                          name: "Bife da Vazia com Batata",
                          cat: t.modulesShowcase.menu.catMains,
                          price: 18.0,
                        },
                        {
                          id: "item-4",
                          name: "Mousse de Chocolate 70%",
                          cat: t.modulesShowcase.menu.catDesserts,
                          price: 4.5,
                        },
                      ].map((item) => {
                        const isSoldOut = mockSoldOutIds.includes(item.id);

                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between rounded-xl border p-3 transition ${
                              isSoldOut
                                ? "border-red-500/30 bg-red-500/[0.03] opacity-75"
                                : "border-border/60 bg-card/60"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{item.name}</span>
                                <span className="rounded bg-secondary/80 px-1.5 py-0.5 text-[8.5px] text-muted-foreground">
                                  {item.cat}
                                </span>
                              </div>
                              <p className="text-[10px] text-primary font-bold mt-0.5">
                                {item.price.toFixed(2)} €
                              </p>
                            </div>

                            <button
                              onClick={() => toggleMockSoldOut(item.id)}
                              className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition ${
                                isSoldOut
                                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                  : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                              }`}
                            >
                              {isSoldOut
                                ? t.modulesShowcase.menu.toggleSoldOut
                                : t.modulesShowcase.menu.toggleAvailable}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. CLIENTE QR (GUEST MOBILE VIEW) */}
                {activeModule === "guest" && (
                  <div className="flex justify-center">
                    <div className="w-full max-w-[320px] rounded-[2rem] border-[4px] border-[#101b2b] bg-[#050b14] p-2.5 shadow-xl shadow-black/80">
                      <div className="rounded-[1.4rem] border border-border/60 bg-background p-3.5 space-y-3">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                          <NovaRestauranteLogo size="sm" showTagline={false} />
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary">
                            {t.modulesShowcase.guest.tableLabel}
                          </span>
                        </div>

                        {/* Quick Action buttons */}
                        <div className="flex gap-2">
                          <button className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-border/70 bg-secondary/60 py-1 text-[9px] text-foreground">
                            <BellRing className="size-2.5 text-amber-400" />
                            {t.modulesShowcase.guest.callBtn}
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-border/70 bg-secondary/60 py-1 text-[9px] text-foreground">
                            <Receipt className="size-2.5 text-primary" />
                            {t.modulesShowcase.guest.billBtn}
                          </button>
                        </div>

                        {/* Mini dish card */}
                        <div className="rounded-xl border border-border/60 bg-card/60 p-2.5 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[11px] font-semibold">
                                {t.modulesShowcase.guest.dishName}
                              </p>
                              <p className="text-[9px] text-muted-foreground">
                                {t.modulesShowcase.guest.dishDesc}
                              </p>
                            </div>
                            <span className="text-[11px] font-bold text-primary">
                              {t.modulesShowcase.guest.dishPrice}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-border/40">
                            <span className="text-[8.5px] uppercase text-muted-foreground font-semibold">
                              {t.modulesShowcase.guest.dishCategory}
                            </span>
                            <div className="flex items-center gap-1.5 bg-secondary/80 rounded px-1.5 py-0.5">
                              <button
                                onClick={() => setMockGuestCartCount((c) => Math.max(0, c - 1))}
                                className="size-3.5 grid place-items-center rounded bg-background text-[10px]"
                              >
                                -
                              </button>
                              <span className="text-[10px] font-bold px-1">
                                {mockGuestCartCount}
                              </span>
                              <button
                                onClick={() => setMockGuestCartCount((c) => c + 1)}
                                className="size-3.5 grid place-items-center rounded bg-background text-[10px]"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Order button */}
                        <div className="pt-1">
                          <div className="rounded-xl bg-primary py-2 text-center text-xs font-semibold text-primary-foreground flex items-center justify-center gap-1.5">
                            <ShoppingBag className="size-3.5" />
                            {t.modulesShowcase.guest.sendOrderBtn} ({mockGuestCartCount}{" "}
                            {t.modulesShowcase.guest.itemsCountLabel})
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: Module Description, Key Highlights & Full Demo CTA */}
              <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-primary/15 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                      {t.modulesData[activeModule].badge}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
                    {t.modulesData[activeModule].title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t.modulesData[activeModule].desc}
                  </p>

                  {/* 3 Key Feature Highlights */}
                  <div className="mt-6 space-y-2.5">
                    {t.modulesData[activeModule].highlights.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-muted-foreground"
                      >
                        <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
                        <span className="leading-snug">{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row gap-3">

                  <Link
                    to={paths.contact}
                    search={{ tipo: "restaurantes" }}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-4 text-xs font-medium transition hover:bg-accent"
                  >
                    {t.heroCtaProposal}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 3. PROBLEMA E SOLUÇÃO */}
      <section className="mt-28">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <Reveal>
            <Chip tone="primary">{t.problemChip}</Chip>

            <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {t.problemTitle}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">{t.problemLead}</p>

            <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/[0.04] p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Sparkles className="size-4" />
                {t.problemNoTechTitle}
              </div>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">{t.problemNoTechText}</p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {t.problemList.map((problem, idx) => {
              const icons = [CalendarDays, BookOpenCheck, ChefHat, BellRing];
              const Icon = icons[idx] ?? Sparkles;

              return (
                <Reveal key={problem.title} delay={idx * 90}>
                  <article className="orbit-panel orbit-panel-hover h-full p-5">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </span>

                    <h3 className="mt-4 text-sm font-semibold">{problem.title}</h3>

                    <p className="mt-2 text-xs leading-6 text-muted-foreground">{problem.text}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FUNCIONALIDADES DETALHADAS */}
      <section className="mt-28">
        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <Chip tone="primary">{t.featuresChip}</Chip>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                {t.featuresTitle}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{t.featuresLead}</p>
            </div>
          </div>
        </Reveal>

        {/* Feature Grid with visual variety */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.featureList.map((feat, idx) => {
            const icons = [
              Store,
              MenuSquare,
              QrCode,
              CalendarDays,
              MonitorCheck,
              RotateCcw,
              BellRing,
              LayoutGrid,
            ];
            const Icon = icons[idx] ?? Sparkles;

            return (
              <Reveal key={feat.title} delay={idx * 70}>
                <article className="orbit-panel orbit-panel-hover h-full p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                        <Icon className="size-4 text-primary" />
                      </span>
                      <span className="text-[10px] font-semibold tracking-wider text-muted-foreground/60">
                        0{idx + 1}
                      </span>
                    </div>

                    <h3 className="mt-4 text-sm font-semibold">{feat.title}</h3>

                    <p className="mt-2 text-xs leading-6 text-muted-foreground">{feat.text}</p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 5. COMO FUNCIONA (FLUXO VISUAL) */}
      <section className="mt-28">
        <Reveal>
          <div className="max-w-2xl">
            <Chip tone="primary">{t.processChip}</Chip>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t.howWorksTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{t.howWorksLead}</p>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {t.howWorksFlow.map((step, idx) => {
            const stepIcons = [QrCode, MenuSquare, Smartphone, Laptop, Utensils];
            const StepIcon = stepIcons[idx] ?? CheckCircle2;

            return (
              <Reveal key={idx} delay={idx * 90}>
                <div className="relative h-full rounded-2xl border border-border/70 bg-card/40 p-5 transition hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <StepIcon className="size-4" />
                    </span>
                    <span className="text-2xl font-bold text-primary/15">0{idx + 1}</span>
                  </div>

                  <p className="mt-4 text-xs font-medium leading-relaxed">{step}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Integrated Booking Flow Note */}
        <Reveal delay={200}>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border/60 bg-secondary/30 p-5 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                <CalendarDays className="size-4" />
              </span>
              <div>
                <span className="font-semibold text-foreground">{t.processIntegratedTitle} </span>
                {t.processIntegratedText}
              </div>
            </div>
            <Link
              to={paths.contact}
              search={{ tipo: "restaurantes" }}
              className="whitespace-nowrap font-medium text-primary hover:underline"
            >
              {t.processIntegratedCta}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* 6. PERSONALIZAÇÃO */}
      <section className="mt-28">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] items-center">
          <Reveal>
            <Chip tone="primary">{t.customChip}</Chip>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {t.customTitle}
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">{t.customLead}</p>

            <div className="mt-6 flex flex-col gap-2.5 text-xs text-muted-foreground">
              {t.customBadges.map((badge, bIdx) => (
                <span key={bIdx} className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                  {badge}
                </span>
              ))}
            </div>
          </Reveal>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {t.customProfiles.map((prof, pIdx) => {
              const icons = [Store, UtensilsCrossed, Sparkles, CalendarDays];
              const Icon = icons[pIdx] ?? Store;

              return (
                <Reveal key={pIdx} delay={100 + pIdx * 60}>
                  <div className="orbit-panel h-full p-5">
                    <Icon className="size-5 text-primary" />
                    <h3 className="mt-3 text-sm font-semibold">{prof.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-muted-foreground">{prof.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. CTA FINAL */}
      <section className="mt-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card/50 to-background p-8 text-center sm:p-12 lg:p-16">
            <div className="nws-pulse absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

            <div className="relative mx-auto max-w-2xl">
              <Chip tone="primary">{t.finalChip}</Chip>

              <h2 className="orbit-gradient-text mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {t.finalTitle}
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                {t.finalLead}
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to={paths.contact}
                  search={{ tipo: "restaurantes" }}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition hover:-translate-y-0.5"
                >
                  <CalendarCheck className="size-4" />
                  {t.finalCtaProposal}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </SiteChrome>
  );
}

function ActivityDot() {
  return <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />;
}
