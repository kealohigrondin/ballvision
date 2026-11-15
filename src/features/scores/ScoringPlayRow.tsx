import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { TeamLogo } from "@/shared/components/TeamLogo";
import type { Team } from "@/shared/types";
import { visuallyHidden } from "@/shared/visuallyHidden";

import { scoringPlayGridSx } from "./scoringPlayGrid";

type ScoringPlayRowProps = {
  id: string;
  /** The team that scored. */
  team: Team;
  /** Short scoring type, e.g. "TD". */
  type: string;
  clock: string;
  text: string;
  awayScore: number;
  homeScore: number;
  /** Which score column belongs to the scoring team; it is shown in bold. */
  scorer: "away" | "home";
  /** The score read aloud in place of the two columns. */
  scoreLabel: string;
};

// One score in a game: the scoring team's logo, the type and clock above the
// play's description, and the away and home scores after it.
export const ScoringPlayRow = ({
  id,
  team,
  type,
  clock,
  text,
  awayScore,
  homeScore,
  scorer,
  scoreLabel,
}: ScoringPlayRowProps) => {
  const score = (value: number, side: "away" | "home") => (
    <Typography
      aria-hidden
      variant="body2"
      sx={{
        textAlign: "right",
        fontVariantNumeric: "tabular-nums",
        fontWeight: side === scorer ? 700 : 400,
        color: side === scorer ? "text.primary" : "text.secondary",
      }}
    >
      {value}
    </Typography>
  );

  return (
    <Box component="li" id={id} sx={scoringPlayGridSx}>
      <TeamLogo team={team} size={24} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" component="p">
          <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
            {type}
          </Box>{" "}
          · {clock}
        </Typography>
        <Typography variant="body2">{text}</Typography>
      </Box>
      {score(awayScore, "away")}
      {score(homeScore, "home")}
      <Box component="span" sx={visuallyHidden}>
        {scoreLabel}
      </Box>
    </Box>
  );
};
