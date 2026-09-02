import type { Database } from "@/integrations/supabase/types";

export type BusinessStatus = Database["public"]["Enums"]["business_status"];
export type Prioridade = Database["public"]["Enums"]["prioridade"];
export type CallOutcome = Database["public"]["Enums"]["call_outcome"];
export type TaskType = Database["public"]["Enums"]["task_type"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export type Business = Database["public"]["Tables"]["businesses"]["Row"];
export type Interaction = Database["public"]["Tables"]["interactions"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type EmailTemplate = Database["public"]["Tables"]["email_templates"]["Row"];
export type WebsiteRequest = Database["public"]["Tables"]["website_requests"]["Row"];

export type Tone = "primary" | "success" | "warning" | "info" | "danger" | "muted";

export const toneChip: Record<Tone, string> = {
  primary: "tone-primary",
  success: "tone-success",
  warning: "tone-warning",
  info: "tone-info",
  danger: "tone-danger",
  muted: "tone-muted",
};

export const toneDot: Record<Tone, string> = {
  primary: "dot-primary",
  success: "dot-success",
  warning: "dot-warning",
  info: "dot-info",
  danger: "dot-danger",
  muted: "dot-muted",
};

export const ESTADOS: { value: BusinessStatus; label: string; tone: Tone }[] = [
  { value: "por_contactar", label: "Leads / Potenciais Clientes", tone: "primary" },
  { value: "tentativa_contacto", label: "Primeiro Contacto", tone: "muted" },
  { value: "aguardar_resposta", label: "Reunião Agendada", tone: "warning" },
  { value: "email_por_enviar", label: "Proposta em Análise", tone: "danger" },
  { value: "email_enviado", label: "Desenvolvimento / Produção", tone: "info" },
  { value: "seguimento", label: "Revisão com o Cliente", tone: "warning" },
  { value: "interessado", label: "Interessado", tone: "success" },
  { value: "reuniao", label: "Reunião", tone: "info" },
  { value: "proposta_enviada", label: "Proposta enviada", tone: "info" },
  { value: "em_negociacao", label: "Em negociação", tone: "warning" },
  { value: "aceite", label: "Aceite", tone: "success" },
  { value: "concluido", label: "Site Publicado / Fechado", tone: "success" },
  { value: "nao_interessado", label: "Não interessado", tone: "muted" },
  { value: "arquivado", label: "Arquivado", tone: "muted" },
];

export const estadoInfo = (estado: BusinessStatus) =>
  ESTADOS.find((e) => e.value === estado) ?? ESTADOS[0]!;

export const PRIORIDADES: { value: Prioridade; label: string; tone: Tone }[] = [
  { value: "alta", label: "Alta", tone: "danger" },
  { value: "media", label: "Média", tone: "warning" },
  { value: "baixa", label: "Baixa", tone: "muted" },
];

export const prioridadeInfo = (p: Prioridade) =>
  PRIORIDADES.find((x) => x.value === p) ?? PRIORIDADES[1]!;

export const RESULTADOS: {
  value: CallOutcome;
  label: string;
  tone: Tone;
  estado?: BusinessStatus;
}[] = [
  { value: "nao_atendeu", label: "Não atendeu", tone: "muted", estado: "tentativa_contacto" },
  { value: "numero_nao_atribuido", label: "Número não atribuído", tone: "muted", estado: "arquivado" },
  { value: "numero_errado", label: "Número errado", tone: "muted", estado: "tentativa_contacto" },
  { value: "nao_quis", label: "Não quis", tone: "danger", estado: "nao_interessado" },
  { value: "interessado", label: "Interessado", tone: "success", estado: "interessado" },
  { value: "pediu_email", label: "Pediu email", tone: "info", estado: "email_por_enviar" },
  { value: "pediu_portefolio", label: "Pediu portefólio", tone: "info", estado: "email_por_enviar" },
  { value: "pediu_orcamento", label: "Pediu orçamento", tone: "info", estado: "em_negociacao" },
  { value: "pediu_reuniao", label: "Pediu reunião online", tone: "info", estado: "reuniao" },
  { value: "voltar_a_ligar", label: "Voltar a ligar", tone: "warning", estado: "seguimento" },
  { value: "ferias", label: "Está de férias", tone: "warning", estado: "seguimento" },
  { value: "falar_superiores", label: "Vai falar com os superiores", tone: "warning", estado: "aguardar_resposta" },
  { value: "ja_contactado", label: "Já tinha sido contactado", tone: "muted", estado: "arquivado" },
  { value: "email_enviado", label: "Email enviado", tone: "info", estado: "email_enviado" },
  { value: "negocio_fechado", label: "Negócio fechado", tone: "success", estado: "aceite" },
  { value: "arquivado", label: "Arquivado", tone: "muted", estado: "arquivado" },
];

export const resultadoInfo = (r: CallOutcome | null) =>
  RESULTADOS.find((x) => x.value === r);

export const TIPOS_TAREFA: { value: TaskType; label: string }[] = [
  { value: "ligar", label: "Ligar" },
  { value: "enviar_email", label: "Enviar email" },
  { value: "enviar_portefolio", label: "Enviar portefólio" },
  { value: "preparar_orcamento", label: "Preparar orçamento" },
  { value: "seguimento", label: "Fazer seguimento" },
  { value: "marcar_reuniao", label: "Marcar reunião online" },
  { value: "entregar_projeto", label: "Entregar projeto" },
  { value: "outro", label: "Outro" },
];

export const tipoTarefaLabel = (t: TaskType) =>
  TIPOS_TAREFA.find((x) => x.value === t)?.label ?? "Outro";

/* ---------- utilitários ---------- */

export function iniciais(nome?: string | null) {
  if (!nome) return "??";
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase() || "??";
}

export function dominio(website?: string | null) {
  if (!website) return null;
  try {
    const url = website.startsWith("http") ? website : `https://${website}`;
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return website.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]!.toLowerCase();
  }
}

export function normalizaTelefone(tel?: string | null) {
  if (!tel) return null;
  const d = tel.replace(/\D/g, "");
  return d.length >= 9 ? d.slice(-9) : d || null;
}

export function formatarData(valor?: string | null, comHora = false) {
  if (!valor) return "—";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(comHora ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function formatarHora(valor?: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

export function euros(valor?: number | null) {
  if (valor === null || valor === undefined) return "—";
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(valor);
}

export function paraInputDateTime(valor?: string | null) {
  if (!valor) return "";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function deInputDateTime(valor: string) {
  return valor ? new Date(valor).toISOString() : null;
}

export function saudacao() {
  const h = new Date().getHours();
  if (h < 13) return "Bom dia";
  if (h < 20) return "Boa tarde";
  return "Boa noite";
}

export function dataExtenso(d = new Date()) {
  const texto = d.toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Deteta possíveis duplicados por nome, telefone, email ou domínio. */
export function encontrarDuplicados(
  alvo: {
    id?: string;
    nome?: string | null;
    telefone?: string | null;
    email?: string | null;
    website?: string | null;
  },
  lista: Business[],
) {
  const nome = alvo.nome?.trim().toLowerCase();
  const tel = normalizaTelefone(alvo.telefone);
  const email = alvo.email?.trim().toLowerCase();
  const dom = dominio(alvo.website);
  if (!nome && !tel && !email && !dom) return [];
  return lista.filter((b) => {
    if (alvo.id && b.id === alvo.id) return false;
    if (nome && b.nome.trim().toLowerCase() === nome) return true;
    if (tel && normalizaTelefone(b.telefone) === tel) return true;
    if (email && b.email && b.email.trim().toLowerCase() === email) return true;
    if (dom && dominio(b.website) === dom) return true;
    return false;
  });
}

export function preencherModelo(
  texto: string,
  dados: Record<string, string | null | undefined>,
) {
  return texto.replace(/{{\s*(\w+)\s*}}/g, (_, chave: string) => dados[chave] ?? `{{${chave}}}`);
}
