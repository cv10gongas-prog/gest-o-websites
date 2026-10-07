import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  ExternalLink,
  MessageSquareHeart,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { SubmitSurveyPayload } from "@/lib/satisfacao";
import {
  usePublicSatisfactionSurvey,
  useSubmeterInqueritoPublico,
} from "@/lib/satisfacao.queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/satisfacao/$token")({
  head: () => ({
    meta: [
      { title: "Inquérito de Satisfação — Nova Web Studio" },
      {
        name: "description",
        content: "Partilhe a sua experiência com a Nova Web Studio.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaginaPublicaSatisfacao,
});

function PaginaPublicaSatisfacao() {
  const { token } = Route.useParams();
  const { data: survey, isLoading, error } = usePublicSatisfactionSurvey(token);
  const submit = useSubmeterInqueritoPublico();
  const [success, setSuccess] = useState(false);
  const [recommendation, setRecommendation] = useState<number | null>(null);
  const [service, setService] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [communication, setCommunication] = useState<number | null>(null);
  const [deadlines, setDeadlines] = useState<number | null>(null);
  const [ease, setEase] = useState<number | null>(null);
  const [liked, setLiked] = useState("");
  const [improvement, setImprovement] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [testimonialAuthorized, setTestimonialAuthorized] = useState(false);
  const [portfolioAuthorized, setPortfolioAuthorized] = useState(false);

  if (isLoading) return <PublicState title="A carregar..." />;

  if (error || !survey || !survey.active) {
    return (
      <PublicState
        title="Inquérito não disponível"
        text="Esta ligação foi desativada, expirou ou não é válida."
      />
    );
  }

  if (survey.responded && !success) {
    return (
      <PublicState
        success
        title="Inquérito já respondido"
        text="Obrigado. Esta ligação já foi utilizada para enviar uma resposta."
      />
    );
  }

  if (success) {
    return (
      <PublicState
        success
        title="Obrigado pelo seu feedback."
        text="A sua resposta foi registada com sucesso."
      />
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      recommendation === null ||
      service === null ||
      result === null ||
      communication === null ||
      deadlines === null ||
      ease === null
    ) {
      toast.error("Responde às seis perguntas de escala antes de enviar.");
      return;
    }

    const payload: SubmitSurveyPayload = {
      token,
      recommendation_score: recommendation,
      service_score: service,
      result_score: result,
      communication_score: communication,
      deadlines_score: deadlines,
      ease_score: ease,
      liked_text: liked.trim() || null,
      improvement_text: improvement.trim() || null,
      testimonial: testimonial.trim() || null,
      testimonial_authorized: testimonialAuthorized,
      portfolio_authorized: portfolioAuthorized,
    };

    try {
      await submit.mutateAsync(payload);
      setSuccess(true);
    } catch (submitError) {
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível enviar o feedback.",
      );
    }
  }

  const answeredCount = [recommendation, service, result, communication, deadlines, ease].filter(
    (value) => value !== null,
  ).length;
  const progress = Math.round((answeredCount / 6) * 100);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#10243a_0,#07101c_42%,#050b13_100%)] px-4 py-8 text-[#e2e8f0] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Sparkles className="size-3.5" /> Nova Web Studio
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Inquérito de Satisfação
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#94a3b8]">
            Queremos perceber o que correu bem e onde podemos melhorar. A resposta demora poucos minutos.
          </p>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[#1f2e42] bg-[#0e1927]/90 px-4 py-2.5 text-xs text-[#cbd5e1] shadow-xl">
            <strong className="text-white">{survey.client_display_name}</strong>
            <span className="text-[#475569]">·</span>
            <span>{survey.project_name}</span>
          </div>
        </header>

        <div className="rounded-2xl border border-[#1f2e42] bg-[#0e1927]/80 p-4 shadow-lg backdrop-blur">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold">
            <span className="text-[#cbd5e1]">Progresso</span>
            <span className="text-primary">{answeredCount}/6 avaliações</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#17263a]">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ScaleQuestion
            number={1}
            title="De 0 a 20, qual a probabilidade de recomendar a Nova Web Studio a outra pessoa ou empresa?"
            min={0}
            max={20}
            value={recommendation}
            onChange={setRecommendation}
            minLabel="Nada provável"
            maxLabel="Extremamente provável"
          />
          <ScaleQuestion
            number={2}
            title="De 0 a 10, como avalia o serviço prestado?"
            min={0}
            max={10}
            value={service}
            onChange={setService}
            minLabel="Muito fraco"
            maxLabel="Excelente"
          />
          <ScaleQuestion
            number={3}
            title="De 0 a 10, como avalia o resultado final do projeto?"
            min={0}
            max={10}
            value={result}
            onChange={setResult}
            minLabel="Muito abaixo do esperado"
            maxLabel="Superou as expectativas"
          />
          <ScaleQuestion
            number={4}
            title="De 0 a 10, como avalia a comunicação durante o projeto?"
            min={0}
            max={10}
            value={communication}
            onChange={setCommunication}
            minLabel="Muito difícil"
            maxLabel="Excelente"
          />
          <ScaleQuestion
            number={5}
            title="De 0 a 10, como avalia o cumprimento de prazos?"
            min={0}
            max={10}
            value={deadlines}
            onChange={setDeadlines}
            minLabel="Muito insatisfatório"
            maxLabel="Totalmente cumpridos"
          />
          <ScaleQuestion
            number={6}
            title="De 0 a 10, quão fácil foi trabalhar connosco?"
            min={0}
            max={10}
            value={ease}
            onChange={setEase}
            minLabel="Muito difícil"
            maxLabel="Muito fácil"
          />

          <div className="space-y-4 rounded-3xl border border-[#1f2e42] bg-[#0e1927] p-6">
            <TextArea
              label="O que mais gostou? (opcional)"
              value={liked}
              onChange={setLiked}
              placeholder="O que correu especialmente bem?"
            />
            <TextArea
              label="O que podemos melhorar? (opcional)"
              value={improvement}
              onChange={setImprovement}
              placeholder="Alguma coisa que devêssemos fazer de forma diferente?"
            />
            <TextArea
              label="Quer deixar um testemunho que possamos usar no nosso website? (opcional)"
              value={testimonial}
              onChange={setTestimonial}
              placeholder="Escreva aqui o seu testemunho."
            />

            <div className="space-y-3 border-t border-[#1f2e42] pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                Autorizações opcionais
              </p>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#1f2e42] bg-[#0b1522] p-4 text-xs leading-relaxed text-[#cbd5e1] transition hover:border-primary/40">
                <input
                  type="checkbox"
                  checked={testimonialAuthorized}
                  onChange={(event) => setTestimonialAuthorized(event.target.checked)}
                  className="mt-0.5 size-5 shrink-0 rounded border-[#334155] text-primary focus:ring-primary"
                />
                <span>
                  <strong className="block text-white">Autorização para testemunho público</strong>
                  Autorizo a Nova Web Studio a utilizar publicamente o testemunho escrito acima.
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#1f2e42] bg-[#0b1522] p-4 text-xs leading-relaxed text-[#cbd5e1] transition hover:border-primary/40">
                <input
                  type="checkbox"
                  checked={portfolioAuthorized}
                  onChange={(event) => setPortfolioAuthorized(event.target.checked)}
                  className="mt-0.5 size-5 shrink-0 rounded border-[#334155] text-primary focus:ring-primary"
                />
                <span>
                  <strong className="block text-white">
                    Autorização para apresentar o negócio ou projeto
                  </strong>
                  Autorizo a Nova Web Studio a apresentar o meu negócio/projeto no seu website e
                  portefólio. Isto pode incluir o nome e logótipo do negócio, imagens ou apresentação
                  do trabalho realizado e uma ligação para o website/projeto público.
                </span>
              </label>
              <p className="text-[11px] leading-relaxed text-[#64748b]">
                As duas autorizações são independentes, opcionais e não estão selecionadas por defeito.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submit.isPending}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="size-4" />
            {submit.isPending ? "A enviar..." : "Enviar feedback"}
          </button>
        </form>

        <footer className="border-t border-[#1f2e42] pt-6 text-center text-xs text-[#64748b]">
          <a
            href="https://www.novawebstudio.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-primary"
          >
            novawebstudio.pt <ExternalLink className="size-3" />
          </a>
        </footer>
      </div>
    </div>
  );
}

function ScaleQuestion({
  number,
  title,
  min,
  max,
  value,
  onChange,
  minLabel,
  maxLabel,
}: {
  number: number;
  title: string;
  min: number;
  max: number;
  value: number | null;
  onChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
}) {
  const values = Array.from({ length: max - min + 1 }, (_, index) => min + index);
  const recommendationScale = max === 20;
  return (
    <section className="space-y-4 rounded-3xl border border-[#1f2e42] bg-[#0e1927]/95 p-5 shadow-xl shadow-black/10 transition sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-xs font-extrabold text-primary">
          {number}
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Pergunta {number} de 6
          </span>
          <h2 className="mt-1 text-base font-bold leading-snug text-white">{title} *</h2>
        </div>
        {value !== null ? (
          <div className="hidden shrink-0 items-center gap-1 rounded-xl border border-primary/25 bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary sm:flex">
            <Star className="size-3.5 fill-current" />
            {value}/{max}
          </div>
        ) : null}
      </div>
      <div
        className={cn(
          "grid gap-1.5",
          recommendationScale
            ? "grid-cols-7 sm:grid-cols-11 lg:grid-cols-[repeat(21,minmax(0,1fr))]"
            : "grid-cols-6 sm:grid-cols-11",
        )}
      >
        {values.map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={cn(
              "h-10 rounded-xl border text-xs font-bold transition duration-150 active:scale-95",
              value === score
                ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "border-[#1f2e42] bg-[#132032] text-[#e2e8f0] hover:border-primary/50",
            )}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="flex justify-between gap-4 text-[10px] font-semibold text-[#94a3b8]">
        <span>{min} · {minLabel}</span>
        <span className="text-right">{max} · {maxLabel}</span>
      </div>
    </section>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#e2e8f0]">{label}</label>
      <textarea
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={3000}
        className="w-full rounded-2xl border border-[#1f2e42] bg-[#132032] p-3 text-xs text-white outline-none placeholder:text-[#64748b] focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function PublicState({
  title,
  text,
  success = false,
}: {
  title: string;
  text?: string;
  success?: boolean;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07101c] p-4 text-[#e2e8f0]">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-[#1f2e42] bg-[#0e1927] p-8 text-center shadow-2xl">
        <div
          className={cn(
            "mx-auto grid size-12 place-items-center rounded-2xl",
            success ? "bg-success/15 text-success" : "bg-primary/10 text-primary",
          )}
        >
          {success ? <CheckCircle2 className="size-6" /> : <MessageSquareHeart className="size-6" />}
        </div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        {text ? <p className="text-xs leading-relaxed text-[#94a3b8]">{text}</p> : null}
      </div>
    </div>
  );
}
