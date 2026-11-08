import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ChevronDown, MapPin } from "lucide-react";

import { usePolymarketGame } from "../context/polymarketGameContext";
import type { Game } from "../data/types";
import { GameOddsHistory } from "./GameOddsHistory";
import { PeriodScores } from "./PeriodScores";

type GameDetailsProps = { game: Game };

export const GameDetails = ({ game }: GameDetailsProps) => {
  const {
    quote: odds,
    historyOpen: expanded,
    setHistoryOpen: setExpanded,
  } = usePolymarketGame();
  const hasTimeouts =
    game.state === "live" &&
    (game.homeTimeouts !== undefined || game.awayTimeouts !== undefined);
  const hasDetails = Boolean(
    game.lastPlay ||
    game.home.quarters.length ||
    game.away.quarters.length ||
    game.venue ||
    hasTimeouts,
  );

  return (
    <Accordion expanded={expanded} onChange={(_, open) => setExpanded(open)}>
      <AccordionSummary expandIcon={<ChevronDown />}>
        <Typography>Game details</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {expanded && odds !== undefined && <GameOddsHistory />}
          {expanded && !odds && (
            <Typography variant="body2" color="text.secondary">
              Polymarket chart unavailable for this game.
            </Typography>
          )}
          {game.lastPlay && (
            <Typography component="div">
              <Typography
                component="span"
                sx={{ display: "block", fontWeight: 600 }}
              >
                Last play
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
          {game.venue && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <MapPin size={20} />
              <Typography>{game.venue}</Typography>
            </Stack>
          )}
          {!hasDetails && (
            <Typography>Additional details are not available yet.</Typography>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
