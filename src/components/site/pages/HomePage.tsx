import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  Gauge,
  LayoutTemplate,
  LineChart,
  Rocket,
  Search,
  ShoppingBag,
  Smartphone,
  Sparkles,
  MapPin,
  BadgeCheck,
} from "lucide-react";

import { Chip, Panel } from "@/components/crm/Bits";
import { SiteChrome } from "@/components/site/SiteChrome";
import { dict, PATHS, type Locale } from "@/lib/i18n";

const SERVICE_ICONS = [LayoutTemplate, Gauge, LineChart];
const TYPE_ICONS = [Sparkles, ShoppingBag, Smartphone, Rocket];
const PASSOS = ["01", "02", "03", "04"];

export function HomePage({ locale }: { locale: Locale }) {
  const t = dict[locale].home;
  const paths = PATHS[locale];

  return (
    <SiteChrome locale={locale} page="home">
      <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <Chip tone="primary">{t.chip}</Chip>

          <h1 className="orbit-gradient-text mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {t.h1}
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t.lead}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to={paths.contact}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <CalendarCheck className="size-4" />
              {t.ctaProposal}
            </Link>

            <Link
              to={paths.portfolio}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              {t.ctaPortfolio}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              {t.badgeArea}
            </span>

            <span className="flex items-center gap-1.5">
              <BadgeCheck className="size-3.5 text-primary" />
              {t.badgeMobile}
            </span>
          </div>
        </div>

        <Panel bodyClassName="p-6">
          <div className="space-y-4">
            {t.stats.map((i) => (
              <div
                key={i.valor}
                className="flex items-baseline justify-between gap-4"
              >
                <span className="text-2xl font-semibold tracking-tight">
                  {i.valor}
                </span>

                <span className="text-right text-xs text-muted-foreground">
                  {i.texto}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-16">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight">
            {t.aboutTitle}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t.aboutP1}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t.aboutP2}
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">
          {t.servicesTitle}
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {t.services.map((s, idx) => {
            const Icon = SERVICE_ICONS[idx] ?? LayoutTemplate;

            return (
              <article
                key={s.titulo}
                className="orbit-panel orbit-panel-hover p-5"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-secondary">
                  <Icon className="size-4 text-primary" />
                </span>

                <h3 className="mt-3 text-sm font-semibold">{s.titulo}</h3>

                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {s.texto}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">{t.typesTitle}</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.types.map((tipo, idx) => {
            const Icon = TYPE_ICONS[idx] ?? Sparkles;

            return (
              <article
                key={tipo.titulo}
                className="orbit-panel orbit-panel-hover p-5"
              >
                <Icon className="size-5 text-primary" />

                <h3 className="mt-3 text-sm font-semibold">{tipo.titulo}</h3>

                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {tipo.texto}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight">
          {t.processTitle}
        </h2>

        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.process.map((p, idx) => (
            <li key={p.titulo} className="orbit-panel p-5">
              <span className="text-[11px] font-semibold tracking-[.2em] text-primary">
                {PASSOS[idx]}
              </span>

              <h3 className="mt-2 text-sm font-semibold">{p.titulo}</h3>

              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {p.texto}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <div className="orbit-panel p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-lg font-semibold">{t.ctaTitle}</h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {t.ctaText}
              </p>
            </div>

            <Link
              to={paths.contact}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              {t.ctaButton}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <Panel className="mt-16" bodyClassName="p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t.finalTitle}</h2>

            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Search className="size-3.5" />
              {t.finalText}
            </p>
          </div>

          <Link
            to={paths.contact}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            {t.finalButton}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Panel>
    </SiteChrome>
  );
}
