import type { ReactNode } from "react";
import { espnDataContext } from "../context/espnDataContext";
import { useEspnDataState } from "../hooks/useEspnDataState";
import { espnSource, espnLeagueSource } from "../data/espn";
import type { ScoreboardSource, LeagueSource } from "../data/types";

type EspnDataProviderProps = {
  children: ReactNode;
  source?: ScoreboardSource;
  leagueSource?: LeagueSource;
};
export const EspnDataProvider = ({
  children,
  source = espnSource,
  leagueSource = espnLeagueSource,
}: EspnDataProviderProps) => {
  const value = useEspnDataState({ source, leagueSource });
  return (
    <espnDataContext.Provider value={value}>
      {children}
    </espnDataContext.Provider>
  );
};
