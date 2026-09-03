import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
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
    const node = ref.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setVisible(true);
        observer.unobserve(node);
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0"
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

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
    safe: string;
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
    safe: "Os seus dados são utilizados apenas para responder ao pedido.",
  },

  en: {
    eyebrow: "Tell us what you have in mind",
    confidence: "No obligation",
    confidenceText:
      "We understand the project first. Then we discuss the right solution.",
    direct: "Direct communication",
    directText:
      "Speak directly with Nova Web Studio, without intermediaries.",
    project: "Tailored to you",
    projectText:
      "Every proposal is shaped around the business and its goals.",
    details: "About the project",
    contact: "Your details",
    optional: "Optional",
    safe:
      "Your information is only used to respond to your request.",
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
    safe:
      "Ihre Daten werden nur zur Beantwortung Ihrer Anfrage verwendet.",
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
    safe:
      "Vos données sont uniquement utilisées pour répondre à votre demande.",
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
    safe:
      "Tus datos solo se utilizan para responder a tu solicitud.",
  },
};

export function ContactPage({ locale }: { locale: Locale }) {
  const t = dict[locale].contact;
  const nav = dict[locale].nav;
  const paths = PATHS[locale];
  const extra = EXTRA[locale];

  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

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

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

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

  return (
    <SiteChrome locale={locale} page="contact">
      <style>{`
        @keyframes nws-contact-pulse {
          0%, 100% {
            opacity: .45;
            transform: scale(1);
          }

          50% {
            opacity: .8;
            transform: scale(1.05);
          }
        }

        .nws-contact-pulse {
          animation: nws-contact-pulse 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .nws-contact-pulse {
            animation: none !important;
          }
        }
      `}</style>

      <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:gap-14">
        {/* LEFT */}
        <div>
          <Reveal>
            <Chip tone="primary">{t.chip}</Chip>

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
              <div className="group flex gap-4 rounded-2xl border border-border/60 bg-card/30 p-4 transition hover:border-primary/20 hover:bg-card/50">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                  <CalendarClock className="size-4 text-primary" />
                </span>

                <div>
                  <p className="text-sm font-medium">
                    {t.reply}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {extra.confidenceText}
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="group flex gap-4 rounded-2xl border border-border/60 bg-card/30 p-4 transition hover:border-primary/20 hover:bg-card/50">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                  <MessageSquareText className="size-4 text-primary" />
                </span>

                <div>
                  <p className="text-sm font-medium">
                    {extra.direct}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {extra.directText}
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="group flex gap-4 rounded-2xl border border-border/60 bg-card/30 p-4 transition hover:border-primary/20 hover:bg-card/50">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                  <BadgeCheck className="size-4 text-primary" />
                </span>

                <div>
                  <p className="text-sm font-medium">
                    {extra.project}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
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
                className="group rounded-2xl border border-border/60 bg-background/30 p-4 transition hover:border-primary/20 hover:bg-accent/40"
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
                className="group rounded-2xl border border-border/60 bg-background/30 p-4 transition hover:border-primary/20 hover:bg-accent/40"
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

        {/* FORM */}
        <Reveal
          delay={120}
          className="relative"
        >
          <div className="nws-contact-pulse absolute -right-12 -top-12 -z-10 size-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/40 shadow-2xl shadow-black/10">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                backgroundSize: "34px 34px",
              }}
            />

            {!sent ? (
              <form
                onSubmit={submit}
                className="relative p-6 sm:p-8 lg:p-9"
              >
                <div className="flex flex-col gap-3 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
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

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <ShieldCheck className="size-3.5 text-primary" />
                    {extra.safe}
                  </div>
                </div>

                {/* CONTACT DETAILS */}
                <div className="mt-7">
                  <div className="mb-4 flex items-center gap-3">
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
                      icon={<UserRound className="size-4" />}
                    >
                      <input
                        value={form.nome}
                        onChange={(e) =>
                          update("nome", e.target.value)
                        }
                        autoComplete="name"
                        className="nws-input"
                        placeholder=""
                      />
                    </Field>

                    <Field
                      label={t.labels.empresa}
                      icon={<Building2 className="size-4" />}
                    >
                      <input
                        value={form.empresa}
                        onChange={(e) =>
                          update("empresa", e.target.value)
                        }
                        autoComplete="organization"
                        className="nws-input"
                        placeholder={extra.optional}
                      />
                    </Field>

                    <Field
                      label={t.labels.email}
                      icon={<Mail className="size-4" />}
                    >
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          update("email", e.target.value)
                        }
                        autoComplete="email"
                        className="nws-input"
                        placeholder="email@exemplo.pt"
                      />
                    </Field>

                    <Field
                      label={t.labels.telefone}
                      icon={<Phone className="size-4" />}
                    >
                      <input
                        type="tel"
                        value={form.telefone}
                        onChange={(e) =>
                          update("telefone", e.target.value)
                        }
                        autoComplete="tel"
                        className="nws-input"
                        placeholder="+351"
                      />
                    </Field>
                  </div>
                </div>

                {/* PROJECT */}
                <div className="mt-8 border-t border-border/60 pt-7">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-[10px] font-semibold text-primary">
                      02
                    </span>

                    <p className="text-xs font-semibold uppercase tracking-[.15em] text-muted-foreground">
                      {extra.details}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label={t.labels.tipo}
                      icon={<BadgeCheck className="size-4" />}
                    >
                      <select
                        value={form.tipoIndex}
                        onChange={(e) =>
                          update(
                            "tipoIndex",
                            e.target.value,
                          )
                        }
                        className="nws-input cursor-pointer"
                      >
                        {t.tipos.map((tipo, idx) => (
                          <option
                            key={tipo}
                            value={String(idx)}
                          >
                            {tipo}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label={t.labels.orcamento}
                      icon={<Sparkles className="size-4" />}
                    >
                      <select
                        value={form.orcamentoIndex}
                        onChange={(e) =>
                          update(
                            "orcamentoIndex",
                            e.target.value,
                          )
                        }
                        className="nws-input cursor-pointer"
                      >
                        {t.orcamentos.map(
                          (orcamento, idx) => (
                            <option
                              key={orcamento}
                              value={String(idx)}
                            >
                              {orcamento}
                            </option>
                          ),
                        )}
                      </select>
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field
                      label={t.labels.mensagem}
                      icon={<MessageSquareText className="size-4" />}
                    >
                      <textarea
                        value={form.mensagem}
                        onChange={(e) =>
                          update(
                            "mensagem",
                            e.target.value,
                          )
                        }
                        rows={6}
                        className="nws-input min-h-[150px] resize-y py-3"
                        placeholder={t.placeholder}
                      />
                    </Field>
                  </div>
                </div>

                {/* MEETING */}
                <label className="group mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-border/60 bg-background/30 p-4 transition hover:border-primary/25 hover:bg-accent/20">
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
                    onChange={(e) =>
                      update(
                        "querReuniao",
                        e.target.checked,
                      )
                    }
                    className="sr-only"
                  />

                  <div>
                    <p className="text-sm font-medium">
                      {t.meeting}
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {t.note}
                    </p>
                  </div>
                </label>

                {/* BUTTON */}
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
                      <ArrowRight className="size-0 opacity-0 transition-all duration-300 group-hover:size-4 group-hover:opacity-100" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="relative flex min-h-[610px] flex-col items-center justify-center p-8 text-center">
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
        </Reveal>
      </div>

      <style>{`
        .nws-input {
          width: 100%;
          min-height: 46px;
          border-radius: 12px;
          border: 1px solid hsl(var(--border) / .7);
          background: hsl(var(--background) / .55);
          padding-left: 14px;
          padding-right: 14px;
          font-size: 13px;
          color: hsl(var(--foreground));
          outline: none;
          transition:
            border-color .2s ease,
            background .2s ease,
            box-shadow .2s ease;
        }

        .nws-input::placeholder {
          color: hsl(var(--muted-foreground) / .55);
        }

        .nws-input:focus {
          border-color: hsl(var(--primary) / .55);
          background: hsl(var(--background) / .8);
          box-shadow:
            0 0 0 3px hsl(var(--primary) / .08);
        }

        select.nws-input option {
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }
      `}</style>
    </SiteChrome>
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
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="text-primary">
          {icon}
        </span>

        {label}
      </span>

      {children}
    </label>
  );
}
