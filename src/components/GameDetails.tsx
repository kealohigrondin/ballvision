import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { ChevronDown, MapPin } from "lucide-react";
import type { Game } from "../data/types";
import { PeriodScores } from "./PeriodScores";

type GameDetailsProps = { game: Game };

export const GameDetails = ({ game }: GameDetailsProps) => {
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
    <Accordion>
      <AccordionSummary expandIcon={<ChevronDown />}>
        <Typography>Game details</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {game.lastPlay && (
            <Typography>
              <Typography component="strong" sx={{ display: "block" }}>
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
