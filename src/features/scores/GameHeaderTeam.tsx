import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TeamLogo } from "@/shared/components/TeamLogo";
import type { Team } from "@/shared/types";

type GameHeaderTeamProps = {
  team: Team;
  id: string;
};

// One team in a game header: its logo with its rank, name and record
// underneath.
export const GameHeaderTeam = ({ team, id }: GameHeaderTeamProps) => (
  <Stack id={id} spacing={0.5} sx={{ alignItems: "center", minWidth: 0 }}>
    <TeamLogo team={team} size={56} />
    <Typography
      component="span"
      sx={{ fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}
    >
      {Boolean(team.rank) && (
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          sx={{ mr: 0.5 }}
        >
          {team.rank}
        </Typography>
      )}
      {team.name}
    </Typography>
    {team.record && (
      <Typography variant="caption" color="text.secondary">
        {team.record}
      </Typography>
    )}
  </Stack>
);
