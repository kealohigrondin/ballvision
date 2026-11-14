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
  /** Draws a separator below this row, e.g. at a playoff cut line. */
  dividerAfter?: "solid" | "dashed";
}
export interface LeagueTable {
  id: string;
  title: string;
  subtitle: string;
  rows: LeagueRow[];
  /** Which NFL standings view the table belongs to; unset for college. */
  nflView?: NflStandingsView;
}
export type LeagueTableView = "standings" | "rankings";
export interface LeagueSource {
  loadStandings(
    division: Division,
    signal: AbortSignal,
  ): Promise<LeagueTable[]>;
  loadRankings(division: Division, signal: AbortSignal): Promise<LeagueTable[]>;
}
