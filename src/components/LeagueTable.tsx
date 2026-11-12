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
import { copy } from "../copy";
import type { LeagueTable as LeagueTableData } from "../data/types";
import { rankTrendColor, teamColumnTableSx } from "../styles/leagueTable";
import { rankTrend } from "../utils/rankTrend";
import { TeamLogo } from "./TeamLogo";
import { TeamScheduleLink } from "./TeamScheduleLink";

type LeagueTableProps = { table: LeagueTableData };

export const LeagueTable = ({ table }: LeagueTableProps) => {
  const {
    league: { view },
  } = useEspnData();
  const ranked = view === "rankings";
  const column = ranked ? "PTS" : "CONF";
  // Polls without voting points (the playoff committee) skip that column.
  const showValueColumn =
    !ranked || table.rows.some((row) => row.points !== undefined);
  const rows = table.rows.map((row) => {
    const value = ranked ? row.points : row.conferenceRecord;
    const trend = rankTrend(row);

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
        {ranked && (
          <TableCell
            align="right"
            id={`league-trend-${row.id}`}
            sx={{ color: rankTrendColor[trend.direction] }}
          >
            {trend.label}
          </TableCell>
        )}
        {showValueColumn && <TableCell align="right">{value ?? "—"}</TableCell>}
        <TableCell align="right">{row.record}</TableCell>
      </TableRow>
    );
  });

  // IDs can't contain spaces, so "AFC East" becomes "afc-east".
  const titleId = table.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <TableContainer
      id={`league-table-scroll-${titleId}`}
      sx={{ overflowX: "auto" }}
    >
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
                id={`league-table-title-${titleId}`}
              >
                {table.title}
              </Typography>
            </TableCell>
            {ranked && (
              <TableCell component="th" scope="col" align="right">
                {copy.league.trend}
              </TableCell>
            )}
            {showValueColumn && (
              <TableCell component="th" scope="col" align="right">
                {column}
              </TableCell>
            )}
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
