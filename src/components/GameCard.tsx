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

import type { Game } from "../data/types";
import { PolymarketGameProvider } from "../providers/PolymarketGameProvider";
import { compactBoxScoreSx } from "../styles/boxScore";
import { gameTime, kickoff } from "../utils/gameTime";
import { GameDetails } from "./GameDetails";
import { GameOdds } from "./GameOdds";
import { TeamRow } from "./TeamRow";

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
  const isInRedZone = game.redZone && isLive;
  const favoriteLabel = `${favorite ? "Unfavorite" : "Favorite"} ${game.away.name} at ${game.home.name}`;

  const favoriteIcon = favorite ? (
    <Star size={16} fill="currentColor" />
  ) : (
    <StarOff size={16} fill="currentColor" />
  );
  const time = isScheduled ? kickoff(game.start) : gameTime(game);

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
    const contentLength = Math.max(
      String(label).length,
      game.away.quarters[period]?.length ?? 1,
      game.home.quarters[period]?.length ?? 1,
    );

    return (
      <TableCell
        component="th"
        scope="col"
        className="period-heading"
        align="right"
        sx={(theme) => ({
          width: `calc(${contentLength}ch + ${theme.app.periodColumnPadding} + ${theme.app.periodColumnPadding})`,
        })}
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
            aria-label={`${game.away.name} at ${game.home.name} scores by period`}
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
              <TableRow>
                <TableCell
                  component="th"
                  scope="col"
                  className="card-status-cell"
                >
                  <Typography
                    component="span"
                    className={clsx("game-state", game.state)}
                    color="text.secondary"
                  >
                    {time}
                  </Typography>
                </TableCell>
                {periodHeaders}
                <TableCell
                  component="th"
                  scope="col"
                  className="total-heading"
                  align="right"
                  sx={{ width: 56 }}
                >
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
        <Stack
          direction="row"
          className="card-situation"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            p: 2,
          }}
        >
          <Stack
            className="card-broadcast-info"
            spacing={0.5}
            sx={{ minWidth: 0 }}
          >
            {game.broadcast && (
              <Typography
                component="span"
                className="broadcast"
                color="text.secondary"
                sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
              >
                <Tv size={12} />
                {game.broadcast}
              </Typography>
            )}
            <Typography component="span">{situation}</Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            {(isLive || isScheduled) && <GameOdds />}
            <IconButton
              className={clsx(
                "icon-button",
                "favorite",
                favorite && "selected",
              )}
              onClick={onFavorite}
              title={favorite ? "Unpin game" : "Pin game"}
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
