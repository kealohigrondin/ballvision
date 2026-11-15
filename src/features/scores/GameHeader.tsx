import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";

import { gameTime, kickoff } from "@/shared/gameTime";
import type { Game, Team } from "@/shared/types";

import { FieldPosition } from "./FieldPosition";
import { fieldLabel, fieldPercent } from "./fieldPosition";
import { GameHeaderScore } from "./GameHeaderScore";
import { GameHeaderTeam } from "./GameHeaderTeam";
import { PeriodScores } from "./PeriodScores";

type GameHeaderProps = { game: Game };

// A scoreboard header for one game, banded in the two team colors:
// both teams with their scores, the game clock and down and distance, where
// the ball is, the score by period and the broadcast network. Wraps the period
// table onto its own row in narrow windows.
export const GameHeader = ({ game }: GameHeaderProps) => {
  const started = game.state !== "upcoming";
  const isFinal = game.state === "final";
  const status = started ? gameTime(game) : kickoff(game.start);

  const leader = useMemo(() => {
    const away = Number(game.away.score);
    const home = Number(game.home.score);
    if (!isFinal || away === home) {
      return "";
    }

    return away > home ? game.away.id : game.home.id;
  }, [isFinal, game.away, game.home]);

  const isLive = game.state === "live";

  const showsBall = (team: Team) =>
    isLive && game.possession === team.id && game.yardLine !== undefined;

  const score = (team: Team, area: "awayScore" | "homeScore") => (
    <Box sx={{ gridArea: area, alignSelf: "start", pt: { xs: 2, sm: 3 } }}>
      <GameHeaderScore
        id={`game-header-score-${game.id}-${team.id}`}
        score={started ? team.score : ""}
        dimmed={Boolean(leader) && leader !== team.id}
        possession={isLive && game.possession === team.id}
        markerSide={area === "awayScore" ? "end" : "start"}
        below={
          showsBall(team) && (
            <FieldPosition
              id={`game-header-field-${game.id}`}
              percent={fieldPercent(game.yardLine ?? 50)}
              label={fieldLabel(game.yardLine ?? 50, game.away, game.home)}
            />
          )
        }
      />
    </Box>
  );

  return (
    <Box
      id={`game-header-${game.id}`}
      sx={{
        // Three bands: the away team's color, the dialog's own surface behind
        // the clock and box score, and the home team's color. The team
        // colors are translucent so text stays readable in both themes.
        background: `linear-gradient(90deg, ${alpha(game.away.color, 0.6)} 0%, transparent 35%, transparent 65%, ${alpha(game.home.color, 0.6)} 100%)`,
        px: 2,
        pt: 7,
        pb: 2,
        // Square corners: the dialog clips the top, and the bottom meets the
        // body. The divider sits on the header so it never runs past a curve.
        borderRadius: 0,
        borderBottom: 1,
        borderColor: "divider",
        display: "grid",
        alignItems: "center",
        columnGap: { xs: 1, sm: 2 },
        rowGap: 1,
        gridTemplateColumns: "minmax(0, 1fr) auto auto auto minmax(0, 1fr)",
        gridTemplateAreas: {
          xs: `"away awayScore status homeScore home"
               "box box box box box"
               "network network network network network"`,
          sm: `"away awayScore status homeScore home"
               "away awayScore box homeScore home"
               "away awayScore network homeScore home"`,
        },
      }}
    >
      <Box sx={{ gridArea: "away" }}>
        <GameHeaderTeam team={game.away} id={`game-header-away-${game.id}`} />
      </Box>
      {score(game.away, "awayScore")}
      <Stack
        spacing={0.25}
        sx={{
          gridArea: "status",
          alignItems: "center",
          alignSelf: { sm: "end" },
        }}
      >
        <Typography
          id={`game-header-status-${game.id}`}
          component="span"
          sx={{ fontWeight: 600, textAlign: "center", whiteSpace: "nowrap" }}
        >
          {status}
        </Typography>
        {isLive && game.downDistance && (
          <Typography
            id={`game-header-situation-${game.id}`}
            component="span"
            variant="caption"
            sx={{ textAlign: "center" }}
          >
            {game.downDistance}
          </Typography>
        )}
      </Stack>
      {score(game.home, "homeScore")}
      <Box sx={{ gridArea: "home" }}>
        <GameHeaderTeam team={game.home} id={`game-header-home-${game.id}`} />
      </Box>
      <Box
        sx={{
          gridArea: "box",
          justifySelf: "center",
          width: "100%",
          maxWidth: 240,
        }}
      >
        <PeriodScores home={game.home} away={game.away} />
      </Box>
      {game.broadcast && (
        <Chip
          label={game.broadcast}
          size="small"
          variant="outlined"
          sx={{ gridArea: "network", justifySelf: "center" }}
        />
      )}
    </Box>
  );
};
