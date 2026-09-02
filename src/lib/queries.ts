import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { alterarFuncao, removerMembro } from "@/lib/equipa.functions";
import type {
  AppRole,
  Business,
  BusinessStatus,
  EmailTemplate,
  Interaction,
  Opportunity,
  Profile,
  Project,
  Task,
  WebsiteRequest,
} from "@/lib/crm";
import { dominio } from "@/lib/crm";

export type TablesInsert<T extends string> = Record<string, unknown> & { __t?: T };

async function registarActividade(entrada: {
  business_id?: string | null;
  entidade: string;
  entidade_id?: string | null;
  accao: string;
  detalhe?: string | null;
}) {
  const { data } = await supabase.auth.getUser();
  await supabase.from("activity_log").insert({
    business_id: entrada.business_id ?? null,
    entidade: entrada.entidade,
    entidade_id: entrada.entidade_id ?? null,
    accao: entrada.accao,
    detalhe: entrada.detalhe ?? null,
    autor: data.user?.id ?? null,
  });
}

export { registarActividade };

async function utilizadorActual() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/* ------------------------------- PERFIS ------------------------------- */

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase.from("profiles").select("*").order("nome");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id, role");
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ------------------------------ NEGÓCIOS ------------------------------ */

export function useBusinesses() {
  return useQuery({
    queryKey: ["businesses"],
    queryFn: async (): Promise<Business[]> => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBusiness(id: string | undefined) {
  return useQuery({
    queryKey: ["business", id],
    enabled: !!id,
    queryFn: async (): Promise<Business | null> => {
      const { data, error } = await supabase.from("businesses").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCriarNegocio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (valores: Partial<Business> & { nome: string }) => {
      const uid = await utilizadorActual();
      const { data, error } = await supabase
        .from("businesses")
        .insert({
          ...valores,
          website_dominio: dominio(valores.website ?? null),
          criado_por: uid,
          encontrado_por: valores.encontrado_por ?? uid,
        })
        .select()
        .single();
      if (error) throw error;
      await registarActividade({
        business_id: data.id,
        entidade: "negocio",
        entidade_id: data.id,
        accao: "criou o negócio",
        detalhe: data.nome,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["businesses"] });
      toast.success("Negócio guardado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useActualizarNegocio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      valores,
      descricao,
    }: {
      id: string;
      valores: Partial<Business>;
      descricao?: string;
    }) => {
      const patch = { ...valores };
      if (valores.website !== undefined) patch.website_dominio = dominio(valores.website);
      const { data, error } = await supabase
        .from("businesses")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      await registarActividade({
        business_id: id,
        entidade: "negocio",
        entidade_id: id,
        accao: descricao ?? "atualizou o negócio",
      });
      return data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["businesses"] });
      qc.invalidateQueries({ queryKey: ["business", v.id] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useApagarNegocio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("businesses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["businesses"] });
      toast.success("Negócio apagado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ----------------------------- INTERAÇÕES ----------------------------- */

export function useInteractions(businessId?: string) {
  return useQuery({
    queryKey: ["interactions", businessId ?? "todas"],
    queryFn: async (): Promise<Interaction[]> => {
      let q = supabase.from("interactions").select("*").order("ocorreu_em", { ascending: false });
      if (businessId) q = q.eq("business_id", businessId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRegistarChamada() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entrada: {
      interacao: Partial<Interaction> & { business_id: string };
      novoEstado?: BusinessStatus;
      proximaAccao?: string | null;
      dataSeguimento?: string | null;
      oportunidade?: Partial<Opportunity> | null;
      tarefa?: Partial<Task> | null;
    }) => {
      const uid = await utilizadorActual();
      const { data: chamada, error } = await supabase
        .from("interactions")
        .insert({
          ...entrada.interacao,
          realizada_por: entrada.interacao.realizada_por ?? uid,
          ocorreu_em: entrada.interacao.ocorreu_em ?? new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;

      await supabase
        .from("businesses")
        .update({
          estado: entrada.novoEstado,
          ultima_interacao: chamada.ocorreu_em,
          contactado_por: uid,
          proxima_acao: entrada.proximaAccao ?? undefined,
          data_seguimento: entrada.dataSeguimento ?? undefined,
        })
        .eq("id", entrada.interacao.business_id);

      if (entrada.oportunidade) {
        const { error: eOp } = await supabase.from("opportunities").insert({
          ...entrada.oportunidade,
          business_id: entrada.interacao.business_id,
          interaction_id: chamada.id,
          criado_por: uid,
        });
        if (eOp) throw eOp;
      }

      if (entrada.tarefa) {
        const { error: eT } = await supabase.from("tasks").insert({
          titulo: entrada.tarefa.titulo ?? "Seguimento",
          ...entrada.tarefa,
          business_id: entrada.interacao.business_id,
          criado_por: uid,
          responsavel: entrada.tarefa.responsavel ?? uid,
        });
        if (eT) throw eT;
      }

      await registarActividade({
        business_id: entrada.interacao.business_id,
        entidade: "chamada",
        entidade_id: chamada.id,
        accao: "registou uma chamada",
        detalhe: entrada.interacao.resultado ?? null,
      });

      return chamada;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Chamada registada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ------------------------------- TAREFAS ------------------------------ */

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("data_hora", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useGuardarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (valores: Partial<Task> & { titulo: string; id?: string }) => {
      const uid = await utilizadorActual();
      if (valores.id) {
        const { id, ...resto } = valores;
        const { error } = await supabase.from("tasks").update(resto).eq("id", id);
        if (error) throw error;
        await registarActividade({
          business_id: valores.business_id ?? null,
          entidade: "tarefa",
          entidade_id: id,
          accao: "atualizou uma tarefa",
          detalhe: valores.titulo,
        });
        return id;
      }
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...valores, criado_por: uid, responsavel: valores.responsavel ?? uid })
        .select()
        .single();
      if (error) throw error;
      await registarActividade({
        business_id: valores.business_id ?? null,
        entidade: "tarefa",
        entidade_id: data.id,
        accao: "criou uma tarefa",
        detalhe: valores.titulo,
      });
      return data.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Tarefa guardada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAlternarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tarefa: Task) => {
      const concluir = tarefa.estado !== "concluida";
      const { error } = await supabase
        .from("tasks")
        .update({
          estado: concluir ? "concluida" : "pendente",
          concluida_em: concluir ? new Date().toISOString() : null,
        })
        .eq("id", tarefa.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useApagarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa apagada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* --------------------------- OPORTUNIDADES ---------------------------- */

export function useOpportunities(businessId?: string) {
  return useQuery({
    queryKey: ["opportunities", businessId ?? "todas"],
    queryFn: async (): Promise<Opportunity[]> => {
      let q = supabase.from("opportunities").select("*").order("created_at", { ascending: false });
      if (businessId) q = q.eq("business_id", businessId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ------------------------------ HISTÓRICO ----------------------------- */

export function useActivity(businessId?: string) {
  return useQuery({
    queryKey: ["activity", businessId ?? "tudo"],
    queryFn: async () => {
      let q = supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (businessId) q = q.eq("business_id", businessId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* --------------------------- MODELOS DE EMAIL -------------------------- */

export function useEmailTemplates() {
  return useQuery({
    queryKey: ["email_templates"],
    queryFn: async (): Promise<EmailTemplate[]> => {
      const { data, error } = await supabase.from("email_templates").select("*").order("nome");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useGuardarModelo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: { id: string; nome: string; assunto: string; corpo: string }) => {
      const { error } = await supabase
        .from("email_templates")
        .update({ nome: m.nome, assunto: m.assunto, corpo: m.corpo })
        .eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email_templates"] });
      toast.success("Modelo guardado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ------------------------------ PROJETOS ------------------------------ */

export function useProjects(apenasVisiveis = false) {
  return useQuery({
    queryKey: ["projects", apenasVisiveis],
    queryFn: async (): Promise<Project[]> => {
      let q = supabase
        .from("projects")
        .select("*")
        .order("destaque", { ascending: false })
        .order("atualizado_em", { ascending: false });
      if (apenasVisiveis) q = q.eq("visivel", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useActualizarProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, valores }: { id: string; valores: Partial<Project> }) => {
      const { error } = await supabase.from("projects").update(valores).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

/* -------------------------- PEDIDOS DO SITE --------------------------- */

export function useWebsiteRequests() {
  return useQuery({
    queryKey: ["website_requests"],
    queryFn: async (): Promise<WebsiteRequest[]> => {
      const { data, error } = await supabase
        .from("website_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useActualizarPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, valores }: { id: string; valores: Partial<WebsiteRequest> }) => {
      const { error } = await supabase.from("website_requests").update(valores).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["website_requests"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useApagarPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("website_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["website_requests"] });
      toast.success("Pedido removido.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* -------------------------------- EQUIPA ------------------------------ */

export type TeamInvite = Database["public"]["Tables"]["team_invites"]["Row"];

export function useConvites() {
  return useQuery({
    queryKey: ["team_invites"],
    queryFn: async (): Promise<TeamInvite[]> => {
      const { data, error } = await supabase
        .from("team_invites")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useConvidarMembro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      const uid = await utilizadorActual();
      const { error } = await supabase
        .from("team_invites")
        .upsert(
          { email: email.trim().toLowerCase(), role, convidado_por: uid, aceite_em: null },
          { onConflict: "email" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team_invites"] });
      toast.success("Convite criado. A pessoa só precisa de criar conta com este email.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAnularConvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_invites").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team_invites"] });
      toast.success("Convite anulado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemoverMembro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const resultado = await removerMembro({ data: { userId } });
      return resultado;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      qc.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Colaborador removido.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAlterarFuncao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) =>
      alterarFuncao({ data: { userId, role } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Função atualizada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ------------------- FICHEIROS DE PROJETO (.rar) ---------------------- */

export type BusinessFile = Database["public"]["Tables"]["business_files"]["Row"];

export const LIMITE_FICHEIRO = 300 * 1024 * 1024;

export function useBusinessFiles(businessId?: string) {
  return useQuery({
    queryKey: ["business_files", businessId ?? "todos"],
    queryFn: async (): Promise<BusinessFile[]> => {
      let q = supabase.from("business_files").select("*").order("created_at", { ascending: false });
      if (businessId) q = q.eq("business_id", businessId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCarregarFicheiro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entrada: {
      businessId: string;
      ficheiro: File;
      versao?: string | null;
      notas?: string | null;
    }) => {
      const { ficheiro } = entrada;
      if (ficheiro.size > LIMITE_FICHEIRO) throw new Error("O ficheiro excede os 300 MB.");
      const uid = await utilizadorActual();
      const caminho = `${entrada.businessId}/${Date.now()}-${ficheiro.name.replace(/[^\w.\-]+/g, "_")}`;
      const { error: eUp } = await supabase.storage
        .from("projetos")
        .upload(caminho, ficheiro, { upsert: false });
      if (eUp) throw eUp;
      const { error } = await supabase.from("business_files").insert({
        business_id: entrada.businessId,
        nome: ficheiro.name,
        caminho,
        tamanho: ficheiro.size,
        versao: entrada.versao ?? null,
        notas: entrada.notas ?? null,
        carregado_por: uid,
      });
      if (error) throw error;
      await registarActividade({
        business_id: entrada.businessId,
        entidade: "ficheiro",
        accao: "carregou um arquivo do projeto",
        detalhe: ficheiro.name,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business_files"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
      toast.success("Arquivo carregado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useApagarFicheiro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (f: BusinessFile) => {
      await supabase.storage.from("projetos").remove([f.caminho]);
      const { error } = await supabase.from("business_files").delete().eq("id", f.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business_files"] });
      toast.success("Arquivo removido.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export async function urlDescarregarFicheiro(caminho: string) {
  const { data, error } = await supabase.storage.from("projetos").createSignedUrl(caminho, 60 * 10, {
    download: true,
  });
  if (error) throw error;
  return data.signedUrl;
}
