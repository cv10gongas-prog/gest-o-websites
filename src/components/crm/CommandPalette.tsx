import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  ExternalLink,
  Flame,
  Globe,
  LayoutDashboard,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  UtensilsCrossed,
  Trophy,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useBusinesses, useTasks, useWebsiteRequests } from "@/lib/queries";
import { formatarMoeda, ROTULOS_ESTADO } from "@/lib/crm";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenNovoNegocio?: () => void;
  onOpenNovaTarefa?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onOpenNovoNegocio,
  onOpenNovaTarefa,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const { data: negocios = [] } = useBusinesses();
  const { data: tarefas = [] } = useTasks();
  const { data: pedidos = [] } = useWebsiteRequests();

  // Atalho de teclado global ⌘K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const navegar = (to: string, search?: Record<string, unknown>) => {
    onOpenChange(false);
    navigate({ to, search: search as never });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Pesquisar negócios, clientes, ações ou páginas... (⌘K)" />
      <CommandList className="max-h-[380px] p-2">
        <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
          Nenhum resultado encontrado.
        </CommandEmpty>

        {/* Ações Rápidas */}
        <CommandGroup heading="Ações Rápidas">
          {onOpenNovoNegocio && (
            <CommandItem
              onSelect={() => {
                onOpenChange(false);
                onOpenNovoNegocio();
              }}
              className="cursor-pointer gap-2.5 rounded-lg py-2"
            >
              <div className="grid size-6 place-items-center rounded-md bg-primary/10 text-primary">
                <Plus className="size-3.5" />
              </div>
              <span className="font-medium text-foreground">Novo Negócio / Cliente</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                Criar
              </span>
            </CommandItem>
          )}

          {onOpenNovaTarefa && (
            <CommandItem
              onSelect={() => {
                onOpenChange(false);
                onOpenNovaTarefa();
              }}
              className="cursor-pointer gap-2.5 rounded-lg py-2"
            >
              <div className="grid size-6 place-items-center rounded-md bg-warning/10 text-warning">
                <CalendarClock className="size-3.5" />
              </div>
              <span className="font-medium text-foreground">Agendar Nova Tarefa</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                Agendar
              </span>
            </CommandItem>
          )}

          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              window.open("/", "_blank");
            }}
            className="cursor-pointer gap-2.5 rounded-lg py-2"
          >
            <div className="grid size-6 place-items-center rounded-md bg-accent text-muted-foreground">
              <ExternalLink className="size-3.5" />
            </div>
            <span className="text-foreground">Abrir Website Público</span>
            <span className="ml-auto text-[10px] text-muted-foreground">novawebstudio.pt</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1.5" />

        {/* Clientes & Negócios Recentes */}
        {negocios.length > 0 && (
          <CommandGroup heading="Clientes & Negócios">
            {negocios.slice(0, 8).map((negocio) => (
              <CommandItem
                key={negocio.id}
                value={`${negocio.nome} ${negocio.categoria ?? ""} ${negocio.localidade ?? ""} ${negocio.telefone ?? ""}`}
                onSelect={() => navegar(`/negocios/${negocio.id}`)}
                className="cursor-pointer gap-2.5 rounded-lg py-2"
              >
                <div className="grid size-6 shrink-0 place-items-center rounded-md bg-surface-strong text-primary">
                  <Building2 className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-foreground text-xs">
                      {negocio.nome}
                    </span>
                    {negocio.prioridade === "alta" && (
                      <Flame className="size-3 text-danger shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{ROTULOS_ESTADO[negocio.estado as keyof typeof ROTULOS_ESTADO] ?? negocio.estado}</span>
                    {negocio.localidade && <span>• {negocio.localidade}</span>}
                  </div>
                </div>
                {negocio.valor_estimado ? (
                  <span className="text-[11px] font-medium text-foreground/80">
                    {formatarMoeda(negocio.valor_estimado)}
                  </span>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator className="my-1.5" />

        {/* Navegação Principal */}
        <CommandGroup heading="Navegação do Command Center">
          <CommandItem
            onSelect={() => navegar("/painel")}
            className="cursor-pointer gap-2.5 rounded-lg py-2"
          >
            <LayoutDashboard className="size-4 text-muted-foreground" />
            <span>Painel Principal (Visão Geral)</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navegar("/negocios")}
            className="cursor-pointer gap-2.5 rounded-lg py-2"
          >
            <BriefcaseBusiness className="size-4 text-muted-foreground" />
            <span>Negócios & Clientes</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navegar("/pipeline")}
            className="cursor-pointer gap-2.5 rounded-lg py-2"
          >
            <Flame className="size-4 text-muted-foreground" />
            <span>Pipeline Comercial</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navegar("/tarefas")}
            className="cursor-pointer gap-2.5 rounded-lg py-2"
          >
            <CalendarClock className="size-4 text-muted-foreground" />
            <span>Tarefas & Agenda</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navegar("/pedidos")}
            className="cursor-pointer gap-2.5 rounded-lg py-2"
          >
            <Globe className="size-4 text-muted-foreground" />
            <span>Pedidos do Website ({pedidos.filter((p) => !p.tratado).length} pendentes)</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navegar("/equipa")}
            className="cursor-pointer gap-2.5 rounded-lg py-2"
          >
            <Users className="size-4 text-muted-foreground" />
            <span>Equipa & Produtividade</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navegar("/seguranca")}
            className="cursor-pointer gap-2.5 rounded-lg py-2"
          >
            <ShieldAlert className="size-4 text-muted-foreground" />
            <span>Central de Segurança</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navegar("/produtos/restaurantes")}
            className="cursor-pointer gap-2.5 rounded-lg py-2"
          >
            <UtensilsCrossed className="size-4 text-muted-foreground" />
            <span>NWS Restaurantes</span>
          </CommandItem>
          <CommandItem
            onSelect={() => navegar("/produtos/match")}
            className="cursor-pointer gap-2.5 rounded-lg py-2"
          >
            <Trophy className="size-4 text-muted-foreground" />
            <span>NWS Match (Futsal Hub)</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
