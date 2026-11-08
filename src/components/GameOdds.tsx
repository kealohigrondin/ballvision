import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { usePolymarketGame } from "../context/polymarketGameContext";

type GameOddsProps = Record<string, never>;

export const GameOdds = ({}: GameOddsProps) => {
  const { quote, game, loading, error: stale } = usePolymarketGame();
  const away = game.away.abbreviation;
  const home = game.home.abbreviation;
  if (!quote) {
    const label = loading ? "Odds…" : "Odds —";
    const detail = stale
      ? "Odds are temporarily unavailable."
      : "No matching open moneyline market is available.";
    return (
      <Typography color="text.secondary" title={detail}>
        {label}
      </Typography>
    );
  }
  const favorite = quote.awayProbability > quote.homeProbability ? away : home;
  const probability = Math.max(quote.awayProbability, quote.homeProbability);
  const label =
    quote.awayProbability === quote.homeProbability
      ? "Even odds"
      : `${favorite} ${(probability * 100).toFixed(1)}%`;
  const status = stale ? " · stale" : "";
  const updated = new Date(quote.updatedAt).toLocaleTimeString();
  const description = `Polymarket moneyline, derived from market midpoint prices. ${away}: ${(quote.awayProbability * 100).toFixed(1)}% implied probability. ${home}: ${(quote.homeProbability * 100).toFixed(1)}%. Updated ${updated}${status}.`;
  return (
    <Stack sx={{ textAlign: "right", minWidth: 0 }} title={description}>
      <Link href={quote.url} target="_blank" rel="noopener noreferrer">
        <Typography
          component="span"
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          {label}
        </Typography>
      </Link>
    </Stack>
  );
};
