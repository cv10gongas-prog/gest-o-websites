import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, AlertTriangle, Check, LockKeyhole, RotateCcw, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useUtilizador } from "@/hooks/useAuth";
import { SECCOES, usePreferencias } from "@/lib/preferencias";
import { supabase } from "@/integrations/supabase/client";
import { useBusinesses } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/controlo-ceo")({
  head: () => ({ meta: [
    { title: "Controlo CEO — Nova Web Studio" },
    { name: "robots", content: "noindex,nofollow" },
  ] }),
  component: ControloCEO,
});

type EstadoCEO = { owner: boolean; pinReady: boolean; archives?: number };
type OperacaoResult = { ok: boolean; reason?: string; count?: number; restored?: number; original?: number };
const CAMPO = "w-full min-h-10 rounded-xl border border-border/70 bg-background/70 px-3 text-sm outline-none focus:border-violet-400";
const rpc = supabase.rpc.bind(supabase) as unknown as (name: string, args?: Record<string,string>) => Promise<{data: unknown; error: {message:string;code?:string}|null}>;

function ControloCEO() {
  const { isAdmin, aCarregar, userId } = useUtilizador();
  const { prefs, guardar } = usePreferencias();
  const { data: negocios = [] } = useBusinesses();
  const qc = useQueryClient();
  const [operacao, setOperacao] = useState<"archive"|"restore"|null>(null);
  const [texto, setTexto] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState("");
  const { data: status, error: errorStatus, refetch } = useQuery({
    queryKey:["nws-ceo-status",userId], enabled: Boolean(userId && isAdmin), retry:false,
    queryFn: async () => { const res=await rpc("nws_ceo_status");if(res.error)throw Error(res.error.message);return res.data as EstadoCEO; },
  });
  const ordem = useMemo(() => {
    const wanted = new Map((prefs.ordemMenu || []).map((chave,i)=>[chave,i]));
    return [...SECCOES].sort((a,b)=>(wanted.get(a.chave)??999)-(wanted.get(b.chave)??999));
  }, [prefs.ordemMenu]);
  function mover(chave:string,delta:number) {
    const atual=ordem.map(s=>s.chave);const from=atual.indexOf(chave);const to=from+delta;
    if(from<0||to<0||to>=atual.length)return;
    [atual[from],atual[to]]=[atual[to]!,atual[from]!];guardar({ordemMenu:atual});
  }
  function cancelar(){setOperacao(null);setTexto("");setPin("");setErro("");}
  async function executar(){
    const confirmacao=operacao==="archive"?"ARQUIVAR TODOS":"REPOR ARQUIVO";
    if(texto!==confirmacao||pin.length<6||!operacao||busy)return;
    setBusy(true);setErro("");
    try{
      const metodo=operacao==="archive"?"nws_ceo_archive_all":"nws_ceo_restore_latest";
      const res=await rpc(metodo,{p_pin:pin,p_confirmation:confirmacao});
      if(res.error)throw Error(res.error.message);
      const resultado=res.data as OperacaoResult;
      if(!resultado?.ok)throw Error("Operação recusada pelo servidor: PIN incorreto, permissões insuficientes ou sem arquivo disponível.");
      toast.success(operacao==="archive"?`${resultado.count??0} negócios arquivados. Podes repor os estados anteriores.`:`${resultado.restored??0} negócios repostos.`);
      cancelar();await Promise.all([qc.invalidateQueries({queryKey:["businesses"]}),qc.invalidateQueries({queryKey:["nws-ceo-status"]}),refetch()]);
    }catch(e){setErro(e instanceof Error?e.message:"Falha ao executar operação.");}
    finally{setBusy(false);setPin("");}
  }
  if(aCarregar)return <p className="p-8 text-sm text-muted-foreground">A confirmar permissões…</p>;
  if(!isAdmin)return <div className="rounded-2xl border border-red-500/30 p-7"><h1 className="text-xl font-bold">Acesso restrito</h1><p className="mt-2 text-sm text-muted-foreground">Esta área só está disponível a administradores.</p><Link className="text-violet-300 underline" to="/hub">Voltar ao Hub</Link></div>;
  return <main className="mx-auto max-w-5xl space-y-6 pb-12">
    <header className="rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-500/15 to-surface/60 p-6 sm:p-8">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-300"><ShieldCheck className="size-4"/> Administração principal</p>
      <h1 className="mt-3 text-3xl font-extrabold">Controlo CEO</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Organiza o teu espaço de trabalho e gere operações críticas com confirmação reforçada. Ocultar uma aba nunca altera permissões de acesso.</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-violet-200">Função: Administrador</span><span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-violet-200">{negocios.length} negócios atuais</span></div>
    </header>
    <section className="rounded-2xl border border-border/70 bg-surface/40 p-5 sm:p-6">
      <div className="flex items-center gap-2"><SlidersHorizontal className="size-5 text-violet-300"/><h2 className="text-lg font-bold">Personalizar abas do CRM</h2></div>
      <p className="mt-2 text-xs text-muted-foreground">Renomeia, ordena e mostra/oculta as secções do menu. Estas preferências são locais neste navegador; não apagam páginas nem mudam os acessos da equipa.</p>
      <div className="mt-5 space-y-2">{ordem.map((seccao,idx)=>
        <div key={seccao.chave} className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-background/45 p-2 sm:flex-nowrap">
          <div className="flex shrink-0 items-center gap-1"><button className="grid size-9 place-items-center rounded-lg border border-border/60 disabled:opacity-25" aria-label={`Subir ${seccao.label}`} disabled={idx===0} onClick={()=>mover(seccao.chave,-1)}><ArrowUp className="size-4"/></button><button className="grid size-9 place-items-center rounded-lg border border-border/60 disabled:opacity-25" aria-label={`Descer ${seccao.label}`} disabled={idx===ordem.length-1} onClick={()=>mover(seccao.chave,1)}><ArrowDown className="size-4"/></button></div>
          <label className="min-w-32 flex-1"><span className="sr-only">Nome de {seccao.label}</span><input className={CAMPO} value={prefs.rotulosSeccoes[seccao.chave]??""} placeholder={seccao.label} maxLength={45} onChange={e=>guardar({rotulosSeccoes:{...prefs.rotulosSeccoes,[seccao.chave]:e.target.value}})}/></label>
          <label className="flex min-w-28 items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" className="size-4 accent-violet-500" checked={prefs.seccoes.includes(seccao.chave)} onChange={e=>guardar({seccoes:e.target.checked?[...prefs.seccoes,seccao.chave]:prefs.seccoes.filter(x=>x!==seccao.chave)})}/> Visível</label>
        </div>
      )}</div>
      <button type="button" onClick={()=>guardar({ordemMenu:SECCOES.map(s=>s.chave),seccoes:SECCOES.map(s=>s.chave),rotulosSeccoes:{}})} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-border/70 px-4 text-xs font-bold hover:bg-surface-strong"><RotateCcw className="size-4"/> Repor menu padrão</button>
    </section>
    <section className="rounded-2xl border border-amber-400/25 bg-surface/40 p-5 sm:p-6">
      <div className="flex items-center gap-2"><LockKeyhole className="size-5 text-amber-300"/><h2 className="text-lg font-bold">Gestão total dos negócios</h2></div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Permite arquivar todos os negócios numa só operação e recuperar os estados anteriores. Não apaga definitivamente clientes, chamadas, propostas ou inquéritos.</p>
      {errorStatus && <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-500/5 p-3 text-xs text-amber-200">A proteção CEO ainda não foi configurada na base de dados. É necessário aplicar as migrações do PIN e CEO, identificando o teu utilizador real. Nenhuma operação em massa é permitida antes disso.</p>}
      {status && !status.owner && <p className="mt-4 text-xs text-amber-200">A função administrativa já está ativa, mas o teu utilizador ainda não foi designado proprietário CEO na base de dados.</p>}
      {status && !status.pinReady && <p className="mt-4 text-xs text-amber-200">Ativa primeiro o teu PIN na <Link to="/seguranca" className="underline">Central de Segurança</Link>.</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" disabled={!status?.owner||!status.pinReady||busy} onClick={()=>{cancelar();setOperacao("archive");}} className="min-h-11 rounded-xl border border-amber-400/45 bg-amber-400/5 px-4 text-xs font-bold text-amber-200 hover:bg-amber-400/10 disabled:opacity-40">Arquivar todos os negócios</button><button type="button" disabled={!status?.owner||!status.pinReady||!status.archives||busy} onClick={()=>{cancelar();setOperacao("restore");}} className="min-h-11 rounded-xl border border-violet-400/35 px-4 text-xs font-bold text-violet-200 hover:bg-violet-500/10 disabled:opacity-40">Repor último arquivo</button></div>
      <p className="mt-3 text-[11px] text-muted-foreground">Apagar definitivamente todos os dados está indisponível nesta versão: existem relações com tarefas, interações, propostas e satisfação que exigem um mecanismo de recuperação próprio.</p>
    </section>
    {operacao && <div className="fixed inset-0 z-[140] grid place-items-center bg-black/80 p-4" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="nws-ceo-confirm" className="w-full max-w-md rounded-3xl border border-amber-400/40 bg-background p-6 shadow-2xl"><div className="flex items-center gap-3"><AlertTriangle className="size-7 text-amber-300"/><h2 id="nws-ceo-confirm" className="text-xl font-extrabold">Confirmação reforçada</h2></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{operacao==="archive"?`Vais arquivar até ${negocios.filter(n=>n.estado!=="arquivado").length} negócios, preservando os seus dados.`:"Vais repor os estados anteriores do último arquivo disponível."}</p><label className="mt-5 block space-y-2 text-xs font-semibold">Escreve <strong>{operacao==="archive"?"ARQUIVAR TODOS":"REPOR ARQUIVO"}</strong><input className={CAMPO} value={texto} autoComplete="off" onChange={e=>setTexto(e.target.value)}/></label><label className="mt-3 block space-y-2 text-xs font-semibold">PIN de segurança<input className={CAMPO} type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,8))}/></label>{erro&&<p role="alert" className="mt-3 text-xs text-rose-300">{erro}</p>}<div className="mt-5 flex gap-2"><button type="button" disabled={busy} onClick={cancelar} className="min-h-11 flex-1 rounded-xl border border-border/70 text-xs font-bold">Cancelar</button><button type="button" disabled={busy||pin.length<6||texto!==(operacao==="archive"?"ARQUIVAR TODOS":"REPOR ARQUIVO")} onClick={()=>void executar()} className="min-h-11 flex-1 rounded-xl bg-amber-500 px-3 text-xs font-bold text-black disabled:opacity-40">{busy?"A confirmar…":<><Check className="mr-1 inline size-4"/> Confirmar</>}</button></div></div></div>}
  </main>;
}
