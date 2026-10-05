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

const defaultNwsRestaurant: RestaurantTenant = {
  id: "nws-restaurantes",
  nome: "NWS Restaurantes",
  slug: "nws-restaurantes",
  subdominio: "",
  ativo: true,
  role: "administrador",
};

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
  const demoActive = isDemoMode();
  const defaultWorkspace = demoActive ? defaultTestRestaurant : defaultNwsRestaurant;

  const { data: authData, isLoading: loadingRestaurantes } = useQuery<{
    isAdmin: boolean;
    restaurantes: RestaurantTenant[];
  }>({
    queryKey: ["restaurantes_autorizados"],
    queryFn: async () =>
      demoActive
        ? Promise.resolve({
            isAdmin: true,
            restaurantes: [defaultTestRestaurant],
          })
        : obterRestaurantesAutorizados(),
    staleTime: 60_000,
    retry: 1,
  });

  const restaurantes: RestaurantTenant[] = useMemo(() => {
    if (demoActive) {
      return [defaultTestRestaurant];
    }
    if (authData?.restaurantes && authData.restaurantes.length > 0) {
      return authData.restaurantes;
    }
    return [defaultNwsRestaurant];
  }, [authData, demoActive]);

  const activeRestaurantId = demoActive ? "demo-restaurante" : "nws-restaurantes";

  const setRestaurantAndStore = (id: string) => {
    setSimulatedRole(null);
    if (id) {
      qc.invalidateQueries({ queryKey: ["restaurant_admin", id] });
      qc.invalidateQueries({ queryKey: ["restaurant_permissions", id] });
    }
  };

  const { data: permData, isLoading: loadingPerms } = useQuery({
    queryKey: ["restaurant_permissions", activeRestaurantId],
    queryFn: async () =>
      demoActive
        ? Promise.resolve({
            permitido: true,
            restaurantId: "demo-restaurante",
            role: "administrador" as const,
            isAdminNWS: true,
          })
        : obterPermissoesAtivas({ data: { restaurantId: activeRestaurantId } }),
    enabled: !aCarregar && !loadingRestaurantes,
    staleTime: 60_000,
    retry: 1,
  });

  const activeRestaurant = useMemo(() => {
    return restaurantes[0] ?? defaultWorkspace;
  }, [restaurantes, defaultWorkspace]);

  const isAdminNWS =
    demoActive ||
    isUserAdmin ||
    authData?.isAdmin === true ||
    (permData?.permitido === true && permData.isAdminNWS === true);
  const rawRole = isAdminNWS ? "administrador" : permData?.permitido ? permData.role : "sala";
  const currentRole = demoActive ? (simulatedRole ?? rawRole) : rawRole;

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
