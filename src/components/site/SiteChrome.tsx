import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { CookieConsent } from "@/components/site/CookieConsent";
import {
  LanguageSwitcher,
  LOCALE_STORAGE_KEY,
} from "@/components/site/LanguageSwitcher";
import {
  detectBrowserLocale,
  dict,
  HTML_LANG,
  LOCALES,
  PATHS,
  type Locale,
  type PageKey,
} from "@/lib/i18n";

export function SiteChrome({
  children,
  locale = "pt",
  page = "home",
}: {
  children: ReactNode;
  locale?: Locale;
  page?: PageKey;
}) {
  const t = dict[locale];
  const paths = PATHS[locale];
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  useEffect(() => {
    let guardado: string | null = null;

    try {
      guardado = localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      guardado = null;
    }

    if (locale !== "pt" || guardado) {
      if (guardado !== locale && locale !== "pt") {
        try {
          localStorage.setItem(LOCALE_STORAGE_KEY, locale);
        } catch {
          // ignore
        }
      }

      return;
    }

    const detetado = detectBrowserLocale();

    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, detetado);
    } catch {
      // ignore
    }

    if (
      detetado !== "pt" &&
      (LOCALES as readonly string[]).includes(detetado)
    ) {
      navigate({
        to: PATHS[detetado][page],
        replace: true,
      });
    }
  }, [locale, page, navigate]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="orbit-glow pointer-events-none fixed inset-0" />

      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-5">
          <Link
            to={paths.home}
            className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
          >
            <img
              src="/logo.png"
              alt="Nova Web Studio"
              className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
            />

            <span className="min-w-0">
              <span className="block truncate whitespace-nowrap text-[14px] font-semibold tracking-tight sm:text-[15px]">
                Nova Web Studio
              </span>

              <span className="hidden whitespace-nowrap text-[10px] uppercase tracking-[.18em] text-muted-foreground sm:block">
                {t.nav.tagline}
              </span>
            </span>
          </Link>

          <nav className="flex shrink-0 items-center gap-1 text-sm">
            <span className="hidden items-center gap-1 sm:flex">
              <Link
                to={paths.home}
                activeOptions={{ exact: true }}
                activeProps={{
                  className: "bg-secondary/60 text-foreground",
                }}
                inactiveProps={{
                  className: "text-muted-foreground",
                }}
                className="rounded-lg px-3 py-2 transition hover:text-foreground"
              >
                {t.nav.home}
              </Link>

              <Link
                to={paths.portfolio}
                activeProps={{
                  className: "bg-secondary/60 text-foreground",
                }}
                inactiveProps={{
                  className: "text-muted-foreground",
                }}
                className="rounded-lg px-3 py-2 transition hover:text-foreground"
              >
                {t.nav.portfolio}
              </Link>

              <Link
                to={paths.contact}
                activeProps={{
                  className: "bg-secondary/60 text-foreground",
                }}
                inactiveProps={{
                  className: "text-muted-foreground",
                }}
                className="rounded-lg px-3 py-2 transition hover:text-foreground"
              >
                {t.nav.contact}
              </Link>
            </span>

            <div className="hidden sm:block">
              <LanguageSwitcher locale={locale} page={page} />
            </div>

            <Link
              to={paths.contact}
              className="ml-0 inline-flex h-9 items-center whitespace-nowrap rounded-xl bg-primary px-3 text-xs font-medium text-primary-foreground transition hover:opacity-90 sm:ml-1 sm:px-4 sm:text-sm"
            >
              {t.nav.cta}
            </Link>
          </nav>
        </div>

        <div className="flex items-center justify-end border-t border-border/40 px-4 py-2 sm:hidden">
          <LanguageSwitcher locale={locale} page={page} />
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-5 py-12 sm:py-16">
        {children}
      </main>

      <footer className="relative border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Nova Web Studio · {t.footer.rights}
          </span>

          <div className="flex gap-4">
            <Link to={paths.portfolio}>{t.nav.portfolio}</Link>
            <Link to={paths.contact}>{t.nav.contact}</Link>
            <Link to="/auth">{t.nav.team}</Link>
          </div>
        </div>
      </footer>

      <CookieConsent />
    </div>
  );
}