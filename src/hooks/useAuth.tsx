import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole, Profile } from "@/lib/crm";

export function useSession() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["sessao"],
    queryFn: async (): Promise<Session | null> => {
      const { data } = await supabase.auth.getSession();
      return data.session ?? null;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
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
    isAdmin: funcao.data === "administrador",
    aCarregar: aCarregarSessao || perfil.isLoading || funcao.isLoading,
  };
}
