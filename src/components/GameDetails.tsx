import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

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
    <Box
      component="details"
      className="game-details"
      sx={{
        background: "var(--mui-app-colors-detailsSurface)",
        borderTop: "1px solid var(--mui-app-colors-detailsBorder)",
        "& summary": {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          padding: "11px 19px",
          listStyle: "none",
          cursor: "pointer",
          color: "var(--mui-app-colors-detailsLabel)",
        },
        "& summary::-webkit-details-marker": { display: "none" },
        "&[open] summary svg": { transform: "rotate(180deg)" },
        "& p": {
          padding: "0 19px",
          color: "var(--mui-app-colors-detailsText)",
        },
        "& strong": {
          display: "block",
          color: "var(--mui-palette-text-primary)",
          marginBottom: "6px",
        },
      }}
    >
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
        <Stack
          direction="row"
          className="venue"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "0 19px 16px",
            color: "var(--mui-app-colors-venue)",
          }}
        >
          <MapPin size={13} />
          {game.venue}
        </Stack>
      )}
      {!hasDetails && <p>Additional details are not available yet.</p>}
    </Box>
  );
};
