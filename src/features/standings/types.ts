import type { Division, NflStandingsView } from "@/shared/types";

export interface LeagueRow {
  logo?: string;
  logoDark?: string;
  abbreviation?: string;
  color?: string;
  id: string;
  name: string;
  rank?: number;
  record: string;
  conferenceRecord?: string;
  points?: string;
  /** Places moved since the previous poll: positive is up, negative down. */
  rankChange?: number;
  /** Ranked this poll but not in the previous one. */
  newlyRanked?: boolean;
  /** Soccer: matches played. */
  played?: string;
  /** Soccer: goal difference, e.g. "+10". */
  goalDifference?: string;
  /** Soccer: what this table position earns, e.g. "Champions League". */
  note?: string;
  /**
   * Soccer: the note of the group this row closes, shown in a small row
   * under it, e.g. "Champions League" after the last qualifying team.
   */
  noteAfter?: string;
  /**
   * Draws a separator below this row (below its note row, if it has one),
   * e.g. at a playoff cut line.
   */
  dividerAfter?: "solid" | "dashed";
}
export interface LeagueTable {
  id: string;
  title: string;
  subtitle: string;
  rows: LeagueRow[];
  /** Which NFL standings view the table belongs to; unset for college. */
  nflView?: NflStandingsView;
  /** Soccer tables rank by league points and show goal difference. */
  soccer?: boolean;
}
export type LeagueTableView = "standings" | "rankings";
export interface LeagueSource {
  loadStandings(
    division: Division,
    signal: AbortSignal,
  ): Promise<LeagueTable[]>;
  loadRankings(division: Division, signal: AbortSignal): Promise<LeagueTable[]>;
}
