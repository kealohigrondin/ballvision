import {
  GameOdds,
  GameOddsDetails,
  PolymarketGameProvider,
} from "@/features/odds";
import { GameCard } from "@/features/scores";
import type { Game } from "@/shared/types";

type OddsGameCardProps = { game: Game };

// A scores card with Polymarket odds in its footer and odds history in its
// expanded details.
export const OddsGameCard = ({ game }: OddsGameCardProps) => (
  <PolymarketGameProvider game={game}>
    <GameCard
      game={game}
      odds={<GameOdds />}
      liveDetails={<GameOddsDetails />}
    />
  </PolymarketGameProvider>
);
