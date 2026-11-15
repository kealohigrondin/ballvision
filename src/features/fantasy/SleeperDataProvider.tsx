import { type ReactNode, useMemo } from "react";

import { useAppData } from "@/shared/appData/appDataContext";
import type { Week } from "@/shared/types";

import { sleeperSource } from "./sleeper";
import { sleeperDataContext } from "./sleeperDataContext";
import type { FantasySource } from "./types";
import { useFantasyRosters } from "./useFantasyRosters";

type SleeperDataProviderProps = {
  children: ReactNode;
  /** The scoreboard's selectable weeks and which one is current. */
  weeks: readonly Week[];
  currentWeekId?: string;
  source?: FantasySource;
};

// ESPN's regular season type; Sleeper leagues play only regular season weeks.
const REGULAR_SEASON = 2;

export const SleeperDataProvider = ({
  children,
  weeks,
  currentWeekId,
  source = sleeperSource,
}: SleeperDataProviderProps) => {
  const { division, week, paused, sleeperUsername } = useAppData();

  // The selected week, or ESPN's current week when none is chosen.
  const fantasyWeek = useMemo(() => {
    const shown = week ?? weeks.find((option) => option.id === currentWeekId);
    if (division !== "nfl" || !shown || shown.seasonType !== REGULAR_SEASON) {
      return { season: 0, number: 0 };
    }

    return { season: shown.year, number: shown.number };
  }, [division, week, weeks, currentWeekId]);

  const rosters = useFantasyRosters(
    source,
    sleeperUsername.trim(),
    fantasyWeek.season,
    fantasyWeek.number,
    paused,
  );

  return (
    <sleeperDataContext.Provider value={rosters}>
      {children}
    </sleeperDataContext.Provider>
  );
};
