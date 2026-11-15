import type { ReactNode } from "react";

import { useAppData } from "@/shared/appData/appDataContext";
import type { Game } from "@/shared/types";

import { polymarketSource } from "./polymarket";
import { polymarketDataContext } from "./polymarketDataContext";
import { polymarketHistorySource } from "./polymarketHistory";
import type { OddsHistorySource, OddsSource } from "./types";
import { useGameOdds } from "./useGameOdds";

type PolymarketDataProviderProps = {
  children: ReactNode;
  /** Games to price; only live and upcoming ones get a market lookup. */
  games: readonly Game[];
  source?: OddsSource;
  historySource?: OddsHistorySource;
};

export const PolymarketDataProvider = ({
  children,
  games,
  source = polymarketSource,
  historySource = polymarketHistorySource,
}: PolymarketDataProviderProps) => {
  const { division, paused } = useAppData();
  const odds = useGameOdds(source, { games, division }, paused);

  return (
    <polymarketDataContext.Provider value={{ ...odds, historySource }}>
      {children}
    </polymarketDataContext.Provider>
  );
};
