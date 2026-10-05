import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UtensilsCrossed, AlertTriangle, RefreshCw, Building2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, fieldClass } from "@/components/restaurant/RestaurantBits";
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
import { criarNovoRestaurante } from "@/lib/restaurant/auth.functions";

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
    setActiveRestaurantId,
    activeRestaurant,
    restaurantes,
    isAdminNWS,
    isLoading: tenantLoading,
    currentRole,
    canManageMenu,
    canManageSettings,
    canManageStaff,
  } = useRestaurantTenant();

  const [createOpen, setCreateOpen] = useState(false);
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
    enabled: !tenantLoading && !!activeRestaurant && activeRestaurant.id === activeRestaurantId,
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

  if (tenantLoading || (!!activeRestaurantId && q.isLoading)) {
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

  if (!activeRestaurant || restaurantes.length === 0) {
    if (isAdminNWS) {
      return (
        <div className="mx-auto max-w-xl rounded-3xl border border-border/80 bg-surface/60 p-10 text-center backdrop-blur-xl shadow-lg space-y-5 my-12">
          <div className="grid size-16 place-items-center rounded-2xl bg-warning/15 text-warning mx-auto border border-warning/30 shadow-inner">
            <Building2 className="size-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Nenhum estabelecimento configurado</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ainda não foi configurado nenhum restaurante no NWS Workspace. Como Administrador NWS, pode criar o primeiro estabelecimento agora.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-warning px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-warning/20 transition hover:bg-warning/90"
          >
            <Plus className="size-4" />
            <span>+ Criar estabelecimento</span>
          </button>

          <CreateRestaurantDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            onCreated={(id) => {
              setActiveRestaurantId(id);
            }}
          />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-border/80 bg-surface/60 p-10 text-center backdrop-blur-xl shadow-lg space-y-3 my-12">
        <div className="grid size-16 place-items-center rounded-2xl bg-surface-strong text-muted-foreground mx-auto border border-border">
          <UtensilsCrossed className="size-8" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Sem restaurantes atribuídos</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ainda não tens acesso a nenhum estabelecimento. Contacta o administrador da Nova Web Studio.
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
          {/* BARRA SUPERIOR DE SELEÇÃO DE ESTABELECIMENTO / CRIAR NOVO */}
          {(restaurantes.length > 1 || isAdminNWS) && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface/40 px-4 py-2.5 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Estabelecimento:
                </span>
                {restaurantes.length > 1 ? (
                  <select
                    value={activeRestaurantId}
                    onChange={(e) => setActiveRestaurantId(e.target.value)}
                    className="h-8 rounded-xl border border-border/80 bg-surface px-3 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                  >
                    {restaurantes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nome} ({r.slug})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs font-extrabold text-foreground">
                    {activeRestaurant.nome}
                  </span>
                )}
              </div>

              {isAdminNWS && (
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-warning/40 bg-warning/10 px-3 py-1.5 text-xs font-bold text-warning hover:bg-warning/20 transition"
                >
                  <Plus className="size-3.5" />
                  <span>+ Criar estabelecimento</span>
                </button>
              )}
            </div>
          )}

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

          <CreateRestaurantDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            onCreated={(id) => {
              setActiveRestaurantId(id);
            }}
          />
        </div>
      </RestaurantContext.Provider>
    </AdminContext.Provider>
  );
}

function CreateRestaurantDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const qc = useQueryClient();
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [subdominio, setSubdominio] = useState("");
  const [slugCustomizado, setSlugCustomizado] = useState(false);
  const [saving, setSaving] = useState(false);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);

  const handleNomeChange = (val: string) => {
    setNome(val);
    if (!slugCustomizado) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanId = slugify(slug);
    const cleanNome = nome.trim();
    if (cleanId.length < 2) {
      toast.error(
        "O identificador/slug deve ter pelo menos 2 caracteres (apenas letras minúsculas, números e hífens).",
      );
      return;
    }
    if (cleanNome.length < 2) {
      toast.error("Indique o nome do estabelecimento.");
      return;
    }

    setSaving(true);
    try {
      await criarNovoRestaurante({
        data: {
          id: cleanId,
          nome: cleanNome,
          subdominio: subdominio.trim() || `${cleanId}.novawebstudio.pt`,
        },
      });

      await qc.invalidateQueries({ queryKey: ["restaurantes_autorizados"] });
      toast.success(`Estabelecimento "${cleanNome}" criado com sucesso!`);
      onCreated(cleanId);
      onOpenChange(false);
      setNome("");
      setSlug("");
      setSubdominio("");
      setSlugCustomizado(false);
    } catch (err) {
      toast.error(`Erro ao criar estabelecimento: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-surface border-border/80 text-foreground">
        <DialogHeader>
          <DialogTitle>+ Criar Estabelecimento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Field label="Nome do Restaurante">
            <input
              type="text"
              required
              maxLength={80}
              placeholder="Ex.: Restaurante Central"
              value={nome}
              onChange={(e) => handleNomeChange(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <Field
            label="Identificador / Slug"
            hint="Identificador único na base de dados (apenas letras minúsculas, números e hífens)."
          >
            <input
              type="text"
              required
              pattern="^[a-z0-9-]+$"
              maxLength={50}
              placeholder="ex.: restaurante-central"
              value={slug}
              onChange={(e) => {
                setSlugCustomizado(true);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
              }}
              className={fieldClass}
            />
          </Field>

          <Field label="Subdomínio (Opcional)" hint="Endereço para o espaço privado do restaurante.">
            <input
              type="text"
              placeholder={`ex.: ${slug || "restaurante"}.novawebstudio.pt`}
              value={subdominio}
              onChange={(e) => setSubdominio(e.target.value)}
              className={fieldClass}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-border/80 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-surface-strong hover:text-foreground transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-warning px-5 py-2 text-xs font-bold text-black shadow-md transition hover:bg-warning/90 disabled:opacity-50"
            >
              {saving ? "A criar..." : "Criar Estabelecimento"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

