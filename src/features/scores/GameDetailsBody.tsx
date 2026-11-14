import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { copy } from "@/copy";
import type { Game } from "@/shared/types";

import { GameLeaders } from "./GameLeaders";

type GameDetailsBodyProps = {
  game: Game;
  /** Shown for unfinished games, after the leaders. */
  liveDetails?: ReactNode;
};

// Everything known about one game below its header: last play, leaders,
// live extras, timeouts and venue.
export const GameDetailsBody = ({
  game,
  liveDetails,
}: GameDetailsBodyProps) => {
  const isFinal = game.state === "final";
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
    <Stack spacing={2}>
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
      {leaders.length > 0 && <GameLeaders gameId={game.id} leaders={leaders} />}
      {!isFinal && liveDetails}
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
      {!hasDetails && <Typography>{copy.gameDetails.unavailable}</Typography>}
    </Stack>
  );
};
