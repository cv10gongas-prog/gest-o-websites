import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  Receipt,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import type { OrderStatus, ReservationStatus } from "@/lib/restaurant/demo-data";
import type { TableState } from "@/lib/restaurant/store";
import { cn } from "@/lib/utils";
import { PUBLIC_RESTAURANT_URL } from "@/lib/restaurant/config";

const orderTone: Record<OrderStatus, string> = {
  recebido:
    "bg-warning/15 text-warning border-warning/30 ring-1 ring-warning/30",
  preparacao:
    "bg-primary/15 text-primary border-primary/30 ring-1 ring-primary/30",
  pronto:
    "bg-success/15 text-success border-success/30 ring-1 ring-success/30",
  entregue: "bg-surface-strong text-muted-foreground border-border/60",
};

const orderText: Record<OrderStatus, string> = {
  recebido: "Novo Pedido",
  preparacao: "Em preparação",
  pronto: "Pronto p/ Entrega",
  entregue: "Entregue",
};

export function OrderBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase border shadow-sm",
        orderTone[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current animate-pulse" />
      {orderText[status]}
    </span>
  );
}

const tableTone: Record<TableState, { bg: string; text: string; border: string }> = {
  livre: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  reservada: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  ocupada: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  assistencia: {
    bg: "bg-rose-500/15",
    text: "text-rose-400",
    border: "border-rose-500/40",
  },
  conta: {
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    border: "border-purple-500/40",
  },
  inativa: {
    bg: "bg-surface-strong",
    text: "text-muted-foreground",
    border: "border-border/60",
  },
};

export function TableBadge({
  state,
  label,
}: {
  state: TableState;
  label: string;
}) {
  const tone = tableTone[state] ?? tableTone.livre;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
        tone.bg,
        tone.text,
        tone.border,
      )}
    >
      {label}
    </span>
  );
}

const resvTone: Record<ReservationStatus, string> = {
  pendente: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  confirmada: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  chegou: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  concluida: "bg-surface-strong text-muted-foreground border-border/50",
  cancelada: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export function ReservationBadge({
  status,
  label,
}: {
  status: ReservationStatus;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
        resvTone[status] ?? resvTone.pendente,
      )}
    >
      {label}
    </span>
  );
}

export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/40">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "primary",
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: typeof UtensilsCrossed;
  tone?: "primary" | "warning" | "success" | "danger" | "info" | "neutral";
  trend?: string;
}) {
  const tones = {
    primary: "border-primary/30 text-primary bg-primary/10",
    warning: "border-warning/30 text-warning bg-warning/10",
    success: "border-success/30 text-success bg-success/10",
    danger: "border-danger/30 text-danger bg-danger/10",
    info: "border-info/30 text-info bg-info/10",
    neutral: "border-border/70 text-muted-foreground bg-surface-strong",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-surface/50 p-5 backdrop-blur-md transition hover:border-border hover:bg-surface/70 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold font-mono text-foreground tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-[11px] text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className="mt-1 text-[10px] font-semibold text-primary">{trend}</p>
          )}
        </div>
        {Icon && (
          <span
            className={cn(
              "grid size-11 place-items-center rounded-2xl border shadow-inner shrink-0",
              tones[tone],
            )}
          >
            <Icon className="size-5" />
          </span>
        )}
      </div>
    </div>
  );
}

export function RestaurantCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-surface/50 backdrop-blur-md shadow-sm transition",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function RestaurantPublicBanner({
  name,
  restaurantId,
}: {
  name: string;
  restaurantId: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-warning/30 bg-gradient-to-r from-warning/10 via-surface/60 to-surface/80 p-4 text-xs backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-warning/20 text-warning border border-warning/30 shrink-0">
          <Globe className="size-4" />
        </span>
        <div>
          <p className="font-bold text-foreground flex items-center gap-1.5">
            <span>Subdomínio Público do Restaurante</span>
            <span className="rounded bg-warning/20 px-1.5 py-0.2 text-[9px] font-bold text-warning uppercase">
              Ativo
            </span>
          </p>
          <p className="text-muted-foreground mt-0.5">
            Os telemóveis dos clientes e QR Codes físicos acedem em tempo real a{" "}
            <strong className="text-foreground">{PUBLIC_RESTAURANT_URL}</strong>
          </p>
        </div>
      </div>

      <a
        href={PUBLIC_RESTAURANT_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-xl border border-warning/40 bg-warning/15 px-3.5 py-1.5 text-xs font-bold text-warning transition hover:bg-warning/25 shrink-0"
      >
        <span>Abrir Menu Público</span>
        <ExternalLink className="size-3.5" />
      </a>
    </div>
  );
}

export const timeAgo = (t: number) => {
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  return m < 1
    ? "agora mesmo"
    : m < 60
      ? `há ${m} min`
      : m < 1440
        ? `há ${Math.floor(m / 60)} h`
        : `há ${Math.floor(m / 1440)} dias`;
};

export function orderTimeInfo(createdAt: number) {
  const diffMinutes = Math.max(0, Math.round((Date.now() - createdAt) / 60000));
  const isDelayed = diffMinutes >= 35;
  const isCritical = diffMinutes >= 55;
  let text = "agora mesmo";
  if (diffMinutes >= 1 && diffMinutes < 60) {
    text = `há ${diffMinutes} min`;
  } else if (diffMinutes >= 60 && diffMinutes < 1440) {
    text = `há ${Math.floor(diffMinutes / 60)} h`;
  } else if (diffMinutes >= 1440) {
    text = `há ${Math.floor(diffMinutes / 1440)} dias`;
  }
  return { text, diffMinutes, isDelayed, isCritical };
}

export const formatDate = (iso: string) =>
  new Date(iso + "T12:00").toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export const fieldClass =
  "h-10 w-full rounded-xl border border-border/80 bg-surface/70 px-3.5 text-xs text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary/70 focus:outline-none focus:ring-1 focus:ring-primary/40";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1.5 block font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10px] text-muted-foreground">{hint}</span>}
    </label>
  );
}
