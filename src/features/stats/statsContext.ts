import { createContext, useContext } from "react";

import type { useTeamStats } from "./useTeamStats";

export type StatsData = ReturnType<typeof useTeamStats>;
export const statsContext = createContext<StatsData | undefined>(undefined);

export const useStatsData = () => {
  const context = useContext(statsContext);
  if (!context) {
    throw new Error("useStatsData must be used within StatsProvider.");
  }

  return context;
};
