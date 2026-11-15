import Typography from "@mui/material/Typography";

import { copy } from "@/copy";

type PossessionMarkerProps = { className?: string };

// The diamond that marks the team with the ball.
export const PossessionMarker = ({
  className = "possession",
}: PossessionMarkerProps) => (
  <Typography
    component="span"
    className={className}
    title={copy.gameCard.possession}
    aria-label={copy.gameCard.possession}
    role="img"
    sx={{ color: "primary.main" }}
  >
    ◆
  </Typography>
);
