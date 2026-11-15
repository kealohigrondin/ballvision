import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

type MatchupLegendSkeletonProps = Record<string, never>;

// The shape of a matchup legend while it loads: a logo, swatch and
// abbreviation at each end.
export const MatchupLegendSkeleton = ({}: MatchupLegendSkeletonProps) => {
  const side = (direction: "row" | "row-reverse") => (
    <Stack direction={direction} spacing={1} sx={{ alignItems: "center" }}>
      <Skeleton variant="circular" width={28} height={28} />
      <Skeleton variant="rounded" width={12} height={12} />
      <Skeleton width={32} />
    </Stack>
  );

  return (
    <Stack
      direction="row"
      sx={{ justifyContent: "space-between", alignItems: "center" }}
    >
      {side("row")}
      {side("row-reverse")}
    </Stack>
  );
};
