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
