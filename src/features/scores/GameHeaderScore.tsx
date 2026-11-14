import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { copy } from "@/copy";

type GameHeaderScoreProps = {
  id: string;
  score: string;
  /** Dims the score, e.g. for the losing team of a finished game. */
  dimmed?: boolean;
  /** Shows a dot beside the score for the team with the ball. */
  possession?: boolean;
  /** Which side of the score the possession dot sits on. */
  dotSide?: "start" | "end";
};

// A large score with an optional possession dot beside it.
export const GameHeaderScore = ({
  id,
  score,
  dimmed = false,
  possession = false,
  dotSide = "end",
}: GameHeaderScoreProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      flexDirection: dotSide === "end" ? "row" : "row-reverse",
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
    {possession && (
      <Box
        component="span"
        role="img"
        aria-label={copy.gameCard.possession}
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: "text.primary",
        }}
      />
    )}
  </Box>
);
