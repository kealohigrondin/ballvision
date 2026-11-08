import type { ReactNode } from "react";
import type { ChaosAudio } from "../audio/chaosAudio";
import { scoreCelebrationContext } from "../context/scoreCelebrationContext";
import { useScoreCelebrationState } from "../hooks/useScoreCelebrationState";

type ScoreCelebrationProviderProps = {
  children: ReactNode;
  audioFactory?: () => ChaosAudio;
};
export const ScoreCelebrationProvider = ({
  children,
  audioFactory,
}: ScoreCelebrationProviderProps) => {
  const value = useScoreCelebrationState(audioFactory);
  return (
    <scoreCelebrationContext.Provider value={value}>
      {children}
    </scoreCelebrationContext.Provider>
  );
};
