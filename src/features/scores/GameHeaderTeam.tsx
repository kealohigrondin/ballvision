import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { TeamLogo } from "@/shared/components/TeamLogo";
import type { Team } from "@/shared/types";

type GameHeaderTeamProps = {
  team: Team;
  id: string;
};

// One team in a game header: its logo on a soft glow of the team color,
// with its rank, name and record underneath.
export const GameHeaderTeam = ({ team, id }: GameHeaderTeamProps) => (
  <Stack id={id} spacing={0.5} sx={{ alignItems: "center", minWidth: 0 }}>
    <Box
      sx={{
        display: "grid",
        placeItems: "center",
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${alpha(team.color, 0.45)} 0%, ${alpha(team.color, 0)} 70%)`,
      }}
    >
      <TeamLogo team={team} size={44} />
    </Box>
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
