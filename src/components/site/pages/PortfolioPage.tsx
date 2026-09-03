import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BedDouble,
  Hammer,
  Monitor,
  Smartphone,
  Waves,
} from "lucide-react";

import { Chip, Panel } from "@/components/crm/Bits";
import { SiteChrome } from "@/components/site/SiteChrome";
import { dict, PATHS, type Locale } from "@/lib/i18n";

const CONCEPT_ICONS = [Waves, BedDouble, Hammer];

function BrowserMockup({
  eyebrow,
  headline,
  lines,
}: {
  eyebrow: string;
  headline: string;
  lines: string[];
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm">
      <div className="flex h-8 items-center gap-1.5 border-b border-border/70 px-3">
        <span className="size-1.5 rounded-full bg-muted-foreground/30" />
        <span className="size-1.5 rounded-full bg-muted-foreground/30" />
        <span className="size-1.5 rounded-full bg-muted-foreground/30" />

        <div className="ml-2 h-3 w-24 rounded-full bg-secondary/80" />
      </div>

      <div className="grid min-h-[210px] grid-cols-[1.25fr_.75fr] gap-4 p-5 sm:min-h-[230px]">
        <div className="flex flex-col justify-center">
          <span className="text-[9px] font-semibold uppercase tracking-[.18em] text-primary">
            {eyebrow}
          </span>

          <div className="mt-3 max-w-[190px] text-xl font-semibold leading-tight tracking-tight">
            {headline}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {lines.map((line) => (
              <span
                key={line}
                className="rounded-full border border-border/70 px-2.5 py-1 text-[9px] text-muted-foreground"
              >
                {line}
              </span>
            ))}
          </div>

          <div className="mt-5 h-7 w-24 rounded-lg bg-primary/90" />
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-2 rounded-[24px] bg-primary/10" />

          <div className="relative h-28 w-20 rounded-[18px] border border-border bg-background p-2 shadow-sm">
            <div className="h-10 rounded-xl bg-primary/15" />
            <div className="mt-2 h-1.5 w-full rounded-full bg-secondary" />
            <div className="mt-1.5 h-1.5 w-4/5 rounded-full bg-secondary" />
            <div className="mt-3 h-4 rounded-md bg-primary/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortfolioPage({ locale }: { locale: Locale }) {
  const t = dict[locale].portfolio;
  const paths = PATHS[locale];

  return (
    <SiteChrome locale={locale} page="portfolio">
      <section className="max-w-2xl">
        <Chip tone="primary">{t.chip}</Chip>

        <h1 className="orbit-gradient-text mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.h1}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t.lead}
        </p>
      </section>

      <section className="mt-10">
        <article className="orbit-panel overflow-hidden">
          <div className="grid lg:grid-cols-[1.15fr_.85fr]">
            <div className="border-b border-border/60 p-5 sm:p-7 lg:border-b-0 lg:border-r">
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-background">
                <div className="flex h-9 items-center gap-1.5 border-b border-border/70 px-3">
                  <span className="size-2 rounded-full bg-muted-foreground/30" />
                  <span className="size-2 rounded-full bg-muted-foreground/30" />
                  <span className="size-2 rounded-full bg-muted-foreground/30" />

                  <div className="mx-auto h-4 w-40 rounded-full bg-secondary/70" />
                </div>

                <div className="relative min-h-[280px] overflow-hidden bg-gradient-to-br from-primary/15 via-background to-secondary/40 p-6 sm:min-h-[340px] sm:p-8">
                  <div className="absolute right-8 top-8 size-32 rounded-full bg-primary/10 blur-3xl" />

                  <div className="relative flex h-full flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-[.2em] text-primary">
                        Sociedade Recreativa de Manique
                      </span>

                      <h2 className="mt-4 max-w-sm text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                        {t.featuredHeadline}
                      </h2>

                      <p className="mt-4 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {t.featuredText}
                      </p>
                    </div>

                    <div className="mt-8 flex items-end justify-between gap-4">
                      <div className="flex gap-2">
                        <span className="h-8 w-24 rounded-lg bg-primary" />
                        <span className="h-8 w-20 rounded-lg border border-border bg-background/70" />
                      </div>

                      <div className="hidden items-end gap-2 sm:flex">
                        <Monitor className="size-8 text-primary/60" />
                        <Smartphone className="size-5 text-muted-foreground/60" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-8">
              <div>
                <Chip tone="primary">{t.realChip}</Chip>

                <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                  Manique de Baixo
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t.featuredDesc}
                </p>
              </div>

              <div className="mt-6">
                <a
                  href="https://31janeiromanique.net"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  {t.visit}
                  <ArrowUpRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-14">
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold tracking-tight">
            {t.othersTitle}
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t.othersLead}
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {t.concepts.map((projeto, idx) => {
            const Icon = CONCEPT_ICONS[idx] ?? Waves;

            return (
              <article
                key={projeto.titulo}
                className="orbit-panel orbit-panel-hover flex flex-col overflow-hidden"
              >
                <div className="p-4 pb-0">
                  <BrowserMockup
                    eyebrow={projeto.preview.eyebrow}
                    headline={projeto.preview.headline}
                    lines={projeto.preview.lines}
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary">
                      <Icon className="size-4 text-primary" />
                    </span>

                    <span className="rounded-full border border-border/70 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[.08em] text-muted-foreground">
                      {projeto.etiqueta}
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold leading-snug">
                    {projeto.titulo}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {projeto.descricao}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Panel className="mt-14" bodyClassName="p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t.ctaTitle}</h2>

            <p className="mt-1 text-xs text-muted-foreground">{t.ctaText}</p>
          </div>

          <Link
            to={paths.contact}
            className="inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            {t.ctaButton}
          </Link>
        </div>
      </Panel>
    </SiteChrome>
  );
}
