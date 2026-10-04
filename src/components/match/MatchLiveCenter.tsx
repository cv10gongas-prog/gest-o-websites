import { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Plus,
  Shield,
  Trophy,
  AlertTriangle,
  ArrowRightLeft,
  X,
  Check,
  Flame,
  Clock,
  Sparkles,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import type { ActiveMatch, MatchEventType, MatchPlayer, MatchTeam } from "@/lib/match/types";
import { MODALITY_CONFIGS } from "@/lib/match/types";
import { matchStore } from "@/lib/match/store";
import { cn } from "@/lib/utils";

export function MatchLiveCenter({ match }: { match: ActiveMatch }) {
  const [modalAberto, setModalAberto] = useState<MatchEventType | null>(null);
  const [equipaSelecionada, setEquipaSelecionada] = useState<"home" | "away">("home");
  const [jogadorId, setJogadorId] = useState<string>("");
  const [assistenteId, setAssistenteId] = useState<string>("");
  const [subSaiId, setSubSaiId] = useState<string>("");
  const [subEntraId, setSubEntraId] = useState<string>("");

  const config = MODALITY_CONFIGS[match.modality];
  const homeTeam = match.homeTeam;
  const awayTeam = match.awayTeam;

  const currentTeam = equipaSelecionada === "home" ? homeTeam : awayTeam;
  const onPitchPlayers = currentTeam.players.filter((p) => p.isOnPitch);
  const benchPlayers = currentTeam.players.filter((p) => !p.isOnPitch);

  // Formatar tempo (mm:ss)
  const minutos = Math.floor(match.elapsedSeconds / 60);
  const segundos = match.elapsedSeconds % 60;
  const tempoFormatado = `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;

  const rotuloPeriodo: Record<string, string> = {
    nao_iniciado: "Por Iniciar",
    "1parte": "1ª Parte",
    intervalo: "Intervalo",
    "2parte": "2ª Parte",
    fim_tempo_regulamentar: "Fim Tempo Regulamentar",
    prolongamento_1: "1ª Parte Prolongamento",
    prolongamento_int: "Intervalo Prolongamento",
    prolongamento_2: "2ª Parte Prolongamento",
    penaltis: "Grandes Penalidades",
    terminado: "Jogo Terminado",
  };

  function abrirModalEvento(tipo: MatchEventType, team: "home" | "away") {
    setEquipaSelecionada(team);
    const targetTeam = team === "home" ? homeTeam : awayTeam;
    const starters = targetTeam.players.filter((p) => p.isOnPitch);
    const bench = targetTeam.players.filter((p) => !p.isOnPitch);

    setJogadorId(starters[0]?.id || "");
    setAssistenteId("");
    setSubSaiId(starters[0]?.id || "");
    setSubEntraId(bench[0]?.id || "");
    setModalAberto(tipo);
  }

  function submeterEvento() {
    if (!modalAberto) return;
    const targetTeam = equipaSelecionada === "home" ? homeTeam : awayTeam;

    if (modalAberto === "substituicao") {
      if (!subSaiId || !subEntraId) {
        toast.error("Selecione o jogador que sai e o jogador que entra.");
        return;
      }
      matchStore.recordEvent({
        type: "substituicao",
        teamId: targetTeam.id,
        playerId: subEntraId,
        subOutPlayerId: subSaiId,
        subInPlayerId: subEntraId,
      });
      const sai = targetTeam.players.find((p) => p.id === subSaiId)?.name;
      const entra = targetTeam.players.find((p) => p.id === subEntraId)?.name;
      toast.success(`Substituição: Sai ${sai}, Entra ${entra}`);
    } else {
      if (!jogadorId) {
        toast.error("Selecione um jogador.");
        return;
      }
      matchStore.recordEvent({
        type: modalAberto,
        teamId: targetTeam.id,
        playerId: jogadorId,
        assistPlayerId: assistenteId || undefined,
      });

      const jog = targetTeam.players.find((p) => p.id === jogadorId)?.name;
      if (modalAberto === "golo") {
        toast.success(`⚽ GOLO! ${jog} (${targetTeam.shortName})`, { duration: 5000 });
      } else {
        toast.success(`Evento registado: ${jog}`);
      }
    }

    setModalAberto(null);
  }

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* PLACAR ELETRÓNICO PRINCIPAL COM CRONÓMETRO EM DIRETO        */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-surface/60 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* EQUIPA DA CASA */}
          <div className="flex flex-1 items-center gap-4 text-left w-full md:w-auto">
            <span
              className="grid size-14 sm:size-16 shrink-0 place-items-center rounded-2xl border border-emerald-500/40 text-xl sm:text-2xl font-black text-white shadow-lg"
              style={{ backgroundColor: homeTeam.primaryColor }}
            >
              {homeTeam.logoText || "HOM"}
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Equipa da Casa • {homeTeam.echelon}
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-foreground truncate">
                {homeTeam.name}
              </h2>
              {config.hasAccumulatedFouls && (
                <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
                  <span className="text-muted-foreground">Faltas:</span>
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.2 font-mono font-bold",
                      match.homeFoulsPeriod >= config.foulLimit
                        ? "bg-danger text-white animate-pulse"
                        : "bg-surface-strong text-foreground",
                    )}
                  >
                    {match.homeFoulsPeriod}/{config.foulLimit}
                  </span>
                  {match.homeFoulsPeriod >= config.foulLimit && (
                    <span className="text-[10px] text-danger font-bold">LIVRE 10M!</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MARCADOR & CRONÓMETRO CENTRAL */}
          <div className="flex flex-col items-center justify-center px-4 text-center">
            {/* Estado e Modalidade */}
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              <span>{config.name}</span>
              <span>•</span>
              <span className="text-emerald-400 font-extrabold">
                {rotuloPeriodo[match.periodState] || match.periodState}
              </span>
            </div>

            {/* Resultado Gigante */}
            <div className="flex items-center gap-4 sm:gap-6 font-mono font-black text-4xl sm:text-6xl tracking-tight text-foreground">
              <span className="min-w-[50px] sm:min-w-[70px] text-center">{match.homeScore}</span>
              <span className="text-muted-foreground/40 text-3xl sm:text-4xl">-</span>
              <span className="min-w-[50px] sm:min-w-[70px] text-center">{match.awayScore}</span>
            </div>

            {/* Cronómetro Grande */}
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/80 bg-background/80 px-4 py-1.5 shadow-inner">
              <Clock
                className={cn(
                  "size-4",
                  match.isRunning ? "text-emerald-400 animate-spin" : "text-muted-foreground",
                )}
              />
              <span className="font-mono text-xl sm:text-2xl font-black text-foreground tracking-wider">
                {tempoFormatado}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">
                / {match.periodMinutes}m
              </span>
            </div>

            {/* Controlos do Relógio */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => matchStore.toggleTimer()}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-md active:scale-95",
                  match.isRunning
                    ? "bg-warning text-black hover:bg-warning/90"
                    : "bg-emerald-500 text-white hover:bg-emerald-600",
                )}
              >
                {match.isRunning ? (
                  <>
                    <Pause className="size-3.5 fill-current" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 fill-current" />
                    <span>Iniciar Cronómetro</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => matchStore.advancePeriod()}
                className="flex items-center gap-1 rounded-xl border border-border/80 bg-surface/80 px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-strong transition"
                title="Avançar Período (1ªP -> Int -> 2ªP -> Fim)"
              >
                <FastForward className="size-3.5" />
                <span className="hidden sm:inline">Próxima Fase</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm("Tens a certeza que queres reiniciar o tempo do período atual?")) {
                    matchStore.resetCurrentPeriod();
                  }
                }}
                className="grid size-8 place-items-center rounded-xl border border-border/80 bg-surface/80 text-muted-foreground hover:text-foreground transition"
                title="Repor 00:00"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          </div>

          {/* EQUIPA VISITANTE */}
          <div className="flex flex-1 items-center justify-end gap-4 text-right w-full md:w-auto">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                Visitante • {awayTeam.echelon}
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-foreground truncate">
                {awayTeam.name}
              </h2>
              {config.hasAccumulatedFouls && (
                <div className="mt-1 flex items-center justify-end gap-1.5 text-xs font-semibold">
                  {match.awayFoulsPeriod >= config.foulLimit && (
                    <span className="text-[10px] text-danger font-bold">LIVRE 10M!</span>
                  )}
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.2 font-mono font-bold",
                      match.awayFoulsPeriod >= config.foulLimit
                        ? "bg-danger text-white animate-pulse"
                        : "bg-surface-strong text-foreground",
                    )}
                  >
                    {match.awayFoulsPeriod}/{config.foulLimit}
                  </span>
                  <span className="text-muted-foreground">Faltas:</span>
                </div>
              )}
            </div>
            <span
              className="grid size-14 sm:size-16 shrink-0 place-items-center rounded-2xl border border-sky-500/40 text-xl sm:text-2xl font-black text-white shadow-lg"
              style={{ backgroundColor: awayTeam.primaryColor }}
            >
              {awayTeam.logoText || "AWY"}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTÕES DE AÇÃO RÁPIDA (PARA O TREINADOR / ANALISTA REGISTAR)  */}
      {/* ============================================================ */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* AÇÕES DA CASA */}
        <div className="rounded-3xl border border-emerald-500/30 bg-surface/40 p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              Ações Rápidas: {homeTeam.name}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {homeTeam.players.filter((p) => p.isOnPitch).length} atletas em campo
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => abrirModalEvento("golo", "home")}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-3 font-bold text-emerald-300 transition hover:bg-emerald-500 hover:text-black active:scale-95 shadow-sm"
            >
              <span className="text-xl">⚽</span>
              <span className="text-xs">GOLO</span>
            </button>

            <button
              type="button"
              onClick={() => abrirModalEvento("remate_baliza", "home")}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-surface/80 border border-border/80 p-3 font-semibold text-foreground transition hover:border-emerald-500 hover:bg-surface-strong active:scale-95"
            >
              <span className="text-xl">🎯</span>
              <span className="text-xs">Remate Baliza</span>
            </button>

            <button
              type="button"
              onClick={() => abrirModalEvento("remate_fora", "home")}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-surface/80 border border-border/80 p-3 font-semibold text-foreground transition hover:border-emerald-500 hover:bg-surface-strong active:scale-95"
            >
              <span className="text-xl">💨</span>
              <span className="text-xs">Remate Fora</span>
            </button>

            <button
              type="button"
              onClick={() => abrirModalEvento("falta", "home")}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-surface/80 border border-border/80 p-2.5 font-semibold text-warning transition hover:bg-warning/10 active:scale-95"
            >
              <span className="text-lg">⚠️</span>
              <span className="text-[11px]">Falta Cometida</span>
            </button>

            <button
              type="button"
              onClick={() => abrirModalEvento("amarelo", "home")}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-surface/80 border border-yellow-500/40 p-2.5 font-semibold text-yellow-400 transition hover:bg-yellow-500/20 active:scale-95"
            >
              <span className="text-lg">🟨</span>
              <span className="text-[11px]">Amarelo</span>
            </button>

            <button
              type="button"
              onClick={() => abrirModalEvento("substituicao", "home")}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-surface/80 border border-cyan-500/40 p-2.5 font-semibold text-cyan-300 transition hover:bg-cyan-500/20 active:scale-95"
            >
              <ArrowRightLeft className="size-4" />
              <span className="text-[11px]">Substituição</span>
            </button>
          </div>
        </div>

        {/* AÇÕES DO VISITANTE */}
        <div className="rounded-3xl border border-sky-500/30 bg-surface/40 p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-sky-500" />
              Ações Rápidas: {awayTeam.name}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {awayTeam.players.filter((p) => p.isOnPitch).length} atletas em campo
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => abrirModalEvento("golo", "away")}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-sky-500/20 border border-sky-500/40 p-3 font-bold text-sky-300 transition hover:bg-sky-500 hover:text-black active:scale-95 shadow-sm"
            >
              <span className="text-xl">⚽</span>
              <span className="text-xs">GOLO</span>
            </button>

            <button
              type="button"
              onClick={() => abrirModalEvento("remate_baliza", "away")}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-surface/80 border border-border/80 p-3 font-semibold text-foreground transition hover:border-sky-500 hover:bg-surface-strong active:scale-95"
            >
              <span className="text-xl">🎯</span>
              <span className="text-xs">Remate Baliza</span>
            </button>

            <button
              type="button"
              onClick={() => abrirModalEvento("remate_fora", "away")}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-surface/80 border border-border/80 p-3 font-semibold text-foreground transition hover:border-sky-500 hover:bg-surface-strong active:scale-95"
            >
              <span className="text-xl">💨</span>
              <span className="text-xs">Remate Fora</span>
            </button>

            <button
              type="button"
              onClick={() => abrirModalEvento("falta", "away")}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-surface/80 border border-border/80 p-2.5 font-semibold text-warning transition hover:bg-warning/10 active:scale-95"
            >
              <span className="text-lg">⚠️</span>
              <span className="text-[11px]">Falta Cometida</span>
            </button>

            <button
              type="button"
              onClick={() => abrirModalEvento("amarelo", "away")}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-surface/80 border border-yellow-500/40 p-2.5 font-semibold text-yellow-400 transition hover:bg-yellow-500/20 active:scale-95"
            >
              <span className="text-lg">🟨</span>
              <span className="text-[11px]">Amarelo</span>
            </button>

            <button
              type="button"
              onClick={() => abrirModalEvento("substituicao", "away")}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-surface/80 border border-cyan-500/40 p-2.5 font-semibold text-cyan-300 transition hover:bg-cyan-500/20 active:scale-95"
            >
              <ArrowRightLeft className="size-4" />
              <span className="text-[11px]">Substituição</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CRONOLOGIA EM DIRETO & ATLETAS EM CAMPO                      */}
      {/* ============================================================ */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ATLETAS EM CAMPO (DISPOSIÇÃO TÁTICA & DESEMPENHO) */}
        <div className="rounded-3xl border border-border/70 bg-surface/40 p-6 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Shield className="size-4 text-emerald-400" />
              Atletas em Campo ({homeTeam.name})
            </h3>
            <span className="text-xs font-semibold text-muted-foreground">
              {config.playersOnPitch} Titulares
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {homeTeam.players
              .filter((p) => p.isOnPitch)
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface/70 p-3 transition hover:border-emerald-500/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="grid size-8 place-items-center rounded-xl bg-emerald-500/15 font-mono text-xs font-bold text-emerald-400">
                      {p.number}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground font-semibold">
                        {p.position} • {p.stats.minutesPlayed}'
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {p.stats.goals > 0 && (
                      <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[10px] font-bold text-emerald-400">
                        ⚽ {p.stats.goals}
                      </span>
                    )}
                    {p.stats.yellowCards > 0 && (
                      <span className="rounded bg-yellow-500/20 px-1 py-0.2 text-[10px] font-bold text-yellow-400">
                        🟨 {p.stats.yellowCards}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* BANCO DE SUPLENTES */}
          <div className="pt-2 border-t border-border/40">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Suplentes Disponíveis ({homeTeam.players.filter((p) => !p.isOnPitch).length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {homeTeam.players
                .filter((p) => !p.isOnPitch)
                .map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-surface/50 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    <span className="font-mono font-bold text-foreground">#{p.number}</span>
                    <span>{p.name.split(" ").slice(-1)[0]}</span>
                    <span className="text-[10px] opacity-60">({p.position})</span>
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* CRONOLOGIA / TIMELINE DE EVENTOS DO JOGO */}
        <div className="rounded-3xl border border-border/70 bg-surface/40 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Clock className="size-4 text-emerald-400" />
                Cronologia do Jogo
              </h3>
              <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {match.events.length} Acontecimentos
              </span>
            </div>

            {match.events.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <p>Nenhum evento registado ainda.</p>
                <p className="text-[10px] mt-1 opacity-70">
                  Usa os botões de ação rápida para registar golos, remates e faltas.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {match.events.map((evt) => {
                  const isHome = evt.teamId === homeTeam.id;
                  const team = isHome ? homeTeam : awayTeam;
                  const player = team.players.find((p) => p.id === evt.playerId);
                  const assist = team.players.find((p) => p.id === evt.assistPlayerId);
                  const subSai = team.players.find((p) => p.id === evt.subOutPlayerId);
                  const subEntra = team.players.find((p) => p.id === evt.subInPlayerId);

                  return (
                    <div
                      key={evt.id}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-2xl border p-2.5 text-xs transition",
                        evt.type === "golo"
                          ? "border-emerald-500/40 bg-emerald-500/10"
                          : "border-border/60 bg-surface/70",
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono font-bold text-[11px] text-muted-foreground shrink-0">
                          {evt.minute}'
                        </span>

                        <span className="text-base shrink-0">
                          {evt.type === "golo" && "⚽"}
                          {evt.type === "remate_baliza" && "🎯"}
                          {evt.type === "remate_fora" && "💨"}
                          {evt.type === "falta" && "⚠️"}
                          {evt.type === "amarelo" && "🟨"}
                          {evt.type === "vermelho" && "🟥"}
                          {evt.type === "azul" && "🟦"}
                          {evt.type === "substituicao" && "🔄"}
                        </span>

                        <div className="min-w-0 truncate">
                          <span className="font-bold text-foreground">
                            {evt.type === "substituicao"
                              ? `Entra ${subEntra?.name ?? "Atleta"} (Sai ${subSai?.name ?? "Atleta"})`
                              : `${player?.name ?? "Jogador"}`}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-1.5">
                            ({team.shortName})
                          </span>
                          {assist && (
                            <div className="text-[10px] text-emerald-400 font-semibold">
                              Assistência: {assist.name}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => matchStore.removeEvent(evt.id)}
                        className="text-muted-foreground hover:text-danger p-1 transition"
                        title="Anular Acontecimento"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 text-[10px] text-center text-muted-foreground">
            Sincronização em tempo real do cronómetro e estatísticas
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL UNIVERSAL DE REGISTO DE EVENTO                         */}
      {/* ============================================================ */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground capitalize flex items-center gap-2">
                <span>Registar {modalAberto.replace("_", " ")}</span>
                <span className="text-xs text-muted-foreground">({currentTeam.name})</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* SE FOR SUBSTITUIÇÃO */}
            {modalAberto === "substituicao" ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-danger mb-1">
                    Jogador que SAI do campo:
                  </label>
                  <select
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none"
                    value={subSaiId}
                    onChange={(e) => setSubSaiId(e.target.value)}
                  >
                    {onPitchPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} — {p.name} ({p.position})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-success mb-1">
                    Jogador que ENTRA do banco:
                  </label>
                  <select
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none"
                    value={subEntraId}
                    onChange={(e) => setSubEntraId(e.target.value)}
                  >
                    {benchPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} — {p.name} ({p.position})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              /* OUTROS EVENTOS (GOLO, REMATES, CARTÕES, FALTAS) */
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Jogador Principal:
                  </label>
                  <select
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none"
                    value={jogadorId}
                    onChange={(e) => setJogadorId(e.target.value)}
                  >
                    {onPitchPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} — {p.name} ({p.position})
                      </option>
                    ))}
                  </select>
                </div>

                {modalAberto === "golo" && (
                  <div>
                    <label className="block font-semibold text-emerald-400 mb-1">
                      Assistência (Opcional):
                    </label>
                    <select
                      className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none"
                      value={assistenteId}
                      onChange={(e) => setAssistenteId(e.target.value)}
                    >
                      <option value="">Sem assistência direta</option>
                      {onPitchPlayers
                        .filter((p) => p.id !== jogadorId)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            #{p.number} — {p.name} ({p.position})
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalAberto(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-surface-strong"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={submeterEvento}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
              >
                Confirmar Acontecimento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
