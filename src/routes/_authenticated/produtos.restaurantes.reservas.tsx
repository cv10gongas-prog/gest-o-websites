import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Table2,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Field,
  PanelHeader,
  ReservationBadge,
  RestaurantCard,
  fieldClass,
  formatDate,
} from "@/components/restaurant/RestaurantBits";
import {
  reservationTimes,
  todayISO,
  type Reservation,
  type ReservationStatus,
} from "@/lib/restaurant/demo-data";
import { reservationStatusLabel, useAdmin, useRestaurantActions } from "@/lib/restaurant/store";

export const Route = createFileRoute("/_authenticated/produtos/restaurantes/reservas")({
  component: RestaurantReservationsAdmin,
});

function RestaurantReservationsAdmin() {
  const {
    data: { reservations, tables },
    restaurantId,
  } = useAdmin();
  const actions = useRestaurantActions(restaurantId);

  const [editing, setEditing] = useState<Partial<Reservation> | null>(null);
  const [showPast, setShowPast] = useState(false);

  const list = reservations
    .filter((r) => showPast || (r.date >= todayISO() && r.status !== "cancelada"))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const uniqueDates = [...new Set(list.map((r) => r.date))];

  async function submitReservation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const tableNumber = Number(f.get("table")) || undefined;
    const payload = {
      name: String(f.get("name")).trim().slice(0, 100),
      phone: String(f.get("phone")).trim().slice(0, 30),
      email: String(f.get("email") || "")
        .trim()
        .slice(0, 200),
      date: String(f.get("date")),
      time: String(f.get("time")),
      guests: Number(f.get("guests")) || 2,
      tableNumber,
      notes: String(f.get("notes") || "")
        .trim()
        .slice(0, 500),
    };

    try {
      if (editing?.id) {
        await actions.updateReservation(editing.id, payload, restaurantId);
        toast.success("Reserva atualizada com sucesso.");
      } else {
        await actions.addReservation({
          ...payload,
          origin: "telefone",
        }, restaurantId);
        toast.success("Reserva telefónica registada com sucesso.");
      }
      setEditing(null);
    } catch (err) {
      toast.error(`Erro ao guardar reserva: ${(err as Error).message}`);
    }
  }

  const setStatus = async (id: string, s: ReservationStatus) => {
    try {
      await actions.setReservationStatus(id, s, restaurantId);
      toast.success(`Reserva marcada como ${reservationStatusLabel[s]}.`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* CABEÇALHO */}
      <PanelHeader
        title="Gestão de Reservas"
        subtitle="Controle unificado de reservas feitas online pelos clientes e reservas recebidas por telefone."
        action={
          <button
            type="button"
            onClick={() => setEditing({ date: todayISO(), time: "20:00", guests: 2 })}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
          >
            <Plus className="size-4" />
            <span>Nova Reserva (Telefone)</span>
          </button>
        }
      />

      {/* FILTRO PASSADAS */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
            className="rounded border-border/80 bg-surface accent-primary"
          />
          <span>Mostrar reservas passadas e canceladas</span>
        </label>

        <span className="text-xs text-muted-foreground">
          {list.length} {list.length === 1 ? "reserva listada" : "reservas listadas"}
        </span>
      </div>

      {uniqueDates.length === 0 && (
        <RestaurantCard className="p-12 text-center text-muted-foreground">
          <CalendarDays className="size-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold text-foreground">Sem reservas agendadas.</p>
          <p className="text-xs mt-1">
            As reservas online efetuadas no website e as reservas manuais surgirão aqui.
          </p>
        </RestaurantCard>
      )}

      {/* LISTAGEM AGRUPADA POR DATA */}
      {uniqueDates.map((d) => (
        <section key={d} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <CalendarDays className="size-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground capitalize tracking-tight">
              {d === todayISO() ? "Hoje" : formatDate(d)}
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              ({list.filter((r) => r.date === d).length})
            </span>
          </div>

          <RestaurantCard className="divide-y divide-border/40 overflow-hidden">
            {list
              .filter((r) => r.date === d)
              .map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition hover:bg-surface-strong/40"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <span className="w-16 shrink-0 font-mono text-base font-extrabold text-foreground rounded-xl bg-surface-strong/70 border border-border/70 p-2 text-center">
                      {r.time}
                    </span>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-foreground truncate">{r.name}</p>
                        <ReservationBadge
                          status={r.status}
                          label={reservationStatusLabel[r.status]}
                        />
                        <span className="rounded bg-surface-strong px-2 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">
                          {r.origin === "online" ? "Online" : "Telefone"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 text-foreground font-semibold">
                          <Users className="size-3.5 text-primary" />
                          {r.guests} pessoas
                        </span>

                        {r.tableNumber && (
                          <span className="flex items-center gap-1 font-semibold text-foreground">
                            <Table2 className="size-3.5 text-info" />
                            Mesa {r.tableNumber}
                          </span>
                        )}

                        {r.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="size-3 text-muted-foreground" />
                            {r.phone}
                          </span>
                        )}

                        {r.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="size-3 text-muted-foreground" />
                            {r.email}
                          </span>
                        )}
                      </div>

                      {r.notes && (
                        <p className="text-xs italic text-warning bg-warning/10 px-2 py-1 rounded-lg inline-block">
                          Nota: {r.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ações de Estado */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {r.status === "pendente" && (
                      <button
                        type="button"
                        onClick={() => setStatus(r.id, "confirmada")}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500 hover:text-white transition"
                      >
                        <Check className="size-3.5" />
                        <span>Confirmar</span>
                      </button>
                    )}

                    {(r.status === "confirmada" || r.status === "pendente") && (
                      <button
                        type="button"
                        onClick={() => setStatus(r.id, "chegou")}
                        className="inline-flex items-center gap-1 rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-500 hover:text-white transition"
                      >
                        <UserCheck className="size-3.5" />
                        <span>Chegou</span>
                      </button>
                    )}

                    {r.status === "chegou" && (
                      <button
                        type="button"
                        onClick={() => setStatus(r.id, "concluida")}
                        className="inline-flex items-center gap-1 rounded-xl bg-surface-strong border border-border px-2.5 py-1 text-xs font-bold text-foreground hover:bg-surface transition"
                      >
                        <CheckCircle2 className="size-3.5 text-success" />
                        <span>Concluir</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setEditing(r)}
                      className="rounded-xl border border-border/70 bg-surface-strong p-2 text-muted-foreground hover:text-foreground transition"
                      title="Editar Reserva"
                    >
                      <Pencil className="size-3.5" />
                    </button>

                    {r.status !== "cancelada" && r.status !== "concluida" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Cancelar a reserva de ${r.name}?`)) {
                            setStatus(r.id, "cancelada");
                          }
                        }}
                        className="rounded-xl border border-border/70 bg-surface-strong p-2 text-muted-foreground hover:bg-danger/10 hover:text-danger transition"
                        title="Cancelar Reserva"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Eliminar permanentemente a reserva de ${r.name}?`)) {
                          try {
                            await actions.removeReservation(r.id, restaurantId);
                            toast.success("Reserva eliminada com sucesso.");
                          } catch (e) {
                            toast.error(`Erro ao eliminar reserva: ${(e as Error).message}`);
                          }
                        }
                      }}
                      className="rounded-xl border border-border/70 bg-surface-strong p-2 text-muted-foreground hover:bg-danger/10 hover:text-danger transition"
                      title="Eliminar Reserva"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </RestaurantCard>
        </section>
      ))}

      {/* MODAL DE RESERVA */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-surface border-border/80 text-foreground">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Editar Reserva" : "Nova Reserva (Telefone / Manual)"}
            </DialogTitle>
          </DialogHeader>

          {editing && (
            <form onSubmit={submitReservation} className="space-y-4 pt-2">
              <Field label="Nome do Cliente">
                <input
                  name="name"
                  required
                  maxLength={100}
                  defaultValue={editing.name}
                  placeholder="Ex.: João Silva"
                  className={fieldClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Contacto Telefónico">
                  <input
                    name="phone"
                    type="tel"
                    required
                    maxLength={30}
                    defaultValue={editing.phone}
                    placeholder="912 345 678"
                    className={fieldClass}
                  />
                </Field>

                <Field label="Email (opcional)">
                  <input
                    name="email"
                    type="email"
                    maxLength={200}
                    defaultValue={editing.email}
                    placeholder="cliente@exemplo.pt"
                    className={fieldClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Data da Reserva">
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={editing.date ?? todayISO()}
                    className={fieldClass}
                  />
                </Field>

                <Field label="Hora">
                  <select
                    name="time"
                    required
                    defaultValue={editing.time ?? "20:00"}
                    className={fieldClass}
                  >
                    {[...new Set([...reservationTimes, ...(editing.time ? [editing.time] : [])])]
                      .sort()
                      .map((t) => (
                        <option key={t} value={t} className="bg-surface">
                          {t}
                        </option>
                      ))}
                  </select>
                </Field>

                <Field label="Nº de Pessoas">
                  <input
                    name="guests"
                    type="number"
                    min={1}
                    max={40}
                    required
                    defaultValue={editing.guests ?? 2}
                    className={fieldClass}
                  />
                </Field>
              </div>

              <Field label="Atribuição de Mesa (opcional)">
                <select
                  name="table"
                  defaultValue={editing.tableNumber ?? ""}
                  className={fieldClass}
                >
                  <option value="" className="bg-surface">
                    — Sem mesa atribuída —
                  </option>
                  {tables
                    .filter((t) => t.active)
                    .map((t) => (
                      <option key={t.id} value={t.number} className="bg-surface">
                        Mesa {t.number} ({t.seats} lugares)
                      </option>
                    ))}
                </select>
              </Field>

              <Field label="Observações & Notas Especiais">
                <textarea
                  name="notes"
                  rows={2}
                  maxLength={500}
                  defaultValue={editing.notes}
                  placeholder="Ex.: Aniversário, mesa perto da janela, cadeira de bebé."
                  className={`${fieldClass} h-auto py-2`}
                />
              </Field>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-xl border border-border/80 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-surface-strong hover:text-foreground transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:bg-primary/90"
                >
                  {editing.id ? "Guardar Alterações" : "Criar Reserva"}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
