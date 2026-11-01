import Stack from "@mui/material/Stack";
import "./styles/GameDetails.css";
import { ChevronDown, MapPin } from "lucide-react";
import type { Game } from "../data/types";
import { PeriodScores } from "./PeriodScores";

type GameDetailsProps = { game: Game };

export const GameDetails = ({ game }: GameDetailsProps) => {
  const hasTimeouts =
    game.state === "live" &&
    (game.homeTimeouts !== undefined || game.awayTimeouts !== undefined);

  const hasDetails =
    game.lastPlay ||
    game.home.quarters.length ||
    game.away.quarters.length ||
    game.venue ||
    hasTimeouts;

  return (
    <details className="game-details">
      <summary>
        Game details <ChevronDown size={14} />
      </summary>
      {game.lastPlay && (
        <p>
          <strong>Last play</strong>
          {game.lastPlay}
        </p>
      )}
      <PeriodScores home={game.home} away={game.away} />
      {hasTimeouts && (
        <p className="timeout-detail">
          Timeouts: {game.away.abbreviation} {game.awayTimeouts ?? "—"} ·{" "}
          {game.home.abbreviation} {game.homeTimeouts ?? "—"}
        </p>
      )}
      {game.venue && (
        <Stack direction="row" className="venue">
          <MapPin size={13} />
          {game.venue}
        </Stack>
      )}
      {!hasDetails && <p>Additional details are not available yet.</p>}
    </details>
  );
};
