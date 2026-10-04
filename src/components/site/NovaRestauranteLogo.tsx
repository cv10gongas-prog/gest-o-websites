import { UtensilsCrossed } from "lucide-react";

export function NovaRestauranteLogo({
  className = "",
  size = "md",
  showTagline = true,
  tagline = "Demonstração Oficial",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  tagline?: string;
}) {
  const iconSizes = {
    sm: "size-6",
    md: "size-7.5",
    lg: "size-9",
  };

  const iconInnerSizes = {
    sm: "size-3",
    md: "size-3.5",
    lg: "size-4.5",
  };

  const titleSizes = {
    sm: "text-[11px]",
    md: "text-xs sm:text-[13px]",
    lg: "text-sm sm:text-base",
  };

  const subSizes = {
    sm: "text-[7.5px]",
    md: "text-[8.5px]",
    lg: "text-[10px]",
  };

  return (
    <div className={`flex items-center gap-2.5 font-sans select-none ${className}`}>
      <div
        className={`grid place-items-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 text-primary shadow-sm shadow-primary/10 shrink-0 ${iconSizes[size]}`}
      >
        <UtensilsCrossed className={iconInnerSizes[size]} />
      </div>

      <div className="leading-none min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-bold tracking-wider uppercase text-foreground ${titleSizes[size]}`}
          >
            NOVA
          </span>
          <span className="rounded bg-primary/15 px-1 py-0.5 text-[7.5px] font-bold text-primary tracking-tight uppercase">
            Restaurante
          </span>
        </div>
        {showTagline && (
          <span
            className={`block font-medium tracking-[0.18em] uppercase text-muted-foreground mt-0.5 ${subSizes[size]}`}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
}
