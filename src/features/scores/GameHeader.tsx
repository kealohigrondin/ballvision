import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";

import { gameTime, kickoff } from "@/shared/gameTime";
import type { Game, Team } from "@/shared/types";

import { GameHeaderScore } from "./GameHeaderScore";
import { GameHeaderTeam } from "./GameHeaderTeam";
import { PeriodScores } from "./PeriodScores";

type GameHeaderProps = { game: Game };

// A scoreboard header for one game: both teams with their scores, the game
// clock, the score by period and the broadcast network. Wraps the period
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

  const score = (team: Team, area: "awayScore" | "homeScore") => (
    <Box sx={{ gridArea: area }}>
      <GameHeaderScore
        id={`game-header-score-${game.id}-${team.id}`}
        score={started ? team.score : ""}
        dimmed={Boolean(leader) && leader !== team.id}
        possession={game.state === "live" && game.possession === team.id}
        dotSide={area === "awayScore" ? "end" : "start"}
      />
    </Box>
  );

  return (
    <Box
      id={`game-header-${game.id}`}
      sx={{
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
      <Typography
        id={`game-header-status-${game.id}`}
        component="span"
        sx={{
          gridArea: "status",
          fontWeight: 600,
          textAlign: "center",
          alignSelf: { sm: "end" },
          whiteSpace: "nowrap",
        }}
      >
        {status}
      </Typography>
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
