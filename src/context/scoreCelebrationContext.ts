import { createContext, useContext } from "react";
import type { useScoreCelebrationState } from "../hooks/useScoreCelebrationState";

export type ScoreCelebrationData = ReturnType<typeof useScoreCelebrationState>;
export const scoreCelebrationContext = createContext<
  ScoreCelebrationData | undefined
>(undefined);
export const useScoreCelebration = () => {
  const context = useContext(scoreCelebrationContext);
  if (!context)
    throw new Error(
      "useScoreCelebration must be used within ScoreCelebrationProvider.",
    );
  return context;
};
