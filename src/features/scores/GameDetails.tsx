import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ChevronDown, MapPin } from "lucide-react";
import { type ReactNode, useState } from "react";

import { copy } from "@/copy";
import type { Game } from "@/shared/types";

import { GameLeaders } from "./GameLeaders";
import { PeriodScores } from "./PeriodScores";

type GameDetailsProps = {
  game: Game;
  /** Shown first while an unfinished game's details are open. */
  liveDetails?: ReactNode;
};

export const GameDetails = ({ game, liveDetails }: GameDetailsProps) => {
  const isFinal = game.state === "final";
  const [expanded, setExpanded] = useState(false);
  const hasTimeouts =
    game.state === "live" &&
    (game.homeTimeouts !== undefined || game.awayTimeouts !== undefined);
  const leaders = game.leaders ?? [];
  const hasDetails = Boolean(
    leaders.length > 0 ||
    game.lastPlay ||
    game.home.quarters.length ||
    game.away.quarters.length ||
    game.venue ||
    hasTimeouts,
  );

  return (
    <Accordion expanded={expanded} onChange={(_, open) => setExpanded(open)}>
      <AccordionSummary expandIcon={<ChevronDown />} sx={{ px: 2, m: 0 }}>
        <span>{copy.gameDetails.toggle}</span>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          {!isFinal && expanded && liveDetails}
          {expanded && leaders.length > 0 && (
            <GameLeaders gameId={game.id} leaders={leaders} />
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
