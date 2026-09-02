import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, Chip, Dot, Panel, Vazio } from "@/components/crm/Bits";
import { DialogChamada } from "@/components/crm/DialogChamada";
import { DialogNegocio } from "@/components/crm/DialogNegocio";
import { btnPequeno, btnPrimario, inputClass, selectClass } from "@/components/crm/Modal";
import {
  ESTADOS,
  PRIORIDADES,
  encontrarDuplicados,
  estadoInfo,
  prioridadeInfo,
  type Business,
} from "@/lib/crm";
import {
  formatarDataPref,
  formatarValor,
  rotuloFase,
  rotuloSeccao,
  usePreferencias,
} from "@/lib/preferencias";
import { useBusinesses, useProfiles } from "@/lib/queries";

type Vista = "ativos" | "concluidos" | "todos";
type Procura = { estado?: string; prioridade?: string; q?: string; vista?: Vista };

const ESTADOS_CONCLUIDOS = ["aceite", "concluido"];

export const Route = createFileRoute("/_authenticated/negocios/")({
  validateSearch: (s: Record<string, unknown>): Procura => ({
    estado: typeof s.estado === "string" ? s.estado : undefined,
    prioridade: typeof s.prioridade === "string" ? s.prioridade : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    vista:
      s.vista === "concluidos" || s.vista === "todos" || s.vista === "ativos"
        ? (s.vista as Vista)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Criação e Modernização de Sites — Orbit CRM" },
      {
        name: "description",
        content: "Lista completa de projetos de criação e modernização de sites, com pesquisa e filtros.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Negocios,
});

function Negocios() {
  const procura = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: negocios = [], isLoading } = useBusinesses();
  const { data: perfis = [] } = useProfiles();
  const [novo, setNovo] = useState(false);
  const [chamada, setChamada] = useState<Business | null>(null);
  const { prefs } = usePreferencias();
  const [ordem, setOrdem] = useState(prefs.ordemPadraoNegocios);
  const ver = (c: string) => prefs.colunasNegocios.includes(c);

  const q = procura.q ?? "";
  const setProcura = (valores: Partial<Procura>) =>
    navigate({ search: (a) => ({ ...a, ...valores }), replace: true });

  const nomePor = (id: string | null) => perfis.find((p) => p.id === id)?.nome ?? null;

  const vista: Vista = procura.vista ?? "ativos";

  const lista = useMemo(() => {
    const texto = q.trim().toLowerCase();
    let r = negocios.filter((n) => {
      const concluido = ESTADOS_CONCLUIDOS.includes(n.estado);
      if (vista === "ativos" && concluido) return false;
      if (vista === "concluidos" && !concluido) return false;
      if (procura.estado && n.estado !== procura.estado) return false;
      if (procura.prioridade && n.prioridade !== procura.prioridade) return false;
      if (!texto) return true;
      return `${n.nome} ${n.categoria ?? ""} ${n.localidade ?? ""} ${n.telefone ?? ""} ${n.email ?? ""} ${n.website ?? ""}`
        .toLowerCase()
        .includes(texto);
    });
    r = [...r].sort((a, b) => {
      if (ordem === "nome") return a.nome.localeCompare(b.nome);
      if (ordem === "valor") return Number(b.valor_estimado ?? 0) - Number(a.valor_estimado ?? 0);
      if (ordem === "prioridade") {
        const peso = { alta: 0, media: 1, baixa: 2 } as const;
        return peso[a.prioridade] - peso[b.prioridade];
      }
      if (ordem === "interacao")
        return (b.ultima_interacao ?? "").localeCompare(a.ultima_interacao ?? "");
      return (b.created_at ?? "").localeCompare(a.created_at ?? "");
    });
    return r.slice(0, prefs.porPagina);
  }, [negocios, prefs.porPagina, procura.estado, procura.prioridade, q, ordem, vista]);

  const totalConcluidos = negocios.filter((n) => ESTADOS_CONCLUIDOS.includes(n.estado)).length;

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {rotuloSeccao(prefs, "/negocios", "Criação e Modernização de Sites")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lista.length} de {negocios.length} projetos de sites.
          </p>
        </div>
        <button className={btnPrimario} onClick={() => setNovo(true)}>
          <Plus className="size-4" /> Novo projeto de site
        </button>
      </div>

      <Panel className="mt-6" bodyClassName="p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Pesquisar nome, telefone, email..."
              value={q}
              onChange={(e) => setProcura({ q: e.target.value || undefined })}
            />
          </div>
          <select
            className={selectClass}
            value={procura.estado ?? ""}
            onChange={(e) => setProcura({ estado: e.target.value || undefined })}
          >
            <option value="">Todos os estados</option>
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>
                {rotuloFase(prefs, e.value)}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={procura.prioridade ?? ""}
            onChange={(e) => setProcura({ prioridade: e.target.value || undefined })}
          >
            <option value="">Todas as prioridades</option>
            {PRIORIDADES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <select className={selectClass} value={ordem} onChange={(e) => setOrdem(e.target.value)}>
            <option value="recentes">Mais recentes</option>
            <option value="nome">Nome (A-Z)</option>
            <option value="prioridade">Prioridade</option>
            <option value="valor">Valor estimado</option>
            <option value="interacao">Última interação</option>
          </select>
        </div>
      </Panel>

      <Panel className="mt-5" bodyClassName="">
        {isLoading ? (
          <Vazio texto="A carregar projetos..." />
        ) : lista.length === 0 ? (
          <Vazio texto="Nenhum projeto corresponde aos filtros." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="border-b border-border/50 text-[10px] uppercase tracking-[.13em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Cliente / Projeto</th>
                  {ver("contacto") && <th className="px-3 py-3 font-medium">Contactos</th>}
                  {ver("estado") && <th className="px-3 py-3 font-medium">Fase</th>}
                  {ver("prioridade") && <th className="px-3 py-3 font-medium">Prioridade</th>}
                  {ver("interacao") && <th className="px-3 py-3 font-medium">Última interação</th>}
                  {ver("valor") && <th className="px-3 py-3 font-medium">Valor</th>}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {lista.map((n) => {
                  const e = estadoInfo(n.estado);
                  const p = prioridadeInfo(n.prioridade);
                  const dup = encontrarDuplicados(n, negocios).length > 0;
                  const contactou = nomePor(n.contactado_por);
                  return (
                    <tr key={n.id} className="border-b border-border/40 transition hover:bg-accent/40">
                      <td className="px-5 py-3.5">
                        <Link to="/negocios/$id" params={{ id: n.id }} className="font-medium">
                          {n.nome}
                        </Link>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                          {ver("categoria") && <span>{n.categoria ?? "Sem categoria"}</span>}
                          {ver("localidade") && n.localidade && <span>· {n.localidade}</span>}
                          {n.is_demo && <Chip tone="muted">exemplo</Chip>}
                          {dup && (
                            <Chip tone="warning">
                              <AlertTriangle className="size-3" /> duplicado
                            </Chip>
                          )}
                        </div>
                      </td>
                      {ver("contacto") && (
                      <td className="px-3 py-3.5 text-muted-foreground">
                        <div>{n.telefone ?? "—"}</div>
                        <div className="text-[10px]">{n.email ?? n.website ?? ""}</div>
                      </td>
                      )}
                      {ver("estado") && (
                      <td className="px-3 py-3.5">
                        <Chip tone={e.tone}>{rotuloFase(prefs, n.estado)}</Chip>
                        {contactou && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-warning">
                            já contactado por {contactou}
                          </div>
                        )}
                      </td>
                      )}
                      {ver("prioridade") && (
                      <td className="px-3 py-3.5">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Dot tone={p.tone} />
                          {p.label}
                        </span>
                      </td>
                      )}
                      {ver("interacao") && (
                      <td className="px-3 py-3.5 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {ver("responsavel") && <Avatar nome={contactou ?? undefined} size="size-6" />}
                          {formatarDataPref(prefs, n.ultima_interacao)}
                        </div>
                      </td>
                      )}
                      {ver("valor") && (
                      <td className="px-3 py-3.5 text-muted-foreground">{formatarValor(prefs, n.valor_estimado)}</td>
                      )}
                      <td className="px-4 py-3.5">
                        <button className={btnPequeno} onClick={() => setChamada(n)}>
                          Registar chamada
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <DialogNegocio aberto={novo} onFechar={() => setNovo(false)} />
      {chamada && (
        <DialogChamada aberto onFechar={() => setChamada(null)} negocio={chamada} />
      )}
    </>
  );
}
