import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, Mail, Radar, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import { formatarData, formatarMoeda, type Business, type Task } from "@/lib/crm";
import { resumoComercial } from "@/lib/commercial-v35";
import { useAlternarTarefa } from "@/lib/queries";

export function PainelComercialV35({ negocios, tarefas }: { negocios: Business[]; tarefas: Task[] }) {
  const s = useMemo(() => resumoComercial(negocios, tarefas), [negocios, tarefas]);
  const concluir = useAlternarTarefa();
  const alertas = [...s.vencidas, ...s.paraHoje, ...s.semData].slice(0, 6);
  const negociosSeguimento = s.seguimentos.slice(0, 5);
  return (
    <section aria-label="Gestão comercial V3.5" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-[11px] font-bold uppercase tracking-[.15em] text-violet-300">NWS HUB V3.5 · Fluxo comercial</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight">O que precisa de atenção?</h2>
          <p className="mt-1 text-xs text-muted-foreground">Dados do CRM em tempo real. Nenhuma proposta é marcada como enviada automaticamente.</p></div>
        <Link to="/descobrir" className="inline-flex items-center gap-2 rounded-xl border border-violet-400/40 px-3 py-2 text-xs font-bold text-violet-200 hover:bg-violet-500/10"><Radar className="size-4"/> Encontrar oportunidades <ArrowRight className="size-3.5"/></Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {rotulo:"Por contactar",valor:s.porContactar.length,icon:Users,sub:"Negócios por abordar"},
          {rotulo:"Propostas em curso",valor:s.propostas.length,icon:Mail,sub:"Preparar, enviar ou negociar"},
          {rotulo:"Tarefas atrasadas",valor:s.vencidas.length,icon:AlertTriangle,sub:"Datas anteriores a hoje"},
          {rotulo:"Negócios ganhos",valor:s.conquistados.length,icon:TrendingUp,sub:`Pipeline activo: ${formatarMoeda(s.valorOportunidades)}`},
        ].map(item => <div key={item.rotulo} className="rounded-2xl border border-border/70 bg-surface/65 p-4"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{item.rotulo}</span><item.icon className="size-4 text-violet-300"/></div><strong className="mt-2 block text-3xl font-extrabold tabular-nums">{item.valor}</strong><p className="mt-1 text-[11px] text-muted-foreground">{item.sub}</p></div>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-surface/50 p-4 sm:p-5">
          <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-bold"><CalendarClock className="size-4 text-amber-300"/> Próximas ações</h3><Link to="/tarefas" className="text-xs text-violet-300 hover:underline">Ver agenda</Link></div>
          {alertas.length ? <div className="mt-3 divide-y divide-border/50">{alertas.map(t=><div key={t.id} className="flex items-start justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-xs font-semibold">{t.titulo}</p><p className="mt-1 text-[11px] text-muted-foreground">{t.data_hora ? formatarData(t.data_hora,true) : "Sem prazo definido"}{t.business_id ? " · associada ao CRM" : ""}</p>{t.business_id && <Link to="/negocios/$id" params={{id:t.business_id}} className="mt-1 inline-block text-[11px] text-violet-300 hover:underline">Abrir negócio</Link>}</div><button type="button" disabled={concluir.isPending} onClick={()=>concluir.mutate(t)} className="shrink-0 rounded-lg border border-border/70 p-2 text-muted-foreground hover:text-emerald-300 disabled:opacity-40" title="Marcar tarefa concluída" aria-label={`Concluir: ${t.titulo}`}><CheckCircle2 className="size-4"/></button></div>)}</div> : <p className="mt-4 rounded-xl border border-dashed border-border/70 p-4 text-xs text-muted-foreground">Sem tarefas atrasadas, para hoje ou sem data. Boa organização!</p>}
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface/50 p-4 sm:p-5"><div className="flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-bold"><AlertTriangle className="size-4 text-violet-300"/> Seguimentos no CRM</h3><Link to="/negocios" className="text-xs text-violet-300 hover:underline">Ver negócios</Link></div>
          {negociosSeguimento.length ? <div className="mt-3 divide-y divide-border/50">{negociosSeguimento.map(n=><div key={n.id} className="flex items-start justify-between gap-3 py-3"><div className="min-w-0"><Link to="/negocios/$id" params={{id:n.id}} className="text-xs font-bold hover:text-violet-200">{n.nome}</Link><p className="mt-1 text-[11px] text-muted-foreground">{n.proxima_acao || "Seguimento agendado"} · {formatarData(n.data_seguimento, true)}</p></div><Link to="/emails" search={{negocio:n.id}} className="shrink-0 rounded-lg border border-violet-400/30 px-2 py-1.5 text-[11px] text-violet-200 hover:bg-violet-500/10">Proposta</Link></div>)}</div> : <p className="mt-4 rounded-xl border border-dashed border-border/70 p-4 text-xs text-muted-foreground">Sem negócios com data de seguimento vencida.</p>}
          <div className="mt-3 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">{s.paraHoje.length} tarefa(s) para hoje · {s.semData.length} pendente(s) sem data. As contagens de tarefas e negócios são distintas.</div>
        </div>
      </div>
    </section>
  );
}
