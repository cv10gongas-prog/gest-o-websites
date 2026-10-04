import { Link, createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CalendarCheck2,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  List,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, Chip, Dot, Vazio } from "@/components/crm/Bits";
import { DialogTarefa } from "@/components/crm/DialogTarefa";
import {
  formatarData,
  formatarHora,
  prioridadeInfo,
  tipoTarefaLabel,
  type Task,
  type TaskType,
} from "@/lib/crm";
import {
  useAlternarTarefa,
  useApagarTarefa,
  useBusinesses,
  useProfiles,
  useTasks,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas & Agenda — Nova Web Studio" },
      {
        name: "description",
        content: "Agenda de follow-ups, reuniões, chamadas e prazos da equipa.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Tarefas,
});

type ModoVisualizacao = "lista" | "calendario";
type FiltroEstado = "todas" | "pendentes" | "hoje" | "atrasadas" | "concluidas";

function iconeTipoTarefa(tipo: TaskType) {
  switch (tipo) {
    case "ligar":
      return Phone;
    case "enviar_email":
      return Mail;
    case "marcar_reuniao":
      return CalendarIcon;
    default:
      return CalendarClock;
  }
}

function Tarefas() {
  const { data: tarefas = [], isLoading } = useTasks();
  const { data: negocios = [] } = useBusinesses();
  const { data: perfis = [] } = useProfiles();
  const alternar = useAlternarTarefa();
  const apagar = useApagarTarefa();

  const [modo, setModo] = useState<ModoVisualizacao>("lista");
  const [filtro, setFiltro] = useState<FiltroEstado>("pendentes");
  const [responsavel, setResponsavel] = useState("");
  const [dialogo, setDialogo] = useState<{ aberto: boolean; tarefa?: Task | null }>({
    aberto: false,
  });

  const hojeIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const negocioNome = (id: string | null) => negocios.find((n) => n.id === id)?.nome;

  const nomePor = (id: string | null) =>
    perfis.find((p) => p.id === id)?.nome ?? (id ? "Equipa" : "—");

  // Estatísticas Rápidas
  const metricas = useMemo(() => {
    const pendentes = tarefas.filter((t) => t.estado === "pendente");
    const concluidas = tarefas.filter((t) => t.estado === "concluida");
    const hoje = pendentes.filter((t) => t.data_hora && t.data_hora.slice(0, 10) === hojeIso);
    const atrasadas = pendentes.filter((t) => {
      if (t.data_hora && t.data_hora.slice(0, 10) < hojeIso) return true;
      return false;
    });

    return {
      total: tarefas.length,
      pendentes: pendentes.length,
      concluidas: concluidas.length,
      hoje: hoje.length,
      atrasadas: atrasadas.length,
    };
  }, [tarefas, hojeIso]);

  // Lista Filtrada
  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter((t) => {
      if (responsavel && t.responsavel !== responsavel) return false;

      const dataStr = t.data_hora ? t.data_hora.slice(0, 10) : "";
      const ehHoje = dataStr === hojeIso;
      const ehAtrasada = t.estado === "pendente" && dataStr && dataStr < hojeIso;

      if (filtro === "todas") return true;
      if (filtro === "concluidas") return t.estado === "concluida";
      if (filtro === "atrasadas") return ehAtrasada;
      if (filtro === "hoje") return t.estado === "pendente" && ehHoje;
      return t.estado === "pendente";
    });
  }, [tarefas, filtro, responsavel, hojeIso]);

  // Agrupamento por Prazos para a vista de Lista
  const gruposLista = useMemo(() => {
    const atrasadas: Task[] = [];
    const paraHoje: Task[] = [];
    const proximas: Task[] = [];
    const concluidas: Task[] = [];

    for (const t of tarefasFiltradas) {
      if (t.estado === "concluida") {
        concluidas.push(t);
        continue;
      }

      const dataRef = t.data_hora ? t.data_hora.slice(0, 10) : "";
      if (dataRef && dataRef < hojeIso) {
        atrasadas.push(t);
      } else if (dataRef === hojeIso) {
        paraHoje.push(t);
      } else {
        proximas.push(t);
      }
    }

    return [
      { titulo: "Atrasadas / Requerem Atenção", itens: atrasadas, cor: "text-danger" },
      { titulo: "Para Hoje", itens: paraHoje, cor: "text-warning" },
      { titulo: "Próximos Compromissos", itens: proximas, cor: "text-primary" },
      { titulo: "Concluídas", itens: concluidas, cor: "text-success" },
    ].filter((g) => g.itens.length > 0);
  }, [tarefasFiltradas, hojeIso]);

  return (
    <div className="space-y-6">
      {/* HEADER DAS TAREFAS */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-warning">
            <CalendarClock className="size-3.5" />
            <span>Operações & Agenda</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Tarefas & Agenda
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {metricas.pendentes} pendente(s) • {metricas.hoje} para hoje • {metricas.atrasadas} em
            atraso
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Alternador de Modo */}
          <div className="flex items-center rounded-xl border border-border/70 bg-surface/50 p-1">
            <button
              type="button"
              onClick={() => setModo("lista")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition",
                modo === "lista"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="size-3.5" />
              <span>Lista</span>
            </button>

            <button
              type="button"
              onClick={() => setModo("calendario")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition",
                modo === "calendario"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <CalendarIcon className="size-3.5" />
              <span>Calendário</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setDialogo({ aberto: true, tarefa: null })}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 active:scale-95"
          >
            <Plus className="size-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* FILTROS RÁPIDOS */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/70 bg-surface/40 p-3 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { chave: "pendentes", label: `Pendentes (${metricas.pendentes})` },
            { chave: "hoje", label: `Para Hoje (${metricas.hoje})` },
            { chave: "atrasadas", label: `Atrasadas (${metricas.atrasadas})` },
            { chave: "concluidas", label: `Concluídas (${metricas.concluidas})` },
            { chave: "todas", label: `Todas (${metricas.total})` },
          ].map((f) => (
            <button
              key={f.chave}
              type="button"
              onClick={() => setFiltro(f.chave as FiltroEstado)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                filtro === f.chave
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Filtro por Responsável */}
        <select
          className="h-8 rounded-xl border border-border/70 bg-surface/80 px-3 text-xs text-foreground focus:outline-none"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
        >
          <option value="">Toda a Equipa</option>
          {perfis.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome || p.email}
            </option>
          ))}
        </select>
      </div>

      {/* VISTA DE LISTA AGRUPADA */}
      {modo === "lista" && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              A carregar tarefas...
            </div>
          ) : gruposLista.length === 0 ? (
            <div className="rounded-3xl border border-border/70 bg-surface/40 p-12 text-center">
              <CalendarCheck2 className="size-8 mx-auto mb-2 text-success" />
              <p className="text-sm font-semibold text-foreground">Tudo em dia!</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Não há tarefas que correspondam aos filtros ativos.
              </p>
            </div>
          ) : (
            gruposLista.map((grupo) => (
              <div key={grupo.titulo} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className={cn("text-xs font-bold uppercase tracking-wider", grupo.cor)}>
                    {grupo.titulo}
                  </span>
                  <span className="rounded-full bg-surface-strong px-2 py-0.2 text-[10px] font-bold text-muted-foreground">
                    {grupo.itens.length}
                  </span>
                </div>

                <div className="rounded-3xl border border-border/70 bg-surface/40 backdrop-blur-md divide-y divide-border/30 overflow-hidden">
                  {grupo.itens.map((t) => {
                    const Icone = iconeTipoTarefa(t.tipo);
                    const concluida = t.estado === "concluida";

                    return (
                      <div
                        key={t.id}
                        className={cn(
                          "flex items-center justify-between gap-4 p-4 transition hover:bg-surface-strong/50 text-xs",
                          concluida && "opacity-60 bg-surface/20",
                        )}
                      >
                        {/* Botão de Conclusão */}
                        <button
                          type="button"
                          onClick={() => alternar.mutate(t)}
                          className={cn(
                            "grid size-7 shrink-0 place-items-center rounded-xl border transition",
                            concluida
                              ? "border-success bg-success/20 text-success"
                              : "border-border/80 bg-surface/60 text-transparent hover:border-primary",
                          )}
                          aria-label="Concluir tarefa"
                        >
                          <Check className="size-4" />
                        </button>

                        {/* Dados da Tarefa */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "font-bold text-foreground text-sm",
                                concluida && "line-through text-muted-foreground",
                              )}
                            >
                              {t.titulo}
                            </span>
                            <Chip tone={prioridadeInfo(t.prioridade).tone}>
                              {prioridadeInfo(t.prioridade).label}
                            </Chip>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                            <span className="capitalize flex items-center gap-1">
                              <Icone className="size-3" />
                              {tipoTarefaLabel(t.tipo)}
                            </span>

                            {t.data_hora && (
                              <span className="font-mono">
                                Data: {formatarData(t.data_hora, true)}
                              </span>
                            )}

                            {t.business_id && negocioNome(t.business_id) && (
                              <Link
                                to="/negocios/$id"
                                params={{ id: t.business_id }}
                                className="text-primary hover:underline font-medium"
                              >
                                {negocioNome(t.business_id)}
                              </Link>
                            )}

                            {t.responsavel && (
                              <span className="flex items-center gap-1">
                                <Avatar nome={nomePor(t.responsavel)} size="size-4" />
                                {nomePor(t.responsavel)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setDialogo({ aberto: true, tarefa: t })}
                            className="grid size-8 place-items-center rounded-xl border border-border/70 bg-surface/80 text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
                            aria-label="Editar tarefa"
                          >
                            <Pencil className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => apagar.mutate(t.id)}
                            className="grid size-8 place-items-center rounded-xl border border-border/70 bg-surface/80 text-muted-foreground hover:text-danger hover:border-danger/40 hover:bg-danger/10 transition"
                            aria-label="Apagar tarefa"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VISTA DE CALENDÁRIO / AGENDA */}
      {modo === "calendario" && (
        <div className="rounded-3xl border border-border/70 bg-surface/40 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="size-4 text-primary" />
              Agenda Cronológica de Tarefas
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tarefasFiltradas.slice(0, 9).map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-border/60 bg-surface/50 p-4 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <Chip tone={prioridadeInfo(t.prioridade).tone}>
                    {prioridadeInfo(t.prioridade).label}
                  </Chip>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {formatarData(t.data_hora, true)}
                  </span>
                </div>

                <h3 className="font-bold text-foreground truncate">{t.titulo}</h3>

                {t.business_id && negocioNome(t.business_id) && (
                  <p className="text-[11px] text-primary truncate">{negocioNome(t.business_id)}</p>
                )}

                <div className="pt-2 border-t border-border/30 flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>Atribuído a {nomePor(t.responsavel)}</span>
                  <button
                    type="button"
                    onClick={() => alternar.mutate(t)}
                    className="font-semibold text-primary hover:underline"
                  >
                    {t.estado === "concluida" ? "Reabrir" : "Concluir"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição de Tarefa */}
      {dialogo.aberto && (
        <DialogTarefa
          aberto
          key={dialogo.tarefa?.id ?? "nova"}
          tarefa={dialogo.tarefa}
          onFechar={() => setDialogo({ aberto: false })}
        />
      )}
    </div>
  );
}
