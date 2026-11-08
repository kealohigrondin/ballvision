import type { ReactNode } from "react";
import { espnDataContext } from "../context/espnDataContext";
import { useEspnDataState } from "../hooks/useEspnDataState";
import {
  espnSource,
  espnLeagueSource,
  espnTeamScheduleSource,
} from "../data/espn";
import type {
  ScoreboardSource,
  LeagueSource,
  TeamScheduleSource,
} from "../data/types";

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
