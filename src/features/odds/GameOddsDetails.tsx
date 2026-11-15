import Typography from "@mui/material/Typography";

import { copy } from "@/copy";

import { GameOddsHistory } from "./GameOddsHistory";
import { GameOddsSkeleton } from "./GameOddsSkeleton";
import { OddsHistoryProvider } from "./OddsHistoryProvider";
import { usePolymarketGame } from "./polymarketGameContext";

type GameOddsDetailsProps = Record<string, never>;

// The odds section of an open game's details: the history chart when the
// game has a market, a placeholder while its quote loads, otherwise why
// there is none.
export const GameOddsDetails = ({}: GameOddsDetailsProps) => {
  const { game, quote, error, loading } = usePolymarketGame();
  const expectsMarket = game.state === "live" || game.state === "upcoming";

  if (quote) {
    return (
      <OddsHistoryProvider>
        <GameOddsHistory />
      </OddsHistoryProvider>
    );
  }

  // Hold the section's space while the game's quote is still loading.
  if (loading && expectsMarket) {
    return <GameOddsSkeleton />;
  }

  // A failed Polymarket request on a game that should have a market usually
  // means the browser blocked the request, e.g. a privacy extension.
  const message =
    error && expectsMarket
      ? copy.gameDetails.oddsBlocked
      : copy.gameDetails.chartUnavailable;

  return (
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  );
};
