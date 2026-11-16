import { createContext, useContext } from "react";

import type { FantasyLeague } from "./types";

/** The user's fantasy leagues from every connected account. */
export type FantasyData = {
  leagues: FantasyLeague[];
  loading: boolean;
  error: boolean;
  refresh: () => void;
};
export const fantasyDataContext = createContext<FantasyData | undefined>(
  undefined,
);

export const useFantasyData = () => {
  const context = useContext(fantasyDataContext);
  if (!context) {
    throw new Error("useFantasyData must be used within FantasyDataProvider.");
  }

  return context;
};
