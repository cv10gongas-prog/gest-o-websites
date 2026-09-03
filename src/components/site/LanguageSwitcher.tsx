import { Link } from "@tanstack/react-router";
import { Globe } from "lucide-react";

import {
  LOCALES,
  LOCALE_LABELS,
  LOCALE_NAMES,
  PATHS,
  type Locale,
  type PageKey,
} from "@/lib/i18n";

export const LOCALE_STORAGE_KEY = "nws-locale";

export function LanguageSwitcher({
  locale,
  page,
}: {
  locale: Locale;
  page: PageKey;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={LOCALE_NAMES[locale]}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
      >
        <Globe className="size-3.5" />
        {LOCALE_LABELS[locale]}
      </button>

      <div className="invisible absolute right-0 top-full z-40 w-36 pt-1 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <ul className="overflow-hidden rounded-xl border border-border bg-background/95 p-1 shadow-xl backdrop-blur-xl">
          {LOCALES.map((l) => (
            <li key={l}>
              <Link
                to={PATHS[l][page]}
                hrefLang={l}
                onClick={() => {
                  try {
                    localStorage.setItem(LOCALE_STORAGE_KEY, l);
                  } catch {
                    /* ignore */
                  }
                }}
                className={`block rounded-lg px-3 py-2 text-xs transition hover:bg-accent ${
                  l === locale
                    ? "bg-secondary/60 text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {LOCALE_NAMES[l]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
