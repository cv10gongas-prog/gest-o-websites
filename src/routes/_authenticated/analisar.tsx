import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { guardarContextoProposta } from "@/lib/commercial-handoff";
import {
  AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCopy, Clock3, ExternalLink,
  FileSearch, Globe2, Info, Link2, Loader2, Mail, MonitorSmartphone, Search, ShieldCheck, Sparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PaginacaoNWS } from "@/components/crm/PaginacaoNWS";
import { identificarPossivelCadeia, passaFiltroRede, type FiltroRede } from "@/lib/lead-qualification";

// O relatório é gerado localmente pelo script Python e nunca contém HTML remoto.
type Verificacao = {
  codigo: string;
  rotulo: string;
  estado: "ok" | "atencao" | "desconhecido";
  evidencia: string;
  sugestao: string | null;
};
type Auditoria = {
  id: string;
  nome: string;
  website: string | null;
  websiteFinal?: string;
  tipoNws?: string | null;
  localidade?: string | null;
  verificadoEm: string;
  estado: "ok" | "erro";
  erro: string | null;
  pontuacao: number | null;
  titulo?: string | null;
  descricao?: string | null;
  verificacoes: Verificacao[];
  sugestoes: string[];
};
type Relatorio = {
  versao: 1;
  fonte: string;
  geradoEm: string;
  quantidade: number;
  resultados: Auditoria[];
};

export const Route = createFileRoute("/_authenticated/analisar")({
  validateSearch: (s: Record<string, unknown>) => ({
    url: typeof s.url === "string" ? s.url.slice(0, 500) : undefined,
    nome: typeof s.nome === "string" ? s.nome.slice(0, 180) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Website Analyzer — NWS Intelligence" },
      { name: "description", content: "Auditorias técnicas preliminares a websites de potenciais clientes." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: WebsiteAnalyzer,
});

function host(url: string | null | undefined) {
  try {
    return new URL(/^https?:\/\//i.test(url ?? "") ? url! : `https://${url}`).hostname
      .toLowerCase().replace(/^www\./, "");
  } catch { return ""; }
}
function formatoData(data: string) {
  const valor = new Date(data);
  return Number.isNaN(valor.getTime()) ? "Data desconhecida" : valor.toLocaleString("pt-PT");
}
function urlPublica(url: string | null | undefined) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.username === "" && u.password === "" ? u.href : null;
  } catch { return null; }
}
const input = "min-h-11 w-full rounded-xl border border-border/70 bg-background/75 px-4 py-2.5 text-sm text-foreground outline-none transition focus-visible:border-violet-400 focus-visible:ring-2 focus-visible:ring-violet-400/20";

function WebsiteAnalyzer() {
  const { url, nome } = Route.useSearch();
  const navigate = useNavigate();
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pesquisa, setPesquisa] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "melhorias" | "erros">("todos");
  const [filtroRede, setFiltroRede] = useState<FiltroRede>("independentes");
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(12);

  useEffect(() => {
    const abort = new AbortController();
    async function carregar() {
      try {
        const response = await fetch("/data/nws-website-audits.json", { cache: "no-store", signal: abort.signal });
        if (response.status === 404) {
          throw new Error("Ainda não há análises. Executa ANALISAR_SITES_NWS.bat na pasta do projeto.");
        }
        if (!response.ok) throw new Error(`Não foi possível carregar as auditorias (HTTP ${response.status}).`);
        const dados: Relatorio = await response.json();
        if (dados.versao !== 1 || !Array.isArray(dados.resultados)) throw new Error("O ficheiro de auditorias não tem o formato esperado.");
        if (!abort.signal.aborted) setAuditorias(dados.resultados.filter(a => a && typeof a.id === "string" && typeof a.nome === "string"));
      } catch (e) {
        if (!abort.signal.aborted) setErro(e instanceof Error ? e.message : "Falha ao ler auditorias.");
      } finally { if (!abort.signal.aborted) setCarregando(false); }
    }
    void carregar();
    return () => abort.abort();
  }, []);

  const selecionado = useMemo(() => {
    if (selecionadoId) return auditorias.find(a => a.id === selecionadoId) ?? null;
    const h = host(url);
    if (h) return auditorias
      .filter(a => host(a.website) === h || host(a.websiteFinal) === h)
      .sort((a,b) => (b.verificadoEm ?? "").localeCompare(a.verificadoEm ?? ""))[0] ?? null;
    return null;
  }, [auditorias, selecionadoId, url]);
  const lista = useMemo(() => {
    const texto = pesquisa.trim().toLocaleLowerCase("pt-PT");
    return auditorias.filter(a => {
      if (!passaFiltroRede(a.nome, filtroRede)) return false;
      if (filtro === "melhorias" && (a.estado !== "ok" || a.verificacoes.every(v => v.estado !== "atencao"))) return false;
      if (filtro === "erros" && a.estado !== "erro") return false;
      return !texto || [a.nome, a.website, a.localidade].filter(Boolean).join(" ").toLocaleLowerCase("pt-PT").includes(texto);
    }).sort((a, b) => (a.estado === "ok" ? 0 : 1) - (b.estado === "ok" ? 0 : 1) || (a.pontuacao ?? 101) - (b.pontuacao ?? 101));
  }, [auditorias, pesquisa, filtro, filtroRede]);
  const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina));
  const paginaAtual = Math.min(Math.max(1, pagina), totalPaginas);
  const resultadosPagina = lista.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);
  const analisados = auditorias.filter(a => a.estado === "ok");
  const melhorias = analisados.filter(a => a.verificacoes.some(v => v.estado === "atencao"));
  const dominioPedido = host(url);
  const aindaNaoAnalisado = dominioPedido && !selecionado;

  function prepararPropostaAuditoria(a: Auditoria) {
    const primeiroPonto = a.estado === "ok"
      ? a.verificacoes.find(v => v.estado === "atencao" && v.evidencia.trim()) : undefined;
    const detalhe = primeiroPonto
      ? `na verificação preliminar do HTML, o ponto «${primeiroPonto.rotulo}» foi assinalado para revisão: ${primeiroPonto.evidencia}`
      : "";
    const guardado = guardarContextoProposta({
      origem: "auditoria", nome: a.nome, localidade: a.localidade, website: a.websiteFinal || a.website,
      tipo: a.tipoNws === "restaurantes" ? "restaurante" : "modernizacao", detalhe,
    });
    if (!guardado) {toast.error("Não foi possível preparar a proposta neste navegador."); return;}
    void navigate({ to: "/emails", search: { origem: "auditoria" } });
  }

  async function copiarComando(website: string | null | undefined) {
    if (!website || !/^https?:\/\//i.test(website)) return;
    const comando = `py -3 scripts\\analisar_sites_nws.py --url "${website.replaceAll('"', "")}"`;
    try { await navigator.clipboard.writeText(comando); toast.success("Comando para análise individual copiado."); }
    catch { toast.error("Não foi possível copiar o comando."); }
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-surface/70 to-cyan-500/5 p-6 sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-300"><Sparkles className="size-4"/> NWS Intelligence · Fase 3</div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Website Analyzer</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Auditorias reais do HTML inicial, com evidências, prioridades e sugestões para propostas comerciais. Os resultados são guardados no projeto para consulta rápida.</p>
          </div>
          <Link to="/descobrir" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-violet-400/35 bg-violet-500/10 px-4 text-xs font-bold text-violet-200 hover:bg-violet-500/20"><ArrowLeft className="size-4"/> Voltar ao Lead Finder</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { rotulo:"Auditorias guardadas",numero:auditorias.length,icon:FileSearch },
          { rotulo:"HTML analisado",numero:analisados.length,icon:CheckCircle2 },
          { rotulo:"Com pontos a rever",numero:melhorias.length,icon:AlertTriangle },
          { rotulo:"Sem resposta/acesso",numero:auditorias.length-analisados.length,icon:Globe2 },
        ].map(({rotulo,numero,icon:Icon}) => <div key={rotulo} className="rounded-2xl border border-border/70 bg-surface/60 p-4"><Icon className="size-4 text-violet-300"/><p className="mt-3 text-2xl font-extrabold tabular-nums">{numero}</p><p className="text-xs text-muted-foreground">{rotulo}</p></div>)}
      </div>

      <section className="rounded-2xl border border-violet-400/30 bg-violet-500/5 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-sm font-bold"><MonitorSmartphone className="size-4 text-violet-300"/> Atualizar análises — sem chaves pagas</h2>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">No teu PC executa <strong>ANALISAR_SITES_NWS.bat</strong> na pasta gest-o-websites. Por defeito analisa até 20 websites de restaurantes num raio de 3 km de Cascais. Depois atualiza esta página. Não faz envios de emails nem importa negócios para o CRM.</p>
        <p className="mt-2 text-xs text-amber-200/90">É uma auditoria preliminar ao HTML, não um teste de velocidade ou prova de que o layout é responsivo. Websites protegidos ou feitos em JavaScript podem mostrar informação incompleta.</p>
      </section>

      {carregando && <p className="flex items-center gap-2 rounded-xl border border-border/70 p-5 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin"/> A carregar auditorias…</p>}
      {erro && !carregando && <div role="alert" className="rounded-xl border border-amber-400/35 bg-amber-400/5 p-5 text-sm text-amber-200"><Info className="mr-2 inline size-4"/>{erro}</div>}
      {aindaNaoAnalisado && !carregando && (
        <div className="rounded-2xl border border-sky-400/25 bg-sky-500/5 p-5">
          <h2 className="font-bold">{nome || dominioPedido} — por analisar</h2>
          <p className="mt-2 text-sm text-muted-foreground">Este website ainda não aparece nas auditorias guardadas. Podes executar uma análise individual a partir do PowerShell.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => void copiarComando(url)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white hover:bg-violet-500"><ClipboardCopy className="size-4"/> Copiar comando para analisar</button>
            <span className="text-xs text-muted-foreground">Executa-o na raiz da pasta do projeto e atualiza esta página.</span>
          </div>
        </div>
      )}

      {selecionado && (
        <section className="space-y-5 rounded-3xl border border-violet-400/30 bg-surface/65 p-5 sm:p-7" aria-labelledby="site-selecionado">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-violet-300">Ficha técnica preliminar · confirmar antes de contactar</p>
              <h2 id="site-selecionado" className="break-words text-xl font-extrabold sm:text-2xl">{selecionado.nome}</h2>
              <p className="mt-1 break-all text-xs text-muted-foreground">{selecionado.website} · {formatoData(selecionado.verificadoEm)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {urlPublica(selecionado.websiteFinal || selecionado.website) && <a href={urlPublica(selecionado.websiteFinal || selecionado.website)!} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border/70 px-3 text-xs font-semibold text-foreground"><ExternalLink className="size-4"/> Abrir site</a>}
              <button type="button" onClick={() => prepararPropostaAuditoria(selecionado)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white hover:bg-violet-500"><Mail className="size-4"/> Preparar proposta</button>
              <button type="button" onClick={() => void copiarComando(selecionado.website)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-violet-400/30 px-3 text-xs font-bold text-violet-200 hover:bg-violet-500/10"><ClipboardCopy className="size-4"/> Atualizar este site</button>
            </div>
          </div>
          {selecionado.estado === "erro" ?
            <p className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-200">Não foi possível analisar o HTML: {selecionado.erro}. Isto não significa que o website esteja offline para os visitantes.</p>
            : <>
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-background/40 p-4">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-violet-400/35 bg-violet-500/10 text-2xl font-black text-violet-200">{selecionado.verificacoes.filter(v => v.estado === "ok").length}<span className="ml-1 text-xs text-muted-foreground">/{selecionado.verificacoes.filter(v => v.estado !== "desconhecido").length} sinais</span></div>
                <div className="flex-1"><p className="font-bold">Sinais técnicos detetados</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Contagem de sinais técnicos verificados, não uma nota de qualidade. Sem testes de velocidade, design ou comportamento mobile real.</p></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {selecionado.verificacoes.map(v => <div key={v.codigo} className="rounded-2xl border border-border/60 bg-background/40 p-4">
                  <div className="flex items-center gap-2">{v.estado === "ok" ? <CheckCircle2 className="size-4 shrink-0 text-emerald-400"/> : v.estado === "atencao" ? <AlertTriangle className="size-4 shrink-0 text-amber-300"/> : <Info className="size-4 shrink-0 text-muted-foreground"/>}<h3 className="text-sm font-bold">{v.rotulo}</h3></div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{v.evidencia}</p>
                  {v.sugestao && <p className="mt-2 text-xs leading-5 text-violet-200"><ArrowRight className="mr-1 inline size-3"/>{v.sugestao}</p>}
                </div>)}
              </div>
              <div className="rounded-2xl border border-violet-400/25 bg-violet-500/5 p-5">
                <h3 className="flex items-center gap-2 text-sm font-extrabold"><Sparkles className="size-4 text-violet-300"/> Ideias fundamentadas para uma proposta NWS</h3>
                {selecionado.sugestoes.length ? <ul className="mt-3 space-y-2 text-sm text-muted-foreground">{selecionado.sugestoes.map((s,i)=><li key={i} className="flex items-start gap-2"><span className="text-violet-300">{i+1}.</span>{s}</li>)}</ul> : <p className="mt-2 text-xs text-muted-foreground">Nenhuma lacuna detetada nestes sinais. Uma auditoria visual e de performance pode revelar outras oportunidades.</p>}
              </div>
            </>}
        </section>
      )}

      <section className="rounded-2xl border border-border/70 bg-surface/45 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-extrabold">Sites analisados</h2><p className="text-xs text-muted-foreground">{lista.length} resultados no catálogo local de auditorias</p></div><div className="flex flex-wrap gap-2"><Link to="/descobrir" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border/70 px-3 text-xs font-bold text-muted-foreground hover:text-foreground"><Search className="size-4"/> Descobrir negócios</Link></div></div>
        <p className="mt-3 text-xs text-muted-foreground">A lista oculta redes conhecidas por nome, mas mantém todos os relatórios. Podes mostrar as cadeias quando precisares.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px_240px]">
          <label className="block"><span className="sr-only">Pesquisar websites</span><input className={input} type="search" placeholder="Nome do negócio, site, localidade…" value={pesquisa} onChange={e=>{setPesquisa(e.target.value);setPagina(1);}} /></label>
          <label className="block"><span className="sr-only">Filtrar resultados</span><select className={input} value={filtro} onChange={e=>{setFiltro(e.target.value as typeof filtro);setPagina(1);}}><option value="todos">Todos os resultados</option><option value="melhorias">Com pontos a rever</option><option value="erros">Não analisados (erro)</option></select></label>
          <label className="block"><span className="sr-only">Tipo de negócio</span><select aria-label="Tipo de negócio" className={input} value={filtroRede} onChange={e=>{setFiltroRede(e.target.value as FiltroRede);setPagina(1);}}><option value="independentes">Negócios locais (sem redes)</option><option value="todos">Todos, incluindo redes</option><option value="cadeias">Possíveis cadeias apenas</option></select></label>
        </div>
        {!lista.length && !carregando && <p className="mt-5 rounded-xl border border-border/70 p-5 text-sm text-muted-foreground">Ainda não existem auditorias para mostrar com estes filtros. Executa o atualizador para obter resultados.</p>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">{lista.length === 0 ? "Sem resultados" : `A mostrar ${(paginaAtual - 1) * porPagina + 1}–${Math.min(paginaAtual * porPagina, lista.length)} de ${lista.length} auditorias`}</p>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">Por página <select aria-label="Auditorias por página" className="min-h-10 rounded-xl border border-border/70 bg-background/70 px-3 text-xs text-foreground" value={porPagina} onChange={e=>{setPorPagina(Number(e.target.value));setPagina(1);}}><option value={12}>12</option><option value={24}>24</option><option value={48}>48</option></select></label>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {resultadosPagina.map(a=> <button type="button" key={a.id} onClick={() => {setSelecionadoId(a.id);window.scrollTo({top:0,behavior:"smooth"});}} className="group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 p-4 text-left transition hover:border-violet-400/50 hover:bg-violet-500/5">
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground group-hover:text-violet-200">{a.nome}</p><p className="mt-1 truncate text-xs text-muted-foreground">{host(a.website) || a.website} · {formatoData(a.verificadoEm)}</p>{identificarPossivelCadeia(a.nome) && <span className="mt-1 inline-block text-[10px] text-amber-300">Possível rede comercial: {identificarPossivelCadeia(a.nome)}</span>}</div>
            <div className="flex shrink-0 items-center gap-2">{a.estado === "ok" ? <span className="rounded-lg bg-violet-500/15 px-2 py-1 text-xs font-bold text-violet-200">{a.verificacoes.filter(v=>v.estado==="ok").length}/{a.verificacoes.filter(v=>v.estado!=="desconhecido").length} sinais</span> : <span className="rounded-lg bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-300">Não analisado</span>}<ArrowRight className="size-4 text-muted-foreground"/></div>
          </button>)}
        </div>
        {lista.length > porPagina && <nav aria-label="Paginação das auditorias" className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <span className="text-xs text-muted-foreground">Página {paginaAtual} de {totalPaginas}</span>
          <PaginacaoNWS pagina={paginaAtual} total={totalPaginas} irPara={setPagina}/>
        </nav>}
      </section>
      <p className="flex gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-violet-300"/> As auditorias são verificações técnicas preliminares ao HTML inicial. Não comprovam a usabilidade real, não classificam o negócio e não geram emails automaticamente. Os dados externos são tratados como conteúdo não fiável.</p>
    </main>
  );
}
