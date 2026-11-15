import { createContext, useContext } from "react";

import type { useGameSummary } from "./useGameSummary";

export type GameSummaryData = ReturnType<typeof useGameSummary>;
export const gameSummaryContext = createContext<GameSummaryData | undefined>(
  undefined,
);

export const useGameSummaryData = () => {
  const context = useContext(gameSummaryContext);
  if (!context) {
    throw new Error(
      "useGameSummaryData must be used within GameSummaryProvider.",
    );
  }

  return context;
};
