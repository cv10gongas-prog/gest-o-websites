import {
  AlertCircle,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock3,
  Globe2,
  HelpCircle,
  History,
  Info,
  Laptop,
  Lock,
  LogOut,
  MapPin,
  MonitorSmartphone,
  Network,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserCheck,
  UserRound,
  Wifi,
  XCircle,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Avatar, Chip, Dot, Vazio } from "@/components/crm/Bits";
import { useActivity, useProfiles } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { useUtilizador } from "@/hooks/useAuth";
import { formatarData, formatarHora } from "@/lib/crm";
import { cn } from "@/lib/utils";

type PeriodoSeguranca = "24h" | "7d" | "30d" | "tudo";
type TabSeguranca = "timeline" | "ips" | "emails" | "bloqueios" | "politicas";

type DetalheSeguranca = {
  ip?: string | null;
  pais?: string | null;
  cidade?: string | null;
  email?: string | null;
  user_id?: string | null;
  sucesso?: boolean;
  tipo?: string | null;
  user_agent?: string | null;
};

type EstadoAcesso = "primeiro" | "conhecido" | "ip_novo" | "pais_novo";

type EventoLogin = {
  id: string;
  created_at: string;
  autor: string | null;
  seguranca: DetalheSeguranca;
  tipo: "login";
  estadoAcesso: EstadoAcesso;
};

type EventoLogout = {
  id: string;
  created_at: string;
  autor: string | null;
  seguranca: DetalheSeguranca;
  tipo: "logout";
};

type EventoFalha = {
  id: string;
  created_at: string;
  autor: null;
  seguranca: {
    ip: string | null;
    pais: string | null;
    cidade: string | null;
    email: string | null;
    user_agent: string | null;
  };
  tipo: "falha";
  motivo: string | null;
};

type EventoSeguranca = EventoLogin | EventoLogout | EventoFalha;

function interpretarDetalhe(value: string | null): DetalheSeguranca {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null) return parsed;
    return {};
  } catch {
    return {};
  }
}

function bandeiraPais(codigo?: string | null) {
  if (!codigo || codigo.length !== 2) return "🌍";
  return String.fromCodePoint(
    ...codigo
      .toUpperCase()
      .split("")
      .map((letra) => 127397 + letra.charCodeAt(0)),
  );
}

function browserPorUserAgent(userAgent?: string | null) {
  if (!userAgent) return "Desconhecido";
  if (userAgent.includes("Edg/")) return "Microsoft Edge";
  if (userAgent.includes("OPR/")) return "Opera";
  if (userAgent.includes("Firefox/")) return "Firefox";
  if (userAgent.includes("Chrome/")) return "Google Chrome";
  if (userAgent.includes("Safari/")) return "Safari";
  return "Outro Browser";
}

function dispositivoPorUserAgent(userAgent?: string | null) {
  if (!userAgent) {
    return { nome: "Dispositivo desconhecido", Icon: MonitorSmartphone };
  }
  if (/iPhone/i.test(userAgent)) return { nome: "iPhone", Icon: Smartphone };
  if (/Android/i.test(userAgent)) return { nome: "Android", Icon: Smartphone };
  if (/iPad/i.test(userAgent)) return { nome: "iPad", Icon: Smartphone };
  if (/Mac/i.test(userAgent)) return { nome: "Mac", Icon: Laptop };
  if (/Windows/i.test(userAgent)) return { nome: "Windows PC", Icon: Laptop };
  return { nome: "Computador / Desktop", Icon: Laptop };
}

export function SegurancaPainel() {
  const [tab, setTab] = useState<TabSeguranca>("timeline");
  const [periodo, setPeriodo] = useState<PeriodoSeguranca>("7d");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [ipBloqueadoManual, setIpBloqueadoManual] = useState<string | null>(null);

  const qc = useQueryClient();
  const { isAdmin, perfil } = useUtilizador();
  const { data: perfis = [] } = useProfiles();
  const { data: atividades = [] } = useActivity();

  // Consulta à tabela oficial security_login_attempts
  const {
    data: tentativasFalhadas = [],
    isLoading: tentativasLoading,
    refetch,
  } = useQuery({
    queryKey: ["security-login-attempts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_login_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        console.error("[Segurança] Erro ao carregar tentativas:", error);
        return [];
      }
      return data ?? [];
    },
    refetchInterval: 15000,
  });

  const nomePor = (id: string | null) =>
    perfis.find((p) => p.id === id)?.nome ?? (id ? "Colaborador" : "Anónimo");

  // Eventos de auditoria de segurança (logins e logouts)
  const eventosAtividadeSeguranca = useMemo(() => {
    return atividades.filter((a) => a.entidade === "seguranca");
  }, [atividades]);

  // Histórico de acessos por utilizador para deteção de novo IP/País
  const historicoPorUtilizador = useMemo(() => {
    const mapa = new Map<string, { ips: Set<string>; paises: Set<string> }>();

    // Ordenar do mais antigo para o mais recente para calcular primeiras ocorrências
    const ordenados = [...eventosAtividadeSeguranca].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    const estados = new Map<string, EstadoAcesso>();

    for (const ev of ordenados) {
      if (ev.accao !== "iniciou sessão") continue;
      const autor = ev.autor;
      if (!autor) continue;

      const seg = interpretarDetalhe(ev.detalhe);
      const ip = seg.ip?.trim();
      const pais = seg.pais?.trim().toUpperCase();

      let reg = mapa.get(autor);
      if (!reg) {
        reg = { ips: new Set<string>(), paises: new Set<string>() };
        mapa.set(autor, reg);
        estados.set(ev.id, "primeiro");
      } else {
        const paisNovo = pais && !reg.paises.has(pais);
        const ipNovo = ip && !reg.ips.has(ip);

        if (paisNovo) estados.set(ev.id, "pais_novo");
        else if (ipNovo) estados.set(ev.id, "ip_novo");
        else estados.set(ev.id, "conhecido");
      }

      if (ip) reg.ips.add(ip);
      if (pais) reg.paises.add(pais);
    }

    return estados;
  }, [eventosAtividadeSeguranca]);

  // Consolidação de todos os eventos de segurança
  const todosEventos = useMemo(() => {
    const agora = new Date().getTime();
    const limite =
      periodo === "24h"
        ? 24 * 60 * 60 * 1000
        : periodo === "7d"
          ? 7 * 24 * 60 * 60 * 1000
          : periodo === "30d"
            ? 30 * 24 * 60 * 60 * 1000
            : null;

    const lista: EventoSeguranca[] = [];

    // Logins e Logouts autorizados
    for (const a of eventosAtividadeSeguranca) {
      const tempo = new Date(a.created_at).getTime();
      if (limite !== null && agora - tempo > limite) continue;

      const seg = interpretarDetalhe(a.detalhe);
      if (a.accao === "iniciou sessão") {
        lista.push({
          id: a.id,
          created_at: a.created_at,
          autor: a.autor,
          seguranca: seg,
          tipo: "login",
          estadoAcesso: historicoPorUtilizador.get(a.id) ?? "conhecido",
        });
      } else if (a.accao === "terminou sessão") {
        lista.push({
          id: a.id,
          created_at: a.created_at,
          autor: a.autor,
          seguranca: seg,
          tipo: "logout",
        });
      }
    }

    // Tentativas Falhadas
    for (const f of tentativasFalhadas) {
      const tempo = new Date(f.created_at).getTime();
      if (limite !== null && agora - tempo > limite) continue;

      lista.push({
        id: f.id,
        created_at: f.created_at,
        autor: null,
        seguranca: {
          ip: f.ip,
          pais: f.pais,
          cidade: f.cidade,
          email: f.email,
          user_agent: f.user_agent,
        },
        tipo: "falha",
        motivo: f.motivo,
      });
    }

    return lista.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [eventosAtividadeSeguranca, tentativasFalhadas, periodo, historicoPorUtilizador]);

  // Agrupamento de Tentativas por IP (para deteção de Força Bruta)
  const agrupamentoIPs = useMemo(() => {
    const mapa = new Map<
      string,
      {
        ip: string;
        pais: string | null;
        cidade: string | null;
        totalTentativas: number;
        falhas: number;
        sucessos: number;
        emailsTestados: Set<string>;
        ultimoAcesso: string;
      }
    >();

    for (const ev of todosEventos) {
      const ip = ev.seguranca.ip ?? "Desconhecido";
      let reg = mapa.get(ip);
      if (!reg) {
        reg = {
          ip,
          pais: ev.seguranca.pais ?? null,
          cidade: ev.seguranca.cidade ?? null,
          totalTentativas: 0,
          falhas: 0,
          sucessos: 0,
          emailsTestados: new Set<string>(),
          ultimoAcesso: ev.created_at,
        };
        mapa.set(ip, reg);
      }

      reg.totalTentativas += 1;
      if (ev.tipo === "falha") reg.falhas += 1;
      else if (ev.tipo === "login") reg.sucessos += 1;

      if (ev.seguranca.email) reg.emailsTestados.add(ev.seguranca.email);
    }

    return Array.from(mapa.values()).sort(
      (a, b) => b.falhas - a.falhas || b.totalTentativas - a.totalTentativas,
    );
  }, [todosEventos]);

  // Agrupamento por Email Testado
  const agrupamentoEmails = useMemo(() => {
    const mapa = new Map<
      string,
      {
        email: string;
        falhas: number;
        sucessos: number;
        ipsUtilizados: Set<string>;
        ultimoAcesso: string;
      }
    >();

    for (const ev of todosEventos) {
      const email = ev.seguranca.email?.toLowerCase().trim();
      if (!email) continue;

      let reg = mapa.get(email);
      if (!reg) {
        reg = {
          email,
          falhas: 0,
          sucessos: 0,
          ipsUtilizados: new Set<string>(),
          ultimoAcesso: ev.created_at,
        };
        mapa.set(email, reg);
      }

      if (ev.tipo === "falha") reg.falhas += 1;
      else if (ev.tipo === "login") reg.sucessos += 1;

      if (ev.seguranca.ip) reg.ipsUtilizados.add(ev.seguranca.ip);
    }

    return Array.from(mapa.values()).sort((a, b) => b.falhas - a.falhas || b.sucessos - a.sucessos);
  }, [todosEventos]);

  // Estatísticas Rápidas
  const metricas = useMemo(() => {
    const loginsAutorizados = todosEventos.filter((e) => e.tipo === "login").length;
    const logouts = todosEventos.filter((e) => e.tipo === "logout").length;
    const falhas = todosEventos.filter((e) => e.tipo === "falha").length;
    const ipsUnicos = new Set(todosEventos.map((e) => e.seguranca.ip).filter(Boolean)).size;
    const ipsSobAtaque = agrupamentoIPs.filter((ip) => ip.falhas >= 3).length;

    return {
      loginsAutorizados,
      logouts,
      falhas,
      ipsUnicos,
      ipsSobAtaque,
    };
  }, [todosEventos, agrupamentoIPs]);

  // Filtragem de Texto
  const eventosFiltrados = useMemo(() => {
    if (!filtroTexto.trim()) return todosEventos;
    const t = filtroTexto.toLowerCase().trim();
    return todosEventos.filter((ev) => {
      const email = ev.seguranca.email?.toLowerCase() ?? "";
      const ip = ev.seguranca.ip?.toLowerCase() ?? "";
      const cidade = ev.seguranca.cidade?.toLowerCase() ?? "";
      const pais = ev.seguranca.pais?.toLowerCase() ?? "";
      return email.includes(t) || ip.includes(t) || cidade.includes(t) || pais.includes(t);
    });
  }, [todosEventos, filtroTexto]);

  return (
    <div className="space-y-6">
      {/* HEADER DA CENTRAL DE SEGURANÇA */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-danger">
            <ShieldAlert className="size-3.5" />
            <span>Auditoria & Cibersegurança</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Central de Segurança
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Monitorização em tempo real de acessos, deteção de força bruta e integridade de sessões.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de Período */}
          <div className="flex items-center rounded-xl border border-border/70 bg-surface/50 p-1">
            {(["24h", "7d", "30d", "tudo"] as PeriodoSeguranca[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodo(p)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                  periodo === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              refetch();
              qc.invalidateQueries({ queryKey: ["activity"] });
            }}
            className="grid size-9 place-items-center rounded-xl border border-border/70 bg-surface/50 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            aria-label="Atualizar dados de segurança"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {/* ALERTAS DE FORÇA BRUTA DESTACADOS */}
      {metricas.ipsSobAtaque > 0 && (
        <div className="rounded-3xl border border-danger/40 bg-danger/10 p-5 backdrop-blur-md flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-danger/20 text-danger">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-sm font-bold text-danger">
              Atividade Anómala / Tentativas Repetidas de Login Detectadas
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Existem{" "}
              <span className="font-bold text-foreground">
                {metricas.ipsSobAtaque} endereço(s) IP
              </span>{" "}
              com 3 ou mais tentativas falhadas no período selecionado. O sistema protegeu as contas
              administrativas rejeitando credenciais não autorizadas.
            </p>
          </div>
        </div>
      )}

      {/* GRID DE KPIS DE SEGURANÇA */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-border/70 bg-surface/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Logins Autorizados
          </span>
          <p className="text-2xl font-bold font-mono text-success mt-1">
            {metricas.loginsAutorizados}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Sessões iniciadas</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-surface/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Tentativas Rejeitadas
          </span>
          <p className="text-2xl font-bold font-mono text-danger mt-1">{metricas.falhas}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Falhas de autenticação</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-surface/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Logouts Efetuados
          </span>
          <p className="text-2xl font-bold font-mono text-foreground mt-1">{metricas.logouts}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Encerramentos de sessão</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-surface/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Endereços IP Únicos
          </span>
          <p className="text-2xl font-bold font-mono text-info mt-1">{metricas.ipsUnicos}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Redes de acesso</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-surface/50 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            IPs Suspeitos
          </span>
          <p className="text-2xl font-bold font-mono text-warning mt-1">{metricas.ipsSobAtaque}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">≥ 3 falhas registadas</p>
        </div>
      </div>

      {/* SEPARADORES DA CENTRAL */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/70 bg-surface/50 p-1.5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setTab("timeline")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "timeline"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <Clock3 className="size-3.5" />
          <span>Linha Temporal de Acessos</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("ips")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "ips"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <Network className="size-3.5" />
          <span>Agrupamento por IP ({agrupamentoIPs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("emails")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "emails"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <UserRound className="size-3.5" />
          <span>Emails Testados ({agrupamentoEmails.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("politicas")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "politicas"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <Info className="size-3.5" />
          <span>Arquitetura & Limites Técnicos</span>
        </button>
      </div>

      {/* TAB 1: TIMELINE DE EVENTOS */}
      {tab === "timeline" && (
        <div className="space-y-4">
          {/* Barra de Pesquisa na Timeline */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
            <input
              className="h-9 w-full rounded-2xl border border-border/70 bg-surface/50 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              placeholder="Filtrar por email, IP, cidade ou país..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
          </div>

          <div className="rounded-3xl border border-border/70 bg-surface/40 backdrop-blur-md overflow-hidden">
            {eventosFiltrados.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <ShieldCheck className="size-8 mx-auto mb-2 text-success" />
                <p className="text-sm font-semibold">Sem registos no período selecionado.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {eventosFiltrados.map((ev) => {
                  const disp = dispositivoPorUserAgent(ev.seguranca.user_agent);
                  const browser = browserPorUserAgent(ev.seguranca.user_agent);
                  const flag = bandeiraPais(ev.seguranca.pais);

                  return (
                    <div
                      key={ev.id}
                      className="p-4 transition hover:bg-surface-strong/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "grid size-9 shrink-0 place-items-center rounded-xl border mt-0.5",
                            ev.tipo === "login"
                              ? "border-success/30 bg-success/10 text-success"
                              : ev.tipo === "logout"
                                ? "border-muted-foreground/30 bg-secondary text-muted-foreground"
                                : "border-danger/30 bg-danger/10 text-danger",
                          )}
                        >
                          {ev.tipo === "login" ? (
                            <CheckCircle2 className="size-4" />
                          ) : ev.tipo === "logout" ? (
                            <LogOut className="size-4" />
                          ) : (
                            <XCircle className="size-4" />
                          )}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              {ev.tipo === "login"
                                ? "Login Autorizado"
                                : ev.tipo === "logout"
                                  ? "Sessão Terminada"
                                  : "Tentativa de Login Rejeitada"}
                            </span>

                            {ev.tipo === "login" && ev.estadoAcesso === "ip_novo" && (
                              <span className="rounded bg-warning/15 px-1.5 py-0.2 text-[9px] font-bold text-warning">
                                Novo IP
                              </span>
                            )}

                            {ev.tipo === "login" && ev.estadoAcesso === "pais_novo" && (
                              <span className="rounded bg-danger/15 px-1.5 py-0.2 text-[9px] font-bold text-danger">
                                Novo País
                              </span>
                            )}
                          </div>

                          <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px]">
                            {ev.seguranca.email && (
                              <span className="font-medium text-foreground">
                                {ev.seguranca.email}
                              </span>
                            )}
                            <span>•</span>
                            <span className="font-mono">{ev.seguranca.ip ?? "IP oculto"}</span>
                            <span>•</span>
                            <span>
                              {flag} {ev.seguranca.cidade ? `${ev.seguranca.cidade}, ` : ""}
                              {ev.seguranca.pais ?? "Global"}
                            </span>
                            <span>•</span>
                            <span>
                              {disp.nome} ({browser})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 sm:justify-end">
                          <Clock3 className="size-3" />
                          {formatarData(ev.created_at, true)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AGRUPAMENTO POR IP */}
      {tab === "ips" && (
        <div className="rounded-3xl border border-border/70 bg-surface/40 backdrop-blur-md overflow-hidden">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="border-b border-border/50 bg-surface/60 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-3.5">Endereço IP / Origem</th>
                <th className="px-4 py-3.5">Total de Acessos</th>
                <th className="px-4 py-3.5">Falhas Rejeitadas</th>
                <th className="px-4 py-3.5">Emails Utilizados</th>
                <th className="px-4 py-3.5">Última Tentativa</th>
                <th className="px-4 py-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {agrupamentoIPs.map((reg) => {
                const flag = bandeiraPais(reg.pais);
                const suspeito = reg.falhas >= 3;

                return (
                  <tr
                    key={reg.ip}
                    className={cn(
                      "transition hover:bg-surface-strong/60",
                      suspeito && "bg-danger/5",
                    )}
                  >
                    <td className="px-6 py-3.5">
                      <div className="font-mono font-bold text-foreground flex items-center gap-2">
                        <span>{reg.ip}</span>
                        {suspeito && (
                          <span className="rounded bg-danger/15 px-1.5 py-0.2 text-[9px] font-bold text-danger">
                            Suspeito
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {flag} {reg.cidade ? `${reg.cidade}, ` : ""}
                        {reg.pais ?? "Desconhecido"}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono">{reg.totalTentativas}</td>

                    <td className="px-4 py-3.5 font-mono">
                      <span
                        className={cn(
                          reg.falhas > 0 ? "text-danger font-bold" : "text-muted-foreground",
                        )}
                      >
                        {reg.falhas}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-[11px] text-muted-foreground">
                      {Array.from(reg.emailsTestados).slice(0, 2).join(", ")}
                      {reg.emailsTestados.size > 2 && ` (+${reg.emailsTestados.size - 2})`}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[10px] text-muted-foreground">
                      {formatarData(reg.ultimoAcesso, true)}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setIpBloqueadoManual(reg.ip)}
                        className="rounded-xl border border-border/70 bg-surface/80 px-2.5 py-1 text-xs font-semibold text-danger hover:bg-danger/10 transition"
                      >
                        Sinalizar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: EMAILS TESTADOS */}
      {tab === "emails" && (
        <div className="rounded-3xl border border-border/70 bg-surface/40 backdrop-blur-md overflow-hidden">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead className="border-b border-border/50 bg-surface/60 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-3.5">Endereço de Email</th>
                <th className="px-4 py-3.5">Falhas Rejeitadas</th>
                <th className="px-4 py-3.5">Logins com Sucesso</th>
                <th className="px-4 py-3.5">IPs de Origem</th>
                <th className="px-4 py-3.5">Última Ocorrência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {agrupamentoEmails.map((e) => (
                <tr key={e.email} className="transition hover:bg-surface-strong/60">
                  <td className="px-6 py-3.5 font-semibold text-foreground">{e.email}</td>
                  <td className="px-4 py-3.5 font-mono">
                    <span
                      className={cn(
                        e.falhas > 0 ? "text-danger font-bold" : "text-muted-foreground",
                      )}
                    >
                      {e.falhas}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-success font-bold">{e.sucessos}</td>
                  <td className="px-4 py-3.5 font-mono text-muted-foreground">
                    {e.ipsUtilizados.size} IP(s)
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[10px] text-muted-foreground">
                    {formatarData(e.ultimoAcesso, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: ARQUITETURA & LIMITES TÉCNICOS */}
      {tab === "politicas" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur-md space-y-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Lock className="size-4 text-primary" />
              Camadas de Proteção em Produção
            </h2>
            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">1. Autenticação Supabase Auth:</strong> As
                credenciais e palavras-passe são processadas diretamente pelos endpoints encriptados
                do Supabase, sem nunca passarem em texto claro por servidores intermédios.
              </p>
              <p>
                <strong className="text-foreground">2. Proteção de Formulários Públicos:</strong>{" "}
                Submissões de contacto do website utilizam locks atómicos com hash SHA256 e
                honeypots anti-bot (`contact_submission_guards`).
              </p>
              <p>
                <strong className="text-foreground">3. Limitações de Bloqueio em Frontend:</strong>{" "}
                Bloquear um IP apenas numa tabela da aplicação protege contra ações internas, mas
                não impede pacotes de rede ao nível da firewall de borda (Vercel / Cloudflare).
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-surface/50 p-6 backdrop-blur-md space-y-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="size-4 text-success" />
              Diretrizes de Segurança & RGPD
            </h2>
            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                • As palavras-passe rejeitadas <strong>nunca</strong> são armazenadas ou mostradas
                nos relatórios de auditoria.
              </p>
              <p>
                • O ecrã de login não revela a visitantes externos se determinado email de
                administrador existe ou não na base de dados.
              </p>
              <p>
                • Os registos de auditoria são confidenciais e acessíveis exclusivamente a
                utilizadores autenticados com o papel de <strong>Administrador</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sinalização */}
      {ipBloqueadoManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-border/70 bg-popover p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Sinalizar Endereço IP</h3>
            <p className="text-xs text-muted-foreground">
              O IP <span className="font-mono font-bold text-primary">{ipBloqueadoManual}</span> foi
              sinalizado para monitorização de anomalias no sistema de auditoria.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIpBloqueadoManual(null)}
                className="rounded-xl border border-border/70 px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-strong"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
