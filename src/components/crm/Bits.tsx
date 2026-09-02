import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { iniciais, toneChip, toneDot, type Tone } from "@/lib/crm";

export function Chip({
  tone = "muted",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("orbit-chip", toneChip[tone], className)}>{children}</span>;
}

export function Dot({ tone = "muted" }: { tone?: Tone }) {
  return <span className={cn("size-1.5 shrink-0 rounded-full", toneDot[tone])} />;
}

export function Metric({
  icon: Icon,
  label,
  value,
  detail,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
  tone?: Tone;
}) {
  return (
    <div className="orbit-panel orbit-panel-hover p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("grid size-8 place-items-center rounded-lg", toneChip[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {detail && <div className="mt-1 text-[11px] text-muted-foreground">{detail}</div>}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("orbit-panel overflow-hidden", className)}>
      {(title || actions) && (
        <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName ?? "p-4 sm:p-5"}>{children}</div>
    </section>
  );
}

export function Avatar({
  nome,
  url,
  size = "size-7",
}: {
  nome?: string | null;
  url?: string | null;
  size?: string;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={nome ?? "Utilizador"}
        className={cn(size, "shrink-0 rounded-lg object-cover")}
      />
    );
  }
  return (
    <span
      className={cn(
        size,
        "grid shrink-0 place-items-center rounded-lg bg-secondary text-[10px] font-semibold text-secondary-foreground",
      )}
    >
      {iniciais(nome)}
    </span>
  );
}

export function Vazio({ texto, icon: Icon }: { texto: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
      {Icon && <Icon className="size-6 opacity-60" />}
      {texto}
    </div>
  );
}

export function Campo({
  label,
  children,
  className,
  ajuda,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  ajuda?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs text-muted-foreground">{label}</span>
      {children}
      {ajuda && <span className="mt-1 block text-[11px] text-muted-foreground/80">{ajuda}</span>}
    </label>
  );
}
