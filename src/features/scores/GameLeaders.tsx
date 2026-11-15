import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { copy } from "@/copy";
import type { Team } from "@/shared/types";

import { AthleteStatRow } from "./AthleteStatRow";
import { MatchupLegend } from "./MatchupLegend";
import type { GameLeader, LeaderCategory } from "./types";

type GameLeadersProps = {
  gameId: string;
  away: Team;
  home: Team;
  leaders: { away: GameLeader[]; home: GameLeader[] };
};

const categories: readonly LeaderCategory[] = [
  "passing",
  "rushing",
  "receiving",
];

// Each team's passing, rushing and receiving leaders side by side: the away
// team's on the left, the home team's mirrored on the right, with the
// category between them.
export const GameLeaders = ({
  gameId,
  away,
  home,
  leaders,
}: GameLeadersProps) => {
  const player = (leader: GameLeader | undefined, side: "away" | "home") =>
    leader ? (
      <AthleteStatRow
        id={`game-leader-${gameId}-${side}-${leader.category}`}
        name={leader.name}
        detail={copy.gameLeaders.detail(leader.position, leader.jersey, "")}
        stats={leader.stats}
        photo={leader.headshot}
        align={side === "away" ? "start" : "end"}
      />
    ) : (
      <Box />
    );

  const rows = categories
    .map((category) => ({
      category,
      away: leaders.away.find((leader) => leader.category === category),
      home: leaders.home.find((leader) => leader.category === category),
    }))
    .filter((row) => row.away || row.home)
    .map((row) => (
      <Box
        component="li"
        key={row.category}
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
          columnGap: 1,
          alignItems: "center",
        }}
      >
        {player(row.away, "away")}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "center", width: "4ch" }}
        >
          {copy.gameLeaders.categories[row.category]}
        </Typography>
        {player(row.home, "home")}
      </Box>
    ));

  return (
    <Stack
      component="section"
      id={`game-leaders-${gameId}`}
      aria-labelledby={`game-leaders-title-${gameId}`}
      spacing={1.5}
    >
      <Typography
        id={`game-leaders-title-${gameId}`}
        component="h3"
        sx={{ fontWeight: 600 }}
      >
        {copy.gameLeaders.title}
      </Typography>
      <MatchupLegend away={away} home={home} />
      <Stack
        component="ul"
        spacing={1.5}
        sx={{ m: 0, p: 0, listStyle: "none" }}
      >
        {rows}
      </Stack>
    </Stack>
  );
};
