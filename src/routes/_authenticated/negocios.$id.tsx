import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { Chip, Dot, Panel, Vazio } from "@/components/crm/Bits";
import { DialogChamada } from "@/components/crm/DialogChamada";
import { DialogNegocio } from "@/components/crm/DialogNegocio";
import { DialogTarefa } from "@/components/crm/DialogTarefa";
import { btnPequeno, btnPrimario, btnSecundario, selectClass } from "@/components/crm/Modal";
import { PainelArquivos } from "@/components/crm/PainelArquivos";
import {
  ESTADOS,
  estadoInfo,
  euros,
  formatarData,
  prioridadeInfo,
  resultadoInfo,
  tipoTarefaLabel,
  type BusinessStatus,
} from "@/lib/crm";
import {
  useActivity,
  useActualizarNegocio,
  useApagarNegocio,
  useBusiness,
  useInteractions,
  useOpportunities,
  useProfiles,
  useTasks,
} from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/negocios/$id")({
  head: () => ({
    meta: [
      { title: "Ficha de projeto — Nova Web CRM" },
      { name: "description", content: "Histórico de chamadas, tarefas e oportunidades do projeto." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FichaNegocio,
});

function FichaNegocio() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: negocio, isLoading } = useBusiness(id);
  const { data: chamadas = [] } = useInteractions(id);
  const { data: oportunidades = [] } = useOpportunities(id);
  const { data: historico = [] } = useActivity(id);
  const { data: tarefas = [] } = useTasks();
  const { data: perfis = [] } = useProfiles();
  const actualizar = useActualizarNegocio();
  const apagar = useApagarNegocio();

  const [editar, setEditar] = useState(false);
  const [chamada, setChamada] = useState(false);
  const [tarefa, setTarefa] = useState(false);

  if (isLoading) return <Vazio texto="A carregar projeto..." />;
  if (!negocio) return <Vazio texto="Projeto não encontrado." />;

  const nomePor = (uid: string | null) => perfis.find((p) => p.id === uid)?.nome ?? "Equipa";
  const tarefasNegocio = tarefas.filter((t) => t.business_id === negocio.id);
  const e = estadoInfo(negocio.estado);

  return (
    <>
      <Link to="/negocios" className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground">
        <ArrowLeft className="size-3.5" /> Voltar aos projetos
      </Link>

      <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight">{negocio.nome}</h1>
            <Chip tone={e.tone}>{e.label}</Chip>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Dot tone={prioridadeInfo(negocio.prioridade).tone} />
              {prioridadeInfo(negocio.prioridade).label}
            </span>
          </div>
          <p className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Building2 className="size-3.5" /> {negocio.categoria ?? "Sem categoria"}
            </span>
            {negocio.localidade && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {negocio.localidade}
              </span>
            )}
            {negocio.telefone && (
              <a href={`tel:${negocio.telefone}`} className="flex items-center gap-1.5 hover:text-foreground">
                <Phone className="size-3.5" /> {negocio.telefone}
              </a>
            )}
            {negocio.email && (
              <a href={`mailto:${negocio.email}`} className="flex items-center gap-1.5 hover:text-foreground">
                <Mail className="size-3.5" /> {negocio.email}
              </a>
            )}
            {negocio.website && (
              <a
                href={negocio.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <Globe className="size-3.5" /> {negocio.website_dominio ?? negocio.website}
              </a>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            className={`${selectClass} w-auto`}
            value={negocio.estado}
            onChange={(ev) =>
              actualizar.mutate({
                id: negocio.id,
                valores: { estado: ev.target.value as BusinessStatus },
                descricao: `mudou o estado para ${estadoInfo(ev.target.value as BusinessStatus).label}`,
              })
            }
          >
            {ESTADOS.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
          <button className={btnSecundario} onClick={() => setEditar(true)}>
            <Pencil className="size-4" /> Editar
          </button>
          <button className={btnPrimario} onClick={() => setChamada(true)}>
            <Phone className="size-4" /> Registar chamada
          </button>
          <button
            className={btnSecundario}
            onClick={() => {
              if (confirm(`Apagar definitivamente "${negocio.nome}"?`)) {
                apagar.mutate(negocio.id, { onSuccess: () => navigate({ to: "/negocios" }) });
              }
            }}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Panel title="Histórico de chamadas" subtitle={`${chamadas.length} registos`}>
            {chamadas.length === 0 ? (
              <Vazio texto="Ainda não há chamadas registadas." />
            ) : (
              <ol className="space-y-3">
                {chamadas.map((c) => {
                  const r = resultadoInfo(c.resultado);
                  return (
                    <li key={c.id} className="rounded-xl border border-border/60 bg-secondary/25 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Chip tone={r?.tone ?? "muted"}>{r?.label ?? c.resultado}</Chip>
                        <span className="text-[11px] text-muted-foreground">
                          {formatarData(c.ocorreu_em, true)} · {nomePor(c.realizada_por)}
                          {c.duracao_min ? ` · ${c.duracao_min} min` : ""}
                        </span>
                      </div>
                      {c.pessoa_contactada && (
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          Falou com {c.pessoa_contactada}
                          {c.funcao ? ` (${c.funcao})` : ""}
                        </p>
                      )}
                      {c.notas && <p className="mt-1.5 text-xs leading-relaxed">{c.notas}</p>}
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>

          <Panel
            title="Tarefas"
            subtitle={`${tarefasNegocio.filter((t) => t.estado === "pendente").length} pendentes`}
            actions={
              <button className={btnPequeno} onClick={() => setTarefa(true)}>
                <Plus className="size-3.5" /> Nova
              </button>
            }
          >
            {tarefasNegocio.length === 0 ? (
              <Vazio texto="Sem tarefas associadas." />
            ) : (
              <ul className="space-y-2">
                {tarefasNegocio.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-secondary/25 p-3 text-xs"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{t.titulo}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {tipoTarefaLabel(t.tipo)} · {formatarData(t.data_hora, true)}
                      </span>
                    </span>
                    <Chip tone={t.estado === "concluida" ? "success" : prioridadeInfo(t.prioridade).tone}>
                      {t.estado === "concluida" ? "concluída" : "pendente"}
                    </Chip>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Resumo comercial">
            <dl className="space-y-2.5 text-xs">
              <Linha termo="Valor estimado" valor={euros(negocio.valor_estimado)} />
              <Linha termo="Próxima ação" valor={negocio.proxima_acao ?? "—"} />
              <Linha termo="Última interação" valor={formatarData(negocio.ultima_interacao, true)} />
              <Linha termo="Encontrado por" valor={nomePor(negocio.encontrado_por)} />
              <Linha
                termo="Contactado por"
                valor={negocio.contactado_por ? nomePor(negocio.contactado_por) : "Ainda ninguém"}
              />
              <Linha termo="Origem" valor={negocio.origem ?? "—"} />
            </dl>
            {negocio.notas && (
              <p className="mt-4 rounded-xl border border-border/60 bg-secondary/25 p-3 text-xs leading-relaxed text-muted-foreground">
                {negocio.notas}
              </p>
            )}
          </Panel>

          {oportunidades.length > 0 && (
            <Panel title="Oportunidades">
              <ul className="space-y-2.5 text-xs">
                {oportunidades.map((o) => (
                  <li key={o.id} className="rounded-xl border border-success/25 bg-success/5 p-3">
                    <p className="font-medium">{o.pretende ?? "Interesse registado"}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {euros(o.orcamento_previsto ?? o.preco_indicado)} · {o.probabilidade}% ·{" "}
                      {formatarData(o.data_proxima_conversa)}
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <PainelArquivos businessId={negocio.id} />

          <Panel title="Atividade">
            {historico.length === 0 ? (
              <Vazio texto="Sem atividade registada." />
            ) : (
              <ol className="space-y-2.5 text-[11px] text-muted-foreground">
                {historico.map((h) => (
                  <li key={h.id} className="flex gap-2">
                    <Dot tone="primary" />
                    <span>
                      <span className="text-foreground">{nomePor(h.autor)}</span> {h.accao}
                      {h.detalhe ? ` — ${h.detalhe}` : ""}
                      <span className="block">{formatarData(h.created_at, true)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>

      {editar && <DialogNegocio aberto onFechar={() => setEditar(false)} negocio={negocio} />}
      {chamada && <DialogChamada aberto onFechar={() => setChamada(false)} negocio={negocio} />}
      {tarefa && (
        <DialogTarefa aberto onFechar={() => setTarefa(false)} businessIdInicial={negocio.id} />
      )}
    </>
  );
}

function Linha({ termo, valor }: { termo: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{termo}</dt>
      <dd className="text-right font-medium">{valor}</dd>
    </div>
  );
}
