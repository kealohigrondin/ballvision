import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

import { PossessionMarker } from "./PossessionMarker";

type GameHeaderScoreProps = {
  id: string;
  score: string;
  /** Dims the score, e.g. for the losing team of a finished game. */
  dimmed?: boolean;
  /** Shows the possession diamond beside the score. */
  possession?: boolean;
  /** Which side of the score the possession diamond sits on. */
  markerSide?: "start" | "end";
  /** Shown under the score, e.g. where the ball is. */
  below?: ReactNode;
};

// A large score with an optional possession diamond beside it and extra
// detail underneath.
export const GameHeaderScore = ({
  id,
  score,
  dimmed = false,
  possession = false,
  markerSide = "end",
  below,
}: GameHeaderScoreProps) => (
  <Stack spacing={0.5} sx={{ alignItems: "center" }}>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        flexDirection: markerSide === "end" ? "row" : "row-reverse",
      }}
    >
      <Typography
        id={id}
        component="span"
        sx={{
          fontSize: { xs: "1.75rem", sm: "2.25rem" },
          lineHeight: 1,
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          color: dimmed ? "text.secondary" : "text.primary",
        }}
      >
        {score}
      </Typography>
      {possession && <PossessionMarker />}
    </Box>
    {below}
  </Stack>
);
