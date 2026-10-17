import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity, AlertTriangle, ArrowRight, ArrowUpRight, BarChart3, BriefcaseBusiness,
  CalendarClock, CheckCheck, ChevronRight, CircleDollarSign, Clock3,
  ContactRound, Globe, ListTodo, Radar, ShieldCheck, Sparkles, TrendingUp,
  Users, type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useUtilizador } from "@/hooks/useAuth";
import { estadoInfo, formatarMoeda, type Business } from "@/lib/crm";
import { useBusinesses, useInteractions, useOpportunities, useProjects, useTasks, useWebsiteRequests } from "@/lib/queries";
import { dataLocal, prepararOperacoes } from "@/lib/operacoes-v4";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/direcao")({
  head: () => ({ meta: [
    { title: "Dashboard CEO — Nova Web Studio" },
    { name: "description", content: "Panorama privado da atividade comercial da Nova Web Studio." },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: DashboardCEO,
});

type Periodo = 30 | 90 | 180;
const card = "rounded-[22px] border border-border/65 bg-surface/65 shadow-sm backdrop-blur-lg";
const btn = "inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-surface-strong/60 px-3.5 py-2.5 text-xs font-bold text-foreground transition hover:border-violet-400/45 hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary";
const propostas = new Set(["email_por_enviar", "proposta_enviada", "em_negociacao"]);
const cores = ["bg-violet-400", "bg-cyan-400", "bg-emerald-400", "bg-amber-400", "bg-fuchsia-400", "bg-slate-400"];

function formatarDataCurta(data: Date) {
  return new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "short" }).format(data);
}
function diaDe(valor: string | null | undefined) {
  if (!valor) return "";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "" : dataLocal(d);
}
function agruparSemanas(inicio: Date, dias: number, negocios: Business[], interacoes: { ocorreu_em: string }[]) {
  const quantidade = Math.ceil(dias / 7);
  const pontos = Array.from({ length: quantidade }, (_, i) => {
    const inicioGrupo = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i * 7);
    return { chave: dataLocal(inicioGrupo), inicio: inicioGrupo, titulo: formatarDataCurta(inicioGrupo), leads: 0, contactos: 0 };
  });
  const inicioMs = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()).getTime();
  function indice(v: string) {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return -1;
    const data = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return Math.floor((data - inicioMs) / 86400000 / 7);
  }
  for (const n of negocios) { const i = indice(n.created_at); if (i >= 0 && i < pontos.length) pontos[i].leads++; }
  for (const c of interacoes) { const i = indice(c.ocorreu_em); if (i >= 0 && i < pontos.length) pontos[i].contactos++; }
  return pontos;
}
function BlocoMetrica({ titulo, valor, detalhe, icone: Icon, cor = "violet" }: {
  titulo: string; valor: string | number; detalhe: string; icone: LucideIcon; cor?: "violet" | "cyan" | "emerald" | "amber";
}) {
  const classes = { violet: "bg-violet-400/10 text-violet-300", cyan: "bg-cyan-400/10 text-cyan-300", emerald: "bg-emerald-400/10 text-emerald-300", amber: "bg-amber-400/10 text-amber-300" };
  return <article className={cn(card, "p-4 sm:p-5")}>
    <div className="flex items-start justify-between gap-2"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-muted-foreground">{titulo}</p><span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", classes[cor])}><Icon className="size-4"/></span></div>
    <div className="mt-2 text-3xl font-black tracking-tight tabular-nums sm:text-4xl">{valor}</div>
    <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">{detalhe}</p>
  </article>;
}
function SecaoTitulo({ icon: Icon, titulo, subtitulo, destino, destinoTexto }: {
  icon: LucideIcon; titulo: string; subtitulo: string; destino?: "/operacoes" | "/negocios" | "/tarefas" | "/pipeline"; destinoTexto?: string;
}) {
  return <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-2.5"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Icon className="size-4"/></span><div><h2 className="text-sm font-extrabold sm:text-base">{titulo}</h2><p className="mt-1 text-xs text-muted-foreground">{subtitulo}</p></div></div>{destino && <Link to={destino} className="inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:underline">{destinoTexto ?? "Ver tudo"}<ArrowUpRight className="size-3.5"/></Link>}</div>;
}
function DashboardCEO() {
  const { isAdmin, aCarregar: verificaAcesso } = useUtilizador();
  const [periodo, setPeriodo] = useState<Periodo>(30);
  const qNegocios = useBusinesses();
  const qTarefas = useTasks();
  const qContactos = useInteractions();
  const qOportunidades = useOpportunities();
  const qPedidos = useWebsiteRequests();
  const qProjetos = useProjects();
  const negocios = qNegocios.data ?? [];
  const tarefas = qTarefas.data ?? [];
  const contactos = qContactos.data ?? [];
  const oportunidades = qOportunidades.data ?? [];
  const pedidos = qPedidos.data ?? [];
  const projetos = qProjetos.data ?? [];
  const carregando = qNegocios.isLoading || qTarefas.isLoading || qContactos.isLoading || qPedidos.isLoading || qOportunidades.isLoading || qProjetos.isLoading;
  const comErro = qNegocios.isError || qTarefas.isError || qContactos.isError || qPedidos.isError || qOportunidades.isError || qProjetos.isError;
  const hoje = dataLocal();
  const dataInicial = useMemo(() => {
    const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate() - periodo + 1);
  }, [periodo]);
  const limite = dataLocal(dataInicial);
  const resumo = useMemo(() => prepararOperacoes(negocios, tarefas), [negocios, tarefas]);
  const calculos = useMemo(() => {
    const criados = negocios.filter(n => { const d = diaDe(n.created_at); return d >= limite && d <= hoje; });
    const registosContacto = contactos.filter(c => { const d = diaDe(c.ocorreu_em); return d >= limite && d <= hoje; });
    const ganhos = negocios.filter(n => n.estado === "aceite" || n.estado === "concluido");
    const perdidos = negocios.filter(n => n.estado === "nao_interessado");
    const fechados = ganhos.length + perdidos.length;
    const ativosComValor = resumo.ativas.filter(n => Number(n.valor_estimado) > 0).length;
    const propostasAtivas = resumo.ativas.filter(n => propostas.has(n.estado));
    const semEmail = resumo.ativas.filter(n => !n.email && !n.telefone);
    const porTratar = pedidos.filter(p => !p.tratado);
    const semanas = agruparSemanas(dataInicial, periodo, negocios, contactos);
    const origens = Array.from(resumo.ativas.reduce((m, n) => { const k = n.origem?.trim() || "Sem origem"; m.set(k, (m.get(k) || 0) + 1); return m; }, new Map<string, number>()).entries()).sort((a,b) => b[1]-a[1]).slice(0,6);
    const categorias = Array.from(resumo.ativas.reduce((m, n) => { const k = n.categoria?.trim() || "Sem categoria"; m.set(k, (m.get(k) || 0) + 1); return m; }, new Map<string, number>()).entries()).sort((a,b) => b[1]-a[1]).slice(0,5);
    const oportunidadesAtivas = oportunidades.filter(o => resumo.ativas.some(n => n.id === o.business_id)).sort((a,b) => (b.probabilidade ?? 0) - (a.probabilidade ?? 0)).slice(0,4);
    return { criados, registosContacto, ganhos, perdidos, fechados, taxa: fechados ? Math.round(100 * ganhos.length / fechados) : null, ativosComValor,
      propostasAtivas, semEmail, porTratar, semanas, origens, categorias, oportunidadesAtivas };
  }, [negocios, contactos, oportunidades, pedidos, dataInicial, periodo, limite, hoje, resumo]);
  const maxSemanal = Math.max(1,...calculos.semanas.flatMap(s => [s.leads, s.contactos]));
  const alertas = resumo.fila.filter(x => x.urgencia !== "normal").slice(0,5);
  const tarefasAbertas = [...resumo.pendentes].sort((a,b) => (a.data_hora || "9999").localeCompare(b.data_hora || "9999")).slice(0,5);

  if (verificaAcesso) return <div role="status" className={cn(card, "p-10 text-sm text-muted-foreground")}>A verificar acesso ao Dashboard CEO…</div>;
  if (!isAdmin) return <div className={cn(card, "mx-auto max-w-xl p-8 text-center")}><ShieldCheck className="mx-auto size-9 text-muted-foreground"/><h1 className="mt-3 text-lg font-bold">Área reservada à administração</h1><p className="mt-2 text-sm text-muted-foreground">Esta área exige permissões de administrador. Não são apresentados dados comerciais.</p><Link to="/painel" className={cn(btn,"mt-5")}>Voltar ao painel</Link></div>;

  return <div className="space-y-6 pb-14 sm:space-y-7">
    <header className="relative isolate overflow-hidden rounded-[28px] border border-violet-400/25 bg-[radial-gradient(ellipse_at_85%_10%,rgba(91,33,182,.38),transparent_55%),linear-gradient(120deg,rgba(22,18,50,.97),rgba(12,23,42,.96))] p-5 shadow-lg shadow-violet-950/15 sm:p-8">
      <div className="pointer-events-none absolute -bottom-24 right-12 size-64 rounded-full bg-cyan-500/10 blur-3xl"/>
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-violet-300"><ShieldCheck className="size-3.5"/> Direção · Nova Web Studio <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] text-emerald-300">Dados reais do CRM</span></div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl">Dashboard <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">CEO</span></h1>
          <p className="max-w-2xl text-xs leading-6 text-slate-300 sm:text-sm">Uma visão da operação para tomar decisões: oportunidades, contactos, ritmo comercial e assuntos que precisam de atenção.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2"><Link to="/operacoes" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"><ListTodo className="size-4"/> Sala de Operações</Link><Link to="/descobrir" className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-violet-600"><Radar className="size-4"/> Encontrar negócios</Link></div>
      </div>
    </header>

    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-bold">Panorama comercial</h2><p className="mt-1 text-xs text-muted-foreground">Atividade registada: {periodo} dias. Carteira e valores: total acumulado.</p></div><div role="group" aria-label="Período da atividade" className="flex items-center gap-1 rounded-xl border border-border/70 bg-surface/60 p-1">{([30,90,180] as const).map(p => <button type="button" key={p} aria-pressed={periodo===p} onClick={()=>setPeriodo(p)} className={cn("rounded-lg px-3 py-1.5 text-xs font-bold transition",periodo===p?"bg-primary text-primary-foreground":"text-muted-foreground hover:bg-surface-strong hover:text-foreground")}>{p} dias</button>)}</div></div>
    {comErro ? <div role="alert" className="rounded-2xl border border-rose-400/35 bg-rose-400/10 p-5 text-sm text-rose-200">Não foi possível carregar todos os dados. As métricas podem estar incompletas. <button onClick={()=>{void qNegocios.refetch();void qTarefas.refetch();void qContactos.refetch();void qOportunidades.refetch();void qPedidos.refetch();void qProjetos.refetch();}} className="ml-2 underline">Tentar novamente</button></div> : null}
    {carregando ? <div role="status" className={cn(card,"p-8 text-sm text-muted-foreground")}>A preparar os indicadores com os dados do CRM…</div> : <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principais">
        <BlocoMetrica titulo="Novos negócios" valor={calculos.criados.length} detalhe={`Criados nos últimos ${periodo} dias`} icone={BriefcaseBusiness}/>
        <BlocoMetrica titulo="Contactos registados" valor={calculos.registosContacto.length} detalhe={`Interações registadas nos últimos ${periodo} dias`} icone={ContactRound} cor="cyan"/>
        <BlocoMetrica titulo="Pipeline estimado" valor={formatarMoeda(resumo.valorAberto)} detalhe={`${calculos.ativosComValor} negócio(s) ativo(s) com valor indicado`} icone={CircleDollarSign} cor="emerald"/>
        <BlocoMetrica titulo="Assuntos urgentes" valor={resumo.atrasadas.length + resumo.seguimentosVencidos.length} detalhe="Tarefas atrasadas e seguimentos vencidos/para hoje" icone={AlertTriangle} cor="amber"/>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <section className={cn(card,"min-w-0 p-5 sm:p-6")}>
          <SecaoTitulo icon={BarChart3} titulo="Ritmo comercial" subtitulo="Negócios criados e interações registadas por semana"/>
          <div className="mt-6 flex items-center gap-4 text-[11px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-violet-400"/> Negócios</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-cyan-400"/> Interações</span></div>
          <div className="mt-4 flex h-52 items-end gap-1.5 overflow-x-auto border-b border-border/65 pb-2 sm:gap-3" role="img" aria-label={`Gráfico semanal dos últimos ${periodo} dias`}>
            {calculos.semanas.map(s => <div key={s.chave} className="flex h-full min-w-8 flex-1 flex-col items-center justify-end gap-2" title={`${s.titulo}: ${s.leads} negócios, ${s.contactos} interações`}><div className="flex h-[162px] w-full items-end justify-center gap-1"><div className="min-h-0 w-2.5 rounded-t-md bg-violet-400/90 transition-all sm:w-4" style={{ height: `${100*s.leads/maxSemanal}%` }}/><div className="min-h-0 w-2.5 rounded-t-md bg-cyan-400/90 transition-all sm:w-4" style={{ height: `${100*s.contactos/maxSemanal}%` }}/></div><span className="text-center text-[9px] font-medium text-muted-foreground sm:text-[10px]">{s.titulo}</span></div>)}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Cada grupo começa na data indicada. As interações registadas não equivalem necessariamente a emails enviados.</p>
        </section>
        <section className={cn(card,"p-5 sm:p-6")}>
          <SecaoTitulo icon={TrendingUp} titulo="Resultados e propostas" subtitulo="Situação atual, não faturação recebida" destino="/pipeline" destinoTexto="Pipeline"/>
          <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl border border-border/60 bg-surface-strong/35 p-3"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Ganhos registados</p><p className="mt-1 text-2xl font-black tabular-nums text-emerald-300">{calculos.ganhos.length}</p></div><div className="rounded-xl border border-border/60 bg-surface-strong/35 p-3"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Perdidos registados</p><p className="mt-1 text-2xl font-black tabular-nums">{calculos.perdidos.length}</p></div></div>
          <div className="mt-4 flex items-end justify-between gap-4"><div><p className="text-xs text-muted-foreground">Taxa entre decisões finais</p><strong className="text-3xl font-black tabular-nums">{calculos.taxa === null ? "—" : `${calculos.taxa}%`}</strong></div><span className="text-right text-[11px] text-muted-foreground">{calculos.fechados} negócios com decisão final</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-strong"><div className="h-full rounded-full bg-emerald-400" style={{width:`${calculos.taxa ?? 0}%`}}/></div>
          <div className="mt-5 flex justify-between gap-3 border-t border-border/70 pt-4 text-xs"><span className="text-muted-foreground">Propostas em curso</span><strong>{calculos.propostasAtivas.length}</strong></div>
          <div className="mt-2 flex justify-between gap-3 text-xs"><span className="text-muted-foreground">Ganhos, valor estimado</span><strong>{formatarMoeda(resumo.valorGanho)}</strong></div>
          <p className="mt-4 text-[11px] leading-5 text-muted-foreground">A taxa usa apenas negócios marcados como ganhos ou não interessados. Não mede a conversão de todos os contactos.</p>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <section className={cn(card,"p-5 sm:p-6")}><SecaoTitulo icon={AlertTriangle} titulo="Atenção da direção" subtitulo="Negócios com tarefa ou seguimento urgente" destino="/operacoes" destinoTexto="Tratar na Sala"/>
          <div className="mt-5 space-y-2">{alertas.length ? alertas.map(x => <Link to="/negocios/$id" params={{id:x.negocio.id}} key={x.negocio.id} className="group flex items-center gap-3 rounded-xl border border-border/60 bg-surface-strong/35 p-3 transition hover:border-violet-400/40 hover:bg-primary/5"><span className={cn("grid size-9 shrink-0 place-items-center rounded-xl",x.urgencia==="alta"?"bg-rose-400/10 text-rose-300":"bg-amber-400/10 text-amber-300")}><Clock3 className="size-4"/></span><div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">{x.negocio.nome}</div><p className="mt-0.5 truncate text-[11px] text-muted-foreground">{x.motivo} · {x.detalhe}</p></div><ChevronRight className="size-4 text-muted-foreground group-hover:text-violet-300"/></Link>) : <div className="rounded-xl border border-dashed border-border/70 p-7 text-center text-xs text-muted-foreground"><CheckCheck className="mx-auto mb-2 size-7 text-emerald-400"/>Sem seguimentos ou tarefas urgentes associados a negócios ativos.</div>}</div>
          {resumo.fila.filter(x=>x.urgencia!=="normal").length>5 && <p className="mt-3 text-[11px] text-muted-foreground">A mostrar 5 de {resumo.fila.filter(x=>x.urgencia!=="normal").length} negócios urgentes.</p>}
        </section>
        <section className={cn(card,"p-5 sm:p-6")}><SecaoTitulo icon={ListTodo} titulo="Próximos compromissos" subtitulo="Tarefas pendentes, por prazo" destino="/tarefas" destinoTexto="Agenda"/>
          <div className="mt-5 space-y-2">{tarefasAbertas.length ? tarefasAbertas.map(t=><div key={t.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-surface-strong/35 p-3"><CalendarClock className="mt-0.5 size-4 shrink-0 text-cyan-300"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{t.titulo}</p><p className="mt-1 text-[11px] text-muted-foreground">{t.data_hora?new Intl.DateTimeFormat("pt-PT",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(t.data_hora)):"Sem prazo definido"}</p></div>{t.business_id && <Link to="/negocios/$id" params={{id:t.business_id}} className="text-[11px] text-violet-300 hover:underline">Ficha</Link>}</div>) : <p className="rounded-xl border border-dashed border-border/70 p-7 text-center text-xs text-muted-foreground">Sem tarefas pendentes.</p>}</div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className={cn(card,"p-5")}><SecaoTitulo icon={Users} titulo="Origem das oportunidades" subtitulo="Negócios ativos, todos os períodos"/>
          <div className="mt-5 space-y-3">{calculos.origens.length?calculos.origens.map(([nome,q],i)=><div key={nome}><div className="flex justify-between gap-2 text-xs"><span className="truncate">{nome}</span><strong className="tabular-nums">{q}</strong></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-strong"><div className={cn("h-full rounded-full",cores[i%cores.length])} style={{width:`${100*q/Math.max(1,resumo.ativas.length)}%`}}/></div></div>):<p className="text-xs text-muted-foreground">Sem negócios ativos.</p>}</div></section>
        <section className={cn(card,"p-5")}><SecaoTitulo icon={Globe} titulo="Setores mais representados" subtitulo="Categorias dos negócios ativos"/>
          <div className="mt-5 space-y-3">{calculos.categorias.length?calculos.categorias.map(([nome,q],i)=><div key={nome}><div className="flex justify-between gap-2 text-xs"><span className="truncate">{nome}</span><strong className="tabular-nums">{q}</strong></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-strong"><div className={cn("h-full rounded-full",cores[i%cores.length])} style={{width:`${100*q/Math.max(1,resumo.ativas.length)}%`}}/></div></div>):<p className="text-xs text-muted-foreground">Sem negócios ativos.</p>}</div></section>
        <section className={cn(card,"p-5")}><SecaoTitulo icon={Activity} titulo="Qualidade da carteira" subtitulo="Indicadores que pedem revisão" destino="/negocios" destinoTexto="Abrir CRM"/>
          <div className="mt-5 space-y-3"><div className="flex justify-between gap-3 text-xs"><span className="text-muted-foreground">Negócios ativos</span><strong>{resumo.ativas.length}</strong></div><div className="flex justify-between gap-3 border-t border-border/50 pt-3 text-xs"><span className="text-muted-foreground">Sem email nem telefone</span><strong className="text-amber-300">{calculos.semEmail.length}</strong></div><div className="flex justify-between gap-3 border-t border-border/50 pt-3 text-xs"><span className="text-muted-foreground">Pedidos por tratar</span><strong>{calculos.porTratar.length}</strong></div><div className="flex justify-between gap-3 border-t border-border/50 pt-3 text-xs"><span className="text-muted-foreground">Projetos no portefólio</span><strong>{projetos.length}</strong></div><div className="flex justify-between gap-3 border-t border-border/50 pt-3 text-xs"><span className="text-muted-foreground">Projetos visíveis</span><strong>{projetos.filter(p=>p.visivel).length}</strong></div></div>
          <p className="mt-4 text-[11px] text-muted-foreground">Portefólio não equivale a projetos em execução.</p>
        </section>
      </div>
      {calculos.oportunidadesAtivas.length>0 && <section className={cn(card,"p-5 sm:p-6")}><SecaoTitulo icon={Sparkles} titulo="Oportunidades em destaque" subtitulo="Ordenadas pela probabilidade registada no CRM, não por previsão automática" destino="/pipeline" destinoTexto="Ver pipeline"/><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{calculos.oportunidadesAtivas.map(o=>{const n=negocios.find(n=>n.id===o.business_id); return <Link to="/negocios/$id" params={{id:o.business_id}} key={o.id} className="group rounded-xl border border-border/60 bg-surface-strong/40 p-4 transition hover:border-violet-400/45"><div className="flex justify-between gap-3"><span className="truncate text-xs font-bold">{n?.nome||"Negócio"}</span><ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-violet-300"/></div><div className="mt-3 text-2xl font-black tabular-nums text-violet-300">{o.probabilidade}%</div><p className="mt-1 text-[11px] text-muted-foreground">Probabilidade registada · {n?estadoInfo(n.estado).label:"Sem fase"}</p></Link>;})}</div></section>}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-[11px] text-muted-foreground"><span>NWS HUB V4.3 · Dashboard CEO · leitura dos dados existentes, sem ações automáticas</span><span>Os valores são estimativas registadas, não receitas nem pagamentos confirmados.</span></footer>
    </>}
  </div>;
}
