import type { ReactNode } from "react";

import {
  type ChaosAudio,
  ScoreNotificationProvider,
} from "@/features/notifications";
import {
  type OddsHistorySource,
  type OddsSource,
  PolymarketDataProvider,
} from "@/features/odds";
import { useScoresData } from "@/features/scores";

type GameDataProvidersProps = {
  children: ReactNode;
  oddsSource?: OddsSource;
  oddsHistorySource?: OddsHistorySource;
  audioFactory?: () => ChaosAudio;
};

// Hands the scoreboard's games to the features that build on them (odds and
// score alerts), so those features never import the scores feature.
export const GameDataProviders = ({
  children,
  oddsSource,
  oddsHistorySource,
  audioFactory,
}: GameDataProvidersProps) => {
  const { games, updatedAt, error } = useScoresData();

  return (
    <PolymarketDataProvider
      games={games}
      source={oddsSource}
      historySource={oddsHistorySource}
    >
      <ScoreNotificationProvider
        games={games}
        updatedAt={updatedAt}
        error={error}
        audioFactory={audioFactory}
      >
        {children}
      </ScoreNotificationProvider>
    </PolymarketDataProvider>
  );
};
