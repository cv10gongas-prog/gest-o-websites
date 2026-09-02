import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

export function Modal({
  aberto,
  onFechar,
  titulo,
  descricao,
  children,
  rodape,
  largura = "max-w-lg",
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  descricao?: string;
  children: ReactNode;
  rodape?: ReactNode;
  largura?: string;
}) {
  useEffect(() => {
    if (!aberto) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "my-auto w-full rounded-2xl border border-border bg-popover p-5 shadow-2xl",
          largura,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">{titulo}</h2>
            {descricao && <p className="mt-1 text-xs text-muted-foreground">{descricao}</p>}
          </div>
          <button onClick={onFechar} aria-label="Fechar">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
        {rodape && <div className="mt-5 flex flex-wrap justify-end gap-2">{rodape}</div>}
      </div>
    </div>
  );
}

export const inputClass =
  "h-10 w-full rounded-lg border border-input bg-secondary/40 px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20";

export const textareaClass =
  "min-h-[90px] w-full rounded-lg border border-input bg-secondary/40 p-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20";

export const selectClass = inputClass;

export const btnPrimario =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50";

export const btnSecundario =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground";

export const btnPequeno =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border px-2.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground";
