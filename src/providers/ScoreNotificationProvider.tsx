import type { ReactNode } from "react";
import type { ChaosAudio } from "../audio/chaosAudio";
import { scoreNotificationContext } from "../context/scoreNotificationContext";
import { useScoreNotificationState } from "../hooks/useScoreNotificationState";

type ScoreNotificationProviderProps = {
  children: ReactNode;
  audioFactory?: () => ChaosAudio;
};

export const ScoreNotificationProvider = ({
  children,
  audioFactory,
}: ScoreNotificationProviderProps) => {
  const value = useScoreNotificationState(audioFactory);
  return (
    <scoreNotificationContext.Provider value={value}>
      {children}
    </scoreNotificationContext.Provider>
  );
};
