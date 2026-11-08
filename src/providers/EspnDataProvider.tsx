import type { ReactNode } from "react";

import { espnDataContext } from "../context/espnDataContext";
import {
  espnLeagueSource,
  espnSource,
  espnTeamScheduleSource,
} from "../data/espn";
import type {
  LeagueSource,
  ScoreboardSource,
  TeamScheduleSource,
} from "../data/types";
import { useEspnDataState } from "../hooks/useEspnDataState";

type EspnDataProviderProps = {
  children: ReactNode;
  source?: ScoreboardSource;
  leagueSource?: LeagueSource;
  scheduleSource?: TeamScheduleSource;
};

export const EspnDataProvider = ({
  children,
  source = espnSource,
  leagueSource = espnLeagueSource,
  scheduleSource = espnTeamScheduleSource,
}: EspnDataProviderProps) => {
  const value = useEspnDataState({ source, leagueSource, scheduleSource });

  return (
    <espnDataContext.Provider value={value}>
      {children}
    </espnDataContext.Provider>
  );
};
