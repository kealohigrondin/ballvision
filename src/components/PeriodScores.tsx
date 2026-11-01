import { tableCellSx } from "../styles/shared";
import { visuallyHiddenSx } from "../styles/shared";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

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
    <TableContainer
      className="table-scroll"
      sx={{
        overflow: "auto",
        padding: "0 19px 14px",
        "& table": {
          width: "100%",
          borderCollapse: "collapse",
          color: "var(--mui-app-colors-tableText)",
        },
        "& th": {
          padding: "8px 5px",
          ...tableCellSx,
        },
        "& td": {
          padding: "8px 5px",
          ...tableCellSx,
        },
        "& th:first-of-type": { textAlign: "left" },
        "& thead th": { color: "var(--mui-app-colors-tableHeading)" },
      }}
    >
      <Table>
        <Box component="caption" className="sr-only" sx={visuallyHiddenSx}>
          Score by period
        </Box>
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
