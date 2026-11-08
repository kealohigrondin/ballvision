import { createContext, useContext } from "react";
import type { OddsHistorySource } from "../data/types";
import type { useGameOdds } from "../hooks/useGameOdds";

export type PolymarketData = ReturnType<typeof useGameOdds> & {
  historySource: OddsHistorySource;
};
export const polymarketDataContext = createContext<PolymarketData | undefined>(
  undefined,
);
export const usePolymarketData = () => {
  const context = useContext(polymarketDataContext);
  if (!context)
    throw new Error(
      "usePolymarketData must be used within PolymarketDataProvider.",
    );
  return context;
};
