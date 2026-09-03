import { useEffect, useState } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_KEY = "analytics-consent";

export function CookieConsent() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const consentimento = localStorage.getItem(CONSENT_KEY);

    if (!consentimento) {
      setVisivel(true);
      return;
    }

    if (consentimento === "granted") {
      window.gtag?.("consent", "update", {
        analytics_storage: "granted",
      });
    }

    if (consentimento === "denied") {
      window.gtag?.("consent", "update", {
        analytics_storage: "denied",
      });
    }
  }, []);

  function aceitar() {
    localStorage.setItem(CONSENT_KEY, "granted");

    window.gtag?.("consent", "update", {
      analytics_storage: "granted",
    });

    setVisivel(false);

    setTimeout(() => {
      window.gtag?.("event", "page_view", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }, 100);
  }

  function recusar() {
    localStorage.setItem(CONSENT_KEY, "denied");

    window.gtag?.("consent", "update", {
      analytics_storage: "denied",
    });

    setVisivel(false);
  }

  if (!visivel) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-xl rounded-2xl border border-border bg-background/95 p-5 shadow-2xl backdrop-blur-xl">
      <p className="text-sm font-semibold">
        Cookies e estatísticas
      </p>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Utilizamos o Google Analytics para perceber como o website é utilizado
        e melhorar a experiência. Pode aceitar ou recusar esta recolha.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={aceitar}
          className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-medium text-primary-foreground transition hover:opacity-90"
        >
          Aceitar
        </button>

        <button
          type="button"
          onClick={recusar}
          className="inline-flex h-9 items-center rounded-xl border border-border px-4 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          Recusar
        </button>
      </div>
    </div>
  );
}
