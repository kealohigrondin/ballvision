import { usePolymarketGame } from "../context/polymarketGameContext";
import { GameOddsHistory } from "./GameOddsHistory";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { ChevronDown, MapPin } from "lucide-react";
import type { Game } from "../data/types";
import { PeriodScores } from "./PeriodScores";
import { copy } from "../copy";

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
        <Typography>{copy.gameDetails.toggle}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {expanded && odds !== undefined && <GameOddsHistory />}
          {expanded && !odds && (
            <Typography variant="body2" color="text.secondary">
              {copy.gameDetails.chartUnavailable}
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
          {game.venue && (
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
