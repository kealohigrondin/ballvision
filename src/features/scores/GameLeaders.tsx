import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { copy } from "@/copy";
import type { GameLeader } from "@/shared/types";

import { AthleteStatRow } from "./AthleteStatRow";

type GameLeadersProps = {
  gameId: string;
  leaders: readonly GameLeader[];
};

// A game's passing, rushing and receiving leaders with their stats.
export const GameLeaders = ({ gameId, leaders }: GameLeadersProps) => {
  const rows = leaders.map((leader) => (
    <AthleteStatRow
      key={leader.category}
      id={`game-leader-${gameId}-${leader.category}`}
      label={copy.gameLeaders.categories[leader.category]}
      name={leader.name}
      detail={copy.gameLeaders.detail(
        leader.position,
        leader.jersey,
        leader.team,
      )}
      stats={leader.stats}
      photo={leader.headshot}
    />
  ));

  return (
    <Stack
      component="section"
      id={`game-leaders-${gameId}`}
      aria-labelledby={`game-leaders-title-${gameId}`}
      spacing={1}
    >
      <Typography
        id={`game-leaders-title-${gameId}`}
        component="h3"
        sx={{ fontWeight: 600 }}
      >
        {copy.gameLeaders.title}
      </Typography>
      <Stack component="ul" spacing={1} sx={{ m: 0, p: 0, listStyle: "none" }}>
        {rows}
      </Stack>
    </Stack>
  );
};
