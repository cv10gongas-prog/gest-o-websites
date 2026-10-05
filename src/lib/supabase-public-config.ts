/**
 * Resolve as credenciais PÚBLICAS do Supabase de forma idêntica no browser e no servidor.
 * Prioridade: valores VITE_* injetados no build (iguais aos do frontend) e só depois
 * variáveis SUPABASE_* do runtime. Assim, as Server Functions nunca apontam para um
 * projeto diferente do frontend por causa de variáveis antigas no servidor.
 */
export function resolveSupabasePublicConfig(): { url?: string; publishableKey?: string } {
  const env = typeof process !== "undefined" ? process.env : ({} as Record<string, string>);
  return {
    url: import.meta.env["VITE_SUPABASE_URL"] || env["VITE_SUPABASE_URL"] || env["SUPABASE_URL"],
    publishableKey:
      import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
      env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
      env["SUPABASE_PUBLISHABLE_KEY"],
  };
}

/** Apenas o hostname (ex.: xxxx.supabase.co) — seguro para logs, sem chaves. */
export function supabaseProjectHost(): string {
  const { url } = resolveSupabasePublicConfig();
  try {
    return url ? new URL(url).host : "(sem URL)";
  } catch {
    return "(URL inválido)";
  }
}
