import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity, AlertTriangle, ArrowRight, ArrowUpRight, BadgeCheck, BriefcaseBusiness,
  CalendarClock, Check, CheckCheck, ChevronDown, CircleDollarSign, Clock3,
  Filter, Globe2, ListChecks, Mail, Phone, Plus, Radar, RefreshCcw,
  Search, ShieldCheck, Sparkles, TrendingUp, Users, X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DialogTarefa } from "@/components/crm/DialogTarefa";
import { SprintComercialV41 } from "@/components/crm/SprintComercialV41";
import { estadoInfo, formatarData, formatarMoeda, type Business, type Task } from "@/lib/crm";
import { useAlternarTarefa, useBusinesses, useTasks } from "@/lib/queries";
import {
  encontrarParesDuplicados, filtrarOperacoes, prepararOperacoes, type FiltroOperacoes,
  type ItemOperacao,
} from "@/lib/operacoes-v4";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/operacoes")({
  head: () => ({ meta: [
    { title: "Sala de Operações — NWS HUB V4.2" },
    { name: "description", content: "Fila de trabalho comercial, tarefas e qualidade dos dados do CRM." },
    { name: "robots", content: "noindex" },
  ] }),
  component: SalaOperacoes,
});

type Vista = "foco" | "fila" | "agenda" | "visao";
const FILTROS: { value: FiltroOperacoes; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "urgentes", label: "Urgentes" },
  { value: "seguimentos", label: "Seguimentos" },
  { value: "propostas", label: "Propostas" },
  { value: "novos", label: "Por contactar" },
];

const BTN = "inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-surface/65 px-3.5 py-2 text-xs font-semibold text-foreground transition hover:border-primary/50 hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function CartaoMetrica({ titulo, valor, nota, icone: Icon, cor = "violet" }: {
  titulo: string; valor: string | number; nota: string;
  icone: typeof Activity; cor?: "violet" | "amber" | "emerald" | "cyan";
}) {
  const fundos = { violet: "bg-violet-400/10 text-violet-300", amber: "bg-amber-400/10 text-amber-300", emerald: "bg-emerald-400/10 text-emerald-300", cyan: "bg-cyan-400/10 text-cyan-300" };
  return <div className="min-w-0 rounded-[22px] border border-border/60 bg-surface/55 p-4 sm:p-5 shadow-sm backdrop-blur-lg">
    <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-bold uppercase tracking-[.1em] text-muted-foreground">{titulo}</span><div className={cn("grid size-9 shrink-0 place-items-center rounded-xl", fundos[cor])}><Icon className="size-4" /></div></div>
    <div className="mt-2 truncate text-3xl font-black tracking-tight tabular-nums sm:text-4xl">{valor}</div>
    <p className="mt-1.5 text-xs text-muted-foreground">{nota}</p>
  </div>;
}

function LinhaNegocio({ item, agendar, emMudanca }: { item: ItemOperacao; agendar: (id: string) => void; emMudanca: boolean }) {
  const { negocio: n } = item;
  const estilo = item.urgencia === "alta" ? "border-rose-400/40 bg-rose-400/10 text-rose-200" : item.urgencia === "media" ? "border-amber-400/40 bg-amber-400/10 text-amber-200" : "border-border/70 bg-surface-strong/50 text-muted-foreground";
  return <article className="group grid gap-4 border-b border-border/50 px-4 py-4 transition hover:bg-primary/[.045] last:border-b-0 sm:px-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_auto] xl:items-center">
    <div className="flex min-w-0 items-start gap-3">
      <span className={cn("mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border", estilo)} aria-label={item.urgencia === "alta" ? "Urgência alta" : item.urgencia === "media" ? "Para hoje" : "Prioridade normal"}>
        {item.urgencia === "alta" ? <AlertTriangle className="size-4"/> : item.urgencia === "media" ? <Clock3 className="size-4"/> : <BriefcaseBusiness className="size-4"/>}
      </span>
      <div className="min-w-0">
        <Link to="/negocios/$id" params={{ id: n.id }} className="group/link flex w-fit max-w-full items-center gap-1 truncate text-sm font-bold hover:text-violet-300">
          <span className="truncate">{n.nome}</span><ArrowUpRight className="size-3.5 shrink-0 opacity-0 transition group-hover/link:opacity-100"/>
        </Link>
        <p className="mt-1 text-[11px] text-muted-foreground">{[n.localidade, n.categoria].filter(Boolean).join(" · ") || "Sem localidade ou categoria"}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-muted-foreground">{estadoInfo(n.estado).label}</span>
          {n.prioridade === "alta" && <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300">Prioridade alta</span>}
          {n.valor_estimado !== null && n.valor_estimado > 0 && <span className="text-[10px] font-semibold text-emerald-300">{formatarMoeda(n.valor_estimado)}</span>}
        </div>
      </div>
    </div>
    <div className="min-w-0 space-y-1">
      <div className="flex items-center gap-2"><span className={cn("size-1.5 shrink-0 rounded-full", item.urgencia === "alta" ? "bg-rose-400" : item.urgencia === "media" ? "bg-amber-400" : "bg-violet-400")} /><span className="text-xs font-bold">{item.motivo}</span></div>
      <p className="line-clamp-2 pl-3.5 text-[11px] text-muted-foreground">{item.detalhe}</p>
      {n.data_seguimento && <p className="pl-3.5 text-[11px] text-muted-foreground">Seguimento: {formatarData(n.data_seguimento, true)}</p>}
    </div>
    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
      <button type="button" className={BTN} onClick={() => agendar(n.id)} disabled={emMudanca} title="Criar tarefa associada a este negócio"><CalendarClock className="size-3.5 text-cyan-300" /> Agendar</button>
      <Link to="/emails" search={{ negocio: n.id }} className={BTN} title="Preparar proposta (não envia emails)"><Mail className="size-3.5 text-violet-300" /> Proposta</Link>
      <Link to="/negocios/$id" params={{ id: n.id }} className={cn(BTN, "bg-primary/15 text-violet-200 border-primary/30")} aria-label={`Abrir ficha de ${n.nome}`}><ArrowRight className="size-3.5" /></Link>
    </div>
  </article>;
}

function LinhaTarefa({ tarefa, negocio, aoConcluir, ocupado }: { tarefa: Task; negocio?: Business; aoConcluir: (t: Task) => void; ocupado: boolean }) {
  const tituloData = tarefa.data_hora ? formatarData(tarefa.data_hora, true) : "Sem data";
  return <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-surface/45 p-3.5 transition hover:border-primary/30">
    <button type="button" disabled={ocupado} aria-label={`Concluir tarefa: ${tarefa.titulo}`} title="Marcar como concluída" onClick={() => aoConcluir(tarefa)} className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-border/80 text-muted-foreground transition hover:border-emerald-400/40 hover:text-emerald-300 disabled:opacity-40"><Check className="size-4"/></button>
    <div className="min-w-0 flex-1"><p className="text-xs font-semibold leading-5">{tarefa.titulo}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{tituloData}</p>
    {negocio && <Link to="/negocios/$id" params={{ id: negocio.id }} className="mt-1 block truncate text-[11px] text-violet-300 hover:underline">{negocio.nome}</Link>}</div>
  </div>;
}

function SalaOperacoes() {
  const { data: negocios = [], isLoading: aCarregarNegocios, isError: erroNegocios, refetch: recarregarNegocios, isFetching: recarregaN } = useBusinesses();
  const { data: tarefas = [], isLoading: aCarregarTarefas, isError: erroTarefas, refetch: recarregarTarefas, isFetching: recarregaT } = useTasks();
  const alternar = useAlternarTarefa();
  const [vista, setVista] = useState<Vista>("foco");
  const [filtro, setFiltro] = useState<FiltroOperacoes>("todas");
  const [pesquisa, setPesquisa] = useState("");
  const [limite, setLimite] = useState(15);
  const [agendamento, setAgendamento] = useState<{ id: string; sessao: number } | null>(null);
  const [sessao, setSessao] = useState(0);

  const dados = useMemo(() => prepararOperacoes(negocios, tarefas), [negocios, tarefas]);
  const lista = useMemo(() => filtrarOperacoes(dados.fila, filtro, pesquisa), [dados.fila, filtro, pesquisa]);
  const duplicados = useMemo(() => encontrarParesDuplicados(negocios), [negocios]);
  const tarefasPendentes = useMemo(() => {
    const hoje = new Date().getTime();
    return [...dados.pendentes].sort((a,b) => {
      // Vencidas e próximas primeiro; as sem prazo ficam no fim.
      const da = a.data_hora ? new Date(a.data_hora).getTime() : Number.MAX_SAFE_INTEGER;
      const db = b.data_hora ? new Date(b.data_hora).getTime() : Number.MAX_SAFE_INTEGER;
      return (Number.isNaN(da) ? hoje : da) - (Number.isNaN(db) ? hoje : db);
    });
  }, [dados.pendentes]);
  const contagemUrgentes = dados.fila.filter((n) => n.urgencia !== "normal").length;
  const aCarregar = aCarregarNegocios || aCarregarTarefas;
  const temErro = erroNegocios || erroTarefas;
  const refazer = () => { void recarregarNegocios(); void recarregarTarefas(); };
  const agendar = (id: string) => { setSessao((s) => s + 1); setAgendamento({ id, sessao: sessao + 1 }); };

  return <div className="space-y-6 pb-12 sm:space-y-7">
    <section className="relative isolate overflow-hidden rounded-[28px] border border-violet-400/20 bg-[radial-gradient(ellipse_at_86%_22%,rgba(109,40,217,.27),transparent_48%),linear-gradient(120deg,rgba(24,21,51,.97),rgba(16,22,43,.92))] px-5 py-7 shadow-2xl shadow-violet-950/10 sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute -bottom-28 right-1/4 size-72 rounded-full bg-cyan-500/10 blur-3xl"/>
      <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.24em] text-violet-300"><Sparkles className="size-3.5"/> NWS Intelligence <span className="rounded-full border border-violet-400/30 px-2 py-0.5 tracking-normal">V4.2</span></p>
          <h1 className="mt-4 text-3xl font-black tracking-[-.045em] text-white sm:text-4xl">Sala de <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">Operações.</span></h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Encontra o próximo contacto certo, prepara propostas e acompanha cada oportunidade. Agora com o Modo Foco: trata contactos, prepara propostas e agenda seguimentos sem perder tempo entre páginas.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-slate-300"><span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-emerald-200"><span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-400"/> Dados reais do CRM</span><span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">Sem envios automáticos</span><span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">Sem nova base de dados</span></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/descobrir" className="inline-flex items-center gap-2 rounded-xl border border-violet-300/35 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"><Radar className="size-4"/> Descobrir leads</Link>
          <Link to="/emails" search={{}} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-400"><Mail className="size-4"/> Email Studio <ArrowRight className="size-3.5"/></Link>
        </div>
      </div>
    </section>

    {temErro && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200"><span>Não foi possível carregar todos os dados do CRM. As contagens podem estar incompletas.</span><button type="button" onClick={refazer} className={BTN}>Tentar novamente</button></div>}

    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-base font-extrabold tracking-tight">Visão comercial</h2><p className="mt-1 text-xs text-muted-foreground">Valores calculados a partir dos negócios e tarefas existentes.</p></div><button type="button" onClick={refazer} disabled={recarregaN || recarregaT} className={BTN}><RefreshCcw className={cn("size-3.5", (recarregaN || recarregaT) && "animate-spin")}/> Atualizar</button></div>

    {aCarregar && <div role="status" className="animate-pulse rounded-2xl border border-border/70 bg-surface/50 px-5 py-4 text-sm text-muted-foreground">A carregar informações do CRM...</div>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <CartaoMetrica titulo="Ações com prazo" valor={contagemUrgentes} nota="Negócios com tarefas ou seguimentos para tratar" icone={ListChecks} cor="violet" />
      <CartaoMetrica titulo="Tarefas atrasadas" valor={dados.atrasadas.length} nota={`${dados.paraHoje.length} tarefas para hoje`} icone={AlertTriangle} cor="amber"/>
      <CartaoMetrica titulo="Propostas em curso" valor={dados.propostas.length} nota={`${dados.porContactar.length} negócios por contactar`} icone={Mail} cor="cyan"/>
      <CartaoMetrica titulo="Negócios ganhos" valor={dados.ganhas.length} nota={`${formatarMoeda(dados.valorGanho)} em valor estimado`} icone={BadgeCheck} cor="emerald"/>
    </div>

    <section className="overflow-hidden rounded-[24px] border border-border/70 bg-surface/45 shadow-sm backdrop-blur-md">
      <div className="flex flex-col gap-4 border-b border-border/70 px-4 py-4 sm:px-6 sm:py-5 xl:flex-row xl:items-center xl:justify-between">
        <div><h2 className="text-base font-extrabold">O teu centro de ação</h2><p className="mt-1 text-xs text-muted-foreground">Modo Foco com ações rápidas, lista completa, tarefas e análise comercial.</p></div>
        <div className="flex flex-wrap gap-1 rounded-xl border border-border/70 bg-surface-strong/50 p-1" role="tablist" aria-label="Vistas da Sala de Operações">
          {([ ["foco","Modo Foco",Sparkles], ["fila","Fila de ações",ListChecks], ["agenda","Tarefas",CalendarClock], ["visao","Análise",TrendingUp] ] as const).map(([value,label,Icon]) => <button type="button" key={value} role="tab" aria-selected={vista === value} onClick={() => setVista(value)} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition", vista === value ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground")}><Icon className="size-3.5"/>{label}</button>)}
        </div>
      </div>

      {vista === "foco" && <SprintComercialV41 fila={dados.fila} onAgendar={agendar} />}

      {vista === "fila" && <>
        <div className="grid gap-3 border-b border-border/60 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(180px,1fr)_auto] lg:items-center">
          <label className="relative block"><span className="sr-only">Pesquisar negócios</span><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><input type="search" value={pesquisa} onChange={(e) => { setPesquisa(e.target.value); setLimite(15); }} placeholder="Pesquisar por nome, localidade, email..." className="w-full rounded-xl border border-border/80 bg-surface/80 py-2.5 pl-10 pr-4 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10"/></label>
          <div className="flex flex-wrap items-center gap-1.5"><Filter className="mr-1 size-3.5 text-muted-foreground"/><label className="sr-only" htmlFor="filtro-v4">Filtro de oportunidades</label><select id="filtro-v4" value={filtro} onChange={(e) => { setFiltro(e.target.value as FiltroOperacoes); setLimite(15); }} className="rounded-xl border border-border/80 bg-surface-strong p-2.5 text-xs font-semibold text-foreground outline-none focus:border-violet-400">{FILTROS.map((f) => <option value={f.value} key={f.value}>{f.label}</option>)}</select><span className="ml-2 text-[11px] text-muted-foreground tabular-nums">{lista.length} resultados</span>{(pesquisa || filtro !== "todas") && <button type="button" onClick={() => { setPesquisa(""); setFiltro("todas"); }} className="rounded-lg p-2 text-muted-foreground hover:text-foreground" aria-label="Limpar pesquisa e filtro"><X className="size-4"/></button>}</div>
        </div>
        {lista.length === 0 ? <div className="px-4 py-12 text-center"><CheckCheck className="mx-auto size-8 text-violet-300"/><p className="mt-3 text-sm font-semibold">Nenhuma oportunidade encontrada</p><p className="mt-1 text-xs text-muted-foreground">Altera os filtros ou adiciona negócios no CRM.</p><Link to="/negocios" className={cn(BTN,"mt-4")}>Abrir negócios</Link></div> : <div>{lista.slice(0,limite).map((item) => <LinhaNegocio key={item.negocio.id} item={item} agendar={agendar} emMudanca={false}/>)}</div>}
        {lista.length > limite && <div className="border-t border-border/60 p-4 text-center"><button className={BTN} type="button" onClick={() => setLimite((v) => v + 25)}>Mostrar mais {Math.min(25,lista.length-limite)} <ChevronDown className="size-3.5" /></button></div>}
      </>}

      {vista === "agenda" && <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><div className="mb-3 flex items-center justify-between gap-2"><h3 className="text-sm font-bold">Próximas tarefas pendentes</h3><Link to="/tarefas" className="text-xs text-violet-300 hover:underline">Abrir agenda completa</Link></div>
          {tarefasPendentes.length ? <div className="grid gap-2 md:grid-cols-2">{tarefasPendentes.slice(0,12).map((t) => <LinhaTarefa key={t.id} tarefa={t} negocio={negocios.find((n) => n.id === t.business_id)} ocupado={alternar.isPending} aoConcluir={(tarefa) => alternar.mutate(tarefa)} />)}</div> : <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">Sem tarefas pendentes neste momento.</div>}
        </div>
        <div className="space-y-3 rounded-2xl border border-border/70 bg-surface-strong/40 p-5"><h3 className="text-sm font-bold">Organiza o dia</h3><p className="text-xs leading-6 text-muted-foreground">Concluir uma tarefa altera o respetivo estado no CRM. Não modifica a fase do negócio nem envia mensagens.</p>
          <div className="grid gap-2 text-xs"><p className="flex justify-between"><span className="text-muted-foreground">Vencidas</span><strong>{dados.atrasadas.length}</strong></p><p className="flex justify-between"><span className="text-muted-foreground">Para hoje</span><strong>{dados.paraHoje.length}</strong></p><p className="flex justify-between"><span className="text-muted-foreground">Sem data</span><strong>{dados.semData.length}</strong></p></div>
          <Link to="/tarefas" className={cn(BTN,"mt-3 w-full")}><Plus className="size-4"/> Criar tarefa</Link></div>
      </div>}

      {vista === "visao" && <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl border border-border/70 bg-surface/45 p-5"><h3 className="text-sm font-bold">Distribuição da carteira</h3><p className="mb-5 mt-1 text-xs text-muted-foreground">Quantidade de negócios em cada grupo, sem contar arquivados ou recusados.</p>
        {([ ["Por contactar",dados.porContactar.length,"bg-violet-400"], ["Propostas em curso",dados.propostas.length,"bg-cyan-400"], ["Outras fases ativas",Math.max(0,dados.ativas.length-dados.porContactar.length-dados.propostas.length),"bg-amber-400"], ["Ganhos",dados.ganhas.length,"bg-emerald-400"] ] as const).map(([nome,quantidade,cor]) => <div key={nome} className="mb-4"><div className="mb-1.5 flex justify-between gap-3 text-xs"><span>{nome}</span><span className="font-mono tabular-nums text-muted-foreground">{quantidade}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-surface-strong"><div className={cn("h-full rounded-full transition-all",cor)} style={{ width: `${Math.round(quantidade / Math.max(1, dados.ativas.length + dados.ganhas.length) * 100)}%` }}/></div></div>)}
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface/45 p-5"><h3 className="text-sm font-bold">Montantes registados</h3><p className="mt-1 text-xs text-muted-foreground">Estimações dos negócios, não faturação recebida.</p><p className="mt-5 text-[11px] uppercase tracking-widest text-muted-foreground">Pipeline ativo</p><p className="mt-1 text-3xl font-black tabular-nums">{formatarMoeda(dados.valorAberto)}</p><p className="mt-5 text-[11px] uppercase tracking-widest text-muted-foreground">Negócios ganhos (valor estimado)</p><p className="mt-1 text-2xl font-black tabular-nums text-emerald-300">{formatarMoeda(dados.valorGanho)}</p><div className="mt-6 flex flex-wrap gap-2"><Link to="/pipeline" className={BTN}><TrendingUp className="size-3.5"/> Ver pipeline</Link><Link to="/negocios" className={BTN}>Ver CRM <ArrowRight className="size-3.5"/></Link></div></div>
      </div>}
    </section>

    <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      <section className="rounded-[24px] border border-border/70 bg-surface/45 p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="flex items-center gap-2 text-sm font-extrabold"><ShieldCheck className="size-4 text-violet-300"/> Qualidade da carteira</h2><p className="mt-1 text-xs text-muted-foreground">Possíveis fichas repetidas para rever. Nunca são fundidas nem apagadas.</p></div><span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-xs font-bold text-violet-300">{duplicados.length}</span></div>
        {duplicados.length ? <div className="mt-4 space-y-2">{duplicados.slice(0,5).map((par) => <div key={`${par.primeiro.id}-${par.segundo.id}`} className="rounded-xl border border-border/70 bg-surface/55 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">{par.motivo}</p><div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"><Link to="/negocios/$id" params={{id:par.primeiro.id}} className="font-semibold text-violet-300 hover:underline">{par.primeiro.nome}</Link><span className="text-muted-foreground">↔</span><Link to="/negocios/$id" params={{id:par.segundo.id}} className="font-semibold text-violet-300 hover:underline">{par.segundo.nome}</Link></div></div>)}</div> : <p className="mt-4 rounded-xl border border-dashed border-border/70 p-4 text-xs text-muted-foreground">Nenhum duplicado evidente nos negócios carregados.</p>}
        {duplicados.length > 5 && <p className="mt-3 text-xs text-muted-foreground">A apresentar as primeiras 5 de {duplicados.length} coincidências.</p>}
        <p className="mt-4 text-[11px] text-muted-foreground">{dados.semContactoRelevante} fichas ativas sem email, telefone nem website.</p>
      </section>
      <section className="rounded-[24px] border border-border/70 bg-surface/45 p-5 sm:p-6"><h2 className="flex items-center gap-2 text-sm font-extrabold"><Globe2 className="size-4 text-cyan-300"/> Do lead ao cliente</h2><p className="mt-1 text-xs text-muted-foreground">Os teus três próximos passos, ligados às ferramentas que já usas.</p><div className="mt-5 space-y-3">
        <Link to="/descobrir" className="group flex items-center gap-3 rounded-xl border border-border/70 bg-surface/55 p-3.5 transition hover:border-violet-400/40 hover:bg-violet-500/10"><span className="font-mono text-[10px] font-bold text-violet-300">01</span><span className="grid size-9 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Radar className="size-4"/></span><span className="flex-1"><strong className="block text-xs">Encontrar empresas</strong><span className="mt-0.5 block text-[11px] text-muted-foreground">Pesquisa de negócios locais</span></span><ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-violet-300"/></Link>
        <Link to="/analisar" className="group flex items-center gap-3 rounded-xl border border-border/70 bg-surface/55 p-3.5 transition hover:border-violet-400/40 hover:bg-violet-500/10"><span className="font-mono text-[10px] font-bold text-violet-300">02</span><span className="grid size-9 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Activity className="size-4"/></span><span className="flex-1"><strong className="block text-xs">Analisar o website</strong><span className="mt-0.5 block text-[11px] text-muted-foreground">Identificar oportunidades reais</span></span><ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-violet-300"/></Link>
        <Link to="/emails" search={{}} className="group flex items-center gap-3 rounded-xl border border-border/70 bg-surface/55 p-3.5 transition hover:border-violet-400/40 hover:bg-violet-500/10"><span className="font-mono text-[10px] font-bold text-violet-300">03</span><span className="grid size-9 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Mail className="size-4"/></span><span className="flex-1"><strong className="block text-xs">Preparar proposta</strong><span className="mt-0.5 block text-[11px] text-muted-foreground">Personalizar o email para o cliente</span></span><ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-violet-300"/></Link>
      </div></section>
    </div>
    <p className="text-center text-[11px] text-muted-foreground">NWS HUB V4.2.0 · Modo Foco: ações manuais e prioridades sugeridas com base nos dados registados. Nenhum email é enviado a partir desta página.</p>
    {agendamento && <DialogTarefa key={`${agendamento.id}-${agendamento.sessao}`} aberto={true} onFechar={() => setAgendamento(null)} businessIdInicial={agendamento.id} />}
  </div>;
}
