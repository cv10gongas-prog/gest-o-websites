import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { dict, ORCAMENTO_VALUES, TIPO_VALUES, type Locale } from "@/lib/i18n";

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

type ContactGuardResult = {
  allowed: boolean;
  duplicate: boolean;
  ip_limited: boolean;
  email_limited: boolean;
};

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
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/"/g, "&quot;");
}

function getClientIp(request: Request | undefined): string {
  if (!request) return "desconhecido";
  // 1. Trusted Vercel Edge header (injected by Vercel edge infrastructure)
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    return vercelForwarded.split(",")[0]?.trim() || "desconhecido";
  }
  // 2. Real IP header from edge / proxy
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  // 3. Standard forwarded-for header (first IP in list)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "desconhecido";
  }
  return "desconhecido";
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

/* ========================================================================= */
/* 1. NOTIFICAÇÃO ADMINISTRATIVA (Target: geral@novawebstudio.pt)             */
/* ========================================================================= */

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
    process.env.NOTIFICATION_EMAIL_FROM || "Nova Web Studio <notificacoes@notify.novawebstudio.pt>";

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
        `[Notificações] Falha ao enviar notificação interna via Resend (${response.status}):`,
        errorText,
      );
      return { ok: false, error: `Resend API HTTP ${response.status}` };
    }

    const resData = (await response.json()) as { id?: string };
    console.log(
      `[Notificações] Notificação interna enviada com sucesso para ${toEmail}. Resend ID: ${resData.id ?? "ok"}`,
    );
    return { ok: true };
  } catch (err) {
    console.error("[Notificações] Exceção no envio da notificação interna:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

/* ========================================================================= */
/* 2. CONFIRMAÇÃO PARA O CLIENTE (Target: payload.email)                     */
/* ========================================================================= */

export const CLIENT_CONFIRMATION_I18N = {
  pt: {
    subject: "Recebemos o seu pedido — Nova Web Studio",
    headerBadge: "Confirmação de Pedido",
    greeting: (nome: string) => `Olá, ${nome}.`,
    thankYou:
      "Obrigado pelo seu contacto com a Nova Web Studio. Registámos com sucesso o seu pedido de orçamento.",
    nextStep:
      "A nossa equipa irá analisar as informações que nos enviou e entrar em contacto consigo dentro de 24 horas úteis para apresentar os próximos passos e esclarecer qualquer dúvida.",
    summaryTitle: "Resumo do seu pedido",
    labels: {
      nome: "Nome",
      empresa: "Empresa",
      email: "E-mail",
      telefone: "Telefone",
      tipoProjeto: "Tipo de projeto",
      orcamento: "Orçamento previsto",
      websiteAtual: "Website atual",
      prazo: "Prazo pretendido",
      reuniao: "Reunião inicial",
      reuniaoSim: "Sim, solicitou agendamento",
      reuniaoNao: "Não solicitada",
      mensagem: "Mensagem enviada",
      naoIndicado: "Não indicada",
      nenhum: "Nenhum",
    },
    replyNotice:
      "Caso pretenda acrescentar alguma informação, enviar ficheiros ou referências, basta responder diretamente a este e-mail.",
    signoff: "Com os melhores cumprimentos,",
    team: "Equipa Nova Web Studio",
    footerText: "Nova Web Studio · Cascais, Lisboa, Portugal",
  },
  en: {
    subject: "We received your request — Nova Web Studio",
    headerBadge: "Request Confirmation",
    greeting: (nome: string) => `Hello, ${nome}.`,
    thankYou:
      "Thank you for reaching out to Nova Web Studio. We have successfully received your quote request.",
    nextStep:
      "Our team will review your project details and get back to you within 24 business hours to discuss next steps and answer any questions.",
    summaryTitle: "Summary of your request",
    labels: {
      nome: "Name",
      empresa: "Company",
      email: "Email",
      telefone: "Phone",
      tipoProjeto: "Project type",
      orcamento: "Expected budget",
      websiteAtual: "Current website",
      prazo: "Preferred timeline",
      reuniao: "Introductory meeting",
      reuniaoSim: "Yes, meeting requested",
      reuniaoNao: "Not requested",
      mensagem: "Sent message",
      naoIndicado: "Not specified",
      nenhum: "None",
    },
    replyNotice:
      "If you wish to add further details, share files or references, simply reply directly to this email.",
    signoff: "Best regards,",
    team: "Nova Web Studio Team",
    footerText: "Nova Web Studio · Cascais, Lisbon, Portugal",
  },
  de: {
    subject: "Wir haben Ihre Anfrage erhalten — Nova Web Studio",
    headerBadge: "Anfragebestätigung",
    greeting: (nome: string) => `Hallo ${nome},`,
    thankYou:
      "Vielen Dank für Ihre Kontaktaufnahme mit Nova Web Studio. Wir haben Ihre Angebotsanfrage erfolgreich erhalten.",
    nextStep:
      "Unser Team prüft Ihre Angaben und wird sich innerhalb von 24 Werktagsstunden bei Ihnen melden, um die nächsten Schritte zu besprechen.",
    summaryTitle: "Zusammenfassung Ihrer Anfrage",
    labels: {
      nome: "Name",
      empresa: "Unternehmen",
      email: "E-Mail",
      telefone: "Telefon",
      tipoProjeto: "Projektart",
      orcamento: "Geplantes Budget",
      websiteAtual: "Aktuelle Website",
      prazo: "Gewünschter Zeitraum",
      reuniao: "Erstgespräch",
      reuniaoSim: "Ja, Gespräch gewünscht",
      reuniaoNao: "Nicht gewünscht",
      mensagem: "Gesendete Nachricht",
      naoIndicado: "Nicht angegeben",
      nenhum: "Keine",
    },
    replyNotice:
      "Falls Sie zusätzliche Informationen, Dateien oder Beispiele ergänzen möchten, antworten Sie einfach direkt auf diese E-Mail.",
    signoff: "Mit freundlichen Grüßen,",
    team: "Ihr Team von Nova Web Studio",
    footerText: "Nova Web Studio · Cascais, Lissabon, Portugal",
  },
  fr: {
    subject: "Nous avons bien reçu votre demande — Nova Web Studio",
    headerBadge: "Confirmation de demande",
    greeting: (nome: string) => `Bonjour ${nome},`,
    thankYou:
      "Merci d'avoir contacté Nova Web Studio. Nous confirmons la bonne réception de votre demande de devis.",
    nextStep:
      "Notre équipe va étudier votre projet et vous recontacter sous 24 heures ouvrables pour vous présenter les prochaines étapes.",
    summaryTitle: "Récapitulatif de votre demande",
    labels: {
      nome: "Nom",
      empresa: "Entreprise",
      email: "E-mail",
      telefone: "Téléphone",
      tipoProjeto: "Type de projet",
      orcamento: "Budget prévu",
      websiteAtual: "Site actuel",
      prazo: "Délai souhaité",
      reuniao: "Rendez-vous de présentation",
      reuniaoSim: "Oui, rendez-vous demandé",
      reuniaoNao: "Non demandé",
      mensagem: "Message envoyé",
      naoIndicado: "Non spécifié",
      nenhum: "Aucun",
    },
    replyNotice:
      "Si vous souhaitez ajouter des détails, nous transmettre des documents ou des exemples, vous pouvez répondre directement à cet e-mail.",
    signoff: "Cordialement,",
    team: "L'équipe Nova Web Studio",
    footerText: "Nova Web Studio · Cascais, Lisbonne, Portugal",
  },
  es: {
    subject: "Hemos recibido tu solicitud — Nova Web Studio",
    headerBadge: "Confirmación de Solicitud",
    greeting: (nome: string) => `Hola, ${nome}.`,
    thankYou:
      "Gracias por contactar con Nova Web Studio. Hemos registrado tu solicitud de presupuesto con éxito.",
    nextStep:
      "Nuestro equipo revisará los detalles de tu proyecto y se pondrá en contacto contigo en un plazo de 24 horas laborables para orientarte sobre los siguientes pasos.",
    summaryTitle: "Resumen de tu solicitud",
    labels: {
      nome: "Nombre",
      empresa: "Empresa",
      email: "Email",
      telefone: "Teléfono",
      tipoProjeto: "Tipo de proyecto",
      orcamento: "Presupuesto previsto",
      websiteAtual: "Web actual",
      prazo: "Plazo deseado",
      reuniao: "Reunión de presentación",
      reuniaoSim: "Sí, reunión solicitada",
      reuniaoNao: "No solicitada",
      mensagem: "Mensaje enviado",
      naoIndicado: "No especificada",
      nenhum: "Ninguno",
    },
    replyNotice:
      "Si deseas añadir más información, compartir archivos o referencias, solo tienes que responder directamente a este correo.",
    signoff: "Un cordial saludo,",
    team: "Equipo de Nova Web Studio",
    footerText: "Nova Web Studio · Cascais, Lisboa, Portugal",
  },
};

export function buildClientConfirmationHtml(data: {
  nome: string;
  empresa?: string | null;
  email: string;
  telefone?: string | null;
  tipoIndex: number;
  orcamentoIndex: number;
  websiteAtual?: string | null;
  prazoTexto?: string | null;
  mensagemOriginal?: string | null;
  querReuniao: boolean;
  locale: Locale;
  createdAt: string;
}): string {
  const i18n = CLIENT_CONFIRMATION_I18N[data.locale] ?? CLIENT_CONFIRMATION_I18N.pt;
  const safeNome = escapeHtml(data.nome);
  const safeEmpresa = escapeHtml(data.empresa) || `<em>${escapeHtml(i18n.labels.naoIndicado)}</em>`;
  const safeEmail = escapeHtml(data.email);
  const safeTelefone = data.telefone
    ? `<span style="color:#ffffff;">${escapeHtml(data.telefone)}</span>`
    : `<em>${escapeHtml(i18n.labels.naoIndicado)}</em>`;

  const tipoLabel =
    dict[data.locale]?.contact?.tipos?.[data.tipoIndex] ??
    TIPO_VALUES[data.tipoIndex] ??
    TIPO_VALUES[0];
  const safeTipo = escapeHtml(tipoLabel);

  const orcamentoLabel =
    dict[data.locale]?.contact?.orcamentos?.[data.orcamentoIndex] ??
    ORCAMENTO_VALUES[data.orcamentoIndex] ??
    ORCAMENTO_VALUES[0];
  const safeOrcamento = escapeHtml(orcamentoLabel);

  const safeWebsiteUrl = sanitizeUrl(data.websiteAtual);
  const safeWebsite = safeWebsiteUrl
    ? `<a href="${safeWebsiteUrl}" target="_blank" rel="noopener noreferrer" style="color:#2dd4bf;text-decoration:underline;">${escapeHtml(data.websiteAtual)}</a>`
    : `<em>${escapeHtml(i18n.labels.nenhum)}</em>`;

  const safePrazo =
    escapeHtml(data.prazoTexto) || `<em>${escapeHtml(i18n.labels.naoIndicado)}</em>`;
  const safeMensagem = escapeHtml(data.mensagemOriginal);

  return `<!DOCTYPE html>
<html lang="${data.locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(i18n.subject)}</title>
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
                      NOVA WEB STUDIO
                    </span>
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.2;">
                      ${escapeHtml(i18n.headerBadge)}
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

          <!-- GREETING & CONFIRMATION MESSAGE -->
          <tr>
            <td style="padding:28px 32px 16px 32px;">
              <div style="font-size:16px;font-weight:600;color:#ffffff;margin-bottom:12px;">
                ${escapeHtml(i18n.greeting(data.nome))}
              </div>
              <p style="margin:0 0 12px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">
                ${escapeHtml(i18n.thankYou)}
              </p>
              <p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.6;">
                ${escapeHtml(i18n.nextStep)}
              </p>
            </td>
          </tr>

          <!-- SUMMARY SECTION -->
          <tr>
            <td style="padding:12px 32px 20px 32px;">
              <h2 style="margin:0 0 12px 0;font-size:13px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">
                ${escapeHtml(i18n.summaryTitle)}
              </h2>
              <table width="100%" cellpadding="8" cellspacing="0" border="0" style="background-color:#0b1522;border:1px solid #1a2a3e;border-radius:10px;font-size:13px;">
                <tr style="border-bottom:1px solid #152232;">
                  <td width="38%" style="color:#94a3b8;font-weight:500;border-bottom:1px solid #152232;">${escapeHtml(i18n.labels.tipoProjeto)}:</td>
                  <td style="color:#ffffff;font-weight:600;border-bottom:1px solid #152232;">${safeTipo}</td>
                </tr>
                <tr style="border-bottom:1px solid #152232;">
                  <td style="color:#94a3b8;font-weight:500;border-bottom:1px solid #152232;">${escapeHtml(i18n.labels.orcamento)}:</td>
                  <td style="color:#ffffff;border-bottom:1px solid #152232;">${safeOrcamento}</td>
                </tr>
                <tr style="border-bottom:1px solid #152232;">
                  <td style="color:#94a3b8;font-weight:500;border-bottom:1px solid #152232;">${escapeHtml(i18n.labels.email)}:</td>
                  <td style="color:#ffffff;border-bottom:1px solid #152232;">${safeEmail}</td>
                </tr>
                <tr style="border-bottom:1px solid #152232;">
                  <td style="color:#94a3b8;font-weight:500;border-bottom:1px solid #152232;">${escapeHtml(i18n.labels.telefone)}:</td>
                  <td style="color:#ffffff;border-bottom:1px solid #152232;">${safeTelefone}</td>
                </tr>
                <tr style="border-bottom:1px solid #152232;">
                  <td style="color:#94a3b8;font-weight:500;border-bottom:1px solid #152232;">${escapeHtml(i18n.labels.empresa)}:</td>
                  <td style="color:#ffffff;border-bottom:1px solid #152232;">${safeEmpresa}</td>
                </tr>
                <tr style="border-bottom:1px solid #152232;">
                  <td style="color:#94a3b8;font-weight:500;border-bottom:1px solid #152232;">${escapeHtml(i18n.labels.websiteAtual)}:</td>
                  <td style="color:#ffffff;border-bottom:1px solid #152232;">${safeWebsite}</td>
                </tr>
                <tr style="border-bottom:1px solid #152232;">
                  <td style="color:#94a3b8;font-weight:500;border-bottom:1px solid #152232;">${escapeHtml(i18n.labels.prazo)}:</td>
                  <td style="color:#ffffff;border-bottom:1px solid #152232;">${safePrazo}</td>
                </tr>
                <tr>
                  <td style="color:#94a3b8;font-weight:500;">${escapeHtml(i18n.labels.reuniao)}:</td>
                  <td style="color:#ffffff;">
                    ${
                      data.querReuniao
                        ? `<span style="color:#34d399;font-weight:600;">✓ ${escapeHtml(i18n.labels.reuniaoSim)}</span>`
                        : `<span style="color:#94a3b8;">${escapeHtml(i18n.labels.reuniaoNao)}</span>`
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CLIENT MESSAGE -->
          ${
            data.mensagemOriginal
              ? `<tr>
            <td style="padding:4px 32px 20px 32px;">
              <h2 style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">
                ${escapeHtml(i18n.labels.mensagem)}
              </h2>
              <div style="background-color:#07101c;border-left:3px solid #2dd4bf;border-radius:8px;padding:16px 20px;font-size:13px;color:#e2e8f0;white-space:pre-wrap;line-height:1.6;font-family:inherit;">
                ${safeMensagem}
              </div>
            </td>
          </tr>`
              : ""
          }

          <!-- REPLY INSTRUCTIONS & SIGNOFF -->
          <tr>
            <td style="padding:12px 32px 28px 32px;">
              <div style="background-color:#101d2d;border:1px solid #1f3248;border-radius:10px;padding:16px 20px;font-size:13px;color:#94a3b8;line-height:1.6;margin-bottom:20px;">
                💡 ${escapeHtml(i18n.replyNotice)}
              </div>
              <div style="font-size:13px;color:#cbd5e1;line-height:1.5;">
                <div>${escapeHtml(i18n.signoff)}</div>
                <div style="font-weight:700;color:#2dd4bf;margin-top:2px;">${escapeHtml(i18n.team)}</div>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #1f2e42;background-color:#0a1320;font-size:11px;color:#64748b;text-align:center;">
              <div>${escapeHtml(i18n.footerText)}</div>
              <div style="margin-top:4px;">
                <a href="https://www.novawebstudio.pt" target="_blank" rel="noopener noreferrer" style="color:#94a3b8;text-decoration:none;">https://www.novawebstudio.pt</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildClientConfirmationPlainText(data: {
  nome: string;
  empresa?: string | null;
  email: string;
  telefone?: string | null;
  tipoIndex: number;
  orcamentoIndex: number;
  websiteAtual?: string | null;
  prazoTexto?: string | null;
  mensagemOriginal?: string | null;
  querReuniao: boolean;
  locale: Locale;
  createdAt: string;
}): string {
  const i18n = CLIENT_CONFIRMATION_I18N[data.locale] ?? CLIENT_CONFIRMATION_I18N.pt;
  const tipoLabel =
    dict[data.locale]?.contact?.tipos?.[data.tipoIndex] ??
    TIPO_VALUES[data.tipoIndex] ??
    TIPO_VALUES[0];
  const orcamentoLabel =
    dict[data.locale]?.contact?.orcamentos?.[data.orcamentoIndex] ??
    ORCAMENTO_VALUES[data.orcamentoIndex] ??
    ORCAMENTO_VALUES[0];

  return `${i18n.subject}
Data: ${data.createdAt}

${i18n.greeting(data.nome)}

${i18n.thankYou}
${i18n.nextStep}

==================================================
${i18n.summaryTitle.toUpperCase()}
==================================================
${i18n.labels.tipoProjeto}: ${tipoLabel}
${i18n.labels.orcamento}: ${orcamentoLabel}
${i18n.labels.email}: ${data.email}
${i18n.labels.telefone}: ${data.telefone || i18n.labels.naoIndicado}
${i18n.labels.empresa}: ${data.empresa || i18n.labels.naoIndicado}
${i18n.labels.websiteAtual}: ${data.websiteAtual || i18n.labels.nenhum}
${i18n.labels.prazo}: ${data.prazoTexto || i18n.labels.naoIndicado}
${i18n.labels.reuniao}: ${data.querReuniao ? i18n.labels.reuniaoSim : i18n.labels.reuniaoNao}

${
  data.mensagemOriginal
    ? `==================================================\n${i18n.labels.mensagem.toUpperCase()}\n==================================================\n${data.mensagemOriginal}\n`
    : ""
}
==================================================
${i18n.replyNotice}

${i18n.signoff}
${i18n.team}
https://www.novawebstudio.pt
`;
}

async function dispatchClientConfirmationEmail(payload: {
  nome: string;
  empresa?: string | null;
  email: string;
  telefone?: string | null;
  tipoIndex: number;
  orcamentoIndex: number;
  websiteAtual?: string | null;
  prazoTexto?: string | null;
  mensagemOriginal?: string | null;
  querReuniao: boolean;
  locale: Locale;
  createdAt: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.NOTIFICATION_EMAIL_FROM || "Nova Web Studio <notificacoes@notify.novawebstudio.pt>";
  const replyToEmail = "geral@novawebstudio.pt";

  if (!apiKey) {
    console.warn(
      `[Notificações] RESEND_API_KEY não está configurada no servidor. Confirmação para o cliente ${payload.email} não enviada.`,
    );
    return {
      ok: false,
      error: "RESEND_API_KEY not configured",
    };
  }

  const i18n = CLIENT_CONFIRMATION_I18N[payload.locale] ?? CLIENT_CONFIRMATION_I18N.pt;
  const subject = i18n.subject;
  const html = buildClientConfirmationHtml(payload);
  const text = buildClientConfirmationPlainText(payload);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [payload.email],
        reply_to: replyToEmail,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Notificações] Falha ao enviar confirmação ao cliente via Resend (${response.status}):`,
        errorText,
      );
      return { ok: false, error: `Resend API HTTP ${response.status}` };
    }

    const resData = (await response.json()) as { id?: string };
    console.log(
      `[Notificações] Email de confirmação enviado com sucesso para ${payload.email}. Resend ID: ${resData.id ?? "ok"}`,
    );
    return { ok: true };
  } catch (err) {
    console.error("[Notificações] Exceção no envio da confirmação ao cliente:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

/* ========================================================================= */
/* 3. SERVER FUNCTION PRINCIPAL (Submissão do Formulário)                    */
/* ========================================================================= */

/**
 * Server function to securely validate, persist contact request in Supabase,
 * dispatch team notification to geral@novawebstudio.pt and client confirmation email.
 */
export const submeterPedidoContacto = createServerFn({ method: "POST" })
  .validator((data: unknown) => contactFormSchema.parse(data))
  .handler(async ({ data }) => {
    // 1. Honeypot check for spam bots
    if (data.honeypot && data.honeypot.trim().length > 0) {
      console.warn("[Anti-Spam] Honeypot preenchido. Descartando submissão silenciosamente.");
      return { ok: true, id: "discarded" };
    }

    // 2. Resolve canonical values
    const tipoProjeto = TIPO_VALUES[data.tipoIndex] ?? TIPO_VALUES[0];
    const orcamento = ORCAMENTO_VALUES[data.orcamentoIndex] ?? ORCAMENTO_VALUES[0];

    // 3. Build CRM internal composite message
    const detalhesLinhas = [
      data.websiteAtual ? `Website atual: ${data.websiteAtual}` : null,
      data.prazoTexto ? `Prazo desejado: ${data.prazoTexto}` : null,
      "Origem: Website público",
    ]
      .filter(Boolean)
      .join("\n");

    const mensagemComposta = [data.mensagemOriginal || null, detalhesLinhas || null]
      .filter(Boolean)
      .join("\n\n");

    // 4. Persistent, atomic rate limiting + dedupe + lead insertion
    const request = getRequest();
    const clientIp = getClientIp(request);
    const normalizedEmail = data.email.trim().toLowerCase();
    const submissionFingerprint = JSON.stringify({
      ip: clientIp,
      email: normalizedEmail,
      nome: data.nome.trim(),
      empresa: data.empresa?.trim() ?? "",
      telefone: data.telefone?.trim() ?? "",
      tipoIndex: data.tipoIndex,
      orcamentoIndex: data.orcamentoIndex,
      websiteAtual: data.websiteAtual?.trim() ?? "",
      prazoTexto: data.prazoTexto?.trim() ?? "",
      mensagemOriginal: data.mensagemOriginal?.trim() ?? "",
      querReuniao: data.querReuniao,
      locale: data.locale,
    });

    const [ipHash, emailHash, dedupeKey] = await Promise.all([
      sha256(`contact-ip:${clientIp}`),
      sha256(`contact-email:${normalizedEmail}`),
      sha256(`contact-payload:${submissionFingerprint}`),
    ]);

    const leadId = crypto.randomUUID();
    const now = new Date();
    const nowIso = now.toISOString();

    let guardResult: ContactGuardResult | null = null;
    let dbError: unknown = null;

    const submissionSecret =
      process.env.CONTACT_FORM_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    try {
      const rpcArgs = {
        p_secret: submissionSecret,
        p_request_id: leadId,
        p_dedupe_key: dedupeKey,
        p_ip_hash: ipHash,
        p_email_hash: emailHash,
        p_nome: data.nome,
        p_empresa: data.empresa || null,
        p_email: normalizedEmail,
        p_telefone: data.telefone || null,
        p_tipo_projeto: tipoProjeto,
        p_orcamento: orcamento,
        p_mensagem: mensagemComposta || null,
        p_quer_reuniao: data.querReuniao,
        p_created_at: nowIso,
      };

      if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_URL) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const res = await supabaseAdmin.rpc("submit_guarded_contact_request", rpcArgs);
        guardResult = res.data?.[0] ?? null;
        dbError = res.error;
      } else {
        const { supabase } = await import("@/integrations/supabase/client");
        const res = await supabase.rpc("submit_guarded_contact_request", rpcArgs);
        guardResult = res.data?.[0] ?? null;
        dbError = res.error;
      }
    } catch (guardException) {
      dbError = guardException;
    }

    if (dbError || !guardResult) {
      console.error("[Contacto] Erro no controlo persistente da submissão:", dbError);
      throw new Error("Não foi possível registar o pedido na base de dados. Tente novamente.");
    }

    if (guardResult.duplicate) {
      console.info("[Contacto] Retry duplicado suprimido pela proteção persistente.");
      return { ok: true, id: "duplicate" };
    }

    if (guardResult.ip_limited || !guardResult.allowed) {
      console.warn(`[Anti-Spam] Limite persistente de submissões atingido para ${ipHash}.`);
      throw new Error("Demasiadas tentativas de envio. Por favor aguarde alguns minutos.");
    }

    // 5. Format timestamp in Portuguese standard
    const createdAtFormatted = new Intl.DateTimeFormat("pt-PT", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Europe/Lisbon",
    }).format(now);

    // 6. Dispatch Emails Independently (Fail-safe: does not fail the lead if email dispatch fails)
    const emailTasks: Promise<{ ok: boolean; error?: string }>[] = [
      // A. Exactly one internal notification for each accepted lead.
      dispatchNotificationEmail({
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
      }),
    ];

    if (!guardResult.email_limited) {
      // B. At most one client confirmation for this accepted lead.
      emailTasks.push(
        dispatchClientConfirmationEmail({
          nome: data.nome,
          empresa: data.empresa,
          email: normalizedEmail,
          telefone: data.telefone,
          tipoIndex: data.tipoIndex,
          orcamentoIndex: data.orcamentoIndex,
          websiteAtual: data.websiteAtual,
          prazoTexto: data.prazoTexto,
          mensagemOriginal: data.mensagemOriginal,
          querReuniao: data.querReuniao,
          locale: data.locale,
          createdAt: createdAtFormatted,
        }),
      );
    } else {
      console.warn(
        `[Anti-Abuse] Confirmação externa suprimida pelo limite persistente do destinatário ${emailHash}.`,
      );
    }

    const emailResults = await Promise.allSettled(emailTasks);
    emailResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `[Notificações] Envio ${index === 0 ? "administrativo" : "do cliente"} falhou para pedido ${leadId}:`,
          result.reason,
        );
      }
    });

    return { ok: true, id: leadId };
  });
