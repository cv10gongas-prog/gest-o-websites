import { useState } from "react";
import { Check, Copy, ExternalLink, MessageSquareHeart, Plus, Quote, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

import { Chip, Vazio } from "@/components/crm/Bits";
import { DialogInqueritoSatisfacao } from "@/components/crm/DialogInqueritoSatisfacao";
import { formatarData } from "@/lib/crm";
import { gerarUrlInquerito, type SatisfactionSurvey } from "@/lib/satisfacao";
import { useAlternarInquerito, useSatisfactionSurveys } from "@/lib/satisfacao.queries";

interface SeccaoSatisfacaoNegocioProps {
  businessId: string;
  businessNome: string;
}

export function SeccaoSatisfacaoNegocio({
  businessId,
  businessNome,
}: SeccaoSatisfacaoNegocioProps) {
  const { data: surveys = [], isLoading } = useSatisfactionSurveys(businessId);
  const toggle = useAlternarInquerito();
  const [openCreate, setOpenCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
            <MessageSquareHeart className="size-4 text-primary" />
            Satisfação do cliente
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Ligações de feedback enviadas a {businessNome} e respetivas respostas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
        >
          <Plus className="size-3.5" /> Novo inquérito
        </button>
      </div>

      {isLoading ? (
        <Vazio texto="A carregar inquéritos..." />
      ) : surveys.length === 0 ? (
        <div className="rounded-3xl border border-border/70 bg-surface/40 p-10 text-center">
          <Vazio texto="Ainda não existe nenhum inquérito de satisfação para este cliente." />
        </div>
      ) : (
        <div className="space-y-3">
          {surveys.map((survey) => {
            const answered = survey.responded_at !== null;
            return (
              <div
                key={survey.id}
                className="rounded-2xl border border-border/70 bg-surface/50 p-4 text-xs"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-foreground">{survey.project_name}</span>
                      {answered ? (
                        <Chip tone="success">Respondido</Chip>
                      ) : survey.active ? (
                        <Chip tone="warning">Por responder</Chip>
                      ) : (
                        <Chip tone="muted">Desativado</Chip>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Criado a {formatarData(survey.created_at, true)}
                      {survey.responded_at
                        ? ` · Respondido a ${formatarData(survey.responded_at, true)}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyLink(survey)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-surface-strong px-3 py-1.5 font-semibold"
                    >
                      {copiedId === survey.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {copiedId === survey.id ? "Copiado" : "Copiar link"}
                    </button>
                    <a
                      href={gerarUrlInquerito(survey.token)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-surface-strong px-3 py-1.5 font-semibold"
                    >
                      <ExternalLink className="size-3.5" /> Abrir
                    </a>
                    {!answered ? (
                      <button
                        type="button"
                        disabled={toggle.isPending}
                        onClick={() => toggle.mutate({ id: survey.id, active: !survey.active })}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-surface-strong px-3 py-1.5 font-semibold"
                      >
                        {survey.active ? <ToggleRight className="size-4 text-success" /> : <ToggleLeft className="size-4" />}
                        {survey.active ? "Desativar" : "Reabrir"}
                      </button>
                    ) : null}
                  </div>
                </div>

                {answered ? (
                  <div className="mt-4 space-y-3 border-t border-border/40 pt-4">
                    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                      {[
                        ["Recomendação", survey.recommendation_score, 20],
                        ["Serviço", survey.service_score, 10],
                        ["Resultado", survey.result_score, 10],
                        ["Comunicação", survey.communication_score, 10],
                        ["Prazos", survey.deadlines_score, 10],
                        ["Facilidade", survey.ease_score, 10],
                      ].map(([label, value, max]) => (
                        <div key={String(label)} className="rounded-xl border border-border/50 bg-surface-strong/50 p-2.5 text-center">
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
                          <span className="mt-1 block font-mono text-sm font-bold">{value ?? "—"}/{max}</span>
                        </div>
                      ))}
                    </div>

                    {survey.liked_text ? (
                      <p className="rounded-xl bg-surface-strong/40 p-3 text-muted-foreground">
                        <strong className="text-foreground">O que mais gostou: </strong>{survey.liked_text}
                      </p>
                    ) : null}
                    {survey.improvement_text ? (
                      <p className="rounded-xl bg-surface-strong/40 p-3 text-muted-foreground">
                        <strong className="text-foreground">O que podemos melhorar: </strong>{survey.improvement_text}
                      </p>
                    ) : null}
                    {survey.testimonial ? (
                      <div className="rounded-xl border border-border/50 bg-surface-strong/40 p-3">
                        <span className="inline-flex items-center gap-1.5 font-bold"><Quote className="size-3.5 text-primary" /> Testemunho</span>
                        <p className="mt-2 italic leading-relaxed text-muted-foreground">“{survey.testimonial}”</p>
                      </div>
                    ) : null}
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl border border-border/50 bg-surface-strong/40 p-3">
                        <p className="font-bold">Autorização para aparecer no site</p>
                        <Chip tone={survey.portfolio_authorized ? "success" : "muted"}>
                          {survey.portfolio_authorized ? "Sim" : "Não"}
                        </Chip>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-surface-strong/40 p-3">
                        <p className="font-bold">Autorização para testemunho público</p>
                        <Chip tone={survey.testimonial_authorized ? "success" : "muted"}>
                          {survey.testimonial_authorized ? "Sim" : "Não"}
                        </Chip>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <DialogInqueritoSatisfacao
        aberto={openCreate}
        onFechar={() => setOpenCreate(false)}
        businessIdPredefinido={businessId}
      />
    </div>
  );
}
