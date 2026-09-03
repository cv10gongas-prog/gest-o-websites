function PremiumSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected =
    options.find((option) => option.value === value) ??
    options[0];

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`group flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl border px-4 text-left text-[13px] transition-all duration-200 ${
          open
            ? "border-primary/50 bg-background/90 shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
            : "border-border/70 bg-background/55 hover:border-primary/25 hover:bg-background/75"
        }`}
      >
        <span className="truncate text-foreground">
          {selected?.label}
        </span>

        <span
          className={`grid size-7 shrink-0 place-items-center rounded-lg bg-secondary/70 text-muted-foreground transition-all duration-200 group-hover:text-primary ${
            open
              ? "rotate-180 bg-primary/10 text-primary"
              : ""
          }`}
        >
          <ChevronDown className="size-3.5" />
        </span>
      </button>

      <div
        className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 origin-top transition-all duration-200 ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-2 scale-[0.98] opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-[#07101c]/98 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="max-h-72 overflow-y-auto">
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left text-xs transition-all duration-150 ${
                    active
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`size-1.5 rounded-full transition ${
                        active
                          ? "bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.7)]"
                          : "bg-muted-foreground/30 group-hover:bg-primary/50"
                      }`}
                    />

                    {option.label}
                  </span>

                  {active && (
                    <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
