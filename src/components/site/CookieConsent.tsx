import { useEffect, useState } from "react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function CookieConsent() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const consentimento = localStorage.getItem("analytics-consent");

    if (!consentimento) {
      setVisivel(true);
      return;
    }

    if (consentimento === "granted") {
      window.gtag?.("consent", "update", {
        analytics_storage: "granted",
      });
    }
  }, []);

  function aceitar() {
    localStorage.setItem("analytics-consent", "granted");

    window.gtag?.("consent", "update", {
      analytics_storage: "granted",
    });

    setVisivel(false);
  }

  function recusar() {
    localStorage.setItem("analytics-consent", "denied");

    window.gtag?.("consent", "update", {
      analytics_storage: "denied",
    });

    setVisivel(false);
  }

  if (!visivel) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur">
      <p className="text-sm font-medium">Cookies e estatísticas</p>

      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Utilizamos o Google Analytics para perceber como o website é utilizado
        e melhorar a experiência. Pode aceitar ou recusar esta recolha.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={aceitar}
          className="rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90"
        >
          Aceitar
        </button>

        <button
          onClick={recusar}
          className="rounded-xl border border-border px-4 py-2 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          Recusar
        </button>
      </div>
    </div>
  );
}
