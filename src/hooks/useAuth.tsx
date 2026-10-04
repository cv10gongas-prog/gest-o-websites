import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { isDemoMode } from "@/lib/demo-mode";
import type { AppRole, Profile } from "@/lib/crm";

export function useSession() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["sessao"],
    queryFn: async (): Promise<Session | null> => {
      if (isDemoMode()) {
        return {
          user: {
            id: "demo-admin-id",
            email: "admin.demo@novawebstudio.pt",
            app_metadata: {},
            user_metadata: { nome: "Gonçalo (Administrador)" },
            aud: "authenticated",
            created_at: new Date().toISOString(),
          },
          access_token: "demo-access-token",
          token_type: "bearer",
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: "demo-refresh-token",
        } as unknown as Session;
      }
      const { data } = await supabase.auth.getSession();
      return data.session ?? null;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (isDemoMode()) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      qc.invalidateQueries({ queryKey: ["sessao"] });
      if (event !== "SIGNED_OUT") qc.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [qc]);

  return query;
}

export function useUtilizador() {
  const { data: sessao, isLoading: aCarregarSessao } = useSession();
  const userId = sessao?.user.id;

  const perfil = useQuery({
    queryKey: ["perfil", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile | null> => {
      if (isDemoMode()) {
        return {
          id: "demo-admin-id",
          nome: "Gonçalo (Administrador)",
          email: "admin.demo@novawebstudio.pt",
          foto_url: "",
          telefone: "912 000 000",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const funcao = useQuery({
    queryKey: ["funcao", userId],
    enabled: !!userId,
    queryFn: async (): Promise<AppRole | null> => {
      if (isDemoMode()) {
        return "administrador";
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data?.role ?? null;
    },
  });

  return {
    sessao: sessao ?? null,
    userId: userId ?? null,
    perfil: perfil.data ?? null,
    funcao: funcao.data ?? null,
    isAdmin: funcao.data === "administrador" || isDemoMode(),
    aCarregar: aCarregarSessao || perfil.isLoading || funcao.isLoading,
  };
}
