import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function garantirAdministrador(supabase: {
  from: (t: string) => {
    select: (c: string) => {
      eq: (
        c: string,
        v: string,
      ) => { maybeSingle: () => Promise<{ data: { role?: string } | null }> };
    };
  };
}, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
  if (data?.role !== "administrador") {
    throw new Error("Apenas administradores podem gerir a equipa.");
  }
}

export const removerMembro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await garantirAdministrador(context.supabase as never, context.userId);
    if (data.userId === context.userId) {
      throw new Error("Não podes remover-te a ti próprio.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: perfil } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", data.userId)
      .maybeSingle();

    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    await supabaseAdmin.from("profiles").delete().eq("id", data.userId);
    if (perfil?.email) {
      await supabaseAdmin.from("team_invites").delete().ilike("email", perfil.email);
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);

    return { ok: true };
  });

export const alterarFuncao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(["administrador", "colaborador"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await garantirAdministrador(context.supabase as never, context.userId);
    if (data.userId === context.userId) {
      throw new Error("Não podes alterar a tua própria função.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);

    return { ok: true };
  });
