import { useEffect } from "react";
import { submeterPedidoContacto } from "@/lib/contact.functions";
import { pages } from "./siteContent";

const scripts = ["/nws-final/app.js", "/nws-final/v3.js", "/nws-final/final.js"];

type PageProps = { path: string };

/** Esta componente só é usada nas rotas públicas PT. O HUB não importa esta folha CSS. */
export function NwsFinalPage({ path }: PageProps) {
  const current = pages[path] ?? pages["/"];

  useEffect(() => {
    const oldLang = document.documentElement.lang;
    document.documentElement.lang = "pt-PT";
    document.title = current.title;

    // O formulário do redesign usa o mesmo serviço real de contactos do projeto.
    const form = document.getElementById("lead-form") as HTMLFormElement | null;
    const onSubmit = async (event: SubmitEvent) => {
      event.preventDefault();
      if (!form || form.dataset.sending === "true") return;
      const data = new FormData(form);
      const nome = String(data.get("nome") || "").trim();
      const email = String(data.get("email") || "").trim();
      const mensagem = String(data.get("mensagem") || "").trim();
      const error = form.querySelector<HTMLElement>(".formerror");
      const status = form.querySelector<HTMLElement>(".status");
      if (nome.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || mensagem.length < 10) {
        if (error) error.textContent = "Indica o nome, um email válido e uma mensagem com pelo menos 10 caracteres.";
        return;
      }
      const value = String(data.get("tipo") || "");
      const typeIndex: Record<string,number> = {
        "Website institucional": 1,
        "Loja online": 2,
        "Modernizar o meu site": 5,
        "Solução web específica": 4,
        "Ainda não sei": 6,
      };
      const prazo = String(data.get("prazo") || "").trim();
      const objetivo = String(data.get("objetivo") || "").trim();
      if (error) error.textContent = "";
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      const originalText = button?.innerHTML;
      try {
        form.dataset.sending = "true";
        if (button) { button.disabled = true; button.textContent = "A enviar…"; }
        const result = await submeterPedidoContacto({ data: {
          nome, empresa: String(data.get("empresa") || "").trim() || null,
          email, telefone: null, tipoIndex: typeIndex[value] ?? 6,
          orcamentoIndex: 0, websiteAtual: null,
          prazoTexto: prazo || null,
          mensagemOriginal: [mensagem, objetivo ? "Objetivo: " + objetivo : ""].filter(Boolean).join("\n\n"),
          querReuniao: false, locale: "pt" as const, honeypot: undefined,
        }});
        if (!result?.ok) throw new Error("O pedido não foi confirmado pelo servidor.");
        if (status) { status.classList.add("show"); status.textContent = "Pedido enviado com sucesso. Entraremos em contacto contigo."; }
        form.reset();
      } catch (err) {
        console.error("[NWS] Erro de contacto",err);
        if (error) error.textContent = "Não foi possível enviar. Tenta novamente ou escreve para geral@novawebstudio.pt.";
      } finally {
        form.dataset.sending = "false";
        if (button) { button.disabled = false; if (originalText) button.innerHTML = originalText; }
      }
    };
    form?.addEventListener("submit", onSubmit);

    // Scripts originais da prévia para menu, filtros, animações e serviços.
    const mounted: HTMLScriptElement[] = [];
    let cancelled = false;
    const load = async () => {
      for (const source of scripts) {
        if (cancelled) return;
        const script = document.createElement("script");
        script.src = source;
        script.async = false;
        script.dataset.nwsFinal = "true";
        const loaded = new Promise<void>((resolve) => {
          script.onload = () => resolve();
          script.onerror = () => { console.warn("[NWS] Script indisponível:",source); resolve(); };
        });
        document.body.appendChild(script);
        mounted.push(script);
        await loaded;
      }
    };
    void load();
    return () => {
      cancelled = true;
      form?.removeEventListener("submit", onSubmit);
      for (const script of mounted) script.remove();
      document.documentElement.lang = oldLang;
    };
  }, [path, current.title]);

  return <div className="nws-fullsite" lang="pt-PT">
    <link rel="stylesheet" href="/nws-final/theme.css" />
    <div className={current.klass} dangerouslySetInnerHTML={{__html: current.html}} />
  </div>;
}
