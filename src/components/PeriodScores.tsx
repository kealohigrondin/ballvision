import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import "./styles/PeriodScores.css";
import type { Team } from "../data/types";

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
      <TableCell component="th" scope="col" key={i}>
        {label}
      </TableCell>
    );
  });
  const rows = [away, home].map((team) => {
    const scores = periods.map((i) => (
      <TableCell key={i}>{team.quarters[i] ?? "—"}</TableCell>
    ));
    return (
      <TableRow key={team.id}>
        <TableCell component="th" scope="row">
          {team.abbreviation}
        </TableCell>
        {scores}
        <TableCell>{team.score}</TableCell>
      </TableRow>
    );
  });

  return (
    <TableContainer className="table-scroll">
      <Table>
        <caption className="sr-only">Score by period</caption>
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col">
              Team
            </TableCell>
            {headings}
            <TableCell component="th" scope="col">
              T
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );
};
