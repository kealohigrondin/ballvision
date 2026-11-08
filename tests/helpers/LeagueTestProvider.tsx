import type { ReactNode } from "react";
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
};

export const LeagueTestProvider = ({
  children,
  source,
  division,
  scheduleSource,
}: LeagueTestProviderProps) => (
  <AppDataTestProvider value={createAppData({ division })}>
    <EspnDataProvider
      source={emptyScoreboardSource}
      leagueSource={source}
      scheduleSource={scheduleSource}
    >
      {children}
    </EspnDataProvider>
  </AppDataTestProvider>
);
