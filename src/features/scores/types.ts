import type { Division, Game, Week } from "@/shared/types";

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

export type LeaderCategory = "passing" | "rushing" | "receiving";
/** A team's top player in one stat category, with their stats in the game. */
export interface GameLeader {
  category: LeaderCategory;
  id: string;
  name: string;
  position: string;
  jersey: string;
  /** The player's team abbreviation. */
  team: string;
  headshot?: string;
  /** ESPN's stat summary, e.g. "8/9, 60 YDS". */
  stats: string;
}
export type TeamStatKey =
  | "totalYards"
  | "turnovers"
  | "firstDowns"
  | "penalties"
  | "thirdDown"
  | "fourthDown"
  | "possession";
/** One team stat for both teams: shown as text, compared by value. */
export interface TeamStatLine {
  key: TeamStatKey;
  away: string;
  home: string;
  awayValue: number;
  homeValue: number;
}
/** A score in the game, with the score after it. */
export interface ScoringPlay {
  id: string;
  /** Which team scored. */
  side: "away" | "home";
  period: number;
  /** Game clock when the play ended, e.g. "5:54". */
  clock: string;
  /** ESPN's short scoring type, e.g. "TD" or "FG". */
  type: string;
  /** ESPN's play description, e.g. "John Mateer 8 Yd Run (Tate Sandell Kick)". */
  text: string;
  awayScore: number;
  homeScore: number;
}
export interface GameSummary {
  leaders: { away: GameLeader[]; home: GameLeader[] };
  stats: TeamStatLine[];
  /** Both teams' scores, in the order they happened. */
  scoringPlays: ScoringPlay[];
}
export interface GameSummaryQuery {
  division: Division;
  gameId: string;
  awayId: string;
  homeId: string;
}
export interface GameSummarySource {
  load(query: GameSummaryQuery, signal: AbortSignal): Promise<GameSummary>;
}
