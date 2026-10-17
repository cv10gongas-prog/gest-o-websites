import { Link, createFileRoute } from "@tanstack/react-router";
import { ClipboardCopy, ExternalLink, Eye, FileCode2, Mail, Monitor, Save, Smartphone, Sparkles, Building2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useActualizarNegocio, useAlternarTarefa, useBusinesses, useCriarNegocio, useEmailTemplates, useGuardarModelo, useGuardarTarefa, useTasks } from "@/lib/queries";
import { corresponderNegocio, existeTarefaProposta } from "@/lib/commercial-v35";
import { deInputDateTime } from "@/lib/crm";
import { useUtilizador } from "@/hooks/useAuth";
import { gerarEmailHtml, modeloAssunto, type ModeloComercial } from "@/lib/email-studio";
import { lerContextoProposta, limparContextoProposta, type OrigemPropostaNWS } from "@/lib/commercial-handoff";

export const Route = createFileRoute("/_authenticated/emails")({
  validateSearch: (value: Record<string, unknown>) => ({
    negocio: typeof value.negocio === "string" ? value.negocio.slice(0, 80) : undefined,
    origem: value.origem === "lead" || value.origem === "auditoria" ? value.origem : undefined,
  }),
  head: () => ({ meta: [{ title: "NWS Email Studio — Nova Web Studio" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: Emails,
});
const campo = "min-h-11 w-full rounded-xl border border-border/70 bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40";

function Emails() {
  const { negocio: negocioInicial, origem } = Route.useSearch();
  const [contexto, setContexto] = useState(() => origem
    ? lerContextoProposta(origem as OrigemPropostaNWS) : null);
  const primeiraMudanca = useRef(true);
  const preservarConteudoAoAssociar = useRef(false);
  useEffect(() => { if (contexto) limparContextoProposta(); }, []);
  const { data: negocios = [] } = useBusinesses();
  const { data: modelos = [] } = useEmailTemplates();
  const { perfil } = useUtilizador();
  const guardar = useGuardarModelo();
  const criarNegocio = useCriarNegocio();
  const actualizarNegocio = useActualizarNegocio();
  const criarTarefa = useGuardarTarefa();
  const alternarTarefa = useAlternarTarefa();
  const { data: tarefas = [] } = useTasks();
  const [dataSeguimento, setDataSeguimento] = useState("");
  const [negocioId, setNegocioId] = useState(negocioInicial ?? "");
  const [tipo, setTipo] = useState<ModeloComercial>(contexto?.tipo ?? "website");
  const [pessoa, setPessoa] = useState("");
  const [detalhe, setDetalhe] = useState(contexto?.detalhe ?? "");
  const [assunto, setAssunto] = useState("");
  const [htmlManual, setHtmlManual] = useState<string | null>(null);
  const [vista, setVista] = useState<"desktop" | "mobile">("desktop");
  const [avancado, setAvancado] = useState(false);
  const [modeloId, setModeloId] = useState("");
  const negocio = negocios.find(n => n.id === negocioId);
  const semelhantes = useMemo(() => contexto ? corresponderNegocio(contexto, negocios) : [], [contexto, negocios]);
  const nomeSelecionado = negocio?.nome ?? contexto?.nome ?? "";
  const emailSelecionado = negocio?.email ?? contexto?.email ?? "";
  const gerado = useMemo(() => gerarEmailHtml({ nomeNegocio: nomeSelecionado, pessoa: pessoa || negocio?.pessoa_contacto || "", detalhe, remetente: perfil?.nome ?? "Gonçalo Jorge", tipo }), [nomeSelecionado, negocio?.pessoa_contacto, pessoa, detalhe, perfil?.nome, tipo]);
  const html = htmlManual ?? gerado;
  const assuntoFinal = assunto.trim() || modeloAssunto(tipo, nomeSelecionado);
  const tarefaExistente = negocio && tarefas.find(t => t.business_id === negocio.id && t.estado === "pendente"
    && t.tipo === "enviar_email" && (t.notas || "").includes(`Assunto: ${assuntoFinal.slice(0,160)}`));
  async function associarContextoCrm() {
    if (!contexto || criarNegocio.isPending) return;
    if (semelhantes.length) { toast.error("Já existe uma possível ficha do mesmo negócio. Abre ou seleciona a ficha existente."); return; }
    if (!window.confirm(`Adicionar «${contexto.nome}» ao CRM? Confirma primeiro se os contactos públicos estão corretos.`)) return;
    try {
      const novo = await criarNegocio.mutateAsync({
        nome: contexto.nome, email: contexto.email, telefone: contexto.telefone ?? null,
        website: contexto.website, localidade: contexto.localidade ?? null,
        origem: contexto.origem === "auditoria" ? "website_analyzer" : "lead_finder",
        estado: "por_contactar", prioridade: "media",
        notas: `Origem: ${contexto.origem === "auditoria" ? "Website Analyzer" : "Lead Finder"}. Dados públicos por confirmar antes do contacto.`,
      });
      preservarConteudoAoAssociar.current = true;
      setNegocioId(novo.id);
      setContexto(null);
      toast.success("Ficha criada e associada ao Email Studio.");
    } catch { /* mutation já comunica o erro */ }
  }
  async function guardarPropostaComoTarefa() {
    if (!negocio || criarTarefa.isPending) return;
    if (existeTarefaProposta(tarefas, negocio.id, assuntoFinal)) {
      toast.info("Já existe uma tarefa de envio desta proposta no CRM."); return;
    }
    try {
      await criarTarefa.mutateAsync({
        business_id: negocio.id, titulo: `Enviar proposta · ${negocio.nome}`.slice(0,180),
        tipo: "enviar_email", prioridade: negocio.prioridade, estado: "pendente",
        notas: [`Assunto: ${assuntoFinal.slice(0,160)}`, `Modelo: ${tipo}`,
          detalhe.trim() ? `Observação verificada: ${detalhe.trim().slice(0,420)}` : "",
          "Proposta preparada no Email Studio, ainda NÃO enviada."].filter(Boolean).join("\n"),
      });
      toast.info("Proposta guardada como tarefa pendente. O HTML continua no Email Studio; não foi enviado.");
    } catch { /* mutation já comunica o erro */ }
  }
  async function confirmarEnvioManual() {
    if (!negocio || actualizarNegocio.isPending || alternarTarefa.isPending) return;
    if (!window.confirm(`Confirmas que já enviaste realmente esta proposta a «${negocio.nome}» no Gmail?\n\nEste botão NÃO envia emails.`)) return;
    try {
      const proximaData = dataSeguimento ? deInputDateTime(dataSeguimento) : undefined;
      await actualizarNegocio.mutateAsync({
        id: negocio.id, valores: {
          estado: "proposta_enviada",
          ...(proximaData ? {data_seguimento: proximaData, proxima_acao: "Voltar a contactar após envio da proposta"} : {}),
        }, descricao: `confirmou o envio manual de uma proposta: ${assuntoFinal.slice(0,140)}`,
      });
      // A proposta preparada deixa de estar pendente quando o utilizador confirma o envio.
      if (tarefaExistente) {
        try { await alternarTarefa.mutateAsync(tarefaExistente); }
        catch { toast.warning("Envio registado, mas a tarefa antiga não foi concluída. Confirma na Agenda."); }
      }
      toast.success("Envio confirmado e registado no CRM. O Gmail não foi alterado.");
    } catch { /* mutation já comunica o erro */ }
  }
  useEffect(() => {
    if (primeiraMudanca.current) { primeiraMudanca.current = false; return; }
    if (preservarConteudoAoAssociar.current) { preservarConteudoAoAssociar.current = false; return; }
    setPessoa("");setDetalhe("");setAssunto("");setHtmlManual(null);
  }, [negocioId]);
  useEffect(() => {setAssunto("");setHtmlManual(null);}, [tipo]);
  async function copiarFormatado() {
    try {
      if (typeof ClipboardItem === "undefined" || !navigator.clipboard.write) throw new Error("Este navegador não permite cópia HTML avançada. Abre no Chrome/Edge em HTTPS.");
      const texto = new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";
      await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([texto], { type: "text/plain" }) })]);
      toast.success("Email formatado copiado. Cola com Ctrl+V no Gmail.");
    } catch (e) {toast.error(e instanceof Error ? e.message : "Não foi possível copiar o email.");}
  }
  function abrirGmail() {
    const to = emailSelecionado;
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(assuntoFinal)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.info("No Gmail, cola o email formatado com Ctrl+V. Não é enviado automaticamente.");
  }
  async function copiarHtml() {
    try {await navigator.clipboard.writeText(html);toast.success("Código HTML copiado.");}
    catch {toast.error("Não foi possível copiar o código HTML.");}
  }
  function carregarModelo(id: string) {
    setModeloId(id);
    const m = modelos.find(x => x.id === id);
    if (!m) {setHtmlManual(null);return;}
    setAssunto(m.assunto);
    if (/<\s*(?:html|table|div|p|body)\b/i.test(m.corpo)) setHtmlManual(m.corpo);
    else { setHtmlManual(gerado);toast.info("Modelo antigo em texto: foi carregado o novo layout HTML. Revê-o antes de guardar."); }
  }
  return <main className="mx-auto max-w-[1400px] space-y-5 pb-10">
    <section className="relative overflow-hidden rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-500/15 via-surface/80 to-cyan-500/5 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-300"><Sparkles className="size-4"/> NWS Intelligence V3.5</p><h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Email Studio</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Propostas HTML com identidade NWS e personalização por negócio. Cria, pré-visualiza e copia para o Gmail — o envio fica sempre nas tuas mãos.</p></div><span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-200">Sem envio automático</span></div>
    </section>
    <div className="grid gap-2 sm:grid-cols-3" aria-label="Etapas de preparação de email">
      {[{n: "01", titulo: "Escolher negócio", desc: "CRM ou Lead Finder"}, {n: "02", titulo: "Personalizar", desc: "Só factos confirmados"}, {n: "03", titulo: "Rever e copiar", desc: "Envio manual no Gmail"}].map((item)=> <div key={item.n} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/40 px-4 py-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-xs font-black text-violet-200">{item.n}</span><div><p className="text-xs font-bold">{item.titulo}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{item.desc}</p></div></div>)}
    </div>
    <div className="grid min-w-0 gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
      <section className="min-w-0 space-y-4 rounded-3xl border border-border/70 bg-surface/60 p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold"><Mail className="size-4 text-violet-300"/> Preparar proposta</h2>
        {contexto && !negocio && <div className="rounded-2xl border border-violet-400/35 bg-violet-500/10 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-[10px] font-extrabold uppercase tracking-widest text-violet-300">{contexto.origem === "auditoria" ? "Importado da auditoria" : "Importado do Lead Finder"}</p><h3 className="mt-1 text-sm font-extrabold">{contexto.nome}</h3><p className="mt-1 break-all text-xs text-muted-foreground">{contexto.email || "Email não identificado"}{contexto.website ? ` · ${contexto.website}` : ""}</p></div><button type="button" className="rounded-lg border border-border/70 px-2 py-1.5 text-[11px] text-muted-foreground hover:text-foreground" onClick={()=>{setContexto(null);setDetalhe("");setAssunto("");setHtmlManual(null);}}>Limpar</button></div>
          <p className="mt-3 text-xs leading-5 text-amber-200/90">Dados públicos ainda por confirmar. Antes de contactar, associa a uma ficha do CRM.</p>
          {semelhantes.length > 0 ? <div className="mt-3 space-y-2"><p className="text-xs font-bold text-amber-200"><AlertTriangle className="mr-1 inline size-3.5"/> Possível duplicado: não cries outra ficha.</p>{semelhantes.slice(0,4).map(n => <div key={n.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300/25 px-3 py-2"><span className="text-xs font-semibold">{n.nome}</span><button type="button" onClick={()=>{preservarConteudoAoAssociar.current = true;setContexto(null);setNegocioId(n.id);}} className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white">Usar ficha</button></div>)}</div>
          : <button type="button" disabled={criarNegocio.isPending} onClick={()=>void associarContextoCrm()} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-violet-400/35 px-3 text-xs font-bold text-violet-200 disabled:opacity-40"><Building2 className="size-4"/> {criarNegocio.isPending?"A guardar…":"Adicionar negócio ao CRM"}</button>}

        </div>}
        <label className="block space-y-2 text-xs font-semibold">Tipo de email<select className={campo} value={tipo} onChange={e=>setTipo(e.target.value as ModeloComercial)}><option value="website">Novo website</option><option value="modernizacao">Modernização de website</option><option value="restaurante">NWS Restaurantes</option></select></label>
        <label className="block space-y-2 text-xs font-semibold">Negócio do CRM<select className={campo} value={negocioId} onChange={e=>{setContexto(null);setNegocioId(e.target.value);setPessoa("");setDetalhe("");setAssunto("");setHtmlManual(null);}}><option value="">{contexto ? "Usar negócio externo acima" : "Sem negócio selecionado"}</option>{negocios.map(n=><option key={n.id} value={n.id}>{n.nome}</option>)}</select></label>
        <label className="block space-y-2 text-xs font-semibold">Nome da pessoa de contacto<input className={campo} value={pessoa} onChange={e=>setPessoa(e.target.value)} placeholder="Se desconhecido, será 'equipa'"/></label>
        <label className="block space-y-2 text-xs font-semibold">Detalhe verificado sobre o negócio<textarea className={`${campo} min-h-24 resize-y`} value={detalhe} onChange={e=>setDetalhe(e.target.value)} placeholder="Ex.: a vossa presença em Cascais (apenas informação verdadeira)"/><span className="block font-normal text-muted-foreground">Não inventar problemas técnicos nem prometer resultados sem evidências.</span></label>
        <label className="block space-y-2 text-xs font-semibold">Assunto<input className={campo} value={assunto} onChange={e=>setAssunto(e.target.value)} placeholder={modeloAssunto(tipo, nomeSelecionado)}/></label>
        <div className="rounded-xl border border-border/70 bg-background/40 p-3 text-xs"><p className="font-bold">Destinatário no Gmail</p><p className="mt-1 break-all text-muted-foreground">{emailSelecionado || "Sem email público identificado — confirma e preenche manualmente no Gmail"}</p><p className="mt-1 text-[11px] text-muted-foreground">O botão Gmail apenas abre um rascunho. Nunca envia automaticamente.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={()=>void copiarFormatado()} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 text-xs font-bold text-white hover:bg-violet-500"><ClipboardCopy className="size-4"/> Copiar formatado</button><button type="button" onClick={abrirGmail} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border/70 px-3 text-xs font-bold hover:border-violet-400/50"><ExternalLink className="size-4"/> Gmail</button></div>
        <div className="rounded-2xl border border-violet-400/25 bg-violet-500/5 p-4 space-y-3">
          <div><h3 className="text-sm font-extrabold">Acompanhamento no CRM</h3><p className="mt-1 text-xs text-muted-foreground">Guardar um plano de envio não significa que enviaste o email. Para registar envio, confirma-o depois de o fazeres no Gmail.</p></div>
          {negocio ? <><Link to="/negocios/$id" params={{id:negocio.id}} className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-200 hover:underline"><Building2 className="size-4"/> Abrir ficha de {negocio.nome}</Link>
            <button type="button" disabled={criarTarefa.isPending || Boolean(tarefaExistente)} onClick={()=>void guardarPropostaComoTarefa()} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-border/70 px-3 text-xs font-bold hover:border-violet-400/50 disabled:opacity-50"><Save className="size-4"/> {tarefaExistente ? "Tarefa de proposta já guardada" : "Guardar proposta como tarefa"}</button>
            <label className="block space-y-1.5 text-xs font-semibold">Data opcional para voltar a contactar<input type="datetime-local" className={campo} value={dataSeguimento} onChange={e=>setDataSeguimento(e.target.value)}/></label>
            <button type="button" disabled={actualizarNegocio.isPending || alternarTarefa.isPending} onClick={()=>void confirmarEnvioManual()} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700/80 px-3 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"><CheckCircle2 className="size-4"/> Confirmar envio já efetuado no Gmail</button>
          </> : <p className="rounded-lg border border-amber-400/20 bg-amber-500/5 p-3 text-xs text-amber-200">Para acompanhar esta proposta no CRM, seleciona um negócio ou adiciona a ficha acima.</p>}
        </div>
        <details className="rounded-2xl border border-border/70 p-3"><summary className="cursor-pointer text-xs font-bold">Guardar ou carregar modelo existente</summary><div className="mt-3 space-y-3"><select className={campo} value={modeloId} onChange={e=>carregarModelo(e.target.value)}><option value="">Selecionar modelo do CRM</option>{modelos.map(m=><option key={m.id} value={m.id}>{m.nome}</option>)}</select><button type="button" disabled={!modeloId||guardar.isPending} onClick={()=>guardar.mutate({id:modeloId,nome:modelos.find(m=>m.id===modeloId)?.nome??"Modelo NWS",assunto:assuntoFinal,corpo:html})} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-violet-400/40 text-xs font-bold text-violet-200 disabled:opacity-40"><Save className="size-4"/> Guardar HTML neste modelo</button><p className="text-xs text-muted-foreground">Atenção: substitui o conteúdo do modelo selecionado. Protegido por PIN se o tiveres ativado.</p></div></details>
        <details open={avancado} onToggle={e=>setAvancado(e.currentTarget.open)} className="rounded-2xl border border-border/70 p-3"><summary className="flex cursor-pointer items-center gap-2 text-xs font-bold"><FileCode2 className="size-4"/> Código HTML avançado</summary><textarea aria-label="Código HTML do email" spellCheck={false} value={html} onChange={e=>setHtmlManual(e.target.value)} className={`${campo} mt-3 min-h-52 font-mono text-xs`}/><div className="mt-2 flex flex-wrap gap-2"><button type="button" className="rounded-lg border border-border/70 px-3 py-2 text-xs" onClick={()=>setHtmlManual(null)}>Repor design</button><button type="button" className="rounded-lg border border-border/70 px-3 py-2 text-xs" onClick={()=>void copiarHtml()}>Copiar código</button></div><p className="mt-2 text-xs text-muted-foreground">A pré-visualização é isolada, sem execução de scripts. Evita HTML e links de origem desconhecida.</p></details>
      </section>
      <section className="min-w-0 space-y-4 rounded-3xl border border-border/70 bg-surface/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-sm font-bold"><Eye className="size-4 text-violet-300"/> Pré-visualização do email</h2><div className="flex gap-2"><button type="button" onClick={()=>setVista("desktop")} className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs ${vista==="desktop"?"bg-violet-600/20 text-violet-200":"text-muted-foreground"}`}><Monitor className="size-4"/> Desktop</button><button type="button" onClick={()=>setVista("mobile")} className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs ${vista==="mobile"?"bg-violet-600/20 text-violet-200":"text-muted-foreground"}`}><Smartphone className="size-4"/> Mobile</button></div></div>
        <div className="rounded-xl border border-border/60 p-3 text-xs text-muted-foreground"><p><strong>De:</strong> Gonçalo Jorge &lt;goncalojorge@novawebstudio.pt&gt;</p><p className="mt-1"><strong>Para:</strong> {emailSelecionado || "Não identificado — preencher no Gmail"}</p><p className="mt-1 break-words"><strong>Assunto:</strong> {assuntoFinal}</p></div>
        <div className="overflow-x-auto rounded-xl bg-[#eff0f7] p-3 sm:p-5"><iframe title="Pré-visualização isolada do email HTML" sandbox="" referrerPolicy="no-referrer" srcDoc={html} className="mx-auto block min-h-[700px] border-0 bg-white" style={{ width: vista==="mobile"?"375px":"100%",maxWidth:vista==="mobile"?"375px":"100%" }}/></div>
        <p className="text-xs leading-5 text-muted-foreground">Copia o email formatado e cola-o no Gmail (Ctrl+V). A cópia HTML funciona em contexto seguro (HTTPS/localhost); não envia mensagens automaticamente. Confirma a logo e os links num email de teste.</p>
      </section>
    </div>
  </main>;
}
