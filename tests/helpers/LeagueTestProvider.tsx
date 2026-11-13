import { type ReactNode, useState } from "react";

import type { AppData } from "../../src/context/appDataContext";
import type {
  Division,
  LeagueSource,
  TeamScheduleSource,
} from "../../src/data/types";
import { EspnDataProvider } from "../../src/providers/EspnDataProvider";
import {
  AppDataTestProvider,
  createAppData,
  emptyScoreboardSource,
} from "./appData";

type LeagueTestProviderProps = {
  children: ReactNode;
  source: LeagueSource;
  division: Division;
  scheduleSource?: TeamScheduleSource;
  appData?: Partial<AppData>;
};

// Keeps the standings conference in real state so pickers update the panel.
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

  return (
    <AppDataTestProvider
      value={createAppData({
        ...appData,
        standingsConferenceId,
        setStandingsConferenceId,
        division,
      })}
    >
      <EspnDataProvider
        source={emptyScoreboardSource}
        leagueSource={source}
        scheduleSource={scheduleSource}
      >
        {children}
      </EspnDataProvider>
    </AppDataTestProvider>
  );
};
