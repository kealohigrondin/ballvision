import type { ReactNode } from "react";
import { appDataContext } from "../context/appDataContext";
import { useAppDataState } from "../hooks/useAppDataState";
import { espnSource, espnLeagueSource } from "../data/espn";
import type { LeagueSource, ScoreboardSource } from "../data/types";

type AppDataProviderProps = {
  children: ReactNode;
  source?: ScoreboardSource;
  leagueSource?: LeagueSource;
};

export const AppDataProvider = ({
  children,
  source = espnSource,
  leagueSource = espnLeagueSource,
}: AppDataProviderProps) => {
  const value = useAppDataState({ source, leagueSource });
  return (
    <appDataContext.Provider value={value}>{children}</appDataContext.Provider>
  );
};
