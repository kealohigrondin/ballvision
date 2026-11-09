import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import clsx from "clsx";
import { Star, StarOff, Tv } from "lucide-react";
import { useMemo } from "react";

import { copy } from "../copy";
import type { Game } from "../data/types";
import { PolymarketGameProvider } from "../providers/PolymarketGameProvider";
import { compactBoxScoreSx } from "../styles/boxScore";
import { gameTime, kickoff } from "../utils/gameTime";
import { GameDetails } from "./GameDetails";
import { GameOdds } from "./GameOdds";
import { TeamRow } from "./TeamRow";
import { GameSummary } from "./GameSummary";

type GameCardProps = {
  game: Game;
  favorite: boolean;
  onFavorite: () => void;
};

export const GameCard = ({ game, favorite, onFavorite }: GameCardProps) => {
  const isLive = game.state === "live";
  const awayHasPossession = isLive && game.possession === game.away.id;
  const homeHasPossession = isLive && game.possession === game.home.id;
  const isScheduled = game.state === "upcoming";
  const isFinal = game.state === "final";
  const isHomeWinner = isFinal && game.home.score > game.away.score;
  const isInRedZone = game.redZone && isLive;
  const favoriteLabel = copy.gameCard.favorite(
    favorite,
    game.away.name,
    game.home.name,
  );

  const favoriteIcon = favorite ? (
    <Star size={16} fill="currentColor" />
  ) : (
    <StarOff size={16} fill="currentColor" />
  );
  const time = isScheduled ? kickoff(game.start) : gameTime(game);

  const situation = useMemo(() => {
    if (isLive) {
      return game.situation || copy.gameCard.inProgress;
    }
    if (game.state === "final") {
      return "";
    }

    return copy.gameCard.kickoff;
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
        align="right"
        sx={{
          width: "3ch",
        }}
        key={period}
      >
        {label}
      </TableCell>
    );
  });

  return (
    <PolymarketGameProvider game={game}>
      <Paper
        component="article"
        className={clsx(isInRedZone && "red-zone")}
        sx={{
          container: "game-card / inline-size",
          ...(isInRedZone
            ? { border: "2px solid", borderColor: "error.main" }
            : {}),
        }}
      >
        <TableContainer sx={{ pt: 1, px: 0.8 }}>
          <Table
            className="card-scoreboard"
            size="small"
            aria-label={copy.gameCard.scoresByPeriod(
              game.away.name,
              game.home.name,
            )}
            sx={[
              compactBoxScoreSx,
              (theme) => ({
                tableLayout: "fixed",
                "& .MuiTableCell-root": { borderBottom: 0 },
                "& .period-heading, & .team-period": { display: "none" },
                "& .total-heading": { visibility: "hidden" },
                [`@container game-card (min-width: ${theme.app.boxScoreMinWidth}px)`]:
                  {
                    "& .period-heading, & .team-period": {
                      display: "table-cell",
                    },
                    "& .total-heading": { visibility: "visible" },
                  },
              }),
            ]}
          >
            <TableHead>
              <TableRow sx={{ pl: 1 }}>
                <TableCell
                  component="th"
                  scope="col"
                  className="card-status-cell"
                >
                  <strong>{time}</strong>
                  {game.broadcast && !isFinal && (
                    <span>
                      &nbsp;&nbsp;
                      {game.broadcast}
                    </span>
                  )}
                </TableCell>
                {periodHeaders}
                <TableCell
                  component="th"
                  scope="col"
                  className="total-heading"
                  align="right"
                  sx={{ width: 56 }}
                >
                  {copy.periodScores.total}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TeamRow
                team={game.away}
                possession={awayHasPossession}
                scheduled={isScheduled}
                periods={periods}
                isWinner={!isHomeWinner}
                isFinal={isFinal}
              />
              <TeamRow
                team={game.home}
                possession={homeHasPossession}
                scheduled={isScheduled}
                periods={periods}
                isWinner={isHomeWinner}
                isFinal={isFinal}
              />
            </TableBody>
          </Table>
        </TableContainer>
        <Stack
          direction="row"
          className="card-situation"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            p: 1,
          }}
        >
          <Stack className="card-situation" spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography component="span">{situation}</Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            {isLive || isScheduled ? (
              <GameOdds />
            ) : (
              <GameSummary venue={game.venue} />
            )}
            <IconButton
              className={clsx(
                "icon-button",
                "favorite",
                favorite && "selected",
              )}
              onClick={onFavorite}
              title={copy.gameCard.pin(favorite)}
              aria-label={favoriteLabel}
              aria-pressed={favorite}
            >
              {favoriteIcon}
            </IconButton>
          </Stack>
        </Stack>
        <GameDetails game={game} />
      </Paper>
    </PolymarketGameProvider>
  );
};
