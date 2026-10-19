import { LockKeyhole, ShieldCheck, ShieldOff, X, Loader2, KeyRound, AlertTriangle } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { definirPin, desativarPin, estadoProtecaoPin, validarPin, type EstadoPin, type OperacaoProtegida, type TabelaProtegida } from "@/lib/pin-protection";

type PedidoPin = {
  tabela: TabelaProtegida;
  operacao: OperacaoProtegida;
  descricao: string;
  resolve: (aprovado: boolean) => void;
};
const campo = "w-full rounded-xl border border-border/70 bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-violet-400";

/** O PIN só é pedido quando a base de dados declarou que a proteção está ativa. */
export function PinGateProvider({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<PedidoPin | null>(null);
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const ouvir = (evento: Event) => {
      const proximo = (evento as CustomEvent<PedidoPin>).detail;
      setPedido((atual) => { if (atual) { proximo.resolve(false); return atual; } return proximo; });
      setCodigo(""); setErro("");
    };
    window.addEventListener("nws:pin-request", ouvir);
    return () => window.removeEventListener("nws:pin-request", ouvir);
  }, []);

  function cancelar() {
    if (busy) return;
    pedido?.resolve(false);
    setPedido(null);
    setCodigo(""); setErro("");
  }
  async function confirmar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!pedido || busy) return;
    setBusy(true); setErro("");
    try {
      const ok = await validarPin(codigo, pedido.tabela, pedido.operacao);
      if (!ok) { setErro("PIN incorreto ou temporariamente bloqueado. Verifica o código e tenta novamente."); return; }
      pedido.resolve(true);
      setPedido(null); setCodigo("");
    } catch (e) { setErro(e instanceof Error ? e.message : "Falha ao validar o PIN."); }
    finally { setBusy(false); }
  }
  return <>
    {children}
    {pedido && <div className="fixed inset-0 z-[120] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="nws-pin-title" className="w-full max-w-md rounded-3xl border border-violet-400/30 bg-background p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-violet-500/15 text-violet-300"><LockKeyhole className="size-6"/></span><button type="button" onClick={cancelar} aria-label="Cancelar" className="rounded-lg p-2 hover:bg-white/10"><X className="size-5"/></button></div>
        <h2 id="nws-pin-title" className="mt-4 text-xl font-extrabold">Confirmar com PIN</h2>
        <p className="mt-2 text-sm text-muted-foreground">{pedido.descricao}. Esta confirmação é validada na base de dados e autoriza uma única operação durante 60 segundos.</p>
        <form onSubmit={(e)=>void confirmar(e)} className="mt-5 space-y-3">
          <label className="block space-y-2 text-xs font-semibold">PIN de segurança
            <input autoFocus autoComplete="off" inputMode="numeric" type="password" minLength={6} maxLength={8} pattern="[0-9]{6,8}" value={codigo} onChange={e=>setCodigo(e.target.value.replace(/\D/g,""))} className={campo} placeholder="6 a 8 algarismos" required />
          </label>
          {erro && <p role="alert" className="text-xs text-rose-400">{erro}</p>}
          <div className="flex gap-2"><button type="button" onClick={cancelar} className="min-h-11 flex-1 rounded-xl border border-border/70 text-xs font-bold">Cancelar</button><button type="submit" disabled={busy || codigo.length<6} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 text-xs font-bold text-white disabled:opacity-50">{busy && <Loader2 className="size-4 animate-spin"/>} Confirmar</button></div>
        </form>
      </div>
    </div>}
  </>;
}

export function PinSettings() {
  const [estado, setEstado] = useState<EstadoPin | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [novo, setNovo] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [antigo, setAntigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  async function atualizar() {
    try { setEstado(await estadoProtecaoPin()); setErro(null); }
    catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível verificar o PIN."); }
    finally { setLoading(false); }
  }
  useEffect(()=>{void atualizar();}, []);
  async function ativar(evento: FormEvent) {
    evento.preventDefault();
    if (novo !== confirmacao) {setErro("A confirmação não coincide com o novo PIN.");return;}
    setBusy(true);setErro(null);
    try {
      const ok = await definirPin(novo, estado?.configured ? antigo : null);
      if (!ok) {setErro("PIN atual incorreto ou temporariamente bloqueado.");return;}
      setNovo("");setConfirmacao("");setAntigo("");
      toast.success("PIN ativado. As alterações abrangidas passam a exigir confirmação.");
      await atualizar();
    } catch(e){setErro(e instanceof Error ? e.message : "Não foi possível guardar o PIN.");}
    finally {setBusy(false);}
  }
  async function desativar() {
    if (!antigo) {setErro("Introduz o PIN atual para o desativar.");return;}
    setBusy(true);setErro(null);
    try {const ok=await desativarPin(antigo);if(!ok){setErro("PIN atual incorreto ou temporariamente bloqueado.");return;}
      toast.success("Proteção por PIN desativada.");setAntigo("");await atualizar();
    }catch(e){setErro(e instanceof Error ? e.message:"Erro ao desativar PIN.");}
    finally{setBusy(false);}
  }
  return <section className="rounded-3xl border border-violet-400/30 bg-surface/70 p-5 sm:p-7" aria-labelledby="nws-security-pin">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-300"><KeyRound className="size-5"/></span><div><h2 id="nws-security-pin" className="text-lg font-bold">PIN de operações sensíveis</h2><p className="text-xs text-muted-foreground">Proteção adicional por utilizador, opcional, com verificação na base de dados.</p></div></div>
      {loading ? <span className="text-xs text-muted-foreground">A verificar…</span> : <span className={`rounded-full px-3 py-1 text-xs font-bold ${estado?.enabled ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>{estado?.enabled ? "Ativo" : "Desativado"}</span>}
    </div>
    {!estado?.available && !loading && <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-300"><AlertTriangle className="size-4 shrink-0"/> Para ativar, primeiro é necessário aplicar a migração SQL `20261016_nws_pin_protecao.sql` na base de dados Lovable Cloud. O CRM continua funcional até lá.</p>}
    <p className="mt-4 text-xs leading-5 text-muted-foreground">Quando ativo, solicita PIN em cada criação/edição/eliminação de negócio, edição/eliminação de tarefas, edição de modelos de email e projetos. A base de dados impede operações nessas tabelas sem autorização individual. Outras operações da plataforma ainda seguem as permissões atuais.</p>
    {estado?.available && <form onSubmit={(e)=>void ativar(e)} className="mt-5 grid gap-3 sm:grid-cols-2">
      {estado.configured && <label className="space-y-1 text-xs font-semibold sm:col-span-2">PIN atual <input type="password" autoComplete="off" inputMode="numeric" value={antigo} onChange={e=>setAntigo(e.target.value.replace(/\D/g,""))} className={campo} placeholder="Necessário para alterar ou desativar"/></label>}
      <label className="space-y-1 text-xs font-semibold">{estado.enabled ? "Novo PIN (se quiseres mudar)" : "Definir PIN"}<input type="password" autoComplete="off" inputMode="numeric" minLength={6} maxLength={8} pattern="[0-9]{6,8}" value={novo} onChange={e=>setNovo(e.target.value.replace(/\D/g,""))} className={campo} placeholder="6 a 8 algarismos" required/></label>
      <label className="space-y-1 text-xs font-semibold">Confirmar PIN<input type="password" autoComplete="off" inputMode="numeric" minLength={6} maxLength={8} pattern="[0-9]{6,8}" value={confirmacao} onChange={e=>setConfirmacao(e.target.value.replace(/\D/g,""))} className={campo} placeholder="Repete o PIN" required/></label>
      <div className="flex flex-wrap gap-2 sm:col-span-2"><button disabled={busy||novo.length<6} type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-xs font-bold text-white disabled:opacity-50"><ShieldCheck className="size-4"/>{estado.enabled ? "Alterar PIN" : "Ativar proteção"}</button>{estado.enabled && <button type="button" disabled={busy} onClick={()=>void desativar()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-rose-400/30 px-5 text-xs font-bold text-rose-300 disabled:opacity-50"><ShieldOff className="size-4"/>Desativar com PIN atual</button>}</div>
    </form>}
    {erro && <p role="alert" className="mt-3 text-xs text-rose-400">{erro}</p>}
    <p className="mt-3 text-[11px] leading-5 text-muted-foreground">5 tentativas incorretas bloqueiam a validação durante 15 minutos. Não guardes o PIN nas notas do projeto. Se perderes o PIN, é necessária uma recuperação administrativa controlada na base de dados.</p>
  </section>;
}
