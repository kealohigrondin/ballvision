export type Division = "fbs" | "fcs" | "nfl";
export type GameState = "live" | "upcoming" | "final" | "other";
export interface Team {
  id: string;
  name: string;
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
export interface Week {
  id: string;
  label: string;
  group: string;
  detail: string;
  year: number;
  seasonType: number;
  number: number;
}
export interface SeasonCalendar {
  weeks: Week[];
  currentWeekId?: string;
}
export interface ScoreboardQuery {
  division: Division;
  /** `null` asks the provider for its current week. */
  week: Week | null;
}
export interface ScoreboardSource {
  load(query: ScoreboardQuery, signal: AbortSignal): Promise<Game[]>;
  loadCalendar(
    division: Division,
    signal: AbortSignal,
  ): Promise<SeasonCalendar>;
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
