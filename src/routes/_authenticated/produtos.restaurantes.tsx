import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UtensilsCrossed, AlertTriangle, RefreshCw } from "lucide-react";
import {
  ADMIN_TABLES,
  AdminContext,
  RestaurantContext,
  adminQuery,
  useRealtime,
} from "@/lib/restaurant/store";
import { isDemoMode, LOCAL_RESTAURANT_STORAGE_KEY, reloadLocalRestaurantDemo } from "@/lib/demo-mode";
import { RestaurantTenantProvider, useRestaurantTenant } from "@/lib/restaurant/tenant";
import { playNewOrderSound, playTableAlertSound } from "@/lib/restaurant/sound";

export const Route = createFileRoute("/_authenticated/produtos/restaurantes")({
  head: () => ({
    meta: [
      { title: "NWS Restaurantes — Nova Web Studio" },
      {
        name: "description",
        content:
          "Plataforma completa de gestão de restauração: pedidos em tempo real, gestão visual de mesas, QR Codes, menus e reservas.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RestaurantTenantProvider>
      <RestaurantesLayoutInner />
    </RestaurantTenantProvider>
  ),
});

function RestaurantesLayoutInner() {
  const qc = useQueryClient();
  const {
    activeRestaurantId,
    activeRestaurant,
    isLoading: tenantLoading,
    canManageMenu,
    canManageSettings,
    canManageStaff,
  } = useRestaurantTenant();

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  // Guarda de rotas baseada em permissões por função
  useEffect(() => {
    // Aguarda pela sessão, permissões e seleção estável do restaurante.
    if (tenantLoading || !activeRestaurant || activeRestaurant.id !== activeRestaurantId) return;
    if (pathname.includes("/menu") && !canManageMenu) {
      toast.error("A sua função não tem autorização para gerir a ementa.");
      navigate({ to: "/produtos/restaurantes/pedidos" });
    }
    if (pathname.includes("/definicoes") && !canManageSettings) {
      toast.error("A sua função não tem autorização para gerir as configurações.");
      navigate({ to: "/produtos/restaurantes/pedidos" });
    }
    if (pathname.includes("/equipa") && !canManageStaff) {
      toast.error("A sua função não tem autorização para gerir a equipa.");
      navigate({ to: "/produtos/restaurantes/pedidos" });
    }
  }, [
    pathname,
    tenantLoading,
    activeRestaurant,
    activeRestaurantId,
    canManageMenu,
    canManageSettings,
    canManageStaff,
    navigate,
  ]);

  // Carrega e sincroniza todos os dados do restaurante ativo em tempo real
  const q = useQuery({
    ...adminQuery(activeRestaurantId),
    refetchInterval: 4_000, // fallback curto: mesmo se o Realtime falhar, não é preciso F5
    refetchIntervalInBackground: false,
    enabled: Boolean(activeRestaurantId),
  });
  useRealtime(activeRestaurantId, ADMIN_TABLES, [["restaurant_admin", activeRestaurantId]]);

  // As mesas/pedidos da demonstração são partilhados entre separadores do MESMO browser.
  useEffect(() => {
    if (activeRestaurantId !== "demo-restaurante") return;
    const refresh = () =>
      void qc.invalidateQueries({ queryKey: ["restaurant_admin", activeRestaurantId] });
    const storage = (event: StorageEvent) => {
      if (event.key === LOCAL_RESTAURANT_STORAGE_KEY) {
        reloadLocalRestaurantDemo();
        refresh();
      }
    };
    window.addEventListener("nws:local-rest-changed", refresh);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener("nws:local-rest-changed", refresh);
      window.removeEventListener("storage", storage);
    };
  }, [activeRestaurantId, qc]);

  const data = q.data;

  // Deteção inteligente de novos pedidos, chamadas de mesa e reservas para avisos sonoros e toasts
  const seen = useRef<{
    o: Set<string>;
    r: Set<string>;
    res: Set<string>;
  } | null>(null);

  useEffect(() => {
    if (!data) return;
    const cur = {
      o: new Set(data.orders.map((x) => x.id)),
      r: new Set(data.requests.map((x) => x.id)),
      res: new Set(data.reservations.map((x) => x.id)),
    };
    const prev = seen.current;

    if (prev) {
      // 1. Novos pedidos na cozinha
      const newOrders = data.orders.filter((o) => !prev.o.has(o.id) && !o.closed);
      if (newOrders.length > 0) {
        playNewOrderSound();
        newOrders.forEach((o) => {
          toast.success(`Novo Pedido · Mesa ${o.tableNumber}`, {
            description: `#${o.code} — ${o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}`,
            duration: 8000,
          });
        });
      }

      // 2. Chamadas de mesa / Pedidos de conta
      const newRequests = data.requests.filter((r) => !prev.r.has(r.id) && !r.resolved);
      if (newRequests.length > 0) {
        playTableAlertSound();
        newRequests.forEach((r) => {
          if (r.type === "conta") {
            toast.warning(`Mesa ${r.tableNumber} solicitou a Conta`, {
              description: "O cliente pediu a conta através do QR Code.",
              duration: 8000,
            });
          } else {
            toast.info(`Mesa ${r.tableNumber} chamou o Empregado`, {
              description: "O cliente solicita assistência na mesa.",
              duration: 8000,
            });
          }
        });
      }

      // 3. Novas reservas online
      const newResvs = data.reservations.filter(
        (r) => !prev.res.has(r.id) && r.origin === "online",
      );
      if (newResvs.length > 0) {
        newResvs.forEach((r) => {
          toast(`Nova Reserva Online · ${r.name}`, {
            description: `${r.date} às ${r.time} (${r.guests} pessoas)`,
            duration: 6000,
          });
        });
      }
    }

    seen.current = cur;
  }, [data]);

  if (q.isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <div className="relative">
          <div className="size-12 rounded-2xl border-2 border-warning/30 border-t-warning animate-spin" />
          <UtensilsCrossed className="size-5 text-warning absolute inset-0 m-auto" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">
          A sincronizar plataforma do restaurante em tempo real...
        </p>
      </div>
    );
  }

  if (q.isError || !data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-3xl border border-danger/30 bg-danger/5 p-8 text-center max-w-lg mx-auto">
        <div className="grid size-12 place-items-center rounded-2xl bg-danger/20 text-danger">
          <AlertTriangle className="size-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Erro ao Ligar ao NWS Restaurantes</h2>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {q.error?.message || "Não foi possível descarregar os dados do restaurante."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => q.refetch()}
          className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2 text-xs font-bold text-white transition hover:bg-danger/90"
        >
          <RefreshCw className="size-3.5" />
          <span>Tentar Novamente</span>
        </button>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ data, restaurantId: activeRestaurantId }}>
      <RestaurantContext.Provider value={data}>
        <div className="space-y-6">
          {isDemoMode() && activeRestaurantId === "demo-restaurante" && (
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3.5 text-xs text-primary backdrop-blur-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <span>
                  <strong>Espaço de Testes do Workspace</strong> — Operação em modo local seguro.
                  Podes testar mesas, ementa, pedidos e reservas sem tocar em dados reais.
                </span>
              </div>
            </div>
          )}

          <Outlet />
        </div>
      </RestaurantContext.Provider>
    </AdminContext.Provider>
  );
}


