import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import clsx from "clsx";

import { useEspnData } from "../context/espnDataContext";
import type { LeagueTable as LeagueTableData } from "../data/types";
import { teamColumnTableSx } from "../styles/leagueTable";
import { TeamLogo } from "./TeamLogo";
import { TeamScheduleLink } from "./TeamScheduleLink";

type LeagueTableProps = { table: LeagueTableData };

export const LeagueTable = ({ table }: LeagueTableProps) => {
  const {
    league: { view },
  } = useEspnData();
  const ranked = view === "rankings";
  const column = ranked ? "PTS" : "CONF";
  const rows = table.rows.map((row) => {
    const value = ranked ? row.points : row.conferenceRecord;

    return (
      <TableRow
        key={row.id}
        className={clsx(
          row.dividerAfter && "league-row-divider",
          row.dividerAfter === "dashed" && "league-row-divider-dashed",
        )}
      >
        <TableCell component="th" scope="row">
          <Stack
            direction="row"
            className="league-team"
            spacing={1}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            {row.rank !== undefined && (
              <Box component="span" className="league-rank">
                {row.rank}
              </Box>
            )}
            <TeamLogo
              team={{ ...row, abbreviation: row.abbreviation || row.name }}
              size={24}
            />
            <TeamScheduleLink team={row} />
          </Stack>
        </TableCell>
        <TableCell align="right">{value ?? "—"}</TableCell>
        <TableCell align="right">{row.record}</TableCell>
      </TableRow>
    );
  });

  return (
    <TableContainer id="league-table-scroll" sx={{ overflowX: "auto" }}>
      <Table
        size="small"
        aria-label={`league-table-${table.title}`}
        sx={teamColumnTableSx(1)}
      >
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col">
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold" }}
                id="league-table-title"
              >
                {table.title}
              </Typography>
            </TableCell>
            <TableCell component="th" scope="col" align="right">
              {column}
            </TableCell>
            <TableCell component="th" scope="col" align="right">
              OVR
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );
};
