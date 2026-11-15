import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { copy } from "@/copy";

type OddsChartSkeletonProps = Record<string, never>;

// The odds chart's shape while its history loads: the two legend entries
// and the 200px plot, so the dialog doesn't jump when the chart arrives.
export const OddsChartSkeleton = ({}: OddsChartSkeletonProps) => (
  <Stack aria-busy aria-label={copy.oddsHistory.loading} spacing={1}>
    {/* Legend lines in the legend's own typography, so heights match. */}
    <Stack direction="row" spacing={2}>
      <Typography sx={{ width: 84 }}>
        <Skeleton />
      </Typography>
      <Typography sx={{ width: 84 }}>
        <Skeleton />
      </Typography>
    </Stack>
    <Skeleton variant="rounded" height={200} />
  </Stack>
);
