import { createContext, useContext } from "react";

import type { useStandingsState } from "./useStandingsState";

export type StandingsData = ReturnType<typeof useStandingsState>;
export const standingsContext = createContext<StandingsData | undefined>(
  undefined,
);

export const useStandingsData = () => {
  const context = useContext(standingsContext);
  if (!context) {
    throw new Error("useStandingsData must be used within StandingsProvider.");
  }

  return context;
};
