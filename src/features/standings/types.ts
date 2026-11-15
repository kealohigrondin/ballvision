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
   * Draws a separator below this row,
   * e.g. at a playoff cut line.
   */
  dividerAfter?: "solid" | "dashed";
}
/** Soccer: a run of table positions that earn the same thing. */
export interface LeagueZone {
  /** ESPN's note for the zone, e.g. "Europa League". */
  note: string;
  first: number;
  last: number;
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
  /** Soccer: the qualification zones, top to bottom. */
  zones?: LeagueZone[];
}
export type LeagueTableView = "standings" | "rankings";
export interface LeagueSource {
  loadStandings(
    division: Division,
    signal: AbortSignal,
  ): Promise<LeagueTable[]>;
  loadRankings(division: Division, signal: AbortSignal): Promise<LeagueTable[]>;
}
