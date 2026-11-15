import type { ReactNode } from "react";

import { type FantasySource, SleeperDataProvider } from "@/features/fantasy";
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
  fantasySource?: FantasySource;
  audioFactory?: () => ChaosAudio;
};

// Hands the scoreboard's games and weeks to the features that build on them
// (odds, score alerts and fantasy players), so those features never import
// the scores feature.
export const GameDataProviders = ({
  children,
  oddsSource,
  oddsHistorySource,
  fantasySource,
  audioFactory,
}: GameDataProvidersProps) => {
  const { games, updatedAt, error, weeks, currentWeekId } = useScoresData();

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
        <SleeperDataProvider
          weeks={weeks}
          currentWeekId={currentWeekId}
          source={fantasySource}
        >
          {children}
        </SleeperDataProvider>
      </ScoreNotificationProvider>
    </PolymarketDataProvider>
  );
};
