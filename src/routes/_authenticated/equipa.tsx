import { createFileRoute } from "@tanstack/react-router";
import { Mail, MailPlus, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";

import { Avatar, Campo, Chip, Panel, Vazio } from "@/components/crm/Bits";
import {
  Modal,
  btnPequeno,
  btnPrimario,
  btnSecundario,
  inputClass,
  selectClass,
} from "@/components/crm/Modal";
import { useUtilizador } from "@/hooks/useAuth";
import { formatarData, type AppRole } from "@/lib/crm";
import {
  useAlterarFuncao,
  useAnularConvite,
  useConvidarMembro,
  useConvites,
  useProfiles,
  useRemoverMembro,
  useRoles,
} from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/equipa")({
  head: () => ({
    meta: [
      { title: "Equipa — Nova Web CRM" },
      { name: "description", content: "Gestão de membros, funções e convites da equipa." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Equipa,
});

const FUNCOES: { value: AppRole; label: string }[] = [
  { value: "administrador", label: "Administrador" },
  { value: "colaborador", label: "Colaborador" },
];

function Equipa() {
  const { userId, isAdmin } = useUtilizador();
  const { data: perfis = [], isLoading } = useProfiles();
  const { data: funcoes = [] } = useRoles();
  const { data: convites = [] } = useConvites();

  const convidar = useConvidarMembro();
  const anular = useAnularConvite();
  const remover = useRemoverMembro();
  const alterar = useAlterarFuncao();

  const [aberto, setAberto] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("colaborador");
  const [aRemover, setARemover] = useState<string | null>(null);

  const funcaoDe = (id: string): AppRole =>
    (funcoes.find((f) => f.user_id === id)?.role as AppRole) ?? "colaborador";

  const pendentes = convites.filter((c) => !c.aceite_em);
  const alvo = perfis.find((p) => p.id === aRemover);

  async function submeterConvite() {
    if (!email.trim()) return;
    await convidar.mutateAsync({ email, role });
    setEmail("");
    setRole("colaborador");
    setAberto(false);
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Equipa</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {perfis.length} {perfis.length === 1 ? "membro" : "membros"} · {pendentes.length}{" "}
            {pendentes.length === 1 ? "convite pendente" : "convites pendentes"}
          </p>
        </div>
        {isAdmin && (
          <button className={btnPrimario} onClick={() => setAberto(true)}>
            <UserPlus className="size-4" />
            Convidar colaborador
          </button>
        )}
      </header>

      <Panel title="Membros" subtitle="Pessoas com acesso ao CRM." bodyClassName="p-0">
        {isLoading ? (
          <Vazio texto="A carregar membros…" icon={Users} />
        ) : perfis.length === 0 ? (
          <Vazio texto="Ainda não existem membros." icon={Users} />
        ) : (
          <ul className="divide-y divide-border/60">
            {perfis.map((p) => {
              const f = funcaoDe(p.id);
              const proprio = p.id === userId;
              return (
                <li
                  key={p.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="flex items-center gap-3">
                    <Avatar nome={p.nome} url={p.foto_url} size="size-10" />
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {p.nome ?? "Sem nome"}
                        {proprio && <Chip tone="muted">Eu</Chip>}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{p.email}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Chip tone={f === "administrador" ? "primary" : "info"}>
                      {f === "administrador" ? "Administrador" : "Colaborador"}
                    </Chip>

                    {isAdmin && !proprio && (
                      <>
                        <select
                          className={`${selectClass} h-8 w-auto text-xs`}
                          value={f}
                          onChange={(e) =>
                            alterar.mutate({ userId: p.id, role: e.target.value as AppRole })
                          }
                        >
                          {FUNCOES.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <button
                          className={btnPequeno}
                          onClick={() => setARemover(p.id)}
                          aria-label={`Remover ${p.nome ?? p.email}`}
                        >
                          <Trash2 className="size-3.5" />
                          Remover
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel
        title="Convites pendentes"
        subtitle="Quem criar conta com estes emails entra automaticamente na equipa."
        bodyClassName="p-0"
      >
        {pendentes.length === 0 ? (
          <Vazio texto="Sem convites pendentes." icon={MailPlus} />
        ) : (
          <ul className="divide-y divide-border/60">
            {pendentes.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-secondary">
                    <Mail className="size-4 text-muted-foreground" />
                  </span>
                  <div>
                    <div className="text-sm">{c.email}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Convidado a {formatarData(c.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Chip tone={c.role === "administrador" ? "primary" : "info"}>
                    {c.role === "administrador" ? "Administrador" : "Colaborador"}
                  </Chip>
                  {isAdmin && (
                    <button className={btnPequeno} onClick={() => anular.mutate(c.id)}>
                      Anular
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {!isAdmin && (
        <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Só os administradores podem convidar ou remover colaboradores.
        </p>
      )}

      <Modal
        aberto={aberto}
        onFechar={() => setAberto(false)}
        titulo="Convidar colaborador"
        descricao="A pessoa entra na equipa assim que criar conta com o email indicado."
        rodape={
          <>
            <button className={btnSecundario} onClick={() => setAberto(false)}>
              Cancelar
            </button>
            <button className={btnPrimario} onClick={submeterConvite} disabled={convidar.isPending}>
              Enviar convite
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Campo label="Email">
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@empresa.pt"
            />
          </Campo>
          <Campo label="Função">
            <select
              className={selectClass}
              value={role}
              onChange={(e) => setRole(e.target.value as AppRole)}
            >
              {FUNCOES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </Modal>

      <Modal
        aberto={!!aRemover}
        onFechar={() => setARemover(null)}
        titulo="Remover colaborador"
        descricao="Esta ação retira o acesso ao CRM e não pode ser anulada."
        rodape={
          <>
            <button className={btnSecundario} onClick={() => setARemover(null)}>
              Cancelar
            </button>
            <button
              className={btnPrimario}
              disabled={remover.isPending}
              onClick={async () => {
                if (!aRemover) return;
                await remover.mutateAsync(aRemover);
                setARemover(null);
              }}
            >
              Remover
            </button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Confirmar a remoção de {alvo?.nome ?? alvo?.email ?? "este colaborador"}?
        </p>
      </Modal>
    </div>
  );
}
