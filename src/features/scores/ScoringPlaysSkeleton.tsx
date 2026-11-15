import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { copy } from "@/copy";

import { scoringPlayGridSx } from "./scoringPlayGrid";

type ScoringPlaysSkeletonProps = { gameId: string };

// The scoring summary's shape while its data loads: the heading, a quarter
// header and a few plays. The real list's length depends on the game.
export const ScoringPlaysSkeleton = ({ gameId }: ScoringPlaysSkeletonProps) => {
  const rows = [0, 1, 2].map((row) => (
    <Box component="li" key={row} sx={scoringPlayGridSx}>
      <Skeleton variant="circular" width={24} height={24} />
      <Box>
        <Typography variant="caption" component="p">
          <Skeleton width={56} />
        </Typography>
        <Typography variant="body2">
          <Skeleton />
        </Typography>
      </Box>
      <Typography variant="body2">
        <Skeleton />
      </Typography>
      <Typography variant="body2">
        <Skeleton />
      </Typography>
    </Box>
  ));

  return (
    <Stack
      id={`scoring-plays-skeleton-${gameId}`}
      aria-busy
      aria-label={copy.scoringPlays.loading}
      spacing={1.5}
    >
      <Typography component="h3" sx={{ fontWeight: 600 }}>
        {copy.scoringPlays.title}
      </Typography>
      <Box>
        <Typography variant="caption" component="p" sx={{ pb: 0.5 }}>
          <Skeleton width={72} />
        </Typography>
        <Stack
          component="ul"
          spacing={1.5}
          sx={{ m: 0, p: 0, listStyle: "none" }}
        >
          {rows}
        </Stack>
      </Box>
    </Stack>
  );
};
