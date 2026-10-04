import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Clock3,
  ExternalLink,
  Flame,
  Globe,
  Receipt,
  RefreshCw,
  Sparkles,
  Table2,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import {
  OrderBadge,
  PanelHeader,
  ReservationBadge,
  RestaurantCard,
  RestaurantPublicBanner,
  StatCard,
  TableBadge,
  formatDate,
  orderTimeInfo,
  timeAgo,
} from "@/components/restaurant/RestaurantBits";
import { todayISO } from "@/lib/restaurant/demo-data";
import {
  adminActions,
  formatPrice,
  getTableState,
  tableStateLabel,
  useAdmin,
} from "@/lib/restaurant/store";
import { useQueryClient } from "@tanstack/react-query";
import { isDemoMode, demoStore } from "@/lib/demo-mode";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/produtos/restaurantes/")({
  component: RestaurantOverview,
});

function RestaurantOverview() {
  const { data: app, restaurantId } = useAdmin();
  const qc = useQueryClient();
  const [periodo, setPeriodo] = useState<"hoje" | "7d" | "30d">("hoje");
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Contador de atualização honesto
  useEffect(() => {
    setSecondsAgo(0);
    const interval = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [app]);

  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const todayOrders = useMemo(
    () => app.orders.filter((o) => o.createdAt >= startOfToday),
    [app.orders, startOfToday],
  );

  const activeOrders = useMemo(
    () =>
      app.orders
        .filter((o) => !o.closed && o.status !== "entregue")
        .sort((a, b) => a.createdAt - b.createdAt),
    [app.orders],
  );

  const delayedOrders = useMemo(
    () => activeOrders.filter((o) => orderTimeInfo(o.createdAt).isDelayed),
    [activeOrders],
  );

  const activeRequests = useMemo(
    () => app.requests.filter((r) => !r.resolved).sort((a, b) => a.createdAt - b.createdAt),
    [app.requests],
  );

  const todayReservations = useMemo(
    () => app.reservations.filter((r) => r.date === todayISO() && r.status !== "cancelada"),
    [app.reservations],
  );

  const expectedGuests = useMemo(
    () => todayReservations.reduce((acc, r) => acc + r.guests, 0),
    [todayReservations],
  );

  const activeTablesCount = app.tables.filter((t) => t.active).length;
  const occupiedTablesCount = app.tables.filter((t) =>
    ["ocupada", "assistencia", "conta"].includes(getTableState(app, t)),
  ).length;
  const freeTablesCount = Math.max(0, activeTablesCount - occupiedTablesCount);

  const unavailableProducts = app.products.filter((p) => !p.available);

  // Métricas financeiras calculadas a partir de pedidos reais (sem confundir com faturação emitida)
  const valorPedidosHoje = todayOrders.reduce((acc, o) => acc + o.total, 0);
  const ticketMedio = todayOrders.length > 0 ? valorPedidosHoje / todayOrders.length : 0;

  const upcomingReservations = useMemo(
    () =>
      app.reservations
        .filter((r) => r.date >= todayISO() && r.status !== "cancelada" && r.status !== "concluida")
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .slice(0, 5),
    [app.reservations],
  );

  // Gráfico real dos últimos 7 dias baseado exclusivamente nos pedidos existentes
  const chart7Days = useMemo(() => {
    const days: { label: string; dateStr: string; count: number; valor: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayStart = new Date(iso + "T00:00:00").getTime();
      const dayEnd = new Date(iso + "T23:59:59").getTime();

      const dayOrders = app.orders.filter((o) => o.createdAt >= dayStart && o.createdAt <= dayEnd);
      const label = d.toLocaleDateString("pt-PT", { weekday: "short" });
      days.push({
        label,
        dateStr: iso,
        count: dayOrders.length,
        valor: dayOrders.reduce((acc, o) => acc + o.total, 0),
      });
    }
    return days;
  }, [app.orders]);

  const maxChartCount = Math.max(1, ...chart7Days.map((d) => d.count));

  const resolve = async (id: string) => {
    try {
      await adminActions.resolveRequest(id, restaurantId);
      toast.success("Pedido de mesa resolvido.");
      qc.invalidateQueries();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const hojeFormatado = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 max-w-[1450px]">
      {/* CABEÇALHO DO COMMAND CENTER */}
      <PanelHeader
        title={app.settings.name || "NWS Restaurantes"}
        subtitle={`Command Center Operacional · ${hojeFormatado}`}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-mono text-muted-foreground hidden md:inline">
              Atualizado há {secondsAgo}s
            </span>

            <button
              type="button"
              onClick={() => {
                qc.invalidateQueries();
                toast.success("Dados sincronizados.");
              }}
              className="rounded-xl border border-border/70 bg-surface-strong p-2 text-muted-foreground hover:text-foreground transition"
              title="Atualizar agora"
            >
              <RefreshCw className="size-3.5" />
            </button>

            <Link
              to="/produtos/restaurantes/pedidos"
              className="inline-flex items-center gap-2 rounded-xl bg-warning px-3.5 py-2 text-xs font-bold text-black shadow-lg shadow-warning/20 transition hover:bg-warning/90"
            >
              <ClipboardList className="size-4" />
              <span>Quadro de Cozinha</span>
              {activeOrders.length > 0 && (
                <span className="rounded-full bg-black px-1.5 py-0.2 text-[10px] font-extrabold text-warning">
                  {activeOrders.length}
                </span>
              )}
            </Link>
          </div>
        }
      />

      {/* BARRA DE AÇÕES OPERACIONAIS E SIMULAÇÃO DE CLIENTES (APENAS EM MODO DEMO ISOLADO) */}
      {isDemoMode() && (
        <div className="rounded-2xl border border-warning/30 bg-surface/50 p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-warning">
            <Sparkles className="size-4 text-warning" />
            <span>Simulador Operacional de Sala & Clientes (Ambiente DEMO)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const o = demoStore.simulateCustomerOrder();
                qc.invalidateQueries();
                toast.success(`⚡ Novo Pedido QR Simulado na Mesa ${o.tableNumber}!`, {
                  description: `#${o.code} — Total: ${formatPrice(o.total)}`,
                });
              }}
              className="flex items-center gap-1.5 rounded-xl bg-warning px-3 py-1.5 text-xs font-bold text-black hover:bg-warning/90 transition shadow-sm"
            >
              <span>⚡ Simular Pedido QR</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const r = demoStore.simulateTableRequest("empregado");
                qc.invalidateQueries();
                toast.info(`🛎️ Mesa ${r.tableNumber} chamou o Empregado!`);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface-strong px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface transition"
            >
              <span>🛎️ Chamar Empregado</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const r = demoStore.simulateTableRequest("conta");
                qc.invalidateQueries();
                toast.warning(`🧾 Mesa ${r.tableNumber} pediu a Conta!`);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface-strong px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface transition"
            >
              <span>🧾 Pedir a Conta</span>
            </button>

            {!demoStore.isPopulated ? (
              <button
                type="button"
                onClick={() => {
                  demoStore.loadSampleData();
                  qc.invalidateQueries();
                  toast.success("Cenário de demonstração carregado com ementa, mesas e pedidos!");
                }}
                className="flex items-center gap-1.5 rounded-xl border border-warning/50 bg-warning/10 px-3 py-1.5 text-xs font-bold text-warning hover:bg-warning/20 transition"
              >
                <span>📦 Carregar Cenário de Exemplo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  demoStore.resetDemo();
                  qc.invalidateQueries();
                  toast.info("Demonstração reposta para o estado inicial vazio.");
                }}
                className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-danger hover:border-danger/40 transition"
              >
                <span>🔄 Repor Estado Vazio</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* BANNER DE ALERTAS URGENTES OPERACIONAIS (SE EXISTIREM) */}
      {(delayedOrders.length > 0 || activeRequests.length > 0) && (
        <section className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 shadow-sm backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-300">
            <AlertTriangle className="size-4 animate-bounce text-rose-400" />
            <span>Atenção Operacional Imediata</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {delayedOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface/80 border border-rose-500/40 p-3"
              >
                <div>
                  <span className="font-bold text-xs text-foreground">
                    Mesa {o.tableNumber} · Pedido #{o.code}
                  </span>
                  <p className="text-[11px] font-bold text-rose-400">
                    ⚠️ Em cozinha há mais de {orderTimeInfo(o.createdAt).diffMinutes} min
                  </p>
                </div>
                <Link
                  to="/produtos/restaurantes/pedidos"
                  className="rounded-lg bg-rose-500/20 px-2.5 py-1 text-[10px] font-bold text-rose-200 hover:bg-rose-500 hover:text-white transition"
                >
                  Ver Pedido
                </Link>
              </div>
            ))}

            {activeRequests.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface/80 border border-rose-500/40 p-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-rose-500 text-white text-xs font-bold">
                    {r.type === "conta" ? <Receipt size={14} /> : <Bell size={14} />}
                  </span>
                  <div>
                    <span className="font-bold text-xs text-foreground">Mesa {r.tableNumber}</span>
                    <p className="text-[11px] text-rose-300">
                      {r.type === "conta" ? "Pediu a Conta" : "Pediu Assistência"} (
                      {timeAgo(r.createdAt)})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => resolve(r.id)}
                  className="rounded-lg bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-[10px] font-bold text-rose-200 hover:bg-rose-500 hover:text-white transition"
                >
                  Resolver
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8 INDICADORES OPERACIONAIS ESSENCIAIS */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pedidos Ativos"
          value={activeOrders.length}
          subtitle={
            activeOrders.length === 0
              ? "Cozinha sem pedidos pendentes"
              : `${activeOrders.filter((o) => o.status === "recebido").length} novos aguardam início`
          }
          icon={ClipboardList}
          tone="warning"
        />

        <StatCard
          title="Valor Pedidos Hoje"
          value={formatPrice(valorPedidosHoje)}
          subtitle={
            todayOrders.length > 0
              ? `${todayOrders.length} pedidos registados hoje`
              : "Sem pedidos registados hoje"
          }
          icon={TrendingUp}
          tone="primary"
        />

        <StatCard
          title="Ticket Médio (Hoje)"
          value={todayOrders.length > 0 ? formatPrice(ticketMedio) : "—"}
          subtitle={
            todayOrders.length > 0 ? "Média por pedido hoje" : "Calculado com pedidos do dia"
          }
          icon={BarChart3}
          tone="info"
        />

        <StatCard
          title="Ocupação de Mesas"
          value={`${occupiedTablesCount} / ${activeTablesCount}`}
          subtitle={`${freeTablesCount} livres · ${occupiedTablesCount} ocupadas`}
          icon={Table2}
          tone={occupiedTablesCount > 0 ? "warning" : "success"}
        />

        <StatCard
          title="Reservas Hoje"
          value={todayReservations.length}
          subtitle={`${expectedGuests} clientes esperados`}
          icon={CalendarDays}
          tone="info"
        />

        <StatCard
          title="Chamadas de Mesa"
          value={activeRequests.length}
          subtitle={
            activeRequests.length === 0
              ? "Nenhuma chamada pendente"
              : `${activeRequests.length} mesas a aguardar`
          }
          icon={Bell}
          tone={activeRequests.length > 0 ? "danger" : "neutral"}
        />

        <StatCard
          title="Produtos Esgotados"
          value={unavailableProducts.length}
          subtitle={
            unavailableProducts.length === 0
              ? "Todos os pratos disponíveis"
              : `${unavailableProducts
                  .map((p) => p.name)
                  .slice(0, 2)
                  .join(", ")}${unavailableProducts.length > 2 ? "..." : ""}`
          }
          icon={UtensilsCrossed}
          tone={unavailableProducts.length > 0 ? "danger" : "neutral"}
        />

        <StatCard
          title="Catálogo Ementa"
          value={app.products.length}
          subtitle={`${app.categories.length} categorias configuradas`}
          icon={Sparkles}
          tone="neutral"
        />
      </div>

      {/* MAPA VISUAL DE SALA EM DIRETO */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table2 className="size-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Disposição da Sala em Direto
            </h2>
          </div>
          <Link
            to="/produtos/restaurantes/mesas"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>Gerir Mesas & QR Codes</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        <RestaurantCard className="p-4 sm:p-5">
          {app.tables.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground space-y-3">
              <Table2 className="size-10 mx-auto opacity-40" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Ainda não existem mesas configuradas neste restaurante.
                </p>
                <p className="text-xs mt-0.5">
                  Adicione as mesas do estabelecimento em "Gerir Mesas" ou carregue dados de
                  demonstração.
                </p>
              </div>

              {isDemoMode() && !demoStore.isPopulated && (
                <button
                  type="button"
                  onClick={() => {
                    demoStore.loadSampleData();
                    qc.invalidateQueries();
                    toast.success("Dados de exemplo carregados no modo demo!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-warning/20 border border-warning/50 px-3 py-1.5 text-xs font-bold text-warning hover:bg-warning hover:text-black transition"
                >
                  <Sparkles className="size-3.5" />
                  <span>Carregar dados de exemplo para testar</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
              {app.tables.map((t) => {
                const st = getTableState(app, t);
                const tone =
                  st === "livre"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : st === "reservada"
                      ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                      : st === "ocupada"
                        ? "border-amber-500/40 bg-amber-500/15 text-amber-400 font-bold"
                        : st === "inativa"
                          ? "border-border/40 bg-surface-strong/40 text-muted-foreground/60 opacity-60"
                          : "border-rose-500/50 bg-rose-500/20 text-rose-300 font-bold animate-pulse";

                return (
                  <div
                    key={t.id}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition hover:scale-105",
                      tone,
                    )}
                  >
                    <span className="text-base font-extrabold font-mono">{t.number}</span>
                    <span className="text-[9px] font-semibold uppercase tracking-tight mt-0.5 truncate w-full">
                      {tableStateLabel[st]}
                    </span>
                    <span className="text-[8px] text-muted-foreground mt-0.5">{t.seats} lug.</span>
                  </div>
                );
              })}
            </div>
          )}
        </RestaurantCard>
      </section>

      {/* GRÁFICO REAL DOS ÚLTIMOS 7 DIAS E QUADRO DE PEDIDOS EM DIRETO */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* GRÁFICO REAL DE PEDIDOS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Evolução de Pedidos (Últimos 7 Dias)
              </h2>
            </div>
          </div>

          <RestaurantCard className="p-5 space-y-4">
            <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2 border-b border-border/40">
              {chart7Days.map((d) => {
                const heightPct = Math.max(8, Math.round((d.count / maxChartCount) * 100));
                return (
                  <div
                    key={d.dateStr}
                    className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full group"
                  >
                    <span className="text-[10px] font-mono font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition">
                      {d.count}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={cn(
                        "w-full max-w-[28px] rounded-t-lg transition-all duration-300",
                        d.dateStr === todayISO()
                          ? "bg-primary shadow-lg shadow-primary/30"
                          : d.count > 0
                            ? "bg-surface-strong group-hover:bg-primary/60"
                            : "bg-surface-strong/30",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] uppercase font-bold mt-1",
                        d.dateStr === todayISO() ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>
                Total 7 dias:{" "}
                <strong className="text-foreground">
                  {chart7Days.reduce((a, b) => a + b.count, 0)} pedidos
                </strong>
              </span>
              <span>
                Valor acumulado:{" "}
                <strong className="text-foreground">
                  {formatPrice(chart7Days.reduce((a, b) => a + b.valor, 0))}
                </strong>
              </span>
            </div>
          </RestaurantCard>
        </section>

        {/* PRÓXIMAS RESERVAS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-info" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Próximas Reservas
              </h2>
            </div>
            <Link
              to="/produtos/restaurantes/reservas"
              className="inline-flex items-center gap-1 text-xs font-semibold text-info hover:underline"
            >
              <span>Ver Todas as Reservas</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <RestaurantCard className="divide-y divide-border/40 overflow-hidden min-h-[190px]">
            {upcomingReservations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground space-y-1">
                <CalendarDays className="size-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold text-foreground">Sem reservas agendadas.</p>
                <p className="text-[11px]">
                  As reservas online e telefónicas surgirão aqui por ordem de chegada.
                </p>
              </div>
            ) : (
              upcomingReservations.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 p-3.5 transition hover:bg-surface-strong/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 shrink-0 rounded-xl border border-border/70 bg-surface-strong p-1.5 text-center">
                      <span className="block font-mono text-xs font-bold text-foreground">
                        {r.time}
                      </span>
                      <span className="block text-[8px] uppercase font-semibold text-muted-foreground">
                        {r.date === todayISO() ? "Hoje" : formatDate(r.date)}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-xs text-foreground truncate">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {r.guests} pessoas
                        {r.tableNumber ? ` · Mesa ${r.tableNumber}` : ""}
                      </p>
                    </div>
                  </div>

                  <ReservationBadge status={r.status} label={r.status} />
                </div>
              ))
            )}
          </RestaurantCard>
        </section>
      </div>
    </div>
  );
}
