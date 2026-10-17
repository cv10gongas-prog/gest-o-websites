import {
  ArrowRight, ArrowUpRight, Building2, Check, ChevronLeft, ChevronRight, CircleAlert, Copy,
  Download, ExternalLink, FilterX, Globe2, Info, Loader2, Mail,
  MapPin, Phone, Search, SlidersHorizontal, LayoutGrid, List, FileUp, X,
  UtensilsCrossed, FileSearch,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { guardarContextoProposta } from "@/lib/commercial-handoff";
import { corresponderNegocio } from "@/lib/commercial-v35";
import { toast } from "sonner";

import type { Business } from "@/lib/crm";
import { PaginacaoNWS } from "@/components/crm/PaginacaoNWS";
import { useUtilizador } from "@/hooks/useAuth";
import { useCriarNegocio } from "@/lib/queries";
import {
  CATEGORIAS_LEADS, ZONAS_LEADS,
  ErroPesquisaLeads, obterUrlOverpassTurbo, importarDadosOsmJson,
  type CategoriaLead, type LeadExterno, type LocalidadeLead,
  type PesquisaLeadsResultado,
} from "@/lib/lead-finder.functions";
import { filtrarCatalogo, validarCatalogo, type CatalogoOverture } from "@/lib/lead-finder.catalogo";
import { identificarPossivelCadeia, passaFiltroRede, type FiltroRede } from "@/lib/lead-qualification";

type Presenca = "todos" | "com" | "sem";
type Esplanada = "todos" | "com" | "sem" | "desconhecido";
type Ordenacao = "oportunidade" | "nome" | "contactos";
const STORAGE = "nws.leadfinder.overture.v6";
const TTL = 30 * 60 * 1000;
const CAMPO = "min-h-11 w-full rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-violet-400 focus-visible:ring-2 focus-visible:ring-violet-400/25";

function normalizar(s: string) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); }
function dominio(s?: string | null) {
  if (!s) return null;
  try { return new URL(s.includes("://") ? s : `https://${s}`).hostname.replace(/^www\./, ""); }
  catch { return null; }
}
function pontos(lead: LeadExterno) {
  return Number(!lead.website) * 3 + Number(Boolean(lead.email)) * 2 + Number(Boolean(lead.telefone));
}
function csvCell(s: string) {
  // Evitar interpretação como fórmula ao abrir num Excel/Sheets.
  const limpo = /^[=+@\-\t\r]/.test(s) ? `'${s}` : s;
  return `"${limpo.replace(/"/g, '""')}"`;
}
function gravarCache(resultado: PesquisaLeadsResultado) {
  try {
    const conteudo = JSON.stringify({ expira: Date.now() + TTL, resultado });
    if (conteudo.length <= 1_000_000) sessionStorage.setItem(STORAGE, conteudo);
  } catch { /* cache é opcional */ }
}
function recuperarCache(): PesquisaLeadsResultado | null {
  try {
    const raw = sessionStorage.getItem(STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { expira: number; resultado: PesquisaLeadsResultado };
    if (parsed.expira < Date.now() || !Array.isArray(parsed.resultado?.resultados)) return null;
    return parsed.resultado;
  } catch { return null; }
}

export function LeadFinderExterno({ negocios }: { negocios: Business[] }) {
  const { isAdmin } = useUtilizador();
  const navigate = useNavigate();
  const criar = useCriarNegocio();
  const [categoria, setCategoria] = useState<CategoriaLead>("restaurantes");
  const [localidade, setLocalidade] = useState<LocalidadeLead>("Cascais");
  const [raio, setRaio] = useState(3000);
  const [importando, setImportando] = useState(false);
  const [texto, setTexto] = useState("");
  const [website, setWebsite] = useState<Presenca>("todos");
  const [email, setEmail] = useState<Presenca>("todos");
  const [telefone, setTelefone] = useState<Presenca>("todos");
  const [esplanada, setEsplanada] = useState<Esplanada>("todos");
  const [apenasNovos, setApenasNovos] = useState(false);
  const [filtroRede, setFiltroRede] = useState<FiltroRede>("independentes");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("oportunidade");
  const [estado, setEstado] = useState<PesquisaLeadsResultado | null>(null);
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<{ texto: string; codigo: string } | null>(null);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(12);
  const [vista, setVista] = useState<"lista" | "cartoes">("lista");
  const [filtrosAvancados, setFiltrosAvancados] = useState(false);
  const [detalhe, setDetalhe] = useState<LeadExterno | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const inputImportar = useRef<HTMLInputElement | null>(null);
  const catalogoRef = useRef<CatalogoOverture | null>(null);

  useEffect(() => { setEstado(recuperarCache()); }, []);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!detalhe) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const fecharComEscape = (evento: KeyboardEvent) => { if (evento.key === "Escape") setDetalhe(null); };
    window.addEventListener("keydown", fecharComEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", fecharComEscape); };
  }, [detalhe]);

  const registos = useMemo(() => negocios.map(n => ({
    nome: normalizar(n.nome), dominio: dominio(n.website || n.website_dominio),
    localidade: normalizar(n.localidade || ""),
  })), [negocios]);
  function jaEstaNoCrm(l: LeadExterno) {
    const d = dominio(l.website);
    return corresponderNegocio({ ...l, localidade: l.localidade || localidade }, negocios).length > 0 || registos.some(r => (d && d === r.dominio) || (r.nome === normalizar(l.nome) && (!l.localidade || !r.localidade || r.localidade === normalizar(l.localidade))));
  }
  const resultados = useMemo(() => {
    const busca = normalizar(texto);
    return (estado?.resultados || []).filter(l => {
      if (busca && !normalizar([l.nome, l.categoria, l.morada, l.email].filter(Boolean).join(" ")).includes(busca)) return false;
      if (website === "com" && !l.website || website === "sem" && l.website) return false;
      if (email === "com" && !l.email || email === "sem" && l.email) return false;
      if (telefone === "com" && !l.telefone || telefone === "sem" && l.telefone) return false;
      if (esplanada === "com" && l.esplanada !== "sim" || esplanada === "sem" && l.esplanada !== "nao" || esplanada === "desconhecido" && l.esplanada !== "desconhecido") return false;
      if (!passaFiltroRede(l.nome, filtroRede)) return false;
      if (apenasNovos && jaEstaNoCrm(l)) return false;
      return true;
    }).sort((a, b) => ordenacao === "nome" ? a.nome.localeCompare(b.nome, "pt-PT")
      : ordenacao === "contactos" ? (Number(Boolean(b.email)) + Number(Boolean(b.telefone))) - (Number(Boolean(a.email)) + Number(Boolean(a.telefone)))
      : pontos(b) - pontos(a) || a.nome.localeCompare(b.nome, "pt-PT"));
  }, [estado, texto, website, email, telefone, esplanada, apenasNovos, ordenacao, registos, filtroRede]);

  const totais = useMemo(() => {
    const r = estado?.resultados || [];
    return {
      todos: r.length,
      semWebsite: r.filter(x => !x.website).length,
      comEmail: r.filter(x => x.email).length,
      comTelefone: r.filter(x => x.telefone).length,
      possiveisCadeias: r.filter(x => identificarPossivelCadeia(x.nome)).length,
    };
  }, [estado]);

  function limparFiltros() {
    setTexto(""); setWebsite("todos"); setEmail("todos"); setTelefone("todos");
    setEsplanada("todos"); setApenasNovos(false); setFiltroRede("independentes"); setOrdenacao("oportunidade"); setPagina(1);
  }
  async function pesquisar() {
    if (!isAdmin || pendente) return;
    controller.current?.abort();
    const abort = new AbortController(); controller.current = abort;
    setPendente(true); setErro(null); setPagina(1);
    try {
      let catalogo = catalogoRef.current;
      if (!catalogo) {
        const resposta = await fetch("/data/nws-places-lisboa.json", { signal: abort.signal });
        if (!resposta.ok) {
          if (resposta.status === 404) throw new Error("[CATALOGO] Falta a base local. Executa ATUALIZAR_LEADS_NWS.bat na pasta do projeto, depois reinicia o site. Não é um erro do Overpass.");
          throw new Error(`[CATALOGO] Falha ao carregar a base local (HTTP ${resposta.status}).`);
        }
        const contentType = resposta.headers.get("content-type") || "";
        if (!contentType.includes("json")) throw new Error("[CATALOGO] A base local ainda não foi gerada. Executa ATUALIZAR_LEADS_NWS.bat na pasta do projeto antes da primeira pesquisa.");
        catalogo = validarCatalogo(await resposta.json());
        catalogoRef.current = catalogo;
      }
      const data = filtrarCatalogo(catalogo, categoria, localidade, raio);
      if (abort.signal.aborted) return;
      setEstado(data); gravarCache(data);
      toast.success(`${data.resultados.length} estabelecimentos encontrados na base local (${catalogo.quantidade} registos na região).`);
    } catch (e) {
      if (abort.signal.aborted) return;
      const mensagem = e instanceof Error ? e.message : "Não foi possível pesquisar o catálogo.";
      const codigo = mensagem.match(/\[(CATALOGO|LIMITE|REDE|RESPOSTA)\]/)?.[1] ?? "CATALOGO";
      setErro({ texto: mensagem, codigo });
    } finally { if (controller.current === abort) { controller.current = null; setPendente(false); } }
  }

  async function importarFicheiro(file: File | undefined) {
    if (!file) return;
    setImportando(true);
    setErro(null);
    try {
      if (file.size > 12_000_000) throw new ErroPesquisaLeads("O ficheiro excede 12 MB. Exporta uma área menor.", "FICHEIRO_GRANDE");
      const conteudo = await file.text();
      const novoEstado = importarDadosOsmJson(conteudo, { localidade, raio });
      setEstado(novoEstado);
      gravarCache(novoEstado);
      setPagina(1);
      toast.success(`${novoEstado.resultados.length} negócios importados do ficheiro local.`);
    } catch (e) {
      setErro({ texto: e instanceof Error ? e.message : "Erro ao importar ficheiro.", codigo: e instanceof ErroPesquisaLeads ? e.codigo : "IMPORTACAO" });
    } finally {
      setImportando(false);
      if (inputImportar.current) inputImportar.current.value = "";
    }
  }

  async function guardarNoCrm(l: LeadExterno) {
    if (corresponderNegocio({ ...l, localidade: l.localidade || localidade }, negocios).length || jaEstaNoCrm(l) || criar.isPending) { toast.info("Este negócio pode já estar registado no CRM. Verifica a ficha existente."); return; }
    try {
      const criado = await criar.mutateAsync({
        nome: l.nome, categoria: l.categoria || CATEGORIAS_LEADS[categoria].rotulo,
        localidade: l.localidade || estado?.localidade || localidade,
        email: l.email, telefone: l.telefone, website: l.website,
        google_maps: l.mapsUrl, estado: "por_contactar", prioridade: "media",
        notas: `Origem: ${estado?.fonte || "Dados abertos"} (${l.mapsUrl}).\nInformação obtida de dados abertos em ${new Date().toLocaleDateString("pt-PT")}.\nEsplanada: ${l.esplanada}. Possível cadeia identificada pelo nome: ${identificarPossivelCadeia(l.nome) || "não"}. Confirmar todos os dados antes de contactar.`,
      });
      setDetalhe(null);
      void navigate({to:"/negocios/$id",params:{id:criado.id}});
    } catch { /* a mutation apresenta o erro no toast */ }
  }
  function prepararProposta(l: LeadExterno) {
    const tipo = categoria === "restaurantes" ? "restaurante" : "website";
    const guardado = guardarContextoProposta({
      origem: "lead", nome: l.nome, email: l.email, telefone: l.telefone, localidade: l.localidade || localidade, website: l.website,
      tipo, detalhe: "",
    });
    if (!guardado) {toast.error("Não foi possível preparar a proposta neste navegador."); return;}
    setDetalhe(null);
    void navigate({ to: "/emails", search: { origem: "lead" } });
  }

  async function copiar(l: LeadExterno) {
    try {
      await navigator.clipboard.writeText([l.nome, l.morada || estado?.localidade || localidade, l.website || "Site por identificar", l.email || "Email por identificar", l.telefone || "Telefone por identificar", l.mapsUrl].join("\n"));
      setCopiado(l.id); toast.success("Dados copiados.");
    } catch { toast.error("Não foi possível copiar."); }
  }
  function exportarCSV() {
    const cab = ["Nome", "Categoria", "Morada", "Localidade", "Website identificado", "Email público", "Telefone", "Esplanada", "Fonte OSM"];
    const linhas = resultados.map(l => [l.nome, l.categoria || "", l.morada || "", l.localidade || estado?.localidade || "", l.website || "", l.email || "", l.telefone || "", l.esplanada, l.mapsUrl]);
    const csv = `\uFEFF${[cab, ...linhas].map(r => r.map(csvCell).join(";")).join("\r\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `nws-leads-${estado?.localidade || localidade}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.info("CSV exportado. Confirma as condições de reutilização da fonte e os dados antes de contactar.");
  }

  const consultaTurbo = obterUrlOverpassTurbo({ categoria, localidade, raio });
  const dadosAntigos = estado && (estado.localidade !== localidade || estado.raio !== raio);
  const totalPaginas = Math.max(1, Math.ceil(resultados.length / porPagina));
  const paginaAtual = Math.min(Math.max(1, pagina), totalPaginas);
  const inicio = (paginaAtual - 1) * porPagina;
  const paginaResultados = resultados.slice(inicio, inicio + porPagina);
  const fim = Math.min(inicio + porPagina, resultados.length);
  const filtrosAtivos = [texto.trim(), website !== "todos", email !== "todos", telefone !== "todos", esplanada !== "todos", apenasNovos, filtroRede !== "independentes", ordenacao !== "oportunidade"].filter(Boolean).length;

  function irPagina(valor: number) {
    setPagina(Math.max(1, Math.min(totalPaginas, valor)));
    document.getElementById("nws-leads-lista")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function urlSegura(valor?: string | null) {
    if (!valor) return null;
    try { const u = new URL(valor); return u.protocol === "https:" || u.protocol === "http:" ? u.href : null; }
    catch { return null; }
  }
  function paginacao() {
    return <PaginacaoNWS pagina={paginaAtual} total={totalPaginas} irPara={irPagina}/>;
  }
  function fichaCompacta(l: LeadExterno) {
    const duplicado = jaEstaNoCrm(l);
    const cadeia = identificarPossivelCadeia(l.nome);
    return <article key={l.id} className="flex min-w-0 flex-col justify-between rounded-2xl border border-border/70 bg-surface/55 p-4 transition hover:border-violet-400/35 hover:bg-surface/80">
      <div>
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h4 className="line-clamp-2 text-sm font-extrabold text-foreground">{l.nome}</h4><p className="mt-1 truncate text-xs text-muted-foreground">{l.categoria || CATEGORIAS_LEADS[categoria].rotulo} · {l.localidade || estado?.localidade}</p></div><span className="rounded-lg border border-violet-400/20 bg-violet-500/5 px-2 py-1 text-[10px] font-semibold text-violet-200">{!l.website ? "Site por verificar" : "Site identificado"}</span></div>
        <p className="mt-3 flex items-center gap-1.5 truncate text-xs text-muted-foreground"><MapPin className="size-3.5 shrink-0 text-violet-300"/>{l.morada || "Morada não registada"}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">{l.email && <span className="rounded-md bg-sky-500/10 px-2 py-1 text-[10px] font-semibold text-sky-200">Email público</span>}{l.telefone && <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-200">Telefone</span>}{duplicado && <span className="rounded-md bg-amber-400/10 px-2 py-1 text-[10px] font-semibold text-amber-200">Possível duplicado</span>}{cadeia && <span className="rounded-md bg-amber-400/10 px-2 py-1 text-[10px] font-semibold text-amber-200">Possível rede</span>}</div>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-3"><button type="button" onClick={() => setDetalhe(l)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-xl bg-violet-600 px-3 text-xs font-bold text-white transition hover:bg-violet-500">Ver ficha <ArrowRight className="size-3.5"/></button><button type="button" disabled={criar.isPending} onClick={() => { const existe = corresponderNegocio({ ...l, localidade: l.localidade || localidade }, negocios)[0]; if (existe) void navigate({to:"/negocios/$id",params:{id:existe.id}}); else if (duplicado) toast.info("Possível duplicado: confirma primeiro em Negócios & Clientes."); else void guardarNoCrm(l); }} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-violet-400/30 px-3 text-xs font-bold text-violet-200 transition hover:bg-violet-500/10 disabled:opacity-40">{duplicado ? <Check className="size-4"/> : <Building2 className="size-4"/>} {duplicado ? "Verificar" : "CRM"}</button><button type="button" onClick={() => prepararProposta(l)} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 text-xs font-bold text-violet-200 transition hover:bg-violet-500/20"><Mail className="size-3.5"/> Proposta</button></div>
    </article>;
  }

  return (
    <section aria-label="Pesquisa e qualificação de negócios" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>Pesquisa regional no catálogo Overture · sem custo por consulta</p>
        <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 font-semibold text-violet-200">Dados abertos · Overture Maps</span>
      </div>
      <form className="rounded-2xl border border-violet-400/25 bg-surface/65 p-4 sm:p-5" onSubmit={e => { e.preventDefault(); void pesquisar(); }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-sm font-extrabold text-foreground"><Search className="size-4 text-violet-300"/> Nova pesquisa</h2><span className="text-[11px] text-muted-foreground">Escolhe a área e o setor para começar</span></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_0.75fr_auto] xl:items-end">
          <label className="block min-w-0 space-y-1.5"><span className="text-xs font-semibold text-muted-foreground">Tipo de negócio</span><select className={CAMPO} value={categoria} onChange={e => setCategoria(e.target.value as CategoriaLead)}>{Object.entries(CATEGORIAS_LEADS).map(([id,c])=><option value={id} key={id}>{c.rotulo}</option>)}</select></label>
          <label className="block min-w-0 space-y-1.5"><span className="text-xs font-semibold text-muted-foreground">Localidade</span><select className={CAMPO} value={localidade} onChange={e => setLocalidade(e.target.value as LocalidadeLead)}>{Object.keys(ZONAS_LEADS).map(z => <option key={z} value={z}>{z.replaceAll("_", " ")}</option>)}</select></label>
          <label className="block min-w-0 space-y-1.5"><span className="text-xs font-semibold text-muted-foreground">Raio</span><select className={CAMPO} value={raio} onChange={e=>setRaio(Number(e.target.value))}><option value={1000}>1 km</option><option value={3000}>3 km</option><option value={5000}>5 km</option></select></label>
          <button type="submit" disabled={pendente || !isAdmin} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 text-xs font-bold text-white shadow-lg shadow-violet-500/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto">{pendente ? <Loader2 className="size-4 animate-spin"/> : <Search className="size-4"/>}{pendente ? "A pesquisar…" : "Pesquisar"}</button>
        </div>
        {dadosAntigos && <p className="mt-3 text-xs text-amber-300">Alteraste a zona: os resultados abaixo ainda são da pesquisa anterior. Carrega em Pesquisar para atualizar.</p>}
        {!isAdmin && <p className="mt-2 text-xs text-amber-300">Apenas administradores podem pesquisar.</p>}
        <details className="mt-3 text-xs text-muted-foreground"><summary className="cursor-pointer select-none font-medium text-violet-200 hover:underline">Atualização da base e importação alternativa</summary><div className="mt-3 flex flex-col gap-2 rounded-xl border border-border/70 bg-background/30 p-4"><p>Os resultados são carregados de <strong>public/data/nws-places-lisboa.json</strong>. Atualiza a base executando <strong>ATUALIZAR_LEADS_NWS.bat</strong> no computador.</p><p>Se necessário, também podes importar um ficheiro OpenStreetMap (JSON/GeoJSON) para esta sessão.</p><a href={consultaTurbo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-violet-300 hover:underline">Abrir Overpass Turbo <ExternalLink className="size-3"/></a><input ref={inputImportar} type="file" accept=".json,.geojson,application/json,application/geo+json" className="sr-only" onChange={e=>void importarFicheiro(e.target.files?.[0])} aria-label="Importar ficheiro OSM"/><button type="button" disabled={importando} onClick={()=>inputImportar.current?.click()} className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg border border-violet-400/30 px-3 text-violet-200 hover:bg-violet-500/10"><FileUp className="size-4"/>{importando?"A importar…":"Importar JSON / GeoJSON"}</button></div></details>
      </form>
      {erro && <div role="alert" className="rounded-2xl border border-amber-500/35 bg-amber-400/5 p-4 text-sm text-amber-200"><CircleAlert className="mr-2 inline size-4"/>{erro.texto}</div>}
      {pendente && <div role="status" className="flex items-center gap-3 rounded-xl border border-border/70 bg-surface/50 p-5 text-sm text-muted-foreground"><Loader2 className="size-5 animate-spin text-violet-300"/>A consultar o catálogo local…</div>}
      {!estado && !pendente && !erro && <div className="rounded-2xl border border-dashed border-violet-400/30 bg-violet-500/[0.03] px-6 py-12 text-center"><Building2 className="mx-auto size-10 text-violet-300"/><h2 className="mt-3 text-lg font-bold">Vamos descobrir oportunidades?</h2><p className="mt-1 text-sm text-muted-foreground">Começa por escolher a zona e pesquisar. Os resultados só passam para o CRM quando decidires.</p></div>}
      {estado && <>
        <section aria-label="Resumo da pesquisa" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[{l:"Encontrados",v:totais.todos,i:Building2},{l:"Site por identificar",v:totais.semWebsite,i:Globe2},{l:"Com email público",v:totais.comEmail,i:Mail},{l:"Com telefone",v:totais.comTelefone,i:Phone}].map(({l,v,i:Icon})=><div key={l} className="flex items-center gap-3 rounded-xl border border-border/65 bg-surface/45 p-3 sm:p-4"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-300"><Icon className="size-4"/></span><div className="min-w-0"><p className="text-xl font-extrabold tabular-nums text-foreground">{v}</p><p className="text-[11px] leading-4 text-muted-foreground">{l}</p></div></div>)}
        </section>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[11px] text-muted-foreground"><span><strong className="text-foreground">{estado.localidade.replaceAll("_"," ")}</strong> · {estado.raio/1000} km · {new Date(estado.pesquisadoEm).toLocaleString("pt-PT")}</span><span>Fonte: {estado.servidor}</span></div>
        <section aria-label="Filtrar oportunidades" className="rounded-2xl border border-border/70 bg-surface/50 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-extrabold text-foreground">Encontrar as melhores oportunidades</h2><button type="button" onClick={limparFiltros} className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-violet-300 hover:underline"><FilterX className="size-4"/> Limpar filtros</button></div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_210px_210px]">
            <label className="block min-w-0 space-y-1"><span className="text-xs text-muted-foreground">Pesquisar por nome, morada ou categoria</span><input type="search" value={texto} onChange={e=>{setTexto(e.target.value);setPagina(1);}} className={CAMPO} placeholder="Ex.: pizzaria, café, Cascais…"/></label>
            <label className="block min-w-0 space-y-1"><span className="text-xs text-muted-foreground">Website</span><select className={CAMPO} value={website} onChange={e=>{setWebsite(e.target.value as Presenca);setPagina(1);}}><option value="todos">Todos</option><option value="sem">Site não identificado</option><option value="com">Com website</option></select></label>
            <label className="block min-w-0 space-y-1"><span className="text-xs text-muted-foreground">Email</span><select className={CAMPO} value={email} onChange={e=>{setEmail(e.target.value as Presenca);setPagina(1);}}><option value="todos">Todos</option><option value="com">Com email</option><option value="sem">Sem email identificado</option></select></label>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap gap-2"><button type="button" onClick={()=>{setWebsite("sem");setEmail("todos");setApenasNovos(true);setFiltroRede("independentes");setPagina(1);}} className="min-h-9 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 text-[11px] font-bold text-violet-200 hover:bg-violet-500/20">Sem website · novos</button><button type="button" onClick={()=>{setEmail("com");setWebsite("todos");setApenasNovos(true);setFiltroRede("independentes");setPagina(1);}} className="min-h-9 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 text-[11px] font-bold text-violet-200 hover:bg-violet-500/20">Com email · novos</button></div><button type="button" onClick={()=>setFiltrosAvancados(v=>!v)} aria-expanded={filtrosAvancados} className="inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-violet-200"><SlidersHorizontal className="size-4"/>{filtrosAvancados?"Ocultar":"Mais filtros"}{filtrosAtivos>0 && <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px]">{filtrosAtivos}</span>}</button></div>
          {filtrosAvancados && <div className="mt-4 grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-2 xl:grid-cols-4"><label className="space-y-1 text-xs text-muted-foreground">Telefone<select className={CAMPO} value={telefone} onChange={e=>{setTelefone(e.target.value as Presenca);setPagina(1);}}><option value="todos">Todos</option><option value="com">Com telefone</option><option value="sem">Sem telefone</option></select></label><label className="space-y-1 text-xs text-muted-foreground">Esplanada<select className={CAMPO} value={esplanada} onChange={e=>{setEsplanada(e.target.value as Esplanada);setPagina(1);}}><option value="todos">Todas</option><option value="com">Confirmada</option><option value="sem">Assinalada como não</option><option value="desconhecido">Desconhecida</option></select></label><label className="space-y-1 text-xs text-muted-foreground">Perfil<select className={CAMPO} value={filtroRede} onChange={e=>{setFiltroRede(e.target.value as FiltroRede);setPagina(1);}}><option value="independentes">Sem redes reconhecidas</option><option value="todos">Todos (incluindo redes)</option><option value="cadeias">Possíveis redes apenas</option></select></label><label className="space-y-1 text-xs text-muted-foreground">Ordenação<select className={CAMPO} value={ordenacao} onChange={e=>{setOrdenacao(e.target.value as Ordenacao);setPagina(1);}}><option value="oportunidade">Website por identificar</option><option value="contactos">Mais contactos</option><option value="nome">Nome A–Z</option></select></label><label className="flex min-h-10 items-center gap-2 text-xs text-muted-foreground sm:col-span-2"><input type="checkbox" className="size-4 accent-violet-500" checked={apenasNovos} onChange={e=>{setApenasNovos(e.target.checked);setPagina(1);}}/> Ocultar possíveis duplicados do CRM</label></div>}
        </section>
        <section id="nws-leads-lista" aria-label="Resultados da pesquisa" className="space-y-3 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-extrabold text-foreground">{resultados.length} oportunidades</h2><p className="mt-1 text-xs text-muted-foreground">{resultados.length ? `A mostrar ${inicio+1}–${fim} de ${resultados.length}` : "Sem resultados para estes filtros"} · {totais.possiveisCadeias} potenciais redes no catálogo</p></div><div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 text-xs text-muted-foreground">Por página<select aria-label="Resultados por página" className="min-h-10 rounded-xl border border-border/70 bg-background/70 px-2 text-xs text-foreground" value={porPagina} onChange={e=>{setPorPagina(Number(e.target.value));setPagina(1);}}><option value={12}>12</option><option value={24}>24</option><option value={48}>48</option></select></label><div role="group" aria-label="Vista de resultados" className="flex overflow-hidden rounded-xl border border-border/70"><button type="button" aria-label="Vista em lista" aria-pressed={vista==="lista"} onClick={()=>setVista("lista")} className={`grid size-10 place-items-center ${vista==="lista"?"bg-violet-600 text-white":"bg-background/60 text-muted-foreground hover:text-foreground"}`}><List className="size-4"/></button><button type="button" aria-label="Vista em cartões" aria-pressed={vista==="cartoes"} onClick={()=>setVista("cartoes")} className={`grid size-10 place-items-center ${vista==="cartoes"?"bg-violet-600 text-white":"bg-background/60 text-muted-foreground hover:text-foreground"}`}><LayoutGrid className="size-4"/></button></div><button type="button" disabled={!resultados.length} onClick={exportarCSV} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-violet-400/30 px-3 text-xs font-bold text-violet-200 hover:bg-violet-500/10 disabled:opacity-40"><Download className="size-4"/> CSV</button></div></div>
          {!resultados.length ? <div className="rounded-2xl border border-border/70 p-8 text-center text-sm text-muted-foreground">Nenhum negócio corresponde aos filtros atuais. Experimenta alterar os filtros ou pesquisar outra zona.</div> : <>
            {vista==="lista" && <div className="hidden overflow-hidden rounded-2xl border border-border/65 bg-surface/40 md:block"><table className="w-full table-fixed text-left text-xs"><thead className="bg-background/60 text-[11px] font-bold uppercase tracking-wide text-muted-foreground"><tr><th scope="col" className="w-[34%] px-4 py-3">Negócio</th><th scope="col" className="w-[24%] px-4 py-3">Presença digital</th><th scope="col" className="w-[24%] px-4 py-3">Contacto</th><th scope="col" className="w-[18%] px-4 py-3 text-right">Ação</th></tr></thead><tbody className="divide-y divide-border/50">{paginaResultados.map(l=>{const duplicado=jaEstaNoCrm(l);return <tr key={l.id} className="transition hover:bg-violet-500/[0.06]"><td className="px-4 py-3"><p className="truncate font-extrabold text-foreground" title={l.nome}>{l.nome}</p><p className="mt-1 truncate text-[11px] text-muted-foreground" title={l.morada||""}>{l.morada||l.localidade||"Morada não identificada"}</p></td><td className="px-4 py-3"><p className={l.website?"truncate text-violet-200":"text-amber-200"}>{l.website?dominio(l.website):"Site não identificado"}</p><p className="mt-1 text-[11px] text-muted-foreground">{identificarPossivelCadeia(l.nome)?"Possível rede comercial":duplicado?"Possível duplicado CRM":"Dados Overture"}</p></td><td className="px-4 py-3"><p className="truncate" title={l.email||""}>{l.email||"Email não identificado"}</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{l.telefone||"Telefone não identificado"}</p></td><td className="px-4 py-3 text-right"><button type="button" onClick={()=>setDetalhe(l)} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 font-bold text-violet-200 hover:bg-violet-500/20">Ver ficha <ArrowRight className="size-3.5"/></button></td></tr>})}</tbody></table></div>}
            <div className={`grid gap-3 ${vista==="lista"?"md:hidden":"sm:grid-cols-2 xl:grid-cols-3"}`}>{paginaResultados.map(fichaCompacta)}</div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-surface/35 p-3"><p className="text-xs text-muted-foreground">Página {paginaAtual} de {totalPaginas} · {inicio+1}–{fim} resultados</p>{paginacao()}</div>
          </>}
          <p className="text-[11px] leading-5 text-muted-foreground"><Info className="mr-1 inline size-3.5"/>Dados Overture Maps; podem estar incompletos ou desatualizados. Site não identificado na fonte não significa necessariamente ausência de website. Exportação CSV inclui todos os resultados filtrados; não envia emails.</p>
        </section>
      </>}
      {detalhe && <div role="presentation" className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={e=>{if(e.target===e.currentTarget)setDetalhe(null);}}>
        <section role="dialog" aria-modal="true" aria-labelledby="nws-lead-detalhe" className="max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-violet-400/25 bg-background p-5 shadow-2xl sm:rounded-3xl sm:p-6" onKeyDown={e=>{if(e.key==="Escape")setDetalhe(null);}}>
          <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-widest text-violet-300">Ficha do negócio · {estado?.fonte || "Dados abertos"}</p><h2 id="nws-lead-detalhe" className="mt-2 break-words text-xl font-extrabold text-foreground">{detalhe.nome}</h2><p className="mt-1 text-xs text-muted-foreground">{detalhe.categoria} · {detalhe.localidade||estado?.localidade}</p></div><button type="button" onClick={()=>setDetalhe(null)} aria-label="Fechar ficha" className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/70 hover:bg-surface-strong"><X className="size-5"/></button></div>
          <div className="mt-5 space-y-3 rounded-2xl border border-border/70 bg-surface/50 p-4 text-sm"><p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-violet-300"/><span>{detalhe.morada||"Morada não registada"}</span></p><p className="flex items-start gap-2"><Globe2 className="mt-0.5 size-4 shrink-0 text-violet-300"/>{urlSegura(detalhe.website)?<a className="break-all text-violet-200 hover:underline" href={urlSegura(detalhe.website)!} target="_blank" rel="noopener noreferrer">{detalhe.website} <ArrowUpRight className="inline size-3"/></a>:<span className="text-muted-foreground">Website não identificado na fonte</span>}</p><p className="flex items-start gap-2"><Mail className="mt-0.5 size-4 shrink-0 text-violet-300"/>{detalhe.email?<a href={`mailto:${detalhe.email}`} className="break-all text-violet-200 hover:underline">{detalhe.email}</a>:<span className="text-muted-foreground">Email não identificado</span>}</p><p className="flex items-start gap-2"><Phone className="mt-0.5 size-4 shrink-0 text-violet-300"/>{detalhe.telefone?<a href={`tel:${detalhe.telefone.replace(/[^+\d]/g, "")}`} className="text-violet-200 hover:underline">{detalhe.telefone}</a>:<span className="text-muted-foreground">Telefone não identificado</span>}</p>{categoria==="restaurantes"&&<p className="flex items-start gap-2"><UtensilsCrossed className="mt-0.5 size-4 shrink-0 text-violet-300"/>Esplanada: {detalhe.esplanada==="sim"?"assinalada":detalhe.esplanada==="nao"?"assinalada como não":"informação desconhecida"}</p>}<p className="text-xs text-muted-foreground">Avaliações não incluídas neste catálogo. Verifica os contactos antes de os utilizar.</p></div>
          <div className="mt-5 flex flex-wrap gap-2"><button type="button" disabled={criar.isPending} onClick={()=>{const existente = corresponderNegocio({...detalhe,localidade:detalhe.localidade||localidade},negocios)[0];if(existente){setDetalhe(null);void navigate({to:"/negocios/$id",params:{id:existente.id}});}else if(jaEstaNoCrm(detalhe)) toast.info("Possível duplicado: confirma primeiro no CRM.");else void guardarNoCrm(detalhe);}} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-40">{jaEstaNoCrm(detalhe)?<Check className="size-4"/>:<Building2 className="size-4"/>}{jaEstaNoCrm(detalhe)?"Verificar no CRM":"Adicionar ao CRM"}</button><button type="button" onClick={() => prepararProposta(detalhe)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-violet-400/35 bg-violet-500/10 px-4 text-xs font-bold text-violet-200"><Mail className="size-4"/> Preparar proposta HTML</button>{urlSegura(detalhe.website)&&<a href={`/analisar?url=${encodeURIComponent(detalhe.website!)}&nome=${encodeURIComponent(detalhe.nome)}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-violet-400/35 px-4 text-xs font-bold text-violet-200"><FileSearch className="size-4"/> Analisar website</a>}<button type="button" onClick={()=>void copiar(detalhe)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border/70 px-3 text-xs text-muted-foreground hover:text-foreground">{copiado===detalhe.id?<Check className="size-4"/>:<Copy className="size-4"/>} Copiar</button>{urlSegura(detalhe.mapsUrl)&&<a href={urlSegura(detalhe.mapsUrl)!} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border/70 px-3 text-xs text-violet-200">Mapa <ExternalLink className="size-4"/></a>}</div>
        </section>
      </div>}
    </section>
  );
}
