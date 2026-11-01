import Stack from "@mui/material/Stack";
import { TeamLogo } from "./TeamLogo";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import "./styles/LeagueTable.css";
import type { LeagueTable as LeagueTableData } from "../data/types";
import type { LeagueView } from "../hooks/useLeagueTables";

type LeagueTableProps = { table: LeagueTableData; view: LeagueView };

export const LeagueTable = ({ table, view }: LeagueTableProps) => {
  const ranked = view === "rankings";
  const column = ranked ? "PTS" : "CONF";
  const rows = table.rows.map((row) => {
    const value = ranked ? row.points : row.conferenceRecord;
    return (
      <TableRow key={row.id}>
        <TableCell component="th" scope="row">
          <Stack direction="row" className="league-team">
            {ranked && <span className="league-rank">{row.rank}</span>}
            <TeamLogo
              team={{ ...row, abbreviation: row.abbreviation || row.name }}
            />
            <span>{row.name}</span>
          </Stack>
        </TableCell>
        <TableCell>{value ?? "—"}</TableCell>
        <TableCell>{row.record}</TableCell>
      </TableRow>
    );
  });
  return (
    <TableContainer className="league-table-scroll">
      <Table className="league-table">
        <caption>
          {table.title}
          <span>{table.subtitle}</span>
        </caption>
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col">
              TEAM
            </TableCell>
            <TableCell component="th" scope="col">
              {column}
            </TableCell>
            <TableCell component="th" scope="col">
              OVERALL
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );
};
