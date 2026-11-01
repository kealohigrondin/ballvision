import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import "./styles/TeamRow.css";
import type { Team } from "../data/types";
import { TeamLogo } from "./TeamLogo";

type TeamRowProps = {
  team: Team;
  possession: boolean;
  scheduled: boolean;
};
export const TeamRow = ({ team, possession, scheduled }: TeamRowProps) => {
  const rank = team.rank ? (
    <Typography variant="caption" component="span" className="rank">
      {team.rank}
    </Typography>
  ) : null;
  const possessionIndicator = possession ? (
    <Typography
      variant="caption"
      component="span"
      className="possession"
      title="Possession"
      aria-label="Possession"
    >
      ◆
    </Typography>
  ) : null;
  const score = scheduled ? "—" : team.score;
  const record = team.record || team.abbreviation;

  return (
    <Box className="team-row">
      <TeamLogo team={team} />
      <Box className="team-info">
        <Typography variant="body2" component="div" className="team-name">
          {rank}
          {team.name}
          {possessionIndicator}
        </Typography>
        <Typography variant="caption" component="span" className="record">
          {record}
        </Typography>
      </Box>
      <Typography variant="h3" component="span" className="score">
        {score}
      </Typography>
    </Box>
  );
};
