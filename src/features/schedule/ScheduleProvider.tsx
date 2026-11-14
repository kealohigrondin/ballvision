import type { ReactNode } from "react";

import { useAppData } from "@/shared/appData/appDataContext";

import { espnTeamScheduleSource } from "./espnSchedule";
import { scheduleContext } from "./scheduleContext";
import type { TeamScheduleSource } from "./types";
import { useTeamSchedule } from "./useTeamSchedule";

type ScheduleProviderProps = {
  children: ReactNode;
  source?: TeamScheduleSource;
};

// The selected team's schedule, loaded while the schedule page is open.
export const ScheduleProvider = ({
  children,
  source = espnTeamScheduleSource,
}: ScheduleProviderProps) => {
  const { division, selectedTeam, panelOpen, panelView } = useAppData();
  const value = useTeamSchedule(
    source,
    division,
    selectedTeam?.id ?? "",
    panelOpen && panelView === "schedule",
  );

  return (
    <scheduleContext.Provider value={value}>
      {children}
    </scheduleContext.Provider>
  );
};
