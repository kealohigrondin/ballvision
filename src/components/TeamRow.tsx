import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import "./styles/TeamRow.css";
import type { Team } from "../data/types";
import { TeamLogo } from "./TeamLogo";

type TeamRowProps = {
  team: Team;
  possession: boolean;
  scheduled: boolean;
  periods: readonly number[];
};

export const TeamRow = ({
  team,
  possession,
  scheduled,
  periods,
}: TeamRowProps) => {
  const rank = team.rank && (
    <Typography variant="caption" component="span" className="rank">
      {team.rank}
    </Typography>
  );
  const possessionIndicator = possession && (
    <Typography
      variant="caption"
      component="span"
      className="possession"
      title="Possession"
      aria-label="Possession"
    >
      ◆
    </Typography>
  );
  const score = scheduled ? "—" : team.score;
  const record = team.record || team.abbreviation;
  const periodCells = periods.map((period) => (
    <TableCell className="team-period" key={period}>
      {team.quarters[period] ?? ""}
    </TableCell>
  ));

  return (
    <TableRow className="team-row">
      <TableCell component="th" scope="row" className="team-identity-cell">
        <Stack direction="row" className="team-identity">
          <TeamLogo team={team} />
          <Box className="team-info">
            <Typography variant="body2" component="div" className="team-name">
              {rank}&nbsp;
              {team.name}&nbsp;
              {possessionIndicator}
            </Typography>
            <Typography variant="caption" component="span" className="record">
              {record}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      {periodCells}
      <TableCell className="team-total">
        <Typography variant="h6" component="span" className="score">
          {score}
        </Typography>
      </TableCell>
    </TableRow>
  );
};
