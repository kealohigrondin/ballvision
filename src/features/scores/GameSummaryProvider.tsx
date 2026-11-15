import type { ReactNode } from "react";

import { useAppData } from "@/shared/appData/appDataContext";
import type { Game } from "@/shared/types";

import { gameSummaryContext } from "./gameSummaryContext";
import { useScoresData } from "./scoresContext";
import { useGameSummary } from "./useGameSummary";

type GameSummaryProviderProps = { game: Game; children: ReactNode };

// Loads a game's leaders and team stats only while this provider is mounted,
// i.e. while its details dialog is open.
export const GameSummaryProvider = ({
  game,
  children,
}: GameSummaryProviderProps) => {
  const { division, paused } = useAppData();
  const { summarySource } = useScoresData();
  // Leaders and team stats are football stats, and before kickoff ESPN lists
  // season totals instead, so soccer and upcoming games load nothing.
  const query =
    game.state === "upcoming" || game.sport === "soccer"
      ? undefined
      : {
          division,
          gameId: game.id,
          awayId: game.away.id,
          homeId: game.home.id,
        };
  const value = useGameSummary(
    summarySource,
    query,
    game.state === "live",
    paused,
  );

  return (
    <gameSummaryContext.Provider value={value}>
      {children}
    </gameSummaryContext.Provider>
  );
};
