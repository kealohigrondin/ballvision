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
import { Star, StarOff } from "lucide-react";
import { type ReactNode, useMemo } from "react";

import { copy } from "@/copy";
import { useAppData } from "@/shared/appData/appDataContext";
import { gameTime, kickoff } from "@/shared/gameTime";
import type { Game } from "@/shared/types";

import { compactBoxScoreSx } from "./boxScore";
import { GameDetails } from "./GameDetails";
import { GameSummary } from "./GameSummary";
import { TeamRow } from "./TeamRow";

type GameCardProps = {
  game: Game;
  /** Shown beside the pin button for live and upcoming games. */
  odds?: ReactNode;
  /** Extra details shown first when an unfinished game is expanded. */
  liveDetails?: ReactNode;
};

export const GameCard = ({ game, odds, liveDetails }: GameCardProps) => {
  const { favoriteIds, toggleFavorite } = useAppData();
  const favorite = favoriteIds.includes(game.id);
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
              {isScheduled ? null : (
                <>
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
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TeamRow
              team={game.away}
              possession={awayHasPossession}
              isScheduled={isScheduled}
              periods={periods}
              isWinner={!isHomeWinner}
              isFinal={isFinal}
            />
            <TeamRow
              team={game.home}
              possession={homeHasPossession}
              isScheduled={isScheduled}
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
          {isLive || isScheduled ? odds : <GameSummary venue={game.venue} />}
          <IconButton
            className={clsx("icon-button", "favorite", favorite && "selected")}
            onClick={() => toggleFavorite(game.id)}
            title={copy.gameCard.pin(favorite)}
            aria-label={favoriteLabel}
            aria-pressed={favorite}
          >
            {favoriteIcon}
          </IconButton>
        </Stack>
      </Stack>
      <GameDetails game={game} liveDetails={liveDetails} />
    </Paper>
  );
};
