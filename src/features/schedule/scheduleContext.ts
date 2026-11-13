import { createContext, useContext } from "react";

import type { useTeamSchedule } from "./useTeamSchedule";

export type ScheduleData = ReturnType<typeof useTeamSchedule>;
export const scheduleContext = createContext<ScheduleData | undefined>(
  undefined,
);

export const useScheduleData = () => {
  const context = useContext(scheduleContext);
  if (!context) {
    throw new Error("useScheduleData must be used within ScheduleProvider.");
  }

  return context;
};
