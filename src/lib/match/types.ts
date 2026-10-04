export type MatchModality = "futebol11" | "futebol9" | "futebol7" | "futsal";

export type MatchPosition =
  | "GR"
  | "DC"
  | "DD"
  | "DE"
  | "MDF"
  | "MC"
  | "MO"
  | "EXT"
  | "PL"
  | "FIXO"
  | "ALA"
  | "PIVOT"
  | "UNIVERSAL";

export type ModalityRules = {
  name: string;
  code: MatchModality;
  playersOnPitch: number;
  minPlayersOnPitch: number;
  defaultPeriodMinutes: number;
  totalPeriods: number;
  hasAccumulatedFouls: boolean;
  foulLimit: number; // e.g. 5 faltas -> 6ª é livre direto 10m no futsal
  hasBlueCard: boolean;
  rollingSubstitutions: boolean;
  description: string;
};

export const MODALITY_CONFIGS: Record<MatchModality, ModalityRules> = {
  futebol11: {
    name: "Futebol de 11",
    code: "futebol11",
    playersOnPitch: 11,
    minPlayersOnPitch: 7,
    defaultPeriodMinutes: 45,
    totalPeriods: 2,
    hasAccumulatedFouls: false,
    foulLimit: 0,
    hasBlueCard: false,
    rollingSubstitutions: false,
    description: "2 partes de 45m, 11 titulares, 5 substituições em 3 paragens.",
  },
  futebol9: {
    name: "Futebol de 9",
    code: "futebol9",
    playersOnPitch: 9,
    minPlayersOnPitch: 6,
    defaultPeriodMinutes: 35,
    totalPeriods: 2,
    hasAccumulatedFouls: false,
    foulLimit: 0,
    hasBlueCard: false,
    rollingSubstitutions: true,
    description: "2 partes de 35m, 9 titulares, escalões Infantis/Iniciados.",
  },
  futebol7: {
    name: "Futebol de 7",
    code: "futebol7",
    playersOnPitch: 7,
    minPlayersOnPitch: 5,
    defaultPeriodMinutes: 25,
    totalPeriods: 2,
    hasAccumulatedFouls: false,
    foulLimit: 0,
    hasBlueCard: true,
    rollingSubstitutions: true,
    description: "2 partes de 25m, 7 titulares, substituições volantes na formação.",
  },
  futsal: {
    name: "Futsal Oficial",
    code: "futsal",
    playersOnPitch: 5,
    minPlayersOnPitch: 3,
    defaultPeriodMinutes: 20,
    totalPeriods: 2,
    hasAccumulatedFouls: true,
    foulLimit: 5,
    hasBlueCard: false,
    rollingSubstitutions: true,
    description:
      "2 partes de 20m (tempo útil), 5 titulares, faltas acumuladas e tiro direto de 10m.",
  },
};

export type PlayerStats = {
  minutesPlayed: number;
  goals: number;
  assists: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  foulsCommitted: number;
  foulsReceived: number;
  yellowCards: number;
  redCards: number;
  blueCards: number;
  saves?: number;
};

export type MatchPlayer = {
  id: string;
  name: string;
  nickname?: string;
  number: number;
  position: MatchPosition;
  isStarter: boolean;
  isOnPitch: boolean;
  stats: PlayerStats;
};

export type MatchTeam = {
  id: string;
  name: string;
  shortName: string;
  echelon: string; // "Sub-13", "Sub-15", "Seniores", etc.
  primaryColor: string;
  secondaryColor: string;
  logoText: string;
  players: MatchPlayer[];
};

export type MatchEventType =
  | "golo"
  | "autogolo"
  | "remate_baliza"
  | "remate_fora"
  | "falta"
  | "amarelo"
  | "vermelho"
  | "azul"
  | "substituicao"
  | "penalti_marcado"
  | "penalti_falhado"
  | "tiro_10m";

export type MatchEvent = {
  id: string;
  matchId: string;
  timestampSeconds: number;
  period: number;
  minute: number;
  type: MatchEventType;
  teamId: string;
  playerId: string;
  assistPlayerId?: string;
  subInPlayerId?: string;
  subOutPlayerId?: string;
  notes?: string;
  createdAt: string;
};

export type MatchPeriodState =
  | "nao_iniciado"
  | "1parte"
  | "intervalo"
  | "2parte"
  | "fim_tempo_regulamentar"
  | "prolongamento_1"
  | "prolongamento_int"
  | "prolongamento_2"
  | "penaltis"
  | "terminado";

export type ActiveMatch = {
  id: string;
  title: string;
  competition: string;
  location: string;
  modality: MatchModality;
  periodMinutes: number;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  homeScore: number;
  awayScore: number;
  homeFoulsPeriod: number;
  awayFoulsPeriod: number;
  periodState: MatchPeriodState;
  currentPeriod: number;
  elapsedSeconds: number; // segundos no período atual
  totalElapsedSeconds: number; // segundos totais de jogo
  isRunning: boolean;
  events: MatchEvent[];
  createdAt: string;
  updatedAt: string;
};
