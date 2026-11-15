import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { copy } from "@/copy";
import { teamFill } from "@/shared/teamFill";
import type { Team } from "@/shared/types";

import { MatchupLegend } from "./MatchupLegend";
import { StatShareBar } from "./StatShareBar";
import type { TeamStatLine } from "./types";

type TeamStatsProps = {
  gameId: string;
  away: Team;
  home: Team;
  stats: readonly TeamStatLine[];
};

const valueSx = {
  fontWeight: 800,
  fontSize: "1.125rem",
  fontVariantNumeric: "tabular-nums",
} as const;

// Both teams' stats compared line by line: each team's value on its side,
// the stat between them and a bar split by their share.
export const TeamStats = ({ gameId, away, home, stats }: TeamStatsProps) => {
  const rows = stats.map((stat) => {
    const total = stat.awayValue + stat.homeValue;

    return (
      <Stack
        component="li"
        key={stat.key}
        id={`team-stat-${gameId}-${stat.key}`}
        spacing={0.5}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "baseline",
            columnGap: 1,
          }}
        >
          <Typography component="span" sx={valueSx}>
            {stat.away}
          </Typography>
          <Typography
            component="span"
            variant="body2"
            sx={{ fontWeight: 600, textAlign: "center" }}
          >
            {copy.teamStats.labels[stat.key]}
          </Typography>
          <Typography component="span" sx={{ ...valueSx, textAlign: "right" }}>
            {stat.home}
          </Typography>
        </Box>
        <StatShareBar
          share={total > 0 ? stat.awayValue / total : undefined}
          leftFill={teamFill(away.color, true)}
          rightFill={teamFill(home.color, false)}
        />
      </Stack>
    );
  });

  return (
    <Stack
      component="section"
      id={`team-stats-${gameId}`}
      aria-labelledby={`team-stats-title-${gameId}`}
      spacing={1.5}
    >
      <Typography
        id={`team-stats-title-${gameId}`}
        component="h3"
        sx={{ fontWeight: 600 }}
      >
        {copy.teamStats.title}
      </Typography>
      <MatchupLegend away={away} home={home} />
      <Stack
        component="ul"
        spacing={1.5}
        sx={{ m: 0, p: 0, listStyle: "none" }}
      >
        {rows}
      </Stack>
    </Stack>
  );
};
