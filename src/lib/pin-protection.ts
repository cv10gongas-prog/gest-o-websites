import { supabase } from "@/integrations/supabase/client";
import { isDemoMode } from "@/lib/demo-mode";

export type OperacaoProtegida = "INSERT" | "UPDATE" | "DELETE";
export type TabelaProtegida = "businesses" | "tasks" | "projects" | "email_templates";
export type EstadoPin = { available: boolean; enabled: boolean; configured: boolean; blockedUntil: string | null };

// As funções RPC são acrescentadas pela migração opcional; ainda não aparecem nos tipos gerados.
const rpc = supabase.rpc.bind(supabase) as unknown as (
  name: string, args?: Record<string, string | null>,
) => Promise<{ data: unknown; error: { code?: string; message: string } | null }>;

function migracaoAusente(erro: { code?: string; message: string }) {
  return erro.code === "PGRST202" || /could not find the function|schema cache/i.test(erro.message);
}

export async function estadoProtecaoPin(): Promise<EstadoPin> {
  if (isDemoMode()) return { available: false, enabled: false, configured: false, blockedUntil: null };
  const { data, error } = await rpc("nws_pin_status");
  if (error) {
    if (migracaoAusente(error)) return { available: false, enabled: false, configured: false, blockedUntil: null };
    throw new Error(`Não foi possível confirmar a proteção por PIN: ${error.message}`);
  }
  const payload = (data ?? {}) as Partial<EstadoPin>;
  return { available: true, enabled: Boolean(payload.enabled), configured: Boolean(payload.configured), blockedUntil: payload.blockedUntil ?? null };
}

export async function definirPin(pin: string, anterior: string | null) {
  const { data, error } = await rpc("nws_pin_set", { p_pin: pin, p_previous: anterior });
  if (error) throw new Error(error.message);
  return data === true;
}
export async function desativarPin(pin: string) {
  const { data, error } = await rpc("nws_pin_disable", { p_pin: pin });
  if (error) throw new Error(error.message);
  return data === true;
}
export async function validarPin(pin: string, tabela: TabelaProtegida, operacao: OperacaoProtegida) {
  const { data, error } = await rpc("nws_pin_authorize", { p_pin: pin, p_table: tabela, p_operation: operacao });
  if (error) throw new Error(error.message);
  return data === true;
}

/** Solicita confirmação antes de cada escrita coberta por trigger SQL. */
export async function autorizarOperacaoPin(tabela: TabelaProtegida, operacao: OperacaoProtegida, descricao: string) {
  const estado = await estadoProtecaoPin();
  if (!estado.enabled) return; // Migração ausente ou proteção desativada: não bloquear o CRM antigo.
  if (typeof window === "undefined") throw new Error("Confirmação de PIN indisponível neste ambiente.");
  const confirmado = await new Promise<boolean>((resolve) => {
    window.dispatchEvent(new CustomEvent("nws:pin-request", { detail: { tabela, operacao, descricao, resolve } }));
  });
  if (!confirmado) throw new Error("Operação cancelada. Não foi efetuada nenhuma alteração.");
}
