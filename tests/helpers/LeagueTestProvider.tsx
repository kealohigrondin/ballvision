import type { ReactNode } from "react";
import type { Division, LeagueSource } from "../../src/data/types";
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
};
export const LeagueTestProvider = ({
  children,
  source,
  division,
}: LeagueTestProviderProps) => (
  <AppDataTestProvider value={createAppData({ division })}>
    <EspnDataProvider source={emptyScoreboardSource} leagueSource={source}>
      {children}
    </EspnDataProvider>
  </AppDataTestProvider>
);
