import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Flame,
  Mail,
  Phone,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, Chip, Dot, Metric, Panel, Vazio } from "@/components/crm/Bits";
import { DialogNegocio } from "@/components/crm/DialogNegocio";
import { btnPrimario } from "@/components/crm/Modal";
import { useUtilizador } from "@/hooks/useAuth";
import {
  dataExtenso,
  estadoInfo,
  euros,
  formatarData,
  formatarHora,
  prioridadeInfo,
  saudacao,
} from "@/lib/crm";
import { CARTOES_PAINEL, formatarValor, rotuloFase, usePreferencias } from "@/lib/preferencias";
import { useBusinesses, useInteractions, useOpportunities, useProfiles, useTasks } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Gestão — Orbit CRM" },
      { name: "description", content: "Métricas do dia, projetos em curso e tarefas prioritárias." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

function Painel() {
  const [novo, setNovo] = useState(false);
  const { perfil } = useUtilizador();
  const { data: negocios = [] } = useBusinesses();
  const { data: tarefas = [] } = useTasks();
  const { data: chamadas = [] } = useInteractions();
  const { data: oportunidades = [] } = useOpportunities();
  const { data: perfis = [] } = useProfiles();
  const { prefs } = usePreferencias();
  const verCartao = (c: (typeof CARTOES_PAINEL)[number]["chave"]) =>
    prefs.cartoesPainel.includes(c);

  const nomePor = (id: string | null) =>
    perfis.find((p) => p.id === id)?.nome ?? (id ? "Equipa" : "—");

  const metricas = useMemo(() => {
    const hoje = new Date().toDateString();
    return {
      chamadasHoje: chamadas.filter((c) => new Date(c.ocorreu_em).toDateString() === hoje).length,
      interessados: negocios.filter((n) => n.estado === "interessado").length,
      emails: negocios.filter((n) => n.estado === "email_enviado").length,
      valor: negocios
        .filter((n) => !["nao_interessado", "arquivado"].includes(n.estado))
        .reduce((t, n) => t + Number(n.valor_estimado ?? 0), 0),
    };
  }, [negocios, chamadas]);

  const pendentes = tarefas
    .filter((t) => t.estado === "pendente")
    .sort((a, b) => (a.data_hora ?? "").localeCompare(b.data_hora ?? ""))
    .slice(0, 5);

  const recentes = negocios.slice(0, 6);
  const melhorOportunidade = [...oportunidades].sort(
    (a, b) => (b.probabilidade ?? 0) - (a.probabilidade ?? 0),
  )[0];
  const negocioOportunidade = negocios.find((n) => n.id === melhorOportunidade?.business_id);

  return (
    <>
      {verCartao("saudacao") && (
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[.16em] text-primary/80">
            {dataExtenso()}
          </p>
          <h1 className="text-2xl font-semibold tracking-[-.035em] sm:text-[32px]">
            {saudacao()}, {perfil?.nome?.split(" ")[0] ?? "equipa"}. Vamos fechar projetos.
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Tens {pendentes.length} ações pendentes e {metricas.interessados} oportunidades quentes.
          </p>
        </div>
        <button className={btnPrimario} onClick={() => setNovo(true)}>
          <Plus className="size-4" /> Novo projeto de site
        </button>
      </section>
      )}

      <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {verCartao("m_chamadas") && (
        <Metric
          icon={Phone}
          label="Chamadas hoje"
          value={String(metricas.chamadasHoje)}
          detail={`${chamadas.length} no total`}
          tone="primary"
        />
        )}
        {verCartao("m_interessados") && (
        <Metric
          icon={Flame}
          label="Interessados"
          value={String(metricas.interessados)}
          detail={`${oportunidades.length} oportunidades registadas`}
          tone="success"
        />
        )}
        {verCartao("m_emails") && (
        <Metric
          icon={Mail}
          label="Emails enviados"
          value={String(metricas.emails)}
          detail={`${negocios.filter((n) => n.estado === "email_por_enviar").length} por enviar`}
          tone="info"
        />
        )}
        {verCartao("m_valor") && (
        <Metric
          icon={CircleDollarSign}
          label="Valor em aberto"
          value={formatarValor(prefs, metricas.valor)}
          detail={`${negocios.length} projetos`}
          tone="warning"
        />
        )}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {verCartao("tabela") && (
        <Panel
          title="Pipeline de projetos"
          subtitle="Últimos contactos e próximas ações"
          bodyClassName=""
          actions={
            <Link to="/negocios" className="flex items-center gap-1 text-xs text-primary">
              Ver todos <ArrowUpRight className="size-3" />
            </Link>
          }
        >
          {recentes.length === 0 ? (
            <Vazio texto="Ainda não há negócios. Adiciona o primeiro." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="border-b border-border/50 text-[10px] uppercase tracking-[.13em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Cliente / Projeto</th>
                    <th className="px-3 py-3 font-medium">Estado</th>
                    <th className="px-3 py-3 font-medium">Prioridade</th>
                    <th className="px-3 py-3 font-medium">Responsável</th>
                    <th className="px-3 py-3 font-medium">Próxima ação</th>
                  </tr>
                </thead>
                <tbody>
                  {recentes.map((n) => {
                    const e = estadoInfo(n.estado);
                    const p = prioridadeInfo(n.prioridade);
                    return (
                      <tr key={n.id} className="border-b border-border/40 transition hover:bg-accent/40">
                        <td className="px-5 py-3.5">
                          <Link to="/negocios/$id" params={{ id: n.id }} className="font-medium">
                            {n.nome}
                          </Link>
                          <div className="mt-0.5 text-[10px] text-muted-foreground">
                            {n.categoria ?? "Sem categoria"}
                            {n.localidade ? ` · ${n.localidade}` : ""}
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <Chip tone={e.tone}>{rotuloFase(prefs, n.estado)}</Chip>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Dot tone={p.tone} />
                            {p.label}
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Avatar nome={nomePor(n.contactado_por ?? n.encontrado_por)} size="size-6" />
                            {nomePor(n.contactado_por ?? n.encontrado_por)}
                          </span>
                        </td>
                        <td className="max-w-[200px] truncate px-3 py-3.5 text-muted-foreground">
                          {n.proxima_acao ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        )}

        <div className="space-y-5">
          {verCartao("tarefas") && (
          <Panel title="A fazer agora" subtitle="Por ordem de data">
            {pendentes.length === 0 ? (
              <Vazio texto="Sem tarefas pendentes." />
            ) : (
              <div className="space-y-2.5">
                {pendentes.map((t) => {
                  const atrasada = t.data_hora ? new Date(t.data_hora) < new Date() : false;
                  return (
                    <Link
                      key={t.id}
                      to="/tarefas"
                      className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-secondary/25 p-3 text-left transition hover:border-primary/30"
                    >
                      <Dot tone={atrasada ? "danger" : prioridadeInfo(t.prioridade).tone} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium">{t.titulo}</span>
                        <span className="block truncate text-[10px] text-muted-foreground">
                          {t.notas ?? "Sem notas"}
                        </span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {t.data_hora ? formatarHora(t.data_hora) : "—"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </Panel>
          )}

          {verCartao("oportunidade") && melhorOportunidade && negocioOportunidade && (
            <div className="orbit-panel border-success/20 p-5">
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-xl tone-success">
                  <CheckCircle2 className="size-5" />
                </span>
                <span className="text-[10px] uppercase tracking-[.15em] text-success/70">
                  Oportunidade
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold">{negocioOportunidade.nome}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {melhorOportunidade.pretende ?? "Oportunidade registada."}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Probabilidade {melhorOportunidade.probabilidade}% ·{" "}
                {euros(melhorOportunidade.orcamento_previsto ?? melhorOportunidade.preco_indicado)} ·{" "}
                {formatarData(melhorOportunidade.data_proxima_conversa)}
              </p>
              <Link
                to="/negocios/$id"
                params={{ id: negocioOportunidade.id }}
                className="mt-4 flex items-center gap-1.5 text-xs font-medium text-success"
              >
                Abrir projeto <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <DialogNegocio aberto={novo} onFechar={() => setNovo(false)} />
    </>
  );
}
