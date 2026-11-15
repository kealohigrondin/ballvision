import type { ReactNode } from "react";

import { useAppData } from "@/shared/appData/appDataContext";

import { espnGameSummarySource } from "./espnGameSummary";
import { espnSource } from "./espnScoreboard";
import { scoresContext } from "./scoresContext";
import type { GameSummarySource, ScoreboardSource } from "./types";
import { useScoresState } from "./useScoresState";

type ScoresProviderProps = {
  children: ReactNode;
  source?: ScoreboardSource;
  /** Loads one game's leaders and team stats for its details dialog. */
  summarySource?: GameSummarySource;
};

// Polls the scoreboard for the division and week chosen in app data, and
// provides the source game details use for each game's summary.
export const ScoresProvider = ({
  children,
  source = espnSource,
  summarySource = espnGameSummarySource,
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
    <scoresContext.Provider value={{ ...value, summarySource }}>
      {children}
    </scoresContext.Provider>
  );
};
