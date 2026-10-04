import { Link, createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  Flame,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, Chip, Dot, Vazio } from "@/components/crm/Bits";
import { DialogChamada } from "@/components/crm/DialogChamada";
import { DialogNegocio } from "@/components/crm/DialogNegocio";
import {
  ESTADOS,
  PRIORIDADES,
  encontrarDuplicados,
  estadoInfo,
  formatarData,
  formatarMoeda,
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
import { cn } from "@/lib/utils";

type Vista = "ativos" | "propostas" | "concluidos" | "todos";
type Procura = {
  estado?: string;
  prioridade?: string;
  q?: string;
  vista?: Vista;
  responsavel?: string;
};

const ESTADOS_CONCLUIDOS = ["aceite", "concluido"];
const ESTADOS_PROPOSTAS = ["interessado", "reuniao_agendada", "proposta_enviada", "seguimento"];

export const Route = createFileRoute("/_authenticated/negocios/")({
  validateSearch: (s: Record<string, unknown>): Procura => ({
    estado: typeof s.estado === "string" ? s.estado : undefined,
    prioridade: typeof s.prioridade === "string" ? s.prioridade : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    responsavel: typeof s.responsavel === "string" ? s.responsavel : undefined,
    vista:
      s.vista === "concluidos" ||
      s.vista === "todos" ||
      s.vista === "ativos" ||
      s.vista === "propostas"
        ? (s.vista as Vista)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Negócios & Clientes — Nova Web Studio" },
      {
        name: "description",
        content:
          "Gestão comercial de clientes, modernização de websites, filtros inteligentes e pipeline.",
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

  const q = procura.q ?? "";
  const setProcura = (valores: Partial<Procura>) =>
    navigate({ search: (a) => ({ ...a, ...valores }), replace: true });

  const nomePor = (id: string | null) =>
    perfis.find((p) => p.id === id)?.nome ?? (id ? "Equipa" : "—");

  const vista: Vista = procura.vista ?? "ativos";

  const totalAtivos = negocios.filter(
    (n) => !ESTADOS_CONCLUIDOS.includes(n.estado) && n.estado !== "arquivado",
  ).length;

  const totalPropostas = negocios.filter((n) =>
    ESTADOS_PROPOSTAS.includes(n.estado),
  ).length;

  const totalConcluidos = negocios.filter((n) =>
    ESTADOS_CONCLUIDOS.includes(n.estado),
  ).length;

  const lista = useMemo(() => {
    const texto = q.trim().toLowerCase();
    let r = negocios.filter((n) => {
      const concluido = ESTADOS_CONCLUIDOS.includes(n.estado);
      const proposta = ESTADOS_PROPOSTAS.includes(n.estado);

      if (vista === "ativos" && (concluido || n.estado === "arquivado")) return false;
      if (vista === "propostas" && !proposta) return false;
      if (vista === "concluidos" && !concluido) return false;

      if (procura.estado && n.estado !== procura.estado) return false;
      if (procura.prioridade && n.prioridade !== procura.prioridade) return false;
      if (
        procura.responsavel &&
        n.contactado_por !== procura.responsavel &&
        n.encontrado_por !== procura.responsavel
      )
        return false;

      if (!texto) return true;
      return `${n.nome} ${n.categoria ?? ""} ${n.localidade ?? ""} ${n.telefone ?? ""} ${n.email ?? ""} ${n.website ?? ""}`
        .toLowerCase()
        .includes(texto);
    });

    r = [...r].sort((a, b) => {
      if (ordem === "nome") return a.nome.localeCompare(b.nome);
      if (ordem === "valor")
        return Number(b.valor_estimado ?? 0) - Number(a.valor_estimado ?? 0);
      if (ordem === "prioridade") {
        const peso = { alta: 0, media: 1, baixa: 2 } as const;
        return peso[a.prioridade] - peso[b.prioridade];
      }
      if (ordem === "interacao")
        return (b.ultima_interacao ?? "").localeCompare(a.ultima_interacao ?? "");
      return (b.created_at ?? "").localeCompare(a.created_at ?? "");
    });

    return r.slice(0, prefs.porPagina);
  }, [
    negocios,
    prefs.porPagina,
    procura.estado,
    procura.prioridade,
    procura.responsavel,
    q,
    ordem,
    vista,
  ]);

  return (
    <div className="space-y-6">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <BriefcaseBusiness className="size-3.5" />
            <span>Gestão Comercial</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {rotuloSeccao(prefs, "/negocios", "Negócios & Clientes")}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {lista.length} de {negocios.length} clientes e projetos registados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNovo(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 active:scale-95"
        >
          <Plus className="size-4" />
          <span>Novo Projeto / Cliente</span>
        </button>
      </div>

      {/* VISTAS RÁPIDAS (TABS) */}
      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border/70 bg-surface/50 p-1.5 backdrop-blur-md">
        {[
          { chave: "ativos", rotulo: `Em Curso (${totalAtivos})` },
          { chave: "propostas", rotulo: `Propostas & Negociação (${totalPropostas})` },
          { chave: "concluidos", rotulo: `Concluídos (${totalConcluidos})` },
          { chave: "todos", rotulo: `Todos (${negocios.length})` },
        ].map((v) => (
          <button
            key={v.chave}
            type="button"
            onClick={() => setProcura({ vista: v.chave as Vista })}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition",
              vista === v.chave
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
            )}
          >
            {v.rotulo}
          </button>
        ))}
      </div>

      {/* BARRA DE FILTROS AVANÇADOS */}
      <div className="rounded-3xl border border-border/70 bg-surface/40 p-4 backdrop-blur-md space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Pesquisa Livre */}
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              className="h-9 w-full rounded-xl border border-border/70 bg-surface/80 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground transition hover:border-primary/40 focus:border-primary focus:outline-none"
              placeholder="Pesquisar por nome, telefone, email, localidade..."
              value={q}
              onChange={(e) => setProcura({ q: e.target.value || undefined })}
            />
          </div>

          {/* Filtro por Fase */}
          <select
            className="h-9 rounded-xl border border-border/70 bg-surface/80 px-3 text-xs text-foreground transition hover:border-primary/40 focus:border-primary focus:outline-none"
            value={procura.estado ?? ""}
            onChange={(e) => setProcura({ estado: e.target.value || undefined })}
          >
            <option value="">Todas as fases</option>
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>
                {rotuloFase(prefs, e.value)}
              </option>
            ))}
          </select>

          {/* Filtro por Prioridade */}
          <select
            className="h-9 rounded-xl border border-border/70 bg-surface/80 px-3 text-xs text-foreground transition hover:border-primary/40 focus:border-primary focus:outline-none"
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

          {/* Ordenação */}
          <select
            className="h-9 rounded-xl border border-border/70 bg-surface/80 px-3 text-xs text-foreground transition hover:border-primary/40 focus:border-primary focus:outline-none"
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
          >
            <option value="recentes">Mais recentes</option>
            <option value="nome">Nome (A-Z)</option>
            <option value="prioridade">Prioridade</option>
            <option value="valor">Maior valor estimado</option>
            <option value="interacao">Última interação</option>
          </select>
        </div>
      </div>

      {/* TABELA DE NEGÓCIOS & CLIENTES */}
      <div className="overflow-hidden rounded-3xl border border-border/70 bg-surface/40 backdrop-blur-md">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            A carregar clientes...
          </div>
        ) : lista.length === 0 ? (
          <div className="p-12 text-center">
            <Vazio texto="Nenhum cliente ou projeto corresponde aos filtros selecionados." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-xs">
              <thead className="border-b border-border/50 bg-surface/60 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Cliente / Empresa</th>
                  <th className="px-4 py-3.5">Contactos</th>
                  <th className="px-3 py-3.5">Fase</th>
                  <th className="px-3 py-3.5">Prioridade</th>
                  <th className="px-3 py-3.5">Responsável</th>
                  <th className="px-4 py-3.5">Valor Estimado</th>
                  <th className="px-4 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {lista.map((n) => {
                  const estado = estadoInfo(n.estado);
                  const prioridade = prioridadeInfo(n.prioridade);
                  const duplicados = encontrarDuplicados(n, negocios);
                  const contactou = nomePor(n.contactado_por);

                  return (
                    <tr
                      key={n.id}
                      className="group transition hover:bg-surface-strong/60"
                    >
                      {/* Nome e Categoria */}
                      <td className="px-6 py-3.5">
                        <Link
                          to="/negocios/$id"
                          params={{ id: n.id }}
                          className="font-bold text-foreground transition group-hover:text-primary flex items-center gap-1.5 text-sm"
                        >
                          <span>{n.nome}</span>
                          <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 transition text-primary" />
                        </Link>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{n.categoria ?? "Geral"}</span>
                          {n.localidade && <span>• {n.localidade}</span>}
                          {duplicados.length > 0 && (
                            <span className="rounded bg-warning/15 px-1.5 py-0.2 text-[9px] font-bold text-warning flex items-center gap-1">
                              <AlertTriangle className="size-2.5" />
                              possível duplicado
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contactos */}
                      <td className="px-4 py-3.5 text-muted-foreground">
                        <div className="font-mono text-[11px] text-foreground">
                          {n.telefone ?? "—"}
                        </div>
                        <div className="text-[10px] truncate max-w-[150px]">
                          {n.email ?? n.website ?? ""}
                        </div>
                      </td>

                      {/* Fase do Negócio */}
                      <td className="px-3 py-3.5">
                        <Chip tone={estado.tone}>
                          {rotuloFase(prefs, n.estado)}
                        </Chip>
                      </td>

                      {/* Prioridade */}
                      <td className="px-3 py-3.5">
                        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Dot tone={prioridade.tone} />
                          {prioridade.label}
                        </span>
                      </td>

                      {/* Responsável */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar
                            nome={nomePor(n.contactado_por ?? n.encontrado_por)}
                            size="size-5"
                          />
                          <span className="text-[11px] text-muted-foreground truncate max-w-[110px]">
                            {nomePor(n.contactado_por ?? n.encontrado_por)}
                          </span>
                        </div>
                      </td>

                      {/* Valor Estimado */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-semibold text-foreground text-[11px]">
                          {formatarMoeda(n.valor_estimado)}
                        </span>
                      </td>

                      {/* Ação Rápida */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setChamada(n)}
                          className="rounded-xl border border-border/70 bg-surface/80 px-2.5 py-1 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:bg-surface-strong"
                        >
                          Ligar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modais */}
      {novo && <DialogNegocio aberto onFechar={() => setNovo(false)} />}
      {chamada && (
        <DialogChamada
          aberto
          onFechar={() => setChamada(null)}
          negocio={chamada}
        />
      )}
    </div>
  );
}
