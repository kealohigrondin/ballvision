import type { Division, Filter, NflStandingsView, Week } from "@/shared/types";

export type AppPreferences = {
  panelOpen: boolean;
  /** `null` follows the provider's current week. */
  week: Week | null;
  division: Division;
  filter: Filter;
  search: string;
  paused: boolean;
  nflStandingsView: NflStandingsView;
  /** College conference shown in standings; `""` shows the first one. */
  standingsConferenceId: string;
  /** Sleeper username whose fantasy players show in game details. */
  sleeperUsername: string;
  /** Link to the user's ESPN fantasy team, whose players show in game details. */
  espnFantasyTeam: string;
};
