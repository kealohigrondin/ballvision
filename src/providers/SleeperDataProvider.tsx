import { type ReactNode, useMemo } from "react";

import { useAppData } from "../context/appDataContext";
import { useEspnData } from "../context/espnDataContext";
import { sleeperDataContext } from "../context/sleeperDataContext";
import { sleeperSource } from "../data/sleeper";
import type { FantasySource } from "../data/types";
import { useFantasyRosters } from "../hooks/useFantasyRosters";

type SleeperDataProviderProps = {
  children: ReactNode;
  source?: FantasySource;
};

// ESPN's regular season type; Sleeper leagues play only regular season weeks.
const REGULAR_SEASON = 2;

export const SleeperDataProvider = ({
  children,
  source = sleeperSource,
}: SleeperDataProviderProps) => {
  const { division, week, paused, sleeperUsername } = useAppData();
  const { weeks, currentWeekId } = useEspnData();

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
