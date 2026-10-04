import { useState, useEffect } from "react";
import type {
  ActiveMatch,
  MatchEvent,
  MatchEventType,
  MatchModality,
  MatchPeriodState,
  MatchPlayer,
  MatchTeam,
} from "./types";
import { createDefaultMatch } from "./sample-data";

const STORAGE_KEY = "nws_match_active_v1";
const MATCH_HISTORY_KEY = "nws_match_history_v1";

class MatchStore {
  private match: ActiveMatch;
  private listeners = new Set<() => void>();
  private timerInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.match = this.loadFromStorage();
    this.startTicker();
  }

  private loadFromStorage(): ActiveMatch {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id && parsed.homeTeam) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("[MatchStore] Erro ao carregar jogo guardado:", e);
      }
    }
    return createDefaultMatch("futsal");
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.match));
      } catch (e) {
        console.error("[MatchStore] Erro ao guardar jogo:", e);
      }
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getSnapshot(): ActiveMatch {
    return this.match;
  }

  private startTicker() {
    if (typeof window === "undefined") return;
    setInterval(() => {
      if (this.match.isRunning) {
        const maxSeconds = this.match.periodMinutes * 60;
        // Não ultrapassa o tempo limite do período sem acréscimos intencionais
        this.match = {
          ...this.match,
          elapsedSeconds: this.match.elapsedSeconds + 1,
          totalElapsedSeconds: this.match.totalElapsedSeconds + 1,
          updatedAt: new Date().toISOString(),
        };

        // Atualizar minutos jogados por atletas em campo a cada 60s
        if (this.match.elapsedSeconds % 60 === 0) {
          this.incrementMinutesPlayed();
        }

        this.saveToStorage();
      }
    }, 1000);
  }

  private incrementMinutesPlayed() {
    const updatePlayers = (players: MatchPlayer[]) =>
      players.map((p) =>
        p.isOnPitch ? { ...p, stats: { ...p.stats, minutesPlayed: p.stats.minutesPlayed + 1 } } : p,
      );

    this.match = {
      ...this.match,
      homeTeam: { ...this.match.homeTeam, players: updatePlayers(this.match.homeTeam.players) },
      awayTeam: { ...this.match.awayTeam, players: updatePlayers(this.match.awayTeam.players) },
    };
  }

  // ==========================================
  // CONTROLOS DO TEMPO DE JOGO
  // ==========================================

  public toggleTimer() {
    if (this.match.periodState === "nao_iniciado") {
      this.match.periodState = "1parte";
      this.match.currentPeriod = 1;
    }
    this.match = {
      ...this.match,
      isRunning: !this.match.isRunning,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
  }

  public setRunning(running: boolean) {
    this.match = {
      ...this.match,
      isRunning: running,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
  }

  public advancePeriod() {
    let nextState: MatchPeriodState = this.match.periodState;
    let nextPeriod = this.match.currentPeriod;
    const nextElapsed = 0;
    const running = false;

    switch (this.match.periodState) {
      case "nao_iniciado":
        nextState = "1parte";
        nextPeriod = 1;
        break;
      case "1parte":
        nextState = "intervalo";
        break;
      case "intervalo":
        nextState = "2parte";
        nextPeriod = 2;
        // No futsal, as faltas acumuladas reiniciam na 2ª parte
        this.match.homeFoulsPeriod = 0;
        this.match.awayFoulsPeriod = 0;
        break;
      case "2parte":
        nextState = "fim_tempo_regulamentar";
        break;
      case "fim_tempo_regulamentar":
        nextState = "prolongamento_1";
        nextPeriod = 3;
        break;
      case "prolongamento_1":
        nextState = "prolongamento_int";
        break;
      case "prolongamento_int":
        nextState = "prolongamento_2";
        nextPeriod = 4;
        break;
      case "prolongamento_2":
        nextState = "penaltis";
        break;
      case "penaltis":
      default:
        nextState = "terminado";
        break;
    }

    this.match = {
      ...this.match,
      periodState: nextState,
      currentPeriod: nextPeriod,
      elapsedSeconds: nextElapsed,
      isRunning: running,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
  }

  public setElapsedSeconds(seconds: number) {
    this.match = {
      ...this.match,
      elapsedSeconds: Math.max(0, seconds),
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
  }

  public resetCurrentPeriod() {
    this.match = {
      ...this.match,
      elapsedSeconds: 0,
      isRunning: false,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
  }

  // ==========================================
  // REGISTO DE EVENTOS EM DIRETO
  // ==========================================

  public recordEvent(payload: {
    type: MatchEventType;
    teamId: string;
    playerId: string;
    assistPlayerId?: string;
    subInPlayerId?: string;
    subOutPlayerId?: string;
    notes?: string;
  }) {
    const currentMin = Math.floor(this.match.elapsedSeconds / 60) + 1;
    const isHome = payload.teamId === this.match.homeTeam.id;

    const newEvent: MatchEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      matchId: this.match.id,
      timestampSeconds: this.match.totalElapsedSeconds,
      period: this.match.currentPeriod,
      minute: currentMin,
      type: payload.type,
      teamId: payload.teamId,
      playerId: payload.playerId,
      assistPlayerId: payload.assistPlayerId,
      subInPlayerId: payload.subInPlayerId,
      subOutPlayerId: payload.subOutPlayerId,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    };

    let homeScore = this.match.homeScore;
    let awayScore = this.match.awayScore;
    let homeFouls = this.match.homeFoulsPeriod;
    let awayFouls = this.match.awayFoulsPeriod;

    // Atualização de Placar e Faltas
    if (
      payload.type === "golo" ||
      payload.type === "penalti_marcado" ||
      payload.type === "tiro_10m"
    ) {
      if (isHome) homeScore += 1;
      else awayScore += 1;
    } else if (payload.type === "autogolo") {
      if (isHome)
        awayScore += 1; // Autogolo da equipa da casa beneficia visitante
      else homeScore += 1;
    } else if (payload.type === "falta") {
      if (isHome) homeFouls += 1;
      else awayFouls += 1;
    }

    // Atualização de Estatísticas Individuais dos Jogadores
    const updateTeamPlayers = (team: MatchTeam): MatchTeam => {
      const isTargetTeam = team.id === payload.teamId;

      const updatedPlayers = team.players.map((p: MatchPlayer) => {
        const stats = { ...p.stats };
        let isOnPitch = p.isOnPitch;

        if (isTargetTeam && p.id === payload.playerId) {
          switch (payload.type) {
            case "golo":
            case "penalti_marcado":
            case "tiro_10m":
              stats.goals += 1;
              stats.shotsOnTarget += 1;
              break;
            case "remate_baliza":
              stats.shotsOnTarget += 1;
              break;
            case "remate_fora":
            case "penalti_falhado":
              stats.shotsOffTarget += 1;
              break;
            case "falta":
              stats.foulsCommitted += 1;
              break;
            case "amarelo":
              stats.yellowCards += 1;
              break;
            case "vermelho":
              stats.redCards += 1;
              isOnPitch = false; // Expulso
              break;
            case "azul":
              stats.blueCards += 1;
              break;
          }
        }

        if (isTargetTeam && payload.assistPlayerId && p.id === payload.assistPlayerId) {
          stats.assists += 1;
        }

        // Gestão de Substituição
        if (isTargetTeam && payload.type === "substituicao") {
          if (p.id === payload.subInPlayerId) {
            isOnPitch = true;
          }
          if (p.id === payload.subOutPlayerId) {
            isOnPitch = false;
          }
        }

        return { ...p, isOnPitch, stats };
      });

      return { ...team, players: updatedPlayers };
    };

    this.match = {
      ...this.match,
      homeScore,
      awayScore,
      homeFoulsPeriod: homeFouls,
      awayFoulsPeriod: awayFouls,
      homeTeam: updateTeamPlayers(this.match.homeTeam),
      awayTeam: updateTeamPlayers(this.match.awayTeam),
      events: [newEvent, ...this.match.events],
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage();
  }

  public removeEvent(eventId: string) {
    const event = this.match.events.find((e) => e.id === eventId);
    if (!event) return;

    let homeScore = this.match.homeScore;
    let awayScore = this.match.awayScore;
    const isHome = event.teamId === this.match.homeTeam.id;

    if (event.type === "golo" || event.type === "penalti_marcado" || event.type === "tiro_10m") {
      if (isHome) homeScore = Math.max(0, homeScore - 1);
      else awayScore = Math.max(0, awayScore - 1);
    } else if (event.type === "autogolo") {
      if (isHome) awayScore = Math.max(0, awayScore - 1);
      else homeScore = Math.max(0, homeScore - 1);
    }

    this.match = {
      ...this.match,
      homeScore,
      awayScore,
      events: this.match.events.filter((e) => e.id !== eventId),
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
  }

  public resetMatch(modality?: MatchModality) {
    this.match = createDefaultMatch(modality || this.match.modality);
    this.saveToStorage();
  }

  public startNewMatch(custom: {
    title: string;
    competition: string;
    location: string;
    modality: MatchModality;
    homeTeamName: string;
    awayTeamName: string;
    homeColor?: string;
    awayColor?: string;
    periodMinutes?: number;
  }) {
    const base = createDefaultMatch(custom.modality);
    this.match = {
      ...base,
      title: custom.title,
      competition: custom.competition,
      location: custom.location,
      modality: custom.modality,
      periodMinutes: custom.periodMinutes ?? base.periodMinutes,
      homeTeam: {
        ...base.homeTeam,
        name: custom.homeTeamName,
        shortName: custom.homeTeamName.slice(0, 3).toUpperCase(),
        primaryColor: custom.homeColor || base.homeTeam.primaryColor,
      },
      awayTeam: {
        ...base.awayTeam,
        name: custom.awayTeamName,
        shortName: custom.awayTeamName.slice(0, 3).toUpperCase(),
        primaryColor: custom.awayColor || base.awayTeam.primaryColor,
      },
    };
    this.saveToStorage();
  }
}

export const matchStore = new MatchStore();

export function useMatch(): ActiveMatch {
  const [match, setMatch] = useState<ActiveMatch>(() => matchStore.getSnapshot());

  useEffect(() => {
    return matchStore.subscribe(() => {
      setMatch(matchStore.getSnapshot());
    });
  }, []);

  return match;
}
