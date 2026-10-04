import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Trophy,
  Activity,
  FileSpreadsheet,
  Plus,
  RotateCcw,
  Sparkles,
  Layers,
  Shield,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";
import { useMatch, matchStore } from "@/lib/match/store";
import { MatchLiveCenter } from "@/components/match/MatchLiveCenter";
import { MatchReport } from "@/components/match/MatchReport";
import { NewMatchModal } from "@/components/match/NewMatchModal";
import { MODALITY_CONFIGS, type MatchModality } from "@/lib/match/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/produtos/match")({
  head: () => ({
    meta: [
      { title: "NWS Match — Futebol (11, 9, 7) & Futsal — Nova Web Studio" },
      {
        name: "description",
        content:
          "Plataforma desportiva profissional para controlo de jogos em direto, cronómetros, estatísticas e relatórios técnicos.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MatchApp,
});

type TabMatch = "live" | "relatorio" | "regras";

function MatchApp() {
  const match = useMatch();
  const [tab, setTab] = useState<TabMatch>("live");
  const [modalNovoJogo, setModalNovoJogo] = useState(false);

  const config = MODALITY_CONFIGS[match.modality];

  return (
    <div className="space-y-6 max-w-[1550px] mx-auto">
      {/* CABEÇALHO DA APLICAÇÃO NWS MATCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Trophy className="size-4" />
            <span>NWS Match • Plataforma Desportiva</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              {config.name}
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {match.title}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {match.competition} • {match.location}
          </p>
        </div>

        {/* AÇÕES DE CABEÇALHO */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (confirm("Deseja repor os dados do jogo de demonstração?")) {
                matchStore.resetMatch();
                toast.info("Jogo reposto para o estado inicial de demonstração.");
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-surface/60 px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-surface-strong hover:text-foreground transition"
            title="Repor Jogo de Demonstração"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Repor Jogo</span>
          </button>

          <button
            type="button"
            onClick={() => setModalNovoJogo(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 active:scale-95"
          >
            <Plus className="size-4" />
            <span>Novo Jogo (4 Modalidades)</span>
          </button>
        </div>
      </div>

      {/* SEPARADORES DE NAVEGAÇÃO DO MATCH */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/70 bg-surface/50 p-1.5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setTab("live")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "live"
              ? "bg-emerald-500 text-white shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <Activity className="size-3.5" />
          <span>1. Painel em Direto & Cronómetro</span>
          {match.isRunning && <span className="size-2 rounded-full bg-white animate-ping" />}
        </button>

        <button
          type="button"
          onClick={() => setTab("relatorio")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "relatorio"
              ? "bg-emerald-500 text-white shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <FileSpreadsheet className="size-3.5" />
          <span>2. Relatório Técnico & Estatísticas</span>
          {match.events.length > 0 && (
            <span className="rounded-full bg-surface-strong px-1.5 py-0.2 text-[9px] text-muted-foreground">
              {match.events.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab("regras")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
            tab === "regras"
              ? "bg-emerald-500 text-white shadow-sm"
              : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
          )}
        >
          <Layers className="size-3.5" />
          <span>3. Modalidades & Regras Oficiais</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* CONTEÚDO DOS SEPARADORES                                     */}
      {/* ============================================================ */}

      {/* 1. PAINEL EM DIRETO */}
      {tab === "live" && <MatchLiveCenter match={match} />}

      {/* 2. RELATÓRIO E ESTATÍSTICAS */}
      {tab === "relatorio" && <MatchReport match={match} />}

      {/* 3. REGRAS E MODALIDADES */}
      {tab === "regras" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-emerald-500/30 bg-surface/50 p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-foreground">
              Configurações Regulamentares das 4 Modalidades
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              O NWS Match adapta o cronómetro, as faltas acumuladas e os controlos táticos à
              modalidade selecionada.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(MODALITY_CONFIGS) as MatchModality[]).map((key) => {
              const cfg = MODALITY_CONFIGS[key];
              const isAtiva = match.modality === key;

              return (
                <div
                  key={key}
                  className={cn(
                    "rounded-3xl border p-6 backdrop-blur-md space-y-3 transition",
                    isAtiva
                      ? "border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                      : "border-border/70 bg-surface/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-2xl bg-emerald-500/20 font-mono text-sm font-bold text-emerald-400">
                      {cfg.playersOnPitch}v{cfg.playersOnPitch}
                    </span>
                    {isAtiva && (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                        Em Jogo
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-foreground">{cfg.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cfg.description}</p>

                  <div className="pt-3 border-t border-border/40 space-y-1.5 text-[11px] text-muted-foreground">
                    <div>
                      • <strong>Duração:</strong> {cfg.totalPeriods} partes de{" "}
                      {cfg.defaultPeriodMinutes} min
                    </div>
                    <div>
                      • <strong>Titulares:</strong> {cfg.playersOnPitch} atletas
                    </div>
                    <div>
                      • <strong>Faltas Acumuladas:</strong>{" "}
                      {cfg.hasAccumulatedFouls ? "Sim (Livre 10m à 6ª)" : "Não"}
                    </div>
                    <div>
                      • <strong>Substituições:</strong>{" "}
                      {cfg.rollingSubstitutions
                        ? "Volantes / Ilimitadas"
                        : "Por paragem regulamentar"}
                    </div>
                  </div>

                  {!isAtiva && (
                    <button
                      type="button"
                      onClick={() => {
                        matchStore.resetMatch(key);
                        toast.success(`Modalidade alterada para ${cfg.name}`);
                      }}
                      className="mt-2 w-full rounded-xl border border-emerald-500/30 bg-surface/80 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
                    >
                      Trocar para {cfg.name}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL NOVO JOGO */}
      <NewMatchModal aberto={modalNovoJogo} onFechar={() => setModalNovoJogo(false)} />
    </div>
  );
}
