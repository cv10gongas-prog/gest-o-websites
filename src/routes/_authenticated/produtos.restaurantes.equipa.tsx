import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ChefHat, Shield, Trash2, UserCheck, UserPlus, Users, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Field,
  PanelHeader,
  RestaurantCard,
  fieldClass,
} from "@/components/restaurant/RestaurantBits";
import {
  convidarFuncionarioRestaurante,
  listarMembrosRestaurante,
  revogarFuncionarioRestaurante,
  type RestaurantStaffRole,
} from "@/lib/restaurant/auth.functions";
import { useRestaurantTenant } from "@/lib/restaurant/tenant";
import { isDemoMode, demoStore } from "@/lib/demo-mode";

export const Route = createFileRoute("/_authenticated/produtos/restaurantes/equipa")({
  component: RestaurantStaffAdmin,
});

const roleLabels: Record<
  RestaurantStaffRole,
  { label: string; desc: string; tone: string; icon: typeof ChefHat }
> = {
  proprietario: {
    label: "Proprietário",
    desc: "Acesso total à ementa, preços, horários, reservas, relatórios e gestão de equipa.",
    tone: "bg-primary/15 text-primary border-primary/30",
    icon: Shield,
  },
  gerente: {
    label: "Gerente / Chefe de Sala",
    desc: "Gestão de ementa, mesas, pedidos, reservas e resolução de alertas.",
    tone: "bg-info/15 text-info border-info/30",
    icon: UserCheck,
  },
  sala: {
    label: "Empregado de Sala",
    desc: "Gestão do estado das mesas, atendimento de chamadas, pedidos de conta e entrega.",
    tone: "bg-warning/15 text-warning border-warning/30",
    icon: UtensilsCrossed,
  },
  cozinha: {
    label: "Equipa de Cozinha",
    desc: "Visualização do quadro de pedidos e avanço de estados (Recebido -> Preparação -> Pronto).",
    tone: "bg-success/15 text-success border-success/30",
    icon: ChefHat,
  },
};

function RestaurantStaffAdmin() {
  const {
    activeRestaurantId,
    activeRestaurant,
    canManageStaff,
    currentRole,
    setCurrentRoleSimulated,
  } = useRestaurantTenant();
  const qc = useQueryClient();
  const [modalConvidar, setModalConvidar] = useState(false);
  const [saving, setSaving] = useState(false);

  // Consulta da equipa do restaurante ativo
  const { data: membros = [], isLoading } = useQuery({
    queryKey: ["restaurant_members", activeRestaurantId],
    queryFn: async () => {
      if (isDemoMode()) {
        return demoStore.staff;
      }
      return listarMembrosRestaurante({ data: { restaurantId: activeRestaurantId } });
    },
    enabled: !!activeRestaurantId,
  });

  async function submitInvite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const role = String(f.get("role")) as RestaurantStaffRole;

    if (!email) {
      toast.error("Indique um endereço de email válido.");
      return;
    }

    setSaving(true);
    try {
      if (isDemoMode()) {
        demoStore.inviteStaff({ email, role });
        toast.success(
          `[Modo Demo] Acesso atribuído a ${email} com a função "${roleLabels[role].label}".`,
        );
      } else {
        await convidarFuncionarioRestaurante({
          data: {
            restaurantId: activeRestaurantId,
            email,
            role,
          },
        });
        toast.success(`Acesso atribuído a ${email} com a função "${roleLabels[role].label}".`);
      }
      qc.invalidateQueries({ queryKey: ["restaurant_members", activeRestaurantId] });
      setModalConvidar(false);
    } catch (err) {
      toast.error(`Erro ao atribuir acesso: ${(err as Error).message}`);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* CABEÇALHO */}
      <PanelHeader
        title="Equipa & Acessos do Restaurante"
        subtitle={`Gestão de funcionários e permissões para ${activeRestaurant?.nome || activeRestaurantId}. Os membros acedem exclusivamente a este restaurante.`}
        action={
          canManageStaff && (
            <button
              type="button"
              onClick={() => setModalConvidar(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
            >
              <UserPlus className="size-4" />
              <span>Adicionar Funcionário</span>
            </button>
          )
        }
      />

      {/* SIMULADOR DE PERFIS PARA TESTES NO WORKSPACE (APENAS EM MODO DEMO ISOLADO) */}
      {isDemoMode() && setCurrentRoleSimulated && (
        <div className="rounded-2xl border border-warning/30 bg-surface/50 p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div>
            <span className="text-xs font-bold text-warning flex items-center gap-1.5">
              <Shield className="size-4 text-warning" />
              Simulador de Funções no Workspace (Ambiente DEMO):
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Função atualmente simulada nesta sessão:{" "}
              <strong className="text-foreground capitalize">{currentRole}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(["administrador", "proprietario", "gerente", "sala", "cozinha"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setCurrentRoleSimulated(r);
                  toast.success(`Perfil do restaurante alterado para: ${r.toUpperCase()}`);
                }}
                className={`rounded-xl px-2.5 py-1 text-xs font-bold capitalize transition ${
                  currentRole === r
                    ? "bg-warning text-black shadow-sm"
                    : "border border-border/80 bg-surface-strong text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QUADRO DE NÍVEIS DE ACESSO */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {(
          Object.entries(roleLabels) as [
            RestaurantStaffRole,
            (typeof roleLabels)[RestaurantStaffRole],
          ][]
        ).map(([key, info]) => {
          const Icon = info.icon;
          return (
            <div
              key={key}
              className="rounded-2xl border border-border/70 bg-surface/50 p-4 backdrop-blur-md space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-surface-strong text-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="text-xs font-bold text-foreground">{info.label}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{info.desc}</p>
            </div>
          );
        })}
      </div>

      {/* LISTA DE FUNCIONÁRIOS */}
      <RestaurantCard className="divide-y divide-border/40 overflow-hidden">
        <div className="p-4 bg-surface-strong/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Membros Ativos
            </h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {membros.length} {membros.length === 1 ? "membro" : "membros"}
          </span>
        </div>

        {isLoading ? (
          <p className="p-8 text-center text-xs text-muted-foreground animate-pulse">
            A carregar equipa do estabelecimento...
          </p>
        ) : membros.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground space-y-1">
            <Users className="size-8 mx-auto opacity-40 mb-1" />
            <p className="text-xs font-semibold text-foreground">
              Ainda não existem funcionários associados a este restaurante.
            </p>
            <p className="text-[11px]">
              Os administradores NWS têm acesso automático; adicione cozinheiros, gerentes ou
              empregados de sala acima.
            </p>
          </div>
        ) : (
          membros.map((m) => {
            const rInfo = roleLabels[m.role as RestaurantStaffRole] ?? roleLabels.sala;
            const Icon = rInfo.icon;
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-4 p-4 transition hover:bg-surface-strong/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid size-10 place-items-center rounded-xl bg-surface-strong border border-border/70 text-foreground font-bold shrink-0">
                    <Icon className="size-4 text-primary" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-foreground truncate">
                      {m.profiles?.nome || m.profiles?.email || "Funcionário"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {m.profiles?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase border ${rInfo.tone}`}
                  >
                    {rInfo.label}
                  </span>

                  {canManageStaff && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Revogar acesso a ${m.profiles?.email || "este membro"}?`)) {
                          if (isDemoMode()) {
                            demoStore.revokeStaff(m.id);
                            toast.success("[Modo Demo] Acesso revogado.");
                          } else {
                            await revogarFuncionarioRestaurante({
                              data: { restaurantId: activeRestaurantId, memberId: m.id },
                            });
                            toast.success("Acesso revogado.");
                          }
                          qc.invalidateQueries({
                            queryKey: ["restaurant_members", activeRestaurantId],
                          });
                        }
                      }}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger transition"
                      title="Revogar Acesso"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </RestaurantCard>

      {/* MODAL DE CONVITE */}
      <Dialog open={modalConvidar} onOpenChange={setModalConvidar}>
        <DialogContent className="max-w-md bg-surface border-border/80 text-foreground">
          <DialogHeader>
            <DialogTitle>Adicionar Funcionário ao Restaurante</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitInvite} className="space-y-4 pt-2">
            <Field
              label="Email do Funcionário"
              hint="O utilizador utilizará este email para iniciar sessão na plataforma."
            >
              <input
                name="email"
                type="email"
                required
                placeholder="colaborador@restaurante.pt"
                className={fieldClass}
              />
            </Field>

            <Field label="Função & Nível de Permissões">
              <select name="role" defaultValue="sala" className={fieldClass}>
                <option value="sala" className="bg-surface">
                  Empregado de Sala (Mesas, Pedidos, Chamadas)
                </option>
                <option value="cozinha" className="bg-surface">
                  Equipa de Cozinha (Quadro de Pedidos)
                </option>
                <option value="gerente" className="bg-surface">
                  Gerente (Ementa, Preços, Reservas, Mesas)
                </option>
                <option value="proprietario" className="bg-surface">
                  Proprietário (Acesso Total ao Restaurante)
                </option>
              </select>
            </Field>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
              <button
                type="button"
                onClick={() => setModalConvidar(false)}
                className="rounded-xl border border-border/80 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-surface-strong hover:text-foreground transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "A processar..." : "Atribuir Acesso"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
