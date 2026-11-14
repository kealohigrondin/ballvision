export type Division = "fbs" | "fcs" | "nfl";
export type GameState = "live" | "upcoming" | "final" | "other";
export interface Team {
  id: string;
  name: string;
  location?: string;
  abbreviation: string;
  logo?: string;
  logoDark?: string;
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

/** A team picked from any list (standings, scores, schedules). */
export interface TeamRef {
  id: string;
  name: string;
  record: string;
  abbreviation?: string;
  logo?: string;
  logoDark?: string;
  color?: string;
}

/** Scoreboard filter chips. */
export type Filter = "all" | "live" | "upcoming" | "final" | "pinned";
/** Which page the league panel shows. */
export type PanelView = "standings" | "rankings" | "schedule";
export type NflStandingsView = "wildcard" | "division" | "conference";
