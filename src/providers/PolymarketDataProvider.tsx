import type { ReactNode } from "react";

import { useAppData } from "../context/appDataContext";
import { useEspnData } from "../context/espnDataContext";
import { polymarketDataContext } from "../context/polymarketDataContext";
import { polymarketSource } from "../data/polymarket";
import { polymarketHistorySource } from "../data/polymarketHistory";
import type { OddsHistorySource, OddsSource } from "../data/types";
import { useGameOdds } from "../hooks/useGameOdds";

type PolymarketDataProviderProps = {
  children: ReactNode;
  source?: OddsSource;
  historySource?: OddsHistorySource;
};

export const PolymarketDataProvider = ({
  children,
  source = polymarketSource,
  historySource = polymarketHistorySource,
}: PolymarketDataProviderProps) => {
  const { division, paused } = useAppData();
  const { games } = useEspnData();
  const odds = useGameOdds(source, { games, division }, paused);
  return (
    <polymarketDataContext.Provider value={{ ...odds, historySource }}>
      {children}
    </polymarketDataContext.Provider>
  );
};
