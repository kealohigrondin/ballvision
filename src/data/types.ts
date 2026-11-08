export type Division = "fbs" | "fcs" | "nfl";
export type GameState = "live" | "upcoming" | "final" | "other";
export interface Team {
  id: string;
  name: string;
  location?: string;
  abbreviation: string;
  logo?: string;
  color: string;
  score: string;
  rank?: number;
  record?: string;
  conferenceId?: string;
  quarters: string[];
}
export interface Game {
  id: string;
  home: Team;
  away: Team;
  state: GameState;
  status: string;
  clock: string;
  period: number;
  start: string;
  broadcast: string;
  venue: string;
  possession?: string;
  situation: string;
  lastPlay: string;
  redZone: boolean;
  homeTimeouts?: number;
  awayTimeouts?: number;
}
export interface ScoreboardQuery {
  date: string;
  division: Division;
}
export interface ScoreboardSource {
  load(query: ScoreboardQuery, signal: AbortSignal): Promise<Game[]>;
}

export interface LeagueRow {
  logo?: string;
  abbreviation?: string;
  color?: string;
  id: string;
  name: string;
  rank?: number;
  record: string;
  conferenceRecord?: string;
  points?: string;
}
export interface LeagueTable {
  id: string;
  title: string;
  subtitle: string;
  rows: LeagueRow[];
}
export interface LeagueSource {
  loadStandings(
    division: Division,
    signal: AbortSignal,
  ): Promise<LeagueTable[]>;
  loadRankings(division: Division, signal: AbortSignal): Promise<LeagueTable[]>;
}

export interface TeamScheduleGame extends Game {
  timeConfirmed: boolean;
  neutralSite: boolean;
}
export interface TeamSchedule {
  season: string;
  games: TeamScheduleGame[];
}
export interface TeamScheduleSource {
  load(
    query: { division: Division; teamId: string },
    signal: AbortSignal,
  ): Promise<TeamSchedule>;
}

export interface GameOdds {
  source: "Polymarket";
  url: string;
  awayTokenId: string;
  homeTokenId: string;
  awayProbability: number;
  homeProbability: number;
  updatedAt: number;
}
export type GameOddsMap = Record<string, GameOdds>;
export interface OddsQuery {
  division: Division;
  games: readonly Game[];
}
export interface OddsSource {
  load(query: OddsQuery, signal: AbortSignal): Promise<GameOddsMap>;
}

export type OddsHistoryRange = "1h" | "6h" | "1d";
export interface OddsHistoryPoint {
  timestamp: number;
  probability: number;
}
export interface OddsHistory {
  away: OddsHistoryPoint[];
  home: OddsHistoryPoint[];
}
export interface OddsHistoryQuery {
  awayTokenId: string;
  homeTokenId: string;
  range: OddsHistoryRange;
}
export interface OddsHistorySource {
  load(query: OddsHistoryQuery, signal: AbortSignal): Promise<OddsHistory>;
}
