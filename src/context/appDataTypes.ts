import type { Division, NflStandingsView, Week } from "../data/types";

export type Filter = "all" | "live" | "upcoming" | "final" | "pinned";
export type AppPreferences = {
  panelOpen: boolean;
  /** `null` follows the provider's current week. */
  week: Week | null;
  division: Division;
  filter: Filter;
  search: string;
  paused: boolean;
  nflStandingsView: NflStandingsView;
};
