import { GameFantasyPlayers } from "@/features/fantasy";
import {
  GameOdds,
  GameOddsDetails,
  PolymarketGameProvider,
} from "@/features/odds";
import { GameCard } from "@/features/scores";
import type { Game } from "@/shared/types";

type OddsGameCardProps = { game: Game };

// A scores card with Polymarket odds in its footer, and your fantasy players
// and odds history in its details. Soccer has no moneyline odds or fantasy
// players, so its cards have neither.
export const OddsGameCard = ({ game }: OddsGameCardProps) => {
  if (game.sport === "soccer") {
    return <GameCard game={game} />;
  }

  return (
    <PolymarketGameProvider game={game}>
      <GameCard
        game={game}
        odds={<GameOdds />}
        playerDetails={<GameFantasyPlayers game={game} />}
        liveDetails={<GameOddsDetails />}
      />
    </PolymarketGameProvider>
  );
};
