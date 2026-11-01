import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import clsx from "clsx";
import "./styles/GameCard.css";
import { useMemo, type CSSProperties } from "react";
import { Pin, PinOff, Star, Tv } from "lucide-react";
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
  const favoriteLabel = `${favorite ? "Unpin" : "Pin"} ${game.away.name} at ${game.home.name}`;
  const indicator = isLive ? <span className="live-dot" /> : null;
  const time = isScheduled ? kickoff(game.start) : gameTime(game);
  const redZoneLabel = isInRedZone ? (
    <Typography variant="caption" component="span" className="red-zone-label">
      RED ZONE ·{" "}
    </Typography>
  ) : null;

  const situation = useMemo(() => {
    if (isLive) {
      return game.situation || "Game in progress";
    }
    if (game.state === "final") {
      return "Final score";
    }
    return "Kickoff";
  }, [isLive, game.situation, game.state]);

  const periods = Array.from(
    {
      length: Math.max(
        4,
        game.period,
        game.home.quarters.length,
        game.away.quarters.length,
      ),
    },
    (_, index) => index,
  );
  const periodHeaders = periods.map((period) => {
    const label = period < 4 ? period + 1 : `${period - 3}OT`;
    return (
      <TableCell
        component="th"
        scope="col"
        className="period-heading"
        key={period}
      >
        {label}
      </TableCell>
    );
  });

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
      <TableContainer className="card-scoreboard-scroll">
        <Table
          className="card-scoreboard"
          size="small"
          aria-label={`${game.away.name} at ${game.home.name} scores by period`}
        >
          <TableHead>
            <TableRow>
              <TableCell
                component="th"
                scope="col"
                className="card-status-cell"
              >
                <Typography
                  variant="caption"
                  component="span"
                  className={clsx("game-state", game.state)}
                >
                  {indicator}
                  {time}
                </Typography>
              </TableCell>
              {periodHeaders}
              <TableCell component="th" scope="col" className="total-heading">
                T
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TeamRow
              team={game.away}
              possession={awayHasPossession}
              scheduled={isScheduled}
              periods={periods}
            />
            <TeamRow
              team={game.home}
              possession={homeHasPossession}
              scheduled={isScheduled}
              periods={periods}
            />
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" className="card-situation">
        <Stack className="card-broadcast-info">
          {game.broadcast && (
            <Typography
              variant="caption"
              component="span"
              className="broadcast"
            >
              <Tv size={12} />
              {game.broadcast}
            </Typography>
          )}
          <Typography variant="caption" component="span">
            {redZoneLabel}
            {situation}
          </Typography>
        </Stack>
        <button
          className={clsx("icon-button", "favorite", favorite && "selected")}
          onClick={onFavorite}
          title={favorite ? "Unpin game" : "Pin game"}
          aria-label={favoriteLabel}
          aria-pressed={favorite}
        >
          {favorite ? (
            <Pin size={16} fill="currentColor" />
          ) : (
            <PinOff size={16} fill="currentColor" />
          )}
        </button>
      </Stack>
      <GameDetails game={game} />
    </Paper>
  );
};
