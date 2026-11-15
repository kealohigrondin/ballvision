import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { OddsChartSkeleton } from "./OddsChartSkeleton";

type GameOddsSkeletonProps = Record<string, never>;

// The whole odds section's shape while the game's Polymarket quote loads:
// the title, the range buttons and the chart.
export const GameOddsSkeleton = ({}: GameOddsSkeletonProps) => (
  <Stack spacing={1.5}>
    <Stack
      direction="row"
      sx={{ alignItems: "center", justifyContent: "space-between" }}
    >
      <Typography variant="subtitle2" sx={{ width: 180 }}>
        <Skeleton />
      </Typography>
      <Skeleton
        variant="rounded"
        width={120}
        height="var(--mui-app-controlHeight)"
      />
    </Stack>
    <OddsChartSkeleton />
  </Stack>
);
