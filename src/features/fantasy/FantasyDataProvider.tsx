import { type ReactNode, useCallback, useMemo } from "react";

import { useAppData } from "@/shared/appData/appDataContext";
import type { Week } from "@/shared/types";

import {
  type EspnFantasySource,
  espnFantasySource,
  parseEspnTeamLink,
} from "./espnFantasy";
import { fantasyDataContext } from "./fantasyDataContext";
import { sleeperSource } from "./sleeper";
import type { FantasySource } from "./types";
import { useFantasyRosters } from "./useFantasyRosters";

type FantasyDataProviderProps = {
  children: ReactNode;
  /** The scoreboard's selectable weeks and which one is current. */
  weeks: readonly Week[];
  currentWeekId?: string;
  source?: FantasySource;
  espnSource?: EspnFantasySource;
};

// ESPN's regular season type; fantasy leagues play only regular season weeks.
const REGULAR_SEASON = 2;

// Loads the user's fantasy players from Sleeper and ESPN for the NFL week on
// the scoreboard, and offers them as one list of leagues.
export const FantasyDataProvider = ({
  children,
  weeks,
  currentWeekId,
  source = sleeperSource,
  espnSource = espnFantasySource,
}: FantasyDataProviderProps) => {
  const { division, week, paused, sleeperUsername, espnFantasyTeam } =
    useAppData();

  // The selected week, or ESPN's current week when none is chosen.
  const fantasyWeek = useMemo(() => {
    const shown = week ?? weeks.find((option) => option.id === currentWeekId);
    if (division !== "nfl" || !shown || shown.seasonType !== REGULAR_SEASON) {
      return { season: 0, number: 0 };
    }

    return { season: shown.year, number: shown.number };
  }, [division, week, weeks, currentWeekId]);
  const { season, number } = fantasyWeek;

  const username = sleeperUsername.trim();
  const sleeperKey =
    username && number > 0 ? `${username}:${season}:${number}` : "";

  const loadSleeper = useCallback(
    (signal: AbortSignal) =>
      source.load({ username, season, week: number }, signal),
    [source, username, season, number],
  );
  const sleeper = useFantasyRosters(loadSleeper, sleeperKey, paused);

  const espnTeam = useMemo(
    () => parseEspnTeamLink(espnFantasyTeam),
    [espnFantasyTeam],
  );
  const espnKey =
    espnTeam && number > 0
      ? `${espnTeam.leagueId}:${espnTeam.teamId}:${season}:${number}`
      : "";
  const leagueId = espnTeam?.leagueId ?? "";
  const teamId = espnTeam?.teamId ?? "";

  const loadEspn = useCallback(
    (signal: AbortSignal) =>
      espnSource.load({ leagueId, teamId, season, week: number }, signal),
    [espnSource, leagueId, teamId, season, number],
  );
  const espn = useFantasyRosters(loadEspn, espnKey, paused);

  const value = {
    leagues: [...sleeper.leagues, ...espn.leagues],
    loading: sleeper.loading || espn.loading,
    error: sleeper.error || espn.error,
    refresh: () => {
      sleeper.refresh();
      espn.refresh();
    },
  };

  return (
    <fantasyDataContext.Provider value={value}>
      {children}
    </fantasyDataContext.Provider>
  );
};
