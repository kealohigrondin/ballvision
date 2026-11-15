import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TeamLogo } from "@/shared/components/TeamLogo";
import type { Team } from "@/shared/types";

type MatchupLegendProps = { away: Team; home: Team };

// Which side and fill belong to which team: the away team's logo,
// abbreviation and hatched swatch on the left, the home team's mirrored on
// the right.
export const MatchupLegend = ({ away, home }: MatchupLegendProps) => (
  <Stack
    direction="row"
    sx={{ justifyContent: "space-between", alignItems: "center" }}
  >
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <TeamLogo team={away} size={28} />
      <Typography variant="body2" color="text.secondary">
        {away.abbreviation}
      </Typography>
    </Stack>
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Typography variant="body2" color="text.secondary">
        {home.abbreviation}
      </Typography>
      <TeamLogo team={home} size={28} />
    </Stack>
  </Stack>
);
