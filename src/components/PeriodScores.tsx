import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import type { Team } from "../data/types";
import { compactBoxScoreSx } from "../styles/boxScore";

type PeriodScoresProps = { home: Team; away: Team };

export const PeriodScores = ({ home, away }: PeriodScoresProps) => {
  const periods = Array.from(
    { length: Math.max(home.quarters.length, away.quarters.length) },
    (_, i) => i,
  );
  if (!periods.length) return null;

  const headings = periods.map((i) => {
    const label = i < 4 ? i + 1 : `${i - 3}OT`;
    return (
      <TableCell component="th" scope="col" key={i} align="right">
        {label}
      </TableCell>
    );
  });
  const rows = [away, home].map((team) => {
    const scores = periods.map((i) => (
      <TableCell key={i} align="right">
        {team.quarters[i] ?? "—"}
      </TableCell>
    ));
    return (
      <TableRow key={team.id}>
        <TableCell component="th" scope="row">
          {team.abbreviation}
        </TableCell>
        {scores}
        <TableCell align="right">{team.score}</TableCell>
      </TableRow>
    );
  });

  return (
    <TableContainer>
      <Table aria-label="Score by period" size="small" sx={compactBoxScoreSx}>
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col" align="right">
              Team
            </TableCell>
            {headings}
            <TableCell component="th" scope="col" align="right">
              T
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );
};
