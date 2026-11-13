import type { ReactNode } from "react";

import { useAppData } from "@/shared/appData/appDataContext";

import { espnTeamStatsSource } from "./espnStats";
import { statsContext } from "./statsContext";
import type { TeamStatsSource } from "./types";
import { useTeamStats } from "./useTeamStats";

type StatsProviderProps = {
  children: ReactNode;
  source?: TeamStatsSource;
};

// Season statistics for the team picked in the league panel. They load
// alongside the team's schedule, while the schedule page is open.
export const StatsProvider = ({
  children,
  source = espnTeamStatsSource,
}: StatsProviderProps) => {
  const { division, selectedTeam, panelOpen, panelView } = useAppData();
  const value = useTeamStats(
    source,
    division,
    selectedTeam?.id ?? "",
    panelOpen && panelView === "schedule",
  );

  return (
    <statsContext.Provider value={value}>{children}</statsContext.Provider>
  );
};
