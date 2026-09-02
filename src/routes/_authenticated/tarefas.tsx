import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Chip, Panel, Vazio } from "@/components/crm/Bits";
import { DialogTarefa } from "@/components/crm/DialogTarefa";
import { btnPequeno, btnPrimario, selectClass } from "@/components/crm/Modal";
import {
  formatarData,
  prioridadeInfo,
  tipoTarefaLabel,
  type Task,
} from "@/lib/crm";
import {
  useAlternarTarefa,
  useApagarTarefa,
  useBusinesses,
  useProfiles,
  useTasks,
} from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas — Orbit CRM" },
      { name: "description", content: "Agenda de follow-ups, chamadas e emails da equipa." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Tarefas,
});

function Tarefas() {
  const { data: tarefas = [] } = useTasks();
  const { data: negocios = [] } = useBusinesses();
  const { data: perfis = [] } = useProfiles();
  const alternar = useAlternarTarefa();
  const apagar = useApagarTarefa();
  const [dialogo, setDialogo] = useState<{ aberto: boolean; tarefa?: Task | null }>({ aberto: false });
  const [filtro, setFiltro] = useState("pendente");
  const [responsavel, setResponsavel] = useState("");

  const lista = useMemo(() => {
    const agora = new Date();
    return tarefas.filter((t) => {
      if (responsavel && t.responsavel !== responsavel) return false;
      if (filtro === "todas") return true;
      if (filtro === "concluida") return t.estado === "concluida";
      if (filtro === "atrasada")
        return t.estado === "pendente" && !!t.data_hora && new Date(t.data_hora) < agora;
      if (filtro === "hoje")
        return (
          t.estado === "pendente" &&
          !!t.data_hora &&
          new Date(t.data_hora).toDateString() === agora.toDateString()
        );
      return t.estado === "pendente";
    });
  }, [tarefas, filtro, responsavel]);

  const negocioNome = (id: string | null) => negocios.find((n) => n.id === id)?.nome;

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tarefas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lista.length} tarefas a mostrar · {tarefas.filter((t) => t.estado === "pendente").length}{" "}
            pendentes no total.
          </p>
        </div>
        <button className={btnPrimario} onClick={() => setDialogo({ aberto: true, tarefa: null })}>
          <Plus className="size-4" /> Nova tarefa
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:max-w-lg">
        <select className={selectClass} value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="pendente">Pendentes</option>
          <option value="hoje">Para hoje</option>
          <option value="atrasada">Atrasadas</option>
          <option value="concluida">Concluídas</option>
          <option value="todas">Todas</option>
        </select>
        <select
          className={selectClass}
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
        >
          <option value="">Toda a equipa</option>
          {perfis.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome || p.email}
            </option>
          ))}
        </select>
      </div>

      <Panel className="mt-5">
        {lista.length === 0 ? (
          <Vazio texto="Nada por aqui. Bom trabalho!" />
        ) : (
          <ul className="space-y-2.5">
            {lista.map((t) => {
              const atrasada =
                t.estado === "pendente" && !!t.data_hora && new Date(t.data_hora) < new Date();
              return (
                <li
                  key={t.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/60 bg-secondary/25 p-3 sm:flex-row sm:items-center"
                >
                  <button
                    onClick={() => alternar.mutate(t)}
                    aria-label="Alternar conclusão"
                    className={`grid size-6 shrink-0 place-items-center rounded-md border transition ${
                      t.estado === "concluida"
                        ? "border-success/40 tone-success"
                        : "border-border text-transparent hover:border-primary/50"
                    }`}
                  >
                    <Check className="size-3.5" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-medium ${
                        t.estado === "concluida" ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      {t.titulo}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{tipoTarefaLabel(t.tipo)}</span>
                      <span>· {formatarData(t.data_hora, true)}</span>
                      {t.business_id && negocioNome(t.business_id) && (
                        <Link
                          to="/negocios/$id"
                          params={{ id: t.business_id }}
                          className="text-primary hover:underline"
                        >
                          · {negocioNome(t.business_id)}
                        </Link>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {atrasada && <Chip tone="danger">atrasada</Chip>}
                    <Chip tone={prioridadeInfo(t.prioridade).tone}>
                      {prioridadeInfo(t.prioridade).label}
                    </Chip>
                    <button
                      className={btnPequeno}
                      onClick={() => setDialogo({ aberto: true, tarefa: t })}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button className={btnPequeno} onClick={() => apagar.mutate(t.id)}>
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {dialogo.aberto && (
        <DialogTarefa
          aberto
          key={dialogo.tarefa?.id ?? "nova"}
          tarefa={dialogo.tarefa}
          onFechar={() => setDialogo({ aberto: false })}
        />
      )}
    </>
  );
}
