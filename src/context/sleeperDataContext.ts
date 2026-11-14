import { createContext, useContext } from "react";

import type { useFantasyRosters } from "../hooks/useFantasyRosters";

export type SleeperData = ReturnType<typeof useFantasyRosters>;
export const sleeperDataContext = createContext<SleeperData | undefined>(
  undefined,
);

export const useSleeperData = () => {
  const context = useContext(sleeperDataContext);
  if (!context) {
    throw new Error("useSleeperData must be used within SleeperDataProvider.");
  }

  return context;
};
