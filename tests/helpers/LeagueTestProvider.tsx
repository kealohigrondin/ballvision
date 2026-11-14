import { type ReactNode, useState } from "react";

import { ScheduleProvider } from "@/features/schedule/ScheduleProvider";
import type { TeamScheduleSource } from "@/features/schedule/types";
import { StandingsProvider } from "@/features/standings/StandingsProvider";
import type { LeagueSource } from "@/features/standings/types";
import type { AppData } from "@/shared/appData/appDataContext";
import type { Division, PanelView, TeamRef } from "@/shared/types";

import { AppDataTestProvider, createAppData } from "./appData";

type LeagueTestProviderProps = {
  children: ReactNode;
  source: LeagueSource;
  division: Division;
  scheduleSource?: TeamScheduleSource;
  appData?: Partial<AppData>;
};

// Real standings and schedule providers over app data that keeps the panel
// page, selected team and standings conference in state, so clicks in the
// panel update it like the app does.
export const LeagueTestProvider = ({
  children,
  source,
  division,
  scheduleSource,
  appData = {},
}: LeagueTestProviderProps) => {
  const [standingsConferenceId, setStandingsConferenceId] = useState(
    appData.standingsConferenceId ?? "",
  );
  const [selectedPanelView, setPanelView] = useState<PanelView>(
    appData.panelView ?? "standings",
  );
  // Selections belong to the division they were made in.
  const [selection, setSelection] = useState<{
    division: Division;
    team: TeamRef;
  }>();
  const panelView =
    division === "nfl" && selectedPanelView === "rankings"
      ? "standings"
      : selectedPanelView;

  return (
    <AppDataTestProvider
      value={createAppData({
        ...appData,
        standingsConferenceId,
        setStandingsConferenceId,
        panelView,
        setPanelView,
        selectedTeam:
          selection?.division === division ? selection.team : undefined,
        selectTeam: (team) => {
          setSelection({ division, team });
          setPanelView("schedule");
        },
        division,
      })}
    >
      <StandingsProvider source={source}>
        <ScheduleProvider source={scheduleSource}>{children}</ScheduleProvider>
      </StandingsProvider>
    </AppDataTestProvider>
  );
};
