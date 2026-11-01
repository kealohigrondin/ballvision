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
  const rank = team.rank ? <span className="rank">{team.rank}</span> : null;
  const possessionIndicator = possession ? (
    <span className="possession" title="Possession" aria-label="Possession">
      ◆
    </span>
  ) : null;
  const score = scheduled ? "—" : team.score;
  const record = team.record || team.abbreviation;

  return (
    <Box className="team-row">
      <TeamLogo team={team} />
      <Box className="team-info">
        <Box className="team-name">
          {rank}
          {team.name}
          {possessionIndicator}
        </Box>
        <span className="record">{record}</span>
      </Box>
      <span className="score">{score}</span>
    </Box>
  );
};
