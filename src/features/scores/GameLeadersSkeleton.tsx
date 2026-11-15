import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { copy } from "@/copy";

import { AthleteStatRowSkeleton } from "./AthleteStatRowSkeleton";
import { MatchupLegendSkeleton } from "./MatchupLegendSkeleton";

type GameLeadersSkeletonProps = { gameId: string };

// The game leaders section's shape while its data loads: the heading, the
// team legend and three rows of two players, at the real section's size.
export const GameLeadersSkeleton = ({ gameId }: GameLeadersSkeletonProps) => {
  const rows = [0, 1, 2].map((row) => (
    <Box
      component="li"
      key={row}
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 4ch minmax(0, 1fr)",
        columnGap: 1,
        alignItems: "center",
      }}
    >
      {/* Passing lines are the longest and wrap on phones. */}
      <AthleteStatRowSkeleton wrapsOnPhones={row === 0} />
      <Skeleton sx={{ fontSize: "0.75rem" }} />
      <AthleteStatRowSkeleton align="end" wrapsOnPhones={row === 0} />
    </Box>
  ));

  return (
    <Stack
      id={`game-leaders-skeleton-${gameId}`}
      aria-busy
      aria-label={copy.gameLeaders.loading}
      spacing={1.5}
    >
      <Typography component="h3" sx={{ fontWeight: 600 }}>
        {copy.gameLeaders.title}
      </Typography>
      <MatchupLegendSkeleton />
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
