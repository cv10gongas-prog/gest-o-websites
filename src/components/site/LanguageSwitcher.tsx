import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fecharAoClicarFora(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", fecharAoClicarFora);
    document.addEventListener("touchstart", fecharAoClicarFora);

    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
      document.removeEventListener("touchstart", fecharAoClicarFora);
    };
  }, []);

  function guardarIdioma(idioma: Locale) {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, idioma);
    } catch {
      // ignore
    }

    setAberto(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setAberto((valor) => !valor)}
        aria-label={`Idioma: ${LOCALE_NAMES[locale]}`}
        aria-expanded={aberto}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
      >
        <Globe className="size-3.5" />

        <span>{LOCALE_LABELS[locale]}</span>

        <ChevronDown
          className={`size-3 transition-transform ${
            aberto ? "rotate-180" : ""
          }`}
        />
      </button>

      {aberto && (
        <div className="absolute right-0 top-full z-[100] mt-1 w-40">
          <ul className="overflow-hidden rounded-xl border border-border bg-background p-1 shadow-2xl">
            {LOCALES.map((l) => (
              <li key={l}>
                <Link
                  to={PATHS[l][page]}
                  onClick={() => guardarIdioma(l)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs transition hover:bg-accent ${
                    l === locale
                      ? "bg-secondary/60 text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <span>{LOCALE_NAMES[l]}</span>

                  {l === locale && (
                    <Check className="size-3.5 text-primary" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}