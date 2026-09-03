import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { Chip } from "@/components/crm/Bits";
import { SiteChrome } from "@/components/site/SiteChrome";
import { supabase } from "@/integrations/supabase/client";
import {
  dict,
  ORCAMENTO_VALUES,
  PATHS,
  TIPO_VALUES,
  type Locale,
} from "@/lib/i18n";

const INPUT_CLASS =
  "min-h-[48px] w-full rounded-xl border border-border/70 bg-background/55 px-4 text-[13px] text-foreground outline-none transition duration-200 placeholder:text-muted-foreground/50 hover:border-primary/20 hover:bg-background/70 focus:border-primary/50 focus:bg-background/80 focus:ring-4 focus:ring-primary/[0.07]";

const EXTRA: Record<
  Locale,
  {
    eyebrow: string;
    confidence: string;
    confidenceText: string;
    direct: string;
    directText: string;
    project: string;
    projectText: string;
    details: string;
    contact: string;
    optional: string;
    privacy: string;
    choose: string;
  }
> = {
  pt: {
    eyebrow: "Conte-nos o que tem em mente",
    confidence: "Sem compromisso",
    confidenceText:
      "Primeiro percebemos o projeto. Só depois falamos da solução.",
    direct: "Contacto direto",
    directText:
      "Fala diretamente com a Nova Web Studio, sem intermediários.",
    project: "Feito à medida",
    projectText:
      "Cada proposta é pensada de acordo com o negócio e os seus objetivos.",
    details: "Sobre o projeto",
    contact: "Os seus dados",
    optional: "Opcional",
    privacy:
      "Os seus dados são utilizados apenas para responder ao pedido.",
    choose: "Selecionar",
  },

  en: {
    eyebrow: "Tell us what you have in mind",
    confidence: "No obligation",
    confidenceText:
      "We understand the project first. Then we discuss the right solution.",
    direct: "Direct communication",
    directText:
      "Speak directly with Nova Web Studio, without intermediaries.",
    project: "Built around you",
    projectText:
      "Every proposal is shaped around the business and its goals.",
    details: "About the project",
    contact: "Your details",
    optional: "Optional",
    privacy:
      "Your information is only used to respond to your request.",
    choose: "Select",
  },

  de: {
    eyebrow: "Erzählen Sie uns von Ihrem Projekt",
    confidence: "Unverbindlich",
    confidenceText:
      "Zuerst verstehen wir das Projekt. Danach besprechen wir die passende Lösung.",
    direct: "Direkter Kontakt",
    directText:
      "Sie sprechen direkt mit Nova Web Studio.",
    project: "Individuell entwickelt",
    projectText:
      "Jedes Angebot wird an das Unternehmen und seine Ziele angepasst.",
    details: "Über das Projekt",
    contact: "Ihre Angaben",
    optional: "Optional",
    privacy:
      "Ihre Daten werden nur zur Beantwortung Ihrer Anfrage verwendet.",
    choose: "Auswählen",
  },

  fr: {
    eyebrow: "Parlez-nous de votre projet",
    confidence: "Sans engagement",
    confidenceText:
      "Nous commençons par comprendre le projet avant de proposer une solution.",
    direct: "Contact direct",
    directText:
      "Vous échangez directement avec Nova Web Studio.",
    project: "Sur mesure",
    projectText:
      "Chaque proposition est adaptée à l'activité et à ses objectifs.",
    details: "À propos du projet",
    contact: "Vos coordonnées",
    optional: "Facultatif",
    privacy:
      "Vos données sont uniquement utilisées pour répondre à votre demande.",
    choose: "Sélectionner",
  },

  es: {
    eyebrow: "Cuéntanos qué tienes en mente",
    confidence: "Sin compromiso",
    confidenceText:
      "Primero entendemos el proyecto. Después hablamos de la solución.",
    direct: "Contacto directo",
    directText:
      "Hablas directamente con Nova Web Studio.",
    project: "A medida",
    projectText:
      "Cada propuesta se adapta al negocio y a sus objetivos.",
    details: "Sobre el proyecto",
    contact: "Tus datos",
    optional: "Opcional",
    privacy:
      "Tus datos solo se utilizan para responder a tu solicitud.",
    choose: "Seleccionar",
  },
};

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setVisible(true);
        observer.unobserve(element);
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-5 opacity-0"
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="text-primary">{icon}</span>

        <span>{label}</span>
      </div>

      {children}
    </div>
  );
}

function PremiumSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected =
    options.find((option) => option.value === value) ?? null;

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        closeOnOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        closeOnEscape,
      );
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`group flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl border px-4 text-left text-[13px] outline-none transition-all duration-200 ${
          open
            ? "border-primary/50 bg-background/90 shadow-[0_0_0_4px_rgba(45,212,191,0.05)]"
            : "border-border/70 bg-background/55 hover:border-primary/25 hover:bg-background/75"
        }`}
      >
        <span
          className={
            selected
              ? "truncate text-foreground"
              : "truncate text-muted-foreground"
          }
        >
          {selected?.label ?? placeholder}
        </span>

        <span
          className={`grid size-7 shrink-0 place-items-center rounded-lg transition-all duration-200 ${
            open
              ? "rotate-180 bg-primary/10 text-primary"
              : "bg-secondary/70 text-muted-foreground group-hover:text-primary"
          }`}
        >
          <ChevronDown className="size-3.5" />
        </span>
      </button>

      <div
        className={`absolute left-0 right-0 top-[calc(100%+8px)] z-[100] origin-top transition-all duration-200 ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-2 scale-[0.98] opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-[#07111c]/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
          <div className="max-h-[310px] overflow-y-auto">
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left text-xs transition-all duration-150 ${
                    active
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={`size-1.5 shrink-0 rounded-full transition ${
                        active
                          ? "bg-primary shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                          : "bg-muted-foreground/30 group-hover:bg-primary/50"
                      }`}
                    />

                    <span className="truncate">
                      {option.label}
                    </span>
                  </span>

                  {active && (
                    <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactPage({ locale }: { locale: Locale }) {
  const t = dict[locale].contact;
  const nav = dict[locale].nav;
  const paths = PATHS[locale];
  const extra = EXTRA[locale];

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
    tipoIndex: "0",
    orcamentoIndex: "0",
    mensagem: "",
    querReuniao: false,
  });

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nome = form.nome.trim();
    const email = form.email.trim();

    if (!nome || !email) {
      toast.error(t.errorRequired);
      return;
    }

    setSending(true);

    const tipoIndex = Number(form.tipoIndex);
    const orcamentoIndex = Number(form.orcamentoIndex);

    const mensagem = form.mensagem.trim();

    const { error } = await supabase
      .from("website_requests")
      .insert({
        nome,
        empresa: form.empresa.trim() || null,
        email,
        telefone: form.telefone.trim() || null,

        tipo_projeto:
          TIPO_VALUES[tipoIndex] ??
          TIPO_VALUES[0],

        orcamento:
          ORCAMENTO_VALUES[orcamentoIndex] ??
          ORCAMENTO_VALUES[0],

        mensagem: `${
          mensagem ? `${mensagem}\n\n` : ""
        }Origem: Website público`,

        quer_reuniao: form.querReuniao,
      });

    setSending(false);

    if (error) {
      console.error(error);
      toast.error(t.errorSend);
      return;
    }

    toast.success(t.success);
    setSent(true);
  }

  const tipoOptions = t.tipos.map((label, index) => ({
    value: String(index),
    label,
  }));

  const budgetOptions = t.orcamentos.map(
    (label, index) => ({
      value: String(index),
      label,
    }),
  );

  return (
    <SiteChrome locale={locale} page="contact">
      <style>{`
        @keyframes nws-contact-glow {
          0%, 100% {
            opacity: .4;
            transform: scale(1);
          }

          50% {
            opacity: .75;
            transform: scale(1.06);
          }
        }

        .nws-contact-glow {
          animation: nws-contact-glow 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .nws-contact-glow {
            animation: none !important;
          }
        }
      `}</style>

      <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:gap-14">
        {/* COLUNA ESQUERDA */}
        <div>
          <Reveal>
            <Chip tone="primary">
              {t.chip}
            </Chip>

            <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-primary">
              <Sparkles className="size-3.5" />

              {extra.eyebrow}
            </div>

            <h1 className="orbit-gradient-text mt-4 text-4xl font-semibold leading-[1.07] tracking-tight sm:text-5xl">
              {t.h1}
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              {t.lead}
            </p>
          </Reveal>

          <div className="mt-8 space-y-3">
            <Reveal delay={80}>
              <div className="group flex gap-4 rounded-2xl border border-border/60 bg-card/30 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card/50">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                  <CalendarClock className="size-4 text-primary" />
                </span>

                <div>
                  <p className="text-sm font-medium">
                    {t.reply}
                  </p>

                  <p className="mt-1 text-xs leading-6 text-muted-foreground">
                    {extra.confidenceText}
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="group flex gap-4 rounded-2xl border border-border/60 bg-card/30 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card/50">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                  <MessageSquareText className="size-4 text-primary" />
                </span>

                <div>
                  <p className="text-sm font-medium">
                    {extra.direct}
                  </p>

                  <p className="mt-1 text-xs leading-6 text-muted-foreground">
                    {extra.directText}
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="group flex gap-4 rounded-2xl border border-border/60 bg-card/30 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card/50">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                  <BadgeCheck className="size-4 text-primary" />
                </span>

                <div>
                  <p className="text-sm font-medium">
                    {extra.project}
                  </p>

                  <p className="mt-1 text-xs leading-6 text-muted-foreground">
                    {extra.projectText}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={260}>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <a
                href="mailto:geral@novawebstudio.pt"
                className="group rounded-2xl border border-border/60 bg-background/30 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-accent/30"
              >
                <Mail className="size-4 text-primary" />

                <p className="mt-3 text-[10px] uppercase tracking-[.16em] text-muted-foreground">
                  Email
                </p>

                <p className="mt-1 break-all text-xs font-medium">
                  geral@novawebstudio.pt
                </p>
              </a>

              <a
                href="tel:+351937642061"
                className="group rounded-2xl border border-border/60 bg-background/30 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-accent/30"
              >
                <Phone className="size-4 text-primary" />

                <p className="mt-3 text-[10px] uppercase tracking-[.16em] text-muted-foreground">
                  Telefone
                </p>

                <p className="mt-1 text-xs font-medium">
                  +351 937 642 061
                </p>
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="size-3.5 text-primary" />
              {t.location}
            </div>
          </Reveal>
        </div>

        {/* FORMULÁRIO */}
        <Reveal delay={120}>
          <div className="relative">
            <div className="nws-contact-glow absolute -right-12 -top-12 -z-10 size-64 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative rounded-[2rem] border border-border/70 bg-card/40 shadow-2xl shadow-black/10">
              <div
                className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] opacity-[0.025]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                  backgroundSize: "34px 34px",
                }}
              />

              {!sent ? (
                <form
                  onSubmit={submit}
                  className="p-6 sm:p-8 lg:p-9"
                >
                  {/* HEADER */}
                  <div className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-[.18em] text-primary">
                        {extra.confidence}
                      </span>

                      <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                        {t.panelTitle}
                      </h2>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.panelSubtitle}
                      </p>
                    </div>

                    <div className="flex max-w-xs items-center gap-2 text-[10px] leading-5 text-muted-foreground">
                      <ShieldCheck className="size-3.5 shrink-0 text-primary" />
                      {extra.privacy}
                    </div>
                  </div>

                  {/* DADOS */}
                  <section className="mt-7">
                    <div className="mb-5 flex items-center gap-3">
                      <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-[10px] font-semibold text-primary">
                        01
                      </span>

                      <p className="text-xs font-semibold uppercase tracking-[.15em] text-muted-foreground">
                        {extra.contact}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label={t.labels.nome}
                        icon={
                          <UserRound className="size-4" />
                        }
                      >
                        <input
                          value={form.nome}
                          onChange={(event) =>
                            update(
                              "nome",
                              event.target.value,
                            )
                          }
                          autoComplete="name"
                          className={INPUT_CLASS}
                        />
                      </Field>

                      <Field
                        label={t.labels.empresa}
                        icon={
                          <Building2 className="size-4" />
                        }
                      >
                        <input
                          value={form.empresa}
                          onChange={(event) =>
                            update(
                              "empresa",
                              event.target.value,
                            )
                          }
                          autoComplete="organization"
                          placeholder={extra.optional}
                          className={INPUT_CLASS}
                        />
                      </Field>

                      <Field
                        label={t.labels.email}
                        icon={
                          <Mail className="size-4" />
                        }
                      >
                        <input
                          type="email"
                          value={form.email}
                          onChange={(event) =>
                            update(
                              "email",
                              event.target.value,
                            )
                          }
                          autoComplete="email"
                          placeholder="email@exemplo.pt"
                          className={INPUT_CLASS}
                        />
                      </Field>

                      <Field
                        label={t.labels.telefone}
                        icon={
                          <Phone className="size-4" />
                        }
                      >
                        <input
                          type="tel"
                          value={form.telefone}
                          onChange={(event) =>
                            update(
                              "telefone",
                              event.target.value,
                            )
                          }
                          autoComplete="tel"
                          placeholder="+351"
                          className={INPUT_CLASS}
                        />
                      </Field>
                    </div>
                  </section>

                  {/* PROJETO */}
                  <section className="mt-8 border-t border-border/60 pt-7">
                    <div className="mb-5 flex items-center gap-3">
                      <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-[10px] font-semibold text-primary">
                        02
                      </span>

                      <p className="text-xs font-semibold uppercase tracking-[.15em] text-muted-foreground">
                        {extra.details}
                      </p>
                    </div>

                    {/* DROPDOWNS PREMIUM */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label={t.labels.tipo}
                        icon={
                          <BadgeCheck className="size-4" />
                        }
                      >
                        <PremiumSelect
                          value={form.tipoIndex}
                          onChange={(value) =>
                            update("tipoIndex", value)
                          }
                          options={tipoOptions}
                          placeholder={extra.choose}
                        />
                      </Field>

                      <Field
                        label={t.labels.orcamento}
                        icon={
                          <Sparkles className="size-4" />
                        }
                      >
                        <PremiumSelect
                          value={form.orcamentoIndex}
                          onChange={(value) =>
                            update(
                              "orcamentoIndex",
                              value,
                            )
                          }
                          options={budgetOptions}
                          placeholder={extra.choose}
                        />
                      </Field>
                    </div>

                    <div className="mt-5">
                      <Field
                        label={t.labels.mensagem}
                        icon={
                          <MessageSquareText className="size-4" />
                        }
                      >
                        <textarea
                          value={form.mensagem}
                          onChange={(event) =>
                            update(
                              "mensagem",
                              event.target.value,
                            )
                          }
                          rows={6}
                          placeholder={t.placeholder}
                          className={`${INPUT_CLASS} min-h-[160px] resize-y py-3 leading-6`}
                        />
                      </Field>
                    </div>
                  </section>

                  {/* REUNIÃO */}
                  <label className="group mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-border/60 bg-background/30 p-4 transition duration-200 hover:border-primary/25 hover:bg-accent/20">
                    <span
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition ${
                        form.querReuniao
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background"
                      }`}
                    >
                      {form.querReuniao && (
                        <Check className="size-3.5" />
                      )}
                    </span>

                    <input
                      type="checkbox"
                      checked={form.querReuniao}
                      onChange={(event) =>
                        update(
                          "querReuniao",
                          event.target.checked,
                        )
                      }
                      className="sr-only"
                    />

                    <div>
                      <p className="text-sm font-medium">
                        {t.meeting}
                      </p>

                      <p className="mt-1 text-xs leading-6 text-muted-foreground">
                        {t.note}
                      </p>
                    </div>
                  </label>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={sending}
                    className="group mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20 disabled:pointer-events-none disabled:opacity-60"
                  >
                    {sending ? (
                      <>
                        <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />

                        {t.submitting}
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />

                        {t.submit}

                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* SUCESSO */
                <div className="flex min-h-[650px] flex-col items-center justify-center p-8 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />

                    <span className="relative grid size-20 place-items-center rounded-full border border-primary/20 bg-primary/10">
                      <CheckCircle2 className="size-9 text-primary" />
                    </span>
                  </div>

                  <span className="mt-7 text-[10px] font-semibold uppercase tracking-[.2em] text-primary">
                    Nova Web Studio
                  </span>

                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                    {t.sentTitle}
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                    {t.sentText}
                  </p>

                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Link
                      to={paths.home}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground"
                    >
                      {nav.home}

                      <ArrowRight className="size-4" />
                    </Link>

                    <Link
                      to={paths.portfolio}
                      className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm transition hover:bg-accent"
                    >
                      {nav.portfolio}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </SiteChrome>
  );
}
