import type { ReactNode } from "react";

import { useAppData } from "@/shared/appData/appDataContext";

import { espnSource } from "./espnScoreboard";
import { scoresContext } from "./scoresContext";
import type { ScoreboardSource } from "./types";
import { useScoresState } from "./useScoresState";

type ScoresProviderProps = {
  children: ReactNode;
  source?: ScoreboardSource;
};

// Polls the scoreboard for the division and week chosen in app data.
export const ScoresProvider = ({
  children,
  source = espnSource,
}: ScoresProviderProps) => {
  const { division, week, paused, filter, search, favoriteIds } = useAppData();
  const value = useScoresState(source, {
    division,
    week,
    paused,
    filter,
    search,
    favoriteIds,
  });

  return (
    <scoresContext.Provider value={value}>{children}</scoresContext.Provider>
  );
};
