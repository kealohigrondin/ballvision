import type { ReactNode } from "react";

import { useAppData } from "@/shared/appData/appDataContext";

import { espnLeagueSource } from "./espnStandings";
import { standingsContext } from "./standingsContext";
import type { LeagueSource } from "./types";
import { useStandingsState } from "./useStandingsState";

type StandingsProviderProps = {
  children: ReactNode;
  source?: LeagueSource;
};

// Loads standings or polls while the league panel is open.
export const StandingsProvider = ({
  children,
  source = espnLeagueSource,
}: StandingsProviderProps) => {
  const {
    division,
    panelView,
    panelOpen,
    nflStandingsView,
    standingsConferenceId,
    setStandingsConferenceId,
  } = useAppData();
  const value = useStandingsState(source, {
    division,
    panelView,
    panelOpen,
    nflStandingsView,
    standingsConferenceId,
    setStandingsConferenceId,
  });

  return (
    <standingsContext.Provider value={value}>
      {children}
    </standingsContext.Provider>
  );
};
