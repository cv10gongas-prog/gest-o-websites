import { useEffect, useRef } from "react";
import { submeterPedidoContacto } from "@/lib/contact.functions";

// Fidelidade visual: os HTML/CSS/JS aprovados correm num documento isolado,
// sem herdar os estilos Tailwind ou globais do HUB e do resto do React.
export function NwsHtmlAprovado({ ficheiro }: { ficheiro: string }) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const busy = useRef(false);
  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframe.current?.contentWindow) return;
      const msg = event.data;
      if (!msg || msg.nwsBridge !== true) return;
      if (msg.type === "scroll-top") {
        const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, left: 0, behavior: reduced ? "instant" : "smooth" });
        return;
      }
      if (msg.type === "navigate") {
        const target = String(msg.path || "");
        const parsed = new URL(target, window.location.origin);
        const routes = new Set(["/", "/portefolio", "/servicos", "/restaurantes", "/sobre", "/contacto", "/projetos/vinilart", "/projetos/vinilart-sport", "/projetos/gespool", "/projetos/31-janeiro", "/projetos/radio-alcabideche", "/projetos/rj-producoes"]);
        if (parsed.origin === location.origin && routes.has(parsed.pathname)) {
          window.location.assign(parsed.pathname + parsed.search + parsed.hash);
        }
      }
      if (msg.type !== "contact" || busy.current) return;
      const d = msg.record as Record<string,string>;
      if (!d || typeof d !== "object") return;
      busy.current = true;
      let ok = false;
      try {
        // nwsContactFullFieldsV1 — mesmos campos e mesma funcao server do formulario original.
        const intInRange = (s: string | undefined, fallback: number, max: number) => {
          const n = Number(s);
          return Number.isInteger(n) && n >= 0 && n <= max ? n : fallback;
        };
        const selectedLocale = ["pt", "en", "es", "fr", "de"].includes(d.locale)
          ? (d.locale as "pt" | "en" | "es" | "fr" | "de") : "pt";
        const rawSite = String(d.websiteAtual || "").trim();
        const websiteAtual = rawSite ? (/^https?:\/\//i.test(rawSite) ? rawSite : `https://${rawSite}`) : null;
        const result = await submeterPedidoContacto({ data: {
          nome: String(d.nome || "").trim(),
          empresa: String(d.empresa || "").trim() || null,
          email: String(d.email || "").trim(),
          telefone: String(d.telefone || "").trim() || null,
          tipoIndex: intInRange(d.tipoIndex, 1, 10),
          orcamentoIndex: intInRange(d.orcamentoIndex, 0, 10),
          websiteAtual,
          prazoTexto: String(d.prazoTexto || "").trim() || null,
          mensagemOriginal: String(d.mensagem || "").trim() || null,
          querReuniao: d.querReuniao === "true",
          locale: selectedLocale,
          honeypot: String(d.honeypot || ""),
        }});
        ok = result?.ok === true;
      } catch (error) {
        console.error("[NWS] Falha no envio do pedido", error);
      } finally {
        busy.current=false;
        iframe.current?.contentWindow?.postMessage({nwsBridge:true,type:"contact-result",ok},window.location.origin);
      }
    };
    window.addEventListener("message",onMessage);
    return () => window.removeEventListener("message",onMessage);
  },[]);
  const query=typeof window !== "undefined" ? window.location.search : "";
  return <iframe
    ref={iframe}
    title="Nova Web Studio"
    src={`/nws-html-aprovado/${ficheiro}${query}`}
    style={{display:"block",width:"100%",height:"100dvh",border:"0",background:"#080b18"}}
  />;
}
