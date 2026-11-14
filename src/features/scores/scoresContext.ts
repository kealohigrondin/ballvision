import { createContext, useContext } from "react";

import type { useScoresState } from "./useScoresState";

export type ScoresData = ReturnType<typeof useScoresState>;
export const scoresContext = createContext<ScoresData | undefined>(undefined);

export const useScoresData = () => {
  const context = useContext(scoresContext);
  if (!context) {
    throw new Error("useScoresData must be used within ScoresProvider.");
  }

  return context;
};
