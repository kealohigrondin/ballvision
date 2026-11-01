import { iconButtonSx } from "../styles/shared";
import { liveDotSx } from "../styles/shared";
import Box from "@mui/material/Box";
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

import { useMemo } from "react";
import { Star, StarOff, Tv } from "lucide-react";
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
      sx={[
        {
          border: "1px solid var(--mui-app-colors-cardBorder)",
          overflow: "hidden",
          boxShadow: "0 4px 18px var(--mui-app-colors-shadow)",
          transition: "border-color 0.2s",
          "&:hover": { borderColor: "var(--mui-app-colors-cardHoverBorder)" },
        },
        {
          borderRadius: "22px",
          background: `linear-gradient(110deg, color-mix(in srgb, ${game.away.color} var(--mui-app-teamColorTint), var(--mui-app-colors-cardShade)), var(--mui-app-colors-cardShade) 50%, color-mix(in srgb, ${game.home.color} var(--mui-app-teamColorTint), var(--mui-app-colors-cardShade)))`,
        },
      ]}
      className={clsx(
        "game-card",
        isLive && "is-live",
        isInRedZone && "red-zone",
      )}
    >
      <TableContainer
        className="card-scoreboard-scroll"
        sx={{ padding: "12px 18px 4px" }}
      >
        <Table
          className="card-scoreboard"
          size="small"
          aria-label={`${game.away.name} at ${game.home.name} scores by period`}
          sx={{
            tableLayout: "fixed",
            minWidth: "0",
            "& .MuiTableCell-root": { borderBottom: "0" },
            "& .card-status-cell": { width: "auto", padding: "0 8px 6px 0" },
            "& .period-heading": {
              width: "26px",
              padding: "0 2px 6px",
              textAlign: "center",
              color: "var(--mui-palette-text-secondary)",
              display: "none",
            },
            "& .total-heading": {
              width: "38px",
              padding: "0 0 6px 4px",
              textAlign: "right",
              color: "var(--mui-palette-text-secondary)",
              visibility: "hidden",
            },
            "& .team-period": { display: "none" },
            "@container game-grid (min-width: 1200px)": {
              "& .period-heading": { display: "table-cell" },
              "& .team-period": { display: "table-cell" },
              "& .total-heading": { visibility: "visible" },
            },
            "& .team-row > .team-identity-cell": {
              padding: "8px 8px 8px 0",
              textAlign: "left",
            },
            "& .team-row > .team-period": {
              textAlign: "center",
              padding: "8px 2px",
              color: "var(--mui-palette-text-secondary)",
              fontVariantNumeric: "tabular-nums",
            },
            "& .team-row > .team-total": {
              textAlign: "right",
              padding: "8px 0 8px 4px",
            },
          }}
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
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--mui-app-colors-gameStatus)",
                    "&.live": { color: "var(--mui-palette-primary-main)" },
                    "&.final": { color: "var(--mui-app-colors-gameFinal)" },
                  }}
                >
                  {isLive && (
                    <Box component="span" className="live-dot" sx={liveDotSx} />
                  )}
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
      <Stack
        direction="row"
        className="card-situation"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          padding: "6px 18px 12px",
          color: "var(--mui-app-colors-situation)",
        }}
      >
        <Stack
          className="card-broadcast-info"
          sx={{ gap: "4px", minWidth: "0" }}
        >
          {game.broadcast && (
            <Typography
              variant="caption"
              component="span"
              className="broadcast"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                color: "var(--mui-app-colors-broadcast)",
              }}
            >
              <Tv size={12} />
              {game.broadcast}
            </Typography>
          )}
          <Typography variant="caption" component="span">
            {isInRedZone && (
              <Typography
                variant="caption"
                component="span"
                className="red-zone-label"
                sx={{ color: "var(--mui-app-colors-redZone)" }}
              >
                RED ZONE ·&nbsp;
              </Typography>
            )}
            {situation}
          </Typography>
        </Stack>
        <Box
          component="button"
          className={clsx("icon-button", "favorite", favorite && "selected")}
          onClick={onFavorite}
          title={favorite ? "Unpin game" : "Pin game"}
          aria-label={favoriteLabel}
          aria-pressed={favorite}
          sx={[
            iconButtonSx,
            {
              width: "32px",
              height: "32px",
              background: "transparent",
              color: "var(--mui-app-colors-favorite)",
              "&[aria-pressed=true]": {
                color: "var(--mui-palette-text-primary)",
              },
            },
          ]}
        >
          {favoriteIcon}
        </Box>
      </Stack>
      <GameDetails game={game} />
    </Paper>
  );
};
