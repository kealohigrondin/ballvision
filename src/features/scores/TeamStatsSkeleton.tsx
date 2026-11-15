import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { copy } from "@/copy";

import { MatchupLegendSkeleton } from "./MatchupLegendSkeleton";

type TeamStatsSkeletonProps = { gameId: string };

// One placeholder row per team stat the section shows.
const ROWS = Object.keys(copy.teamStats.labels);

// The team stats section's shape while its data loads: the heading, the team
// legend and a value line and bar for each stat, at the real section's size.
export const TeamStatsSkeleton = ({ gameId }: TeamStatsSkeletonProps) => {
  const rows = ROWS.map((key) => (
    <Stack component="li" key={key} spacing={0.5}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          columnGap: 1,
        }}
      >
        <Skeleton width={40} sx={{ fontSize: "1.125rem" }} />
        <Skeleton width={72} />
        <Skeleton
          width={40}
          sx={{ fontSize: "1.125rem", justifySelf: "end" }}
        />
      </Box>
      <Skeleton variant="rounded" height={6} />
    </Stack>
  ));

  return (
    <Stack
      id={`team-stats-skeleton-${gameId}`}
      aria-busy
      aria-label={copy.teamStats.loading}
      spacing={1.5}
    >
      <Typography component="h3" sx={{ fontWeight: 600 }}>
        {copy.teamStats.title}
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
