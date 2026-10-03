import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import {
  ORCAMENTO_VALUES,
  TIPO_VALUES,
  type Locale,
} from "@/lib/i18n";

// Rate limiting in-memory map (IP -> timestamps array)
const ipSubmissions = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  if (!ip || ip === "desconhecido") return false;
  const now = Date.now();
  const timestamps = (ipSubmissions.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  if (timestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    return true;
  }
  timestamps.push(now);
  ipSubmissions.set(ip, timestamps);
  return false;
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return withProtocol.replace(/"/g, "&quot;");
}

function getClientIp(request: Request | undefined): string {
  if (!request) return "desconhecido";
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "desconhecido";
  }
  return request.headers.get("x-real-ip") ?? "desconhecido";
}

const LOCALE_LABELS: Record<Locale, string> = {
  pt: "Português (/contacto)",
  en: "Inglês (/en/contact)",
  de: "Alemão (/de/contact)",
  fr: "Francês (/fr/contact)",
  es: "Espanhol (/es/contact)",
};

export const contactFormSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(120),
  empresa: z.string().trim().max(120).optional().nullable(),
  email: z.string().trim().email("Email inválido").max(255),
  telefone: z.string().trim().max(50).optional().nullable(),
  tipoIndex: z.number().int().min(0).max(10).default(0),
  orcamentoIndex: z.number().int().min(0).max(10).default(0),
  websiteAtual: z.string().trim().max(255).optional().nullable(),
  prazoTexto: z.string().trim().max(100).optional().nullable(),
  mensagemOriginal: z.string().trim().max(5000).optional().nullable(),
  querReuniao: z.boolean().default(false),
  locale: z.enum(["pt", "en", "de", "fr", "es"]).default("pt"),
  honeypot: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export function buildContactNotificationHtml(data: {
  id: string;
  nome: string;
  empresa?: string | null;
  email: string;
  telefone?: string | null;
  tipoProjeto: string;
  orcamento: string;
  websiteAtual?: string | null;
  prazoTexto?: string | null;
  mensagemOriginal?: string | null;
  querReuniao: boolean;
  locale: Locale;
  createdAt: string;
}): string {
  const safeNome = escapeHtml(data.nome);
  const safeEmpresa = escapeHtml(data.empresa) || "<em>Não indicada</em>";
  const safeEmail = escapeHtml(data.email);
  const safeTelefone = data.telefone
    ? `<a href="tel:${escapeHtml(data.telefone)}" style="color:#2dd4bf;text-decoration:none;">${escapeHtml(data.telefone)}</a>`
    : "<em>Não indicado</em>";
  const safeTipo = escapeHtml(data.tipoProjeto);
  const safeOrcamento = escapeHtml(data.orcamento);
  const safeWebsiteUrl = sanitizeUrl(data.websiteAtual);
  const safeWebsite = safeWebsiteUrl
    ? `<a href="${safeWebsiteUrl}" target="_blank" rel="noopener noreferrer" style="color:#2dd4bf;text-decoration:underline;">${escapeHtml(data.websiteAtual)}</a>`
    : "<em>Nenhum</em>";
  const safePrazo = escapeHtml(data.prazoTexto) || "<em>Não especificado</em>";
  const safeMensagem = escapeHtml(data.mensagemOriginal);
  const safeIdioma = escapeHtml(LOCALE_LABELS[data.locale] ?? data.locale);

  const crmUrl = "https://www.novawebstudio.pt/pedidos";

  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo pedido de orçamento — ${safeNome}</title>
</head>
<body style="margin:0;padding:0;background-color:#07101c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;line-height:1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#07101c;padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background-color:#0e1927;border:1px solid #1f2e42;border-radius:16px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">

          <!-- HEADER -->
          <tr>
            <td style="padding:32px 32px 24px 32px;border-bottom:1px solid #1f2e42;background:linear-gradient(135deg,rgba(45,212,191,0.12) 0%,rgba(14,25,39,0) 100%);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#2dd4bf;margin-bottom:8px;">
                      Nova Web Studio · Gestão
                    </span>
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.2;">
                      Novo Pedido de Orçamento
                    </h1>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <span style="display:inline-block;padding:4px 10px;background-color:#162638;border:1px solid #2a3e56;border-radius:20px;font-size:11px;color:#94a3b8;white-space:nowrap;">
                      ${escapeHtml(data.createdAt)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HIGHLIGHT HERO BANNER -->
          <tr>
            <td style="padding:24px 32px 12px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#132032;border:1px solid #22354d;border-radius:12px;padding:16px 20px;">
                <tr>
                  <td>
                    <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Cliente</div>
                    <div style="font-size:18px;font-weight:700;color:#ffffff;">${safeNome}</div>
                    ${
                      data.empresa
                        ? `<div style="font-size:13px;color:#2dd4bf;margin-top:2px;">${escapeHtml(data.empresa)}</div>`
                        : ""
                    }
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    ${
                      data.querReuniao
                        ? `<span style="display:inline-block;padding:6px 14px;background-color:rgba(16,185,129,0.18);border:1px solid #10b981;border-radius:20px;font-size:12px;font-weight:600;color:#34d399;">
                            🗓️ Reunião Solicitada
                          </span>`
                        : `<span style="display:inline-block;padding:6px 14px;background-color:#162638;border:1px solid #2a3e56;border-radius:20px;font-size:12px;color:#94a3b8;">
                            Sem Reunião
                          </span>`
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- STRUCTURED DETAILS TABLE -->
          <tr>
            <td style="padding:12px 32px 20px 32px;">
              <h2 style="margin:0 0 12px 0;font-size:13px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">
                Dados do Pedido
              </h2>
              <table width="100%" cellpadding="8" cellspacing="0" border="0" style="background-color:#0b1522;border:1px solid #1a2a3e;border-radius:10px;font-size:13px;">
                <tr style="border-bottom:1px solid #152232;">
                  <td width="38%" style="color:#94a3b8;font-weight:500;border-bottom:1px solid #152232;">E-mail:</td>
                  <td style="color:#ffffff;border-bottom:1px solid #152232;">
                    <a href="mailto:${safeEmail}" style="color:#2dd4bf;text-decoration:none;font-weight:600;">${safeEmail}</a>
                  </td>
                </tr>
                <tr style="border-bottom:1px solid #152232;">
                  <td style="color:#94a3b8;font-weight:500;border-bottom:1px solid #152232;">Telefone:</td>
                  <td style="color:#ffffff;border-bottom:1px solid #152232;">${safeTelefone}</td>
                </tr>
                <tr style="border-bottom:1px solid #152232;">
                  <td style="color:#94a3b8;font-weight:500;border-bottom:1px solid #152232;">Tipo de Projeto:</td>
                  <td style="color:#ffffff;font-weight:600;border-bottom:1px solid #152232;">${safeTipo}</td>
                </tr>
                <tr style="border-bottom:1px solid #152232;">
                  <td style="color:#94a3b8;font-weight:500;border-bottom:1px solid #152232;">Orçamento Previsto:</td>
                  <td style="color:#ffffff;border-bottom:1px solid #152232;">${safeOrcamento}</td>
                </tr>
                <tr style="border-bottom:1px solid #152232;">
                  <td style="color:#94a3b8;font-weight:500;border-bottom:1px solid #152232;">Website Atual:</td>
                  <td style="color:#ffffff;border-bottom:1px solid #152232;">${safeWebsite}</td>
                </tr>
                <tr style="border-bottom:1px solid #152232;">
                  <td style="color:#94a3b8;font-weight:500;border-bottom:1px solid #152232;">Prazo Desejado:</td>
                  <td style="color:#ffffff;border-bottom:1px solid #152232;">${safePrazo}</td>
                </tr>
                <tr>
                  <td style="color:#94a3b8;font-weight:500;">Página de Origem:</td>
                  <td style="color:#cbd5e1;">${safeIdioma}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CLIENT MESSAGE SECTION -->
          ${
            data.mensagemOriginal
              ? `<tr>
            <td style="padding:4px 32px 24px 32px;">
              <h2 style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">
                Mensagem do Cliente
              </h2>
              <div style="background-color:#07101c;border-left:3px solid #2dd4bf;border-radius:8px;padding:16px 20px;font-size:13px;color:#e2e8f0;white-space:pre-wrap;line-height:1.6;font-family:inherit;">
                ${safeMensagem}
              </div>
            </td>
          </tr>`
              : ""
          }

          <!-- ACTION BUTTON (CTA) -->
          <tr>
            <td align="center" style="padding:12px 32px 32px 32px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color:#2dd4bf;border-radius:10px;">
                    <a href="${crmUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#042f2e;text-decoration:none;border-radius:10px;">
                      Abrir Pedidos na Gestão →
                    </a>
                  </td>
                </tr>
              </table>
              <div style="margin-top:12px;font-size:11px;color:#64748b;">
                Podes responder diretamente a este email para falar com <strong>${safeNome}</strong>.
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #1f2e42;background-color:#0a1320;font-size:11px;color:#64748b;text-align:center;">
              <div>Nova Web Studio · Notificação Automática de Pedido de Contacto</div>
              <div style="margin-top:4px;">ID do Pedido: <code style="color:#94a3b8;font-size:10px;">${escapeHtml(data.id)}</code></div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildContactNotificationPlainText(data: {
  id: string;
  nome: string;
  empresa?: string | null;
  email: string;
  telefone?: string | null;
  tipoProjeto: string;
  orcamento: string;
  websiteAtual?: string | null;
  prazoTexto?: string | null;
  mensagemOriginal?: string | null;
  querReuniao: boolean;
  locale: Locale;
  createdAt: string;
}): string {
  return `NOVO PEDIDO DE ORÇAMENTO — NOVA WEB STUDIO
Data: ${data.createdAt}
ID: ${data.id}

==================================================
DADOS DO CLIENTE
==================================================
Nome: ${data.nome}
Empresa: ${data.empresa || "Não indicada"}
Email: ${data.email}
Telefone: ${data.telefone || "Não indicado"}
Tipo de Projeto: ${data.tipoProjeto}
Orçamento: ${data.orcamento}
Website Atual: ${data.websiteAtual || "Nenhum"}
Prazo Desejado: ${data.prazoTexto || "Não especificado"}
Quer Reunião Inicial: ${data.querReuniao ? "SIM" : "Não"}
Origem: ${LOCALE_LABELS[data.locale] ?? data.locale}

==================================================
MENSAGEM
==================================================
${data.mensagemOriginal || "(Sem mensagem adicional)"}

==================================================
Gestão / CRM: https://www.novawebstudio.pt/pedidos
(Responda diretamente a este email para responder ao cliente)
`;
}

async function dispatchNotificationEmail(payload: {
  id: string;
  nome: string;
  empresa?: string | null;
  email: string;
  telefone?: string | null;
  tipoProjeto: string;
  orcamento: string;
  websiteAtual?: string | null;
  prazoTexto?: string | null;
  mensagemOriginal?: string | null;
  querReuniao: boolean;
  locale: Locale;
  createdAt: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.NOTIFICATION_EMAIL_TO || "geral@novawebstudio.pt";
  const fromEmail =
    process.env.NOTIFICATION_EMAIL_FROM ||
    "Nova Web Studio <notificacoes@novawebstudio.pt>";

  if (!apiKey) {
    console.warn(
      `[Notificações] RESEND_API_KEY não está configurada no servidor. Notificação por email para pedido ${payload.id} não enviada.`,
    );
    return {
      ok: false,
      error: "RESEND_API_KEY not configured",
    };
  }

  const subject = `Novo pedido de orçamento — ${payload.nome}`;
  const html = buildContactNotificationHtml(payload);
  const text = buildContactNotificationPlainText(payload);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: payload.email,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Notificações] Falha ao enviar email via Resend (${response.status}):`,
        errorText,
      );
      return { ok: false, error: `Resend API HTTP ${response.status}` };
    }

    const resData = (await response.json()) as { id?: string };
    console.log(
      `[Notificações] Email enviado com sucesso para ${toEmail}. Resend ID: ${resData.id ?? "ok"}`,
    );
    return { ok: true };
  } catch (err) {
    console.error("[Notificações] Exceção no envio de email:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

/**
 * Server function to securely validate, persist contact request in Supabase,
 * and dispatch email notification to geral@novawebstudio.pt.
 */
export const submeterPedidoContacto = createServerFn({ method: "POST" })
  .validator((data: unknown) => contactFormSchema.parse(data))
  .handler(async ({ data }) => {
    // 1. Honeypot check for spam bots
    if (data.honeypot && data.honeypot.trim().length > 0) {
      console.warn("[Anti-Spam] Honeypot preenchido. Descartando submissão silenciosamente.");
      return { ok: true, id: "discarded" };
    }

    // 2. IP Rate Limiting
    const request = getRequest();
    const clientIp = getClientIp(request);
    if (isRateLimited(clientIp)) {
      console.warn(`[Anti-Spam] Limite de submissões excedido para o IP ${clientIp}.`);
      throw new Error("Demasiadas tentativas de envio. Por favor aguarde alguns minutos.");
    }

    // 3. Resolve canonical values
    const tipoProjeto =
      TIPO_VALUES[data.tipoIndex] ?? TIPO_VALUES[0];
    const orcamento =
      ORCAMENTO_VALUES[data.orcamentoIndex] ?? ORCAMENTO_VALUES[0];

    // 4. Build CRM internal composite message
    const detalhesLinhas = [
      data.websiteAtual
        ? `Website atual: ${data.websiteAtual}`
        : null,
      data.prazoTexto
        ? `Prazo desejado: ${data.prazoTexto}`
        : null,
      "Origem: Website público",
    ]
      .filter(Boolean)
      .join("\n");

    const mensagemComposta = [
      data.mensagemOriginal || null,
      detalhesLinhas || null,
    ]
      .filter(Boolean)
      .join("\n\n");

    // 5. Persist to Supabase Database (Guaranteed lead retention)
    const leadId = crypto.randomUUID();
    const now = new Date();
    const nowIso = now.toISOString();

    const insertPayload = {
      id: leadId,
      nome: data.nome,
      empresa: data.empresa || null,
      email: data.email,
      telefone: data.telefone || null,
      tipo_projeto: tipoProjeto,
      orcamento: orcamento,
      mensagem: mensagemComposta || null,
      quer_reuniao: data.querReuniao,
      created_at: nowIso,
    };

    let dbError: unknown = null;

    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_URL) {
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const res = await supabaseAdmin
          .from("website_requests")
          .insert(insertPayload);
        dbError = res.error;
      } else {
        const { supabase } = await import("@/integrations/supabase/client");
        const res = await supabase
          .from("website_requests")
          .insert(insertPayload);
        dbError = res.error;
      }
    } catch (insertException) {
      dbError = insertException;
    }

    if (dbError) {
      console.error("[Contacto] Erro ao gravar pedido na base de dados:", dbError);
      throw new Error("Não foi possível registar o pedido na base de dados. Tente novamente.");
    }

    // 6. Format timestamp in Portuguese standard
    const createdAtFormatted = new Intl.DateTimeFormat("pt-PT", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Europe/Lisbon",
    }).format(now);

    // 7. Dispatch Notification Email (Fail-safe: does not fail the lead if email dispatch fails)
    try {
      await dispatchNotificationEmail({
        id: leadId,
        nome: data.nome,
        empresa: data.empresa,
        email: data.email,
        telefone: data.telefone,
        tipoProjeto,
        orcamento,
        websiteAtual: data.websiteAtual,
        prazoTexto: data.prazoTexto,
        mensagemOriginal: data.mensagemOriginal,
        querReuniao: data.querReuniao,
        locale: data.locale,
        createdAt: createdAtFormatted,
      });
    } catch (emailErr) {
      console.error(
        `[Notificações] Erro não-bloqueante no envio de notificação para pedido ${leadId}:`,
        emailErr,
      );
    }

    return { ok: true, id: leadId };
  });
