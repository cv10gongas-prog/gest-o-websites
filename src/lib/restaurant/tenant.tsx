import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  obterPermissoesAtivas,
  obterRestaurantesAutorizados,
  type RestaurantStaffRole,
} from "./auth.functions";
import { CURRENT_RESTAURANT_ID } from "./config";
import { isDemoMode } from "@/lib/demo-mode";

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
  id: CURRENT_RESTAURANT_ID,
  nome: "NWS Restaurante (Teste)",
  slug: "casa-do-vale",
  subdominio: "",
  ativo: true,
  role: "administrador",
};

export function RestaurantTenantProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [simulatedRole, setSimulatedRole] = useState<"administrador" | RestaurantStaffRole | null>(
    null,
  );

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
  });

  const restaurantes: RestaurantTenant[] = useMemo(() => {
    if (authData?.restaurantes && authData.restaurantes.length > 0) {
      return authData.restaurantes as RestaurantTenant[];
    }
    return [defaultTestRestaurant];
  }, [authData]);

  const [activeRestaurantId, setActiveRestaurantId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nws_active_restaurant");
      if (saved) return saved;
    }
    return CURRENT_RESTAURANT_ID;
  });

  // Atualizar quando os restaurantes autorizados forem carregados
  useEffect(() => {
    if (restaurantes.length > 0 && !restaurantes.some((r) => r.id === activeRestaurantId)) {
      const fallback = restaurantes[0]?.id ?? CURRENT_RESTAURANT_ID;
      setActiveRestaurantId(fallback);
      localStorage.setItem("nws_active_restaurant", fallback);
    }
  }, [restaurantes, activeRestaurantId]);

  const setRestaurantAndStore = (id: string) => {
    setActiveRestaurantId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("nws_active_restaurant", id);
    }
    qc.invalidateQueries({ queryKey: ["restaurant_admin", id] });
    qc.invalidateQueries({ queryKey: ["restaurant_permissions", id] });
  };

  const { data: permData, isLoading: loadingPerms } = useQuery({
    queryKey: ["restaurant_permissions", activeRestaurantId],
    queryFn: async () =>
      isDemoMode()
        ? Promise.resolve({
            permitido: true,
            restaurantId: activeRestaurantId,
            role: "administrador" as const,
            isAdminNWS: true,
          })
        : obterPermissoesAtivas({ data: { restaurantId: activeRestaurantId } }),
    enabled: !!activeRestaurantId && !!restaurantes.length && !loadingRestaurantes,
    staleTime: 60_000,
  });

  const activeRestaurant = useMemo(() => {
    return (
      restaurantes.find((r) => r.id === activeRestaurantId) ??
      restaurantes[0] ??
      defaultTestRestaurant
    );
  }, [restaurantes, activeRestaurantId]);

  const isAdminNWS = permData?.isAdminNWS ?? authData?.isAdmin ?? true;
  const rawRole = permData?.role ?? "administrador";
  const currentRole = simulatedRole ?? rawRole;

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
    isLoading: loadingRestaurantes || loadingPerms,
  };

  return (
    <RestaurantTenantContext.Provider value={value}>{children}</RestaurantTenantContext.Provider>
  );
}
