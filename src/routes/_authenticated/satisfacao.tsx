import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Copy,
  ExternalLink,
  MessageSquareHeart,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Chip, Vazio } from "@/components/crm/Bits";
import { DialogInqueritoSatisfacao } from "@/components/crm/DialogInqueritoSatisfacao";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatarData } from "@/lib/crm";
import {
  calcularEstatisticasSatisfacao,
  gerarUrlInquerito,
  type SatisfactionSurvey,
} from "@/lib/satisfacao";
import { useAlternarInquerito, useSatisfactionSurveys } from "@/lib/satisfacao.queries";

export const Route = createFileRoute("/_authenticated/satisfacao")({
  head: () => ({
    meta: [
      { title: "Satisfação — Nova Web Studio CRM" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardSatisfacao,
});

type StatusFilter = "todos" | "por_responder" | "respondidos" | "desativados";

function DashboardSatisfacao() {
  const { data: surveys = [], isLoading } = useSatisfactionSurveys();
  const toggle = useAlternarInquerito();
  const [createOpen, setCreateOpen] = useState(false);
  const [details, setDetails] = useState<SatisfactionSurvey | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const stats = useMemo(() => calcularEstatisticasSatisfacao(surveys), [surveys]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return surveys.filter((survey) => {
      const answered = survey.responded_at !== null;
      if (status === "por_responder" && (answered || !survey.active)) return false;
      if (status === "respondidos" && !answered) return false;
      if (status === "desativados" && (answered || survey.active)) return false;
      if (!needle) return true;
      return [survey.business?.nome, survey.client_display_name, survey.project_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [query, status, surveys]);

  const latestResponses = useMemo(
    () =>
      surveys
        .filter((survey) => survey.responded_at)
        .sort(
          (a, b) =>
            new Date(b.responded_at ?? 0).getTime() - new Date(a.responded_at ?? 0).getTime(),
        )
        .slice(0, 3),
    [surveys],
  );

  async function copyLink(survey: SatisfactionSurvey) {
    try {
      await navigator.clipboard.writeText(gerarUrlInquerito(survey.token));
      setCopiedId(survey.id);
      toast.success("Ligação copiada.");
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      toast.error("Não foi possível copiar a ligação.");
    }
  }

  if (isLoading) {
    return <Vazio texto="A carregar inquéritos de satisfação..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Satisfação</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cria ligações privadas de feedback e acompanha a experiência dos clientes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground"
        >
          <Plus className="size-4" /> Novo inquérito
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Inquéritos criados", stats.totalCreated, ""],
          ["Respostas", stats.totalResponses, ""],
          ["Taxa de resposta", `${stats.responseRate}%`, ""],
          ["Índice de Recomendação", stats.totalResponses ? stats.averageRecommendation.toFixed(1) : "—", "/20"],
          ["Satisfação com o serviço", stats.totalResponses ? stats.averageService.toFixed(1) : "—", "/10"],
        ].map(([label, value, suffix]) => (
          <div key={String(label)} className="rounded-2xl border border-border/70 bg-surface/60 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-bold">{value}</span>
              {suffix ? <span className="text-xs text-muted-foreground">{suffix}</span> : null}
            </div>
          </div>
        ))}
      </div>

      {latestResponses.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquareHeart className="size-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Últimas respostas
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {latestResponses.map((survey) => (
              <button
                key={survey.id}
                type="button"
                onClick={() => setDetails(survey)}
                className="rounded-2xl border border-border/70 bg-surface/50 p-4 text-left transition hover:border-primary/40 hover:bg-surface-strong/60"
              >
                <p className="truncate text-sm font-bold">
                  {survey.business?.nome ?? survey.client_display_name}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{survey.project_name}</p>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-primary">
                    {survey.recommendation_score ?? "—"}/20
                  </span>
                  <span className="text-muted-foreground">
                    {survey.responded_at ? formatarData(survey.responded_at, true) : ""}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface/40 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar cliente ou projeto..."
            className="h-10 w-full rounded-xl border border-border bg-background/60 pl-9 pr-3 text-xs outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            ["todos", "Todos"],
            ["por_responder", "Por responder"],
            ["respondidos", "Respondidos"],
            ["desativados", "Desativados"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                status === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface-strong text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-border/70 bg-surface/40 p-12 text-center">
          <Vazio texto="Sem inquéritos para estes filtros." />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-surface/50">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="border-b border-border/60 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Projeto</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Criado</th>
                <th className="p-3">Resposta</th>
                <th className="p-3">Recomendação</th>
                <th className="p-3">Serviço</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((survey) => {
                const answered = survey.responded_at !== null;
                return (
                  <tr key={survey.id} className="hover:bg-surface-strong/40">
                    <td className="p-3 font-semibold">{survey.business?.nome ?? survey.client_display_name}</td>
                    <td className="p-3">{survey.project_name}</td>
                    <td className="p-3">
                      {answered ? (
                        <Chip tone="success">Respondido</Chip>
                      ) : survey.active ? (
                        <Chip tone="warning">Por responder</Chip>
                      ) : (
                        <Chip tone="muted">Desativado</Chip>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">{formatarData(survey.created_at, true)}</td>
                    <td className="p-3 text-muted-foreground">
                      {survey.responded_at ? formatarData(survey.responded_at, true) : "—"}
                    </td>
                    <td className="p-3 font-mono font-bold">
                      {survey.recommendation_score === null ? "—" : `${survey.recommendation_score}/20`}
                    </td>
                    <td className="p-3 font-mono font-bold">
                      {survey.service_score === null ? "—" : `${survey.service_score}/10`}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetails(survey)}
                          className="rounded-lg border border-border bg-surface-strong px-2.5 py-1.5 font-semibold"
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => copyLink(survey)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-strong px-2.5 py-1.5 font-semibold"
                        >
                          {copiedId === survey.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                          {copiedId === survey.id ? "Copiado" : "Link"}
                        </button>
                        <a
                          href={gerarUrlInquerito(survey.token)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="grid size-8 place-items-center rounded-lg border border-border bg-surface-strong"
                          title="Abrir página pública"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                        {!answered ? (
                          <button
                            type="button"
                            disabled={toggle.isPending}
                            onClick={() => toggle.mutate({ id: survey.id, active: !survey.active })}
                            className="grid size-8 place-items-center rounded-lg border border-border bg-surface-strong"
                            title={survey.active ? "Desativar" : "Reabrir"}
                          >
                            {survey.active ? <ToggleRight className="size-4 text-success" /> : <ToggleLeft className="size-4" />}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <DialogInqueritoSatisfacao aberto={createOpen} onFechar={() => setCreateOpen(false)} />

      <Dialog open={Boolean(details)} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareHeart className="size-4 text-primary" />
              Resposta do inquérito
            </DialogTitle>
          </DialogHeader>
          {details ? (
            <SurveyDetails survey={surveys.find((survey) => survey.id === details.id) ?? details} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SurveyDetails({ survey }: { survey: SatisfactionSurvey }) {
  const answered = survey.responded_at !== null;
  return (
    <div className="space-y-4 text-xs">
      <div className="rounded-xl border border-border/60 bg-surface-strong/40 p-3">
        <p className="font-bold">{survey.client_display_name}</p>
        <p className="text-muted-foreground">{survey.project_name}</p>
      </div>
      {!answered ? (
        <p className="text-muted-foreground">Este inquérito ainda não tem resposta.</p>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Índice de Recomendação", survey.recommendation_score, 20],
              ["Serviço", survey.service_score, 10],
              ["Resultado final", survey.result_score, 10],
              ["Comunicação", survey.communication_score, 10],
              ["Prazos", survey.deadlines_score, 10],
              ["Facilidade", survey.ease_score, 10],
            ].map(([label, value, max]) => (
              <div key={String(label)} className="rounded-xl border border-border/50 bg-surface-strong/50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
                <p className="mt-1 font-mono text-lg font-bold">{value ?? "—"}/{max}</p>
              </div>
            ))}
          </div>
          {survey.liked_text ? <TextAnswer title="O que mais gostou" text={survey.liked_text} /> : null}
          {survey.improvement_text ? <TextAnswer title="O que podemos melhorar" text={survey.improvement_text} /> : null}
          {survey.testimonial ? (
            <TextAnswer title="Testemunho" text={survey.testimonial} />
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <AuthorizationStatus
              label="Autorização para aparecer no site"
              authorized={survey.portfolio_authorized}
            />
            <AuthorizationStatus
              label="Autorização para testemunho público"
              authorized={survey.testimonial_authorized}
            />
          </div>
        </>
      )}
    </div>
  );
}

function AuthorizationStatus({ label, authorized }: { label: string; authorized: boolean }) {
  return (
    <div className="rounded-xl border border-border/50 bg-surface-strong/40 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-bold ${authorized ? "text-success" : "text-muted-foreground"}`}>
        {authorized ? "Sim" : "Não"}
      </p>
    </div>
  );
}

function TextAnswer({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-surface-strong/40 p-3">
      <p className="font-bold">{title}</p>
      <p className="mt-1 whitespace-pre-wrap leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
