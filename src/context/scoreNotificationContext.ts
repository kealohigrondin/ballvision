import { createContext, useContext } from "react";

import type { useScoreNotificationState } from "../hooks/useScoreNotificationState";

export type ScoreNotificationData = ReturnType<
  typeof useScoreNotificationState
>;
export const scoreNotificationContext = createContext<
  ScoreNotificationData | undefined
>(undefined);

export const useScoreNotification = () => {
  const context = useContext(scoreNotificationContext);
  if (!context) {
    throw new Error(
      "useScoreNotification must be used within ScoreNotificationProvider.",
    );
  }

  return context;
};
