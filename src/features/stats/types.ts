import type { Division } from "@/shared/types";

export interface TeamStat {
  /** ESPN's stable key, e.g. `completionPct`. */
  name: string;
  label: string;
  abbreviation: string;
  description: string;
  value?: number;
  displayValue: string;
  perGameValue?: number;
  perGameDisplayValue?: string;
}
export interface TeamStatCategory {
  /** ESPN's stable key, e.g. `passing`. */
  name: string;
  label: string;
  stats: TeamStat[];
}
export interface TeamStats {
  teamId: string;
  season: string;
  categories: TeamStatCategory[];
}
export interface TeamStatsQuery {
  division: Division;
  teamId: string;
}
export interface TeamStatsSource {
  load(query: TeamStatsQuery, signal: AbortSignal): Promise<TeamStats>;
}
