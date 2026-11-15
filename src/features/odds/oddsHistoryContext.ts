import { createContext, useContext } from "react";

import type { useOddsHistory } from "./useOddsHistory";

export type OddsHistoryData = ReturnType<typeof useOddsHistory>;
export const oddsHistoryContext = createContext<OddsHistoryData | undefined>(
  undefined,
);

export const useOddsHistoryData = () => {
  const context = useContext(oddsHistoryContext);
  if (!context) {
    throw new Error(
      "useOddsHistoryData must be used within OddsHistoryProvider.",
    );
  }

  return context;
};
