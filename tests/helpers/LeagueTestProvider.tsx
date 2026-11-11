import type { ReactNode } from "react";

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

export const LeagueTestProvider = ({
  children,
  source,
  division,
  scheduleSource,
  appData = {},
}: LeagueTestProviderProps) => (
  <AppDataTestProvider value={createAppData({ ...appData, division })}>
    <EspnDataProvider
      source={emptyScoreboardSource}
      leagueSource={source}
      scheduleSource={scheduleSource}
    >
      {children}
    </EspnDataProvider>
  </AppDataTestProvider>
);
