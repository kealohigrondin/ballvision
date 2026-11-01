import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { getGameGridSize } from "../utils/gameGridLayout";

type LoadingGridProps = { compact?: boolean };

export const LoadingGrid = ({ compact = false }: LoadingGridProps) => {
  const size = getGameGridSize(compact);
  const skeletons = [0, 1, 2, 3, 4, 5].map((i) => (
    <Grid key={i} size={size}>
      <Paper
        className="skeleton"
        elevation={0}
        sx={[
          {
            height: "227px",
            padding: "24px",
            border: "1px solid var(--mui-app-colors-cardBorder)",
          },
          { borderRadius: "22px" },
        ]}
      >
        <Stack spacing={2.5} sx={{ alignItems: "center" }}>
          <Skeleton animation={false} width="40%" height={12} />
          <Skeleton
            animation={false}
            variant="rounded"
            width="100%"
            height={60}
          />
          <Skeleton animation={false} width="60%" height={12} />
        </Stack>
      </Paper>
    </Grid>
  ));
  return (
    <Grid
      container
      spacing={1.5}
      className="loading-grid"
      aria-label="Loading scores"
      aria-busy="true"
      sx={{ alignItems: "flex-start" }}
    >
      {skeletons}
    </Grid>
  );
};
