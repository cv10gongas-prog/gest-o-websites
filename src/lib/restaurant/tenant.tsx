import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  obterPermissoesAtivas,
  obterRestaurantesAutorizados,
  type RestaurantStaffRole,
} from "./auth.functions";
import { CURRENT_RESTAURANT_ID } from "./config";
import { isDemoMode } from "@/lib/demo-mode";
import { useUtilizador } from "@/hooks/useAuth";

export type RestaurantTenant = {
  id: string;
  nome: string;
  slug: string;
  subdominio?: string;
  role?: RestaurantStaffRole | "administrador";
  ativo: boolean;
};

export type RestaurantTenantContextValue = {
  activeRestaurantId: string;
  setActiveRestaurantId: (id: string) => void;
  activeRestaurant: RestaurantTenant | null;
  restaurantes: RestaurantTenant[];
  currentRole: "administrador" | RestaurantStaffRole;
  setCurrentRoleSimulated?: (role: "administrador" | RestaurantStaffRole) => void;
  isAdminNWS: boolean;
  canManageMenu: boolean;
  canManageSettings: boolean;
  canManageTables: boolean;
  canManageOrders: boolean;
  canManageStaff: boolean;
  canReset: boolean;
  isLoading: boolean;
};

const RestaurantTenantContext = createContext<RestaurantTenantContextValue | null>(null);

export function useRestaurantTenant(): RestaurantTenantContextValue {
  const v = useContext(RestaurantTenantContext);
  if (!v) {
    throw new Error("useRestaurantTenant deve ser usado dentro de um RestaurantTenantProvider");
  }
  return v;
}

const defaultTestRestaurant: RestaurantTenant = {
  id: "demo-restaurante",
  nome: "NWS Restaurante (Espaço de Testes Local)",
  slug: "demo-restaurante",
  subdominio: "",
  ativo: true,
  role: "administrador",
};

export function RestaurantTenantProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { funcao, isAdmin: isAdminUser, aCarregar } = useUtilizador();
  const [simulatedRole, setSimulatedRole] = useState<"administrador" | RestaurantStaffRole | null>(
    null,
  );

  const isUserAdmin = isAdminUser || funcao === "administrador";

  const { data: authData, isLoading: loadingRestaurantes } = useQuery<{
    isAdmin: boolean;
    restaurantes: RestaurantTenant[];
  }>({
    queryKey: ["restaurantes_autorizados"],
    queryFn: async () =>
      isDemoMode()
        ? Promise.resolve({
            isAdmin: true,
            restaurantes: [defaultTestRestaurant],
          })
        : obterRestaurantesAutorizados(),
    staleTime: 60_000,
    retry: 1,
  });

  // A função central lida pelo Workspace autoriza APENAS o simulador local.
  // Os restaurantes reais continuam a depender da lista devolvida pelo servidor.
  const canUseLocalTestRestaurant =
    isDemoMode() || authData?.isAdmin === true || (!aCarregar && isUserAdmin);

  const restaurantes: RestaurantTenant[] = useMemo(() => {
    const reaisAutorizados = (authData?.restaurantes ?? []).filter(
      (r) => r.id !== "demo-restaurante",
    );
    return canUseLocalTestRestaurant
      ? [defaultTestRestaurant, ...reaisAutorizados]
      : reaisAutorizados;
  }, [authData, canUseLocalTestRestaurant]);

  const [activeRestaurantId, setActiveRestaurantId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nws_active_restaurant");
      if (saved) return saved;
    }
    return isUserAdmin ? "demo-restaurante" : CURRENT_RESTAURANT_ID;
  });

  // Atualizar quando os restaurantes autorizados forem carregados
  useEffect(() => {
    if (restaurantes.length > 0 && !restaurantes.some((r) => r.id === activeRestaurantId)) {
      const fallback = restaurantes[0]?.id ?? "";
      if (fallback) {
        setActiveRestaurantId(fallback);
        localStorage.setItem("nws_active_restaurant", fallback);
      }
    }
  }, [restaurantes, activeRestaurantId]);

  const setRestaurantAndStore = (id: string) => {
    setSimulatedRole(null);
    setActiveRestaurantId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("nws_active_restaurant", id);
    }
    qc.invalidateQueries({ queryKey: ["restaurant_admin", id] });
    qc.invalidateQueries({ queryKey: ["restaurant_permissions", id] });
  };

  const testeLocalAutorizado =
    activeRestaurantId === "demo-restaurante" && canUseLocalTestRestaurant;

  const { data: permData, isLoading: loadingPerms } = useQuery({
    queryKey: ["restaurant_permissions", activeRestaurantId],
    queryFn: async () =>
      testeLocalAutorizado
        ? Promise.resolve({
            permitido: true,
            restaurantId: "demo-restaurante",
            role: "administrador" as const,
            isAdminNWS: true,
          })
        : obterPermissoesAtivas({ data: { restaurantId: activeRestaurantId } }),
    enabled:
      !aCarregar &&
      !loadingRestaurantes &&
      !!activeRestaurantId &&
      restaurantes.some((r) => r.id === activeRestaurantId),
    staleTime: 60_000,
    retry: 1,
  });

  const activeRestaurant = useMemo(() => {
    return restaurantes.find((r) => r.id === activeRestaurantId) ?? restaurantes[0] ?? null;
  }, [restaurantes, activeRestaurantId]);

  // Um administrador confirmado pelo cliente central só ganha acesso ao TESTE LOCAL.
  // Para qualquer restaurante real, exige-se autorização verificada pelo servidor.
  const isAdminNWS =
    testeLocalAutorizado ||
    (activeRestaurantId !== "demo-restaurante" &&
      (authData?.isAdmin === true ||
        (permData?.permitido === true && permData.isAdminNWS === true)));
  const rawRole = isAdminNWS ? "administrador" : permData?.permitido ? permData.role : "sala";
  const currentRole =
    activeRestaurantId === "demo-restaurante" ? (simulatedRole ?? rawRole) : rawRole;

  const permissions = useMemo(() => {
    const isOwnerOrManager =
      isAdminNWS ||
      currentRole === "administrador" ||
      currentRole === "proprietario" ||
      currentRole === "gerente";

    const isSala = currentRole === "sala";
    const isCozinha = currentRole === "cozinha";

    return {
      canManageMenu: isOwnerOrManager,
      canManageSettings: isOwnerOrManager,
      canManageTables: isOwnerOrManager || isSala,
      canManageOrders: isOwnerOrManager || isSala || isCozinha,
      canManageStaff: isOwnerOrManager,
      canReset: isAdminNWS || currentRole === "proprietario" || currentRole === "administrador",
    };
  }, [isAdminNWS, currentRole]);

  const value: RestaurantTenantContextValue = {
    activeRestaurantId,
    setActiveRestaurantId: setRestaurantAndStore,
    activeRestaurant,
    restaurantes,
    currentRole,
    setCurrentRoleSimulated: setSimulatedRole,
    isAdminNWS,
    ...permissions,
    isLoading: aCarregar || loadingRestaurantes || loadingPerms,
  };

  return (
    <RestaurantTenantContext.Provider value={value}>{children}</RestaurantTenantContext.Provider>
  );
}
