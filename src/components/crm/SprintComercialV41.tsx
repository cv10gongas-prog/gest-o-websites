import { Link } from "@tanstack/react-router";
import {
  ArrowRight, CalendarClock, Check, ClipboardCopy, ExternalLink, Globe2,
  Mail, Phone, Save, ShieldCheck, Sparkles, UserRound, Zap,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ESTADOS, estadoInfo, formatarData, type Business, type BusinessStatus } from "@/lib/crm";
import { useActualizarNegocio } from "@/lib/queries";
import { type ItemOperacao } from "@/lib/operacoes-v4";
import { cn } from "@/lib/utils";

const INPUT = "w-full rounded-xl border border-border/80 bg-surface-strong px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15";
const BOTAO = "inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-surface px-3.5 py-2.5 text-xs font-bold transition hover:border-violet-400/40 hover:bg-primary/10";

/** Usa só protocolos seguros para abrir websites e mantém a navegação nos dados reais. */
export function urlWebsite(valor?: string | null): string | null {
  if (!valor?.trim()) return null;
  try {
    const texto = valor.trim();
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(texto) ? texto : `https://${texto}`);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) return null;
    return url.href;
  } catch { return null; }
}

/** Uma data civil representa o dia inteiro: guardar ao meio-dia evita saltos de dia em UTC. */
export function dataSeguimentoISO(dia: string): string | null {
  if (!dia) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) throw new Error("Data inválida.");
  const d = new Date(`${dia}T12:00:00`);
  const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (Number.isNaN(d.getTime()) || local !== dia) throw new Error("Data inválida.");
  return d.toISOString();
}

function diaInput(valor: string | null): string {
  if (!valor) return "";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const ESTADOS_RAPIDOS: BusinessStatus[] = [
  "por_contactar", "tentativa_contacto", "aguardar_resposta", "email_por_enviar",
  "seguimento", "interessado", "reuniao", "em_negociacao",
];

function PainelAccao({ item, onAgendar }: { item: ItemOperacao; onAgendar: (id: string) => void }) {
  const n = item.negocio;
  const atualizar = useActualizarNegocio();
  const [estado, setEstado] = useState<BusinessStatus>(n.estado);
  const [seguimento, setSeguimento] = useState(diaInput(n.data_seguimento));
  const [acao, setAcao] = useState(n.proxima_acao ?? "");
  const website = urlWebsite(n.website);
  const podeLigar = Boolean(n.telefone?.replace(/[^\d+]/g, ""));
  const email = n.email?.trim() || "";
  const alterado = estado !== n.estado || seguimento !== diaInput(n.data_seguimento) || acao.trim() !== (n.proxima_acao || "").trim();
  const estadoPossivel = useMemo(() => {
    // Fichas com estados pouco frequentes mantêm o estado original disponível.
    return ESTADOS_RAPIDOS.includes(n.estado) ? ESTADOS_RAPIDOS : [n.estado, ...ESTADOS_RAPIDOS];
  }, [n.estado]);

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!alterado || atualizar.isPending) return;
    try {
      const patch: Partial<Business> = {};
      if (estado !== n.estado) patch.estado = estado;
      if (acao.trim() !== (n.proxima_acao || "").trim()) patch.proxima_acao = acao.trim() || null;
      if (seguimento !== diaInput(n.data_seguimento)) patch.data_seguimento = dataSeguimentoISO(seguimento);
      await atualizar.mutateAsync({ id: n.id, valores: patch, descricao: "atualizou a ação comercial no Modo Foco V4.1" });
      toast.success("Ação comercial atualizada no CRM.");
    } catch (erro) {
      // A mutação já mostra erros da base de dados; só acrescentar erros de validação.
      if (erro instanceof Error && erro.message === "Data inválida.") toast.error(erro.message);
    }
  }

  return <section className="rounded-2xl border border-violet-400/30 bg-[linear-gradient(145deg,rgba(104,59,178,.1),transparent_60%)] p-4 sm:p-6" aria-label={`Plano comercial de ${n.nome}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-violet-300"><Zap className="size-3.5"/> Plano de ação</p><h3 className="mt-2 break-words text-xl font-extrabold tracking-tight">{n.nome}</h3><p className="mt-1 text-xs text-muted-foreground">{[n.categoria,n.localidade].filter(Boolean).join(" · ") || "Negócio do CRM"}</p></div>
      <Link to="/negocios/$id" params={{ id: n.id }} className={BOTAO}>Abrir ficha <ArrowRight className="size-3.5"/></Link>
    </div>
    <div className="mt-5 grid gap-2 sm:grid-cols-2">
      {podeLigar ? <a className={BOTAO} href={`tel:${n.telefone!.replace(/[^\d+]/g, "")}`}><Phone className="size-4 text-emerald-300"/> {n.telefone}</a> : <span className="rounded-xl border border-dashed border-border/80 px-3.5 py-2.5 text-xs text-muted-foreground">Telefone em falta</span>}
      {email ? <a className={BOTAO} href={`mailto:${encodeURIComponent(email)}`}><Mail className="size-4 text-cyan-300"/><span className="max-w-[190px] truncate">{email}</span></a> : <span className="rounded-xl border border-dashed border-border/80 px-3.5 py-2.5 text-xs text-muted-foreground">Email em falta</span>}
      {website ? <a className={BOTAO} href={website} target="_blank" rel="noopener noreferrer"><Globe2 className="size-4 text-violet-300"/> Visitar website <ExternalLink className="size-3"/></a> : <span className="rounded-xl border border-dashed border-border/80 px-3.5 py-2.5 text-xs text-muted-foreground">Website não registado</span>}
      <Link to="/emails" search={{ negocio: n.id }} className={BOTAO}><Sparkles className="size-4 text-fuchsia-300"/> Preparar proposta</Link>
    </div>
    <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => onAgendar(n.id)} className={BOTAO}><CalendarClock className="size-4"/> Criar tarefa</button><button type="button" onClick={() => { const contacto = [n.nome,n.email,n.telefone,n.website].filter(Boolean).join("\n"); void navigator.clipboard.writeText(contacto).then(() => toast.success("Contacto copiado.")).catch(() => toast.error("Não foi possível copiar.")); }} className={BOTAO}><ClipboardCopy className="size-4"/> Copiar contacto</button></div>
    <form onSubmit={guardar} className="mt-5 space-y-4 border-t border-border/60 pt-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5"><span className="text-xs font-bold">Estado comercial</span><select value={estado} onChange={(e) => setEstado(e.target.value as BusinessStatus)} className={INPUT}>{estadoPossivel.map((s) => <option key={s} value={s}>{ESTADOS.find((x) => x.value === s)?.label ?? estadoInfo(s).label}</option>)}</select></label>
        <label className="space-y-1.5"><span className="text-xs font-bold">Próximo seguimento</span><input type="date" value={seguimento} onChange={(e) => setSeguimento(e.target.value)} className={INPUT}/></label>
      </div>
      <label className="block space-y-1.5"><span className="text-xs font-bold">Próxima ação</span><textarea rows={3} maxLength={1500} value={acao} onChange={(e) => setAcao(e.target.value)} placeholder="Ex.: ligar ao responsável na terça-feira para saber se analisou a proposta" className={cn(INPUT,"resize-y")}/></label>
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><ShieldCheck className="size-3.5"/> Não envia emails nem confirma propostas enviadas.</p><button disabled={!alterado || atualizar.isPending} type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"><Save className="size-4"/>{atualizar.isPending ? "A guardar..." : "Guardar alterações"}</button></div>
    </form>
  </section>;
}

export function SprintComercialV41({ fila, onAgendar }: { fila: ItemOperacao[]; onAgendar: (id: string) => void }) {
  // A seleção é local: não mexe em negócios até o utilizador guardar no formulário.
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const lista = fila.slice(0, 8);
  const atual = lista.find((x) => x.negocio.id === selecionado) ?? lista[0] ?? null;
  const urgentes = lista.filter((x) => x.urgencia !== "normal").length;
  const contactaveis = lista.filter((x) => Boolean(x.negocio.telefone || x.negocio.email)).length;
  return <div className="space-y-5 p-4 sm:p-6">
    <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-border/70 bg-surface/60 p-4"><p className="text-[11px] font-bold text-muted-foreground">Oportunidades no foco</p><strong className="mt-1 block text-2xl font-black">{lista.length}</strong></div><div className="rounded-xl border border-border/70 bg-surface/60 p-4"><p className="text-[11px] font-bold text-muted-foreground">Com prazo a tratar</p><strong className="mt-1 block text-2xl font-black text-amber-300">{urgentes}</strong></div><div className="rounded-xl border border-border/70 bg-surface/60 p-4"><p className="text-[11px] font-bold text-muted-foreground">Com email ou telefone</p><strong className="mt-1 block text-2xl font-black text-emerald-300">{contactaveis}</strong></div></div>
    {!atual ? <div className="rounded-xl border border-dashed border-border p-9 text-center"><Check className="mx-auto size-8 text-emerald-300"/><p className="mt-3 text-sm font-semibold">Sem oportunidades abertas</p><p className="mt-1 text-xs text-muted-foreground">Os negócios ativos aparecerão aqui assim que forem registados.</p><Link to="/negocios" className="mt-3 inline-flex gap-1 text-xs font-bold text-violet-300">Ver negócios <ArrowRight className="size-3.5"/></Link></div> : <div className="grid gap-4 lg:grid-cols-[minmax(220px,.85fr)_minmax(0,1.45fr)]">
      <div className="space-y-2"><p className="mb-3 text-[11px] font-bold uppercase tracking-[.15em] text-muted-foreground">Escolhe a próxima oportunidade</p>{lista.map((item,i) => <button type="button" key={item.negocio.id} onClick={() => setSelecionado(item.negocio.id)} aria-pressed={atual.negocio.id === item.negocio.id} className={cn("flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition focus-visible:outline-2 focus-visible:outline-violet-400", atual.negocio.id === item.negocio.id ? "border-violet-400/60 bg-violet-500/15" : "border-border/70 bg-surface/50 hover:border-violet-400/40 hover:bg-primary/5")}> <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-black text-violet-300">{String(i+1).padStart(2,"0")}</span><span className="min-w-0 flex-1"><strong className="block truncate text-xs">{item.negocio.nome}</strong><span className="mt-1 block text-[11px] text-muted-foreground">{item.motivo}</span>{item.negocio.data_seguimento && <span className="mt-1 block text-[10px] text-muted-foreground">Seguimento: {formatarData(item.negocio.data_seguimento)}</span>}</span><span title={item.urgencia === "alta" ? "Prazo ultrapassado" : item.urgencia === "media" ? "Prazo para hoje" : "Sem prazo urgente"} className={cn("mt-2 size-2 shrink-0 rounded-full",item.urgencia === "alta" ? "bg-rose-400" : item.urgencia === "media" ? "bg-amber-400" : "bg-violet-400")}/></button>)}<p className="pt-2 text-[11px] leading-5 text-muted-foreground">As sugestões seguem a prioridade e os prazos do CRM. Podes escolher qualquer negócio da lista.</p></div>
      <PainelAccao key={atual.negocio.id} item={atual} onAgendar={onAgendar}/>
    </div>}
  </div>;
}
