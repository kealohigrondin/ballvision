import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import clsx from "clsx";
import "./styles/GameCard.css";
import type { CSSProperties } from "react";
import { Star, Tv } from "lucide-react";
import type { Game } from "../data/types";
import { gameTime, kickoff } from "../utils/gameTime";
import { GameDetails } from "./GameDetails";
import { TeamRow } from "./TeamRow";

type GameCardProps = {
  game: Game;
  favorite: boolean;
  onFavorite: () => void;
};
export const GameCard = ({ game, favorite, onFavorite }: GameCardProps) => {
  const teamColors = {
    "--team-away": game.away.color,
    "--team-home": game.home.color,
  } as CSSProperties;
  const isLive = game.state === "live";
  const awayHasPossession = isLive && game.possession === game.away.id;
  const homeHasPossession = isLive && game.possession === game.home.id;
  const isScheduled = game.state === "upcoming";
  const isInRedZone = game.redZone && isLive;
  const favoriteTitle = favorite ? "Unpin game" : "Pin game";
  const favoriteLabel = `${favorite ? "Unpin" : "Pin"} ${game.away.name} at ${game.home.name}`;
  const starFill = favorite ? "currentColor" : "none";
  const indicator = isLive ? <span className="live-dot" /> : null;
  const time = isScheduled ? kickoff(game.start) : gameTime(game);
  const redZoneLabel = isInRedZone ? (
    <Typography variant="caption" component="span" className="red-zone-label">
      RED ZONE ·{" "}
    </Typography>
  ) : null;
  const getSituation = () => {
    if (isLive) {
      return game.situation || "Game in progress";
    }
    if (game.state === "final") {
      return "Final score";
    }
    return "Kickoff";
  };
  const situation = getSituation();
  const broadcast = game.broadcast ? (
    <Typography variant="caption" component="span" className="broadcast">
      <Tv size={12} />
      {game.broadcast}
    </Typography>
  ) : null;

  return (
    <Paper
      component="article"
      elevation={0}
      sx={{
        borderRadius: "22px",
        background:
          "linear-gradient(110deg, color-mix(in srgb, var(--team-away) var(--team-color-tint), var(--color-card-shade)), var(--color-card-shade) 48%, color-mix(in srgb, var(--team-home) var(--team-color-tint), var(--color-card-shade)))",
      }}
      className={clsx(
        "game-card",
        isLive && "is-live",
        isInRedZone && "red-zone",
      )}
      style={teamColors}
    >
      <Stack direction="row" className="card-header">
        <Typography
          variant="caption"
          component="span"
          className={clsx("game-state", game.state)}
        >
          {indicator}
          {time}
        </Typography>
        <button
          className={clsx("icon-button", "favorite", favorite && "selected")}
          onClick={onFavorite}
          title={favoriteTitle}
          aria-label={favoriteLabel}
          aria-pressed={favorite}
        >
          <Star size={16} fill={starFill} />
        </button>
      </Stack>
      <Box className="matchup">
        <TeamRow
          team={game.away}
          possession={awayHasPossession}
          scheduled={isScheduled}
        />
        <TeamRow
          team={game.home}
          possession={homeHasPossession}
          scheduled={isScheduled}
        />
      </Box>
      <Stack direction="row" className="card-situation">
        <span>
          {redZoneLabel}
          {situation}
        </span>
        {broadcast}
      </Stack>
      <GameDetails game={game} />
    </Paper>
  );
};
