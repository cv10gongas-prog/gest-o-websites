import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  CalendarClock,
  Globe,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTasks, useWebsiteRequests } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatarData } from "@/lib/crm";

export function NotificationCenter() {
  const [aberto, setAberto] = useState(false);
  const { data: tarefas = [] } = useTasks();
  const { data: pedidos = [] } = useWebsiteRequests();

  // Buscar tentativas de login anómalas recentes
  const { data: tentativas = [] } = useQuery({
    queryKey: ["security-recent-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_login_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) return [];
      return data ?? [];
    },
    staleTime: 30000,
  });

  const hojeStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const tarefasUrgentes = useMemo(() => {
    return tarefas.filter((t) => {
      if (t.estado === "concluida") return false;
      if (!t.data_hora) return false;
      return t.data_hora.slice(0, 10) <= hojeStr;
    });
  }, [tarefas, hojeStr]);

  const pedidosNaoTratados = useMemo(() => {
    return pedidos.filter((p) => !p.tratado);
  }, [pedidos]);

  const totalNotificacoes =
    tarefasUrgentes.length + pedidosNaoTratados.length;

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative grid size-9 place-items-center rounded-xl border border-border/70 bg-surface/50 text-muted-foreground transition hover:border-primary/40 hover:bg-surface-strong hover:text-foreground focus:outline-none"
          aria-label="Centro de Notificações"
        >
          <Bell className="size-4" />
          {totalNotificacoes > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm animate-pulse">
              {totalNotificacoes > 9 ? "9+" : totalNotificacoes}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[360px] p-0 border border-border/70 bg-popover/95 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-surface/40">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-foreground">
              Notificações do Sistema
            </span>
          </div>
          {totalNotificacoes > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {totalNotificacoes} pendente{totalNotificacoes > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40 text-xs">
          {/* Tarefas Atrasadas / Hoje */}
          {tarefasUrgentes.length > 0 && (
            <div className="p-3 bg-warning/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-warning flex items-center gap-1.5">
                  <CalendarClock className="size-3.5" />
                  Tarefas para Hoje / Atrasadas ({tarefasUrgentes.length})
                </span>
                <Link
                  to="/tarefas"
                  onClick={() => setAberto(false)}
                  className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                >
                  Ver todas <ChevronRight className="size-3" />
                </Link>
              </div>
              <div className="space-y-1.5">
                {tarefasUrgentes.slice(0, 3).map((t) => (
                  <Link
                    key={t.id}
                    to="/tarefas"
                    onClick={() => setAberto(false)}
                    className="block rounded-lg border border-border/40 bg-surface/60 p-2 text-[11px] text-foreground transition hover:border-primary/40 hover:bg-surface-strong"
                  >
                    <div className="font-medium truncate">{t.titulo}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center justify-between mt-0.5">
                      <span>Prazo: {formatarData(t.data_hora, true)}</span>
                      {t.prioridade === "alta" && (
                        <span className="text-danger font-semibold">Alta Prioridade</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Pedidos do Website */}
          {pedidosNaoTratados.length > 0 && (
            <div className="p-3 bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Globe className="size-3.5" />
                  Novos Contactos do Site ({pedidosNaoTratados.length})
                </span>
                <Link
                  to="/pedidos"
                  onClick={() => setAberto(false)}
                  className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                >
                  Ver todos <ChevronRight className="size-3" />
                </Link>
              </div>
              <div className="space-y-1.5">
                {pedidosNaoTratados.slice(0, 2).map((p) => (
                  <Link
                    key={p.id}
                    to="/pedidos"
                    onClick={() => setAberto(false)}
                    className="block rounded-lg border border-border/40 bg-surface/60 p-2 text-[11px] text-foreground transition hover:border-primary/40 hover:bg-surface-strong"
                  >
                    <div className="font-medium truncate">{p.nome} ({p.empresa || "Particular"})</div>
                    <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {p.mensagem || "Sem mensagem"}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Alertas de Segurança */}
          {tentativas.length > 0 && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5 text-danger/80" />
                  Tentativas de Acesso Recentes
                </span>
                <Link
                  to="/seguranca"
                  onClick={() => setAberto(false)}
                  className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                >
                  Segurança <ChevronRight className="size-3" />
                </Link>
              </div>
              <div className="text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center justify-between rounded-lg bg-surface/40 px-2.5 py-1.5 border border-border/30">
                  <span className="truncate">Última tentativa ({tentativas[0].ip ?? "IP oculto"})</span>
                  <span className="text-[10px] text-danger font-medium">Rejeitada</span>
                </div>
              </div>
            </div>
          )}

          {totalNotificacoes === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <CheckCircle2 className="size-8 mx-auto mb-2 text-success/60" />
              <p className="text-xs font-medium text-foreground">Tudo em dia!</p>
              <p className="text-[11px] mt-0.5">Não há tarefas atrasadas nem pedidos pendentes.</p>
            </div>
          )}
        </div>

        <div className="border-t border-border/60 bg-surface/40 p-2 text-center">
          <Link
            to="/painel"
            onClick={() => setAberto(false)}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Ir para o Command Center Geral
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
