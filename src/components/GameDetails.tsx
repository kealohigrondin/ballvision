import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ChevronDown, MapPin } from "lucide-react";
import { useMemo } from "react";

import { usePolymarketGame } from "../context/polymarketGameContext";
import { useSleeperData } from "../context/sleeperDataContext";
import { copy } from "../copy";
import type { Game } from "../data/types";
import { fantasyLeaguesForGame } from "../utils/fantasyPlayers";
import { FantasyPlayerList } from "./FantasyPlayerList";
import { GameOddsHistory } from "./GameOddsHistory";
import { PeriodScores } from "./PeriodScores";

type GameDetailsProps = { game: Game };

export const GameDetails = ({ game }: GameDetailsProps) => {
  const isFinal = game.state === "final";

  const {
    quote: odds,
    historyOpen: expanded,
    setHistoryOpen: setExpanded,
    error: oddsError,
  } = usePolymarketGame();
  const { leagues } = useSleeperData();

  const fantasyLeagues = useMemo(
    () => fantasyLeaguesForGame(leagues, game),
    [leagues, game],
  );

  const oddsMessage = useMemo(() => {
    // A failed Polymarket request on a game that should have a market usually
    // means the browser blocked the request, e.g. a privacy extension.
    if (oddsError && (game.state === "live" || game.state === "upcoming")) {
      return copy.gameDetails.oddsBlocked;
    }

    return copy.gameDetails.chartUnavailable;
  }, [oddsError, game.state]);
  const hasTimeouts =
    game.state === "live" &&
    (game.homeTimeouts !== undefined || game.awayTimeouts !== undefined);
  const hasDetails = Boolean(
    game.lastPlay ||
    game.home.quarters.length ||
    game.away.quarters.length ||
    game.venue ||
    hasTimeouts ||
    fantasyLeagues.length > 0,
  );

  return (
    <Accordion expanded={expanded} onChange={(_, open) => setExpanded(open)}>
      <AccordionSummary expandIcon={<ChevronDown />} sx={{ px: 2, m: 0 }}>
        <span>{copy.gameDetails.toggle}</span>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          {fantasyLeagues.length > 0 && (
            <FantasyPlayerList leagues={fantasyLeagues} id={game.id} />
          )}
          {!isFinal && expanded && odds !== undefined && <GameOddsHistory />}
          {!isFinal && expanded && !odds && (
            <Typography variant="body2" color="text.secondary">
              {oddsMessage}
            </Typography>
          )}
          {game.lastPlay && (
            <Typography component="div">
              <Typography
                component="span"
                sx={{ display: "block", fontWeight: 600 }}
              >
                {copy.gameDetails.lastPlay}
              </Typography>
              {game.lastPlay}
            </Typography>
          )}
          <PeriodScores home={game.home} away={game.away} />
          {hasTimeouts && (
            <Typography>
              Timeouts: {game.away.abbreviation} {game.awayTimeouts ?? "—"} ·{" "}
              {game.home.abbreviation} {game.homeTimeouts ?? "—"}
            </Typography>
          )}
          {!isFinal && game.venue && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <MapPin size={20} />
              <Typography>{game.venue}</Typography>
            </Stack>
          )}
          {!hasDetails && (
            <Typography>{copy.gameDetails.unavailable}</Typography>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
